import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Zap, ChevronRight, Star, Users, BookOpen, BarChart2, Globe, Trophy,
  Brain, Play, Check, ArrowRight, Sparkles, Shield
} from 'lucide-react';

// Animated counter hook
function useCounter(end, duration = 2000, inView) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, inView]);
  return count;
}

const features = [
  { icon: Brain, color: 'from-violet-500 to-indigo-500', title: 'Create Powerful Quizzes', desc: 'Build engaging quizzes with 8 question types including MCQ, image-based, fill-in-the-blank, and more.' },
  { icon: Zap, color: 'from-amber-500 to-orange-500', title: 'Real-Time Quiz Sessions', desc: 'Host live quiz sessions with real-time scoring, dynamic leaderboards, and instant answer feedback.' },
  { icon: BarChart2, color: 'from-emerald-500 to-teal-500', title: 'Smart Analytics', desc: 'Deep-dive into question accuracy, score distributions, and participant performance trends.' },
  { icon: BookOpen, color: 'from-blue-500 to-cyan-500', title: 'Question Bank', desc: 'Build a reusable library of questions, filter by category and difficulty, add to any quiz instantly.' },
  { icon: Globe, color: 'from-pink-500 to-rose-500', title: 'Share Anywhere', desc: 'Share quizzes via unique link, QR code, or social media. Make it public, private, or unlisted.' },
  { icon: Trophy, color: 'from-indigo-500 to-purple-500', title: 'Track Your Progress', desc: 'Unlock achievements, climb leaderboards, and visualize your learning journey over time.' },
];

