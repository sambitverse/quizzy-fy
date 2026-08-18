'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { request } from '../../utils/api';
import { Trophy, Award, Medal, ShieldAlert, Sparkles, Backspace, ArrowLeft } from 'lucide-react';

export default function Leaderboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setDbError('');
    try {
      const res = await request('/leaderboard');
      if (res.success) {
        setLeaderboard(res.data);
      }
    } catch (err) {
      console.error(err);
      setDbError(err.message || 'Could not fetch leaderboard ranking');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <span className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  // Split podium and rest
  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  // Position colors/styles for podium
  const podiumStyles = [
    {
      cardClass: 'border-amber-500/30 bg-amber-500/5 order-2 md:h-[220px]',
      badgeClass: 'bg-amber-500 text-slate-950',
      iconClass: 'text-amber-400',
      label: '1st',
    },
    {
      cardClass: 'border-slate-300/30 bg-slate-350/5 order-1 md:h-[190px]',
      badgeClass: 'bg-slate-350 text-slate-950',
      iconClass: 'text-slate-300',
      label: '2nd',
    },
    {
      cardClass: 'border-amber-700/30 bg-amber-800/5 order-3 md:h-[170px]',
      badgeClass: 'bg-amber-700 text-slate-950',
      iconClass: 'text-amber-600',
      label: '3rd',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Live Standings
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-100 bg-clip-text text-transparent">
            Hall of Legends
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Compete with scholars worldwide. Complete quizzes with speed and accuracy to rise in ranks.
          </p>
        </div>

        {/* Database Offline Error */}
        {dbError && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-5 text-sm">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <div>
              <h4 className="font-bold">Database Error</h4>
              <p className="text-slate-400 mt-0.5">{dbError}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
            <p className="text-xs text-slate-500 mt-4">Loading user standings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl text-center">
            <Trophy className="h-10 w-10 text-slate-800 mb-3" />
            <h3 className="font-semibold text-slate-400">No Ranking Data</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              No quiz attempts have been recorded yet. Take a quiz to initialize the leaderboard standings!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Top 3 Podium layout */}
            {topThree.length > 0 && (
              <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-6">
                
                {/* 2nd place (shows left on desktop) */}
                {topThree[1] && (
                  <div className={`w-full md:w-56 p-6 rounded-2xl border ${podiumStyles[1].cardClass} flex flex-col justify-between items-center text-center shadow-lg relative`}>
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center justify-center h-6 w-6 text-xs font-bold rounded-lg ${podiumStyles[1].badgeClass}`}>
                        {podiumStyles[1].label}
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-center">
                        <Medal className={`h-7 w-7 ${podiumStyles[1].iconClass}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm truncate max-w-[150px]">{topThree[1].username}</h3>
                        <p className="text-xs text-slate-500">{topThree[1].quizzesTaken} Quizzes</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-850 w-full">
                      <span className="font-extrabold text-indigo-400 text-base">{topThree[1].xp} XP</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{topThree[1].accuracy}% Accuracy</p>
                    </div>
                  </div>
                )}

                {/* 1st place (shows center and taller) */}
                {topThree[0] && (
                  <div className={`w-full md:w-60 p-6 rounded-2xl border ${podiumStyles[0].cardClass} flex flex-col justify-between items-center text-center shadow-2xl relative`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 uppercase tracking-widest">
                        <Trophy className="h-3 w-3 fill-current" /> Leader
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center justify-center h-6 w-6 text-xs font-bold rounded-lg ${podiumStyles[0].badgeClass}`}>
                        {podiumStyles[0].label}
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-3 mt-2">
                      <div className="h-14 w-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Trophy className={`h-8 w-8 ${podiumStyles[0].iconClass} animate-bounce`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-base truncate max-w-[170px]">{topThree[0].username}</h3>
                        <p className="text-xs text-slate-400">{topThree[0].quizzesTaken} Quizzes</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-850 w-full">
                      <span className="font-extrabold text-indigo-400 text-lg">{topThree[0].xp} XP</span>
                      <p className="text-xs text-slate-400 mt-0.5">{topThree[0].accuracy}% Accuracy</p>
                    </div>
                  </div>
                )}

                {/* 3rd place (shows right on desktop) */}
                {topThree[2] && (
                  <div className={`w-full md:w-56 p-6 rounded-2xl border ${podiumStyles[2].cardClass} flex flex-col justify-between items-center text-center shadow-lg relative`}>
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center justify-center h-6 w-6 text-xs font-bold rounded-lg ${podiumStyles[2].badgeClass}`}>
                        {podiumStyles[2].label}
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-center">
                        <Award className={`h-7 w-7 ${podiumStyles[2].iconClass}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm truncate max-w-[150px]">{topThree[2].username}</h3>
                        <p className="text-xs text-slate-500">{topThree[2].quizzesTaken} Quizzes</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-850 w-full">
                      <span className="font-extrabold text-indigo-400 text-base">{topThree[2].xp} XP</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{topThree[2].accuracy}% Accuracy</p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Other Ranks Table */}
            {others.length > 0 && (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-850 bg-slate-900/20">
                  <h3 className="font-bold text-slate-200 text-sm">Contenders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 text-xs font-semibold uppercase">
                        <th className="py-4 px-6">Rank</th>
                        <th className="py-4 px-6">Username</th>
                        <th className="py-4 px-6">Total XP</th>
                        <th className="py-4 px-6 text-center">Quizzes</th>
                        <th className="py-4 px-6 text-right">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50">
                      {others.map((player, idx) => {
                        const rank = idx + 4;
                        const isSelf = player.username === user.username;
                        return (
                          <tr
                            key={player._id}
                            className={`hover:bg-slate-900/25 transition-colors ${
                              isSelf ? 'bg-indigo-500/5 text-indigo-200 font-semibold' : 'text-slate-300'
                            }`}
                          >
                            <td className="py-4 px-6 font-bold text-slate-500">#{rank}</td>
                            <td className="py-4 px-6 flex items-center gap-2">
                              {player.username}
                              {isSelf && (
                                <span className="text-[10px] bg-indigo-500/25 border border-indigo-500/35 text-indigo-400 px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 font-bold text-indigo-400">{player.xp}</td>
                            <td className="py-4 px-6 text-center">{player.quizzesTaken}</td>
                            <td className="py-4 px-6 text-right font-semibold text-slate-200">{player.accuracy}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}
