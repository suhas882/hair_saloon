import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Service, AvailabilitySlot, Booking } from '../../types';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  Armchair, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle,
  Check,
  CalendarCheck
} from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step state (1: Service, 2: Date, 3: Slot & Chair, 4: Confirm)
  const [step, setStep] = useState<number>(1);

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedChairId, setSelectedChairId] = useState<number | null>(null);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Status states
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Initial load: fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        const activeServices = res.data.services || [];
        setServices(activeServices);

        // Pre-select service if passed in query string (e.g. ?serviceId=1)
        const initialServiceId = searchParams.get('serviceId');
        if (initialServiceId) {
          const match = activeServices.find((s: Service) => s.id === parseInt(initialServiceId, 10));
          if (match) {
            setSelectedService(match);
            setStep(2); // Proceed to date
          }
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [searchParams]);

  // Fetch slot availability whenever date or service changes
  const fetchAvailability = useCallback(async () => {
    if (!selectedService || !selectedDate) return;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot(null);
    setSelectedChairId(null);

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
    if (step === 3) {
      fetchAvailability();
    }
  }, [step, fetchAvailability]);

  // Approval Gate Check
  if (user && user.role === 'customer' && user.approval_status !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#141C2E] border border-amber-500/40 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            Account Waiting for Administrator Approval
          </h2>

          <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
            {user.approval_status === 'pending'
              ? 'Your account registration is currently pending review by salon management. Only approved customers are permitted to book appointments across our 4 luxury stations.'
              : user.approval_status === 'rejected'
              ? 'Your account registration was not approved. Please contact the salon reception.'
              : 'Your booking privileges are suspended.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/customer/dashboard"
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Return to Dashboard
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-xl gold-btn text-xs font-bold"
            >
              Contact Concierge Desk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle final submission
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      setError('Please select a service, date, and available time slot.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/bookings', {
        service_id: selectedService.id,
        booking_date: selectedDate,
        start_time: selectedSlot.start_time,
        chair_id: selectedChairId || (selectedSlot.available_chairs[0]?.id),
        notes: specialNotes
      });

      setConfirmedBooking(res.data.booking);
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setError(err.response?.data?.message || 'Failed to confirm booking. Please try another time.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success Confirmation View
  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#141C2E] border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
            <CalendarCheck className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Booking Successfully Recorded
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-100">
              Your Appointment is Confirmed!
            </h2>
            <p className="text-xs text-slate-400">
              Reference #{confirmedBooking.id} • Assigned Station: Chair {confirmedBooking.chair_number}
            </p>
          </div>

          {/* Receipt Box */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Service:</span>
              <span className="font-semibold text-slate-100">{confirmedBooking.service_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-semibold text-amber-300">{confirmedBooking.booking_date} @ {confirmedBooking.start_time} - {confirmedBooking.end_time}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Styling Station:</span>
              <span className="font-semibold text-slate-100">Chair {confirmedBooking.chair_number} ({confirmedBooking.chair_name})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Client Name:</span>
              <span className="font-semibold text-slate-100">{user?.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total Investment:</span>
              <span className="font-serif font-bold text-amber-400 text-sm">₹{confirmedBooking.total_price.toLocaleString('en-IN')}</span>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Header & Steps Progress */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>4-Chair Salon Allocation Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Book an Appointment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Follow the 4-step wizard to reserve your personalized styling station.
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-xs font-semibold">
          {[
            { num: 1, title: 'Service' },
            { num: 2, title: 'Date' },
            { num: 3, title: 'Time & Chair' },
            { num: 4, title: 'Review' }
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2 sm:gap-3 transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                    : isDone
                    ? 'bg-slate-800/80 border-slate-700 text-emerald-400 cursor-pointer hover:bg-slate-800'
                    : 'bg-slate-900/40 border-slate-800 text-slate-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : isDone
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="hidden sm:inline font-medium">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-rose-200">Booking Notice</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              <span>Step 1: Choose Your Signature Service</span>
            </h2>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                        : 'bg-[#141C2E] border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
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
                        className={`w-6 h-6 rounded-full border flex items-center justify-center mt-2 ml-auto ${
                          isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (selectedService) setStep(2);
                else setError('Please select a service to proceed.');
              }}
              disabled={!selectedService}
              className="px-8 py-3 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 disabled:opacity-50"
            >
              <span>Continue to Date Selection</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Step 2: Choose Appointment Date</span>
            </h2>
          </div>

          <div className="p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl max-w-lg mx-auto space-y-6 text-xs">
            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block text-sm">
                Select Date for {selectedService?.name} ({selectedService?.duration_minutes} mins)
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400">
                Salon operating hours: Monday – Sunday, 09:00 AM – 08:00 PM
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Service:</span>
                <span className="font-semibold text-slate-200">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Duration:</span>
                <span className="font-semibold text-amber-300">{selectedService?.duration_minutes} minutes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-8 py-3 rounded-xl gold-btn font-bold text-xs flex items-center gap-2"
            >
              <span>Check Chair Availability</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT TIME SLOT & CHAIR */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Step 3: Select Available Time Slot & Station</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing live open slots on <strong className="text-amber-300">{selectedDate}</strong> for a {selectedService?.duration_minutes}-minute session.
              </p>
            </div>

            <button
              onClick={fetchAvailability}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Refresh Slots
            </button>
          </div>

          {loadingSlots ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <Armchair className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">No Open Slots on this Date</p>
              <p>All 4 chairs are fully booked for this service duration. Please select another date.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Slot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.start_time === slot.start_time;
                  return (
                    <button
                      key={slot.start_time}
                      disabled={!slot.available}
                      onClick={() => {
                        setSelectedSlot(slot);
                        // Default to first available chair
                        setSelectedChairId(slot.available_chairs[0]?.id || null);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        !slot.available
                          ? 'opacity-40 bg-slate-900/30 border-slate-800 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                          : 'bg-[#141C2E] border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-100 text-sm">{slot.start_time}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            slot.available
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {slot.available ? `${slot.available_chairs_count} Chairs Free` : 'Occupied'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Ends at {slot.end_time}</p>
                    </button>
                  );
                })}
              </div>

              {/* Station / Chair Selector for the Chosen Slot */}
              {selectedSlot && selectedSlot.available_chairs.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-4 animate-fade-in text-xs">
                  <h4 className="font-serif text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-amber-400" />
                    <span>Choose Styling Station for {selectedSlot.start_time}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSlot.available_chairs.map((chair) => (
                      <button
                        key={chair.id}
                        type="button"
                        onClick={() => setSelectedChairId(chair.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          selectedChairId === chair.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-amber-400 text-xs">
                            {chair.chair_number}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">Chair {chair.chair_number}</p>
                            <p className="text-[11px] text-slate-400">{chair.name}</p>
                          </div>
                        </div>
                        {selectedChairId === chair.id && <Check className="w-4 h-4 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (selectedSlot && selectedChairId) setStep(4);
                else setError('Please pick an available time slot and styling chair.');
              }}
              disabled={!selectedSlot || !selectedChairId}
              className="px-8 py-3 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 disabled:opacity-50"
            >
              <span>Review & Confirm</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              <span>Step 4: Review & Finalize Booking</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Booking Details Card (7 cols) */}
            <div className="lg:col-span-7 p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-6 text-xs">
              <h3 className="font-serif text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
                Appointment Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Selected Service:</span>
                  <span className="font-bold text-slate-100 text-sm">{selectedService?.name}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Category & Duration:</span>
                  <span className="font-medium text-slate-200">{selectedService?.category} • {selectedService?.duration_minutes} minutes</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Appointment Date:</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">{selectedDate}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Scheduled Time Slot:</span>
                  <span className="font-bold text-slate-100 font-mono text-sm">
                    {selectedSlot?.start_time} - {selectedSlot?.end_time}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Reserved Station:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    Chair {selectedSlot?.available_chairs.find(c => c.id === selectedChairId)?.chair_number || selectedChairId}
                  </span>
                </div>

                <div className="flex justify-between py-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-semibold text-sm">Total Service Price:</span>
                  <span className="font-serif font-bold text-amber-400 text-lg font-mono">
                    ₹{selectedService?.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Special Requests textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="text-slate-300 font-medium">Special Styling Notes / Requests (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Scissor cut on sides, sensitive scalp, honey blonde tones..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none text-xs"
                />
              </div>
            </div>

            {/* Confirmation Action & Policy Box (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs text-slate-400">
                <h4 className="font-bold text-slate-200 text-sm">Salon Booking Policies</h4>
                <ul className="space-y-2 list-disc list-inside leading-relaxed text-[11px]">
                  <li>Please arrive 5 minutes prior to your allocated slot.</li>
                  <li>In the event of a customer no-show, the station may be released to waiting clients.</li>
                  <li>Cancellations are accepted up to 2 hours before the session.</li>
                </ul>

                <button
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="w-full py-4 rounded-xl gold-btn font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-900/40 disabled:opacity-50 mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Confirming Station...' : 'Confirm Appointment'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Slot Selection</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
