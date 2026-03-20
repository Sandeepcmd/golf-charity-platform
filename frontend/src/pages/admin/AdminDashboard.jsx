import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  HeartIcon,
  TicketIcon,
  TrophyIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data.data;
    }
  });

  const growthData = stats?.monthlyGrowth
    ? Object.entries(stats.monthlyGrowth).map(([month, count]) => ({
        month: month.slice(5),
        users: count
      }))
    : [];

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'primary', href: '/admin/users' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: ArrowTrendingUpIcon, color: 'green', href: '/admin/users' },
    { label: 'Partner Charities', value: stats?.totalCharities || 0, icon: HeartIcon, color: 'red', href: '/admin/charities' },
    { label: 'Prizes Paid', value: `$${Number(stats?.totalPrizePoolPaid || 0).toLocaleString()}`, icon: TrophyIcon, color: 'yellow', href: '/admin/draws' },
    { label: 'Charity Contributions', value: `$${Number(stats?.totalCharityContributions || 0).toLocaleString()}`, icon: BanknotesIcon, color: 'accent', href: '/admin/charities' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400">Overview of GolfCharity platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.href} className="card p-6 block hover:border-white/20 transition-colors">
              <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-3`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold mb-4">User Growth (6 months)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Area type="monotone" dataKey="users" stroke="#22c55e" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Winners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">Recent Winners</h2>
          </div>
          {stats?.recentWinners?.length ? (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {stats.recentWinners.map((winner) => (
                <div key={winner.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {winner.user.firstName} {winner.user.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {winner.matchCount} numbers matched
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">
                      ${Number(winner.prizeAmount).toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      winner.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                      winner.status === 'VERIFIED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {winner.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No winners yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid md:grid-cols-4 gap-4"
      >
        <Link to="/admin/users" className="card-hover p-6">
          <UsersIcon className="w-8 h-8 text-primary-400 mb-3" />
          <h3 className="font-semibold">Manage Users</h3>
          <p className="text-sm text-gray-400">View and manage all users</p>
        </Link>
        <Link to="/admin/charities" className="card-hover p-6">
          <HeartIcon className="w-8 h-8 text-red-400 mb-3" />
          <h3 className="font-semibold">Manage Charities</h3>
          <p className="text-sm text-gray-400">Add or edit charities</p>
        </Link>
        <Link to="/admin/draws" className="card-hover p-6">
          <TicketIcon className="w-8 h-8 text-accent-400 mb-3" />
          <h3 className="font-semibold">Manage Draws</h3>
          <p className="text-sm text-gray-400">Run and view draws</p>
        </Link>
        <Link to="/admin/verifications" className="card-hover p-6">
          <TrophyIcon className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="font-semibold">Verify Winners</h3>
          <p className="text-sm text-gray-400">Review pending verifications</p>
        </Link>
      </motion.div>
    </div>
  );
}
