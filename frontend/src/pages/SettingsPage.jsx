import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Moon, Sun, Bell, Lock, Shield, Check
} from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();
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
    toast.success('Preferences saved', 'Your system preferences have been updated.');
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
    toast.success('Password updated', 'Your password has been changed.');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize your app theme, notification alerts, and security options.
          </p>
        </div>

        {/* Theme Settings */}
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" /> Appearance & Theme
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-bold">Light Mode</span>
              {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <Moon className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-bold">Dark Mode</span>
              {theme === 'dark' && <Check className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" /> Notification Preferences
          </h2>

          <div className="space-y-3">
            {[
              { key: 'quizReminders', title: 'Quiz Reminders', desc: 'Notify when assigned or bookmarked quizzes are due' },
              { key: 'leaderboardUpdates', title: 'Leaderboard Updates', desc: 'Alert when someone surpasses your rank on the leaderboard' },
              { key: 'newQuizzes', title: 'Trending Quizzes', desc: 'Weekly roundup of trending quizzes in your preferred topics' },
            ].map(({ key, title, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications[key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      notifications[key] ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleSavePreferences} className="btn-primary text-xs">
            Save Preferences
          </button>
        </div>

        {/* Security / Password */}
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" /> Change Password
          </h2>

          <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="input text-xs"
              />
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Min. 6 characters"
                className="input text-xs"
              />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                className="input text-xs"
              />
            </div>

            <button type="submit" className="btn-primary text-xs">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
