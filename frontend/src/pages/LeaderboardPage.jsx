import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Medal, Award, Crown, Search, Flame, Star, TrendingUp, Filter, Sparkles
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await leaderboardAPI.get({ timeframe });
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeframe]);

  const filtered = leaderboard.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Top performers ranked by points, quiz completions, and accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {['Weekly', 'Monthly', 'All'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === t
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'All' ? 'All-Time' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium (Only when search is empty or top 3 exist) */}
        {!loading && top3.length >= 3 && search === '' && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8 max-w-2xl mx-auto">
            {/* Rank 2 - Silver */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center order-1"
            >
              <div className="relative mb-3">
                <img
                  src={top3[1]?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=2'}
                  alt={top3[1]?.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-slate-300 dark:border-slate-600 shadow-md"
                />
                <span className="absolute -top-2 -right-1 w-6 h-6 bg-slate-300 text-slate-800 text-xs font-black rounded-full flex items-center justify-center shadow">
                  2
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[110px]">
                {top3[1]?.name}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{top3[1]?.score} pts</p>
              <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700/60 rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-400 text-2xl">
                2nd
              </div>
            </motion.div>

            {/* Rank 1 - Gold */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center order-2"
            >
              <div className="relative mb-3">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                  <Crown className="w-7 h-7 fill-amber-400" />
                </div>
                <img
                  src={top3[0]?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=1'}
                  alt={top3[0]?.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-400 shadow-lg shadow-amber-500/20 ring-4 ring-amber-400/20"
                />
                <span className="absolute -top-2 -right-1 w-7 h-7 bg-amber-400 text-slate-900 text-xs font-black rounded-full flex items-center justify-center shadow">
                  1
                </span>
              </div>
              <p className="font-extrabold text-base text-slate-900 dark:text-white truncate max-w-[130px]">
                {top3[0]?.name}
              </p>
              <p className="text-xs text-amber-500 font-black">{top3[0]?.score} pts</p>
              <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-200/80 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 border-t-2 border-amber-400 rounded-t-2xl mt-3 flex flex-col items-center justify-center">
                <span className="font-black text-amber-500 text-3xl">1st</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider mt-0.5">Champion</span>
              </div>
            </motion.div>

            {/* Rank 3 - Bronze */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center order-3"
            >
              <div className="relative mb-3">
                <img
                  src={top3[2]?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=3'}
                  alt={top3[2]?.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-amber-700/60 shadow-md"
                />
                <span className="absolute -top-2 -right-1 w-6 h-6 bg-amber-700 text-white text-xs font-black rounded-full flex items-center justify-center shadow">
                  3
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[110px]">
                {top3[2]?.name}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{top3[2]?.score} pts</p>
              <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-orange-200/60 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-800/60 text-xl">
                3rd
              </div>
            </motion.div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search participants by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4"
          />
        </div>

        {/* Table of Leaders */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="py-3.5 pl-6 w-16">Rank</th>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4 text-center">Quizzes</th>
                  <th className="py-3.5 px-4 text-center">Avg Accuracy</th>
                  <th className="py-3.5 pr-6 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading leaderboard...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No players found matching your query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry, idx) => {
                    const rankNum = entry.rank || idx + 1;
                    const isCurrentUser = user?._id === entry.userId || user?.name === entry.name;
                    return (
                      <tr
                        key={entry.userId || idx}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-4 pl-6">
                          <div className="flex items-center">
                            {rankNum === 1 ? (
                              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">
                                🥇
                              </span>
                            ) : rankNum === 2 ? (
                              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">
                                🥈
                              </span>
                            ) : rankNum === 3 ? (
                              <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
                                🥉
                              </span>
                            ) : (
                              <span className="text-slate-500 font-bold pl-2">{rankNum}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={entry.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.name}`}
                              alt={entry.name}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                {entry.name}
                                {isCurrentUser && (
                                  <span className="badge badge-indigo text-[10px]">You</span>
                                )}
                              </p>
                              <span className="text-[11px] text-slate-400">Master Rank</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                          {entry.totalQuizzes || 1}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className={`badge ${entry.accuracy >= 80 ? 'badge-emerald' : 'badge-indigo'}`}>
                            {entry.accuracy}%
                          </span>
                        </td>

                        <td className="py-4 pr-6 text-right">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {entry.score}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">pts</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
