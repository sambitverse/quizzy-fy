'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { request } from '../../utils/api';
import {
  PlusCircle,
  Trash2,
  HelpCircle,
  ArrowLeft,
  Save,
  AlertTriangle,
  Plus,
  Compass,
  LayoutGrid
} from 'lucide-react';

const CATEGORIES = ['JavaScript', 'Science', 'History', 'Technology', 'General Knowledge'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function CreateQuiz() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Array of questions
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      points: 10,
      timeLimit: 20,
      explanation: ''
    }
  ]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        points: 10,
        timeLimit: 20,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionTextChange = (qIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, questionText: value } : q))
    );
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === qIndex) {
          const newOpts = [...q.options];
          newOpts[oIndex] = value;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const handleCorrectIndexChange = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, correctAnswerIndex: oIndex } : q))
    );
  };

  const handleNumericChange = (qIndex, field, value) => {
    const num = parseInt(value, 10) || 0;
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, [field]: num } : q))
    );
  };

  const handleExplanationChange = (qIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, explanation: value } : q))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-validation
    if (!title.trim() || !description.trim()) {
      setError('Please add a quiz title and description.');
      return;
    }

    // Question validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} has empty text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question ${i + 1} option ${j + 1} is empty.`);
          return;
        }
      }
    }

    setSaving(true);

    try {
      const res = await request('/quizzes', {
        method: 'POST',
        body: {
          title,
          description,
          category,
          difficulty,
          questions
        }
      });

      if (res.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Header link */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Quiz Architect</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Construct a Challenge</h1>
          <p className="text-sm text-slate-400 mt-1">Design questions, lock options, and publish to the global roster.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-xs font-semibold">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Quiz Details */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wide pb-2 border-b border-slate-850 flex items-center gap-1.5">
              <LayoutGrid className="h-4.5 w-4.5 text-indigo-400" /> General Parameters
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quiz Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master React Hooks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  placeholder="Summarize the core topics covered in this quiz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Questions Builder */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <HelpCircle className="h-4.5 w-4.5 text-indigo-400" /> Question List
              </h3>
              <span className="text-xs font-semibold text-slate-500">{questions.length} total</span>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 space-y-4 relative group"
              >
                {/* Remove button */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-rose-400 transition-colors p-1"
                    title="Remove Question"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}

                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Question #{qIdx + 1}</h4>

                {/* Question Text */}
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter the question text"
                    value={q.questionText}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Multiple choice options */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Options (Select the radio to mark correct answer)
                  </label>
                  
                  {q.options.map((option, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-answer-${qIdx}`}
                        checked={q.correctAnswerIndex === oIdx}
                        onChange={() => handleCorrectIndexChange(qIdx, oIdx)}
                        className="h-4 w-4 text-indigo-600 border-slate-800 bg-slate-950 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${oIdx + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-150 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                {/* Numeric fields and explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Points awarded</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={q.points}
                      onChange={(e) => handleNumericChange(qIdx, 'points', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-305 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time Limit (seconds)</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={q.timeLimit}
                      onChange={(e) => handleNumericChange(qIdx, 'timeLimit', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-305 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Explanation (optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Provide context explaining the correct answer..."
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-3 text-xs text-slate-150 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-900/10 py-3 text-xs font-bold text-slate-400 hover:text-slate-300 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Question Block
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-900">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all disabled:opacity-55"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" /> Publish Quiz
                </>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
