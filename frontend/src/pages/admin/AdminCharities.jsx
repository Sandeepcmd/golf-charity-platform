import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, HeartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminCharities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    website: ''
  });
  const queryClient = useQueryClient();

  const { data: charities, isLoading } = useQuery({
    queryKey: ['admin-charities'],
    queryFn: async () => {
      const response = await api.get('/charities');
      return response.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/admin/charities', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-charities']);
      toast.success('Charity created');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/admin/charities/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-charities']);
      toast.success('Charity updated');
      setEditingCharity(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/charities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-charities']);
      toast.success('Charity deactivated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', logoUrl: '', website: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCharity) {
      updateMutation.mutate({ id: editingCharity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditModal = (charity) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name,
      description: charity.description,
      logoUrl: charity.logoUrl || '',
      website: charity.website || ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Charities</h1>
          <p className="text-gray-400">Manage partner charities</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Charity
        </button>
      </div>

      {/* Charities Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-800 rounded-xl mb-4" />
              <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities?.map((charity) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card p-6 ${!charity.active ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center overflow-hidden">
                  {charity.logoUrl ? (
                    <img src={charity.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-primary-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(charity)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Deactivate this charity?')) {
                        deleteMutation.mutate(charity.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{charity.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">{charity.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-400">${Number(charity.totalContributions || 0).toLocaleString()}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${charity.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {charity.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isModalOpen || editingCharity) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-6">
              {editingCharity ? 'Edit Charity' : 'Add New Charity'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-24"
                  required
                />
              </div>
              <div>
                <label className="label">Logo URL (Optional)</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="label">Website (Optional)</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingCharity(null); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
