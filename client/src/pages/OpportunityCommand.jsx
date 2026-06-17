import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Check, X, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const OpportunityCommand = () => {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const fetchPostings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/opportunities/my-postings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPostings(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchPostings();
  }, [token]);

  const updateStatus = async (oppId, appId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/opportunities/${oppId}/applications/${appId}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchPostings();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white p-8">Loading Command Matrix...</div>;

  return (
    <div className="space-y-8 pb-10 mt-8 max-w-7xl mx-auto">
      <div className="glass-card p-8 border-white/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[120px] rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center border border-secondary/50">
             <Terminal className="text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Deployment Command</h1>
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Manage Applications & Personnel</p>
          </div>
        </div>
        <button onClick={() => navigate('/nexus')} className="relative z-10 px-6 py-2 rounded-lg border border-white/20 text-white/60 hover:text-white uppercase font-bold text-[10px] tracking-widest hover:bg-white/5 transition-all">
          Return to Nexus
        </button>
      </div>

      <div className="space-y-8">
        {postings.map(post => (
          <div key={post._id} className="glass-card p-6 border-white/10">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
               <div>
                 <h2 className="text-xl font-bold text-white mb-1">{post.title}</h2>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{post.type} • {post.domain}</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-secondary">{post.applications?.length || 0}</p>
                  <p className="text-[10px] text-white/50 uppercase font-bold mt-1">Total Deployments</p>
               </div>
            </div>

            <div className="space-y-4">
              {post.applications?.length === 0 ? (
                <p className="text-[10px] text-white/40 italic">Awaiting neural node deployments...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.applications.map(app => (
                    <div key={app._id} className={`p-4 rounded-xl border flex items-start justify-between ${
                      app.status === 'Accepted' ? 'bg-secondary/10 border-secondary/30' : 
                      app.status === 'Rejected' ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'
                    }`}>
                       <div className="flex gap-3">
                         <img src={app.user.avatar} className="w-10 h-10 rounded-lg bg-white/10 cursor-pointer" alt="avatar" onClick={() => navigate(`/profile/${app.user._id}`)} />
                         <div>
                           <p className="text-sm font-bold text-white cursor-pointer hover:underline" onClick={() => navigate(`/profile/${app.user._id}`)}>{app.user.name}</p>
                           <p className="text-[10px] text-white/50 uppercase">{app.user.domain}</p>
                           <p className="text-[10px] mt-2 text-white/70">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       
                       <div className="flex flex-col gap-2 items-end">
                         <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded ${
                            app.status === 'Accepted' ? 'bg-secondary/20 text-secondary' : 
                            app.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'
                         }`}>{app.status}</span>
                         
                         {app.status === 'Pending' && (
                           <div className="flex gap-2 mt-2">
                             <button onClick={() => updateStatus(post._id, app._id, 'Accepted')} className="p-1.5 bg-secondary/20 hover:bg-secondary text-secondary hover:text-background rounded transition-colors"><Check size={14}/></button>
                             <button onClick={() => updateStatus(post._id, app._id, 'Rejected')} className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-background rounded transition-colors"><X size={14}/></button>
                           </div>
                         )}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {postings.length === 0 && (
          <div className="text-center py-20 text-white/40 italic">You have not deployed any opportunities yet.</div>
        )}
      </div>
    </div>
  );
};

export default OpportunityCommand;
