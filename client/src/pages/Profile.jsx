import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User as UserIcon, Link as LinkIcon, Briefcase, Globe, GitBranch, Loader2, UserPlus, CheckCircle2, Zap } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, token, loadUser } = useAuthStore();
  const isOwnProfile = !id || (currentUser && (id === currentUser.id || id === currentUser._id));
  
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchProfile = async () => {
    try {
      const endpoint = isOwnProfile ? 'http://localhost:5000/api/profiles/me' : `http://localhost:5000/api/profiles/${id}`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      const u = res.data;
      setFormData({
        bio: u.bio || '',
        experienceLevel: u.experienceLevel || 'Beginner',
        isPublic: u.isPublic ?? true,
        links: {
          github: u.links?.github || '',
          linkedin: u.links?.linkedin || '',
          portfolio: u.links?.portfolio || ''
        },
        workHistory: u.workHistory || [],
        education: u.education || [],
        careerGoals: u.careerGoals?.join(', ') || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [id, token, isOwnProfile]);

  const handleChange = (e, section, idx, field) => {
    if (section === 'links') {
      setFormData({ ...formData, links: { ...formData.links, [field]: e.target.value } });
    } else if (section === 'workHistory' || section === 'education') {
      const newArray = [...formData[section]];
      newArray[idx][field] = e.target.value;
      setFormData({ ...formData, [section]: newArray });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addArrayItem = (section) => {
    const newItem = section === 'workHistory' 
      ? { company: '', role: '', description: '', startYear: '', endYear: '' }
      : { institution: '', degree: '', field: '', startYear: '', endYear: '' };
    setFormData({ ...formData, [section]: [...formData[section], newItem] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const goalsArray = formData.careerGoals.split(',').map(g => g.trim()).filter(g => g);
      const payload = { ...formData, careerGoals: goalsArray };
      await axios.put('http://localhost:5000/api/profiles/me', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadUser(); // Refresh store
    } catch (err) {
      console.error('Failed to save profile', err);
    }
    setSaving(false);
  };

  const handleGithubSync = async (e) => {
    e.preventDefault();
    if(!githubUsername) return;
    setIsSyncing(true);
    try {
      await axios.post('http://localhost:5000/api/profiles/github-sync', 
        { githubUsername }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadUser();
      setShowSyncModal(false);
      setGithubUsername('');
    } catch(e) { 
      console.error(e); 
      alert("Failed to sync GitHub repos.");
    }
    setIsSyncing(false);
  };
  
  const handleConnect = async () => {
    try {
      await axios.post(`http://localhost:5000/api/connections/request/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Synaptic Link Requested!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error establishing sync');
    }
  };

  const handleEndorse = async (skill) => {
    try {
      await axios.post(`http://localhost:5000/api/connections/endorse/${id}`, { skill }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error endorsing parameter');
    }
  };

  if (!formData) return <div className="text-white p-8">Loading Identity Matrix...</div>;

  return (
    <div className="space-y-8 pb-10 mt-8 max-w-4xl mx-auto">
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-8 border-white/20 w-full max-w-sm relative"
            >
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">Sync Repository</h3>
              <p className="text-xs text-white/40 mb-6 uppercase tracking-widest font-bold">Initiate Node Extraction from GitHub</p>
              
              <form onSubmit={handleGithubSync} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">GitHub Developer Handle</label>
                  <div className="relative mt-1">
                    <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input 
                      required
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent text-sm outline-none" 
                      placeholder="e.g. prajwalpatil" 
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowSyncModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all text-xs uppercase"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit"
                    disabled={isSyncing}
                    className="flex-1 px-6 py-3 rounded-xl bg-accent text-background font-bold shadow-neon-purple hover:scale-105 transition-all text-xs uppercase flex items-center justify-center gap-2"
                  >
                    {isSyncing ? <Loader2 size={16} className="animate-spin" /> : 'EXTRACT'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 glass-card p-8 border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full" />
        <div className="flex items-center gap-6 relative z-10">
          <img src={user.avatar} className="w-24 h-24 rounded-2xl bg-white/10 p-2 border border-white/20" alt="avatar" />
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tighter">{user.name}</h2>
            <p className="text-primary font-bold tracking-widest uppercase text-sm mt-1">{user.domain} • {formData.experienceLevel}</p>
          </div>
        </div>
        {isOwnProfile && (
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-background font-bold py-3 px-6 rounded-xl shadow-neon-lime flex items-center gap-2 hover:scale-105 transition-all z-10"
          >
            {saving ? 'SYNCING...' : <><Save size={20} /> SYNCHRONIZE IDENTITY</>}
          </button>
        )}
        
        {/* Dynamic Connection Button rendering */}
        {!isOwnProfile && (
          <div className="z-10 flex flex-col gap-2">
            {(() => {
              const currentUserIdStr = currentUser?.id || currentUser?._id;
              
              const isConnected = user.connections?.some(c => (c._id || c) === currentUserIdStr);
              const hasSentRequest = user.connectionRequests?.some(r => (r._id || r) === currentUserIdStr);
              const hasReceivedRequest = currentUser?.connectionRequests?.includes(user._id);

              if (isConnected) {
                return (
                  <button disabled className="bg-primary/20 text-primary border border-primary/50 font-bold py-3 px-6 rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={20} /> SYNCHRONIZED
                  </button>
                );
              }

              if (hasReceivedRequest) {
                return (
                  <button 
                    onClick={async () => {
                      try {
                        await axios.post(`http://localhost:5000/api/connections/accept/${user._id}`, {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchProfile();
                        loadUser(); // Refresh currentUser object
                      } catch (err) {
                        alert("Error accepting connection");
                      }
                    }}
                    className="bg-primary text-background font-bold py-3 px-6 rounded-xl shadow-neon-lime flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    ACCEPT LINK REQUEST
                  </button>
                );
              }

              if (hasSentRequest) {
                return (
                  <button disabled className="bg-white/10 text-white/50 border border-white/20 font-bold py-3 px-6 rounded-xl flex items-center gap-2">
                    PENDING LINK
                  </button>
                );
              }

              return (
                <button 
                  onClick={async () => {
                     try {
                        await axios.post(`http://localhost:5000/api/connections/request/${id}`, {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchProfile(); // refresh connection state
                      } catch (err) {
                        alert(err.response?.data?.msg || 'Error establishing sync');
                      }
                  }}
                  className="bg-secondary text-background font-bold py-3 px-6 rounded-xl shadow-neon-blue flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <UserPlus size={20} /> ESTABLISH SYNC
                </button>
              );
            })()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Core Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><UserIcon className="text-primary" size={20}/> Core Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">Bio / Mission Statement</label>
                <textarea name="bio" value={formData.bio} disabled={!isOwnProfile} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 text-sm h-24 mt-1 outline-none" placeholder="What are you building?" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">Experience Level</label>
                  <select name="experienceLevel" disabled={!isOwnProfile} value={formData.experienceLevel} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 text-sm mt-1 outline-none appearance-none">
                    <option className="bg-background">Beginner</option>
                    <option className="bg-background">Intermediate</option>
                    <option className="bg-background">Expert</option>
                    <option className="bg-background">Visionary</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">Career Goals (CSV)</label>
                  <input type="text" name="careerGoals" disabled={!isOwnProfile} value={formData.careerGoals} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 text-sm mt-1 outline-none" placeholder="Founder, AI Researcher..." />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Work History */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase className="text-secondary" size={20}/> Operational History</h3>
              {isOwnProfile && <button onClick={() => addArrayItem('workHistory')} className="text-xs text-secondary font-bold hover:underline">ADD NODE</button>}
            </div>
            {formData.workHistory.map((work, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4 space-y-3">
                <div className="flex gap-3">
                  <input placeholder="Company / Project" disabled={!isOwnProfile} value={work.company} onChange={(e) => handleChange(e, 'workHistory', idx, 'company')} className="bg-transparent border-b border-white/20 text-white flex-1 focus:border-secondary outline-none text-sm disabled:opacity-80"/>
                  <input placeholder="Role" value={work.role} disabled={!isOwnProfile} onChange={(e) => handleChange(e, 'workHistory', idx, 'role')} className="bg-transparent border-b border-white/20 text-white flex-1 focus:border-secondary outline-none text-sm disabled:opacity-80"/>
                </div>
                <input placeholder="Description" disabled={!isOwnProfile} value={work.description} onChange={(e) => handleChange(e, 'workHistory', idx, 'description')} className="bg-transparent border-b border-white/20 text-white w-full focus:border-secondary outline-none text-sm disabled:opacity-80"/>
              </div>
            ))}
            
            {/* Gamified Neural Skills Matrix */}
            {user?.skills && user.skills.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Zap className="text-primary" size={16}/> Neural Parameters</h3>
                <div className="space-y-4">
                  {user.skills.map(skill => {
                    const endorsementCount = user.endorsements?.filter(e => e.skill === skill).length || 0;
                    // Hackathon gamification: base power randomly assigned based on string length, plus endorsements.
                    const basePower = (skill.length * 5) % 40 + 40; 
                    const calculatedPower = Math.min(100, basePower + endorsementCount * 15);
                    
                    return (
                      <div key={skill} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                           <span className="font-bold text-white/80 uppercase tracking-wider">{skill}</span>
                           <div className="flex gap-2 items-center">
                             <span className="text-primary font-bold">{calculatedPower}%</span>
                             {!isOwnProfile && (
                               <button 
                                 onClick={() => handleEndorse(skill)}
                                 className="opacity-50 hover:opacity-100 flex items-center gap-1 bg-white/10 px-2 rounded-full transition-all"
                               >
                                 <CheckCircle2 size={10} /> +1
                               </button>
                             )}
                           </div>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${calculatedPower}%` }} 
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/50 to-primary shadow-neon-lime"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* External Links */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><LinkIcon className="text-accent" size={20}/> External Nodes</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[10px] uppercase font-bold text-white/50 pl-1">GitHub</label>
                  {isOwnProfile && <button onClick={() => setShowSyncModal(true)} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors font-bold uppercase tracking-widest">
                    SYNC REPOS
                  </button>}
                </div>

                <input value={formData.links.github} disabled={!isOwnProfile} onChange={(e) => handleChange(e, 'links', null, 'github')} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-accent text-sm outline-none disabled:opacity-80 disabled:cursor-not-allowed" placeholder="github.com/..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/50 pl-1">LinkedIn</label>
                <input value={formData.links.linkedin} disabled={!isOwnProfile} onChange={(e) => handleChange(e, 'links', null, 'linkedin')} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-accent text-sm outline-none disabled:opacity-80 disabled:cursor-not-allowed" placeholder="linkedin.com/..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-white/50 pl-1">Portfolio</label>
                <input value={formData.links.portfolio} disabled={!isOwnProfile} onChange={(e) => handleChange(e, 'links', null, 'portfolio')} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-accent text-sm outline-none disabled:opacity-80 disabled:cursor-not-allowed" placeholder="https://" />
              </div>
            </div>
          </motion.div>

          {/* Discovery Settings */}
          {isOwnProfile && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-primary/20 bg-primary/5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Globe className="text-primary" size={20}/> Discovery Protocol</h3>
              <p className="text-xs text-white/60 mb-4">Toggle visibility of your identity matrix across the global Communify network.</p>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={formData.isPublic} onChange={(e) => setFormData({...formData, isPublic: e.target.checked})} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isPublic ? 'bg-primary' : 'bg-white/20'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-background w-6 h-6 rounded-full transition-transform ${formData.isPublic ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-bold text-white uppercase">
                  {formData.isPublic ? 'Public / Transmitting' : 'Isolated / Stealth'}
                </div>
              </label>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
