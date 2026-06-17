import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Radar as RadarIcon, Activity, Trophy, Zap, Cpu, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import SynergyIndicator from '../components/SynergyIndicator';
import useAuthStore from '../store/useAuthStore';

const Radar = () => {
  const mockLeaders = [
    { _id: 'l1', name: 'Dr. Priya Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', domain: 'Healthcare & Medicine', experienceLevel: 'Visionary', collaborationScore: 940, skills: ['Clinical Research', 'Data Analysis', 'Python'] },
    { _id: 'l2', name: 'Arjun Reddy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun', domain: 'Arts & Creative Fields', experienceLevel: 'Expert', collaborationScore: 880, skills: ['UI/UX Design', 'Figma', 'React'] },
    { _id: 'l3', name: 'Vikram Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', domain: 'Business & Management', experienceLevel: 'Visionary', collaborationScore: 850, skills: ['Venture Capital', 'Agile', 'Leadership'] }
  ];

  const [leaders, setLeaders] = useState(mockLeaders);
  const [platformStats, setPlatformStats] = useState({ activeNodes: 0, syncedProjects: 0, totalHubs: 0 });
  const [expandedId, setExpandedId] = useState(null);
  const [requestedIds, setRequestedIds] = useState([]);
  const { token, user } = useAuthStore();

  const handleConnect = async (e, targetId) => {
    e.stopPropagation(); // Prevent closing the accordion
    if (!token) return alert('You must be connected to the grid to initiate links.');
    
    try {
      await axios.post(`http://localhost:5000/api/connections/request/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequestedIds([...requestedIds, targetId]);
    } catch (err) {
      alert(err.response?.data?.msg || 'Link establishment failed.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profiles/leaderboard');
        setLeaders(res.data.length > 0 ? res.data : mockLeaders);
      } catch (err) {
        console.error("Radar sweep failed", err);
      }
    };
    fetchData();

    // Mock platform telemetry that dynamically updates for cinematic effect
    const interval = setInterval(() => {
      setPlatformStats({
        activeNodes: Math.floor(1200 + Math.random() * 50),
        syncedProjects: Math.floor(340 + Math.random() * 5),
        totalHubs: 7
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-10 mt-8 max-w-6xl mx-auto">
      {/* Header Telemetry */}
      <div className="glass-card p-8 border-white/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-primary/30 flex items-center justify-center relative">
            <span className="absolute inset-0 rounded-2xl border border-primary/50 animate-ping opacity-20"></span>
            <RadarIcon className="text-primary animate-pulse w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Global Radar</h1>
            <p className="text-primary font-bold tracking-widest text-xs uppercase mt-1 flex items-center gap-2">
              <Activity size={14} /> Network Telemetry Online
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-4">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center min-w-[120px]">
            <p className="text-[10px] text-white/50 font-bold uppercase mb-1">Active Nodes</p>
            <p className="text-2xl font-mono text-white">{platformStats.activeNodes}</p>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center min-w-[120px]">
            <p className="text-[10px] text-white/50 font-bold uppercase mb-1">Synapse Projects</p>
            <p className="text-2xl font-mono text-white">{platformStats.syncedProjects}</p>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-3 border-white/10 flex items-center gap-4 overflow-hidden">
         <span className="text-[10px] font-bold uppercase tracking-widest text-primary shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Live Feed
         </span>
         <div className="w-full relative h-4 overflow-hidden text-xs font-mono text-white/60 whitespace-nowrap">
            <motion.div 
              animate={{ x: [800, -1000] }} 
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute left-0 top-0 flex gap-10"
            >
              <span>[SYS] Node connection established in Mumbai.</span>
              <span>[ALERT] High synergy detected in AI Hub.</span>
              <span>[SEC] Protocol handshake confirmed in Nexus.</span>
              <span>[NET] Bandwidth optimization complete.</span>
              <span>[OPP] 5 new bounties posted in Web3.</span>
            </motion.div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard Podium */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <Trophy className="text-secondary" /> Prime Visionaries
          </h2>
          {leaders.map((leader, idx) => (
            <motion.div 
              key={leader._id}
              layout
              onClick={() => setExpandedId(expandedId === leader._id ? null : leader._id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-card p-4 hover:border-secondary/50 transition-all cursor-pointer overflow-hidden relative ${expandedId === leader._id ? 'border-secondary/50 bg-secondary/5' : ''}`}
            >
              {idx === 0 && <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent opacity-50"></div>}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-6 relative z-10">
                  <span className={`text-2xl font-black w-8 text-center ${idx === 0 ? 'text-secondary' : 'text-white/20'}`}>
                    {idx + 1}
                  </span>
                  <img src={leader.avatar} alt="avatar" className={`w-14 h-14 rounded-xl bg-white/5 border ${idx < 3 ? 'border-secondary/50' : 'border-white/10'}`} />
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-secondary transition-colors">{leader.name}</h3>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{leader.domain} • {leader.experienceLevel}</p>
                  </div>
                </div>
                
                <div className="text-right relative z-10 flex flex-col items-end">
                   <span className="text-2xl font-mono text-white font-black">{leader.collaborationScore + (100 - idx*10)}</span>
                   <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Collab Score</span>
                </div>
              </div>
              {expandedId === leader._id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="pt-4 mt-4 border-t border-white/10 flex gap-4 text-xs relative z-10"
                >
                  <div className="flex-1 bg-black/40 rounded-lg p-3 border border-white/5">
                    <p className="text-white/40 uppercase font-bold tracking-widest mb-2 text-[10px]">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {leader.skills?.slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white">{s}</span>
                      )) || <span className="text-white/30">Classified</span>}
                    </div>
                  </div>
                  <div className="flex-1 bg-black/40 rounded-lg p-3 border border-white/5 flex flex-col justify-between">
                    <div>
                      <p className="text-white/40 uppercase font-bold tracking-widest mb-1 text-[10px]">Network Impact</p>
                      <p className="text-lg font-bold text-secondary">{Math.floor(Math.random() * 50) + 10} Nodes Connected</p>
                    </div>
                    <button 
                      onClick={(e) => handleConnect(e, leader._id)}
                      disabled={requestedIds.includes(leader._id) || user?.connections?.includes(leader._id)}
                      className={`mt-3 w-full py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        user?.connections?.includes(leader._id) 
                          ? 'bg-primary/20 text-primary border border-primary/30 cursor-not-allowed'
                          : requestedIds.includes(leader._id) 
                            ? 'bg-white/5 text-white/50 border border-white/10' 
                            : 'bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary hover:text-white'
                      }`}
                    >
                      {user?.connections?.includes(leader._id) ? (
                         <><CheckCircle2 size={14} /> Synchronized</>
                      ) : requestedIds.includes(leader._id) ? (
                         <><CheckCircle2 size={14} /> Link Requested</>
                      ) : (
                         <><LinkIcon size={14} /> Initiate Link</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Neural Distribution */}
        <div className="space-y-6">
          <div className="glass-card p-8 border-primary/20 relative">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Cpu className="text-primary"/> Domain Distribution</h3>
            <div className="space-y-6">
               {['Engineering & Technology', 'Arts & Creative Fields', 'Healthcare & Medicine', 'Business & Management'].map((dom, i) => {
                 const percentage = [85, 60, 40, 30][i];
                 return (
                 <div key={dom} className="relative group">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -m-2 p-2" />
                   <div className="flex justify-between text-xs font-bold uppercase text-white/60 mb-2 relative z-10">
                     <span className="flex items-center gap-2">
                        <Activity size={10} className="text-primary group-hover:animate-pulse" />
                        {dom}
                     </span>
                     <span className="font-mono text-primary">{percentage}%</span>
                   </div>
                   <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden relative z-10">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${percentage}%` }} 
                       transition={{ duration: 1.5, delay: 0.5 + i*0.2 }}
                       className="h-full bg-primary"
                     />
                   </div>
                   <div className="flex justify-between mt-1 text-[8px] text-white/30 font-mono uppercase relative z-10">
                      <span>Load: {Math.floor(Math.random() * 40 + 20)}%</span>
                      <span>Integrity: 100%</span>
                   </div>
                 </div>
               )})}
            </div>
          </div>

          <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[220px] h-[220px] border border-secondary/20 rounded-full border-dashed" />
             <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-[280px] h-[280px] border border-primary/20 rounded-full border-dotted" />
             <div className="relative mb-6 z-10">
               <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full animate-pulse"></div>
               <SynergyIndicator percentage={100} size={150} />
               <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-secondary w-10 h-10 animate-pulse drop-shadow-neon-secondary" />
             </div>
             <p className="text-white font-bold text-lg relative z-10">System Synergy</p>
             <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-2 relative z-10">All sectors nominal. Nodes communicating perfectly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Radar;
