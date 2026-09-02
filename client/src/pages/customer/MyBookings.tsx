import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Calendar, 
  Clock, 
  Armchair, 
  Scissors, 
  Ban, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);
  
  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    if (tab === 'all') return true;
    if (tab === 'upcoming') {
      return ['confirmed', 'customer_arrived', 'in_service'].includes(b.status) && b.booking_date >= today;
    }
    if (tab === 'completed') {
      return b.status === 'completed';
    }
    if (tab === 'cancelled') {
      return b.status === 'cancelled' || b.status === 'no_show';
    }
    return true;
  });

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    setMessage(null);

    try {
      await api.post(`/bookings/${cancellingBooking.id}/cancel`, {
        reason: cancelReason || 'Customer requested cancellation.'
      });
      setMessage({ type: 'success', text: 'Appointment cancelled successfully.' });
      setCancellingBooking(null);
      setCancelReason('');
      fetchBookings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel appointment.' });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            My Appointments & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your reserved styling chairs, appointment timelines, and service logs.
          </p>
        </div>

        <Link
          to="/customer/book"
          className="px-6 py-3 rounded-xl gold-btn font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </Link>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141C2E] border border-slate-700/60 w-fit text-xs font-semibold">
        {(['upcoming', 'completed', 'cancelled', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl capitalize transition-all ${
              tab === t
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#141C2E]/50 border border-dashed border-slate-800 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-slate-300">No {tab} appointments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no salon appointments matching this filter.
          </p>
          <Link
            to="/customer/book"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gold-btn font-bold text-xs"
          >
            <span>Book Next Appointment</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isUpcoming = ['confirmed', 'customer_arrived'].includes(b.status) && b.booking_date >= today;

            return (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-[#141C2E] border border-slate-700/70 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-600 transition-all text-xs"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-400">#{b.id}</span>
                    <h3 className="font-serif text-base font-bold text-slate-100">{b.service_name}</h3>
                    <StatusBadge status={b.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-300 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-slate-200">{b.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-mono">{b.start_time} - {b.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Armchair className="w-4 h-4 text-amber-400" />
                      <span className="font-medium text-amber-300">Chair {b.chair_number} ({b.chair_name})</span>
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      Note: "{b.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Price</span>
                    <span className="font-serif font-bold text-base text-slate-100 font-mono">
                      ₹{b.total_price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {isUpcoming && (
                    <button
                      onClick={() => setCancellingBooking(b)}
                      className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-[#141C2E] border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-400" />
                <span>Cancel Appointment</span>
              </h3>
              <button
                onClick={() => setCancellingBooking(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your appointment for <strong className="text-slate-100">{cancellingBooking.service_name}</strong> on <span className="text-amber-300">{cancellingBooking.booking_date} at {cancellingBooking.start_time}</span>?
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-medium">Cancellation Reason (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Schedule conflict..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
