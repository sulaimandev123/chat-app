import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../lib/auth';
import * as Icons from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const user = authService.login(username, password);
        if (user.status === 'pending') {
          setError('Your account is pending approval by an admin.');
        } else {
          onLogin(user);
        }
      } else {
        if (!name.trim() || !username.trim() || !password.trim()) {
          setError('All fields are required');
          return;
        }
        const user = authService.signup(name, username, password);
        if (user.status === 'pending') {
          setMessage('Sign up successful! Please wait for an admin to approve your account.');
          setIsLogin(true);
          setPassword('');
        } else {
          onLogin(user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a1014] items-center justify-center font-sans p-4">
      <div className="bg-[#111b21] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#222d34]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center mb-4">
            <Icons.MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#e9edef]">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[#8696a0] mt-2 text-center">
            {isLogin ? 'Log in to continue chatting' : 'Sign up to get started'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-[#00a884]/10 border border-[#00a884]/50 text-[#00a884] p-3 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#8696a0] mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#202c33] border border-[#222d34] rounded-lg px-4 py-3 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#8696a0] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#202c33] border border-[#222d34] rounded-lg px-4 py-3 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-colors"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8696a0] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#202c33] border border-[#222d34] rounded-lg px-4 py-3 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-colors"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-semibold py-3 px-4 rounded-lg transition-colors mt-6"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setMessage('');
            }}
            className="text-[#00a884] hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
