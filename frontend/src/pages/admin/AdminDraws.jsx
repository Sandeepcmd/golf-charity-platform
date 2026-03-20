import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PlayIcon, TicketIcon, TrophyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminDraws() {
  const queryClient = useQueryClient();

  const { data: draws, isLoading } = useQuery({
    queryKey: ['admin-draws'],
    queryFn: async () => {
      const response = await api.get('/admin/draws');
      return response.data.data;
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/admin/draws/${id}/execute`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-draws']);
      toast.success(`Draw completed! ${data.data.winnersCount.fiveMatch + data.data.winnersCount.fourMatch + data.data.winnersCount.threeMatch} winners`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to execute draw');
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Draws</h1>
        <p className="text-gray-400">Manage and execute monthly draws</p>
      </div>

      {/* Draws List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {draws?.map((draw) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">
                        {format(new Date(draw.month), 'MMMM yyyy')}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        draw.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        draw.status === 'ACTIVE' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {draw.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <TicketIcon className="w-4 h-4" />
                        {draw.entriesCount} entries
                      </span>
                      <span className="flex items-center gap-1">
                        <TrophyIcon className="w-4 h-4" />
                        {draw.winnersCount} winners
                      </span>
                    </div>
                  </div>

                  {draw.status !== 'COMPLETED' && draw.entriesCount > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to execute this draw? This cannot be undone.')) {
                          executeMutation.mutate(draw.id);
                        }
                      }}
                      disabled={executeMutation.isPending}
                      className="btn-primary"
                    >
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Execute Draw
                    </button>
                  )}
                </div>

                {draw.status === 'COMPLETED' && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Winning Numbers</p>
                        <div className="flex gap-2">
                          {draw.winningNumbers?.map((num, i) => (
                            <span key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-bold">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-400">Prize Pool</p>
                          <p className="font-bold text-primary-400">${Number(draw.prizePool || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">To Charity</p>
                          <p className="font-bold text-red-400">${Number(draw.charityAmount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Draw Date</p>
                          <p className="font-medium">{draw.drawDate ? format(new Date(draw.drawDate), 'MMM d, yyyy') : '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
