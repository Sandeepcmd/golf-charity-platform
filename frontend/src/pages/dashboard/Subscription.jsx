import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function Subscription() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refreshUser } = useAuthStore();
  const subscription = user?.subscription;

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
      // Clear the URL parameter
      setSearchParams({});
    },
    onError: () => {
      toast.error('Failed to sync subscription. Please refresh the page.');
    }
  });

  // Auto-sync when returning from Stripe with success
  useEffect(() => {
    if (searchParams.get('subscription') === 'success' && !subscription) {
      syncMutation.mutate();
    }
  }, [searchParams]);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/plans');
      return response.data.data;
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async (plan) => {
      const response = await api.post('/subscriptions/checkout', { plan });
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start checkout');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/subscriptions/cancel');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Subscription will be cancelled at end of billing period');
      refreshUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/subscriptions/resume');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Subscription resumed!');
      refreshUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to resume');
    }
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/subscriptions/billing-portal');
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    }
  });

  const isActive = subscription?.status === 'ACTIVE';
  const isCancelled = subscription?.status === 'CANCELLED';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-gray-400">Manage your subscription and billing</p>
      </div>

      {/* Current Subscription */}
      {subscription ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card p-6 ${isActive ? 'border-primary-500/30' : isCancelled ? 'border-yellow-500/30' : 'border-red-500/30'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isActive ? 'bg-gradient-to-br from-primary-500 to-accent-500' :
                isCancelled ? 'bg-yellow-500/20' : 'bg-red-500/20'
              }`}>
                {isActive ? (
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                ) : isCancelled ? (
                  <XCircleIcon className="w-7 h-7 text-yellow-400" />
                ) : (
                  <XCircleIcon className="w-7 h-7 text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {subscription.plan === 'YEARLY' ? 'Yearly' : 'Monthly'} Plan
                </h2>
                <p className={`text-sm ${isActive ? 'text-primary-400' : isCancelled ? 'text-yellow-400' : 'text-red-400'}`}>
                  {isActive ? 'Active' : isCancelled ? 'Cancelled (Active until end of period)' : 'Expired'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${subscription.plan === 'YEARLY' ? plans?.yearly?.price || '99.99' : plans?.monthly?.price || '9.99'}
              </p>
              <p className="text-sm text-gray-400">
                per {subscription.plan === 'YEARLY' ? 'year' : 'month'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Current Period Started</p>
              <p className="font-medium">{format(new Date(subscription.currentPeriodStart), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Period Ends</p>
              <p className="font-medium">{format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
            {isActive && (
              <>
                <button
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  className="btn-secondary flex-1"
                >
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Manage Billing
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel? You will retain access until the end of your billing period.')) {
                      cancelMutation.mutate();
                    }
                  }}
                  disabled={cancelMutation.isPending}
                  className="btn-outline border-red-500 text-red-400 hover:bg-red-500 flex-1"
                >
                  Cancel Subscription
                </button>
              </>
            )}
            {isCancelled && (
              <button
                onClick={() => resumeMutation.mutate()}
                disabled={resumeMutation.isPending}
                className="btn-primary flex-1"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Resume Subscription
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <CreditCardIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Active Subscription</h2>
          <p className="text-gray-400 mb-6">Subscribe to enter draws and start winning!</p>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-2">Monthly</h3>
              <p className="text-3xl font-bold text-primary-400 mb-4">${plans?.monthly?.price || '9.99'}<span className="text-sm text-gray-400">/mo</span></p>
              <button
                onClick={() => checkoutMutation.mutate('MONTHLY')}
                disabled={checkoutMutation.isPending}
                className="btn-secondary w-full"
              >
                Choose Monthly
              </button>
            </div>
            <div className="card p-6 border-primary-500/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-primary-500 text-sm font-bold rounded-full">Best Value</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Yearly</h3>
              <p className="text-3xl font-bold text-primary-400 mb-4">${plans?.yearly?.price || '99.99'}<span className="text-sm text-gray-400">/yr</span></p>
              <button
                onClick={() => checkoutMutation.mutate('YEARLY')}
                disabled={checkoutMutation.isPending}
                className="btn-primary w-full"
              >
                Choose Yearly
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold mb-4">What's Included</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Enter all monthly prize draws',
            'Track unlimited golf scores',
            'Choose your supported charity',
            'Win cash prizes',
            'Real-time draw notifications',
            'Priority customer support'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
