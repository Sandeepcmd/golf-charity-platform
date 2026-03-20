import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { TrophyIcon, CheckCircleIcon, ClockIcon, XCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const statusConfig = {
  PENDING_VERIFICATION: { icon: ClockIcon, color: 'yellow', label: 'Pending Verification' },
  VERIFIED: { icon: CheckCircleIcon, color: 'blue', label: 'Verified' },
  REJECTED: { icon: XCircleIcon, color: 'red', label: 'Rejected' },
  PAID: { icon: BanknotesIcon, color: 'green', label: 'Paid' }
};

export default function MyWinnings() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-winnings'],
    queryFn: async () => {
      const response = await api.get('/draws/my-winnings');
      return response.data.data;
    }
  });

  const winnings = data?.winnings || [];
  const totalWinnings = data?.totalWinnings || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Winnings</h1>
        <p className="text-gray-400">Track your prize history and verifications</p>
      </div>

      {/* Total Winnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <TrophyIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Winnings (Paid)</p>
            <p className="text-4xl font-bold text-yellow-400">${totalWinnings.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Winnings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Winning History</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : winnings.length ? (
          <div className="divide-y divide-white/5">
            {winnings.map((win) => {
              const status = statusConfig[win.status];
              const StatusIcon = status.icon;
              return (
                <div key={win.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${status.color}-500/20 flex items-center justify-center`}>
                        <StatusIcon className={`w-6 h-6 text-${status.color}-400`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {win.matchCount} Numbers Matched
                        </h3>
                        <p className="text-sm text-gray-400">
                          {format(new Date(win.draw.month), 'MMMM yyyy')} Draw
                        </p>
                        <div className="flex gap-1 mt-2">
                          {win.matchedNumbers.map((num, i) => (
                            <span key={i} className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-medium">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        ${Number(win.prizeAmount).toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-500/20 text-${status.color}-400`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {win.status === 'PENDING_VERIFICATION' && (
                    <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl">
                      <p className="text-sm text-yellow-400">
                        Please upload proof of your identity to claim this prize.
                        Our team will review and process your winnings.
                      </p>
                    </div>
                  )}

                  {win.verificationNotes && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-xl">
                      <p className="text-sm text-gray-400">
                        <strong>Note:</strong> {win.verificationNotes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <TrophyIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No winnings yet</p>
            <p className="text-sm text-gray-500">Keep entering draws for your chance to win!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
