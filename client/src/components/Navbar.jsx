import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network, LogOut, Bell, Search, Loader2, CheckCircle2, Menu, X, MessageSquare } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, token, socket } = useAuthStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults(null);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchUnreadMsgs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages/unread-count', {
           headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadMsgCount(res.data.unread);
      } catch (err) {}
    };
    fetchUnreadMsgs();
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      // If we got a new message and we aren't currently viewing it, increment
      // (This is simplistic; if we're on /messages with this user, it's auto-read there, 
      // but a global increment is fine for polish unread count)
      setUnreadMsgCount(prev => prev + 1);
    };
    socket.on('receive_direct_message', handler);
    return () => socket.off('receive_direct_message', handler);
  }, [socket]);
  
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (token) fetchNotifications(token);
  }, [token, fetchNotifications]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setSearching(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/search?q=${query}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setResults(res.data);
        } catch (err) {
          console.error(err);
        }
        setSearching(false);
      } else {
        setResults(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, token]);

  const handleResultClick = (path) => {
    setResults(null);
    setQuery('');
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 h-16 flex items-center justify-between px-4 md:px-6 border-t border-x border-white/10 border-b-0 overflow-visible group">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-neon-lime">
          <Network className="text-background" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white">COMMUNIFY</span>
      </div>

      <div className="hidden lg:flex items-center gap-6 text-white/50 font-bold text-xs uppercase tracking-widest relative z-10">
        {[
          { path: '/', label: 'Orbit', colorClass: 'hover:text-primary', bgClass: 'bg-primary', shadow: 'shadow-neon-lime' },
          { path: '/radar', label: 'Radar', colorClass: 'hover:text-primary', bgClass: 'bg-primary', shadow: 'shadow-neon-lime' },
          { path: '/nexus', label: 'Nexus', colorClass: 'hover:text-secondary', bgClass: 'bg-secondary', shadow: 'shadow-neon-purple' },
          { path: `/hub/${user?.domain || 'AI'}`, label: 'Hubs', colorClass: 'hover:text-primary', bgClass: 'bg-primary', shadow: 'shadow-neon-lime' },
          { path: '/projects', label: 'Teams', colorClass: 'hover:text-primary', bgClass: 'bg-primary', shadow: 'shadow-neon-lime' },
          { path: '/bounties', label: 'Bounties', colorClass: 'hover:text-green-400', bgClass: 'bg-green-400', shadow: 'shadow-neon-lime' },
          { path: '/events', label: 'Summits', colorClass: 'hover:text-white', bgClass: 'bg-white', shadow: '' },
          { path: '/telemetry', label: 'Telemetry', colorClass: 'hover:text-accent', bgClass: 'bg-accent', shadow: 'shadow-neon-blue' }
        ].map((link, idx) => (
          <Link key={idx} to={link.path} className={`${link.colorClass} hover:tracking-[0.2em] transition-all relative group py-1`}>
            {link.label}
            <span className={`absolute -bottom-1 left-1/2 w-0 h-[2px] ${link.bgClass} transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 ${link.shadow}`}></span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 gap-2">
            {searching ? <Loader2 size={16} className="text-primary animate-spin" /> : <Search size={16} className="text-white/40" />}
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search domain, team..." 
              className="bg-transparent border-none outline-none text-sm text-white w-40 focus:w-64 transition-all"
            />
          </div>

          <AnimatePresence>
            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-12 left-0 w-80 glass-card p-4 border border-white/20 shadow-2xl max-h-96 overflow-y-auto"
              >
                {results.users?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-white/40 mb-2">Visionaries</p>
                    {results.users.map(u => (
                      <div key={u._id} onClick={() => handleResultClick('/')} className="flex gap-2 items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <img src={u.avatar} className="w-6 h-6 rounded-md bg-white/20" alt="av" />
                        <div>
                          <p className="text-sm font-bold text-white leading-none">{u.name}</p>
                          <p className="text-[10px] text-primary">{u.domain}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {results.projects?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-white/40 mb-2">Projects</p>
                    {results.projects.map(p => (
                      <div key={p._id} onClick={() => handleResultClick('/projects')} className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <p className="text-sm font-bold text-white leading-none">{p.title}</p>
                        <p className="text-[10px] text-white/50">{p.domain} • {p.status}</p>
                      </div>
                    ))}
                  </div>
                )}
                {results.hubs?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/40 mb-2">Hubs</p>
                    {results.hubs.map(h => (
                      <div key={h._id} onClick={() => handleResultClick(`/hub/${h.domain}`)} className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <p className="text-sm font-bold text-white leading-none">{h.domain}</p>
                        <p className="text-[10px] text-white/50 line-clamp-1">{h.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {!results.users?.length && !results.projects?.length && !results.hubs?.length && (
                  <p className="text-xs text-center text-white/40 py-4">No matching vectors found.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => { navigate('/messages'); setUnreadMsgCount(0); }} className="relative cursor-pointer text-white/70 hover:text-white transition-colors">
          <MessageSquare size={20} />
          {unreadMsgCount > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-accent border-[2px] border-background"></span></span>}
        </button>

        <div className="relative" ref={notifRef}>
          <div className="relative cursor-pointer" onClick={() => { setShowNotifs(!showNotifs); if(unreadCount>0) markAsRead(token); }}>
            <Bell size={20} className="text-white/70 hover:text-white transition-colors" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-[2px] border-background"></span></span>}
          </div>
          
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-10 -right-24 md:right-0 w-[350px] glass-card p-0 border border-white/20 shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Global Telemetry</span>
                  <CheckCircle2 size={14} className="text-primary"/>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-white/40 text-xs">No active signals</div>
                  ) : notifications.map(n => (
                    <div key={n._id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}>
                      <p className="text-xs text-white/90 leading-relaxed">{n.content}</p>
                      <p className="text-[9px] text-white/40 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleTimeString()} • {n.type.replace('_',' ')}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <Link to="/profile" className="text-right hidden lg:block hover:opacity-80 transition-opacity cursor-pointer">
            <p className="text-xs font-bold text-white uppercase">{user?.name}</p>
            <p className="text-[10px] text-primary">{user?.domain} Visionary</p>
          </Link>
          <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block">
            <LogOut size={20} className="text-secondary" />
          </button>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors ml-2" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <X size={20} className="text-white"/> : <Menu size={20} className="text-white"/>}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-[70px] left-0 right-0 glass-card border border-white/20 overflow-hidden md:hidden shadow-2xl flex flex-col"
          >
            <div className="flex flex-col p-4 gap-4 text-xs font-bold uppercase tracking-widest text-center text-white/70">
              <Link to="/" onClick={() => setShowMobileMenu(false)} className="hover:text-primary py-2 border-b border-white/5">Orbit</Link>
              <Link to="/radar" onClick={() => setShowMobileMenu(false)} className="hover:text-primary py-2 border-b border-white/5">Radar</Link>
              <Link to="/nexus" onClick={() => setShowMobileMenu(false)} className="hover:text-secondary py-2 border-b border-white/5">Nexus</Link>
              <Link to={`/hub/${user?.domain || 'AI'}`} onClick={() => setShowMobileMenu(false)} className="hover:text-primary py-2 border-b border-white/5">Hubs</Link>
              <Link to="/projects" onClick={() => setShowMobileMenu(false)} className="hover:text-primary py-2 border-b border-white/5">Teams</Link>
              <Link to="/bounties" onClick={() => setShowMobileMenu(false)} className="hover:text-green-400 py-2 border-b border-white/5">Bounties</Link>
              <Link to="/events" onClick={() => setShowMobileMenu(false)} className="hover:text-white py-2 border-b border-white/5">Summits</Link>
              <Link to="/telemetry" onClick={() => setShowMobileMenu(false)} className="hover:text-accent py-2 border-b border-white/5">Telemetry</Link>
              <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="hover:text-primary py-2 border-b border-white/5 text-primary">Identity Matrix</Link>
              <Link to="/messages" onClick={() => setShowMobileMenu(false)} className="hover:text-primary py-2 border-b border-white/5">Neural Inbox</Link>
              <button onClick={() => { logout(); setShowMobileMenu(false); }} className="hover:text-red-400 py-2 flex items-center justify-center gap-2 text-secondary">
                <LogOut size={14}/> Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
