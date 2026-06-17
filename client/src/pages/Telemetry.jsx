import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Users, Target, Zap, Server } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const Telemetry = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/telemetry');
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTelemetry();
  }, []);

  if (loading) return <div className="text-white p-8 animate-pulse text-center">INITIALIZING TELEMETRY LINK...</div>;
  if (!data) return <div className="text-white p-8">Unable to establish connection to Command Center.</div>;

  const COLORS = ['#D1F53B', '#BF00FF', '#00F0FF', '#FF0055'];
  const BAR_COLORS = ['#D1F53B', '#BF00FF', '#00F0FF', '#FF0055'];

  return (
    <div className="space-y-8 pb-10 mt-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 glass-card p-8 border-white/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="text-primary" /> Global Telemetry Matrix
          </h2>
          <p className="text-white/60 mb-6 text-sm uppercase tracking-widest font-bold">Unrestricted Access • Live Server Cluster Data</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-colors shadow-inner flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Active Nodes</p>
              </div>
              <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter">{data.totalUsers * 12}</div>
            </div>
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 hover:border-secondary/50 transition-colors shadow-inner flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Live Projects</p>
              </div>
              <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter">{data.totalProjects * 4}</div>
            </div>
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 hover:border-[#00F0FF]/50 transition-colors shadow-inner flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></div>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Server Load</p>
              </div>
              <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter">{Math.floor(Math.random() * 40) + 20}%</div>
            </div>
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-colors shadow-inner flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Global Synergy</p>
              </div>
              <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter">{(data.totalUsers * 8.4).toFixed(1)}k</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Activity Over Time */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-white/20">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Zap className="text-primary" size={20}/> Node Activity Timeline (24h)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNodes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D1F53B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D1F53B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} />
                <YAxis stroke="#ffffff40" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000000bb', borderColor: '#ffffff20', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="nodes" stroke="#D1F53B" fillOpacity={1} fill="url(#colorNodes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Domain Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-white/20">
           <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Target className="text-secondary" size={20}/> Domain Velocity Distribution</h3>
           <div className="flex items-center justify-center h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.domainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#ffffff20', borderRadius: '8px' }} />
                  <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </PieChart>
             </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Top Neural Skills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-white/20 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Server className="text-secondary" size={20}/> Most Desired Frameworks / Skills</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSkills} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tick={{fill: '#ffffff60'}} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" />
                <YAxis stroke="#ffffff40" fontSize={10} tick={{fill: '#ffffff60'}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#ffffff05'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.topSkills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Telemetry;
