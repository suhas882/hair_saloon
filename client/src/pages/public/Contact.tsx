import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Contact: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterest: 'Haircut & Styling',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Concierge Desk</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-100">
          Get in Touch with <span className="gold-gradient-text">{settings.salon_name || 'LUXE'}</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Have inquiries regarding custom hair treatments, bridal reservations, or customer account approvals? Our front desk concierge is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Information & Hours (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-6">
            <h3 className="font-serif text-xl font-bold text-slate-100">Salon Headquarters</h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Address</p>
                  <p className="text-slate-400 mt-0.5">{settings.address || '450 Prestige Avenue, Grand Boulevard, Suite 101'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Phone</p>
                  <p className="text-slate-400 mt-0.5">{settings.phone || '+91 98765 43210'}</p>
                  <p className="text-[11px] text-emerald-400 font-mono">Dedicated Reception Line</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Email</p>
                  <p className="text-slate-400 mt-0.5">{settings.email || 'concierge@luxesalon.com'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 space-y-3">
              <h4 className="font-serif text-slate-100 font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Operating Hours (4 Stations)</span>
              </h4>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Mon - Fri:</span>
                  <span className="text-amber-300 font-mono">{settings.hours_mon_fri || '09:00 AM - 08:00 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="text-amber-300 font-mono">{settings.hours_sat || '09:00 AM - 08:00 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="text-amber-300 font-mono">{settings.hours_sun || '10:00 AM - 06:00 PM'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Inquiry Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-100">Message Dispatched</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-amber-400 font-semibold">{formData.name}</span>. Our concierge team has received your message and will respond within 2 business hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', serviceInterest: 'Haircut & Styling', message: '' });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                <h3 className="font-serif text-xl font-bold text-slate-100 mb-2">Send an Inquiry</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Rigby"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eleanor@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Service Interest</label>
                    <select
                      value={formData.serviceInterest}
                      onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="Haircut & Styling">Signature Haircut & Styling</option>
                      <option value="Balayage & Color">Balayage & Hair Glossing</option>
                      <option value="Keratin Therapy">Keratin Smoothing Therapy</option>
                      <option value="Beard & Razor Shave">Luxury Beard & Hot Towel</option>
                      <option value="Head Spa & Facial">Head Spa & Facial Detox</option>
                      <option value="General Question">General Inquiry / Membership</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Message Details *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your requirements or preferred timeframes..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl gold-btn font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Message to Concierge</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
