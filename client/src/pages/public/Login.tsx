import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Scissors, Lock, Mail, Eye, EyeOff, Shield, CheckCircle, Clock, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#F5D396] p-0.5 mx-auto shadow-glow-gold flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Scissors className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to access your salon appointments & station records</p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gold-btn font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* 1-Click Quick Demo Accounts Selector */}
          <div className="border-t border-slate-800 pt-5 space-y-2.5">
            <p className="text-[11px] text-slate-400 font-semibold text-center uppercase tracking-wider">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@salon.com', 'Admin@123')}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-2 transition-colors text-left font-medium"
              >
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Admin (Director)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('rahul@example.com', 'Customer@123')}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 transition-colors text-left font-medium"
              >
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Rahul (Approved)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('ananya@example.com', 'Customer@123')}
                className="p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 flex items-center gap-2 transition-colors text-left font-medium"
              >
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Ananya (Pending)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('dev@example.com', 'Customer@123')}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-2 transition-colors text-left font-medium"
              >
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Dev (Rejected)</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-semibold underline">
              Register Here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
