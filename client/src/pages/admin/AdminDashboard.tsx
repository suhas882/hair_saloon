import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  UserX, 
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldCheck,
  Scissors,
  Plus,
  Lock,
  Unlock,
  Building2,
  Sliders
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_chairs: 4,
    available_chairs: 4,
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Block modal state
  const [blockModalChair, setBlockModalChair] = useState<Chair | null>(null);
  const [blockDuration, setBlockDuration] = useState<string>('30');
  const [blockReason, setBlockReason] = useState<string>('Sanitation & Station Reset');

  // No-show modal state
  const [noShowBooking, setNoShowBooking] = useState<Booking | null>(null);
  const [noShowLoading, setNoShowLoading] = useState(false);

  // Silent background fetch to prevent flickering
  const fetchDashboardData = useCallback(async (isSilent = true) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data) {
        setStats(res.data.stats || stats);
        setChairs(res.data.chair_cards || []);
        setTodaySchedule(res.data.today_schedule || []);
        setPendingCustomers(res.data.pending_customers || []);
        setNotifications(res.data.recent_notifications || []);
      }
    } catch (err) {
      console.error('Failed to load saloon dashboard:', err);
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
    // Auto refresh every 8 seconds silently (no screen flash)
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Chair Block modal opener
  const handleOpenBlockModal = (chairId: number) => {
    const chair = chairs.find(c => c.id === chairId);
    if (chair) {
      setBlockModalChair(chair);
      setBlockDuration('30');
      setBlockReason('Sanitation & Station Reset');
    }
  };

  const handleConfirmBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockModalChair) return;
    try {
      await api.post(`/chairs/${blockModalChair.id}/block`, {
        reason: blockReason,
        duration_minutes: parseInt(blockDuration, 10)
      });
      setBlockModalChair(null);
      fetchDashboardData(true);
    } catch (err) {
      console.error('Failed to block chair:', err);
    }
  };

  const handleUnblockChair = async (chairId: number) => {
    try {
      await api.post(`/chairs/${chairId}/unblock`);
      fetchDashboardData(true);
    } catch (err) {
      console.error('Failed to unblock chair:', err);
    }
  };

  // Booking status transition (Confirm Arrival, In Service, Completed)
  const handleBookingStatusChange = async (bookingId: number, status: BookingStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchDashboardData(true);
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
      fetchDashboardData(true);
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
      fetchDashboardData(true);
    } catch (err) {
      console.error('Customer approval update error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Saloon Dashboard
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live: {stats.available_chairs} of 4 Available • {stats.booked_chairs + stats.occupied_chairs} Booked/In Use</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time station occupancy, customer check-ins, and direct appointment management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData(false)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <Link
            to="/admin/services"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Services</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="px-5 py-2.5 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30"
          >
            <Calendar className="w-4 h-4" />
            <span>All Bookings</span>
          </Link>
        </div>
      </div>

      {/* 2. Streamlined Station Status KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Available Chairs */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-emerald-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Available Stations</span>
            <Armchair className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-emerald-300">{stats.available_chairs}</span>
            <span className="text-xs text-slate-400 font-medium">/ 4 Available</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">{stats.available_chairs} station{stats.available_chairs !== 1 ? 's' : ''} ready for booking</p>
        </div>

        {/* Occupied / In Service */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-purple-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">In-Service</span>
            <Scissors className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-purple-300">{stats.occupied_chairs}</span>
            <span className="text-xs text-slate-400 font-medium">/ 4 Styling</span>
          </div>
          <p className="text-[11px] text-purple-400 font-medium">{stats.occupied_chairs} active session{stats.occupied_chairs !== 1 ? 's' : ''} in progress</p>
        </div>

        {/* Booked Stations */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-amber-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Booked Slots</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-amber-300">{stats.booked_chairs}</span>
            <span className="text-xs text-slate-400 font-medium">/ 4 Reserved</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium">{stats.booked_chairs} client{stats.booked_chairs !== 1 ? 's' : ''} reserved today</p>
        </div>

        {/* Blocked Stations */}
        <div className="p-5 rounded-2xl bg-[#141C2E] border border-rose-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Blocked Chairs</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-rose-300">{stats.blocked_chairs}</span>
            <span className="text-xs text-slate-400 font-medium">/ 4 Blocked</span>
          </div>
          <p className="text-[11px] text-rose-400 font-medium">{stats.blocked_chairs} station{stats.blocked_chairs !== 1 ? 's' : ''} in maintenance</p>
        </div>

      </div>

      {/* 2.5 New Customer Registration Approvals Awaiting Owner (High Visibility) */}
      {pendingCustomers.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-base font-bold text-amber-300">
                {stats.pending_approvals} New Customer Registration{stats.pending_approvals > 1 ? 's' : ''} Awaiting Owner Approval
              </h3>
            </div>
            <Link to="/admin/customers?status=pending" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
              <span>View All ({stats.pending_approvals})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {pendingCustomers.map((cust) => (
              <div key={cust.id} className="p-3.5 rounded-2xl bg-[#141C2E] border border-slate-700/80 flex items-center justify-between gap-3 text-xs">
                <div className="truncate">
                  <p className="font-bold text-slate-100 truncate">{cust.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{cust.email}</p>
                  {cust.phone && <p className="text-[10px] text-slate-500 truncate">{cust.phone}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleCustomerApproval(cust.id, 'approved')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    title="Approve Customer Registration"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleCustomerApproval(cust.id, 'rejected')}
                    className="px-2 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    title="Reject Registration"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VISUAL 4-CHAIR LIVE INTERACTIVE BOARD (With 3-dots actions on each chair) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-amber-400" />
            <span>4 Salon Physical Chairs (Live Allocation)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Click <strong className="text-amber-300">⋮</strong> on any chair to book, block, or confirm arrival
          </span>
        </div>

        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-56 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chairs.map((chair) => (
              <ChairVisualCard
                key={chair.id}
                chair={chair}
                isAdmin={true}
                onBlock={handleOpenBlockModal}
                onUnblock={handleUnblockChair}
                onBookingStatusChange={handleBookingStatusChange}
                onOpenNoShowModal={handleOpenNoShowModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. TODAY'S APPOINTMENT QUEUE & PENDING CUSTOMERS SECTION (Neatly located below chairs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Today's Schedule Table (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Today's Appointment Queue</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {stats.today_appointments} total sessions scheduled • ₹{stats.today_revenue.toLocaleString('en-IN')} Est. Gross
              </p>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
              <p className="font-medium text-slate-400">No appointments scheduled for today yet.</p>
              <p className="text-[11px] text-slate-500">Clients can book directly via 1-click Quick Booking.</p>
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
                        <div className="text-slate-500 text-[11px]">{b.customer_phone || 'Client'}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-slate-200 font-medium truncate max-w-[140px]">{b.service_name}</div>
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
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] transition-colors"
                              title="Customer arrived (withdraws timeout)"
                            >
                              Arrived
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
                              onClick={() => setNoShowBooking(b)}
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

        {/* System Updates & Registered Clients (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Notifications / Alerts Feed */}
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

          {/* Customer Management Quick Link */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-[#141C2E] to-[#141C2E] border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Customer Accounts</h4>
                <p className="text-[11px] text-slate-400">Manage customer list & profiles</p>
              </div>
            </div>
            <Link
              to="/admin/customers"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

      </div>

      {/* Block Chair Modal with Duration (mins) */}
      {blockModalChair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#141C2E] border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <span>Block Chair {blockModalChair.chair_number}</span>
              </h3>
              <button
                onClick={() => setBlockModalChair(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBlock} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Block Duration (Minutes)</label>
                <select
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="15">15 Minutes (Quick Clean)</option>
                  <option value="30">30 Minutes (Standard Sanitation)</option>
                  <option value="60">60 Minutes (1 Hour Maintenance)</option>
                  <option value="120">120 Minutes (2 Hours Deep Repair)</option>
                  <option value="480">Full Day</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Reason for Blocking</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep sterilization, hydraulic service"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockModalChair(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
