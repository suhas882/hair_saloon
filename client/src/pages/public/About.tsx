import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Armchair, ShieldCheck, Award, Sparkles, CheckCircle2, Clock, Users } from 'lucide-react';

export const About: React.FC = () => {
  const stylists = [
    {
      name: 'Julian Vance',
      role: 'Master Creative Director & Color Specialist',
      experience: '14+ Years Experience',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
      chair: 'Station 1 & 3 Lead'
    },
    {
      name: 'Marcus Thorne',
      role: 'Senior Barber & Razor Sculptor',
      experience: '11+ Years Experience',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
      chair: 'Station 2 Lead'
    },
    {
      name: 'Elena Rostova',
      role: 'Keratin & Restorative Spa Specialist',
      experience: '9+ Years Experience',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
      chair: 'Station 4 VIP Suite Lead'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">
      
      {/* 1. Header Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The LUXE Philosophy</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100 leading-tight">
            Crafting Elegance Through <br />
            <span className="gold-gradient-text">Precision & Exclusivity</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Founded with the conviction that hair styling should be a peaceful, unhurried sensory experience, LUXE disrupted the crowded commercial salon format by deliberately limiting our physical floor to just 4 bespoke chairs.
          </p>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            By operating an approval-gated client community and strict duration-backed scheduling, our master stylists are liberated from time crunches—allowing them to execute haircuts, color transitions, and scalp therapies with unrivaled perfection.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 relative">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
              alt="Salon Craftsmanship"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#141C2E]/90 backdrop-blur-md border border-slate-700 text-xs">
              <p className="font-bold text-slate-100">Boutique 4-Chair Layout</p>
              <p className="text-slate-400">Zero congestion • 100% Focused Master Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Chair Architecture */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <Armchair className="w-4 h-4" />
            <span>Design Standards</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-100">
            Our 4 Dedicated Stations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Each physical chair is custom-engineered with ergonomic memory cushioning, hydraulic height precision, and dedicated sterilization stations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-serif text-sm">
              01
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Master Styling Bay</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped for precision shear haircuts, texture layering, and executive finishes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-serif text-sm">
              02
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Precision Cut Station</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional barber setup with hot towel steam, lather machines, and razor strops.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-serif text-sm">
              03
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Color & Spa Suite</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized lighting for Balayage color formulation, highlights, and glossing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-serif text-sm">
              04
            </div>
            <h4 className="font-bold text-slate-100 text-sm">VIP Lounge Station</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Private partition suite for bridal styling, head spa treatments, and gala updos.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Master Stylists */}
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <Users className="w-4 h-4" />
            <span>The Artisans</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-100">
            Meet Our Senior Stylists
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Certified internationally with decades of combined experience across London, Paris, and Milan fashion weeks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stylists.map((st) => (
            <div
              key={st.name}
              className="rounded-2xl bg-[#141C2E] border border-slate-700/60 overflow-hidden shadow-xl group hover:border-amber-500/40 transition-all"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={st.image}
                  alt={st.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-400 text-[11px] font-medium">
                  {st.experience}
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-serif text-lg font-bold text-slate-100">{st.name}</h3>
                <p className="text-xs text-amber-400 font-medium">{st.role}</p>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">{st.chair}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CTA */}
      <div className="text-center py-8">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gold-btn font-bold text-sm shadow-xl"
        >
          <Scissors className="w-4 h-4" />
          <span>Apply For Client Membership</span>
        </Link>
      </div>

    </div>
  );
};
