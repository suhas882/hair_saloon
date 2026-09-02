import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Chair, ChairStatus } from '../../types';
import { ChairVisualCard } from '../../components/ChairVisualCard';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Armchair, 
  Lock, 
  Unlock, 
  RefreshCw, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  Clock, 
  User, 
  Scissors, 
  Sparkles,
  Settings2
} from 'lucide-react';

export const ChairManagement: React.FC = () => {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchChairs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/chairs');
      setChairs(res.data.chairs || []);
    } catch (err) {
      console.error('Failed to load chairs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChairs();
  }, [fetchChairs]);

  const handleBlockChair = async (chairId: number) => {
    const reason = prompt('Enter reason for blocking this chair (e.g. sanitation, repair, staff break):', 'Deep Sanitation & Tool Maintenance');
    if (!reason) return;

    try {
      const res = await api.post(`/chairs/${chairId}/block`, { reason });
      setMessage({ type: 'success', text: res.data.message });
      fetchChairs();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to block chair.' });
    }
  };

  const handleUnblockChair = async (chairId: number) => {
    try {
      const res = await api.post(`/chairs/${chairId}/unblock`);
      setMessage({ type: 'success', text: res.data.message });
      fetchChairs();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to unblock chair.' });
    }
  };

  const handleStatusOverride = async (chairId: number, status: string) => {
    try {
      const res = await api.put(`/chairs/${chairId}/status`, { status });
      setMessage({ type: 'success', text: res.data.message });
      fetchChairs();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update chair status.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
              4 Salon Chairs Management
            </h1>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              Hardware Station Controls
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor and control physical chair states (Available, Booked, Occupied, Blocked, No-Show) and sanitation lockouts.
          </p>
        </div>

        <button
          onClick={fetchChairs}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
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

      {/* Visual Live Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {chairs.map((chair) => (
          <ChairVisualCard
            key={chair.id}
            chair={chair}
            isAdmin={true}
            onBlock={handleBlockChair}
            onUnblock={handleUnblockChair}
          />
        ))}
      </div>

      {/* Detailed Station Table with Controls */}
      <div className="rounded-3xl bg-[#141C2E] border border-slate-700/80 shadow-2xl overflow-hidden space-y-4 p-6 sm:p-8">
        <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-amber-400" />
          <span>Physical Station Operations & Status Overrides</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-4 px-4 font-semibold">Station ID</th>
                <th className="py-4 px-4 font-semibold">Station Name</th>
                <th className="py-4 px-4 font-semibold">Current State</th>
                <th className="py-4 px-4 font-semibold">Active Booking</th>
                <th className="py-4 px-4 font-semibold">Block / Lockout</th>
                <th className="py-4 px-4 font-semibold text-right">Status Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {chairs.map((chair) => (
                <tr key={chair.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-amber-400">
                    Chair {chair.chair_number}
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-200">{chair.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {chair.today_bookings_count} appointment{chair.today_bookings_count !== 1 ? 's' : ''} scheduled today
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <StatusBadge status={chair.status} size="sm" />
                  </td>

                  <td className="py-4 px-4">
                    {chair.current_booking ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200 flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-400" />
                          <span>{chair.current_booking.customer_name}</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {chair.current_booking.service_name} ({chair.current_booking.start_time} - {chair.current_booking.end_time})
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">No active customer</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    {chair.is_blocked ? (
                      <button
                        onClick={() => handleUnblockChair(chair.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-600/40 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unblock Station</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockChair(chair.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-600/40 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Block Station</span>
                      </button>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <select
                      value={chair.status}
                      onChange={(e) => handleStatusOverride(chair.id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="occupied">Occupied</option>
                      <option value="blocked">Blocked</option>
                      <option value="no_show">No-Show</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
