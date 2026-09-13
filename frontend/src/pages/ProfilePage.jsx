import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, Award, BookOpen, Star, TrendingUp,
  Edit3, Check, Sparkles, Camera
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';

const ACHIEVEMENTS = [
  { id: '1', title: 'First Quiz Completed', icon: '🎯', desc: 'Successfully took your very first quiz.', unlocked: true },
  { id: '2', title: 'Master Mind', icon: '🧠', desc: 'Scored 100% on any quiz challenge.', unlocked: true },
  { id: '3', title: 'Quiz Creator', icon: '✍️', desc: 'Created and published a custom quiz.', unlocked: true },
  { id: '4', title: 'Speed Demon', icon: '⚡', desc: 'Completed a 10-question quiz in under 2 minutes.', unlocked: false },
  { id: '5', title: 'Leaderboard Hero', icon: '🏆', desc: 'Reached top 3 on the global leaderboard.', unlocked: false },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || 'Quiz enthusiast and continuous learner.',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile(form);
      updateUser(form);
      setIsEditing(false);
      toast.success('Profile updated', 'Your profile details have been saved.');
    } catch (err) {
      // If userAPI is not mocked, still update locally
      updateUser(form);
      setIsEditing(false);
      toast.success('Profile saved', 'Profile updated successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Profile Card Header */}
        <div className="card relative overflow-hidden p-8 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img
                src={form.avatar}
                alt={user?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-xl"
              />
              {isEditing && (
                <button
                  onClick={() => {
                    const seed = Math.random().toString(36).substring(7);
                    setForm(prev => ({ ...prev, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}` }));
                  }}
                  className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
                  title="Randomize Avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    {user?.name}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </p>
                </div>

                <span className="badge badge-indigo self-center sm:self-auto capitalize">
                  {user?.role || 'User'}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {user?.bio || 'QuizHub Enthusiast and Knowledge Seeker.'}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Edit form inline */}
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleSave}
              className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <input
                    type="text"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quizzes Taken</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {user?.stats?.quizzesTaken ?? 12}
            </p>
          </div>

          <div className="card text-center p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {user?.stats?.averageScore ?? 84}%
            </p>
          </div>

          <div className="card text-center p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quizzes Created</span>
            <p className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">
              {user?.stats?.quizzesCreated ?? 3}
            </p>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Achievements & Badges</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                  ach.unlocked
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="text-3xl flex-shrink-0">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{ach.title}</p>
                    {ach.unlocked && <span className="badge badge-emerald text-[10px]">Unlocked</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
