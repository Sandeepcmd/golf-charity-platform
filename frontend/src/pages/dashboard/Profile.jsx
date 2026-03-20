import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const profileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data.data);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const passwordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/auth/password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-400">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500">
              Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A'}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <UserCircleIcon className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold">Personal Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Phone Number (Optional)</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="input"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input bg-gray-800/30"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="btn-primary"
          >
            {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <LockClosedIcon className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold">Change Password</h3>
          </div>

          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="btn-secondary"
          >
            {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
