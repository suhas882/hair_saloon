import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  isAdmin: boolean;
  isCustomer: boolean;
  isApproved: boolean;
  isPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('salon_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('salon_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch live user info on initial load
  const refreshUser = useCallback(async (): Promise<User | null> => {
    const savedToken = localStorage.getItem('salon_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('salon_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch (err) {
      console.error('Failed to restore session:', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('salon_token');
      localStorage.removeItem('salon_user');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, token: authToken, message } = response.data;

      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('salon_token', authToken);
      localStorage.setItem('salon_user', JSON.stringify(loggedInUser));

      return { success: true, message, user: loggedInUser };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, phone, password });
      const { user: newUser, token: authToken, message } = response.data;

      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('salon_token', authToken);
      localStorage.setItem('salon_user', JSON.stringify(newUser));

      return { success: true, message, user: newUser };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('salon_token');
    localStorage.removeItem('salon_user');
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  const isApproved = user?.approval_status === 'approved' || isAdmin;
  const isPending = user?.role === 'customer' && user?.approval_status === 'pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isCustomer,
        isApproved,
        isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
