'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import { request } from '../../../utils/api';
import {
  Users,
  Play,
  Copy,
  Check,
  Trophy,
  ArrowLeft,
  RefreshCw,
  Award,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function TeamLobby() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lobbyCode = params.code;

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && lobbyCode) {
      fetchLobbyDetails();
      
      // Dynamic polling: refresh scoreboard every 5 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchLobbyDetails(true);
      }, 5000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [user, lobbyCode]);

  const fetchLobbyDetails = async (isPoll = false) => {
    if (!isPoll) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await request(`/teams/${lobbyCode}`);
      if (res.success) {
        setTeam(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load lobby details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/teams/${lobbyCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobbyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchQuiz = () => {
    if (!team || !team.quiz) return;
    router.push(`/quiz/${team.quiz._id}?lobby=${lobbyCode}`);
  };

  // Helper to fetch player score in lobby
  const getPlayerScore = (userId) => {
    if (!team || !team.scores) return null;
    return team.scores.find((s) => s.user?._id.toString() === userId.toString());
  };

  // Calculate total points for the entire team in this lobby's session
  const getTeamTotalPoints = () => {
    if (!team || !team.scores) return 0;
    return team.scores.reduce((sum, entry) => sum + entry.score, 0);
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <span className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <span className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></span>
          <p className="text-slate-400 text-sm font-semibold">Opening team lobby portal...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 flex flex-col items-center justify-center text-center space-y-4">
          <Trophy className="h-12 w-12 text-rose-500 animate-bounce" />
          <h3 className="font-bold text-slate-200 text-lg">Lobby Portal Offline</h3>
          <p className="text-sm text-slate-450">{error || 'Could not find requested lobby.'}</p>
          <button
            onClick={() => router.push('/teams')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Teams Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Navigation & Refresh action */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/teams')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Teams Area
          </button>

          <button
            onClick={() => fetchLobbyDetails(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh Scoreboard
          </button>
        </div>

        {/* Top Info Banner */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/30 via-slate-900/10 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-indigo-400">Team Active Lobby</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-200">
              {team.name}
            </h1>
            <p className="text-xs text-slate-400">
              Target Quiz: <span className="text-indigo-300 font-semibold">{team.quiz?.title}</span> • Category: <span className="text-slate-250 font-semibold">{team.quiz?.category}</span>
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 gap-3">
            {/* Share Code panel */}
            <div className="text-left md:text-right space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Lobby Code</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-slate-200">{team.code}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-450 hover:text-white transition-colors border border-slate-800"
                  title="Copy Code"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-[10px] font-extrabold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 text-slate-350 transition-colors uppercase tracking-wider"
            >
              {copied ? 'Copied Link!' : 'Invite Players'}
            </button>
          </div>
        </div>

        {/* Main Grid: Scoreboard and Quiz card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left/Center Columns: Team Scoreboard */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-indigo-400" /> Scoreboard Standings
              </h3>
              <span className="text-xs text-indigo-400 font-extrabold">Team Total: {getTeamTotalPoints()} pts</span>
            </div>

            <div className="space-y-3">
              {team.members?.map((member, idx) => {
                const quizScore = getPlayerScore(member._id);
                const isSelf = member._id.toString() === user._id.toString();

                return (
                  <div
                    key={member._id}
                    className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-900/30 border border-slate-800 hover:border-slate-750 rounded-2xl transition-all ${
                      isSelf ? 'border-indigo-500/30 bg-indigo-500/5' : ''
                    }`}
                  >
                    {/* User profile & XP details */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-slate-350">
                        {idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200 text-sm sm:text-base">
                            {member.username}
                          </span>
                          {isSelf && (
                            <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                          <span>Total Cumulative: <span className="text-indigo-450 font-bold">{member.xp} XP</span></span>
                          <span>•</span>
                          <span>Avg Accuracy: {member.accuracy}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quiz Points Scorecard */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest block">Single Quiz score</span>
                        {quizScore ? (
                          <span className="font-extrabold text-emerald-400 text-base">
                            {quizScore.score} <span className="text-xs font-normal text-slate-500">/ {quizScore.maxScore} pts</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md mt-0.5 uppercase tracking-wider">
                            Not Played
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Quiz Action Details Card */}
          <div className="space-y-6">
            
            {/* Quiz Launch Card */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                <Award className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-200 text-sm">Launch Quiz Sheet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start the designated test sheet. Once complete, your score will submit directly to this scorecard!
                </p>
              </div>

              <button
                onClick={handleLaunchQuiz}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.99]"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Challenge
              </button>
            </div>

            {/* Room stats summary */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Lobby Summary</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-500">Players Joined</span>
                  <span className="font-bold text-slate-350">{team.members?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-500">Submissions</span>
                  <span className="font-bold text-slate-350">{team.scores?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Team Score</span>
                  <span className="font-bold text-indigo-400">{getTeamTotalPoints()} pts</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
