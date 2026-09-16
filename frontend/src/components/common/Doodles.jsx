import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';

// Rotating Circular Badge Doodle
export function RotatingBadgeDoodle({ text = "Learn more about service • ", icon: Icon = Flame, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center w-28 h-28 ${className}`}>
      {/* Rotating outer text */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-full"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <path
            id="badgeCirclePath"
            d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
            fill="none"
          />
          <text className="text-[9px] font-extrabold uppercase tracking-widest fill-slate-800">
            <textPath href="#badgeCirclePath" startOffset="0%">
              {text} {text}
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Central Icon */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-12 h-12 rounded-full bg-amber-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] z-10 text-black"
      >
        <Icon className="w-5 h-5 text-black" />
      </motion.div>
    </div>
  );
}

// Playful Animated Character Image 1 (Hero Female Character)
export function AnimatedHeroCharacter({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative inline-block ${className}`}
    >
      {/* Swirl Doodle behind frame */}
      <motion.svg
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -left-8 w-16 h-16 text-black z-0 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      >
        <path d="M 20 80 Q 50 10 80 80 Q 90 40 40 20" />
      </motion.svg>

      {/* Main Container Card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative bg-[#F472B6] border-[3px] border-black rounded-[2rem] p-3 shadow-[8px_8px_0px_#000] overflow-hidden max-w-sm sm:max-w-md bg-grid-pattern z-10"
      >
        {/* Character Illustration SVG */}
        <svg viewBox="0 0 300 320" className="w-full h-auto rounded-[1.5rem]">
          <rect width="300" height="320" fill="#EC4899" rx="20" />
          
          {/* Hair & Cap */}
          <path d="M 60 120 C 60 40 240 40 240 120 C 240 170 240 200 240 200 L 60 200 Z" fill="#4C1D95" />
          <path d="M 70 80 C 120 20 220 20 260 80 L 250 110 L 60 90 Z" fill="#3B82F6" />
          
          {/* Pencil behind ear doodle */}
          <motion.g
            animate={{ rotate: [-3, 5, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect x="220" y="50" width="12" height="70" rx="3" fill="#F59E0B" stroke="#000" strokeWidth="2" transform="rotate(35 220 50)" />
            <polygon points="255,105 265,115 250,118" fill="#EC4899" stroke="#000" strokeWidth="1.5" />
          </motion.g>

          {/* Face Base */}
          <ellipse cx="150" cy="160" rx="75" ry="70" fill="#FED7AA" stroke="#000" strokeWidth="3" />

          {/* Glasses */}
          <g fill="none" stroke="#000" strokeWidth="4">
            <circle cx="118" cy="155" r="28" fill="#FEF08A" />
            <circle cx="182" cy="155" r="28" fill="#FEF08A" />
            <line x1="146" y1="155" x2="154" y2="155" />
          </g>
          {/* Eyes */}
          <circle cx="118" cy="155" r="6" fill="#000" />
          <circle cx="182" cy="155" r="6" fill="#000" />

          {/* Smiling Mouth */}
          <path d="M 115 190 Q 150 220 185 190" fill="#FFF" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Shirt / Clothes */}
          <path d="M 60 260 C 60 230 240 230 240 260 L 250 320 L 50 320 Z" fill="#06B6D4" stroke="#000" strokeWidth="3" />
          <path d="M 100 250 C 130 270 170 270 200 250" fill="none" stroke="#EC4899" strokeWidth="8" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// Playful Male Character
export function AnimatedMaleCharacter({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`relative inline-block ${className}`}
    >
      {/* "Free *" Badge Tag */}
      <motion.div
        animate={{ rotate: [-6, 6, -6], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 -right-3 bg-black text-white font-black text-lg px-4 py-1 rounded-lg border-2 border-white shadow-[3px_3px_0px_#000] z-20"
      >
        Free *
      </motion.div>

      {/* Main Frame */}
      <div className="bg-[#F472B6] border-[3px] border-black rounded-[2rem] p-3 shadow-[6px_6px_0px_#000] max-w-xs overflow-hidden">
        <svg viewBox="0 0 260 260" className="w-full h-auto rounded-[1.5rem] bg-[#EC4899]">
          <path d="M 50 110 C 50 30 210 30 210 110 Z" fill="#312E81" stroke="#000" strokeWidth="3" />
          <circle cx="70" cy="130" r="14" fill="#FDBA74" stroke="#000" strokeWidth="2.5" />
          <circle cx="190" cy="130" r="14" fill="#FDBA74" stroke="#000" strokeWidth="2.5" />
          <ellipse cx="130" cy="135" rx="60" ry="60" fill="#FDBA74" stroke="#000" strokeWidth="3" />
          <g fill="rgba(255,255,255,0.7)" stroke="#000" strokeWidth="3.5">
            <circle cx="102" cy="130" r="22" />
            <circle cx="158" cy="130" r="22" />
            <line x1="124" y1="130" x2="136" y2="130" />
          </g>
          <circle cx="102" cy="130" r="5" fill="#000" />
          <circle cx="158" cy="130" r="5" fill="#000" />
          <path d="M 130 138 Q 133 145 130 148" fill="none" stroke="#000" strokeWidth="2.5" />
          <path d="M 110 160 Q 130 175 150 160" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <path d="M 70 210 Q 130 250 190 210 L 210 260 L 50 260 Z" fill="#FFFFFF" stroke="#000" strokeWidth="3" />
        </svg>
      </div>
    </motion.div>
  );
}

// Sparkle Star Doodle
export function SparkleStar({ className = "w-6 h-6 text-amber-400" }) {
  return (
    <motion.svg
      animate={{ scale: [0.85, 1.25, 0.85], rotate: [0, 45, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className={`inline-block ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </motion.svg>
  );
}
