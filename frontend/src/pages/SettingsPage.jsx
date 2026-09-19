import { useState } from 'react';
import { Settings, Moon, Sun, Bell, Lock, Check } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { SparkleStar } from '../components/common/Doodles';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    quizReminders: true,
    leaderboardUpdates: true,
    newQuizzes: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSavePreferences = () => {
    toast.success('Preferences saved!', 'Your system preferences have been updated.');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mismatch', 'New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    toast.success('Password updated!', 'Your password has been changed.');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        
        <div>
          <span className="neo-tag-pink text-xs uppercase mb-1">Preferences</span>
          <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2 mt-1">
            <Settings className="w-7 h-7 text-[#EC4899]" /> Account Settings
          </h1>
          <p className="text-slate-600 font-medium text-sm mt-1">
            Customize app themes, campus notification alerts, and security options.
          </p>
        </div>

        {/* Theme Settings */}
        <div className="neo-box p-6 sm:p-8 bg-white space-y-4">
          <h2 className="font-extrabold text-slate-900 font-display text-lg flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" /> Appearance & Theme Mode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 sm:p-5 rounded-2xl border-2 border-black text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'bg-[#EC4899] text-white shadow-[3px_3px_0px_#000]'
                  : 'bg-white text-black shadow-[2px_2px_0px_#000]'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs font-black">Light Mode</span>
              {theme === 'light' && <Check className="w-4 h-4 text-white" />}
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 sm:p-5 rounded-2xl border-2 border-black text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-[#EC4899] text-white shadow-[3px_3px_0px_#000]'
                  : 'bg-white text-black shadow-[2px_2px_0px_#000]'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs font-black">Dark Mode</span>
              {theme === 'dark' && <Check className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="neo-box p-6 sm:p-8 bg-white space-y-4">
          <h2 className="font-extrabold text-slate-900 font-display text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#EC4899]" /> Notification Preferences
          </h2>

          <div className="space-y-3 font-bold">
            {[
              { key: 'quizReminders', title: 'Quiz Reminders', desc: 'Notify when assigned or bookmarked quizzes are due' },
              { key: 'leaderboardUpdates', title: 'Leaderboard Updates', desc: 'Alert when someone surpasses your rank on the leaderboard' },
              { key: 'newQuizzes', title: 'Trending Quizzes', desc: 'Weekly roundup of trending quizzes in your preferred topics' },
            ].map(({ key, title, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b-2 border-black/10 last:border-0">
                <div>
                  <p className="text-sm font-black text-slate-900">{title}</p>
                  <p className="text-xs font-medium text-slate-500">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                  className={`w-12 h-6 rounded-full border-2 border-black p-0.5 transition-all ${
                    notifications[key] ? 'bg-[#EC4899]' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white border border-black transition-transform ${notifications[key] ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleSavePreferences} className="neo-btn-pink text-xs py-2 px-5">
            Save Preferences
          </button>
        </div>

        {/* Security / Password */}
        <div className="neo-box p-6 sm:p-8 bg-white space-y-4">
          <h2 className="font-extrabold text-slate-900 font-display text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" /> Change Security Password
          </h2>

          <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-md">
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                className="w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs"
              />
            </div>

            <button type="submit" className="neo-btn-pink text-xs py-2 px-5">
              Update Password
            </button>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
