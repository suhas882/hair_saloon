import React, { useState } from 'react';
import { Chair, BookingStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { Armchair, User, Clock, Scissors, Lock, Unlock, MoreVertical, CheckCircle, AlertOctagon } from 'lucide-react';

interface ChairVisualCardProps {
  chair: Chair;
  isAdmin?: boolean;
  onBlock?: (chairId: number) => void;
  onUnblock?: (chairId: number) => void;
  onStatusChange?: (chairId: number, status: string) => void;
  onBookingStatusChange?: (bookingId: number, status: BookingStatus) => void;
  onOpenNoShowModal?: (chair: Chair) => void;
}

export const ChairVisualCard: React.FC<ChairVisualCardProps> = ({
  chair,
  isAdmin = false,
  onBlock,
  onUnblock,
  onBookingStatusChange,
  onOpenNoShowModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { current_booking } = chair;

  const getStatusBorder = () => {
    switch (chair.status) {
      case 'available':
        return 'border-emerald-500/40 hover:border-emerald-500/80 shadow-emerald-950/20';
      case 'occupied':
        return 'border-purple-500/50 hover:border-purple-500/90 shadow-purple-950/30';
      case 'booked':
        return 'border-amber-500/40 hover:border-amber-500/80 shadow-amber-950/20';
      case 'blocked':
        return 'border-rose-500/40 hover:border-rose-500/80 shadow-rose-950/20';
      case 'no_show':
        return 'border-red-600/60 hover:border-red-600/90 shadow-red-950/30';
      default:
        return 'border-slate-700 hover:border-slate-600';
    }
  };

  const getChairGlow = () => {
    switch (chair.status) {
      case 'available':
        return 'from-emerald-500/10 to-transparent';
      case 'occupied':
        return 'from-purple-500/15 to-transparent';
      case 'booked':
        return 'from-amber-500/10 to-transparent';
      case 'blocked':
        return 'from-rose-500/10 to-transparent';
      case 'no_show':
        return 'from-red-600/15 to-transparent';
      default:
        return 'from-slate-800/10 to-transparent';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#141C2E]/90 border backdrop-blur-md p-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${getStatusBorder()}`}
    >
      {/* Background Gradient Splash */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${getChairGlow()} rounded-bl-full pointer-events-none`} />

      {/* Top Bar: Chair Number & Status */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-amber-400 font-serif font-bold text-lg shadow-inner">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-base flex items-center gap-1.5">
              <span>Chair {chair.chair_number}</span>
              {chair.is_blocked === 1 && (
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              )}
            </h4>
            <p className="text-xs text-slate-400 truncate max-w-[150px]">{chair.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={chair.status} size="sm" />
          
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                title="Chair Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-30 space-y-1 text-xs">
                    {chair.is_blocked ? (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onUnblock?.(chair.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unblock Chair</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onBlock?.(chair.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Block Chair</span>
                      </button>
                    )}

                    {current_booking && (
                      <>
                        <div className="border-t border-slate-800 my-1" />
                        {current_booking.booking_status === 'confirmed' && (
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              onBookingStatusChange?.(current_booking.booking_id, 'customer_arrived');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Mark Arrived</span>
                          </button>
                        )}

                        {(current_booking.booking_status === 'confirmed' || current_booking.booking_status === 'customer_arrived') && (
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              onBookingStatusChange?.(current_booking.booking_id, 'in_service');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>Start Service</span>
                          </button>
                        )}

                        {current_booking.booking_status === 'in_service' && (
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              onBookingStatusChange?.(current_booking.booking_id, 'completed');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Complete Service</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            onOpenNoShowModal?.(chair);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Mark No-Show</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Occupant Details */}
      <div className="space-y-3 min-h-[110px] flex flex-col justify-between">
        {chair.is_blocked ? (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-rose-300">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              Chair is Blocked
            </p>
            <p className="text-slate-400">{chair.block_reason || 'Out of service / Maintenance'}</p>
          </div>
        ) : current_booking ? (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-100 truncate">
                <User className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">{isAdmin ? current_booking.customer_name : 'Reserved Client'}</span>
              </div>
              {isAdmin && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  #{current_booking.booking_id}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Scissors className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium">{current_booking.service_name}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{current_booking.start_time} - {current_booking.end_time}</span>
              </div>
              <span className="capitalize text-amber-400/90 font-medium">
                {current_booking.booking_status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-4 text-center rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-xs text-slate-500">
            <CheckCircle className="w-6 h-6 text-emerald-500/40 mb-1.5" />
            <p className="font-medium text-slate-400">Ready for Next Client</p>
            <p className="text-[11px] text-slate-500">No active appointment right now</p>
          </div>
        )}

        {/* Quick Footer Action for Admin */}
        {isAdmin && current_booking && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
            {current_booking.booking_status === 'confirmed' && (
              <button
                onClick={() => onBookingStatusChange?.(current_booking.booking_id, 'customer_arrived')}
                className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Mark Arrived</span>
              </button>
            )}

            {current_booking.booking_status === 'customer_arrived' && (
              <button
                onClick={() => onBookingStatusChange?.(current_booking.booking_id, 'in_service')}
                className="w-full py-1.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Start Service</span>
              </button>
            )}

            {current_booking.booking_status === 'in_service' && (
              <button
                onClick={() => onBookingStatusChange?.(current_booking.booking_id, 'completed')}
                className="w-full py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Finish & Free Chair</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
