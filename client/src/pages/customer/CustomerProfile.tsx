import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { User, Mail, Phone, Lock, Save, CheckCircle2, AlertCircle, ShieldCheck, Clock } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/profile', {
        name,
        phone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });

      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="font-serif text-3xl font-bold text-slate-100">
          Client Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your contact credentials, authentication password, and check your membership status.
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Profile Card & Approval Status Info (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 font-serif font-bold text-slate-950 text-2xl flex items-center justify-center mx-auto shadow-glow-gold">
              {user?.name.charAt(0)}
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-slate-100">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col items-center gap-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Account Status</span>
              <StatusBadge status={user?.approval_status || 'pending'} size="md" />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
              {user?.approval_status === 'approved'
                ? 'Your account is in good standing with full 4-station booking privileges.'
                : 'Your account is awaiting review or requires attention from management.'}
            </p>
          </div>
        </div>

        {/* Update Form (8 cols) */}
        <div className="md:col-span-8 p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <h3 className="font-serif text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
              Personal Information
            </h3>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Email Address (Immutable)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <h3 className="font-serif text-lg font-bold text-slate-100 border-b border-slate-800 pb-3 pt-4">
              Change Security Password
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Current Password (Required to change password)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl gold-btn font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/30 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
