import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, Lock, Mail, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const { login, signup, loginWithGoogle, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (mode === 'signup' && !form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email address';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (mode === 'signup' && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!', 'Successfully signed in to QuizHub.');
      } else {
        await signup(form.name, form.email, form.password);
        toast.success('Account created!', 'Welcome to QuizHub! Let\'s build your first quiz.');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(mode === 'login' ? 'Login Failed' : 'Signup Failed', err.message || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Google Sign-In Successful!', 'Connected via Google Auth.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Google Sign-In Failed', err.message || 'Could not authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      await resetPassword(forgotEmail);
      toast.success('Password Reset Email Sent!', 'Check your inbox for instructions.');
      setShowForgotModal(false);
    } catch (err) {
      toast.error('Reset Failed', err.message);
    }
  };

  const setField = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] bg-grid-pattern flex flex-col justify-between relative overflow-hidden">

      {/* Top Navbar */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000]">
            C
          </div>
          <span className="font-extrabold text-2xl tracking-tight font-display">
            Quiz<span className="text-[#EC4899]">Hub</span>
          </span>
        </Link>
        <Link to="/" className="neo-btn-white text-xs py-2 px-4">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg neo-box p-6 sm:p-10 relative bg-white"
        >
          {/* Decorative Sparkle */}
          <SparkleStar className="absolute -top-5 -right-4 w-8 h-8 text-[#EC4899]" />

          {/* Mode Switcher Tabs */}
          <div className="flex border-2 border-black rounded-full p-1 mb-8 bg-slate-100 shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => { setMode('login'); setErrors({}); }}
              className={`flex-1 py-2 rounded-full font-extrabold text-sm transition-all ${mode === 'login' ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000] border-2 border-black' : 'text-slate-700'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrors({}); }}
              className={`flex-1 py-2 rounded-full font-extrabold text-sm transition-all ${mode === 'signup' ? 'bg-[#EC4899] text-white shadow-[2px_2px_0px_#000] border-2 border-black' : 'text-slate-700'
                }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-3xl font-black font-display tracking-tight text-slate-900">
              {mode === 'login' ? 'Welcome Back' : 'Join College QuizHub'}
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              {mode === 'login' ? 'Sign in to access your quizzes and leaderboards' : 'Create your free account to build & host live tests'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EC4899]"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">College Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="alex@college.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EC4899]"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-black text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EC4899]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password}</p>}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EC4899]"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-[#EC4899] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full neo-btn-pink py-3 text.base"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In ➔' : 'Create Account ➔'}
            </button>
          </form>

          {/* Social Sign-In Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-0.5 bg-black/20" />
            <span className="text-xs font-black text-slate-400 uppercase">OR</span>
            <div className="flex-1 h-0.5 bg-black/20" />
          </div>

          {/* Google Popup Auth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full neo-btn-white py-3 text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white neo-box max-w-md w-full p-6 relative"
            >
              <h2 className="text-xl font-black font-display mb-2">Reset Your Password</h2>
              <p className="text-slate-600 text-xs font-medium mb-4">Enter your registered email address and we'll send you a password reset link.</p>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="name@college.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-sm font-bold"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="neo-btn-white text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="neo-btn-pink text-xs py-2 px-4">
                    Send Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="p-6 text-center text-xs font-bold text-slate-400">
        QuizHub © 2026 • Campus Ready
      </footer>
    </div>
  );
}
