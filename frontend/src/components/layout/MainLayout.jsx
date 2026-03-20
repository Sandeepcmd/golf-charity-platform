import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Charities', href: '/charities' },
];

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/10' : ''
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span className="text-xl font-bold gradient-text">GolfCharity</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-primary-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="btn-primary"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-xl border-b border-white/10"
            >
              <div className="px-4 py-4 space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg ${
                      location.pathname === item.href
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/10">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary w-full"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-secondary w-full"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-primary w-full"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <span className="text-xl font-bold">GolfCharity</span>
              </Link>
              <p className="text-gray-400 text-sm">
                Play. Win. Give. Transform your golf game into charitable impact.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/charities" className="hover:text-white">Charities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} GolfCharity. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
