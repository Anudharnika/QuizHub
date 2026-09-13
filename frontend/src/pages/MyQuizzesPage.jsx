import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PlusCircle, Search, Trash2, Edit3, Share2, Play,
  Zap, BarChart2, Check, Copy, X, Clock, Users, Star, ExternalLink, QrCode
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function MyQuizzesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shareQuiz, setShareQuiz] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchMyQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizAPI.getAll();
      // Filter quizzes created by the current user
      const userQuizzes = res.data.filter(q => q.creator?._id === user?._id);
      setQuizzes(userQuizzes);
    } catch (err) {
      console.error('Failed to load my quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyQuizzes();
  }, [user]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await quizAPI.delete(id);
      toast.success('Quiz deleted', `"${title}" has been deleted.`);
      setQuizzes(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      toast.error('Failed to delete quiz', err?.response?.data?.message || 'Please try again.');
    }
  };

  const copyShareLink = (quizId) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!', 'Unique quiz link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Quizzes</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Manage, share, and track performance of your created quizzes.
                </p>
              </div>
            </div>
          </div>

          <Link to="/create-quiz" className="btn-primary self-start sm:self-auto">
            <PlusCircle className="w-4 h-4" /> Create New Quiz
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4 text-sm"
          />
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse flex flex-col gap-3">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No quizzes created yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create your first interactive quiz with custom questions and timer settings.
            </p>
            <Link to="/create-quiz" className="btn-primary mt-5 mx-auto text-xs">
              <PlusCircle className="w-4 h-4" /> Create Quiz Now
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((q) => (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-0 overflow-hidden flex flex-col hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800"
              >
                {/* Cover visual */}
                <div className="h-36 relative bg-gradient-to-tr from-indigo-600 to-violet-500 overflow-hidden">
                  {q.coverImage ? (
                    <img
                      src={q.coverImage}
                      alt={q.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl">
                      📝
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="badge bg-black/60 text-white backdrop-blur-sm text-[11px]">
                      {q.difficulty}
                    </span>
                    <span className="badge bg-indigo-600/90 text-white backdrop-blur-sm text-[11px]">
                      {q.visibility || 'Public'}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
                      {q.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 mb-1">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {q.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    {/* Stats bar */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-2.5 border-y border-slate-100 dark:border-slate-800 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        {q.questions?.length || 0} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        {q.attemptsCount || 0} Plays
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {q.timeLimit}m
                      </span>
                    </div>

                    {/* Quick action buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      <Link
                        to={`/quiz/${q._id}`}
                        className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                        title="Take Quiz"
                      >
                        <Play className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/live?host=${q._id}`}
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                        title="Host Live Game"
                      >
                        <Zap className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/analytics/${q._id}`}
                        className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 flex items-center justify-center transition-colors"
                        title="View Analytics"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setShareQuiz(q)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        title="Share Quiz Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(q._id, q.title)}
                      className="w-full mt-2.5 py-1.5 text-center text-xs text-red-500 hover:text-red-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Quiz
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Share Modal with QR code and link */}
        <AnimatePresence>
          {shareQuiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 text-center"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Share Quiz</h3>
                  <button onClick={() => setShareQuiz(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-8 h-8" />
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{shareQuiz.title}</h4>
                <p className="text-xs text-slate-400 mb-5">Anyone with this link can take this quiz.</p>

                {/* Link input */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/quiz/${shareQuiz._id}`}
                    className="bg-transparent text-xs text-slate-600 dark:text-slate-300 flex-1 outline-none truncate"
                  />
                  <button
                    onClick={() => copyShareLink(shareQuiz._id)}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-700 flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setShareQuiz(null)}
                  className="btn-secondary w-full text-xs"
                >
                  Done
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
