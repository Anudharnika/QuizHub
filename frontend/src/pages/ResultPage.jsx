import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, CheckCircle, XCircle, Clock, Target, RotateCcw, Share2,
  ChevronDown, ChevronUp, ArrowRight, BarChart2, BookOpen, Award, Check, Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DashboardLayout from '../components/common/DashboardLayout';
import { attemptAPI, quizAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [loading, setLoading] = useState(!location.state?.attempt);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let att = attempt;
        if (!att) {
          const res = await attemptAPI.getById(id);
          att = res.data;
          setAttempt(att);
        }
        if (att && !quiz && att.quizId) {
          const qRes = await quizAPI.getById(att.quizId);
          setQuiz(qRes.data);
        }
      } catch (err) {
        console.error('Failed to load result', err);
        toast.error('Result not found', 'Could not load quiz attempt details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (attempt && attempt.percentage >= 70) {
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [attempt]);

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!', 'Result link copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-80 gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading quiz performance...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!attempt) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Attempt not found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">The requested attempt could not be found.</p>
          <Link to="/explore" className="btn-primary mt-6">Explore Quizzes</Link>
        </div>
      </DashboardLayout>
    );
  }

  const passed = attempt.percentage >= (quiz?.passingScore || 70);
  const correctCount = attempt.answers?.filter(a => a.isCorrect).length || 0;
  const totalCount = attempt.answers?.length || (quiz?.questions?.length || 0);
  const wrongCount = totalCount - correctCount;
  const mins = Math.floor(attempt.timeTaken / 60);
  const secs = attempt.timeTaken % 60;
  const timeFormatted = `${mins > 0 ? `${mins}m ` : ''}${secs}s`;

  // Map question details from quiz if available
  const questionDetails = (quiz?.questions || []).map((q, i) => {
    const ans = attempt.answers?.find(a => a.questionId === q.id) || {};
    return {
      ...q,
      userResponse: ans.userResponse,
      isCorrect: ans.isCorrect,
      pointsEarned: ans.pointsEarned ?? (ans.isCorrect ? q.points : 0)
    };
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Top Celebration Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`card relative overflow-hidden text-center p-8 border-2 ${
            passed
              ? 'bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-300 dark:border-emerald-800/60 shadow-emerald-500/10'
              : 'bg-gradient-to-b from-amber-50/70 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-300 dark:border-amber-800/60 shadow-amber-500/10'
          }`}
        >
          {/* Badge icon */}
          <div className="relative inline-block mb-3">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
              passed ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/30' : 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-amber-500/30'
            }`}>
              {passed ? <Trophy className="w-10 h-10 animate-bounce" /> : <Award className="w-10 h-10" />}
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {passed ? 'Outstanding Job!' : 'Good Effort! Keep Practicing'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto text-sm">
            {passed
              ? `You scored ${attempt.percentage}% and passed "${attempt.quizTitle || quiz?.title || 'Quiz'}". Great mastery!`
              : `You scored ${attempt.percentage}%. The passing score is ${quiz?.passingScore || 70}%. Review mistakes and try again!`}
          </p>

          {/* Key Metric Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Score</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {attempt.score} <span className="text-xs font-medium text-slate-400">/ {attempt.totalPoints || 100}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Accuracy</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {attempt.accuracy ?? attempt.percentage}%
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Correct / Wrong</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                <span className="text-emerald-600">{correctCount}</span>
                <span className="text-slate-300 dark:text-slate-600 mx-1">/</span>
                <span className="text-red-500">{wrongCount}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Time Taken</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center justify-center gap-1">
                <Clock className="w-5 h-5 text-indigo-500" />
                {timeFormatted}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              to={`/quiz/${attempt.quizId}`}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 px-6 py-3"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </Link>

            <Link
              to={`/analytics/${attempt.quizId}`}
              className="btn-secondary px-5 py-3"
            >
              <BarChart2 className="w-4 h-4" /> View Quiz Analytics
            </Link>

            <button
              onClick={copyShareLink}
              className="btn-secondary px-5 py-3 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied Link' : 'Share Result'}
            </button>
          </div>
        </motion.div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detailed Question Breakdown</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review your answers, correct solutions, and explanations.</p>
            </div>
            <span className="badge badge-indigo">
              {correctCount} of {totalCount} Correct
            </span>
          </div>

          <div className="space-y-3">
            {questionDetails.length > 0 ? (
              questionDetails.map((q, idx) => {
                const isExpanded = expandedQuestions[idx] ?? false;
                return (
                  <motion.div
                    key={q.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`card p-5 border-l-4 transition-all ${
                      q.isCorrect
                        ? 'border-l-emerald-500 bg-white dark:bg-slate-800'
                        : 'border-l-red-500 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer select-none"
                      onClick={() => toggleQuestion(idx)}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 flex-shrink-0">
                          {q.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Question {idx + 1}</span>
                            <span className="badge badge-slate">{q.type || 'MCQ'}</span>
                            <span className={`text-xs font-semibold ${q.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                              {q.pointsEarned ?? 0} / {q.points || 10} pts
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                            {q.questionText}
                          </p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Question image if any */}
                    {q.imageUrl && isExpanded && (
                      <img
                        src={q.imageUrl}
                        alt="Question visual"
                        className="mt-3 rounded-xl max-h-48 object-cover border border-slate-200 dark:border-slate-700"
                      />
                    )}

                    {/* Options / Answers view */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                      {q.options && q.options.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isUserPick = Array.isArray(q.userResponse)
                              ? q.userResponse.includes(opt)
                              : q.userResponse === opt;
                            const isCorrectOpt = Array.isArray(q.correctAnswer)
                              ? q.correctAnswer.includes(opt)
                              : q.correctAnswer === opt;

                            let optStyle = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400';
                            if (isCorrectOpt) {
                              optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold';
                            } else if (isUserPick && !isCorrectOpt) {
                              optStyle = 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-medium';
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${optStyle}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                  {opt}
                                </span>
                                <span className="text-[11px] flex items-center gap-1 font-semibold">
                                  {isUserPick && <span className="badge badge-indigo text-[10px]">Your Answer</span>}
                                  {isCorrectOpt && <span className="badge badge-emerald text-[10px]">Correct</span>}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                          <p className="text-slate-600 dark:text-slate-400">
                            Your response: <span className={`font-semibold ${q.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>{q.userResponse || 'No answer submitted'}</span>
                          </p>
                          {!q.isCorrect && (
                            <p className="text-slate-600 dark:text-slate-400">
                              Correct answer: <span className="font-semibold text-emerald-600">{q.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (isExpanded || !q.isCorrect) && (
                        <div className="mt-2 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
                          <span className="font-bold block mb-0.5">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              (attempt.answers || []).map((ans, idx) => (
                <div key={idx} className="card p-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {ans.isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <span>Question {idx + 1}</span>
                  </div>
                  <span className="font-bold">{ans.pointsEarned} pts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
