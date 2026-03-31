import React from 'react';
import { User } from '../types';
import * as Icons from 'lucide-react';

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

export function UserProfile({ user, onClose }: UserProfileProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200">
      <div className="bg-[#111b21] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#222d34] flex flex-col">
        {/* Header */}
        <div className="h-[60px] bg-[#202c33] flex items-center px-4 shrink-0 border-b border-[#222d34]">
          <button onClick={onClose} className="mr-4 text-[#aebac1] hover:text-white transition-colors">
            <Icons.X className="w-6 h-6" />
          </button>
          <h1 className="text-[#e9edef] text-lg font-medium">Profile</h1>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center mb-6 shadow-lg border-4 border-[#202c33]">
            <Icons.User className="w-16 h-16 text-gray-300" />
          </div>
          
          <div className="w-full space-y-4">
            <div className="bg-[#202c33] p-4 rounded-xl border border-[#222d34]">
              <label className="text-sm text-[#00a884] mb-1 block font-medium">Your Name</label>
              <div className="text-[#e9edef] text-lg">{user.name}</div>
            </div>

            <div className="bg-[#202c33] p-4 rounded-xl border border-[#222d34]">
              <label className="text-sm text-[#00a884] mb-1 block font-medium">Username</label>
              <div className="text-[#e9edef] text-lg">@{user.username}</div>
            </div>

            <div className="flex gap-4">
              <div className="bg-[#202c33] p-4 rounded-xl flex-1 border border-[#222d34]">
                <label className="text-sm text-[#8696a0] mb-1 block">Role</label>
                <div className="capitalize text-[#e9edef] font-medium flex items-center gap-2">
                  {user.role === 'admin' ? <Icons.Shield className="w-4 h-4 text-purple-400" /> : <Icons.User className="w-4 h-4 text-blue-400" />}
                  {user.role}
                </div>
              </div>
              <div className="bg-[#202c33] p-4 rounded-xl flex-1 border border-[#222d34]">
                <label className="text-sm text-[#8696a0] mb-1 block">Status</label>
                <div className="capitalize text-[#e9edef] font-medium flex items-center gap-2">
                  {user.status === 'approved' ? <Icons.CheckCircle className="w-4 h-4 text-green-400" /> : <Icons.Clock className="w-4 h-4 text-yellow-400" />}
                  {user.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
