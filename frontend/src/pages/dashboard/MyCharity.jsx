import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartIcon, CheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function MyCharity() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: charities, isLoading } = useQuery({
    queryKey: ['charities'],
    queryFn: async () => {
      const response = await api.get('/charities');
      return response.data.data;
    }
  });

  const { data: myCharity } = useQuery({
    queryKey: ['my-charity'],
    queryFn: async () => {
      const response = await api.get('/charities/my-charity');
      return response.data.data;
    }
  });

  const selectMutation = useMutation({
    mutationFn: async (charityId) => {
      const response = await api.post('/charities/select', { charityId });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['my-charity']);
      updateUser({ selectedCharity: data.data });
      toast.success('Charity selected successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to select charity');
    }
  });

  const selectedId = myCharity?.charityId;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Charity</h1>
        <p className="text-gray-400">Choose the charity you want to support</p>
      </div>

      {/* Current Selection */}
      {myCharity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
              {myCharity.charity.logoUrl ? (
                <img src={myCharity.charity.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <HeartIcon className="w-8 h-8 text-primary-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{myCharity.charity.name}</h3>
                <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                  Your Selection
                </span>
              </div>
              <p className="text-gray-400 text-sm">{myCharity.charity.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <HeartIcon className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">How It Works</h3>
            <p className="text-gray-400 text-sm">
              A minimum of 10% of all subscription revenue goes directly to our partner charities.
              Your selection determines where your contribution goes. The charity fund is distributed
              proportionally based on how many subscribers support each charity.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charities Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold mb-4">Available Charities</h2>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-800 rounded-xl mb-4" />
                <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {charities?.map((charity) => {
              const isSelected = selectedId === charity.id;
              return (
                <motion.div
                  key={charity.id}
                  whileHover={{ scale: 1.02 }}
                  className={`card p-6 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary-500 bg-primary-500/5' : 'hover:border-white/20'
                  }`}
                  onClick={() => !isSelected && selectMutation.mutate(charity.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center overflow-hidden">
                      {charity.logoUrl ? (
                        <img src={charity.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <HeartIcon className="w-6 h-6 text-primary-400" />
                      )}
                    </div>
                    {isSelected && (
                      <span className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-white" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{charity.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{charity.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <p className="text-sm text-primary-400 font-medium">
                      ${Number(charity.totalContributions || 0).toLocaleString()} raised
                    </p>
                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-white"
                      >
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
