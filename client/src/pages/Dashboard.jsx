import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Zap, Target, Users, ArrowUpRight, TrendingUp, Activity, Clock, ChevronRight } from 'lucide-react';
import SynergyIndicator from '../components/SynergyIndicator';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const defaultMatches = [
    {
      user: { _id: 'dummy1', name: 'Dr. Ananya Sharma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', domain: 'Science & Research', skills: ['Quantum Mechanics', 'Data Analysis'] },
      synergy: 98,
      commonSkills: ['Data Analysis']
    },
    {
      user: { _id: 'dummy2', name: 'Rahul Verma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', domain: 'Business & Management', skills: ['Venture Capital', 'Agile'] },
      synergy: 85,
      commonSkills: ['Agile']
    }
  ];

  const defaultOpportunities = [
    {
      _id: 'opp1',
      title: 'Global Summit: Future of Tech & Business',
      description: 'Join visionaries around the world to discuss the next 10 years of cross-disciplinary innovation.',
      type: 'Global Summit',
      domain: 'Business & Management',
      reward: 'Exclusive Access'
    },
    {
      _id: 'opp2',
      title: 'UI/UX Interactive Dashboard Gig',
      description: 'Need an expert designer to create a cinematic frontend for a medical telemetry app.',
      type: 'Freelance Gig',
      domain: 'Arts & Creative Fields',
      reward: '1200 Credits'
    }
  ];

  const [matches, setMatches] = useState(defaultMatches);
  const [opportunities, setOpportunities] = useState(defaultOpportunities);
  const { user, token } = useAuthStore();
  const [savedOpps, setSavedOpps] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [matchRes, oppRes, savedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/profiles/matches', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/opportunities?domain=${encodeURIComponent(user?.domain || '')}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/opportunities/saved', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMatches(matchRes.data.length > 0 ? matchRes.data : defaultMatches);
      setOpportunities(oppRes.data.length > 0 ? oppRes.data : defaultOpportunities);
      setSavedOpps(savedRes.data.map(o => o._id));
    } catch (err) {
      console.error("Data fetch failed", err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, user?.domain]);

  const handleBookmark = async (oppId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/opportunities/${oppId}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.isSaved) {
        setSavedOpps([...savedOpps, oppId]);
      } else {
        setSavedOpps(savedOpps.filter(id => id !== oppId));
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <div className="flex-1 glass-card p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Welcome to the Grid, {user?.name.split(' ')[0]} <Zap className="text-primary fill-primary" />
          </h2>
          <p className="text-white/60 mb-6">Your neural footprint is expanding. Currently matching with <span className="text-primary">{matches.length} visionaries</span> in the {user?.domain} sector.</p>
          <div className="flex gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <p className="text-xs font-bold text-primary uppercase mb-1 relative z-10">Collab Score</p>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="text-2xl font-bold text-white">842</span>
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden relative z-10">
                 <motion.div initial={{ width: 0 }} animate={{ width: "84%" }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} className="h-full bg-primary"></motion.div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-secondary/5 group-hover:bg-secondary/10 transition-colors" />
              <p className="text-xs font-bold text-secondary uppercase mb-1 relative z-10">Rank</p>
              <div className="flex items-center gap-2 relative z-10">
                 <span className="text-2xl font-bold text-white">#12</span>
                 <span className="text-[10px] text-secondary bg-secondary/20 px-1.5 py-0.5 rounded font-bold">TOP 5%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-black/40 rounded-lg border border-white/5 flex items-center gap-3">
             <Activity size={16} className="text-primary animate-pulse" />
             <div className="overflow-hidden h-4 w-full relative">
                <motion.div 
                  animate={{ y: [0, -16, -32, -48, 0] }} 
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="flex flex-col text-xs text-white/60 font-mono gap-y-0 leading-4"
                >
                  <span className="h-4 block">[SYS] Link established with 3 new visionaries in your network</span>
                  <span className="h-4 block">[NET] Synergy spikes detected in the Web3 Hub</span>
                  <span className="h-4 block">[AI] Neural processing efficiency at 98.4%</span>
                  <span className="h-4 block">[SEC] Connection secured via Synapse Protocol</span>
                  <span className="h-4 block">[SYS] Link established with 3 new visionaries in your network</span>
                </motion.div>
             </div>
          </div>
        </div>
        
        <div className="md:w-80 glass-card p-8 flex flex-col items-center justify-center text-center">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Domain Affinity</p>
          <div className="relative">
            <SynergyIndicator percentage={92} size={120} />
            <div className="absolute inset-0 flex items-center justify-center pt-2">
               {/* Decorative inner circle */}
            </div>
          </div>
          <p className="mt-4 text-white font-bold">{user?.domain}</p>
          <p className="text-white/40 text-[10px] mt-1 uppercase tracking-widest">Global Alignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Matches Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-primary" size={20} /> Suggested Connections
            </h3>
            <button onClick={() => navigate('/radar')} className="text-xs font-bold text-primary uppercase hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match, idx) => (
              <motion.div 
                key={match.user._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-5 border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    <img src={match.user.avatar} className="w-12 h-12 rounded-lg bg-white/10" alt="avatar" />
                    <div>
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{match.user.name}</h4>
                      <p className="text-xs text-white/40 uppercase font-medium">{match.user.domain}</p>
                    </div>
                  </div>
                  <SynergyIndicator percentage={match.synergy} size={40} />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {match.commonSkills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">
                      {skill}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-white/5 text-white/40 rounded text-[10px]">+{match.user.skills.length - match.commonSkills.length} more</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="text-[10px] text-white/30 italic">Best fit for your next hackathon</div>
                   <button 
                     onClick={async () => {
                       try {
                         await axios.post(`http://localhost:5000/api/connections/request/${match.user._id}`, {}, {
                           headers: { Authorization: `Bearer ${token}` }
                         });
                         alert('Link requested!');
                       } catch (err) {
                         alert(err.response?.data?.msg || 'Error connecting');
                       }
                     }}
                     className="p-1 px-3 bg-white/5 hover:bg-white/10 rounded-full text-[10px] text-white font-bold transition-all"
                   >
                     LINK
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Opportunity Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="text-secondary" size={20} /> Opportunity Feed
            </h3>
          </div>

          <div className="space-y-4">
            {opportunities.length > 0 ? opportunities.map((opp, idx) => (
              <motion.div 
                key={opp._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-5 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl rounded-full" />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded italic">{opp.type}</span>
                  <span className="text-[10px] text-white/30 font-bold uppercase">{opp.domain}</span>
                  {idx % 3 === 0 && <span className="ml-auto text-[10px] font-bold text-red-400 flex items-center gap-1"><Clock size={10} /> Urgency</span>}
                  {idx % 3 === 1 && <span className="ml-auto text-[10px] font-bold text-green-400 flex items-center gap-1"><Activity size={10} /> Hot</span>}
                </div>
                <h4 className="font-bold text-white mb-2 group-hover:text-secondary transition-colors">{opp.title}</h4>
                <p className="text-xs text-white/50 line-clamp-2 mb-4">{opp.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1">
                    <span>Profile Match</span>
                    <span className="text-secondary">{Math.min(98, 80 + idx*7)}%</span>
                  </div>
                  <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(98, 80 + idx*7)}%` }} transition={{ duration: 1 }} className="h-full bg-secondary" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{opp.reward}</span>
                  <button onClick={() => handleBookmark(opp._id)} className="z-10 p-2 hover:bg-white/10 rounded-full transition-colors relative text-white/20 hover:text-secondary group-hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={savedOpps.includes(opp._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={savedOpps.includes(opp._id) ? "text-secondary" : ""}>
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                    </svg>
                  </button>
                </div>

              </motion.div>
            )) : (
              <div className="text-center py-10 glass-card">
                 <p className="text-white/30 text-sm italic">Scanning for opportunities in the {user?.domain} sector...</p>
                 <button className="mt-4 text-xs font-bold text-primary uppercase hover:underline" onClick={() => window.location.reload()}>Re-sync Matrix</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
