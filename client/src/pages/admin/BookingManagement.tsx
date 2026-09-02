import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Booking, Service, Chair, BookingStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { NoShowModal } from '../../components/NoShowModal';
import { 
  Calendar, 
  Clock, 
  Armchair, 
  Scissors, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  X,
  Sparkles
} from 'lucide-react';

export const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedChair, setSelectedChair] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // No-Show Modal State
  const [noShowBooking, setNoShowBooking] = useState<Booking | null>(null);
  const [noShowLoading, setNoShowLoading] = useState(false);

  // Walk-in / Direct Booking Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [newBooking, setNewBooking] = useState({
    customer_id: '',
    service_id: '',
    chair_id: '',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    notes: 'Direct salon booking'
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedChair !== 'all') params.append('chair_id', selectedChair);
      if (searchQuery) params.append('search', searchQuery);

      const res = await api.get(`/bookings?${params.toString()}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus, selectedChair, searchQuery]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Fetch services and customers for direct booking modal
  useEffect(() => {
    const fetchModalData = async () => {
      try {
        const [srvRes, custRes] = await Promise.all([
          api.get('/services?all=true'),
          api.get('/customers?status=approved')
        ]);
        setServices(srvRes.data.services || []);
        setCustomers(custRes.data.customers || []);
      } catch (err) {
        console.error('Failed to load modal support data:', err);
      }
    };
    fetchModalData();
  }, []);

  const handleStatusChange = async (booking: Booking, newStatus: BookingStatus) => {
    if (newStatus === 'no_show') {
      setNoShowBooking(booking);
      return;
    }

    try {
      await api.put(`/bookings/${booking.id}/status`, { status: newStatus });
      setMessage({ type: 'success', text: `Booking #${booking.id} updated to ${newStatus.replace('_', ' ').toUpperCase()}` });
      fetchBookings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update booking status.' });
    }
  };

  const handleConfirmNoShow = async (action: 'release' | 'keep_blocked') => {
    if (!noShowBooking) return;
    setNoShowLoading(true);

    try {
      await api.post(`/bookings/${noShowBooking.id}/no-show-action`, { action });
      setMessage({
        type: 'success',
        text: `Booking #${noShowBooking.id} marked as No-Show. Chair ${noShowBooking.chair_number} ${action === 'release' ? 'released' : 'kept blocked'}.`
      });
      setNoShowBooking(null);
      fetchBookings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to process no-show.' });
    } finally {
      setNoShowLoading(false);
    }
  };

  const handleCreateDirectBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.customer_id || !newBooking.service_id || !newBooking.booking_date || !newBooking.start_time) {
      setMessage({ type: 'error', text: 'Please fill in all required booking fields.' });
      return;
    }

    setCreateLoading(true);
    try {
      await api.post('/bookings', {
        customer_id: parseInt(newBooking.customer_id, 10),
        service_id: parseInt(newBooking.service_id, 10),
        chair_id: newBooking.chair_id ? parseInt(newBooking.chair_id, 10) : undefined,
        booking_date: newBooking.booking_date,
        start_time: newBooking.start_time,
        notes: newBooking.notes
      });

      setMessage({ type: 'success', text: 'Direct appointment created successfully!' });
      setShowCreateModal(false);
      fetchBookings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create booking. Time/Chair collision.' });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Salon Appointments Master
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time schedule coordinator across the 4 physical styling bays with duration collision controls.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-xl gold-btn font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Direct Appointment</span>
        </button>
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

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl text-xs">
        {/* Date Filter */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium">Filter by Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium">Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="customer_arrived">Customer Arrived</option>
            <option value="in_service">In Service</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-Show</option>
          </select>
        </div>

        {/* Chair Filter */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium">Filter by Chair</label>
          <select
            value={selectedChair}
            onChange={(e) => setSelectedChair(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">All 4 Chairs</option>
            <option value="1">Chair 1 - Master Bay</option>
            <option value="2">Chair 2 - Cut Station</option>
            <option value="3">Chair 3 - Color Bar</option>
            <option value="4">Chair 4 - VIP Lounge</option>
          </select>
        </div>

        {/* Search */}
        <div className="space-y-1">
          <label className="text-slate-400 font-medium">Search Keyword</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Client, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-xs text-slate-400">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-300">No Appointments Match Criteria</p>
            <p>Try changing the selected date or clearing filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Ref & Client</th>
                  <th className="py-4 px-4 font-semibold">Date & Time Window</th>
                  <th className="py-4 px-4 font-semibold">Assigned Station</th>
                  <th className="py-4 px-4 font-semibold">Service Details</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Update Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-bold flex items-center justify-center font-mono text-xs">
                          #{b.id}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{b.customer_name}</p>
                          <p className="text-[11px] text-slate-400">{b.customer_phone || b.customer_email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200">{b.booking_date}</div>
                      <div className="font-mono text-[11px] text-amber-300">{b.start_time} - {b.end_time}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-200 block">Chair {b.chair_number}</span>
                      <span className="text-[10px] text-slate-400">{b.chair_name}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-100 truncate max-w-[160px]">{b.service_name}</div>
                      <div className="font-mono font-bold text-amber-400">₹{b.total_price.toLocaleString('en-IN')}</div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={b.status} size="sm" />
                      {b.no_show_resolution && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Resolution: {b.no_show_resolution === 'released' ? 'Chair Released' : 'Chair Blocked'}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b, e.target.value as BookingStatus)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="customer_arrived">Customer Arrived</option>
                        <option value="in_service">In Service</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">Mark No-Show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct / Walk-In Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#141C2E] border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Create Direct / Walk-In Appointment</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectBooking} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Select Approved Client *</label>
                <select
                  required
                  value={newBooking.customer_id}
                  onChange={(e) => setNewBooking({ ...newBooking, customer_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Select Service *</label>
                <select
                  required
                  value={newBooking.service_id}
                  onChange={(e) => setNewBooking({ ...newBooking, service_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Service --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (₹{s.price.toLocaleString('en-IN')} - {s.duration_minutes} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Date *</label>
                  <input
                    type="date"
                    required
                    value={newBooking.booking_date}
                    onChange={(e) => setNewBooking({ ...newBooking, booking_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={newBooking.start_time}
                    onChange={(e) => setNewBooking({ ...newBooking, start_time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Specific Chair Station (Optional - Auto-allocated if blank)</label>
                <select
                  value={newBooking.chair_id}
                  onChange={(e) => setNewBooking({ ...newBooking, chair_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Auto-Assign Best Available Station</option>
                  <option value="1">Chair 1 - Master Bay</option>
                  <option value="2">Chair 2 - Cut Station</option>
                  <option value="3">Chair 3 - Color Bar</option>
                  <option value="4">Chair 4 - VIP Lounge</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Staff Booking Notes</label>
                <textarea
                  rows={2}
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 rounded-xl gold-btn font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {createLoading ? 'Booking Station...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No-Show Modal */}
      <NoShowModal
        booking={noShowBooking}
        isOpen={noShowBooking !== null}
        onClose={() => setNoShowBooking(null)}
        onConfirm={handleConfirmNoShow}
        loading={noShowLoading}
      />

    </div>
  );
};
