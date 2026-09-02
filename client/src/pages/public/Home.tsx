import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  HeartHandshake
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chairsRes, servicesRes] = await Promise.all([
          api.get('/chairs'),
          api.get('/services')
        ]);
        setChairs(chairsRes.data.chairs || []);
        setServices(servicesRes.data.services || []);
      } catch (err) {
        console.error('Failed to load home page preview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background glow spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Boutique 4-Chair Luxury Hair Experience</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
                Master Craftsmanship. <br />
                <span className="gold-gradient-text">Zero Wait Time.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Welcome to LUXE, where bespoke hair artistry meets intelligent chair management. With only 4 private stations, every appointment guarantees undivided stylist attention, tailored consultations, and pristine comfort.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/customer/book') : '/register'}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl gold-btn text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-900/30 group"
                >
                  <Calendar className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                  <span>{user ? (user.role === 'admin' ? 'Open Command Center' : 'Book An Appointment') : 'Register & Book Session'}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/services"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-base font-semibold transition-all hover:border-amber-500/50 flex items-center justify-center gap-2"
                >
                  <Scissors className="w-5 h-5 text-amber-400" />
                  <span>Explore 8 Services</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left">
                <div>
                  <p className="font-serif text-2xl font-bold text-amber-400">4 Chairs</p>
                  <p className="text-xs text-slate-400">Dedicated private bays</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-amber-400">100%</p>
                  <p className="text-xs text-slate-400">Gated client approvals</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-amber-400">4.9 ★</p>
                  <p className="text-xs text-slate-400">Over 500+ Reviews</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
                  alt="Luxury Salon Interior"
                  className="w-full h-[460px] object-cover object-center opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />

                {/* Floating Card: 4-Chair Live Status pill */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#141C2E]/90 backdrop-blur-md border border-slate-700/80 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold">
                      <Armchair className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">Live Station Allocation</p>
                      <p className="text-[11px] text-emerald-400 font-medium">4 Active Physical Chairs</p>
                    </div>
                  </div>
                  <Link
                    to="/services"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                  >
                    View Slots
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE 4-CHAIR PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <Armchair className="w-4 h-4" />
            <span>Salon Station Grid</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Real-Time 4-Chair Status
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Our proprietary chair management engine guarantees that double-bookings never occur and stations are sanitized between appointments.
          </p>
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
              <ChairVisualCard key={chair.id} chair={chair} isAdmin={false} />
            ))}
          </div>
        )}
      </section>

      {/* 3. SIGNATURE SERVICES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
              <Scissors className="w-4 h-4" />
              <span>Curated Menu</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Signature Salon Services
            </h2>
            <p className="text-sm text-slate-400 max-w-lg">
              Explore our master stylist packages with transparent durations and upfront pricing.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold text-sm group"
          >
            <span>View All 8 Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 6).map((service) => (
            <div
              key={service.id}
              className="group rounded-2xl bg-[#141C2E] border border-slate-700/60 overflow-hidden shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image_url || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-400 font-serif font-bold text-sm">
                  ₹{service.price.toLocaleString('en-IN')}
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{service.duration_minutes} mins</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    {service.category || 'Styling'}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-1">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <Link
                  to={user ? '/customer/book' : '/register'}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book This Service</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SALON PHILOSOPHY & WHY 4 CHAIRS */}
      <section className="bg-gradient-to-b from-[#0E1524] to-[#090D16] py-20 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                <Award className="w-4 h-4" />
                <span>The 4-Chair Advantage</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 leading-snug">
                Why We Limit Our Salon to Exactly <span className="gold-gradient-text">4 Physical Chairs</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional high-volume salons pack dozens of chairs into a noisy room, leading to rushed haircuts, waiting queues, and distracted stylists. LUXE was architected from day one on a boutique 4-chair model:
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Guaranteed Dedicated Time</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Your stylist works only on you for the full duration of your service slot.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Pristine Hygiene & Sanitation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Every chair is thoroughly sterilized and reset between clients.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Vetted Customer Community</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Administrator approvals ensure a courteous, relaxed, and premium environment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Testimonial Card */}
            <div className="p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl relative">
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <p className="font-serif text-lg text-slate-200 italic leading-relaxed mb-6">
                "The 4-chair layout is brilliant. You walk in, your chair is ready, no waiting in awkward lobby queues, and the balayage treatment was perfection. Worth every single dollar."
              </p>
              <div className="flex items-center gap-4 border-t border-slate-800 pt-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 font-serif font-bold text-slate-950 flex items-center justify-center text-lg">
                  P
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Priya Patel</h4>
                  <p className="text-xs text-slate-400">Regular Client since 2024 • Chair 3</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#182032] via-[#141C2E] to-[#182032] border border-amber-500/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Ready to Experience the <span className="gold-gradient-text">LUXE Standard</span>?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Register your account today. Upon quick administrator approval, you will have instant access to real-time slot bookings across our 4 master styling stations.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl gold-btn font-bold text-sm"
              >
                Create Customer Account
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors"
              >
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