const steps = [
  { step: '01', title: 'Create a Quiz', desc: 'Use our 5-step builder to craft beautiful quizzes with multiple question types.' },
  { step: '02', title: 'Share with Anyone', desc: 'Generate a unique link or QR code and share it with your audience instantly.' },
  { step: '03', title: 'Analyze Results', desc: 'Get deep insights into performance, identify knowledge gaps, and improve.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Senior Developer', company: 'TechCorp', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60', text: 'QuizHub completely transformed how I assess my team\'s knowledge. The analytics dashboard is incredibly powerful and insightful.', rating: 5 },
  { name: 'Marcus Williams', role: 'University Lecturer', company: 'MIT', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60', text: 'The real-time quiz mode is a game changer for my lectures. Students are far more engaged and the leaderboard keeps them motivated.', rating: 5 },
  { name: 'Priya Sharma', role: 'L&D Manager', company: 'StartupXYZ', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=60', text: 'I\'ve tried many quiz platforms, but QuizHub\'s combination of beautiful design and powerful features is unmatched. Highly recommend!', rating: 5 },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Quizzes Created' },
  { value: 2000000, suffix: '+', label: 'Questions Answered' },
  { value: 120000, suffix: '+', label: 'Active Users' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
];

function StatCard({ stat }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(stat.value, 2000, inView);

  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n;

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black text-white">{fmt(count)}{stat.suffix}</div>
      <div className="text-indigo-200 mt-1 text-sm font-medium">{stat.label}</div>
    </div>
  );
}

const floatingCards = [
  { title: 'JavaScript Basics', emoji: '🚀', score: '18/20', color: 'from-indigo-500 to-violet-500', delay: 0 },
  { title: 'World History', emoji: '🌍', score: '15/15', color: 'from-emerald-500 to-teal-500', delay: 0.5 },
  { title: 'Data Structures', emoji: '🧩', score: '12/15', color: 'from-amber-500 to-orange-500', delay: 1 },
];

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">QuizHub</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it Works', 'Testimonials'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm text-slate-400 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">Log in</Link>
          <Link to="/auth?mode=signup"
            className="btn-primary bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative z-10 page-container w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-indigo-300 font-medium">Introducing QuizHub 2.0 — Now with Live Mode</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                <span className="text-white">Create.</span><br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Play.</span><br />
                <span className="text-white">Learn.</span>
              </h1>

              <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg">
                Build engaging quizzes, challenge your audience, and understand performance with powerful analytics. The next-generation quiz platform for educators, teams, and creators.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/auth?mode=signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-base hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all active:scale-95">
                  Create a Quiz <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/explore"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-white font-semibold text-base hover:bg-white/5 transition-all active:scale-95">
                  <Play className="w-4 h-4" /> Explore Quizzes
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {['photo-1534528741775-53994a69daeb', 'photo-1507003211169-0a1dd7228f2d', 'photo-1494790108377-be9c29b29330', 'photo-1438761681033-6461ffad8d80'].map((img, i) => (
                    <img key={i} src={`https://images.unsplash.com/${img}?auto=format&fit=crop&q=80&w=40`}
                      className="w-8 h-8 rounded-full border-2 border-slate-950 object-cover" alt="user" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Loved by 120K+ educators & teams</p>
                </div>
              </div>
            </motion.div>

            {/* Right — Floating quiz cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:flex relative justify-center items-center h-[500px]"
            >
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-20 w-72 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">🧠</div>
                  <div>
                    <p className="text-xs text-slate-400">Question 3 of 10</p>
                    <div className="w-32 h-1.5 bg-slate-700 rounded-full mt-1">
                      <div className="w-[30%] h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>
                  <div className="ml-auto px-2 py-1 bg-red-500/10 rounded-lg">
                    <span className="text-red-400 text-xs font-bold">0:45</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white mb-4">What is the time complexity of binary search?</p>
                {['O(n)', 'O(log n)', 'O(n²)', 'O(1)'].map((opt, i) => (
                  <div key={i}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2 border text-sm transition-all cursor-pointer ${i === 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:border-slate-500'}`}>
                    <span className="w-5 h-5 rounded-md border border-current flex items-center justify-center text-xs font-bold">
                      {i === 1 ? <Check className="w-3 h-3" /> : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </div>
                ))}
              </motion.div>

              {/* Floating mini cards */}
              {floatingCards.map((card, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8 - i * 3, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
                  className={`absolute ${i === 0 ? '-left-4 top-8 z-10' : i === 1 ? '-right-4 top-32 z-10' : 'right-8 bottom-8 z-10'} w-44 bg-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-3 shadow-xl`}
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-sm mb-2`}>
                    {card.emoji}
                  </div>
                  <p className="text-xs font-semibold text-white">{card.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Score: {card.score}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 animate-gradient-x">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <StatCard stat={stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-white">Everything you need to quiz better</h2>
            <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
              From quiz creation to advanced analytics — QuizHub has every tool you need to educate, engage, and inspire.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="relative p-6 rounded-2xl border border-white/5 bg-slate-900 hover:border-indigo-500/30 transition-all group cursor-default overflow-hidden"
              >
                {hoveredFeature === i && (
                  <motion.div layoutId="feature-hover" className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-2xl" />
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-slate-900">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-white">Get started in 3 simple steps</h2>
            <p className="mt-4 text-slate-400 text-lg">Build and share your first quiz in under 5 minutes.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(33%+32px)] right-[calc(33%+32px)] h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg shadow-indigo-500/30">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-950">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-white">Loved by educators & teams</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role} at {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative page-container text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Ready to transform how you quiz?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Join over 120,000 educators, trainers, and teams who use QuizHub to create, share, and analyze their quizzes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth?mode=signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-700 font-bold text-lg hover:bg-indigo-50 shadow-xl transition-all active:scale-95">
              Start for Free <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-12">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">QuizHub</span>
              <span className="text-slate-500 text-sm">· Create. Play. Learn.</span>
            </div>
            <div className="flex items-center gap-4">
              {[Globe, Shield, Sparkles].map((Icon, i) => (
                <a key={i} href="#" className="text-slate-500 hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-slate-500 text-sm">© 2026 QuizHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
