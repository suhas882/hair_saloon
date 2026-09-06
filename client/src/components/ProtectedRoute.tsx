import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'customer')[];
  requireApproved?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireApproved = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090D16] text-amber-400">
        <Sparkles className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">Securing Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/customer/dashboard" replace />;
    }
  }

  // Check approval status gating only if explicitly suspended/rejected
  if (requireApproved && user.role === 'customer' && (user.approval_status === 'rejected' || user.approval_status === 'suspended')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-[#141C2E] border border-amber-500/30 shadow-2xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-100 mb-2">
            Account Status Notice
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {user.approval_status === 'rejected'
              ? 'Your account registration was not approved by salon management. Please contact our reception for details.'
              : 'Your booking privileges have been suspended. Please contact front desk.'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
