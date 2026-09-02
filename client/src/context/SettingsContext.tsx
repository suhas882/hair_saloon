import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { SalonSettings } from '../types';

interface SettingsContextType {
  settings: SalonSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SalonSettings>) => Promise<{ success: boolean; message?: string }>;
}

const defaultSettings: SalonSettings = {
  salon_name: 'LUXE',
  tagline: 'Salon & Lounge',
  description: 'A premier 4-chair luxury salon offering personalized executive grooming, bespoke hair styling, balayage coloring, and restorative head spa treatments in an ambiance of refined sophistication.',
  address: '450 Prestige Avenue, Grand Boulevard, Suite 101',
  phone: '+91 98765 43210',
  email: 'concierge@luxesalon.com',
  hours_mon_fri: '09:00 AM - 08:00 PM',
  hours_sat: '09:00 AM - 08:00 PM',
  hours_sun: '10:00 AM - 06:00 PM',
  badge_text: 'Sanitized & Private 4-Station Layout',
  guarantee_text: 'Zero Wait Time Guarantee',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SalonSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error('Failed to load salon settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (newSettings: Partial<SalonSettings>) => {
    try {
      const res = await api.put('/settings', newSettings);
      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
      return { success: true, message: res.data?.message || 'Settings updated successfully!' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update salon settings.';
      return { success: false, message: msg };
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
