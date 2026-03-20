import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { TicketIcon, TrophyIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function DrawCenter() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const hasActiveSubscription = user?.subscription?.status === 'ACTIVE';

  const { data: currentDraw, isLoading: loadingDraw } = useQuery({
    queryKey: ['current-draw'],
    queryFn: async () => {
      const response = await api.get('/draws/current');
      return response.data.data;
    }
  });

  const { data: myEntry } = useQuery({
    queryKey: ['my-entry'],
    queryFn: async () => {
      const response = await api.get('/draws/my-entry');
      return response.data.data;
    }
  });

  const { data: pastDraws } = useQuery({
    queryKey: ['past-draws'],
    queryFn: async () => {
      const response = await api.get('/draws/past');
      return response.data.data;
    }
  });

  const { data: drawNumbers } = useQuery({
    queryKey: ['draw-numbers'],
    queryFn: async () => {
      const response = await api.get('/scores/draw-numbers');
      return response.data.data;
    }
  });

  const enterDrawMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/draws/enter');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-entry']);
      queryClient.invalidateQueries(['current-draw']);
      toast.success('Successfully entered the draw!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to enter draw');
    }
  });

  const isEligible = drawNumbers?.eligible;
  const isEntered = !!myEntry;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Draw Center</h1>
        <p className="text-gray-400">Enter draws and track your winning chances</p>
      </div>

      {/* Current Draw */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Draw</p>
              <h2 className="text-2xl font-bold">
                {currentDraw ? format(new Date(currentDraw.month), 'MMMM yyyy') : 'Loading...'}
              </h2>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              currentDraw?.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-400' :
              currentDraw?.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {currentDraw?.status || 'Loading'}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <UsersIcon className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{currentDraw?.entriesCount || 0}</p>
              <p className="text-sm text-gray-400">Entries</p>
            </div>
            <div className="text-center">
              <TrophyIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">${Number(currentDraw?.prizePool || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-400">Prize Pool</p>
            </div>
            <div className="text-center">
              <CalendarIcon className="w-8 h-8 text-accent-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {currentDraw ? format(new Date(new Date(currentDraw.month).getFullYear(), new Date(currentDraw.month).getMonth() + 1, 0), 'd') : '--'}
              </p>
              <p className="text-sm text-gray-400">Draw Day</p>
            </div>
            <div className="text-center">
              <TicketIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{isEntered ? '1' : '0'}</p>
              <p className="text-sm text-gray-400">Your Entries</p>
            </div>
          </div>

          {/* Your Numbers */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-3">Your Draw Numbers</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {drawNumbers?.numbers?.map((num, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl font-bold shadow-lg"
                >
                  {num}
                </motion.div>
              )) || [...Array(5)].map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600">?</div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {!hasActiveSubscription ? (
            <div className="text-center p-4 bg-yellow-500/10 rounded-xl">
              <p className="text-yellow-400">Subscribe to enter draws</p>
            </div>
          ) : !isEligible ? (
            <div className="text-center p-4 bg-blue-500/10 rounded-xl">
              <p className="text-blue-400">{drawNumbers?.message || 'Add more scores to enter'}</p>
            </div>
          ) : isEntered ? (
            <div className="text-center p-4 bg-green-500/10 rounded-xl">
              <p className="text-green-400 flex items-center justify-center gap-2">
                <TicketIcon className="w-5 h-5" />
                You're entered in this draw!
              </p>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => enterDrawMutation.mutate()}
                disabled={enterDrawMutation.isPending}
                className="btn-primary"
              >
                {enterDrawMutation.isPending ? 'Entering...' : 'Enter Draw'}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Past Draws */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Past Draws</h2>
        </div>

        {pastDraws?.length ? (
          <div className="divide-y divide-white/5">
            {pastDraws.map((draw) => (
              <div key={draw.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{format(new Date(draw.month), 'MMMM yyyy')}</p>
                    <p className="text-sm text-gray-400">{draw.entriesCount} entries</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Winning Numbers</p>
                    <div className="flex gap-1">
                      {draw.winningNumbers?.map((num, i) => (
                        <span key={i} className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-medium">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {draw.winners?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-sm text-gray-400 mb-2">Winners</p>
                    <div className="flex flex-wrap gap-2">
                      {draw.winners.map((winner) => (
                        <span key={winner.id} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          {winner.user.firstName} {winner.user.lastName[0]}. - {winner.matchCount} match
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            No past draws yet
          </div>
        )}
      </motion.div>
    </div>
  );
}
