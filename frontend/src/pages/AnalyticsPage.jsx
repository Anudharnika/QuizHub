import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, Users, Clock, CheckCircle, XCircle, Award,
  ArrowUpRight, ArrowDownRight, BookOpen, AlertCircle, ChevronLeft
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import DashboardLayout from '../components/common/DashboardLayout';
import { analyticsAPI, quizAPI } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function AnalyticsPage() {
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [quizzesList, setQuizzesList] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(quizId || '');

  useEffect(() => {
    // Load available quizzes for quick selector
    quizAPI.getAll().then(res => setQuizzesList(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        if (selectedQuizId) {
          const res = await analyticsAPI.getQuiz(selectedQuizId);
          setData({ type: 'quiz', ...res.data });
        } else {
          const res = await analyticsAPI.getMe();
          setData({ type: 'user', ...res.data });
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedQuizId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#6366f1' }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || '#6366f1' }} />
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header with Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {selectedQuizId && (
                <button
                  onClick={() => setSelectedQuizId('')}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedQuizId ? `Quiz Analytics: ${data?.quiz?.title || ''}` : 'Performance Analytics'}
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {selectedQuizId ? 'In-depth question accuracy, participant metrics, and distribution' : 'Track your quiz performance trends, activity, and learning outcomes.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="input text-xs sm:text-sm max-w-xs"
            >
              <option value="">📊 Overview (My Account)</option>
              {quizzesList.map(q => (
                <option key={q._id} value={q._id}>📝 {q.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-72">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedQuizId && data?.type === 'quiz' ? (
          /* ==================================================== */
          /* QUIZ SPECIFIC ANALYTICS                              */
          /* ==================================================== */
          <div className="space-y-6">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Total Attempts</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.overview?.totalAttempts || 0}</p>
                <p className="text-xs text-indigo-500 mt-1 flex items-center gap-0.5">
                  <Users className="w-3.5 h-3.5 inline" /> participants
                </p>
              </div>

              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Average Score</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{data.overview?.averageScore || 0}%</p>
                <p className="text-xs text-slate-500 mt-1">Platform baseline: 72%</p>
              </div>

              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Pass Rate</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{data.overview?.completionRate || 0}%</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-0.5">
                  <CheckCircle className="w-3.5 h-3.5 inline" /> Above threshold
                </p>
              </div>

              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Avg Time Taken</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {Math.floor((data.overview?.avgTimeTaken || 0) / 60)}m {(data.overview?.avgTimeTaken || 0) % 60}s
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-0.5">
                  <Clock className="w-3.5 h-3.5 inline" /> per completion
                </p>
              </div>
            </div>

            {/* Easiest vs Hardest Question */}
            <div className="grid md:grid-cols-2 gap-4">
              {data.easiestQuestion && (
                <div className="card p-5 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <CheckCircle className="w-4 h-4" /> Easiest Question ({data.easiestQuestion.correct}% Accuracy)
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {data.easiestQuestion.questionText}
                  </p>
                </div>
              )}

              {data.hardestQuestion && (
                <div className="card p-5 bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800/50">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <AlertCircle className="w-4 h-4" /> Hardest Question ({data.hardestQuestion.correct}% Accuracy)
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {data.hardestQuestion.questionText}
                  </p>
                </div>
              )}
            </div>

            {/* Charts: Score Distribution & Question Accuracy */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">Score Distribution</h3>
                    <p className="text-xs text-slate-400">Number of participants across score bands</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.scoreDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Participants" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Activity Trend */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">Attempts Over Time</h3>
                    <p className="text-xs text-slate-400">Daily participant volume</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.activityData || []}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="attempts" name="Attempts" stroke="#10b981" strokeWidth={2} fill="url(#colorAtt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Question by Question Accuracy List */}
            <div className="card space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Question Accuracy Breakdown</h3>
              <div className="space-y-3">
                {data.questionAnalytics?.map((qa, i) => (
                  <div key={qa.questionId || i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between gap-4 text-xs font-medium mb-2">
                      <span className="text-slate-700 dark:text-slate-200 line-clamp-1 flex-1">
                        <span className="font-bold text-indigo-500 mr-2">Q{i + 1}</span>
                        {qa.questionText}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white flex-shrink-0">
                        {qa.correct}% Correct
                      </span>
                    </div>

                    {/* Stacked bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div style={{ width: `${qa.correct}%` }} className="bg-emerald-500 h-full" title={`Correct: ${qa.correct}%`} />
                      <div style={{ width: `${qa.wrong}%` }} className="bg-red-500 h-full" title={`Wrong: ${qa.wrong}%`} />
                      <div style={{ width: `${qa.skipped}%` }} className="bg-slate-400 h-full" title={`Skipped: ${qa.skipped}%`} />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {qa.correct}% Correct</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {qa.wrong}% Wrong</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> {qa.skipped}% Skipped</span>
                      <span className="ml-auto">{qa.totalResponses} total attempts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* USER OVERVIEW ANALYTICS                              */
          /* ==================================================== */
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Quizzes Taken</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data?.totalQuizzesTaken || 0}</p>
                <p className="text-xs text-indigo-500 mt-1">Completed tests</p>
              </div>

              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Average Score</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{data?.averageScore || 0}%</p>
                <p className="text-xs text-emerald-600 mt-1">Across all quizzes</p>
              </div>

              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Quizzes Created</span>
                <p className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">{data?.totalQuizzesCreated || 0}</p>
                <p className="text-xs text-violet-500 mt-1">Published</p>
              </div>

              <div className="card">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Participants Hosted</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{data?.totalParticipants || 0}</p>
                <p className="text-xs text-amber-600 mt-1">Total quiz plays</p>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">Weekly Activity & Scores</h3>
                  <p className="text-xs text-slate-400">Your test count and score progression</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data?.activityData || []}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" name="Avg Score %" stroke="#6366f1" strokeWidth={2} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Attempts Table */}
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-4">Recent Attempts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-400 uppercase">
                      <th className="pb-3">Quiz</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(data?.recentAttempts || []).map((att, i) => (
                      <tr key={att._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {att.quizTitle}
                        </td>
                        <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">
                          {att.score} / {att.totalPoints}
                        </td>
                        <td className="py-3">
                          <span className={`badge ${att.percentage >= 70 ? 'badge-emerald' : 'badge-amber'}`}>
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-xs">
                          {Math.floor(att.timeTaken / 60)}m {att.timeTaken % 60}s
                        </td>
                        <td className="py-3 text-slate-400 text-xs">
                          {new Date(att.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/result/${att._id}`}
                            className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:underline inline-flex items-center gap-1"
                          >
                            Review <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
