import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const { login, signup, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user]);

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
        toast.success('Welcome back!', 'Successfully logged in to QuizHub.');
      } else {
        await signup(form.name, form.email, form.password);
        toast.success('Account created!', 'Welcome to QuizHub! Let\'s create your first quiz.');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(mode === 'login' ? 'Login failed' : 'Signup failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      await login('admin@quizhub.com', 'password123');
      toast.success('Demo Login!', 'Logged in with demo admin account.');
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Create unlimited quizzes for free',
    'Real-time multiplayer quiz sessions',
    'Advanced analytics dashboard',
    'Question bank with 8 question types',
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">QuizHub</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            The smarter way to learn, assess, and grow.
          </h2>
          <div className="space-y-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-400 text-sm">
          © 2026 QuizHub · Create. Play. Learn.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Back to home</span>
        </Link>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">QuizHub</span>
            </div>

            <h1 className="text-3xl font-black text-white mb-1">
              {mode === 'login' ? 'Welcome back 👋' : 'Join QuizHub 🚀'}
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              {mode === 'login' ? 'Log in to continue your learning journey.' : 'Create your free account and start quizzing.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.name ? 'border-red-500' : 'border-slate-700'}`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.email ? 'border-red-500' : 'border-slate-700'}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.password ? 'border-red-500' : 'border-slate-700'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setField('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-slate-700'}`}
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  mode === 'login' ? 'Log in' : 'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-slate-500 text-xs">OR</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {/* Demo login */}
            <button
              onClick={demoLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-slate-600 text-slate-300 font-medium text-sm hover:bg-slate-800 hover:border-slate-500 transition-all active:scale-95 disabled:opacity-60"
            >
              🎮 Try Demo Account (admin@quizhub.com)
            </button>

            <p className="text-center text-slate-400 text-sm mt-6">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); setForm({ name: '', email: '', password: '', confirmPassword: '' }); }}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
              >
                {mode === 'login' ? 'Sign up for free' : 'Log in'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
