import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Search, Zap, Award } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

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
        setLeaderboard(res.data || []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeframe]);

  const filtered = leaderboard.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="neo-tag-pink text-xs uppercase mb-1">Campus Rankings</span>
            <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
              <Trophy className="w-7 h-7 text-[#EC4899]" /> College Leaderboard
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Top performers ranked by points, speed, and accuracy across campus.
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 border-2 border-black rounded-full p-1 bg-white shadow-[2px_2px_0px_#000]">
            {['Weekly', 'Monthly', 'All'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs transition-all ${
                  timeframe === t
                    ? 'bg-[#EC4899] text-white border-2 border-black shadow-[1px_1px_0px_#000]'
                    : 'text-slate-700'
                }`}
              >
                {t === 'All' ? 'All-Time' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && top3.length >= 1 && search === '' && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8 max-w-2xl mx-auto">
            
            {/* Rank 2 - Silver */}
            {top3[1] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center order-1"
              >
                <div className="neo-box p-3 bg-white w-full flex flex-col items-center shadow-[4px_4px_0px_#000]">
                  <span className="neo-tag-pink text-[10px] mb-1">2ND PLACE</span>
                  <p className="font-extrabold text-sm text-slate-900 font-display truncate w-full">{top3[1].userName || top3[1].name}</p>
                  <p className="text-xs font-black text-[#EC4899]">{top3[1].score || 0} pts</p>
                </div>
                <div className="w-full h-24 bg-slate-200 border-2 border-black border-t-0 rounded-b-xl flex items-center justify-center font-black text-slate-700 text-2xl shadow-[2px_2px_0px_#000]">
                  #2
                </div>
              </motion.div>
            )}

            {/* Rank 1 - Gold Champion */}
            {top3[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center order-2"
              >
                <div className="neo-box p-4 bg-amber-300 w-full flex flex-col items-center shadow-[6px_6px_0px_#000]">
                  <Crown className="w-6 h-6 text-black animate-bounce mb-1" />
                  <span className="px-2 py-0.5 rounded-full border border-black bg-black text-white font-extrabold text-[10px] uppercase mb-1">CHAMPION</span>
                  <p className="font-black text-base text-slate-900 font-display truncate w-full">{top3[0].userName || top3[0].name}</p>
                  <p className="text-sm font-black text-black">{top3[0].score || 0} pts</p>
                </div>
                <div className="w-full h-32 bg-amber-400 border-2 border-black border-t-0 rounded-b-xl flex items-center justify-center font-black text-black text-3xl shadow-[3px_3px_0px_#000]">
                  #1
                </div>
              </motion.div>
            )}

            {/* Rank 3 - Bronze */}
            {top3[2] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center text-center order-3"
              >
                <div className="neo-box p-3 bg-white w-full flex flex-col items-center shadow-[4px_4px_0px_#000]">
                  <span className="neo-tag-pink text-[10px] mb-1">3RD PLACE</span>
                  <p className="font-extrabold text-sm text-slate-900 font-display truncate w-full">{top3[2].userName || top3[2].name}</p>
                  <p className="text-xs font-black text-[#EC4899]">{top3[2].score || 0} pts</p>
                </div>
                <div className="w-full h-20 bg-amber-100 border-2 border-black border-t-0 rounded-b-xl flex items-center justify-center font-black text-amber-900 text-xl shadow-[2px_2px_0px_#000]">
                  #3
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search participants by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border-2 border-black font-bold text-slate-900 bg-white shadow-[2px_2px_0px_#000]"
          />
        </div>

        {/* Table of Leaders */}
        <div className="neo-box p-0 overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-bold">
              <thead className="bg-amber-100 border-b-2 border-black text-xs font-black uppercase text-slate-900">
                <tr>
                  <th className="py-3.5 pl-6 w-16">Rank</th>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4 text-center">Completed</th>
                  <th className="py-3.5 pr-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="w-8 h-8 border-3 border-[#EC4899] border-t-black rounded-full animate-spin mx-auto mb-2" />
                      <span className="font-black text-xs">Loading leaderboard...</span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 font-bold">
                      No participants found matching your query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry, idx) => {
                    const rankNum = idx + 1;
                    const name = entry.userName || entry.name || 'Anonymous Player';
                    return (
                      <tr key={entry.id || idx} className="hover:bg-slate-50">
                        <td className="py-3.5 pl-6 font-black font-display text-base">
                          {`#${rankNum}`}
                        </td>
                        <td className="py-3.5 px-4 font-black font-display text-slate-900">
                          {name}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600">
                          1 Quiz
                        </td>
                        <td className="py-3.5 pr-6 text-right font-black text-base text-[#EC4899]">
                          {entry.score || 0} pts
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
