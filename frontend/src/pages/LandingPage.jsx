import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Zap, 
  ChevronDown,
  Brain,
  Award,
  Globe,
  Flame,
  Edit3,
  BookOpen
} from 'lucide-react';
import { 
  RotatingBadgeDoodle, 
  AnimatedHeroCharacter, 
  AnimatedMaleCharacter, 
  SparkleStar 
} from '../components/common/Doodles';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [aiPrompt, setAiPrompt] = useState('');
  const [activeFaqTab, setActiveFaqTab] = useState('General');
  const [openFaqIndex, setOpenFaqIndex] = useState(1);
  const [emailSub, setEmailSub] = useState('');

  const handleGenerate = (e) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      navigate(`/create-quiz?prompt=${encodeURIComponent(aiPrompt.trim())}`);
    } else {
      navigate('/create-quiz');
    }
  };

  const faqData = [
    {
      id: 1,
      category: 'General',
      question: 'How does it work?',
      answer: 'QuizDeck lets you generate interactive quizzes from any topic, text, or document using advanced AI. You can also craft custom multiple-choice or true/false questions manually and host live sessions with your classmates.'
    },
    {
      id: 2,
      category: 'General',
      question: 'Whats our business plan?',
      answer: 'QuizDeck is 100% free for students and educators! We offer optional VIP campus features, custom domain hosting, and unlimited live room participants for college events.'
    },
    {
      id: 3,
      category: 'General',
      question: 'Which platforms are we supporting?',
      answer: 'QuizDeck works seamlessly across all web browsers, desktop monitors, tablets, and mobile devices with zero app installation required.'
    },
    {
      id: 4,
      category: 'Quizzes',
      question: 'Can I import PDF documents or notes?',
      answer: 'Yes! Simply upload your PDF, Word document, or text notes into the AI quiz creator, and QuizDeck will automatically extract key questions with answer keys.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 font-sans selection:bg-[#EC4899] selection:text-white relative overflow-x-hidden w-full max-w-full bg-grid-pattern">
      
      {/* Top Ticker Ribbon Banner */}
      <div className="w-full bg-black text-white py-1.5 overflow-hidden border-b-2 border-black" style={{ maxWidth: '100vw' }}>
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap min-w-max text-xs font-bold uppercase tracking-widest flex gap-8 items-center"
        >
          <span>QuizDeck • The Ultimate AI Quiz Platform for College</span>
          <span>✦ Instant Document to Quiz Conversion</span>
          <span>Real-time Leaderboards &amp; Live Multiplayer</span>
          <span>QuizDeck • The Ultimate AI Quiz Platform for College</span>
          <span>✦ Instant Document to Quiz Conversion</span>
        </motion.div>
      </div>

      {/* Header Navbar */}
      <div className="w-full max-w-full px-4 sm:px-8 relative z-20">
        <header className="max-w-7xl mx-auto py-5 flex items-center justify-between min-w-0">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000] group-hover:rotate-6 transition-transform">
              Q
            </div>
            <span className="font-extrabold text-2xl tracking-tight font-display">
              Quiz<span className="text-[#EC4899]">Deck</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
            <a href="#quizzes" className="hover:text-[#EC4899] transition-colors">Kind of Quizzes</a>
            <a href="#features" className="hover:text-[#EC4899] transition-colors">Features</a>
            <a href="#faq" className="hover:text-[#EC4899] transition-colors">FAQ</a>
            <Link to="/explore" className="hover:text-[#EC4899] transition-colors">Explore</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user ? (
              <Link to="/dashboard" className="neo-btn-pink text-sm">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="neo-btn-pink text-sm">
                  Get started
                </Link>
                <Link to="/auth?mode=login" className="neo-btn-white text-sm hidden sm:inline-flex">
                  Login <ChevronDown className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* HERO SECTION */}
      <div className="w-full max-w-full px-4 sm:px-8 overflow-hidden">
        <section className="max-w-7xl mx-auto pt-8 pb-16 lg:pt-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center relative">
          
          {/* Floating background sparkles */}
          <SparkleStar className="absolute top-10 left-2 w-6 h-6 sm:w-8 sm:h-8 text-[#EC4899] pointer-events-none" />
          <SparkleStar className="absolute bottom-10 right-1/3 w-5 h-5 sm:w-6 sm:h-6 text-amber-400 pointer-events-none" />

          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-black bg-amber-100 text-xs font-black shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" /> Next-Gen AI Quiz Creator
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black font-display tracking-tight leading-[1.08] break-words">
              Best <span className="neo-tag-pink font-black px-2 sm:px-3 py-1 my-1 inline-block">AI Platform</span> To Convert Documents To Quiz Instantly
            </h1>

            <p className="text-slate-600 font-medium text-base sm:text-xl max-w-2xl leading-relaxed">
              With QuizDeck all teachers and students can generate big and small Quizzes in seconds and host them live across college domains!
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link to={user ? "/create-quiz" : "/auth"} className="neo-btn-pink text-sm sm:text-base px-5 sm:px-8 py-2.5 sm:py-3.5 w-full sm:w-auto">
                Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link to="/explore" className="neo-btn-white text-sm sm:text-base px-5 sm:px-7 py-2.5 sm:py-3.5 w-full sm:w-auto">
                Explore Quizzes <ChevronDown className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <a href="#faq" className="hover:underline text-slate-700">Have any question?</a>
            </div>
          </motion.div>

          {/* Right Hero Graphic with Doodle */}
          <div className="lg:col-span-5 flex justify-center relative hidden sm:flex">
            {/* Rotating badge floating on side */}
            <RotatingBadgeDoodle 
              text="Learn more about service • " 
              icon={Flame} 
              className="absolute -top-6 -left-6 z-20 scale-75 sm:scale-90" 
            />

            <AnimatedHeroCharacter />
          </div>
        </section>
      </div>

      {/* KIND OF QUIZZES GRID SECTION */}
      <div className="w-full max-w-full px-4 sm:px-8 overflow-hidden border-t-2 border-black/10">
      <section id="quizzes" className="max-w-7xl mx-auto py-16">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display">Kind of Quizzes</h2>
          <p className="text-slate-600 font-medium text-lg">Create or take any style of interactive test in seconds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Multiple Choice */}
          <motion.div 
            whileHover={{ y: -5, x: -2 }}
            className="neo-box p-6 flex items-start gap-4 cursor-pointer"
            onClick={() => navigate('/create-quiz')}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000] flex-shrink-0">
              ?
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-display">Multiple Choice</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium leading-relaxed">
                Standard single or multi-correct answer options with instant explanations and timed questions.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Fill in the blank */}
          <motion.div 
            whileHover={{ y: -5, x: -2 }}
            className="neo-box p-6 flex items-start gap-4 cursor-pointer"
            onClick={() => navigate('/create-quiz')}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000] flex-shrink-0">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-display">Fill in the blank</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium leading-relaxed">
                Test recall and exact definitions with smart text-matching algorithms.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Matching */}
          <motion.div 
            whileHover={{ y: -5, x: -2 }}
            className="neo-box p-6 flex items-start gap-4 cursor-pointer"
            onClick={() => navigate('/create-quiz')}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000] flex-shrink-0">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-display">Matching Pair</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium leading-relaxed">
                Match terms to definitions, formulas to answers, or concepts to diagrams.
              </p>
            </div>
          </motion.div>

          {/* Card 4: True / False */}
          <motion.div 
            whileHover={{ y: -5, x: -2 }}
            className="neo-box p-6 flex items-start gap-4 cursor-pointer"
            onClick={() => navigate('/create-quiz')}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500 border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000] flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-display">True / False</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium leading-relaxed">
                Fast-paced rapid fire boolean questions perfect for live host tournaments.
              </p>
            </div>
          </motion.div>

        </div>
      </section>
      </div>

      {/* FEATURE HIGHLIGHT BANNER SECTION */}
      <div className="w-full max-w-full px-4 sm:px-8 overflow-hidden">
      <section id="features" className="max-w-7xl mx-auto py-16">
        <div className="bg-white border-[3px] border-black rounded-[2.5rem] p-8 sm:p-12 shadow-[8px_8px_0px_#000] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 flex justify-center">
            <AnimatedMaleCharacter />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight">
              We help you to make the best Quizzes
            </h2>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">
              Find, explore and learn in an awesome place! Teachers and students can host live lobbies, record grades, analyze performance metrics, and compete on global campus leaderboards.
            </p>
            <div>
              <Link to="/auth" className="neo-btn-pink text-lg px-8 py-3.5">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>
      </section>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS SECTION */}
      <div className="w-full max-w-full px-4 sm:px-8 overflow-hidden">
      <section id="faq" className="max-w-5xl mx-auto py-16 relative">
        {/* Floating Rotating Doodle - hidden on small screens */}
        <div className="hidden sm:block">
          <RotatingBadgeDoodle 
            text="Learn more about service • " 
            icon={HelpCircle} 
            className="absolute -top-6 right-0 z-20 scale-75 sm:scale-90" 
          />
        </div>

        <div className="neo-box p-6 sm:p-10 relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-center mb-8">
            Frequently asked questions
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {['General', 'Quizzes', 'Templates', 'Account'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFaqTab(cat)}
                className={`px-5 py-2 rounded-full font-bold text-sm border-2 border-black transition-all ${
                  activeFaqTab === cat 
                    ? 'bg-[#EC4899] text-white shadow-[3px_3px_0px_#000]' 
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion list */}
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div key={item.id} className="border-b-2 border-slate-200 pb-4">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between text-left font-bold text-lg py-2 hover:text-[#EC4899] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#EC4899]">0{index + 1}</span>
                    {item.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaqIndex === index ? 'rotate-180 text-[#EC4899]' : ''}`} />
                </button>

                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-600 text-sm font-medium pt-2 pb-1 leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* LETS MAKE FIRST QUIZ CTA BANNER */}
      <div className="w-full max-w-full px-4 sm:px-8 overflow-hidden">
      <section className="max-w-7xl mx-auto py-16">
        <div className="relative bg-[#EC4899] border-[3px] border-black rounded-[2.5rem] p-6 sm:p-14 shadow-[8px_8px_0px_#000] text-center text-white overflow-hidden">
          
          {/* Corner Sparkle Doodles */}
          <SparkleStar className="absolute top-4 left-4 sm:top-6 sm:left-6 w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
          <SparkleStar className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />

          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            Lets Make First Quiz
          </h2>

          <p className="text-white/90 font-bold text-base sm:text-lg max-w-xl mx-auto mb-8">
            Type whatever topic you want as a quiz in the following input, then we make the best AI quiz instantly.
          </p>

          {/* AI Prompt Input Bar */}
          <form onSubmit={handleGenerate} className="max-w-xl mx-auto relative">
            <div className="bg-white border-2 border-black rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-center gap-2 shadow-[4px_4px_0px_#000]">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Give me something to generate quiz..."
                className="w-full flex-1 px-4 sm:px-5 py-2.5 text-slate-900 font-medium text-sm focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#EC4899] text-white font-extrabold text-sm px-6 py-2.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-[#DB2777] active:translate-y-0.5 transition-all"
              >
                Generate
              </button>
            </div>
          </form>

        </div>
      </section>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-full bg-[#F8FAFC] border-t-2 border-black py-12 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Logo & Tagline */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-lg">
                Q
              </div>
              <span className="font-extrabold text-xl font-display">CreateMyTest / QuizDeck</span>
            </div>
            <p className="text-xs font-bold text-slate-500">Make quizzes with us across college campus</p>
          </div>

          {/* Quick Footer Links */}
          <div className="md:col-span-5 grid grid-cols-3 gap-4 text-xs font-bold text-slate-700">
            <div className="space-y-2">
              <div>About</div>
              <div>Projects</div>
            </div>
            <div className="space-y-2">
              <div>What We Do</div>
              <div>Templates</div>
            </div>
            <div className="space-y-2">
              <div>Jobs</div>
              <div>Download</div>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">JOIN OUR COMMUNITY</div>
            <form onSubmit={(e) => { e.preventDefault(); setEmailSub(''); alert('Subscribed!'); }} className="flex items-center">
              <div className="bg-white border-2 border-black rounded-full p-1 flex items-center w-full shadow-[2px_2px_0px_#000]">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  className="w-full px-3 py-1 text-xs text-slate-900 focus:outline-none bg-transparent"
                />
                <button type="submit" className="w-7 h-7 rounded-full bg-[#EC4899] text-white flex items-center justify-center font-bold text-xs border border-black flex-shrink-0">
                  ➔
                </button>
              </div>
            </form>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 text-center text-xs font-bold text-slate-400">
          Copyright © 2026 QuizDeck. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
