'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Sparkles, Trophy, PlusCircle, Play, ShieldAlert, Cpu, Orbit, History, Lock, Mail, UserPlus } from 'lucide-react';

function HomeContent() {
  const { user, login, register, error, setError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode state: 'view' | 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Parse action from search parameters (e.g., from Navbar links)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'login' || action === 'register') {
      setAuthMode(action);
      // Scroll to form on mobile
      const formEl = document.getElementById('auth-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  // Redirect if user is logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
    setError(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    const { username, email, password, confirmPassword } = formData;

    try {
      if (authMode === 'register') {
        if (!username || !email || !password || !confirmPassword) {
          throw new Error('Please fill in all fields');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register(username, email, password);
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password');
        }
        await login(email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row gap-12 items-center justify-between">
        
        {/* Left Side: Brand Marketing & Features */}
        <div className="flex-1 max-w-xl text-left space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            Empower Your Intellect
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            The Ultimate{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Interactive
            </span>{' '}
            Quiz Arena
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Expand your mind and compete with peers globally. Participate in real-time interactive challenges, track your progress with live metrics, and build custom quizzes to test others.
          </p>

          {/* Core App Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Coding Quizzes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Test your syntax in JS, HTML, React, and CSS.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Orbit className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Space & Cosmos</h3>
                <p className="text-xs text-slate-400 mt-0.5">Explore the astrophysics, galaxies, and black holes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                <History className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Ancient Wonders</h3>
                <p className="text-xs text-slate-400 mt-0.5">Journey through Giza, Pompeii, and world history.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Global Rankings</h3>
                <p className="text-xs text-slate-400 mt-0.5">Amass XP points and top the global leaderboards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div id="auth-section" className="w-full max-w-md bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          
          {/* Subtle glowing backgrounds */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

          {/* Form Toggle Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-6">
            <button
              onClick={() => {
                setAuthMode('login');
                setFormError('');
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setFormError('');
                setError(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 text-center mb-1">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm text-center mb-6">
            {authMode === 'login'
              ? 'Enter your credentials to access your dashboard'
              : 'Sign up to start saving scores and earning XP'}
          </p>

          {/* Error Banner */}
          {(formError || error) && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg p-3.5 text-sm mb-5">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <UserPlus className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Play className="h-4 w-4 fill-current" />
                  {authMode === 'login' ? 'Sign In & Play' : 'Create Account'}
                </span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600">
        <p>© 2026 Quizzify App. Build with Next.js, Tailwind CSS, and MongoDB. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <span className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
