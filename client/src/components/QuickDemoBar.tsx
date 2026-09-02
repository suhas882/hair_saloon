import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Clock, Sparkles, XCircle, LogOut } from 'lucide-react';

export const QuickDemoBar: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'Admin',
      name: 'Salon Director',
      email: 'admin@salon.com',
      password: 'Admin@123',
      icon: Shield,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
      badge: '👑 Admin Full Access',
      dest: '/admin/dashboard'
    },
    {
      role: 'Approved',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'Customer@123',
      icon: CheckCircle,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
      badge: '✅ Approved Customer',
      dest: '/customer/dashboard'
    },
    {
      role: 'Pending',
      name: 'Ananya Roy',
      email: 'ananya@example.com',
      password: 'Customer@123',
      icon: Clock,
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30',
      badge: '⏳ Pending Approval',
      dest: '/customer/dashboard'
    },
    {
      role: 'Rejected',
      name: 'Dev Mehta',
      email: 'dev@example.com',
      password: 'Customer@123',
      icon: XCircle,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30',
      badge: '❌ Rejected Account',
      dest: '/customer/dashboard'
    }
  ];

  const handleQuickLogin = async (acc: typeof demoAccounts[0]) => {
    setLoadingEmail(acc.email);
    const res = await login(acc.email, acc.password);
    setLoadingEmail(null);
    if (res.success) {
      navigate(acc.dest);
    }
  };

  return (
    <div className="w-full bg-[#0D1322] border-b border-slate-800 text-xs py-2 px-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-slate-300 hidden sm:inline">1-Click Quick Demo Login:</span>
          <span className="font-semibold text-slate-300 sm:hidden">Demo:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isCurrent = user?.email === acc.email;
            return (
              <button
                key={acc.email}
                onClick={() => handleQuickLogin(acc)}
                disabled={loadingEmail !== null}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-150 ${
                  isCurrent ? 'ring-2 ring-amber-400 font-bold ' + acc.color : acc.color
                }`}
                title={`Login as ${acc.name} (${acc.email})`}
              >
                <Icon className="w-3 h-3" />
                <span>{acc.name.split(' ')[0]} ({acc.role})</span>
              </button>
            );
          })}

          {user && (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
