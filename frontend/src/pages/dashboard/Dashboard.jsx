import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ChartBarIcon,
  TicketIcon,
  HeartIcon,
  TrophyIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refreshUser } = useAuthStore();

  // Sync subscription after successful Stripe checkout
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/subscriptions/sync');
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data) {
        toast.success('Subscription activated successfully!');
        refreshUser();
      }
      setSearchParams({});
    },
    onError: () => {
      toast.error('Failed to sync subscription. Please refresh.');
      setSearchParams({});
    }
  });

  // Auto-sync when returning from Stripe
  useEffect(() => {
    const subscriptionParam = searchParams.get('subscription');
    if (subscriptionParam === 'success' && !user?.subscription) {
      syncMutation.mutate();
    } else if (subscriptionParam === 'cancelled') {
      toast.error('Subscription cancelled');
      setSearchParams({});
    }
  }, [searchParams]);

  const { data: scores } = useQuery({
    queryKey: ['my-scores'],
    queryFn: async () => {
      const response = await api.get('/scores');
      return response.data.data;
    }
  });

  const { data: currentDraw } = useQuery({
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

  const { data: winnings } = useQuery({
    queryKey: ['my-winnings'],
    queryFn: async () => {
      const response = await api.get('/draws/my-winnings');
      return response.data.data;
    }
  });

  const hasActiveSubscription = user?.subscription?.status === 'ACTIVE';
  const hasEnoughScores = scores?.length >= 5;
  const isEnteredInDraw = !!myEntry;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="gradient-text">{user?.firstName}</span>
        </h1>
        <p className="text-gray-400">Here's what's happening with your GolfCharity account</p>
      </div>

      {/* Alerts */}
      {!hasActiveSubscription && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-yellow-500/10 border-yellow-500/30"
        >
          <div className="flex items-center gap-3">
            <ExclamationCircleIcon className="w-6 h-6 text-yellow-400" />
            <div className="flex-1">
              <p className="font-medium text-yellow-400">No Active Subscription</p>
              <p className="text-sm text-gray-400">Subscribe to enter draws and win prizes</p>
            </div>
            <Link to="/dashboard/subscription" className="btn-primary text-sm px-4 py-2">
              Subscribe Now
            </Link>
          </div>
        </motion.div>
      )}

      {hasActiveSubscription && !hasEnoughScores && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-blue-500/10 border-blue-500/30"
        >
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-blue-400" />
            <div className="flex-1">
              <p className="font-medium text-blue-400">Add More Scores</p>
              <p className="text-sm text-gray-400">
                You need {5 - (scores?.length || 0)} more score(s) to enter the draw
              </p>
            </div>
            <Link to="/dashboard/scores" className="btn-secondary text-sm px-4 py-2">
              Add Score
            </Link>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <ChartBarIcon className="w-8 h-8 text-primary-400 mb-3" />
          <p className="text-3xl font-bold">{scores?.length || 0}/5</p>
          <p className="text-sm text-gray-400">Scores Entered</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <TicketIcon className="w-8 h-8 text-accent-400 mb-3" />
          <p className="text-3xl font-bold">{currentDraw?.entriesCount || 0}</p>
          <p className="text-sm text-gray-400">Draw Entries</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <TrophyIcon className="w-8 h-8 text-yellow-400 mb-3" />
          <p className="text-3xl font-bold">${winnings?.totalWinnings || 0}</p>
          <p className="text-sm text-gray-400">Total Winnings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <HeartIcon className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-3xl font-bold truncate">
            {user?.selectedCharity?.charity?.name || 'None'}
          </p>
          <p className="text-sm text-gray-400">Your Charity</p>
        </motion.div>
      </div>

      {/* Your Draw Numbers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Your Draw Numbers</h2>
            <p className="text-sm text-gray-400">Based on your latest 5 scores</p>
          </div>
          <Link to="/dashboard/scores" className="text-primary-400 hover:underline text-sm flex items-center gap-1">
            Manage Scores <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          {scores?.length ? (
            scores.map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
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
          {scores?.length > 0 && scores.length < 5 && (
            [...Array(5 - scores.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-16 h-16 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600"
              >
                ?
              </div>
            ))
          )}
        </div>

        {hasActiveSubscription && hasEnoughScores && !isEnteredInDraw && (
          <div className="mt-6 text-center">
            <Link to="/dashboard/draw" className="btn-primary">
              Enter This Month's Draw
            </Link>
          </div>
        )}

        {isEnteredInDraw && (
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
              <TicketIcon className="w-5 h-5" />
              You're entered in this month's draw!
            </span>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/dashboard/scores" className="card-hover p-6 group">
          <ChartBarIcon className="w-8 h-8 text-primary-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Manage Scores</h3>
          <p className="text-sm text-gray-400">Add or update your golf scores</p>
        </Link>

        <Link to="/dashboard/draw" className="card-hover p-6 group">
          <TicketIcon className="w-8 h-8 text-accent-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Draw Center</h3>
          <p className="text-sm text-gray-400">View current and past draws</p>
        </Link>

        <Link to="/dashboard/charity" className="card-hover p-6 group">
          <HeartIcon className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">My Charity</h3>
          <p className="text-sm text-gray-400">Choose or change your charity</p>
        </Link>
      </div>
    </div>
  );
}
