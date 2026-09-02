import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#090D16] border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5D396] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <span className="font-serif text-2xl font-bold gold-gradient-text">{settings.salon_name || 'LUXE'}</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              {settings.description || 'A premier 4-chair luxury salon offering personalized executive grooming, bespoke hair styling, balayage coloring, and restorative head spa treatments.'}
            </p>
            {settings.badge_text && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>{settings.badge_text}</span>
              </div>
            )}
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="font-serif text-slate-100 font-bold text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Salon Hours</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Monday - Friday</span>
                <span className="text-amber-300 font-mono font-medium">{settings.hours_mon_fri || '09:00 AM - 08:00 PM'}</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Saturday</span>
                <span className="text-amber-300 font-mono font-medium">{settings.hours_sat || '09:00 AM - 08:00 PM'}</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">Sunday</span>
                <span className="text-amber-300 font-mono font-medium">{settings.hours_sun || '10:00 AM - 06:00 PM'}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-slate-100 font-bold text-base">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/services" className="hover:text-amber-400 transition-colors">Signature Services Catalog</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">Our Master Stylists & Heritage</Link>
              </li>
              <li>
                <Link to="/customer/book" className="hover:text-amber-400 transition-colors">Book Online Appointment</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">Location & Contact Details</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">Staff & Customer Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-slate-100 font-bold text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Salon Location</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{settings.address || '450 Prestige Avenue, Grand Boulevard, Suite 101'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings.email || 'concierge@luxesalon.com'}</span>
              </p>
              {settings.guarantee_text && (
                <p className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{settings.guarantee_text}</span>
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.salon_name || 'LUXE'} Hair Salon & Chair Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Customer Approval Gated Booking</span>
            <span>•</span>
            <span>Real-Time 4-Chair Allocation Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

