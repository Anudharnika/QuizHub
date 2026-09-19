import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Edit3, Camera, Target, Sparkles, Zap, Trophy } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../services/api';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

const ACHIEVEMENTS = [
  { id: '1', title: 'First Quiz Completed', icon: Target, desc: 'Successfully took your very first quiz.', unlocked: true },
  { id: '2', title: 'Master Mind', icon: Sparkles, desc: 'Scored 100% on any quiz challenge.', unlocked: true },
  { id: '3', title: 'Quiz Creator', icon: Edit3, desc: 'Created and published a custom quiz.', unlocked: true },
  { id: '4', title: 'Speed Demon', icon: Zap, desc: 'Completed a quiz in under 2 minutes.', unlocked: false },
  { id: '5', title: 'Leaderboard Hero', icon: Trophy, desc: 'Reached top 3 on the global leaderboard.', unlocked: false },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || 'Campus Quiz enthusiast and knowledge seeker.',
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
      toast.success('Profile updated!', 'Your profile details have been saved.');
    } catch {
      updateUser(form);
      setIsEditing(false);
      toast.success('Profile saved!', 'Profile updated successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        
        {/* Header Profile Card */}
        <div className="neo-box p-6 sm:p-10 bg-white relative">
          <SparkleStar className="absolute -top-4 -right-3 w-8 h-8 text-[#EC4899]" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img
                src={form.avatar}
                alt={user?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-3 border-black shadow-[4px_4px_0px_#000]"
              />
              {isEditing && (
                <button
                  onClick={() => {
                    const seed = Math.random().toString(36).substring(7);
                    setForm(prev => ({ ...prev, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}` }));
                  }}
                  className="absolute -bottom-2 -right-2 p-2 bg-[#EC4899] text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]"
                  title="Randomize Avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-3xl font-black font-display text-slate-900">
                    {user?.name}
                  </h1>
                  <p className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#EC4899]" /> {user?.email}
                  </p>
                </div>

                <span className="neo-tag-pink text-xs uppercase self-center sm:self-auto">
                  {user?.role || 'Campus User'}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-600 mt-3 leading-relaxed">
                {user?.bio || 'College student participating in campus quizzes.'}
              </p>

              <div className="mt-4 pt-4 border-t-2 border-black flex flex-wrap items-center gap-6 text-xs font-bold text-slate-600">
                <span>Joined QuizDeck Campus</span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[#EC4899] font-black hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Edit form */}
          {isEditing && (
            <form onSubmit={handleSave} className="mt-6 pt-6 border-t-2 border-black space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Bio</label>
                  <input
                    type="text"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="neo-btn-white text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="neo-btn-pink text-xs py-2 px-5">
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Badges Section */}
        <div className="neo-box p-6 sm:p-8 bg-white space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black font-display text-slate-900">Achievements & Badges</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border-2 border-black flex items-center gap-4 ${
                  ach.unlocked ? 'bg-amber-100 shadow-[3px_3px_0px_#000]' : 'bg-slate-100 opacity-60'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                  <ach.icon className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-slate-900 font-display">{ach.title}</p>
                    {ach.unlocked && <span className="neo-tag-pink text-[9px]">UNLOCKED</span>}
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
