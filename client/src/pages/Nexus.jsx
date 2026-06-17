import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Filter, Flame, Clock, Bookmark, ArrowUpRight, Plus, Terminal } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Nexus = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOpp, setNewOpp] = useState({ title: '', description: '', type: 'Hackathon', domain: 'AI', reward: '', deadline: '' });
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/opportunities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOpportunities(res.data);
      } catch (err) {
        console.error("Nexus sweep failed", err);
      }
    };
    if (token) fetchOpps();
  }, [token]);

  const handleApply = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/opportunities/${id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Application deployed successfully.');
      // Update local state to reflect application
      setOpportunities(opportunities.map(o => {
        if(o._id === id) {
          const apps = o.applications || [];
          return { ...o, applications: [...apps, { user: user.id || user._id }] };
        }
        return o;
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error applying');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/opportunities', newOpp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities([res.data, ...opportunities]);
      setShowCreateModal(false);
    } catch (err) {
      alert('Failed to deploy opportunity.');
    }
  };

  const filters = ['All', 'Hackathon', 'Internship', 'Startup Cohort', 'Research Project', 'Exhibition', 'Audition', 'Freelance Gig', 'Partnership', 'Mentorship'];
  
  const filteredOpps = activeFilter === 'All' 
    ? opportunities 
    : opportunities.filter(o => o.type === activeFilter);

  return (
    <div className="space-y-8 pb-10 mt-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-card p-12 border-white/20 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-secondary/10 blur-[120px] rounded-[100%]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-10 left-20 w-32 h-32 bg-secondary/20 blur-3xl rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 bg-primary/10 blur-3xl rounded-full animate-float-delayed"></div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-20 h-20 rounded-3xl bg-secondary/20 flex items-center justify-center mb-6 shadow-neon-purple relative z-10 border border-secondary/30 backdrop-blur-md"
        >
          <Target className="text-secondary w-10 h-10 animate-pulse-glow" />
        </motion.div>
        
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-secondary tracking-tighter uppercase relative z-10 mb-4 bg-[length:200%_auto] animate-shimmer">
          Opportunity Nexus
        </h1>
        <p className="text-white/60 max-w-2xl relative z-10 text-sm">
          The singularity of growth. Discover high-leverage hackathons, elite internships, and research grants completely tailored to your neural matrix.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === f 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-white/40 hover:text-white/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/opportunity-command')}
            className="flex items-center gap-2 text-white/80 font-bold uppercase text-[10px] tracking-widest hover:text-secondary transition-all px-4 border-r border-white/10">
            <Terminal size={14} /> My Postings
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-background font-bold uppercase text-xs tracking-widest bg-secondary px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-neon-purple hover:shadow-[0_0_30px_rgba(191,0,255,0.6)] relative overflow-hidden group">
            <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-shimmer"></span>
            <Plus size={16} /> Deploy Opportunity
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="glass-card p-8 border-secondary/30 w-full max-w-lg">
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter mb-4">Deploy Opportunity</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required placeholder="Title" value={newOpp.title} onChange={(e) => setNewOpp({...newOpp, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none text-sm" />
                <textarea required placeholder="Description" value={newOpp.description} onChange={(e) => setNewOpp({...newOpp, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none text-sm h-24" />
                <div className="flex gap-4">
                  <select value={newOpp.type} onChange={(e) => setNewOpp({...newOpp, type: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none text-sm appearance-none">
                    {filters.slice(1).map(f => <option key={f} className="bg-background">{f}</option>)}
                  </select>
                  <input required placeholder="Domain (e.g. AI)" value={newOpp.domain} onChange={(e) => setNewOpp({...newOpp, domain: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none text-sm" />
                </div>
                <div className="flex gap-4">
                  <input required placeholder="Reward" value={newOpp.reward} onChange={(e) => setNewOpp({...newOpp, reward: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none text-sm" />
                  <input type="date" required value={newOpp.deadline} onChange={(e) => setNewOpp({...newOpp, deadline: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none text-sm" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                   <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2 rounded-lg text-white/50 text-xs font-bold uppercase hover:bg-white/5">Abort</button>
                   <button type="submit" className="px-6 py-2 rounded-lg bg-secondary text-background text-xs font-bold uppercase shadow-neon-blue">Deploy</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Masonry-Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredOpps.map((opp, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={opp._id}
              className="glass-card p-6 border-white/10 hover:border-secondary/40 transition-all duration-300 flex flex-col group relative overflow-hidden h-[320px] transform hover:-translate-y-2 hover:shadow-neon-purple"
            >
              {/* Cinematic Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded italic ${
                  opp.type === 'Hackathon' ? 'bg-primary/20 text-primary' : 
                  opp.type === 'Internship' ? 'bg-secondary/20 text-secondary' : 
                  'bg-white/10 text-white/80'
                }`}>
                  {opp.type}
                </span>
                <Bookmark className="text-white/20 hover:text-white cursor-pointer transition-colors" size={18} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 relative z-10 group-hover:text-secondary transition-colors">{opp.title}</h3>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-4 relative z-10">{opp.domain}</p>
              
              <p className="text-sm text-white/60 mb-6 flex-1 line-clamp-3 relative z-10">
                {opp.description}
              </p>

              <div className="mt-auto space-y-4 border-t border-white/5 pt-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-white">{opp.reward}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase">{new Date(opp.deadline).toLocaleDateString()}</span>
                  </div>
                  {(() => {
                    const hasApplied = opp.applications?.some(a => a.user === (user?.id || user?._id));
                    const isCreator = opp.creator === (user?.id || user?._id);
                    
                    if (isCreator) return <span className="text-[10px] text-white/40 uppercase font-bold px-3 border border-white/10 rounded py-1">Owner</span>;
                    if (hasApplied) return <span className="text-[10px] text-secondary uppercase font-bold px-3 border border-secondary/30 bg-secondary/10 rounded py-1">Deployed</span>;
                    
                    return (
                      <button 
                        onClick={() => handleApply(opp._id)}
                        className="text-[10px] uppercase font-bold px-4 py-1.5 rounded-lg bg-white/10 text-white hover:bg-secondary hover:text-background transition-all duration-300 hover:shadow-neon-purple hover:scale-105 relative overflow-hidden group/btn">
                        <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:animate-shimmer"></span>
                        Deploy
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ))}
          {filteredOpps.length === 0 && (
            <div className="col-span-full py-20 text-center text-white/40 italic">
              No opportunities found matching this filter frequency.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Nexus;
