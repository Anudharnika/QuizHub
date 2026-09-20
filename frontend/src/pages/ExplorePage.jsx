import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Users, BookOpen, Clock, Play, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI } from '../services/api';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

const CATEGORIES = ['All', 'Programming', 'Mathematics', 'Science', 'General Knowledge', 'History', 'Aptitude', 'AI & ML', 'Web Development'];
const DIFFICULTIES = ['All', 'Easy', 'Intermediate', 'Hard'];

function QuizCard({ quiz, delay }) {
  const quizId = quiz.id || quiz._id;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="neo-box p-5 bg-white flex flex-col justify-between hover:translate-y-[-3px]"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="neo-tag-pink text-[10px] uppercase">
            {quiz.category || 'General'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full border border-black font-extrabold text-[10px] bg-amber-300 shadow-[1px_1px_0px_#000]">
            {quiz.difficulty || 'Medium'}
          </span>
        </div>

        <h3 className="font-extrabold text-base text-slate-900 font-display leading-snug line-clamp-2 mb-2">
          {quiz.title}
        </h3>
        <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4">
          {quiz.description || 'No description provided.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 py-2 border-y-2 border-black mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#EC4899]" />
            {quiz.questions?.length || 0} Qs
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            {quiz.timeLimit || 15}m
          </span>
        </div>

        <Link
          to={`/quiz/${quizId}`}
          className="w-full neo-btn-pink text-xs py-2.5 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" /> Start Quiz Now
        </Link>
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      const res = await quizAPI.getAll(params);
      setQuizzes(res.data || []);
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, [category, difficulty]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-x-hidden min-w-0">
      <div className="max-w-7xl mx-auto space-y-6 pb-12 w-full min-w-0">
        
        {/* Header */}
        <div>
          <span className="neo-tag-pink text-xs uppercase mb-1">Campus Discovery</span>
          <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
            <Zap className="w-7 h-7 text-[#EC4899]" /> Explore Campus Quizzes
          </h1>
          <p className="text-slate-600 font-medium text-sm mt-1">
            Discover, attempt, and learn from quizzes created across college departments.
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full max-w-full">
          <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search quizzes, topics..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border-2 border-black font-bold text-slate-900 bg-white shadow-[2px_2px_0px_#000] focus:ring-2 focus:ring-[#EC4899]"
            />
          </form>

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="px-4 py-2.5 rounded-full border-2 border-black font-extrabold text-xs bg-white shadow-[2px_2px_0px_#000] w-full sm:w-auto"
          >
            {DIFFICULTIES.map(d => <option key={d} value={d}>Difficulty: {d}</option>)}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin w-full max-w-full">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full font-extrabold text-xs border-2 border-black transition-all ${
                category === c
                  ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-slate-800 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* All quizzes Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full max-w-full min-w-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="neo-box p-5 bg-white animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-full mb-4" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full max-w-full min-w-0">
            {quizzes.map((quiz, i) => <QuizCard key={quiz.id || quiz._id || i} quiz={quiz} delay={i * 0.05} />)}
          </div>
        ) : (
          <div className="neo-box p-12 text-center bg-white">
            <RotatingBadgeDoodle text="Search Campus Quizzes • " icon={Search} className="mx-auto mb-4" />
            <h3 className="text-xl font-black font-display text-slate-900">No quizzes found</h3>
            <p className="text-slate-500 font-medium text-xs mt-1">Try adjusting your search terms or filters.</p>
          </div>
        )}

      </div>
      </div>
    </DashboardLayout>
  );
}
