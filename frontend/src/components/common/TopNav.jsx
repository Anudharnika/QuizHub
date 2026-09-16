import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, ChevronDown, LogOut, User, Settings, Sparkles, Radio, CheckCircle2, XCircle, Info, Trophy, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI } from '../../services/api';

export default function TopNav() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      notificationAPI.getAll().then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      }).catch(() => {});
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const notifIconMap = { success: CheckCircle2, error: XCircle, info: Info, badge: Trophy, warning: AlertTriangle };
  const notifColorMap = { success: 'text-emerald-500', error: 'text-red-500', info: 'text-blue-500', badge: 'text-amber-500', warning: 'text-amber-500' };

  return (
    <header className="h-18 bg-[#FFFDF9] border-b-2 border-black flex items-center px-4 sm:px-8 gap-4 sticky top-0 z-30 shadow-[0px_2px_0px_#000]">
      
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search quizzes, topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-white border-2 border-black font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EC4899] shadow-[2px_2px_0px_#000]"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        
        {/* Live Arena Quick Button */}
        <Link to="/live" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-black bg-amber-300 font-extrabold text-xs shadow-[2px_2px_0px_#000] hover:translate-y-[-1px]">
          <Radio className="w-3.5 h-3.5 text-black animate-pulse" /> Live Arena
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black hover:bg-slate-50 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EC4899] text-white text-[10px] font-black rounded-full flex items-center justify-center border border-black shadow-[1px_1px_0px_#000]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute right-0 top-12 w-80 neo-box p-0 overflow-hidden z-50 bg-white"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-amber-100">
                  <h3 className="font-extrabold text-slate-900 text-sm font-display">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#EC4899] hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-bold text-xs">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <div
                        key={n.id || n._id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-black/10 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-pink-50' : ''}`}
                      >
                        {(() => { const Icon = notifIconMap[n.type] || Info; return <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notifColorMap[n.type] || 'text-blue-500'}`} />; })()}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-slate-900">{n.title}</p>
                          <p className="text-[11px] font-medium text-slate-600 mt-0.5 truncate">{n.message}</p>
                        </div>
                        {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] border border-black mt-1.5 flex-shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-slate-50 transition-all"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-7 h-7 rounded-full border border-black object-cover"
            />
            <span className="hidden sm:block text-xs font-black text-slate-900 max-w-[100px] truncate font-display">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-black hidden sm:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute right-0 top-12 w-52 neo-box p-0 overflow-hidden z-50 bg-white"
              >
                <div className="px-4 py-3 border-b-2 border-black bg-pink-100">
                  <p className="text-xs font-extrabold text-slate-900 truncate font-display">{user?.name}</p>
                  <p className="text-[11px] font-bold text-slate-600 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                    <User className="w-4 h-4 text-[#EC4899]" /> Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-purple-600" /> Settings
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
