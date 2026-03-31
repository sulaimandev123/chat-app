import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../lib/auth';
import * as Icons from 'lucide-react';

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(authService.getUsers());
  }, []);

  const handleApprove = (userId: string) => {
    authService.approveUser(userId);
    setUsers(authService.getUsers());
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      authService.deleteUser(userId);
      setUsers(authService.getUsers());
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a1014] flex-col font-sans">
      {/* Header */}
      <div className="h-[60px] bg-[#202c33] flex items-center px-4 shrink-0 shadow-md">
        <button onClick={onBack} className="mr-4 text-[#aebac1] hover:text-white transition-colors">
          <Icons.ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[#e9edef] text-lg font-medium flex items-center gap-2">
          <Icons.Shield className="w-5 h-5 text-[#00a884]" />
          Admin Dashboard
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#111b21] rounded-xl border border-[#222d34] overflow-hidden">
            <div className="p-6 border-b border-[#222d34]">
              <h2 className="text-xl font-semibold text-[#e9edef]">Manage Users</h2>
              <p className="text-[#8696a0] mt-1 text-sm">Approve new users or remove existing ones.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#202c33] text-[#8696a0] text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Username</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222d34]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#202c33]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                            <Icons.User className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[#e9edef] font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#8696a0]">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                              title="Approve User"
                            >
                              <Icons.Check className="w-5 h-5" />
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Icons.Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#8696a0]">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
