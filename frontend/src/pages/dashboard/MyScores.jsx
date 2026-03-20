import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function MyScores() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [formData, setFormData] = useState({
    score: '',
    playedAt: format(new Date(), 'yyyy-MM-dd'),
    courseName: ''
  });
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const hasActiveSubscription = user?.subscription?.status === 'ACTIVE';

  const { data: scores, isLoading } = useQuery({
    queryKey: ['my-scores'],
    queryFn: async () => {
      const response = await api.get('/scores');
      return response.data.data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/scores', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-scores']);
      toast.success('Score added successfully');
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add score');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/scores/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-scores']);
      toast.success('Score updated successfully');
      setEditingScore(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update score');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/scores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-scores']);
      toast.success('Score deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete score');
    }
  });

  const resetForm = () => {
    setFormData({
      score: '',
      playedAt: format(new Date(), 'yyyy-MM-dd'),
      courseName: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      score: parseInt(formData.score),
      playedAt: new Date(formData.playedAt).toISOString(),
      courseName: formData.courseName || undefined
    };

    if (editingScore) {
      updateMutation.mutate({ id: editingScore.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const openEditModal = (score) => {
    setEditingScore(score);
    setFormData({
      score: score.score.toString(),
      playedAt: format(new Date(score.playedAt), 'yyyy-MM-dd'),
      courseName: score.courseName || ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Scores</h1>
          <p className="text-gray-400">Your latest 5 scores are used as draw numbers</p>
        </div>
        {hasActiveSubscription && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Score
          </button>
        )}
      </div>

      {!hasActiveSubscription && (
        <div className="card p-6 bg-yellow-500/10 border-yellow-500/30 text-center">
          <p className="text-yellow-400 font-medium">Subscribe to start tracking your scores</p>
        </div>
      )}

      {/* Current Draw Numbers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold mb-4">Your Draw Numbers</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {scores?.length ? (
            scores.slice(0, 5).map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary-500/30"
              >
                {score.score}
              </motion.div>
            ))
          ) : (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600"
              >
                ?
              </div>
            ))
          )}
        </div>
        <p className="text-center text-sm text-gray-400 mt-4">
          {scores?.length >= 5
            ? 'You have 5 scores - ready for the draw!'
            : `Add ${5 - (scores?.length || 0)} more score(s) to enter draws`}
        </p>
      </motion.div>

      {/* Scores List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Score History</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : scores?.length ? (
          <div className="divide-y divide-white/5">
            {scores.map((score, index) => (
              <div key={score.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  index < 5 ? 'bg-gradient-to-br from-primary-500 to-accent-500' : 'bg-gray-800 text-gray-400'
                }`}>
                  {score.score}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {score.courseName || 'Golf Round'}
                    {index < 5 && (
                      <span className="ml-2 text-xs text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded-full">
                        Draw Number
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(score.playedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {!score.verified && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(score)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(score.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-400">No scores yet</p>
            {hasActiveSubscription && (
              <button onClick={() => setIsAddModalOpen(true)} className="btn-secondary mt-4">
                Add Your First Score
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingScore) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-6">
              {editingScore ? 'Edit Score' : 'Add New Score'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Stableford Score (1-45)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="input"
                  placeholder="Enter your score"
                  required
                />
              </div>
              <div>
                <label className="label">Date Played</label>
                <input
                  type="date"
                  value={formData.playedAt}
                  onChange={(e) => setFormData({ ...formData, playedAt: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Course Name (Optional)</label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="input"
                  placeholder="e.g., Pebble Beach"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingScore(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {addMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Score'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
