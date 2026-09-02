import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { Services } from './pages/public/Services';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { BookAppointment } from './pages/customer/BookAppointment';
import { MyBookings } from './pages/customer/MyBookings';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { BookingManagement } from './pages/admin/BookingManagement';
import { ChairManagement } from './pages/admin/ChairManagement';
import { ServiceManagement } from './pages/admin/ServiceManagement';
import { SalonSettings } from './pages/admin/SalonSettings';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { SettingsProvider } from './context/SettingsContext';

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
        {/* Main Navbar */}
        <Navbar />

        {/* Main Routed Content */}
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/book"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']} requireApproved={true}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CustomerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BookingManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chairs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ChairManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ServiceManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SalonSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminNotifications />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </SettingsProvider>
  );
};

export default App;
