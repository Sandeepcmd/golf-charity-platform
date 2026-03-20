import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import HowItWorks from './pages/HowItWorks';
import Charities from './pages/Charities';
import Login from './pages/Login';
import Register from './pages/Register';

// User Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import MyScores from './pages/dashboard/MyScores';
import DrawCenter from './pages/dashboard/DrawCenter';
import MyCharity from './pages/dashboard/MyCharity';
import MyWinnings from './pages/dashboard/MyWinnings';
import Subscription from './pages/dashboard/Subscription';
import Profile from './pages/dashboard/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCharities from './pages/admin/AdminCharities';
import AdminDraws from './pages/admin/AdminDraws';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminConfig from './pages/admin/AdminConfig';

// Protected Route Components
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* User Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="scores" element={<MyScores />} />
        <Route path="draw" element={<DrawCenter />} />
        <Route path="charity" element={<MyCharity />} />
        <Route path="winnings" element={<MyWinnings />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="charities" element={<AdminCharities />} />
        <Route path="draws" element={<AdminDraws />} />
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="config" element={<AdminConfig />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
