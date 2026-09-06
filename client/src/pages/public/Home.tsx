import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Chair, Service } from '../../types';
import { ChairVisualCard } from '../../components/ChairVisualCard';
import { 
  Scissors, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Armchair, 
  Clock, 
  Star, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  HeartHandshake,
  Zap,
  LayoutDashboard,
  Shield,
  Tag
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      const [chairsRes, servicesRes] = await Promise.all([
        api.get('/chairs'),
        api.get('/services')
      ]);
      setChairs(chairsRes.data.chairs || []);
      setServices(servicesRes.data.services || []);
    } catch (err) {
      console.error('Failed to load home page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleQuickBookChair = (chairId: number) => {
    if (user) {
      navigate(`/customer/book?chairId=${chairId}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Background glow spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Boutique 4-Chair Luxury Hair Salon</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
                Master Craftsmanship. <br />
                <span className="gold-gradient-text">Zero Wait Time.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Welcome to LUXE, where bespoke hair artistry meets intelligent chair management. With only 4 private stations, every appointment guarantees undivided stylist attention, tailored consultations, and pristine comfort.
              </p>

              {/* Quick CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to={user ? (isAdmin ? '/admin/dashboard' : '/customer/book') : '/register'}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl gold-btn text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-900/30 group"
                >
                  <Zap className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                  <span>{user ? (isAdmin ? 'Open Saloon Dashboard' : 'Quick Book Slot (1-Click)') : 'Register & Direct Book'}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/services"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-all hover:border-amber-500/50 flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>Explore Services</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
                <div>
                  <p className="font-serif text-2xl font-bold text-amber-400">4 Chairs</p>
                  <p className="text-xs text-slate-400">Dedicated private bays</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-amber-400">Direct</p>
                  <p className="text-xs text-slate-400">1-Click Quick Booking</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-amber-400">4.9 ★</p>
                  <p className="text-xs text-slate-400">Over 500+ Reviews</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
                  alt="Luxury Salon Interior"
                  className="w-full h-[420px] object-cover object-center opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#141C2E]/90 backdrop-blur-md border border-slate-700/80 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold">
                      <Armchair className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">Live Station Allocation</p>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        {chairs.filter(c => c.status === 'available').length} of 4 Available • {chairs.filter(c => c.status === 'booked' || c.status === 'occupied').length} Booked/In-Use
                      </p>
                    </div>
                  </div>
                  <Link
                    to={user ? '/customer/book' : '/register'}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors"
                  >
                    Quick Book
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. QUICK SELECTABLE OPTIONS BAR (Display all fast options) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111827] via-[#141C2E] to-[#111827] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-base">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Quick Selectable Navigation</span>
            </div>
            <span className="text-[11px] text-slate-400">1-Click Direct Access</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Link
              to={user ? '/customer/book' : '/register'}
              className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-6 h-6 text-amber-400" />
              <div>
                <p className="font-bold text-amber-200">1-Click Quick Book</p>
                <p className="text-[10px] text-slate-400">Instant slot without date/time prompt</p>
              </div>
            </Link>

            <Link
              to="/services"
              className="p-4 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Scissors className="w-6 h-6 text-amber-400" />
              <div>
                <p className="font-bold text-slate-100">Hair Cut & Shave Menu</p>
                <p className="text-[10px] text-slate-400">Default & category services</p>
              </div>
            </Link>

            <Link
              to={user ? '/customer/bookings' : '/login'}
              className="p-4 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Calendar className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-bold text-slate-100">My Appointments</p>
                <p className="text-[10px] text-slate-400">Live booking status & receipts</p>
              </div>
            </Link>

            <Link
              to={isAdmin ? '/admin/dashboard' : (user ? '/customer/dashboard' : '/login')}
              className="p-4 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02]"
            >
              <LayoutDashboard className="w-6 h-6 text-purple-400" />
              <div>
                <p className="font-bold text-slate-100">{isAdmin ? 'Saloon Dashboard' : 'Client Dashboard'}</p>
                <p className="text-[10px] text-slate-400">{isAdmin ? 'Station control & schedule' : 'Your personal portal'}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. LIVE 4-CHAIR PREVIEW SECTION (With 3-dots on top right) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
              <Armchair className="w-4 h-4" />
              <span>Salon Station Grid</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 mt-1">
              Real-Time 4-Chair Status
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Click the <strong className="text-amber-300">3 dots (⋮)</strong> on any chair to book or manage that specific station.
            </p>
          </div>

          <Link
            to={user ? '/customer/book' : '/register'}
            className="px-5 py-2.5 rounded-xl gold-btn text-xs font-bold self-start sm:self-auto"
          >
            Direct Quick Book
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chairs.map(chair => (
              <ChairVisualCard 
                key={chair.id} 
                chair={chair} 
                isAdmin={isAdmin}
                onQuickBookChair={handleQuickBookChair}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. SIGNATURE SERVICES (Managed dynamically by Admin) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
              <Scissors className="w-4 h-4" />
              <span>Menu</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Salon Services Menu
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Featuring our signature <strong className="text-amber-300">Hair Cut & Shave</strong> and specialty salon packages.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold text-xs group"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
            <Scissors className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-bold text-slate-300">No Services Added Yet</p>
            <p>Admin will be adding services from the Saloon Dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="group rounded-2xl bg-[#141C2E] border border-slate-700/60 overflow-hidden shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.image_url || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-400 font-serif font-bold text-xs">
                    ₹{service.price.toLocaleString('en-IN')}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{service.duration_minutes} mins</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-2 py-0.5 rounded bg-slate-900">
                      {service.category || 'Styling'}
                    </span>
                    <h3 className="font-serif text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-2">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <Link
                    to={user ? `/customer/book?serviceId=${service.id}` : '/register'}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Book Service</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. SALON PHILOSOPHY & WHY 4 CHAIRS */}
      <section className="bg-gradient-to-b from-[#0E1524] to-[#090D16] py-16 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                <Award className="w-4 h-4" />
                <span>The 4-Chair Advantage</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 leading-snug">
                Private Luxury with <span className="gold-gradient-text">4 Dedicated Chairs</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional crowded salons rush clients through noise and delays. LUXE offers a private 4-chair layout for zero wait time, personalized attention, and sterilized stations.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Guaranteed Dedicated Attention</h4>
                    <p className="text-[11px] text-slate-400">Stylist focuses only on your session for the full duration.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Station Sterilization & Reset</h4>
                    <p className="text-[11px] text-slate-400">Every chair is sanitized between clients.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="font-serif text-base text-slate-200 italic leading-relaxed">
                "Direct quick booking is so smooth. You choose Hair Cut & Shave, click book, walk in, and your station is ready without waiting."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 font-serif font-bold text-slate-950 flex items-center justify-center text-base">
                  R
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Rahul Sharma</h4>
                  <p className="text-[10px] text-slate-400">Verified Client • Chair 1</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
