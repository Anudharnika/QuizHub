import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, BookOpen, Clock, Play, ChevronRight, TrendingUp, Zap, Award } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { quizAPI } from '../services/api';

const CATEGORIES = ['All', 'Programming', 'Mathematics', 'Science', 'General Knowledge', 'History', 'Aptitude', 'AI & ML', 'Web Development'];
const DIFFICULTIES = ['All', 'Easy', 'Intermediate', 'Hard'];
const SORTS = [
  { value: 'new', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

const DIFF_COLORS = { Easy: 'difficulty-easy', Intermediate: 'difficulty-intermediate', Hard: 'difficulty-hard' };
const CAT_EMOJIS = { Programming: '💻', Mathematics: '📐', Science: '🔬', 'General Knowledge': '🌍', History: '📜', Aptitude: '🧩', 'AI & ML': '🤖', 'Web Development': '🌐' };

function QuizCard({ quiz, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
    >
      {quiz.coverImage && (
        <div className="relative overflow-hidden rounded-xl mb-4 h-36">
          <img src={quiz.coverImage} alt={quiz.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={`absolute bottom-2 left-2 ${DIFF_COLORS[quiz.difficulty] || 'badge-slate'}`}>
            {quiz.difficulty}
          </span>
        </div>
      )}
      {!quiz.coverImage && (
        <div className="h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 mb-4 flex items-center justify-center">
          <span className="text-3xl">{CAT_EMOJIS[quiz.category] || '📝'}</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">{quiz.title}</h3>
        {!quiz.coverImage && <span className={`${DIFF_COLORS[quiz.difficulty] || 'badge-slate'} flex-shrink-0`}>{quiz.difficulty}</span>}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{quiz.description}</p>

      {/* Creator */}
      <div className="flex items-center gap-2 mb-3">
        <img src={quiz.creator?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${quiz.creator?.name}`}
          alt={quiz.creator?.name} className="w-5 h-5 rounded-full" />
        <span className="text-xs text-slate-500 dark:text-slate-400">{quiz.creator?.name}</span>
        <span className="badge badge-slate ml-auto">{quiz.category}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {quiz.questions?.length || 0} Qs</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {quiz.attemptsCount}</span>
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {quiz.rating?.toFixed(1)}</span>
        <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" /> {quiz.timeLimit}m</span>
      </div>

      <Link to={`/quiz/${quiz._id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors group-hover:shadow-md group-hover:shadow-indigo-500/25">
        <Play className="w-4 h-4" /> Start Quiz
      </Link>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('popular');

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      const res = await quizAPI.getAll(params);
      setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, [category, difficulty, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  const featuredQuizzes = quizzes.slice(0, 3);
  const restQuizzes = quizzes.slice(3);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Explore Quizzes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Discover, play, and learn from thousands of community quizzes.</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search quizzes, tags, topics..."
              className="input pl-9 pr-4" />
          </form>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input w-auto">
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {SORTS.map(s => (
              <button key={s.value} onClick={() => setSort(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sort === s.value ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'}`}>
              {CAT_EMOJIS[c] && `${CAT_EMOJIS[c]} `}{c}
            </button>
          ))}
        </div>

        {/* Featured / Trending row */}
        {!loading && featuredQuizzes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Trending Now</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {featuredQuizzes.map((quiz, i) => <QuizCard key={quiz._id} quiz={quiz} delay={i * 0.1} />)}
            </div>
          </div>
        )}

        {/* All quizzes */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : restQuizzes.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">All Quizzes</h2>
              <span className="badge badge-slate">{quizzes.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {restQuizzes.map((quiz, i) => <QuizCard key={quiz._id} quiz={quiz} delay={i * 0.05} />)}
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No quizzes found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Try different search terms or filters.</p>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
