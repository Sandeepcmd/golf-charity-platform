import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
  HomeIcon,
  UsersIcon,
  HeartIcon,
  TicketIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Charities', href: '/admin/charities', icon: HeartIcon },
  { name: 'Draws', href: '/admin/draws', icon: TicketIcon },
  { name: 'Verifications', href: '/admin/verifications', icon: ShieldCheckIcon },
  { name: 'Configuration', href: '/admin/config', icon: CogIcon },
];

export default function AdminLayout() {
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Admin</span>
                <p className="text-xs text-gray-400">Control Panel</p>
              </div>
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
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick links */}
          <div className="p-4 border-t border-white/10">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors mb-2"
            >
              <HomeIcon className="w-5 h-5" />
              <span>User Dashboard</span>
            </Link>
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
        <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="lg:flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Admin: <span className="text-white">{user?.email}</span>
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.firstName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

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
