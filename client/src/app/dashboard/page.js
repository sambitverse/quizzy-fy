'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { request } from '../../utils/api';
import {
  BookOpen,
  Trophy,
  PlusCircle,
  Play,
  Search,
  SlidersHorizontal,
  Flame,
  Award,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';

const CATEGORY_COLORS = {
  javascript: 'from-amber-500/20 to-orange-600/20 text-orange-400 border-orange-500/30',
  science: 'from-indigo-500/20 to-purple-600/20 text-indigo-400 border-indigo-500/30',
  history: 'from-rose-500/20 to-pink-600/20 text-rose-400 border-rose-500/30',
  default: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30'
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchQuizzesAndAttempts();
    }
  }, [user, selectedCategory, selectedDifficulty]);

  const fetchQuizzesAndAttempts = async () => {
    setLoading(true);
    setDbError('');
    try {
      // Build query string
      let quizQuery = '/quizzes?';
      if (selectedCategory) quizQuery += `category=${selectedCategory}&`;
      if (selectedDifficulty) quizQuery += `difficulty=${selectedDifficulty}&`;
      
      const [quizzesRes, attemptsRes] = await Promise.all([
        request(quizQuery),
        request('/attempts/my')
      ]);

      if (quizzesRes.success) setQuizzes(quizzesRes.data);
      if (attemptsRes.success) setAttempts(attemptsRes.data);
    } catch (err) {
      console.error(err);
      setDbError(err.message || 'Could not fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTheme = (category) => {
    const cat = category.toLowerCase();
    return CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
  };

  // Filter quizzes locally for search query
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(search.toLowerCase()) || 
    quiz.description.toLowerCase().includes(search.toLowerCase())
  );

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top welcome banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Welcome back, {user.username}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Ready to test your limits today? Select a quiz category below or construct a customized exam.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => router.push('/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors"
            >
              <PlusCircle className="h-4.5 w-4.5 text-indigo-400" />
              Build a Quiz
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Trophy className="h-4.5 w-4.5" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Database Offline Error */}
        {dbError && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-5 text-sm shadow-xl">
            <AlertCircle className="h-6 w-6 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-base">Backend Connection Issue</h4>
              <p className="text-slate-400 mt-0.5">{dbError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Columns: Quiz List and Filters */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900/20 p-4 rounded-xl border border-slate-905">
              {/* Search input */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search quizzes by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Category & Difficulty Selector */}
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quizzes Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"></div>
                ))}
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl text-center">
                <BookOpen className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
                <h3 className="font-semibold text-slate-400 text-lg">No Quizzes Found</h3>
                <p className="text-sm text-slate-600 max-w-sm mt-1">
                  We couldn't locate any quizzes matching your filters. Try modifying your search criteria or create your own quiz!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="flex flex-col justify-between p-6 bg-slate-900/30 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl transition-all duration-200 group hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Category and Difficulty Tag */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border bg-gradient-to-br ${getCategoryTheme(quiz.category)}`}>
                          {quiz.category}
                        </span>
                        <span className={`text-xs font-semibold ${
                          quiz.difficulty === 'Easy' ? 'text-emerald-400' :
                          quiz.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-lg line-clamp-1">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {quiz.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-850">
                      {/* Qs & Creator */}
                      <div className="text-xs text-slate-500">
                        <p>{quiz.questions?.length || 0} Questions</p>
                        <p className="mt-0.5">By {quiz.creator?.username || 'System'}</p>
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={() => router.push(`/quiz/${quiz._id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-colors"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Start Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: User Stats Card & Recent Activity */}
          <div className="space-y-6">
            
            {/* User Stats Card */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="h-24 w-24 text-indigo-500" />
              </div>

              <h2 className="font-bold text-slate-200 text-lg mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" />
                Performance Portal
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <span className="text-sm font-medium text-slate-400">Total XP Points</span>
                  </div>
                  <span className="font-bold text-indigo-400">{user.xp}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-400">Quizzes Taken</span>
                  </div>
                  <span className="font-bold text-slate-200">{user.quizzesTaken}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <Compass className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-400">Average Accuracy</span>
                  </div>
                  <span className="font-bold text-slate-200">{user.accuracy}%</span>
                </div>
              </div>
            </div>

            {/* Recent Attempts Activity */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-slate-200 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                Recent Attempts
              </h2>

              {attempts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                  No completed quizzes yet. Start playing to build up logs!
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt._id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 max-w-[120px]">
                        <h4 className="font-semibold text-slate-350 truncate">{attempt.quiz?.title || 'Deleted Quiz'}</h4>
                        <span className="text-[10px] text-slate-500">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-200">
                          {attempt.score}/{attempt.maxScore} pts
                        </p>
                        <p className="text-[10px] text-indigo-400 font-semibold">+{attempt.xpGained} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
