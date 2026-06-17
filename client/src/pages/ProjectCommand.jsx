import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Database, Plus, CheckCircle2, Clock, CircleEqual } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const ProjectCommand = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { token, user } = useAuthStore();

  const fetchProject = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchProject();
  }, [id, token]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      await axios.post(`http://localhost:5000/api/projects/${id}/tasks`, 
        { title: newTaskTitle, description: '', assignedTo: user.id || user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTaskTitle('');
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/${id}/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <div className="p-8 text-white text-center">Initializing Command Center...</div>;

  const getTasks = (status) => project.kanbanTasks?.filter(t => t.status === status) || [];

  return (
    <div className="space-y-8 pb-10 mt-8 max-w-7xl mx-auto">
      {/* Cinematic Header */}
      <div className="glass-card p-10 border-white/20 relative overflow-hidden flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full" />
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 inline-block">
            Project Directive // {project.domain}
          </span>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4">{project.title}</h1>
          <p className="text-white/60 leading-relaxed">{project.description}</p>
        </div>
        <div className="relative z-10 glass-card p-4 border-white/10 text-center min-w-[150px]">
          <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Status Protocol</p>
          <span className="text-xl font-black text-white">{project.status}</span>
        </div>
      </div>

      {/* Team Matrix */}
      <div className="glass-card p-6 border-white/10">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Assigned Neural Nodes</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {project.members.map((member, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group">
              <img src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=x'} className="w-12 h-12 rounded-xl bg-white/5 border border-white/20 group-hover:border-primary transition-colors" alt="member" />
              <p className="text-[10px] font-bold text-white group-hover:text-primary transition-colors">{member.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic Kanban Board */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Database className="text-primary"/> Sync Matrix (Kanban)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TO DO */}
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4 h-[500px] overflow-y-auto">
             <div className="flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-xl p-2 rounded-lg z-10 border border-white/5">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><CircleEqual size={14} className="text-white/40"/> To Do</h3>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">{getTasks('To Do').length}</span>
             </div>
             
             {getTasks('To Do').map(task => (
               <motion.div layout key={task._id} className="glass-card p-4 border-white/10 cursor-pointer hover:border-primary/50 transition-colors">
                 <p className="text-sm text-white font-medium mb-3">{task.title}</p>
                 <button onClick={() => updateTaskStatus(task._id, 'In Progress')} className="text-[10px] bg-primary/20 text-primary w-full py-1.5 rounded uppercase font-bold hover:bg-primary hover:text-black transition-all">Start Task</button>
               </motion.div>
             ))}

             {/* Add Task Input */}
             <form onSubmit={addTask} className="relative mt-2">
               <input 
                 value={newTaskTitle}
                 onChange={(e) => setNewTaskTitle(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50 pr-10" 
                 placeholder="Define new parameter..." 
               />
               <button type="submit" className="absolute right-2 top-2 p-1 bg-white/10 hover:bg-primary hover:text-black text-white rounded transition-colors"><Plus size={16} /></button>
             </form>
          </div>

          {/* IN PROGRESS */}
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4 h-[500px] overflow-y-auto">
             <div className="flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-xl p-2 rounded-lg z-10 border border-white/5 mx-[-8px]">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> Compiling</h3>
                <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded">{getTasks('In Progress').length}</span>
             </div>
             
             {getTasks('In Progress').map(task => (
               <motion.div layout key={task._id} className="glass-card p-4 border-secondary/30 bg-secondary/5">
                 <p className="text-sm text-white font-medium mb-3">{task.title}</p>
                 <button onClick={() => updateTaskStatus(task._id, 'Done')} className="text-[10px] bg-secondary/80 text-background w-full py-1.5 rounded uppercase font-bold hover:bg-secondary transition-all">Mark Complete</button>
               </motion.div>
             ))}
          </div>

          {/* DONE */}
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4 h-[500px] overflow-y-auto">
             <div className="flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-xl p-2 rounded-lg z-10 border border-white/5 mx-[-8px]">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14}/> Deployed</h3>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">{getTasks('Done').length}</span>
             </div>
             
             {getTasks('Done').map(task => (
               <motion.div layout key={task._id} className="glass-card p-4 border-white/5 transition-opacity relative group overflow-hidden">
                 <p className="text-sm text-white line-through decoration-white/20 mb-3">{task.title}</p>
                 
                 {task.blockHash && (
                   <div className="mt-2 pt-3 border-t border-white/10">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[8px] uppercase tracking-widest font-bold text-primary flex items-center gap-1">
                         PROOF OF WORK
                       </span>
                     </div>
                     <div className="bg-black/50 p-2 rounded font-mono text-[9px] text-white/60 break-all select-all border border-white/5 relative group-hover:border-primary/30 transition-colors">
                       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       {task.blockHash}
                     </div>
                   </div>
                 )}
               </motion.div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCommand;
