import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, Users, Clock, CheckCircle, Award,
  BookOpen, ChevronLeft, Info
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import DashboardLayout from '../components/common/DashboardLayout';
import { analyticsAPI, quizAPI } from '../services/api';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

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

export default function AnalyticsPage() {
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [quizzesList, setQuizzesList] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(quizId || '');
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    quizAPI.getAll().then(res => setQuizzesList(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        let result;
        if (selectedQuizId) {
          const res = await analyticsAPI.getQuiz(selectedQuizId);
          result = { type: 'quiz', ...res.data };
        } else {
          const res = await analyticsAPI.getMe();
          result = { type: 'user', ...res.data };
        }
        setData(result);

        // Build real weekly chart from actual attempt records
        const attempts = result?.recentAttempts || result?.attempts || [];
        if (attempts.length > 0) {
          const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
          const grouped = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = dayMap[d.getDay()];
            grouped[label] = { day: label, scoreSum: 0, count: 0 };
          }
          attempts.forEach(a => {
            const d = new Date(a.submittedAt);
            const label = dayMap[d.getDay()];
            if (grouped[label]) {
              grouped[label].scoreSum += a.score || 0;
              grouped[label].count += 1;
            }
          });
          setActivityData(
            Object.values(grouped).map(g => ({
              day: g.day,
              score: g.count > 0 ? Math.round(g.scoreSum / g.count) : 0
            }))
          );
        } else {
          setActivityData([]);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedQuizId]);

  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-x-hidden min-w-0">
      <div className="max-w-7xl mx-auto space-y-6 pb-12 w-full min-w-0">
        
        {/* Header with Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="neo-tag-pink text-xs uppercase mb-1">Performance Tracking</span>
            <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
              <BarChart2 className="w-7 h-7 text-[#EC4899]" /> Analytics Dashboard
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Track quiz performance trends, activity, and learning outcomes across campus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="px-4 py-2.5 rounded-full border-2 border-black font-extrabold text-xs bg-white shadow-[2px_2px_0px_#000]"
            >
              <option value="">Overview (My Account)</option>
              {quizzesList.map(q => (
                <option key={q.id || q._id} value={q.id || q._id}>{q.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-[#EC4899] border-t-black rounded-full animate-spin shadow-[3px_3px_0px_#000]" />
          </div>
        ) : (
          <div className="space-y-6 w-full max-w-full min-w-0">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-full min-w-0">
              <div className="neo-box p-3.5 sm:p-5 bg-white">
                <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 font-display">Quizzes Taken</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{data?.totalQuizzesTaken || 0}</p>
                <p className="text-[11px] sm:text-xs font-bold text-[#EC4899] mt-0.5 sm:mt-1">Completed tests</p>
              </div>

              <div className="neo-box p-3.5 sm:p-5 bg-white">
                <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 font-display">Average Score</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-display mt-1">{data?.averageScore || 0}%</p>
                <p className="text-[11px] sm:text-xs font-bold text-emerald-600 mt-0.5 sm:mt-1">Across all quizzes</p>
              </div>

              <div className="neo-box p-3.5 sm:p-5 bg-white">
                <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 font-display">Highest Score</span>
                <p className="text-2xl sm:text-3xl font-black text-purple-600 font-display mt-1">{data?.highestScore || 0}%</p>
                <p className="text-[11px] sm:text-xs font-bold text-purple-600 mt-0.5 sm:mt-1">Personal Best</p>
              </div>

              <div className="neo-box p-3.5 sm:p-5 bg-white">
                <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 font-display">Status</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-500 font-display mt-1">Active</p>
                <p className="text-[11px] sm:text-xs font-bold text-amber-600 mt-0.5 sm:mt-1">Campus Participant</p>
              </div>
            </div>

            {/* Weekly Activity Chart — only when real data exists */}
            {activityData.length > 0 ? (
              <div className="neo-box p-6 bg-white min-w-0 w-full max-w-full overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 font-display">Weekly Activity & Scores</h3>
                    <p className="text-xs font-bold text-slate-500">Your test count and score progression</p>
                  </div>
                </div>
                <div className="w-full h-[240px] min-w-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 700, fill: '#000' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" name="Avg Score %" stroke="#EC4899" strokeWidth={3} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="neo-box p-5 bg-white flex items-center gap-4 text-slate-500">
                <Info className="w-6 h-6 text-[#EC4899] flex-shrink-0" />
                <div>
                  <p className="font-black text-slate-900 text-sm">No chart data available yet</p>
                  <p className="text-xs font-medium mt-0.5">Complete some quizzes and your score trends will appear here.</p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
