import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Target, CheckCircle2, Navigation, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';

const Projects = () => {
  const { user, token } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ title: '', description: '', domain: 'AI' });

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects?domain=${encodeURIComponent(user?.domain || '')}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', 
        { 
          ...newProjectData, 
          requiredRoles: [{role: "Core Developer", skills: ["JavaScript"], filled: false}] 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateModal(false);
      setNewProjectData({ title: '', description: '', domain: 'AI' });
      fetchProjects();
    } catch(e) { 
      alert("Failed to initialize Synapse."); 
    }
  };

  const handleApply = async (projectId, role) => {
    try {
      await axios.post(`http://localhost:5000/api/projects/${projectId}/apply`, 
        { roleAppliedFor: role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh to get updated applications array
      fetchProjects();
    } catch (err) {
      if(err.response?.status === 400) {
        alert(err.response.data.message);
      } else {
        console.error('Failed to apply', err);
      }
    }
  };

  if (loading) return <div className="p-8 text-white">Scanning Synapse Directory...</div>;

  return (
    <div className="space-y-8 pb-10 mt-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-8 border-white/20">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="text-primary" /> Synapse Teams
          </h2>
          <p className="text-white/60">Discover active protocols and form highly aligned task forces.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-background font-bold py-3 px-6 rounded-xl shadow-neon-lime flex items-center gap-2 hover:scale-105 transition-all">
          <Plus size={20} /> INITIATE PROJECT
        </button>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-8 border-white/20 w-full max-w-lg relative"
            >
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tighter">Initiate New Protocol</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">Project Title</label>
                  <input 
                    required
                    value={newProjectData.title}
                    onChange={(e) => setNewProjectData({...newProjectData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 text-sm mt-1 outline-none" 
                    placeholder="e.g. Kisan AI Drone" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">Node Directive (Description)</label>
                  <textarea 
                    required
                    value={newProjectData.description}
                    onChange={(e) => setNewProjectData({...newProjectData, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 text-sm h-24 mt-1 outline-none" 
                    placeholder="Detailed project mission..." 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-widest pl-1">Primary Domain</label>
                  <select 
                    value={newProjectData.domain}
                    onChange={(e) => setNewProjectData({...newProjectData, domain: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 text-sm mt-1 outline-none appearance-none"
                  >
                    {['AI', 'Robotics', 'Web3', 'Quantum Computing', 'IoT', 'Biotech', 'Fintech'].map(d => (
                      <option key={d} value={d} className="bg-background">{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-background font-bold shadow-neon-lime hover:scale-105 transition-all"
                  >
                    DEPLOY
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.length === 0 && <div className="text-white/40 italic p-4">No open projects detected across the network.</div>}
        
        {projects.map((project, idx) => {
          const hasApplied = project.applications.find(app => app.user === user._id || app.user._id === user._id);
          
          return (
          <motion.div 
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 border-white/10 hover:border-primary/30 transition-all flex flex-col h-full relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded italic mb-2 inline-block">
                  {project.domain}
                </span>
                <Link to={`/projects/${project._id}`}>
                  <h3 className="text-xl font-bold text-white mb-1 hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                    {project.title} <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <img src={project.creator?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator'} className="w-4 h-4 rounded" alt="creator"/>
                  <span className="text-[10px] text-white/50 font-bold uppercase">{project.creator?.name} (Commander)</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white shadow-sm">
                {project.status}
              </span>
            </div>
            
            <p className="text-sm text-white/50 mb-6 flex-1 relative z-10">{project.description}</p>
            
            <div className="space-y-3 border-t border-white/5 pt-4 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white/40 uppercase flex items-center gap-2">
                  <Target size={14} /> Required Nodes
                </p>
                {hasApplied && <p className="text-[10px] text-primary italic">✓ Application Extracted</p>}
              </div>

              <div className="space-y-2">
                {project.requiredRoles.map((role, i) => {
                  return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${role.filled ? 'bg-white/5 border-white/5 opacity-50' : 'bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors'}`}>
                    <div>
                      <p className={`text-sm font-bold ${role.filled ? 'text-white/50' : 'text-primary'}`}>{role.role}</p>
                      <p className="text-[10px] text-white/40">{role.skills.join(' • ')}</p>
                    </div>
                    {role.filled ? (
                      <CheckCircle2 size={18} className="text-white/50" />
                    ) : hasApplied ? (
                      <span className="block w-2 bg-white/20 h-2 rounded-full"></span>
                    ) : (
                      <button 
                        onClick={() => handleApply(project._id, role.role)}
                        className="text-[10px] font-bold bg-primary text-background px-3 py-1.5 rounded uppercase hover:bg-white transition-colors flex flex-center gap-1"
                      >
                        <Navigation size={12}/> Deploy
                      </button>
                    )}
                  </div>
                )})}
              </div>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  );
};

export default Projects;
