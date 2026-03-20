import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckIcon, XMarkIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminVerifications() {
  const queryClient = useQueryClient();

  const { data: winners, isLoading } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: async () => {
      const response = await api.get('/admin/verifications');
      return response.data.data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const response = await api.put(`/admin/winners/${id}/verify`, { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-verifications']);
      toast.success('Winner verification updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify');
    }
  });

  const payMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/admin/winners/${id}/paid`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-verifications']);
      toast.success('Winner marked as paid');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark as paid');
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Winner Verifications</h1>
        <p className="text-gray-400">Review and verify winner claims</p>
      </div>

      {/* Verifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : winners?.length ? (
        <div className="space-y-4">
          {winners.map((winner) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-bold">
                    {winner.matchCount}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {winner.user.firstName} {winner.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">{winner.user.email}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {format(new Date(winner.draw.month), 'MMMM yyyy')} Draw - {winner.matchCount} matches
                    </p>
                    <div className="flex gap-1 mt-2">
                      {winner.matchedNumbers.map((num, i) => (
                        <span key={i} className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-medium">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">
                    ${Number(winner.prizeAmount).toLocaleString()}
                  </p>
                  <span className="text-sm text-yellow-400">Pending Verification</span>
                </div>
              </div>

              {winner.proofUrl && (
                <div className="mt-4 p-4 bg-gray-800 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">Proof Submitted:</p>
                  <a
                    href={winner.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:underline break-all"
                  >
                    {winner.proofUrl}
                  </a>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => verifyMutation.mutate({ id: winner.id, status: 'VERIFIED' })}
                  disabled={verifyMutation.isPending}
                  className="btn-primary flex-1"
                >
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Verify Winner
                </button>
                <button
                  onClick={() => {
                    const notes = prompt('Reason for rejection:');
                    if (notes) {
                      verifyMutation.mutate({ id: winner.id, status: 'REJECTED', notes });
                    }
                  }}
                  disabled={verifyMutation.isPending}
                  className="btn-outline border-red-500 text-red-400 hover:bg-red-500 flex-1"
                >
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <CheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-xl font-semibold">All Caught Up!</p>
          <p className="text-gray-400">No pending verifications</p>
        </motion.div>
      )}
    </div>
  );
}
