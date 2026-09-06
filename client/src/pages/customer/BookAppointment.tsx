import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Service, AvailabilitySlot, Booking, Chair } from '../../types';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  Armchair, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle,
  Check,
  CalendarCheck,
  Zap,
  Tag
} from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Booking Mode: 'direct' (Basic 1-Click) or 'advance' (Select Date & Time)
  const [bookingMode, setBookingMode] = useState<'direct' | 'advance'>('direct');

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedChairId, setSelectedChairId] = useState<number | null>(null);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Advance Mode specific states
  const [advanceStep, setAdvanceStep] = useState<number>(1); // 1: Date & Time, 2: Review
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  // Status states
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Categories list
  const categories = ['All', 'Haircut & Grooming', 'Haircut', 'Grooming', 'Coloring', 'Treatment', 'Facial', 'Styling'];

  // Initial load: fetch services and chairs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srvRes, chairRes] = await Promise.all([
          api.get('/services'),
          api.get('/chairs')
        ]);
        const activeServices: Service[] = srvRes.data.services || [];
        setServices(activeServices);
        setChairs(chairRes.data.chairs || []);

        // Default to Hair Cut & Shave or first service
        const initialServiceId = searchParams.get('serviceId');
        const initialChairId = searchParams.get('chairId');

        if (initialChairId) {
          setSelectedChairId(parseInt(initialChairId, 10));
        }

        if (initialServiceId) {
          const match = activeServices.find((s: Service) => s.id === parseInt(initialServiceId, 10));
          if (match) setSelectedService(match);
        } else if (activeServices.length > 0) {
          // Look for 'Hair Cut & Shave' default
          const defaultCutShave = activeServices.find(s => 
            s.name.toLowerCase().includes('hair cut') || s.name.toLowerCase().includes('cut & shave')
          );
          setSelectedService(defaultCutShave || activeServices[0]);
        }
      } catch (err) {
        console.error('Failed to load booking prerequisites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  // Fetch slot availability for Advance Mode
  const fetchAvailability = useCallback(async () => {
    if (!selectedService || !selectedDate) return;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot(null);

    try {
      const res = await api.get(`/bookings/availability?date=${selectedDate}&serviceId=${selectedService.id}`);
      setSlots(res.data.slots || []);
    } catch (err: any) {
      console.error('Availability fetch error:', err);
      setError(err.response?.data?.message || 'Failed to check salon chair availability.');
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedService, selectedDate]);

  useEffect(() => {
    if (bookingMode === 'advance' && selectedService) {
      fetchAvailability();
    }
  }, [bookingMode, selectedService, selectedDate, fetchAvailability]);

  // Filter services by category
  const filteredServices = services.filter(s => {
    if (selectedCategory === 'All') return true;
    return s.category && s.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Direct 1-Click Quick Booking Action
  const handleDirectQuickBook = async () => {
    if (!selectedService) {
      setError('Please select a service to book.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/bookings', {
        service_id: selectedService.id,
        chair_id: selectedChairId || null,
        notes: specialNotes,
        is_quick_book: true
      });

      setConfirmedBooking(res.data.booking);
    } catch (err: any) {
      console.error('Direct booking error:', err);
      setError(err.response?.data?.message || 'Failed to complete quick booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Advance Date/Time Booking Action
  const handleAdvanceBookingConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      setError('Please choose a service, date, and available time slot.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/bookings', {
        service_id: selectedService.id,
        booking_date: selectedDate,
        start_time: selectedSlot.start_time,
        chair_id: selectedChairId || selectedSlot.available_chairs[0]?.id,
        notes: specialNotes
      });

      setConfirmedBooking(res.data.booking);
    } catch (err: any) {
      console.error('Advance booking confirmation error:', err);
      setError(err.response?.data?.message || 'Failed to confirm booking.');
    } finally {
      setSubmitting(false);
    }
  };

  // Booking Confirmation Success View
  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#141C2E] border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
            <CalendarCheck className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Booking Confirmed
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-100">
              Your Chair is Reserved!
            </h2>
            <p className="text-xs text-slate-400">
              Booking ID #{confirmedBooking.id} • Assigned Station: Chair {confirmedBooking.chair_number} ({confirmedBooking.chair_name})
            </p>
          </div>

          {/* Receipt Summary */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Service:</span>
              <span className="font-semibold text-slate-100">{confirmedBooking.service_name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Date & Slot:</span>
              <span className="font-semibold text-amber-300 font-mono">
                {confirmedBooking.booking_date} @ {confirmedBooking.start_time} - {confirmedBooking.end_time}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Styling Station:</span>
              <span className="font-semibold text-emerald-400">Chair {confirmedBooking.chair_number} ({confirmedBooking.chair_name})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Client Name:</span>
              <span className="font-semibold text-slate-100">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 font-medium">Total Price:</span>
              <span className="font-serif font-bold text-amber-400 text-base font-mono">
                ₹{confirmedBooking.total_price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/customer/bookings"
              className="w-full sm:w-auto px-8 py-3 rounded-xl gold-btn font-bold text-xs"
            >
              View My Bookings
            </Link>
            <Link
              to="/customer/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>4-Chair Salon Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Book a Salon Slot
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose direct 1-click quick booking or advance date scheduling.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setBookingMode('direct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              bookingMode === 'direct'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Direct Quick Book (1-Click)</span>
          </button>

          <button
            onClick={() => setBookingMode('advance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              bookingMode === 'advance'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Advance Date Booking</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-rose-200">Notice</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* MODE 1: DIRECT QUICK BOOK (BASIC - NO DATE/TIME PROMPT) */}
      {bookingMode === 'direct' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Service & Category Selection */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-400" />
                <span>1. Select Service (Default: Hair Cut & Shave)</span>
              </h2>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                          : 'bg-[#141C2E] border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-2 py-0.5 rounded bg-slate-900">
                            {srv.category || 'Styling'}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {srv.duration_minutes} mins
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-slate-100 text-sm">{srv.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-serif text-lg font-bold text-amber-400 block font-mono">
                          ₹{srv.price.toLocaleString('en-IN')}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-2 ml-auto ${
                            isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chair Selection (Optional Chair Preference or Auto Assign) */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
              <Armchair className="w-5 h-5 text-amber-400" />
              <span>2. Select Styling Station (Optional or Auto-Assigned)</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSelectedChairId(null)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  selectedChairId === null
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/30 font-bold'
                    : 'bg-[#141C2E] border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <p className="text-xs">Auto Next Available</p>
                <p className="text-[10px] text-slate-400">Fastest queue</p>
              </button>

              {chairs.map((c) => {
                const isSelected = selectedChairId === c.id;
                const isBlocked = c.is_blocked === 1;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => setSelectedChairId(c.id)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isBlocked
                        ? 'opacity-40 bg-slate-900 border-slate-800 cursor-not-allowed text-slate-500'
                        : isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/30 font-bold'
                        : 'bg-[#141C2E] border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Armchair className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <p className="text-xs">Chair {c.chair_number}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.name.split('-')[1] || c.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Book Final Action Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#182032] via-[#141C2E] to-[#182032] border border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Direct Instant Booking</p>
              <h3 className="font-serif text-2xl font-bold text-slate-100">
                {selectedService?.name || 'Hair Cut & Shave'}
              </h3>
              <p className="text-xs text-slate-300">
                {selectedService?.duration_minutes} Mins • Total: <strong className="text-amber-400 font-mono text-sm">₹{selectedService?.price.toLocaleString('en-IN')}</strong> • Station: {selectedChairId ? `Chair ${chairs.find(c => c.id === selectedChairId)?.chair_number}` : 'Next Available Free Chair'}
              </p>
            </div>

            <button
              onClick={handleDirectQuickBook}
              disabled={submitting || !selectedService}
              className="w-full md:w-auto px-10 py-4 rounded-2xl gold-btn font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-900/40 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{submitting ? 'Reserving Station...' : 'Quick Book Now (Direct 1-Click)'}</span>
            </button>
          </div>

        </div>
      )}

      {/* MODE 2: ADVANCE DATE & TIME BOOKING */}
      {bookingMode === 'advance' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Step indicator */}
          <div className="flex items-center gap-3 text-xs font-semibold pb-2 border-b border-slate-800">
            <span className={`px-3 py-1.5 rounded-xl ${advanceStep === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              1. Date & Time Slot
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className={`px-3 py-1.5 rounded-xl ${advanceStep === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              2. Review & Confirm
            </span>
          </div>

          {advanceStep === 1 && (
            <div className="space-y-6">
              
              {/* Date Input */}
              <div className="p-6 rounded-2xl bg-[#141C2E] border border-slate-700/80 shadow-xl space-y-4 max-w-md">
                <label className="text-slate-300 font-semibold text-xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Choose Future Date for {selectedService?.name}</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Time Slots Grid with Clock Synchronization */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Synchronized Open Time Slots for {selectedDate}</span>
                  </h3>
                  <button
                    onClick={fetchAvailability}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Sync Clock
                  </button>
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-slate-900 animate-pulse border border-slate-800" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                    No slots available on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.start_time === slot.start_time;
                      return (
                        <button
                          key={slot.start_time}
                          disabled={!slot.available}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setSelectedChairId(slot.available_chairs[0]?.id || null);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            !slot.available
                              ? 'opacity-30 bg-slate-900/40 border-slate-800 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/40'
                              : 'bg-[#141C2E] border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-100">{slot.start_time}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${slot.available ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                              {slot.available ? `${slot.available_chairs_count} Chairs` : 'Expired / Busy'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Ends {slot.end_time}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    if (selectedSlot) setAdvanceStep(2);
                    else setError('Please select an available time slot.');
                  }}
                  disabled={!selectedSlot}
                  className="px-8 py-3 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Proceed to Review</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {advanceStep === 2 && (
            <div className="p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-6 text-xs max-w-2xl mx-auto">
              <h3 className="font-serif text-xl font-bold text-slate-100 border-b border-slate-800 pb-3">
                Review Advance Reservation
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-bold text-slate-100 text-sm">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Date & Slot:</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">{selectedDate} @ {selectedSlot?.start_time} - {selectedSlot?.end_time}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Assigned Station:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">Chair {selectedSlot?.available_chairs[0]?.chair_number || selectedChairId}</span>
                </div>
                <div className="flex justify-between py-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-semibold text-sm">Total Investment:</span>
                  <span className="font-serif font-bold text-amber-400 text-base font-mono">
                    ₹{selectedService?.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setAdvanceStep(1)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Back
                </button>

                <button
                  onClick={handleAdvanceBookingConfirm}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{submitting ? 'Confirming...' : 'Confirm Advance Appointment'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
