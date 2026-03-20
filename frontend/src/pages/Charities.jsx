import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { HeartIcon, UsersIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function Charities() {
  const { data, isLoading } = useQuery({
    queryKey: ['charities'],
    queryFn: async () => {
      const response = await api.get('/charities');
      return response.data.data;
    }
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['charity-leaderboard'],
    queryFn: async () => {
      const response = await api.get('/charities/leaderboard');
      return response.data.data;
    }
  });

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
            Our <span className="gradient-text">Partner Charities</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A minimum of 10% of all subscription revenue goes directly to these amazing organizations.
            Choose the cause that matters most to you.
          </p>
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-16"
        >
          <div className="card p-6 text-center">
            <HeartIcon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
            <div className="text-3xl font-bold gradient-text mb-1">
              ${leaderboard?.reduce((sum, c) => sum + Number(c.totalContributions), 0).toLocaleString() || '0'}
            </div>
            <p className="text-sm text-gray-400">Total Contributed</p>
          </div>
          <div className="card p-6 text-center">
            <UsersIcon className="w-8 h-8 text-accent-400 mx-auto mb-3" />
            <div className="text-3xl font-bold gradient-text mb-1">
              {leaderboard?.reduce((sum, c) => sum + c.supportersCount, 0) || '0'}
            </div>
            <p className="text-sm text-gray-400">Active Supporters</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-400 font-bold">{data?.length || 0}</span>
            </div>
            <div className="text-3xl font-bold gradient-text mb-1">
              {data?.length || 0}
            </div>
            <p className="text-sm text-gray-400">Partner Charities</p>
          </div>
        </motion.div>

        {/* Charities Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-800 rounded-xl mb-4" />
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-full mb-2" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {data?.map((charity, index) => {
              const leaderboardInfo = leaderboard?.find(c => c.id === charity.id);
              return (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-hover p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center overflow-hidden">
                      {charity.logoUrl ? (
                        <img src={charity.logoUrl} alt={charity.name} className="w-full h-full object-cover" />
                      ) : (
                        <HeartIcon className="w-8 h-8 text-primary-400" />
                      )}
                    </div>
                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{charity.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{charity.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500">Total Raised</p>
                      <p className="font-semibold text-primary-400">
                        ${Number(leaderboardInfo?.totalContributions || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Supporters</p>
                      <p className="font-semibold">{leaderboardInfo?.supportersCount || 0}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="card p-12 bg-gradient-to-br from-primary-500/10 to-accent-500/10">
            <HeartIcon className="w-12 h-12 text-primary-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Support a Cause You Believe In</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Join GolfCharity today and start making a difference with every round you play.
              Your subscription directly supports these incredible organizations.
            </p>
            <Link to="/register" className="btn-primary">
              Start Giving Back
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
