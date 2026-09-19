import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, BookOpen, BarChart2, Trash2, Search
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminPage() {
  const { toast } = useToast();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, quizzes

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers()
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
      toast.error('Access error', 'Could not load admin panel data.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Admin Action: Delete "${title}"?`)) return;
    try {
      await adminAPI.deleteQuiz(quizId);
      toast.success('Quiz deleted', `"${title}" has been deleted by admin.`);
      fetchAdminData();
    } catch (err) {
      toast.error('Deletion failed', 'Could not delete quiz.');
    }
  };

  const filteredUsers = usersList.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Control Center</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Platform governance, user management, and quiz moderation.
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['overview', 'users', 'quizzes'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeTab === t
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW STATS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="card">
                    <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-indigo-500 mt-1">{stats?.activeUsers || 0} active</p>
                  </div>

                  <div className="card">
                    <span className="text-xs font-semibold text-slate-400">Total Quizzes</span>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats?.totalQuizzes || 0}</p>
                    <p className="text-xs text-slate-400 mt-1">Live in catalog</p>
                  </div>

                  <div className="card">
                    <span className="text-xs font-semibold text-slate-400">Total Quiz Attempts</span>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.totalAttempts || 0}</p>
                    <p className="text-xs text-emerald-600 mt-1">Evaluated tests</p>
                  </div>

                  <div className="card">
                    <span className="text-xs font-semibold text-slate-400">Active Test Takers</span>
                    <p className="text-2xl font-black text-amber-500 mt-1">{stats?.activeUsers || 0}</p>
                    <p className="text-xs text-slate-400 mt-1">Engaged users</p>
                  </div>
                </div>

                {/* Recent users snippet */}
                <div className="card">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Recently Joined Users</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(stats?.recentUsers || []).map((u) => (
                      <div key={u._id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</p>
                            <p className="text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <span className="badge badge-slate uppercase text-[10px]">{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="card space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">User Directory</h3>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="input pl-9 pr-3 text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-center">Quizzes Taken</th>
                        <th className="py-3 px-4 text-center">Avg Score</th>
                        <th className="py-3 px-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                                alt={u.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                                <p className="text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-slate'} uppercase text-[10px]`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {u.stats?.quizzesTaken ?? 0}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-emerald-600">
                            {u.stats?.averageScore ?? 0}%
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QUIZZES TAB */}
            {activeTab === 'quizzes' && (
              <div className="card space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Quiz Moderation</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(stats?.recentQuizzes || []).map((q) => (
                    <div key={q._id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{q.title}</p>
                        <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                          <span>{q.category}</span>
                          <span>•</span>
                          <span>{q.difficulty}</span>
                          <span>•</span>
                          <span>{q.questions?.length || 0} Qs</span>
                          <span>•</span>
                          <span>{q.attemptsCount || 0} plays</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteQuiz(q._id, q.title)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
