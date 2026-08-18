'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Trophy, PlusCircle, LogOut, LayoutDashboard, User, Users } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <BrainCircuit className="h-6 w-6 text-white animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Quizzify
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive('/dashboard') ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive('/leaderboard') ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link
                href="/create"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive('/create') ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Create Quiz
              </Link>
              <Link
                href="/teams"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive('/teams') ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                <Users className="h-4 w-4" />
                Teams
              </Link>
            </>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* User XP and Name */}
              <div className="flex flex-col items-end text-right">
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                  {user.xp} XP
                </span>
                <span className="text-sm font-semibold text-slate-200 max-w-[120px] truncate">
                  {user.username}
                </span>
              </div>

              {/* Avatar Indicator */}
              <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                <User className="h-5 w-5" />
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition-all border border-transparent hover:border-slate-800"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/?action=login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/?action=register"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
