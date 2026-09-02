import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { 
  Building2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  Eye,
  Scissors
} from 'lucide-react';

export const SalonSettings: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();

  const [formData, setFormData] = useState({
    salon_name: '',
    tagline: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    hours_mon_fri: '',
    hours_sat: '',
    hours_sun: '',
    badge_text: '',
    guarantee_text: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        salon_name: settings.salon_name || 'LUXE',
        tagline: settings.tagline || 'Salon & Lounge',
        description: settings.description || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        hours_mon_fri: settings.hours_mon_fri || '09:00 AM - 08:00 PM',
        hours_sat: settings.hours_sat || '09:00 AM - 08:00 PM',
        hours_sun: settings.hours_sun || '10:00 AM - 06:00 PM',
        badge_text: settings.badge_text || 'Sanitized & Private 4-Station Layout',
        guarantee_text: settings.guarantee_text || 'Zero Wait Time Guarantee',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await updateSettings(formData);
    setSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Salon profile, hours, and footer details updated successfully!' });
      await refreshSettings();
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to update settings.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              Salon Info & Footer Settings
            </h1>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              Live Brand & Operating Controls
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize the salon branding, operating hours, physical address, and contact lines displayed across the footer and website.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-3 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30 self-start md:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Edit Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Brand Identity */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-4 text-xs">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Brand & Salon Identity</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Salon Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.salon_name}
                    onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Sub-Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Salon Story & Footer Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Station Layout Badge</label>
                  <input
                    type="text"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Service Guarantee Badge</label>
                  <input
                    type="text"
                    value={formData.guarantee_text}
                    onChange={(e) => setFormData({ ...formData, guarantee_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Operating Hours */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-4 text-xs">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Salon Operating Hours (Displayed in Footer & Schedule)</span>
              </h3>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">Monday – Friday:</span>
                  <input
                    type="text"
                    placeholder="09:00 AM - 08:00 PM"
                    value={formData.hours_mon_fri}
                    onChange={(e) => setFormData({ ...formData, hours_mon_fri: e.target.value })}
                    className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">Saturday:</span>
                  <input
                    type="text"
                    placeholder="09:00 AM - 08:00 PM"
                    value={formData.hours_sat}
                    onChange={(e) => setFormData({ ...formData, hours_sat: e.target.value })}
                    className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-right focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">Sunday:</span>
                  <input
                    type="text"
                    placeholder="10:00 AM - 06:00 PM"
                    value={formData.hours_sun}
                    onChange={(e) => setFormData({ ...formData, hours_sun: e.target.value })}
                    className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-right focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Location */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-4 text-xs">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>Location & Concierge Contact</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Suite, City, State"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Reception Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Concierge Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="concierge@luxesalon.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Eye className="w-4 h-4" />
                <span>Live Footer Preview (Real-Time)</span>
              </div>

              {/* Render Preview Box matching Footer */}
              <div className="p-6 rounded-3xl bg-[#090D16] border border-slate-700 shadow-2xl space-y-6 text-xs text-slate-400">
                
                {/* Brand */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-[#F5D396] p-0.5 flex items-center justify-center">
                      <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                        <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </div>
                    <span className="font-serif text-xl font-bold gold-gradient-text">
                      {formData.salon_name || 'LUXE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                    {formData.description || 'A premier 4-chair luxury salon offering personalized executive grooming...'}
                  </p>
                  <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{formData.badge_text || 'Sanitized & Private 4-Station Layout'}</span>
                  </p>
                </div>

                {/* Hours Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-serif font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Salon Hours</span>
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mon - Fri:</span>
                      <span className="text-amber-300 font-mono font-medium">{formData.hours_mon_fri}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Saturday:</span>
                      <span className="text-amber-300 font-mono font-medium">{formData.hours_sat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sunday:</span>
                      <span className="text-amber-300 font-mono font-medium">{formData.hours_sun}</span>
                    </div>
                  </div>
                </div>

                {/* Location & Contact Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-serif font-bold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Location & Contact</span>
                  </h4>
                  <div className="space-y-1.5 text-[11px]">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{formData.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{formData.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{formData.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formData.guarantee_text}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                  © {new Date().getFullYear()} {formData.salon_name || 'LUXE'} Salon & Chair Management System.
                </div>

              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl gold-btn font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-900/40 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating Salon Info...' : 'Save All Settings'}</span>
              </button>
            </div>
          </div>

        </div>
      </form>

    </div>
  );
};
