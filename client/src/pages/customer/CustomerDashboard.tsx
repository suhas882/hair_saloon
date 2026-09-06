import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Booking, SalonNotification } from '../../types';
import { 
  Calendar, 
  Clock, 
  Armchair, 
  Scissors, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Bell, 
  ArrowRight, 
  Sparkles,
  AlertTriangle,
  History,
  TrendingUp
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<{
    next_booking: Booking | null;
    stats: { total_bookings: number; upcoming_bookings: number; completed_bookings: number };
    recent_bookings: Booking[];
    notifications: SalonNotification[];
  }>({
    next_booking: null,
    stats: { total_bookings: 0, upcoming_bookings: 0, completed_bookings: 0 },
    recent_bookings: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/customer');
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const isApproved = user?.approval_status === 'approved';
  const isPending = user?.approval_status === 'pending';
  const isRejected = user?.approval_status === 'rejected';
  const isSuspended = user?.approval_status === 'suspended';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* 1. Welcome & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Welcome back, <span className="gold-gradient-text">{user?.name}</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Client Portal • Account #{user?.id} • {user?.email}
          </p>
        </div>

        {/* Action Button */}
        {isApproved ? (
          <Link
            to="/customer/book"
            className="px-6 py-3 rounded-xl gold-btn font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 group"
          >
            <Calendar className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Book New Appointment</span>
          </Link>
        ) : (
          <button
            disabled
            className="px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-500 font-medium text-xs cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Booking Gated (Approval Pending)</span>
          </button>
        )}
      </div>

      {/* 2. Account Approval Status Banner */}
      {isPending && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-[#141C2E] border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex-shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-200">Account Pending Administrator Approval</h3>
                <StatusBadge status="pending" size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Your registration is currently under review by salon management. You will receive an immediate confirmation once approved, unlocking booking access across all 4 luxury stations.
              </p>
            </div>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-emerald-900/15 to-[#141C2E] border border-emerald-500/30 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-200">Approved VIP Client</h4>
                <StatusBadge status="approved" size="sm" />
              </div>
              <p className="text-xs text-slate-400">You have full booking privileges across all 4 styling stations.</p>
            </div>
          </div>
          <Link
            to="/customer/book"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {isRejected && (
        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-600/40 text-rose-300 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-200">Account Registration Not Approved</h4>
            <p className="text-xs text-slate-400">Your registration request was rejected by management. Please contact concierge for details.</p>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-600/40 text-rose-300 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-200">Account Suspended</h4>
            <p className="text-xs text-slate-400">Your booking access is temporarily suspended. Please visit or contact front desk.</p>
          </div>
        </div>
      )}

      {/* 3. Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Bookings</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-slate-100">
            {data.stats.upcoming_bookings}
          </p>
          <p className="text-[11px] text-amber-400">Active salon sessions</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Visits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-slate-100">
            {data.stats.completed_bookings}
          </p>
          <p className="text-[11px] text-emerald-400">Past styling appointments</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total History</span>
            <History className="w-4 h-4 text-purple-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-slate-100">
            {data.stats.total_bookings}
          </p>
          <p className="text-[11px] text-slate-400">All-time appointments</p>
        </div>
      </div>

      {/* 4. Next Appointment Spotlight */}
      {data.next_booking ? (
        <div className="rounded-3xl bg-gradient-to-r from-[#182032] via-[#141C2E] to-[#141C2E] border border-amber-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Next Upcoming Session
                </span>
                <StatusBadge status={data.next_booking.status} size="sm" />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
                {data.next_booking.service_name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-200">{data.next_booking.booking_date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-mono">{data.next_booking.start_time} - {data.next_booking.end_time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Armchair className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-amber-300">Chair {data.next_booking.chair_number} ({data.next_booking.chair_name})</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 block">Total Investment</span>
                <span className="font-serif text-2xl font-bold text-amber-400 font-mono">
                  ₹{data.next_booking.total_price.toLocaleString('en-IN')}
                </span>
              </div>
              <Link
                to="/customer/bookings"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Manage Appointment
              </Link>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#141C2E]/60 border border-dashed border-slate-800 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-slate-300">No Upcoming Appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isApproved
              ? 'Ready for your next styling session? Select a time on our 4 master stations.'
              : 'Once your account is approved, your scheduled appointments will appear here.'}
          </p>
          {isApproved && (
            <Link
              to="/customer/book"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gold-btn font-bold text-xs"
            >
              <span>Book Appointment Now</span>
            </Link>
          )}
        </div>
      )}

      {/* 5. Recent Bookings Table & Notifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Bookings (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Recent Bookings</span>
            </h3>
            <Link to="/customer/bookings" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              View All
            </Link>
          </div>

          {data.recent_bookings.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No booking history recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {data.recent_bookings.map((b) => (
                <div key={b.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-200">{b.service_name}</p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <span>{b.booking_date} @ {b.start_time}</span>
                      <span>•</span>
                      <span className="text-amber-400/90 font-medium">Chair {b.chair_number}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} size="sm" />
                    <span className="font-serif font-bold text-slate-200">₹{b.total_price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications feed (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Updates</span>
            </h3>
          </div>

          {data.notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent alerts.
            </div>
          ) : (
            <div className="space-y-3">
              {data.notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{n.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
