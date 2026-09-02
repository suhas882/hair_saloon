import React from 'react';
import { Booking } from '../types';
import { AlertTriangle, CheckCircle2, Lock, X } from 'lucide-react';

interface NoShowModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'release' | 'keep_blocked') => Promise<void>;
  loading?: boolean;
}

export const NoShowModal: React.FC<NoShowModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#141C2E] border border-slate-700/80 shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Customer No-Show Action</h3>
              <p className="text-xs text-slate-400">Booking #{booking.id} • {booking.customer_name || 'Customer'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Box */}
        <div className="my-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Service:</span>
            <span className="font-semibold text-slate-200">{booking.service_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Scheduled Time:</span>
            <span className="font-semibold text-amber-300">{booking.booking_date} @ {booking.start_time} - {booking.end_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned Station:</span>
            <span className="font-semibold text-slate-200">Chair {booking.chair_number}</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          The customer did not arrive for their scheduled session. How would you like to handle <span className="text-amber-400 font-semibold">Chair {booking.chair_number}</span>?
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onConfirm('release')}
            disabled={loading}
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-600/40 hover:border-emerald-500 text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-bold text-emerald-300 text-sm mb-1 text-center">Release Chair</span>
            <span className="text-xs text-slate-400 text-center">
              Make Chair {booking.chair_number} available immediately for walk-in clients.
            </span>
          </button>

          <button
            onClick={() => onConfirm('keep_blocked')}
            disabled={loading}
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-red-950/30 border border-slate-700 hover:border-red-600/40 text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3 group-hover:bg-red-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <span className="font-bold text-red-300 text-sm mb-1 text-center">Keep Chair Blocked</span>
            <span className="text-xs text-slate-400 text-center">
              Keep Chair {booking.chair_number} blocked to preserve salon schedule buffer.
            </span>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
