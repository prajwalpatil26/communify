import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Network, User, Mail, Lock, Zap } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    domain: 'Engineering & Technology',
    skills: '',
    bio: '',
    experienceLevel: 'Beginner',
    interests: '',
    careerGoals: ''
  });
  
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    const interestsArray = formData.interests.split(',').map(s => s.trim()).filter(Boolean);
    const goalsArray = formData.careerGoals.split(',').map(s => s.trim()).filter(Boolean);
    const success = await register({ 
      ...formData, 
      skills: skillsArray,
      interests: interestsArray,
      careerGoals: goalsArray
    });
    if (success) navigate('/');
  };

  const domains = [
    'Engineering & Technology',
    'Arts & Creative Fields',
    'Sports & Fitness',
    'Business & Management',
    'Science & Research',
    'Healthcare & Medicine',
    'Law & Public Policy',
    'Education & Teaching',
    'Media, Entertainment & Digital',
    'Travel, Hospitality & Aviation',
    'Agriculture & Environment',
    'Skilled Trades & Vocational Careers',
    'Interdisciplinary / Emerging Fields'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl glass-card p-10 relative z-10 border-white/20 max-h-[95vh] overflow-y-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-neon-purple text-white">
            <Zap size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Identity</h1>
            <p className="text-white/40 text-sm">Join the next-gen collaboration ecosystem</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-secondary/50 outline-none transition-all"
                  placeholder="Vikram Singh"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Neuro-Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-secondary/50 outline-none transition-all"
                  placeholder="vikram@iitb.ac.in"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Neural Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-secondary/50 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Short Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-secondary/50 outline-none transition-all h-[108px] resize-none"
                placeholder="Briefly describe who you are and what you're building..."
                required
              />
            </div>
          </div>

          <div className="space-y-4 text-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Core Domain</label>
                <select 
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-secondary/50 outline-none transition-all appearance-none"
                >
                  {domains.map(d => <option key={d} value={d} className="bg-background">{d}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Experience</label>
                <select 
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-secondary/50 outline-none transition-all appearance-none"
                >
                  {['Beginner', 'Intermediate', 'Expert', 'Visionary'].map(l => <option key={l} value={l} className="bg-background">{l}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Specific Skills (comma separated)</label>
              <input 
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-secondary/50 outline-none transition-all"
                placeholder="React, Law, SEO, Final Cut Pro..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Hobbies & Interests (comma separated)</label>
              <input 
                value={formData.interests}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-secondary/50 outline-none transition-all"
                placeholder="Chess, Sci-Fi, Quantum Physics, Startups..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest ml-1">Opportunities Looking For</label>
              <input 
                value={formData.careerGoals}
                onChange={(e) => setFormData({...formData, careerGoals: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-secondary/50 outline-none transition-all"
                placeholder="Hackathons, Co-Founders, Full-time Roles..."
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-neon-purple hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? 'INITIALIZING...' : 'ACTIVATE IDENTITY'}
              <Zap size={20} className="group-hover:rotate-12 transition-transform" />
            </button>

            <p className="text-center text-white/40 text-sm mt-6">
              Already indexed? <Link to="/login" className="text-white hover:text-secondary transition-colors underline-offset-4 underline">Resume Session</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
