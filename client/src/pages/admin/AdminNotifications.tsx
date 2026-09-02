import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SalonNotification } from '../../types';
import { Bell, CheckCheck, Clock, ExternalLink, RefreshCw, Sparkles, Filter } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<SalonNotification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number, link?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (unreadOnly) return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-slate-100">
              Salon Event Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time audit log of customer registrations, bookings, cancellations, and station events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-amber-400" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141C2E] border border-slate-700/60 shadow-xl text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              !unreadOnly
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Events ({notifications.length})
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              unreadOnly
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl overflow-hidden divide-y divide-slate-800/80">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-600 opacity-40" />
            <p className="font-bold text-slate-300">No Notifications to Display</p>
            <p>Your notification tray is completely clear.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkAsRead(n.id, n.link)}
              className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer text-xs ${
                n.is_read ? 'bg-transparent hover:bg-slate-800/40 opacity-70' : 'bg-amber-500/5 hover:bg-amber-500/10'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    n.is_read ? 'bg-slate-700' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">{n.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase font-mono">
                      {n.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed max-w-2xl">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-500 flex-shrink-0">
                <span className="text-[11px] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(n.created_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {n.link && <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400" />}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
