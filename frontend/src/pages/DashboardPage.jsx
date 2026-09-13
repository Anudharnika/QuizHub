import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, TrendingUp, Users, BookOpen, Star, Clock, ChevronRight, BarChart2, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, quizAPI } from '../services/api';

const DIFF_COLORS = { Easy: 'difficulty-easy', Intermediate: 'difficulty-intermediate', Hard: 'difficulty-hard' };

function StatCard({ icon: Icon, label, value, change, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
        {change !== undefined && (
          <p className={`text-xs font-medium mt-0.5 ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this week
          </p>
        )}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, quizzesRes] = await Promise.all([
          analyticsAPI.getMe(),
          quizAPI.getAll({ sort: 'new' })
        ]);
        setAnalytics(analyticsRes.data);
        // Filter only user's quizzes
        setMyQuizzes(quizzesRes.data.filter(q => q.creator?._id === user?._id).slice(0, 4));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const activityData = analytics?.activityData || [
    { day: 'Mon', quizzes: 2, score: 75 },
    { day: 'Tue', quizzes: 1, score: 88 },
    { day: 'Wed', quizzes: 4, score: 92 },
    { day: 'Thu', quizzes: 2, score: 70 },
    { day: 'Fri', quizzes: 3, score: 85 },
    { day: 'Sat', quizzes: 5, score: 91 },
    { day: 'Sun', quizzes: 1, score: 78 },
  ];

  const stats = [
    { icon: BookOpen, label: 'Quizzes Created', value: analytics?.totalQuizzesCreated ?? 0, change: 12, color: 'bg-indigo-500' },
    { icon: Star, label: 'Quizzes Taken', value: analytics?.totalQuizzesTaken ?? 0, change: 8, color: 'bg-violet-500' },
    { icon: TrendingUp, label: 'Average Score', value: `${analytics?.averageScore ?? 0}%`, change: 3, color: 'bg-emerald-500' },
    { icon: Users, label: 'Total Participants', value: analytics?.totalParticipants ?? 0, change: 24, color: 'bg-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Here's what's happening with your quizzes today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/live" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-800">
              <Zap className="w-4 h-4" /> Live Mode
            </Link>
            <Link to="/create-quiz" className="btn-primary">
              <PlusCircle className="w-4 h-4" /> New Quiz
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => <StatCard key={i} {...s} delay={i * 0.1} />)}
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Activity Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Quiz Activity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quizzes taken over the last 7 days</p>
              </div>
              <BarChart2 className="w-5 h-5 text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="quizzes" name="Quizzes" stroke="#6366f1" strokeWidth={2} fill="url(#quizGrad)" dot={{ r: 3, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Score Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Avg. Scores</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your score trend this week</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={activityData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Score %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Quizzes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white text-lg">My Recent Quizzes</h2>
            <Link to="/my-quizzes" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {myQuizzes.length === 0 && !loading ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No quizzes yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Create your first quiz and start engaging your audience.</p>
              <Link to="/create-quiz" className="btn-primary mx-auto">
                <PlusCircle className="w-4 h-4" /> Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(loading ? Array(4).fill(null) : myQuizzes).map((quiz, i) => (
                <div key={quiz?._id || i} className={`card hover:shadow-md transition-shadow group ${loading ? 'animate-pulse' : ''}`}>
                  {loading ? (
                    <>
                      <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3" />
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                    </>
                  ) : (
                    <>
                      {quiz.coverImage && (
                        <img src={quiz.coverImage} alt={quiz.title}
                          className="w-full h-28 object-cover rounded-xl mb-3 group-hover:opacity-90 transition-opacity" />
                      )}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">{quiz.title}</h3>
                        <span className={`${DIFF_COLORS[quiz.difficulty] || 'badge-slate'} flex-shrink-0`}>{quiz.difficulty}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">{quiz.category}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {quiz.questions?.length || 0} Qs</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {quiz.attemptsCount}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {quiz.averageScore}%</span>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <Link to={`/quiz/${quiz._id}`} className="flex-1 text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 py-1">
                          View
                        </Link>
                        <Link to={`/analytics/${quiz._id}`} className="flex-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 py-1">
                          Analytics
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 className="font-semibold text-slate-900 dark:text-white text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { to: '/create-quiz', icon: PlusCircle, label: 'Create Quiz', color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' },
              { to: '/explore', icon: Star, label: 'Explore Quizzes', color: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50' },
              { to: '/question-bank', icon: BookOpen, label: 'Question Bank', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' },
              { to: '/leaderboard', icon: TrendingUp, label: 'Leaderboard', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50' },
            ].map((action, i) => (
              <Link key={i} to={action.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} transition-all text-center font-medium text-sm border border-transparent`}>
                <action.icon className="w-6 h-6" />
                {action.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
