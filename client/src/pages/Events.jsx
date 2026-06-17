import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Navigation, MapPin } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applicationText, setApplicationText] = useState('');
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const handleEngage = (evt) => {
    setSelectedEvent(evt);
    setShowModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/opportunities/${selectedEvent._id}/apply`, 
        { roleAppliedFor: 'Attendee', applicationText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Application transmitted to Summit Organizers.');
      setShowModal(false);
      setApplicationText('');
    } catch (err) {
      if(err.response?.status === 400) {
        alert(err.response.data.message);
      } else {
        alert('Failed to transmit application.');
      }
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/opportunities?domain=${encodeURIComponent(user?.domain || '')}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter to only show Global Summits
        setEvents(res.data.filter(o => o.type === 'Global Summit' || o.type === 'Hackathon'));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [token]);

  return (
    <div className="space-y-8 pb-10 mt-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col relative rounded-3xl overflow-hidden min-h-[300px] border border-white/20">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&w=2000&q=80)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-20 pb-10 text-center px-4">
          <Globe className="text-secondary mb-4 w-16 h-16 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter shadow-black drop-shadow-2xl mb-4">
            Global Summits
          </h1>
          <p className="text-white/80 font-bold uppercase tracking-widest text-sm max-w-xl">
            Compete internationally. Push your neural limits. Join the highest tier hackathons and tech summits worldwide.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white/50 animate-pulse italic">Scanning global frequencies...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-white/50 italic">No incoming events detected.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {events.map((evt, idx) => (
              <motion.div 
                key={evt._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card flex flex-col sm:flex-row rounded-3xl overflow-hidden border-white/10 hover:border-secondary/50 group cursor-pointer transition-all min-h-[220px]"
              >
                <div className="w-full sm:w-1/3 bg-white/5 relative flex items-center justify-center p-6 border-r border-white/10 group-hover:bg-secondary/10 transition-colors">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-secondary tracking-widest mb-2 border border-secondary/20 rounded px-2 py-1 inline-block">{evt.domain}</p>
                    <p className="text-4xl font-black text-white">{evt.deadline ? new Date(evt.deadline).getDate() : 'TBA'}</p>
                    <p className="text-xs font-bold text-white/50 uppercase">{evt.deadline ? new Date(evt.deadline).toLocaleString('default', { month: 'short' }) : 'Future'}</p>
                  </div>
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                       <MapPin size={12} /> {evt.type === 'Global Summit' ? 'International / Remote' : 'Global Web'}
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-secondary tracking-tight leading-tight mb-2 transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-4 line-clamp-2">{evt.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex -space-x-2">
                       {/* Mock avatars mimicking attendees */}
                       <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-background"></div>
                       <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-background"></div>
                       <div className="w-8 h-8 rounded-full bg-white/40 border-2 border-background flex items-center justify-center text-[8px] font-bold text-black">+2k</div>
                    </div>
                    <button onClick={() => handleEngage(evt)} className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      ENGAGE <Navigation size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showModal && selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-8 border-white/20 w-full max-w-lg relative"
            >
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tighter">Summit Registration</h3>
              <p className="text-white/60 text-sm mb-6 uppercase tracking-widest">{selectedEvent.title}</p>
              
              <form onSubmit={submitApplication} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">Your Objective</label>
                  <textarea 
                    required
                    value={applicationText}
                    onChange={(e) => setApplicationText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-secondary/50 text-sm h-32 mt-1 outline-none transition-all" 
                    placeholder="Why are you attending this summit? What unique perspective do you bring to the network?" 
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-secondary text-white font-bold shadow-neon-secondary hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    Transmit <Navigation size={14}/>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
