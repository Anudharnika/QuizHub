import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, TrendingUp, Users, BookOpen, Star, Clock, ChevronRight, BarChart2, Zap, ArrowRight, Sparkles, Info } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, quizAPI } from '../services/api';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="neo-box p-5 flex items-start gap-4 bg-white relative">
      <div className={`w-12 h-12 rounded-2xl ${color} border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_#000]`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-black uppercase text-slate-500 font-display">{label}</p>
        <p className="text-3xl font-black text-slate-900 font-display mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white text-xs font-bold rounded-xl px-3 py-2 border-2 border-black shadow-[3px_3px_0px_#000]">
      <p className="font-extrabold mb-1 font-display">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[#EC4899]">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, quizzesRes] = await Promise.all([
          analyticsAPI.getMe(),
          quizAPI.getAll()
        ]);
        const analyticsData = analyticsRes.data;
        setAnalytics(analyticsData);

        // Build real weekly chart from actual attempt history
        const recentAttempts = analyticsData?.recentAttempts || [];
        if (recentAttempts.length > 0) {
          const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
          const grouped = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = dayMap[d.getDay()];
            grouped[label] = { day: label, quizzes: 0, scoreSum: 0, count: 0 };
          }
          recentAttempts.forEach(a => {
            const d = new Date(a.submittedAt);
            const label = dayMap[d.getDay()];
            if (grouped[label]) {
              grouped[label].quizzes += 1;
              grouped[label].scoreSum += a.score || 0;
              grouped[label].count += 1;
            }
          });
          setActivityData(
            Object.values(grouped).map(g => ({
              day: g.day,
              quizzes: g.quizzes,
              score: g.count > 0 ? Math.round(g.scoreSum / g.count) : 0
            }))
          );
        } else {
          setActivityData([]);
        }

        const currentUserQuizzes = (quizzesRes.data || []).filter(
          q => q.createdBy === user?.uid || q.creator?._id === user?.uid
        );
        setMyQuizzes(currentUserQuizzes.slice(0, 4));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const stats = [
    { icon: BookOpen, label: 'Quizzes Created', value: loading ? '—' : myQuizzes.length, color: 'bg-[#EC4899]' },
    { icon: Star, label: 'Quizzes Taken', value: loading ? '—' : (analytics?.totalQuizzesTaken ?? 0), color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'Average Score', value: loading ? '—' : `${analytics?.averageScore ?? 0}%`, color: 'bg-emerald-500' },
    { icon: BarChart2, label: 'Highest Score', value: loading ? '—' : `${analytics?.highestScore ?? 0}%`, color: 'bg-amber-400' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black bg-amber-300 font-extrabold text-xs shadow-[2px_2px_0px_#000] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" /> College Campus Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
              Welcome back, <span className="neo-tag-pink px-2 py-0.5">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Here's what's happening with your quizzes today.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <Link to="/live" className="neo-btn-white text-xs py-2 sm:py-2.5 px-3.5 sm:px-4 flex-1 sm:flex-none">
              <Zap className="w-4 h-4 text-[#EC4899]" /> Live Mode
            </Link>
            <Link to="/create-quiz" className="neo-btn-pink text-xs py-2 sm:py-2.5 px-4 sm:px-5 flex-1 sm:flex-none">
              <PlusCircle className="w-4 h-4" /> New Quiz
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={i} {...s} delay={i * 0.1} />)}
        </div>

        {/* Activity Charts — only shown when there is real attempt data */}
        {activityData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Quiz Activity Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="neo-box p-6 lg:col-span-3 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-extrabold text-lg text-slate-900 font-display">Quiz Activity</h2>
                  <p className="text-xs font-bold text-slate-500">Quizzes taken over the last 7 days</p>
                </div>
                <BarChart2 className="w-6 h-6 text-[#EC4899]" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="quizzes" name="Quizzes" stroke="#EC4899" strokeWidth={3} fill="url(#quizGrad)" dot={{ r: 4, fill: '#EC4899', stroke: '#000', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Average Scores Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="neo-box p-6 lg:col-span-2 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-extrabold text-lg text-slate-900 font-display">Avg. Scores</h2>
                  <p className="text-xs font-bold text-slate-500">Your score trend this week</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activityData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="Score %" fill="#10B981" radius={[6, 6, 0, 0]} stroke="#000" strokeWidth={1.5} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        ) : (
          !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="neo-box p-5 bg-white flex items-center gap-4 text-slate-500">
              <Info className="w-6 h-6 text-[#EC4899] flex-shrink-0" />
              <div>
                <p className="font-black text-slate-900 text-sm">No activity charts yet</p>
                <p className="text-xs font-medium mt-0.5">Take some quizzes and your weekly performance charts will appear here.</p>
              </div>
            </motion.div>
          )
        )}

        {/* My Recent Quizzes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-xl text-slate-900 font-display">My Recent Quizzes</h2>
            <Link to="/my-quizzes" className="text-xs font-black text-[#EC4899] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {myQuizzes.length === 0 ? (
            <div className="neo-box p-8 sm:p-12 text-center bg-white relative">
              <RotatingBadgeDoodle text="Create First Quiz • " icon={BookOpen} className="mx-auto mb-4" />
              <h3 className="font-black text-2xl font-display text-slate-900 mb-2">No quizzes created yet</h3>
              <p className="text-slate-600 font-medium text-sm mb-6 max-w-md mx-auto">
                Generate your first quiz with AI or craft custom questions to engage your campus peers.
              </p>
              <Link to="/create-quiz" className="neo-btn-pink py-3 px-8 text-sm">
                <PlusCircle className="w-4 h-4" /> Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {myQuizzes.map((quiz) => (
                <div key={quiz.id} className="neo-box p-5 bg-white flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full border border-black font-extrabold text-[10px] bg-amber-300 shadow-[1px_1px_0px_#000] inline-block mb-3">
                      {quiz.category || 'General'}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 font-display leading-tight line-clamp-2 mb-2">{quiz.title}</h3>
                    <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-4">{quiz.description}</p>
                  </div>
                  <div className="pt-3 border-t-2 border-black flex justify-between items-center text-xs font-bold">
                    <span>{quiz.questions?.length || 0} Questions</span>
                    <Link to={`/quiz/${quiz.id}`} className="text-[#EC4899] font-black hover:underline flex items-center">
                      Play <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h2 className="font-black text-xl text-slate-900 font-display mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { to: '/create-quiz', icon: PlusCircle, label: 'Create Quiz', bg: 'bg-pink-100 text-[#EC4899]' },
              { to: '/explore', icon: Star, label: 'Explore Quizzes', bg: 'bg-purple-100 text-purple-600' },
              { to: '/question-bank', icon: BookOpen, label: 'Question Bank', bg: 'bg-emerald-100 text-emerald-600' },
              { to: '/leaderboard', icon: TrendingUp, label: 'Leaderboard', bg: 'bg-amber-100 text-amber-600' },
            ].map((action, i) => (
              <Link key={i} to={action.to}
                className="neo-box p-5 bg-white flex flex-col items-center justify-center text-center gap-2 group hover:translate-y-[-3px]">
                <div className={`w-12 h-12 rounded-2xl ${action.bg} border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-sm text-slate-900 font-display">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
