import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search, Sparkles } from 'lucide-react';
import { RotatingBadgeDoodle, SparkleStar } from '../components/common/Doodles';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] bg-grid-pattern flex flex-col justify-between items-center p-6 text-slate-900 relative overflow-hidden">
      
      {/* Background doodles */}
      <SparkleStar className="absolute top-12 left-12 w-10 h-10 text-[#EC4899]" />
      <SparkleStar className="absolute bottom-16 right-16 w-8 h-8 text-amber-400" />
      <RotatingBadgeDoodle text="404 Page Not Found • " icon={Search} className="absolute top-10 right-10" />

      <header className="w-full max-w-7xl flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000]">
            C
          </div>
          <span className="font-extrabold text-2xl tracking-tight font-display">
            Quiz<span className="text-[#EC4899]">Hub</span>
          </span>
        </Link>
      </header>

      {/* 404 Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="neo-box p-8 sm:p-14 max-w-lg w-full text-center relative bg-white my-12"
      >
        <div className="inline-block bg-[#EC4899] text-white font-black text-7xl sm:text-8xl px-6 py-2 rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] mb-6 font-display animate-pulse-bounce">
          404
        </div>

        <h1 className="text-3xl font-black font-display tracking-tight text-slate-900 mb-3">
          Oops! Page Lost in Quiz Space
        </h1>

        <p className="text-slate-600 font-medium text-base mb-8 leading-relaxed">
          The page or quiz you are looking for doesn't exist, was renamed, or has been deleted from campus archives.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="neo-btn-pink text-sm w-full sm:w-auto">
            <Home className="w-4 h-4" /> Return to Home
          </Link>
          <Link to="/explore" className="neo-btn-white text-sm w-full sm:w-auto">
            <Search className="w-4 h-4" /> Explore Quizzes
          </Link>
        </div>
      </motion.div>

      <footer className="text-center text-xs font-bold text-slate-400">
        QuizDeck 404 Page • College Quiz Platform
      </footer>

    </div>
  );
}
