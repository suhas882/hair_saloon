import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chair, BookingStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import { 
  Armchair, 
  User, 
  Clock, 
  Scissors, 
  Lock, 
  Unlock, 
  MoreVertical, 
  CheckCircle, 
  AlertOctagon, 
  Calendar,
  Check,
  UserCheck
} from 'lucide-react';

interface ChairVisualCardProps {
  chair: Chair;
  isAdmin?: boolean;
  onBlock?: (chairId: number) => void;
  onUnblock?: (chairId: number) => void;
  onStatusChange?: (chairId: number, status: string) => void;
  onBookingStatusChange?: (bookingId: number, status: BookingStatus) => void;
  onOpenNoShowModal?: (chair: Chair) => void;
  onQuickBookChair?: (chairId: number) => void;
}

export const ChairVisualCard: React.FC<ChairVisualCardProps> = ({
  chair,
  isAdmin = false,
  onBlock,
  onUnblock,
  onBookingStatusChange,
  onOpenNoShowModal,
  onQuickBookChair,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleBookChairClick = () => {
    setMenuOpen(false);
    if (onQuickBookChair) {
      onQuickBookChair(chair.id);
    } else {
      if (user) {
        navigate(`/customer/book?chairId=${chair.id}`);
      } else {
        navigate('/register');
      }
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#141C2E]/90 border backdrop-blur-md p-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${getStatusBorder()}`}
    >
      {/* Background Gradient Splash */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${getChairGlow()} rounded-bl-full pointer-events-none`} />

      {/* Top Bar: Chair Number, Status Badge & 3-Dots Action Menu */}
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
            <p className="text-xs text-slate-400 truncate max-w-[140px]">{chair.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusBadge status={chair.status} size="sm" />
          
          {/* 3-DOTS ACTION MENU ON TOP RIGHT */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none"
              title="Chair Options"
              id={`chair-${chair.id}-actions`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0F1626] border border-slate-700/90 shadow-2xl p-1.5 z-40 space-y-1 text-xs animate-fade-in">
                  
                  {/* Action 1: Book Chair */}
                  {!chair.is_blocked && (
                    <button
                      onClick={handleBookChairClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors font-semibold text-left"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Book Chair {chair.chair_number}</span>
                    </button>
                  )}

                  {/* Action 2: Block / Unblock Chair */}
                  {chair.is_blocked ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onUnblock?.(chair.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors font-medium text-left"
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors font-medium text-left"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Block Chair</span>
                    </button>
                  )}

                  {/* Admin specific current booking actions */}
                  {current_booking && (
                    <>
                      <div className="border-t border-slate-800 my-1" />
                      {current_booking.booking_status === 'confirmed' && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            onBookingStatusChange?.(current_booking.booking_id, 'customer_arrived');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-emerald-300 hover:bg-emerald-950/30 rounded-lg transition-colors text-left font-medium"
                          title="Withdraws the auto 10mins timeout"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Confirm Arrival (Customer Reached)</span>
                        </button>
                      )}

                      {(current_booking.booking_status === 'confirmed' || current_booking.booking_status === 'customer_arrived') && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            onBookingStatusChange?.(current_booking.booking_id, 'in_service');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-purple-300 hover:bg-purple-950/30 rounded-lg transition-colors text-left font-medium"
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
                          className="w-full flex items-center gap-2 px-3 py-2 text-emerald-300 hover:bg-emerald-950/30 rounded-lg transition-colors text-left font-medium"
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors text-left font-medium"
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
        </div>
      </div>

      {/* Main Occupant & Dynamic Availability Details */}
      <div className="space-y-3 min-h-[120px] flex flex-col justify-between">
        {chair.is_blocked ? (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-rose-300 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Chair is Blocked</span>
              </p>
              {chair.free_in_minutes && chair.free_in_minutes > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900/40 text-rose-300 font-mono">
                  ~{chair.free_in_minutes}m left
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px]">{chair.block_reason || 'Out of service / Maintenance'}</p>
          </div>
        ) : current_booking ? (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
            {/* Top row with client name and booking id */}
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

            {/* Service Name */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Scissors className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium">{current_booking.service_name}</span>
            </div>

            {/* Time Slot & Status */}
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{current_booking.start_time} - {current_booking.end_time}</span>
              </div>
              <span className="capitalize text-amber-400/90 font-medium text-[11px]">
                {current_booking.booking_status.replace('_', ' ')}
              </span>
            </div>

            {/* "Will be free in X mins" Availability Badge */}
            {chair.free_in_minutes !== undefined && chair.free_in_minutes > 0 && (
              <div className="pt-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg w-full">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Will be free in {chair.free_in_minutes} mins</span>
                </div>
              </div>
            )}

            {/* 10-Minute Auto-Release Warning Window */}
            {chair.timeout_minutes_left !== null && chair.timeout_minutes_left !== undefined && chair.timeout_minutes_left > 0 && current_booking.booking_status === 'confirmed' && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-800/50 text-[11px] text-red-300 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span>Releases in {chair.timeout_minutes_left}m if not reached</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-4 text-center rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-xs text-slate-500 space-y-1">
            <CheckCircle className="w-6 h-6 text-emerald-500/50 mb-1" />
            <p className="font-semibold text-emerald-400">Ready for Booking</p>
            <p className="text-[11px] text-slate-400">Station is completely free</p>
          </div>
        )}

        {/* Quick Footer Action */}
        <div className="pt-2 border-t border-slate-800/60">
          {isAdmin && current_booking ? (
            <div className="flex items-center gap-2">
              {current_booking.booking_status === 'confirmed' && (
                <button
                  onClick={() => onBookingStatusChange?.(current_booking.booking_id, 'customer_arrived')}
                  className="w-full py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  title="Confirm customer reached (withdraws 10m timeout)"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Confirm Arrival</span>
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
                  <Check className="w-3.5 h-3.5" />
                  <span>Finish & Free Chair</span>
                </button>
              )}
            </div>
          ) : !chair.is_blocked ? (
            <button
              onClick={handleBookChairClick}
              className="w-full py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Quick Book Chair {chair.chair_number}</span>
            </button>
          ) : (
            <p className="text-[11px] text-center text-rose-400 font-medium">Station Blocked</p>
          )}
        </div>
      </div>
    </div>
  );
};
