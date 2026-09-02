import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { NotificationDropdown } from './NotificationDropdown';
import { StatusBadge } from './StatusBadge';
import { 
  Scissors, 
  Menu, 
  X, 
  User, 
  Calendar, 
  LayoutDashboard, 
  Users, 
  Armchair, 
  Bell, 
  LogOut, 
  Sparkles,
  ChevronDown,
  Building2,
  Sliders
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0E1524]/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5D396] p-0.5 shadow-glow-gold flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-amber-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider gold-gradient-text">
                {settings.salon_name || 'LUXE'}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 block -mt-1 uppercase">
                {settings.tagline || 'Salon & Lounge'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Public Links */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/services') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Services
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/contact') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Contact
            </Link>

            {/* Customer Role Links */}
            {isCustomer && (
              <>
                <div className="h-5 w-[1px] bg-slate-800 mx-2" />
                <Link
                  to="/customer/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/customer/dashboard') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/customer/book"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/customer/book') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </Link>
                <Link
                  to="/customer/bookings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/customer/bookings') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  My Bookings
                </Link>
              </>
            )}

            {/* Admin Role Links */}
            {isAdmin && (
              <>
                <div className="h-5 w-[1px] bg-slate-800 mx-2" />
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/dashboard') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Command Center</span>
                </Link>
                <Link
                  to="/admin/chairs"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/chairs') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Armchair className="w-4 h-4" />
                  <span>4 Chairs</span>
                </Link>
                <Link
                  to="/admin/bookings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/bookings') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Bookings</span>
                </Link>
                <Link
                  to="/admin/customers"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/customers') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Customers</span>
                </Link>
                <Link
                  to="/admin/services"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/services') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  Services
                </Link>
                <Link
                  to="/admin/settings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/settings') ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Salon Info</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Action Menu: Notification + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <NotificationDropdown />

                {/* User Status pill for Customer */}
                {isCustomer && (
                  <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
                    <StatusBadge status={user.approval_status} size="sm" />
                  </div>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="max-w-[120px]">
                      <p className="text-xs font-semibold text-slate-100 truncate">{user.name}</p>
                      <p className="text-[10px] text-amber-400 uppercase tracking-wider font-mono">{user.role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-30 space-y-1 text-xs animate-fade-in">
                        <div className="p-2.5 border-b border-slate-800">
                          <p className="font-semibold text-slate-200">{user.name}</p>
                          <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                        </div>

                        {isCustomer && (
                          <>
                            <Link
                              to="/customer/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to="/customer/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <User className="w-3.5 h-3.5 text-amber-400" />
                              <span>My Profile</span>
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                              <span>Admin Dashboard</span>
                            </Link>
                            <Link
                              to="/admin/settings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Building2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Salon Info & Settings</span>
                            </Link>
                            <Link
                              to="/admin/notifications"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Bell className="w-3.5 h-3.5 text-amber-400" />
                              <span>Notifications</span>
                            </Link>
                          </>
                        )}

                        <div className="border-t border-slate-800 my-1" />
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl gold-btn flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101726] border-b border-slate-800 p-4 space-y-3 animate-fade-in text-sm">
          {user && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <StatusBadge status={user.role === 'admin' ? 'admin' : user.approval_status} size="sm" />
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Services
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Contact
            </Link>

            {isCustomer && (
              <>
                <div className="border-t border-slate-800 my-2 pt-2 text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  Customer Portal
                </div>
                <Link
                  to="/customer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/customer/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  My Bookings
                </Link>
                <Link
                  to="/customer/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Profile
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <div className="border-t border-slate-800 my-2 pt-2 text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  Admin Command
                </div>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Dashboard & 4 Chairs
                </Link>
                <Link
                  to="/admin/chairs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Chair Management
                </Link>
                <Link
                  to="/admin/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Booking Management
                </Link>
                <Link
                  to="/admin/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Services Catalog
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-amber-400 font-semibold hover:bg-slate-800"
                >
                  Salon Info & Footer Settings
                </Link>
                <Link
                  to="/admin/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Notifications Log
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 px-4 bg-rose-950/40 text-rose-300 border border-rose-800/40 rounded-xl font-medium"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center bg-slate-800 text-slate-200 rounded-xl font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center gold-btn rounded-xl font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
