import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Service } from '../../types';
import { 
  Scissors, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Power, 
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '45',
    category: 'Haircut',
    image_url: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/services?all=true');
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '499.00',
      duration_minutes: '45',
      category: 'Haircut',
      image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    setFormData({
      name: srv.name,
      description: srv.description || '',
      price: srv.price.toString(),
      duration_minutes: srv.duration_minutes.toString(),
      category: srv.category || 'Styling',
      image_url: srv.image_url || '',
      is_active: srv.is_active === 1
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (id: number) => {
    try {
      const res = await api.put(`/services/${id}/toggle`);
      setMessage({ type: 'success', text: res.data.message });
      fetchServices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to toggle service status.' });
    }
  };

  const handleDeleteService = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove or deactivate "${name}"?`)) return;

    try {
      const res = await api.delete(`/services/${id}`);
      setMessage({ type: 'success', text: res.data.message });
      fetchServices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete service.' });
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes, 10),
        category: formData.category,
        image_url: formData.image_url,
        is_active: formData.is_active ? 1 : 0
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, payload);
        setMessage({ type: 'success', text: 'Service updated successfully!' });
      } else {
        await api.post('/services', payload);
        setMessage({ type: 'success', text: 'New service created successfully!' });
      }

      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save service.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
            Salon Services Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, update, set pricing, adjust appointment durations, and manage active customer booking availability.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-xl gold-btn font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
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

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                s.is_active
                  ? 'bg-[#141C2E] border-slate-700/80 shadow-xl'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-2 py-0.5 rounded bg-slate-900">
                      {s.category || 'Styling'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        s.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <span className="font-serif font-bold text-amber-400 text-lg font-mono">
                    ₹{s.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-slate-100">{s.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{s.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duration: <strong className="text-slate-200">{s.duration_minutes} minutes</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    s.is_active
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{s.is_active ? 'Deactivate' : 'Activate'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit Service & Price"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(s.id, s.name)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#141C2E] border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-400" />
                <span>{editingService ? 'Edit Salon Service & Pricing' : 'Add New Service'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Executive Haircut"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Price (₹ INR) *</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    placeholder="e.g. 499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Duration (Minutes) *</label>
                  <input
                    type="number"
                    step="15"
                    min="15"
                    max="300"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Haircut">Haircut</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Coloring">Coloring</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Facial">Facial</option>
                    <option value="Styling">Styling</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Active Booking Status</label>
                  <select
                    value={formData.is_active ? '1' : '0'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="1">Active (Bookable)</option>
                    <option value="0">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of techniques, hot towels, massage..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl gold-btn font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
