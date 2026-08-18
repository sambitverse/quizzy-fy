'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { request } from '../../utils/api';
import { Users, Plus, ArrowRight, ShieldAlert, Sparkles, Trophy, BookOpen, Clock } from 'lucide-react';

export default function TeamsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [quizzes, setQuizzes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Join Form
  const [joinCode, setJoinCode] = useState('');

  // Create Form
  const [teamName, setTeamName] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [quizzesRes, teamsRes] = await Promise.all([
        request('/quizzes'),
        request('/teams')
      ]);

      if (quizzesRes.success) {
        setQuizzes(quizzesRes.data);
        if (quizzesRes.data.length > 0) {
          setSelectedQuizId(quizzesRes.data[0]._id);
        }
      }
      if (teamsRes.success) {
        setTeams(teamsRes.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setError('');
    setActionLoading(true);
    try {
      const res = await request('/teams/join', {
        method: 'POST',
        body: { code: joinCode.trim() }
      });
      if (res.success) {
        router.push(`/teams/${res.data.code}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to join team lobby');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !selectedQuizId) return;

    setError('');
    setActionLoading(true);
    try {
      const res = await request('/teams', {
        method: 'POST',
        body: {
          name: teamName.trim(),
          quizId: selectedQuizId
        }
      });
      if (res.success) {
        router.push(`/teams/${res.data.code}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create team');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <span className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Users className="h-3.5 w-3.5" />
              Multiplayer Lobbies
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-350 bg-clip-text text-transparent">
              Team Arena
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Join existing teams with a code or create your own custom group to compete in synchronized quiz sessions.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-xs font-semibold">
            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Middle Column: Join and Create cards */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Join Team Card */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-slate-200 text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Join Team Lobby
              </h2>
              <p className="text-xs text-slate-400">
                Enter a 6-digit lobby code shared by your friend to join their team.
              </p>

              <form onSubmit={handleJoinTeam} className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. TEAM-DFX43A"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 placeholder-slate-700 uppercase tracking-widest text-center focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !joinCode.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 transition-colors disabled:opacity-55"
                >
                  Join Lobby
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Create Team Card */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-slate-200 text-base flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                Establish Team Lobby
              </h2>
              <p className="text-xs text-slate-400">
                Create a new lobby, select the test sheet, and share the code to gather players.
              </p>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. React Wizards"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Quiz Sheet</label>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {quizzes.length === 0 ? (
                      <option value="">No quizzes available</option>
                    ) : (
                      quizzes.map((q) => (
                        <option key={q._id} value={q._id}>
                          {q.title} ({q.category})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !teamName.trim() || !selectedQuizId}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 transition-colors disabled:opacity-55"
                >
                  Create Lobby & Get Code
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: List of Current Joined Lobbies */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-slate-200 text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-400" />
              Active Lobbies
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"></div>
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl text-center">
                <Users className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
                <h3 className="font-semibold text-slate-400">No Active Lobbies</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  You aren't a member of any teams yet. Create a new team or enter a code to join one!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {teams.map((t) => (
                  <div
                    key={t._id}
                    className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-slate-900/30 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all duration-200 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-200 text-base group-hover:text-indigo-400 transition-colors">
                          {t.name}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-750">
                          {t.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {t.quiz?.title || 'Deleted Quiz'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {t.members?.length || 0} players
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                      <div className="text-right text-[10px] text-slate-500 hidden sm:block">
                        <p>Creator: {t.creator?.username || 'System'}</p>
                        <p className="flex items-center gap-0.5 mt-0.5 justify-end">
                          <Clock className="h-3 w-3" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/teams/${t.code}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                      >
                        Enter Lobby
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
