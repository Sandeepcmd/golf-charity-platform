import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CogIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminConfig() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    charityPercentage: 10,
    operationalPercentage: 20,
    fiveMatchPercentage: 40,
    fourMatchPercentage: 20,
    threeMatchPercentage: 10,
    monthlyPrice: '9.99',
    yearlyPrice: '99.99'
  });

  const { data: config, isLoading } = useQuery({
    queryKey: ['prize-config'],
    queryFn: async () => {
      const response = await api.get('/admin/config');
      return response.data.data;
    }
  });

  useEffect(() => {
    if (config) {
      setFormData({
        charityPercentage: config.charityPercentage,
        operationalPercentage: config.operationalPercentage,
        fiveMatchPercentage: config.fiveMatchPercentage,
        fourMatchPercentage: config.fourMatchPercentage,
        threeMatchPercentage: config.threeMatchPercentage,
        monthlyPrice: config.monthlyPrice.toString(),
        yearlyPrice: config.yearlyPrice.toString()
      });
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/admin/config', {
        ...data,
        monthlyPrice: parseFloat(data.monthlyPrice),
        yearlyPrice: parseFloat(data.yearlyPrice)
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['prize-config']);
      toast.success('Configuration updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = formData.charityPercentage + formData.operationalPercentage +
      formData.fiveMatchPercentage + formData.fourMatchPercentage + formData.threeMatchPercentage;

    if (total !== 100) {
      toast.error(`Percentages must sum to 100 (currently ${total})`);
      return;
    }
    if (formData.charityPercentage < 10) {
      toast.error('Charity percentage must be at least 10%');
      return;
    }
    updateMutation.mutate(formData);
  };

  const total = formData.charityPercentage + formData.operationalPercentage +
    formData.fiveMatchPercentage + formData.fourMatchPercentage + formData.threeMatchPercentage;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuration</h1>
        <p className="text-gray-400">Manage prize pool distribution and pricing</p>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-blue-500/10 border-blue-500/30"
      >
        <div className="flex gap-4">
          <InformationCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-400">Important Note</p>
            <p className="text-sm text-gray-300">
              Changes to this configuration will apply to future draws only.
              The charity percentage must be at least 10% and all percentages must sum to 100%.
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
        {/* Prize Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <CogIcon className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold">Prize Distribution</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label flex items-center justify-between">
                <span>Charity Contribution (min 10%)</span>
                <span className="text-primary-400">{formData.charityPercentage}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={formData.charityPercentage}
                onChange={(e) => setFormData({ ...formData, charityPercentage: parseInt(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="label flex items-center justify-between">
                <span>Operational</span>
                <span className="text-gray-400">{formData.operationalPercentage}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                value={formData.operationalPercentage}
                onChange={(e) => setFormData({ ...formData, operationalPercentage: parseInt(e.target.value) })}
                className="w-full accent-gray-500"
              />
            </div>

            <div>
              <label className="label flex items-center justify-between">
                <span>5 Number Match Prize</span>
                <span className="text-yellow-400">{formData.fiveMatchPercentage}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={formData.fiveMatchPercentage}
                onChange={(e) => setFormData({ ...formData, fiveMatchPercentage: parseInt(e.target.value) })}
                className="w-full accent-yellow-500"
              />
            </div>

            <div>
              <label className="label flex items-center justify-between">
                <span>4 Number Match Prize</span>
                <span className="text-orange-400">{formData.fourMatchPercentage}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={formData.fourMatchPercentage}
                onChange={(e) => setFormData({ ...formData, fourMatchPercentage: parseInt(e.target.value) })}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <label className="label flex items-center justify-between">
                <span>3 Number Match Prize</span>
                <span className="text-amber-400">{formData.threeMatchPercentage}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={formData.threeMatchPercentage}
                onChange={(e) => setFormData({ ...formData, threeMatchPercentage: parseInt(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            <div className={`p-4 rounded-xl ${total === 100 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <p className={`font-medium ${total === 100 ? 'text-green-400' : 'text-red-400'}`}>
                Total: {total}% {total === 100 ? '✓' : `(must equal 100%)`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <CogIcon className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold">Subscription Pricing</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Monthly Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Yearly Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.yearlyPrice}
                onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                className="input"
              />
            </div>

            <div className="p-4 bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-400">
                Yearly savings: {((1 - (parseFloat(formData.yearlyPrice) / (parseFloat(formData.monthlyPrice) * 12))) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending || total !== 100}
            className="btn-primary w-full mt-6"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
