import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PlusCircle, Search, Trash2, Share2, Play,
  Zap, BarChart2, Check, Copy, X, Clock, Users, QrCode
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

export default function MyQuizzesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shareQuiz, setShareQuiz] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchMyQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizAPI.getAll();
      const userQuizzes = (res.data || []).filter(q => q.createdBy === user?.uid || q.creator?._id === user?.uid);
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
      setQuizzes(prev => prev.filter(q => (q.id || q._id) !== id));
    } catch (err) {
      toast.error('Failed to delete quiz', err?.message || 'Please try again.');
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
            <span className="neo-tag-pink text-xs uppercase mb-1">My Repository</span>
            <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
              <BookOpen className="w-7 h-7 text-[#EC4899]" /> My Quizzes
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Manage, share, and track performance of your created quizzes.
            </p>
          </div>

          <Link to="/create-quiz" className="neo-btn-pink py-2.5 px-5 text-sm self-start sm:self-auto">
            <PlusCircle className="w-4 h-4" /> Create New Quiz
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search your quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border-2 border-black font-bold text-slate-900 placeholder-slate-400 bg-white shadow-[2px_2px_0px_#000] focus:ring-2 focus:ring-[#EC4899]"
          />
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="neo-box p-5 bg-white animate-pulse">
                <div className="h-28 bg-slate-200 rounded-xl mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="neo-box p-12 text-center bg-white relative">
            <RotatingBadgeDoodle text="No Quizzes Yet • " icon={BookOpen} className="mx-auto mb-4" />
            <h3 className="text-xl font-black font-display text-slate-900">No quizzes created yet</h3>
            <p className="text-slate-500 font-medium text-xs mt-1">
              Create your first interactive quiz with custom questions and timer settings.
            </p>
            <Link to="/create-quiz" className="neo-btn-pink mt-4 text-xs py-2.5 px-6">
              <PlusCircle className="w-4 h-4" /> Create Quiz Now
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((q) => {
              const quizId = q.id || q._id;
              return (
                <motion.div
                  key={quizId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="neo-box p-5 bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="neo-tag-pink text-[10px] uppercase">
                        {q.category || 'General'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full border border-black font-bold text-[10px] bg-amber-300">
                        {q.difficulty || 'Medium'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 font-display leading-snug line-clamp-2 mb-1">
                      {q.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4">
                      {q.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 py-2 border-y-2 border-black mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#EC4899]" />
                        {q.questions?.length || 0} Qs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {q.timeLimit || 15}m
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <Link
                        to={`/quiz/${quizId}`}
                        className="p-2 rounded-xl border-2 border-black bg-pink-100 text-[#EC4899] font-black hover:bg-pink-200 flex items-center justify-center"
                        title="Take Quiz"
                      >
                        <Play className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/live?host=${quizId}`}
                        className="p-2 rounded-xl border-2 border-black bg-emerald-100 text-emerald-700 font-black hover:bg-emerald-200 flex items-center justify-center"
                        title="Host Live Game"
                      >
                        <Zap className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/analytics/${quizId}`}
                        className="p-2 rounded-xl border-2 border-black bg-purple-100 text-purple-700 font-black hover:bg-purple-200 flex items-center justify-center"
                        title="View Analytics"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setShareQuiz(q)}
                        className="p-2 rounded-xl border-2 border-black bg-amber-100 text-black font-black hover:bg-amber-200 flex items-center justify-center"
                        title="Share Quiz Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(quizId, q.title)}
                      className="w-full mt-2.5 py-1 text-center text-xs font-bold text-red-600 hover:underline flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Quiz
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
          {shareQuiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white neo-box max-w-sm w-full p-6 text-center"
              >
                <div className="flex justify-between items-center mb-3 border-b-2 border-black pb-2">
                  <h3 className="font-black text-slate-900 text-base font-display">Share Quiz Link</h3>
                  <button onClick={() => setShareQuiz(null)} className="text-black font-bold">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-14 h-14 bg-pink-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_#000]">
                  <QrCode className="w-7 h-7 text-[#EC4899]" />
                </div>

                <h4 className="font-black text-slate-900 text-sm mb-1">{shareQuiz.title}</h4>
                <p className="text-xs font-bold text-slate-500 mb-4">Anyone with this link can attempt this quiz.</p>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 border-2 border-black mb-4">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/quiz/${shareQuiz.id || shareQuiz._id}`}
                    className="bg-transparent text-xs font-bold text-slate-800 flex-1 outline-none truncate"
                  />
                  <button
                    onClick={() => copyShareLink(shareQuiz.id || shareQuiz._id)}
                    className="p-2 rounded-lg bg-[#EC4899] text-white border border-black font-bold text-xs shadow-[1px_1px_0px_#000]"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button onClick={() => setShareQuiz(null)} className="neo-btn-white w-full text-xs py-2">
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
