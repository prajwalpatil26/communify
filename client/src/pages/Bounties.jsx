import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Clock, Coins, ChevronRight, Search } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Bounties = () => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/opportunities?domain=${encodeURIComponent(user?.domain || '')}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter to only show bounties
        setBounties(res.data.filter(o => o.type === 'Bounty'));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchBounties();
  }, [token]);

  const filteredBounties = bounties.filter(b => 
    b.title.toLowerCase().includes(filter.toLowerCase()) || 
    b.requiredSkills.some(s => s.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-10 mt-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
         <div className="flex-1 glass-card p-8 border-secondary/20 relative overflow-hidden bg-secondary/5">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Coins className="text-secondary" /> Bounties Terminal
            </h2>
            <p className="text-white/60 mb-4 text-sm font-medium uppercase tracking-widest">Execute micro-tasks. Accumulate Credits. Increase Node Ranking.</p>
            
            <div className="flex gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                 <input 
                   type="text" 
                   value={filter}
                   onChange={e => setFilter(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-secondary outline-none text-sm"
                   placeholder="Search skills or tasks..." 
                 />
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
             <div className="text-white/30 italic text-center p-8 w-full col-span-2">Syncing with ledger...</div>
        ) : filteredBounties.length === 0 ? (
             <div className="text-white/30 italic text-center p-8 w-full col-span-2">No active bounties detected matching your query.</div>
        ) : (
          <AnimatePresence>
            {filteredBounties.map((bounty, idx) => (
              <motion.div 
                key={bounty._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 border-white/10 hover:border-secondary/50 rounded-2xl group transition-all cursor-pointer relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <Briefcase className="text-secondary" size={60} />
                 </div>
                 <div className="flex items-center justify-between mb-4 relative z-10">
                   <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded font-bold uppercase tracking-widest">{bounty.domain}</span>
                   <span className="text-sm font-bold text-green-400 flex items-center gap-1"><Coins size={14}/> {bounty.reward}</span>
                 </div>
                 
                 <h3 className="text-lg font-bold text-white mb-2 relative z-10">{bounty.title}</h3>
                 <p className="text-white/60 text-xs mb-4 line-clamp-2 relative z-10">{bounty.description}</p>
                 
                 <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {bounty.requiredSkills?.map(s => (
                       <span key={s} className="px-2 py-0.5 border border-white/20 bg-white/5 rounded text-[10px] text-white/70">{s}</span>
                    ))}
                 </div>

                 <div className="flex items-center justify-between border-t border-white/10 pt-4 relative z-10 text-xs font-bold uppercase">
                   <div className="flex items-center gap-2 text-white/40">
                     <Clock size={14} /> 
                     {bounty.deadline ? Math.ceil((new Date(bounty.deadline) - new Date()) / (1000 * 60 * 60 * 24)) + ' Days Left' : 'No strict deadline'}
                   </div>
                   <button className="text-secondary group-hover:text-white flex items-center gap-1 transition-colors">
                     CLAIM <ChevronRight size={14} />
                   </button>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Bounties;
