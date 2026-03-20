import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
  HomeIcon,
  ChartBarIcon,
  TicketIcon,
  HeartIcon,
  TrophyIcon,
  CreditCardIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'My Scores', href: '/dashboard/scores', icon: ChartBarIcon },
  { name: 'Draw Center', href: '/dashboard/draw', icon: TicketIcon },
  { name: 'My Charity', href: '/dashboard/charity', icon: HeartIcon },
  { name: 'Winnings', href: '/dashboard/winnings', icon: TrophyIcon },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCardIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span className="text-xl font-bold gradient-text">GolfCharity</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 lg:hidden bg-gray-950/90 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="font-bold gradient-text">GolfCharity</span>
            </Link>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
