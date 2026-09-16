import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PlusCircle, Database, Compass, BarChart2,
  Trophy, User, Settings, LogOut, Zap, ChevronLeft, ChevronRight, Shield, Menu, X, Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BookOpen, label: 'My Quizzes', to: '/my-quizzes' },
  { icon: PlusCircle, label: 'Create Quiz', to: '/create-quiz', highlight: true },
  { icon: Radio, label: 'Live Arena', to: '/live' },
  { icon: Database, label: 'Question Bank', to: '/question-bank' },
  { icon: Compass, label: 'Explore', to: '/explore' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics' },
  { icon: Trophy, label: 'Leaderboard', to: '/leaderboard' },
];

const mobileBottomNav = [
  { icon: LayoutDashboard, label: 'Home', to: '/dashboard' },
  { icon: BookOpen, label: 'Quizzes', to: '/my-quizzes' },
  { icon: PlusCircle, label: 'Create', to: '/create-quiz', highlight: true },
  { icon: Radio, label: 'Live', to: '/live' },
  { icon: Trophy, label: 'Ranks', to: '/leaderboard' },
];

const bottomItems = [
  { icon: User, label: 'Profile', to: '/profile' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  const NavItem = ({ item, isCollapsed }) => (
    <Link
      to={item.to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-extrabold transition-all duration-150 border-2 ${
        isActive(item.to)
          ? 'bg-[#EC4899] text-white border-black shadow-[3px_3px_0px_#000]'
          : item.highlight
          ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000]'
          : 'bg-white text-slate-800 border-transparent hover:border-black hover:shadow-[2px_2px_0px_#000]'
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span className="truncate font-display">{item.label}</span>}
    </Link>
  );

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#FFFDF9] border-b-2 border-black px-4 py-3 flex items-center justify-between shadow-[0px_2px_0px_#000]">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]"
        >
          <Menu className="w-5 h-5 text-black" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-base shadow-[2px_2px_0px_#000]">
            C
          </div>
          <span className="font-black text-xl font-display">QuizHub</span>
        </Link>

        <Link to="/profile" className="w-8 h-8 rounded-full border-2 border-black overflow-hidden shadow-[1px_1px_0px_#000]">
          <img src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`} alt="user" className="w-full h-full object-cover" />
        </Link>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#FFFDF9] border-r-3 border-black z-50 shadow-2xl flex flex-col p-4"
            >
              <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-lg shadow-[2px_2px_0px_#000]">
                    C
                  </div>
                  <span className="font-black text-xl font-display">QuizHub Menu</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-black font-bold">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <NavItem key={item.to} item={item} isCollapsed={false} />
                ))}
                {user?.role === 'admin' && (
                  <NavItem item={{ icon: Shield, label: 'Admin', to: '/admin' }} isCollapsed={false} />
                )}
              </div>

              <div className="pt-4 border-t-2 border-black space-y-2">
                {bottomItems.map((item) => (
                  <NavItem key={item.to} item={item} isCollapsed={false} />
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full neo-btn-white py-2 text-xs flex items-center justify-center gap-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="hidden lg:flex flex-col h-screen bg-[#FFFDF9] border-r-3 border-black sticky top-0 overflow-hidden flex-shrink-0 z-30 p-4 justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#EC4899] border-2 border-black flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_#000]">
                C
              </div>
              {!collapsed && <span className="font-black text-2xl font-display">QuizHub</span>}
            </Link>
          </div>

          <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} isCollapsed={collapsed} />
            ))}
            {user?.role === 'admin' && (
              <NavItem item={{ icon: Shield, label: 'Admin', to: '/admin' }} isCollapsed={collapsed} />
            )}
          </nav>
        </div>

        <div className="space-y-2 pt-3 border-t-2 border-black">
          {bottomItems.map((item) => (
            <NavItem key={item.to} item={item} isCollapsed={collapsed} />
          ))}
        </div>
      </motion.aside>

      {/* Mobile Bottom Quick Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-black px-2 py-1.5 flex items-center justify-around shadow-[0px_-4px_0px_#000]">
        {mobileBottomNav.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl font-bold text-[10px] transition-all ${
                active 
                  ? 'bg-[#EC4899] text-white border-1.5 border-black shadow-[2px_2px_0px_#000]' 
                  : item.highlight
                  ? 'bg-amber-300 text-black border-1.5 border-black'
                  : 'text-slate-700'
              }`}
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
