import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { ApprovalStatus, Booking } from '../../types';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Clock, 
  History, 
  CheckCircle2, 
  AlertCircle,
  X,
  Phone,
  Mail
} from 'lucide-react';

interface CustomerItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  approval_status: ApprovalStatus;
  created_at: string;
  total_bookings: number;
  completed_bookings: number;
  no_show_bookings: number;
}

export const CustomerManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Customer Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [customerHistory, setCustomerHistory] = useState<Booking[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?status=${selectedStatus}&search=${searchQuery}`);
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleUpdateStatus = async (customerId: number, newStatus: ApprovalStatus) => {
    let reason = '';
    if (newStatus === 'rejected' || newStatus === 'suspended') {
      reason = prompt(`Enter reason for ${newStatus} status (optional):`) || '';
    }

    setActionLoading(customerId);
    setMessage(null);

    try {
      const res = await api.put(`/customers/${customerId}/status`, {
        approval_status: newStatus,
        reason
      });

      setMessage({ type: 'success', text: res.data.message });
      fetchCustomers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update customer status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewHistory = async (cust: CustomerItem) => {
    setSelectedCustomer(cust);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/customers/${cust.id}`);
      setCustomerHistory(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          Customer Accounts & Approvals
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review new client registrations, verify credentials, grant booking privileges, or manage suspensions.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setSearchParams({ status: st });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st === 'pending' ? 'Pending Review' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-xs text-slate-400">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-300">No Customers Found</p>
            <p>Try clearing your status filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Client Name</th>
                  <th className="py-4 px-4 font-semibold">Contact Details</th>
                  <th className="py-4 px-4 font-semibold">Approval Status</th>
                  <th className="py-4 px-4 font-semibold text-center">Bookings Stats</th>
                  <th className="py-4 px-4 font-semibold">Registration Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-700/20 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 text-sm">{c.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">ID #{c.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={c.approval_status} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleViewHistory(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        <History className="w-3 h-3 text-amber-400" />
                        <span>{c.total_bookings} Total ({c.completed_bookings} done)</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.approval_status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'approved')}
                            disabled={actionLoading === c.id}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title="Approve Customer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {c.approval_status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'rejected')}
                            disabled={actionLoading === c.id}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title="Reject Registration"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        {c.approval_status !== 'suspended' && c.approval_status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'suspended')}
                            disabled={actionLoading === c.id}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-300 text-[11px] transition-colors"
                            title="Suspend Booking Privileges"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Booking History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#141C2E] border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-serif text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-100">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Salon Booking History ({customerHistory.length} Appointments)
              </h4>

              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading booking records...</div>
              ) : customerHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No appointments recorded yet.</div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80 space-y-1">
                  {customerHistory.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{b.service_name}</p>
                        <p className="text-slate-400 text-[11px]">
                          {b.booking_date} @ {b.start_time} - {b.end_time} • Chair {b.chair_number}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={b.status} size="sm" />
                        <span className="font-mono font-bold text-slate-200">₹{b.total_price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
