import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PlusCircle, Database, Compass, BarChart2,
  Trophy, User, Settings, LogOut, Zap, ChevronLeft, ChevronRight, Shield, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BookOpen, label: 'My Quizzes', to: '/my-quizzes' },
  { icon: PlusCircle, label: 'Create Quiz', to: '/create-quiz', highlight: true },
  { icon: Database, label: 'Question Bank', to: '/question-bank' },
  { icon: Compass, label: 'Explore', to: '/explore' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics' },
  { icon: Trophy, label: 'Leaderboard', to: '/leaderboard' },
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
        ${isActive(item.to)
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
          : item.highlight
            ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${item.highlight && !isActive(item.to) ? 'text-indigo-500' : ''}`} />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {item.label}
        </div>
      )}
    </Link>
  );

  const SidebarContent = ({ isCollapsed }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 py-4 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            QuizHub
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(item => <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />)}

        {user?.role === 'admin' && (
          <NavItem item={{ icon: Shield, label: 'Admin', to: '/admin' }} isCollapsed={isCollapsed} />
        )}
      </nav>

      {/* Bottom items */}
      <div className="px-2 pb-4 space-y-1 border-t border-slate-100 dark:border-slate-700 pt-3">
        {bottomItems.map(item => <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />)}

        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-2.5 mt-1 ${isCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-indigo-100 dark:ring-indigo-900"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
      >
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 z-50 shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent isCollapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="hidden lg:flex flex-col h-screen bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 sticky top-0 overflow-hidden flex-shrink-0"
      >
        <SidebarContent isCollapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronLeft className="w-3 h-3 text-slate-500" />}
        </button>
      </motion.aside>
    </>
  );
}
