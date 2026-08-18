'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/Navbar';
import { request } from '../../../utils/api';
import confetti from 'canvas-confetti';
import {
  Timer,
  Zap,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';


const safeConfetti = (opts) => {
  try {
    const confettiFn = typeof confetti === 'function' ? confetti : confetti?.default;
    if (typeof confettiFn === 'function') {
      confettiFn(opts);
    }
  } catch (e) {
    console.error('Confetti failed to fire:', e);
  }
};

export default function PlayQuiz() {
  const { user, updateStats, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.id;
  const lobbyCode = searchParams.get('lobby');

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hiddenOptions, setHiddenOptions] = useState([]); // For 50:50 lifeline
  const [answers, setAnswers] = useState([]); // [{ questionId, selectedOptionIndex }]
  const [timeLeft, setTimeLeft] = useState(15);
  const [shaking, setShaking] = useState(false);

  // Lifelines State
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    skip: true,
    extraTime: true
  });

  // Results State
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);

  const timerRef = useRef(null);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch Quiz
  useEffect(() => {
    if (user && quizId) {
      fetchQuiz();
    }
  }, [user, quizId]);

  // Timer Effect
  useEffect(() => {
    if (loading || isFinished || !quiz) return;

    // Reset timer for new question
    const currentQuestion = quiz.questions[currentIndex];
    setTimeLeft(currentQuestion.timeLimit || 20);

    // Clear old timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, loading, isFinished, quiz]);

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await request(`/quizzes/${quizId}`);
      if (res.success) {
        setQuiz(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not fetch quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeOut = () => {
    // Record unanswered question (-1)
    const currentQuestion = quiz.questions[currentIndex];
    const newAnswer = {
      questionId: currentQuestion._id.toString(),
      selectedOptionIndex: -1
    };

    setAnswers((prev) => [...prev, newAnswer]);

    // Go to next or finish
    if (currentIndex < quiz.questions.length - 1) {
      setHiddenOptions([]);
      setSelectedOption(null);
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitQuiz([...answers, newAnswer]);
    }
  };

  // Lifeline Actions
  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || selectedOption !== null) return;

    const currentQuestion = quiz.questions[currentIndex];
    const correctIdx = currentQuestion.correctAnswerIndex;
    const totalOptions = currentQuestion.options.length;

    // Keep correct and one random incorrect option
    const incorrectIndices = [];
    for (let i = 0; i < totalOptions; i++) {
      if (i !== correctIdx) incorrectIndices.push(i);
    }

    const keepIncorrectIdx = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
    const toHide = [];
    for (let i = 0; i < totalOptions; i++) {
      if (i !== correctIdx && i !== keepIncorrectIdx) {
        toHide.push(i);
      }
    }

    setHiddenOptions(toHide);
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
  };

  const useSkipQuestion = () => {
    if (!lifelines.skip) return;

    const currentQuestion = quiz.questions[currentIndex];
    const newAnswer = {
      questionId: currentQuestion._id.toString(),
      selectedOptionIndex: -1 // Counted as skipped/wrong
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setLifelines((prev) => ({ ...prev, skip: false }));

    if (currentIndex < quiz.questions.length - 1) {
      setHiddenOptions([]);
      setSelectedOption(null);
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitQuiz([...answers, newAnswer]);
    }
  };

  const useExtraTime = () => {
    if (!lifelines.extraTime) return;
    setTimeLeft((prev) => prev + 15);
    setLifelines((prev) => ({ ...prev, extraTime: false }));
  };

  const handleOptionSelect = (idx) => {
    if (selectedOption !== null) return; // Answer already lock-in
    setSelectedOption(idx);
    
    const currentQuestion = quiz.questions[currentIndex];
    const correctIdx = currentQuestion.correctAnswerIndex;

    if (idx === correctIdx) {
      // Trigger mini confetti splash on correct answer selection
      safeConfetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.8 }
      });
    } else {
      // Screen shake on incorrect answer
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    }
  };

  const handleNextQuestion = () => {
    const currentQuestion = quiz.questions[currentIndex];
    const newAnswer = {
      questionId: currentQuestion._id.toString(),
      selectedOptionIndex: selectedOption
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIndex < quiz.questions.length - 1) {
      setHiddenOptions([]);
      setSelectedOption(null);
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    setIsFinished(true);

    try {
      const res = await request('/attempts', {
        method: 'POST',
        body: {
          quizId: quiz._id,
          answers: finalAnswers
        }
      });

      if (res.success) {
        setAttemptResult(res.data);
        // Update local user stats context
        if (typeof updateStats === 'function') {
          updateStats(res.data.userNewStats);
        }
        
        // Report score to multiplayer team lobby if running inside one
        if (lobbyCode) {
          try {
            await request(`/teams/${lobbyCode}/submit`, {
              method: 'POST',
              body: {
                score: res.data.attempt.score,
                maxScore: res.data.attempt.maxScore
              }
            });
            console.log('Score submitted to team lobby successfully');
          } catch (teamErr) {
            console.error('Failed to submit score to team lobby:', teamErr);
          }
        }

        // Pop major celebration confetti
        triggerVictoryConfetti();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error submitting results');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerVictoryConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      safeConfetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      safeConfetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Helper colors for timers
  const getTimerColor = () => {
    if (timeLeft > 10) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (timeLeft > 4) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5 animate-pulse';
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
          <p className="text-slate-400 text-sm">Downloading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error && !isFinished) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 flex flex-col items-center justify-center text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500" />
          <h3 className="font-bold text-slate-200 text-lg">Error loading Quiz</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / quiz.questions.length) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {!isFinished ? (
          /* PLAY SCREEN */
          <div className="space-y-6">
            
            {/* Header: Progress & Info */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="text-indigo-400">{quiz.category} • {quiz.difficulty}</span>
              <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Left Question and Answers Section */}
              <div className={`md:col-span-3 space-y-6 ${shaking ? 'animate-shake' : ''}`}>
                
                {/* Question Card */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-5 -m-4">
                    <HelpCircle className="h-32 w-32" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-100 relative leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* Answers Options List */}
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isHidden = hiddenOptions.includes(idx);
                    if (isHidden) return <div key={idx} className="h-14 border border-dashed border-slate-900/50 rounded-xl"></div>;

                    const isSelected = selectedOption === idx;
                    const isCorrect = currentQuestion.correctAnswerIndex === idx;

                    // Option styling states
                    let btnStyle = 'border-slate-800/80 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40 text-slate-200';
                    if (selectedOption !== null) {
                      if (isSelected) {
                        btnStyle = isCorrect
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold shadow-md shadow-emerald-500/5'
                          : 'border-rose-500/50 bg-rose-500/10 text-rose-300 font-bold shadow-md shadow-rose-500/5';
                      } else if (isCorrect) {
                        // Reveal correct answer on select
                        btnStyle = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-semibold';
                      } else {
                        btnStyle = 'border-slate-900/50 bg-slate-950/20 text-slate-600 opacity-60 cursor-not-allowed';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedOption !== null}
                        onClick={() => handleOptionSelect(idx)}
                        className={`w-full p-4 rounded-xl border text-left text-sm sm:text-base transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {selectedOption !== null && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                        {selectedOption !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Next button */}
                {selectedOption !== null && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 transition-colors"
                  >
                    {currentIndex === quiz.questions.length - 1 ? 'Finish Challenge' : 'Next Question'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Right Sidebar: Timer & Lifelines */}
              <div className="space-y-6">
                
                {/* Timer Card */}
                <div className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center ${getTimerColor()} transition-colors duration-300`}>
                  <Timer className="h-7 w-7 mb-2" />
                  <span className="text-2xl font-extrabold">{timeLeft}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 mt-1">Seconds Left</span>
                </div>

                {/* Lifelines Card */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    Available Lifelines
                  </h3>

                  <div className="flex flex-col gap-2">
                    <button
                      disabled={!lifelines.fiftyFifty || selectedOption !== null}
                      onClick={useFiftyFifty}
                      className="w-full text-left py-2 px-3 rounded-lg border border-slate-800 text-xs font-semibold flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900/50 hover:border-slate-700 transition-all text-slate-300"
                    >
                      <span>50:50 Split</span>
                      <span className="text-[10px] text-slate-500">1x Use</span>
                    </button>

                    <button
                      disabled={!lifelines.skip}
                      onClick={useSkipQuestion}
                      className="w-full text-left py-2 px-3 rounded-lg border border-slate-800 text-xs font-semibold flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900/50 hover:border-slate-700 transition-all text-slate-300"
                    >
                      <span>Skip Question</span>
                      <span className="text-[10px] text-slate-500">1x Use</span>
                    </button>

                    <button
                      disabled={!lifelines.extraTime}
                      onClick={useExtraTime}
                      className="w-full text-left py-2 px-3 rounded-lg border border-slate-800 text-xs font-semibold flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900/50 hover:border-slate-700 transition-all text-slate-300"
                    >
                      <span>+15s Extra Time</span>
                      <span className="text-[10px] text-slate-500">1x Use</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* RESULTS SCREEN */
          <div className="space-y-8 animate-fade-in">
            {submitting ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></span>
                <p className="text-slate-400 text-sm">Grading exam sheet...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                <AlertTriangle className="h-12 w-12 text-rose-500" />
                <h3 className="font-bold text-slate-200 text-lg">Submission Error</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
                <button
                  onClick={() => submitQuiz(answers)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white"
                >
                  Retry Submission
                </button>
              </div>
            ) : (
              /* Display actual success attempt details */
              attemptResult && (
                <div className="space-y-8">
                  {/* Visual Stats Overview */}
                  <div className="bg-slate-900/30 border border-slate-800 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-around gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Award className="h-32 w-32 text-indigo-500" />
                    </div>

                    {/* XP gained */}
                    <div className="text-center space-y-1">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
                        <Award className="h-8 w-8 animate-bounce" />
                      </div>
                      <h3 className="text-2xl font-black text-indigo-400">+{attemptResult.attempt.xpGained} XP</h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Gained Score</p>
                    </div>

                    {/* Points detail */}
                    <div className="text-center space-y-1">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-100">
                        {attemptResult.attempt.score} <span className="text-sm font-normal text-slate-500">/ {attemptResult.attempt.maxScore}</span>
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Points Score</p>
                    </div>

                    {/* Accuracy rate */}
                    <div className="text-center space-y-1">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                        <BookOpen className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black text-emerald-400">{attemptResult.attemptAccuracy}%</h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Accuracy</p>
                    </div>
                  </div>

                  {/* Header: Title */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-200">Exam Results Breakdown</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Let's review the questions and explore descriptions.</p>
                    </div>

                    <button
                      onClick={() => router.push(lobbyCode ? `/teams/${lobbyCode}` : '/dashboard')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-350 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" /> {lobbyCode ? 'Return to Team Lobby' : 'Return to Dashboard'}
                    </button>
                  </div>

                  {/* Detail Reviews List */}
                  <div className="space-y-4">
                    {quiz.questions.map((q, idx) => {
                      const ans = answers.find((a) => a.questionId === q._id.toString());
                      const isCorrect = ans && ans.selectedOptionIndex === q.correctAnswerIndex;
                      const isUnanswered = !ans || ans.selectedOptionIndex === -1;

                      return (
                        <div
                          key={q._id}
                          className={`p-5 rounded-2xl border ${
                            isCorrect
                              ? 'border-emerald-500/20 bg-emerald-500/5'
                              : 'border-rose-500/20 bg-rose-500/5'
                          } space-y-4`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-bold text-slate-200 text-sm sm:text-base leading-relaxed">
                              {idx + 1}. {q.questionText}
                            </h4>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-md">
                                <XCircle className="h-3.5 w-3.5" /> {isUnanswered ? 'Skipped' : 'Wrong'}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            {q.options.map((opt, oIdx) => {
                              const wasSelected = ans && ans.selectedOptionIndex === oIdx;
                              const isRight = q.correctAnswerIndex === oIdx;

                              let style = 'bg-slate-900/10 border-slate-900 text-slate-500';
                              if (wasSelected) {
                                style = isRight
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold';
                              } else if (isRight) {
                                style = 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400/80';
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-lg border flex items-center justify-between ${style}`}
                                >
                                  <span>{opt}</span>
                                  {wasSelected && isRight && <CheckCircle2 className="h-3.5 w-3.5" />}
                                  {wasSelected && !isRight && <XCircle className="h-3.5 w-3.5" />}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="p-3.5 bg-slate-950/40 rounded-lg border border-slate-900/60 text-xs leading-relaxed text-slate-400">
                              <span className="font-bold text-slate-300 block mb-1">Explanation:</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => {
                        // Play again resets state
                        setIsFinished(false);
                        setAttemptResult(null);
                        setCurrentIndex(0);
                        setSelectedOption(null);
                        setHiddenOptions([]);
                        setAnswers([]);
                        setLifelines({
                          fiftyFifty: true,
                          skip: true,
                          extraTime: true
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20"
                    >
                      Play Again <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
