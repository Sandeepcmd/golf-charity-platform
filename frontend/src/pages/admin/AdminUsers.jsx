import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const response = await api.get('/admin/users', {
        params: { page, search, limit: 20 }
      });
      return response.data.data;
    }
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const response = await api.put(`/admin/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User role updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-400">Manage all registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="input pl-12"
        />
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Subscription</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Scores</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Wins</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-8 bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.users?.length ? (
                data.users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.subscription ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.subscription.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                          user.subscription.status === 'CANCELLED' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {user.subscription.status} ({user.subscription.plan})
                        </span>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{user.scoresCount}</td>
                    <td className="px-6 py-4">{user.winsCount}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value })}
                        className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1 text-sm"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} users)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
