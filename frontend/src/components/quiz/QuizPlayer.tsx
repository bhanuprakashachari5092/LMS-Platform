import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Send,
  Loader2,
  Check,
  FileQuestion,
  History,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { quizService } from '@/services/quizService';
import type { Quiz, QuizAttempt, QuizQuestion } from '@/services/quizService';

interface QuizPlayerProps {
  quizId?: string;
  lessonId?: string;
  courseId?: string;
  courseTitle?: string;
  onComplete?: (attempt: QuizAttempt) => void;
  isNightMode?: boolean;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quizId,
  lessonId,
  courseId,
  courseTitle,
  onComplete,
  isNightMode = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  
  // Attempt Session State
  const [sessionState, setSessionState] = useState<'intro' | 'in-progress' | 'review' | 'result'>('intro');
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [sanitizedQuestions, setSanitizedQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  
  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestResult, setLatestResult] = useState<QuizAttempt | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch Quiz & Past Attempts
  const loadQuizData = useCallback(async () => {
    setLoading(true);
    try {
      let q: Quiz | null = null;
      if (quizId) {
        q = await quizService.getQuiz(quizId);
      } else if (lessonId) {
        q = await quizService.getQuizByLesson(lessonId);
      }
      if (!q && courseId) {
        const list = await quizService.getQuizzesByCourse(courseId);
        q = (lessonId ? list.find((item) => item.lessonId === lessonId) : null) || list[0] || null;
      }

      if (q) {
        setQuiz(q);
        const history = await quizService.getAttemptHistory(q.id);
        setAttempts(history);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load assessment data.');
    } finally {
      setLoading(false);
    }
  }, [quizId, lessonId, courseId]);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Server-Side Timer Countdown
  const startTimer = useCallback((expiresAtString: string, initialSec: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!initialSec || initialSec <= 0) return;

    const expiresAt = new Date(expiresAtString).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setSecondsRemaining(diffSec);

      if (diffSec <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        toast.warning('⏰ Time expired! Submitting your answers automatically.');
        handleAutoSubmit();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
  }, []);

  // Start Assessment Attempt
  const handleStartQuiz = async () => {
    if (!quiz) return;

    // Check Max Attempts
    if (quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts) {
      toast.error(`You have reached the maximum allowed attempts (${quiz.maxAttempts}/${quiz.maxAttempts}).`);
      return;
    }

    try {
      setLoading(true);
      const session = await quizService.startAttempt(quiz.id);
      setActiveAttemptId(session.attemptId);
      setSanitizedQuestions(session.quiz.questions || []);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setSessionState('in-progress');

      if (session.timeLimitSec > 0) {
        startTimer(session.expiresAt, session.timeLimitSec);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not start quiz attempt.');
    } finally {
      setLoading(false);
    }
  };

  // Select Single Answer (MCQ / TF)
  const handleSelectOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  // Toggle Multiple Selection Answer (MS)
  const handleToggleMultipleOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      let selected: string[] = [];
      if (Array.isArray(current)) {
        selected = [...current];
      } else if (typeof current === 'string' && current) {
        selected = [current];
      }

      if (selected.includes(optionValue)) {
        selected = selected.filter((o) => o !== optionValue);
      } else {
        selected.push(optionValue);
      }

      return {
        ...prev,
        [questionId]: selected,
      };
    });
  };

  // Short Answer text change
  const handleShortAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  // Submit Quiz to Backend
  const handleSubmitQuiz = async () => {
    if (!quiz || !activeAttemptId || isSubmitting) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);
    setShowReviewModal(false);

    try {
      const result = await quizService.submitAttempt(quiz.id, activeAttemptId, answers);
      setLatestResult(result);
      setSessionState('result');
      setAttempts((prev) => [result, ...prev]);

      if (result.passed) {
        toast.success(`🎉 Congratulations! You passed with ${result.percentage}%!`);
      } else {
        toast.info(`Assessment evaluated. Score: ${result.percentage}%. Required: ${quiz.passingScore}%.`);
      }

      if (onComplete) {
        onComplete(result);
      }
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  // Format Timer String (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={`p-12 text-center rounded-3xl border ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
        <p className={`text-xs font-bold ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Loading assessment...
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={`p-10 text-center rounded-3xl border ${isNightMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <FileQuestion className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold mb-1">No Assessment Available</h3>
        <p className="text-xs">There is no active quiz attached to this unit.</p>
      </div>
    );
  }

  const activeQuestion = sanitizedQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0);
  }).length;
  const totalQuestions = sanitizedQuestions.length;

  return (
    <div className={`w-full max-w-4xl mx-auto font-['Sora'] transition-colors ${isNightMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. INTRO / WELCOME VIEW                                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {sessionState === 'intro' && (
        <div className="space-y-6">
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            {/* Header Title */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Assessment
                </span>
                {courseTitle && (
                  <span className={`text-[11px] font-medium ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    • {courseTitle}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {quiz.title}
              </h2>
              {quiz.description && (
                <p className={`text-xs sm:text-sm leading-relaxed ${isNightMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {quiz.description}
                </p>
              )}
            </div>

            {/* Assessment Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <FileQuestion className="w-4 h-4 text-indigo-500 mb-1" />
                <p className={`text-[10px] uppercase font-bold ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>Questions</p>
                <p className="text-base font-extrabold">{quiz.questions.length}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <Clock className="w-4 h-4 text-amber-500 mb-1" />
                <p className={`text-[10px] uppercase font-bold ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>Time Limit</p>
                <p className="text-base font-extrabold">{quiz.timeLimit && quiz.timeLimit > 0 ? `${quiz.timeLimit} Mins` : 'Unlimited'}</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <Award className="w-4 h-4 text-emerald-500 mb-1" />
                <p className={`text-[10px] uppercase font-bold ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>Passing Score</p>
                <p className="text-base font-extrabold">{quiz.passingScore}%</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <History className="w-4 h-4 text-sky-500 mb-1" />
                <p className={`text-[10px] uppercase font-bold ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>Attempts</p>
                <p className="text-base font-extrabold">
                  {attempts.length} {quiz.maxAttempts > 0 ? `/ ${quiz.maxAttempts}` : ''}
                </p>
              </div>
            </div>

            {/* Instructions */}
            {quiz.instructions && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex gap-3 ${isNightMode ? 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300' : 'bg-indigo-50/70 border-indigo-200 text-indigo-800'}`}>
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                <div>
                  <h4 className="font-bold mb-1">Instructions</h4>
                  <p>{quiz.instructions}</p>
                </div>
              </div>
            )}

            {/* Start Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs">
                {quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts ? (
                  <span className="text-rose-500 font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Maximum attempts reached ({quiz.maxAttempts}/{quiz.maxAttempts}).
                  </span>
                ) : (
                  <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Assessment is ready. Click Start to begin.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{attempts.length > 0 ? 'Retake Assessment' : 'Start Assessment'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Past Attempts Table */}
          {attempts.length > 0 && (
            <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" /> Previous Attempts ({attempts.length})
              </h3>

              <div className="space-y-2">
                {attempts.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-[11px] ${
                        att.passed
                          ? isNightMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'
                          : isNightMode ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        #{attempts.length - idx}
                      </span>
                      <div>
                        <p className="font-bold">{att.score} / {att.totalPoints} Points ({att.percentage}%)</p>
                        <p className={`text-[10px] ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(att.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                        att.passed
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {att.passed ? 'Passed' : 'Failed'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLatestResult(att);
                          setSessionState('result');
                        }}
                        className={`px-3 py-1 rounded-lg border text-[10px] font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 ${
                          isNightMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                        }`}
                      >
                        View Breakdown
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2. ACTIVE QUIZ SESSION                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {sessionState === 'in-progress' && activeQuestion && (
        <div className="space-y-6">
          
          {/* Top Timer & Progress Bar */}
          <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 shadow-xs ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className={`text-[11px] ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                ({answeredCount} answered)
              </span>
            </div>

            {secondsRemaining > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                secondsRemaining < 120
                  ? 'bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse'
                  : isNightMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-200 text-amber-600'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            )}
          </div>

          {/* Question Palette Navigation Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {sanitizedQuestions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== '' && (!Array.isArray(answers[q.id]) || (answers[q.id] as string[]).length > 0);
              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs scale-105 ring-2 ring-indigo-400'
                      : hasAnswer
                      ? isNightMode ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : isNightMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Main Question Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {activeQuestion.type === 'mcq' ? 'Multiple Choice' : activeQuestion.type === 'ms' ? 'Multiple Select' : activeQuestion.type === 'tf' ? 'True / False' : 'Short Answer'}
              </span>
              <span className={`text-xs font-mono font-semibold ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeQuestion.points || 1} Point{activeQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold leading-relaxed">
              {activeQuestion.question}
            </h3>

            {/* Options List for MCQ */}
            {activeQuestion.type === 'mcq' && (
              <div className="space-y-2.5">
                {(activeQuestion.options || []).map((option, optIdx) => {
                  const isSelected = answers[activeQuestion.id] === option;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(activeQuestion.id, option)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                          : isNightMode
                          ? 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center ${
                          isSelected ? 'bg-white/20 text-white' : isNightMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Options List for Multiple Select (MS) */}
            {activeQuestion.type === 'ms' && (
              <div className="space-y-2.5">
                <p className={`text-[11px] italic ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  (Select all correct options)
                </p>
                {(activeQuestion.options || []).map((option, optIdx) => {
                  const currentSelected = Array.isArray(answers[activeQuestion.id]) ? (answers[activeQuestion.id] as string[]) : [];
                  const isSelected = currentSelected.includes(option);
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleToggleMultipleOption(activeQuestion.id, option)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                          : isNightMode
                          ? 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-white border-white text-indigo-600' : 'border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False Cards */}
            {activeQuestion.type === 'tf' && (
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map((choice) => {
                  const isSelected = answers[activeQuestion.id] === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => handleSelectOption(activeQuestion.id, choice)}
                      className={`p-6 rounded-2xl border text-center font-bold text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : isNightMode
                          ? 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer Input */}
            {activeQuestion.type === 'short' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={(answers[activeQuestion.id] as string) || ''}
                  onChange={(e) => handleShortAnswerChange(activeQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className={`w-full p-4 rounded-2xl border text-xs focus:outline-hidden ${
                    isNightMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-30 ${
                  isNightMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Review & Submit Modal ─────────────────────────────────────────── */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl border max-w-md w-full shadow-2xl space-y-5 ${isNightMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="font-extrabold text-lg">Submit Assessment?</h3>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-emerald-500">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-amber-500">
                <span>Unanswered:</span>
                <span className="font-bold">{totalQuestions - answeredCount}</span>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <p className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" /> You still have {totalQuestions - answeredCount} unanswered question{totalQuestions - answeredCount > 1 ? 's' : ''}.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Back to Questions
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSubmitting ? 'Evaluating...' : 'Confirm & Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 3. RESULTS & EXPLANATIONS VIEW                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {sessionState === 'result' && latestResult && (
        <div className="space-y-6">
          
          {/* Result Score Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm text-center space-y-6 ${
            latestResult.passed
              ? isNightMode ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-emerald-50/70 border-emerald-200'
              : isNightMode ? 'bg-rose-950/20 border-rose-800/50' : 'bg-rose-50/70 border-rose-200'
          }`}>
            <div className="space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                latestResult.passed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}>
                {latestResult.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {latestResult.passed ? 'Assessment Passed' : 'Assessment Failed'}
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {latestResult.percentage}%
              </h2>
              <p className={`text-xs ${isNightMode ? 'text-slate-400' : 'text-slate-600'}`}>
                You earned <strong>{latestResult.score}</strong> out of <strong>{latestResult.totalPoints}</strong> points. (Required to pass: {quiz.passingScore}%)
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className={`p-3 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <p className="text-[10px] uppercase font-bold text-emerald-500">Correct</p>
                <p className="text-base font-extrabold">{latestResult.correctAnswersCount}</p>
              </div>

              <div className={`p-3 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <p className="text-[10px] uppercase font-bold text-rose-500">Incorrect</p>
                <p className="text-base font-extrabold">{latestResult.wrongAnswersCount}</p>
              </div>

              <div className={`p-3 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <p className="text-[10px] uppercase font-bold text-amber-500">Unanswered</p>
                <p className="text-base font-extrabold">{latestResult.unansweredCount}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSessionState('intro')}
                className={`px-5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
                  isNightMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                }`}
              >
                Back to Overview
              </button>

              {(!quiz.maxAttempts || attempts.length < quiz.maxAttempts) && (
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Breakdown & Explanations */}
          {latestResult.questionResults && latestResult.questionResults.length > 0 && (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" /> Question-by-Question Review
              </h3>

              <div className="space-y-4">
                {latestResult.questionResults.map((qr, idx) => (
                  <div
                    key={qr.questionId || idx}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      qr.isCorrect
                        ? isNightMode ? 'bg-emerald-950/10 border-emerald-900/40' : 'bg-emerald-50/50 border-emerald-200'
                        : isNightMode ? 'bg-rose-950/10 border-rose-900/40' : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                          qr.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold">{qr.question}</h4>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        qr.isCorrect ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
                      }`}>
                        {qr.isCorrect ? `+${qr.pointsAwarded} Pts` : '0 Pts'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`p-2.5 rounded-xl border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] text-slate-400 block font-semibold">Your Answer:</span>
                        <span className={qr.isCorrect ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                          {Array.isArray(qr.studentAnswer) ? qr.studentAnswer.join(', ') : qr.studentAnswer || '(Unanswered)'}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] text-slate-400 block font-semibold">Correct Answer:</span>
                        <span className="text-emerald-500 font-bold">
                          {Array.isArray(qr.correctAnswer) ? qr.correctAnswer.join(', ') : String(qr.correctAnswer)}
                        </span>
                      </div>
                    </div>

                    {qr.explanation && (
                      <div className={`p-3 rounded-xl text-xs leading-relaxed ${isNightMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        <strong className="text-[11px] block font-bold mb-0.5 text-indigo-500">Explanation:</strong>
                        <p>{qr.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default QuizPlayer;
