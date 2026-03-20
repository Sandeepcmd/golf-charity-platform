import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const features = [
  'Enter all monthly prize draws',
  'Track unlimited golf scores',
  'Choose your supported charity',
  'Win cash prizes',
  'Real-time draw notifications',
  'Priority customer support'
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY');
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
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

  const handleSubscribe = (plan) => {
    if (!isAuthenticated) {
      navigate('/register', { state: { plan } });
      return;
    }
    checkoutMutation.mutate(plan);
  };

  const monthly = plans?.monthly || { price: 9.99 };
  const yearly = plans?.yearly || { price: 99.99, savings: '17%' };

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            One subscription. Unlimited entries. Endless possibilities.
            Choose the plan that works best for you.
          </p>
        </motion.div>

        {/* Plan Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setSelectedPlan('MONTHLY')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedPlan === 'MONTHLY'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('YEARLY')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedPlan === 'YEARLY'
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 text-xs bg-yellow-500 text-yellow-900 rounded-full font-bold">
                Save {yearly.savings}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`card p-8 ${selectedPlan === 'MONTHLY' ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">${monthly.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mt-2">Billed monthly</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe('MONTHLY')}
              disabled={checkoutMutation.isPending}
              className={`w-full ${selectedPlan === 'MONTHLY' ? 'btn-primary' : 'btn-secondary'}`}
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Get Started'}
            </button>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`card p-8 relative ${selectedPlan === 'YEARLY' ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-full">
                <SparklesIcon className="w-4 h-4" />
                Best Value
              </span>
            </div>

            <div className="text-center mb-8 pt-4">
              <h3 className="text-2xl font-bold mb-2">Yearly</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">${yearly.price}</span>
                <span className="text-gray-400">/year</span>
              </div>
              <p className="text-gray-400 mt-2">
                ${(yearly.price / 12).toFixed(2)}/month billed annually
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-yellow-400 font-medium">2 months free!</span>
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe('YEARLY')}
              disabled={checkoutMutation.isPending}
              className={`w-full ${selectedPlan === 'YEARLY' ? 'btn-primary' : 'btn-secondary'}`}
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Get Started'}
            </button>
          </motion.div>
        </div>

        {/* FAQ Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Questions?</h3>
          <p className="text-gray-400 mb-6">
            Learn more about how our platform works.
          </p>
          <Link to="/how-it-works" className="btn-outline">
            How It Works
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
