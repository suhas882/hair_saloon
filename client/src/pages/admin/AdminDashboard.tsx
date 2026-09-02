import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Chair, Booking, SalonNotification, AdminDashboardStats, BookingStatus } from '../../types';
import { ChairVisualCard } from '../../components/ChairVisualCard';
import { StatusBadge } from '../../components/StatusBadge';
import { NoShowModal } from '../../components/NoShowModal';
import { 
  Armchair, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  UserX, 
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldCheck,
  Scissors
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_chairs: 4,
    available_chairs: 0,
    booked_chairs: 0,
    occupied_chairs: 0,
    blocked_chairs: 0,
    today_appointments: 0,
    today_revenue: 0,
    pending_approvals: 0,
    no_shows: 0,
  });

  const [chairs, setChairs] = useState<Chair[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Booking[]>([]);
  const [pendingCustomers, setPendingCustomers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<SalonNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // No-show modal state
  const [noShowBooking, setNoShowBooking] = useState<Booking | null>(null);
  const [noShowLoading, setNoShowLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data.stats);
      setChairs(res.data.chair_cards || []);
      setTodaySchedule(res.data.today_schedule || []);
      setPendingCustomers(res.data.pending_customers || []);
      setNotifications(res.data.recent_notifications || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 10 seconds for real-time station monitoring
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Chair Block/Unblock actions
  const handleBlockChair = async (chairId: number) => {
    const reason = prompt('Enter reason for blocking chair (e.g. sanitation, repair):', 'Maintenance & Deep Sanitation');
    if (!reason) return;
    try {
      await api.post(`/chairs/${chairId}/block`, { reason });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to block chair:', err);
    }
  };

  const handleUnblockChair = async (chairId: number) => {
    try {
      await api.post(`/chairs/${chairId}/unblock`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to unblock chair:', err);
    }
  };

  // Booking status transition
  const handleBookingStatusChange = async (bookingId: number, status: BookingStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  // Open No-Show modal
  const handleOpenNoShowModal = (chair: Chair) => {
    if (chair.current_booking) {
      setNoShowBooking({
        id: chair.current_booking.booking_id,
        customer_id: chair.current_booking.customer_id || 0,
        service_id: chair.current_booking.service_id || 0,
        chair_id: chair.id,
        chair_number: chair.chair_number,
        booking_date: chair.current_booking.booking_date,
        start_time: chair.current_booking.start_time,
        end_time: chair.current_booking.end_time,
        status: 'no_show',
        total_price: chair.current_booking.price || 0,
        created_at: '',
        customer_name: chair.current_booking.customer_name,
        service_name: chair.current_booking.service_name
      });
    }
  };

  const handleConfirmNoShow = async (action: 'release' | 'keep_blocked') => {
    if (!noShowBooking) return;
    setNoShowLoading(true);
    try {
      await api.post(`/bookings/${noShowBooking.id}/no-show-action`, { action });
      setNoShowBooking(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to process no-show:', err);
    } finally {
      setNoShowLoading(false);
    }
  };

  // Quick Customer Approval
  const handleCustomerApproval = async (customerId: number, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/customers/${customerId}/status`, { approval_status: status });
      fetchDashboardData();
    } catch (err) {
      console.error('Customer approval update error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Salon Command Center
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live 4-Chair Grid</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time station occupancy, customer queue gating, and schedule execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/bookings"
            className="px-5 py-2.5 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30"
          >
            <Calendar className="w-4 h-4" />
            <span>Manage All Bookings</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Chairs Metric */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Station Status</span>
            <Armchair className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-slate-100">{stats.available_chairs}</span>
            <span className="text-xs text-slate-400 font-medium">/ 4 Available</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">{stats.available_chairs} Free</span>
            <span>•</span>
            <span className="text-purple-400 font-bold">{stats.occupied_chairs} In-Service</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{stats.booked_chairs} Booked</span>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Agenda</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-slate-100">{stats.today_appointments}</span>
            <span className="text-xs text-slate-400 font-medium">Appointments</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold font-mono">
            <span>₹{stats.today_revenue.toLocaleString('en-IN')} Estimated Gross</span>
          </div>
        </div>

        {/* Pending Customer Approvals */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Users className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-amber-300">{stats.pending_approvals}</span>
            <span className="text-xs text-slate-400 font-medium">Awaiting Review</span>
          </div>
          <Link
            to="/admin/customers?status=pending"
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>Review customer queue</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* No-Shows & Blocked */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Station Exceptions</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-rose-400">{stats.no_shows}</span>
            <span className="text-xs text-slate-400 font-medium">No-Shows Recorded</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.blocked_chairs} Chair{stats.blocked_chairs !== 1 ? 's' : ''} currently blocked
          </p>
        </div>

      </div>

      {/* 3. VISUAL 4-CHAIR LIVE INTERACTIVE BOARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-amber-400" />
            <span>4 Salon Physical Chairs (Live Allocation)</span>
          </h2>
          <Link
            to="/admin/chairs"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Manage Stations & Settings →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chairs.map((chair) => (
            <ChairVisualCard
              key={chair.id}
              chair={chair}
              isAdmin={true}
              onBlock={handleBlockChair}
              onUnblock={handleUnblockChair}
              onBookingStatusChange={handleBookingStatusChange}
              onOpenNoShowModal={handleOpenNoShowModal}
            />
          ))}
        </div>
      </div>

      {/* 4. TODAY'S SCHEDULE TIMELINE & QUICK APPROVALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Schedule Table (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Today's Appointment Queue</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
              <p>No appointments booked for today yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Time & Station</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {todaySchedule.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono">
                        <div className="font-bold text-slate-200">{b.start_time} - {b.end_time}</div>
                        <div className="text-[11px] text-amber-400 font-semibold">Chair {b.chair_number}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-slate-100">{b.customer_name}</div>
                        <div className="text-slate-500 text-[11px]">{b.customer_phone || 'No phone'}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-slate-200 font-medium truncate max-w-[150px]">{b.service_name}</div>
                        <div className="text-slate-400 font-mono">₹{b.total_price.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleBookingStatusChange(b.id, 'customer_arrived')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] transition-colors"
                            >
                              Check-In
                            </button>
                          )}
                          {b.status === 'customer_arrived' && (
                            <button
                              onClick={() => handleBookingStatusChange(b.id, 'in_service')}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-[11px] transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {b.status === 'in_service' && (
                            <button
                              onClick={() => handleBookingStatusChange(b.id, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {(b.status === 'confirmed' || b.status === 'customer_arrived') && (
                            <button
                              onClick={() => {
                                setNoShowBooking(b);
                              }}
                              className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 text-[11px] transition-colors"
                            >
                              No-Show
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

        {/* Quick Approvals Queue & Notifications (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Pending Customers Queue */}
          <div className="p-6 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif text-base font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Pending Approvals</span>
              </h3>
              <Link to="/admin/customers" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                Manage All
              </Link>
            </div>

            {pendingCustomers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/40 mx-auto mb-1" />
                <p>No customers awaiting approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCustomers.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.phone || 'No phone'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleCustomerApproval(c.id, 'approved')}
                        className="w-full py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleCustomerApproval(c.id, 'rejected')}
                        className="w-full py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Salon Notifications Feed */}
          <div className="p-6 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif text-base font-bold text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Recent System Alerts</span>
              </h3>
              <Link to="/admin/notifications" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                History
              </Link>
            </div>

            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No recent alerts.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* No Show Modal */}
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
