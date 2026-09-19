import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Home, Trophy, ArrowRight, Star, Heart } from 'lucide-react';
import { SparkleStar, RotatingBadgeDoodle } from '../components/common/Doodles';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const score = searchParams.get('score') || '100%';

  useEffect(() => {
    // Launch celebratory confetti shower
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#EC4899', '#F59E0B', '#3B82F6', '#10B981']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#EC4899', '#F59E0B', '#3B82F6', '#10B981']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF9] bg-grid-pattern flex flex-col justify-between items-center p-6 text-slate-900 relative overflow-hidden">
      
      <SparkleStar className="absolute top-10 left-10 w-10 h-10 text-[#EC4899]" />
      <SparkleStar className="absolute bottom-10 right-10 w-10 h-10 text-amber-400" />
      <RotatingBadgeDoodle text="Awesome Achievement • " icon={Trophy} className="absolute top-10 right-10" />

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

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="neo-box p-8 sm:p-14 max-w-lg w-full text-center relative bg-white my-12"
      >
        <div className="w-20 h-20 bg-amber-400 border-3 border-black rounded-full flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000] mx-auto mb-6">
          <Trophy className="w-10 h-10 text-black" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900 mb-2">
          Thank You for Playing!
        </h1>

        <p className="text-slate-600 font-medium text-base mb-6">
          Your response has been recorded on the college campus leaderboard!
        </p>

        <div className="bg-amber-100 border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] inline-block mb-8">
          <div className="text-xs font-black uppercase text-slate-700">Final Score</div>
          <div className="text-4xl font-black text-[#EC4899] font-display">{score}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/leaderboard" className="neo-btn-pink text-sm w-full sm:w-auto">
            <Trophy className="w-4 h-4" /> View Leaderboard
          </Link>
          <Link to="/dashboard" className="neo-btn-white text-sm w-full sm:w-auto">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </motion.div>

      <footer className="text-center text-xs font-bold text-slate-400">
        QuizDeck Thank You Page • College Assessment System
      </footer>

    </div>
  );
}
