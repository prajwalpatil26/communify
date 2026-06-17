import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user, token, socket, onlineUsers } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (token) fetchConvos();
    
    // Request fresh online users list when Messages unmounts/mounts
    if (socket) {
      socket.emit('get_online_users');
    }
  }, [token, socket]);

  const loadMessages = async (partner) => {
    setActivePartner(partner);
    setMsgLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${partner._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error loading messages.');
      setActivePartner(null);
    }
    setMsgLoading(false);
  };

  useEffect(() => {
    if (!socket || !activePartner) return;
    
    // Using simple event binder to avoid multiple subscriptions
    socket.on('receive_direct_message', (data) => {
      // If we are actively chatting with the sender
      if (data.sender === activePartner._id || data.sender === activePartner.id) {
        setMessages(prev => [...prev, data]);
        setIsTyping(false);
      }
    });

    socket.on('receive_dm_typing', (data) => {
      if (data.sender === activePartner._id || data.sender === activePartner.id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive_direct_message');
      socket.off('receive_dm_typing');
    };
  }, [socket, activePartner]);

  // Derive online status
  const isPartnerOnline = activePartner && onlineUsers.includes(activePartner._id);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activePartner) return;
    const body = text;
    setText('');
    
    // Emit via POST for persistence
    try {
      const res = await axios.post(`http://localhost:5000/api/messages/${activePartner._id}`, { text: body }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, res.data]);

      // Emit via Websocket for instant real-time delivery
      socket.emit('direct_message', {
        sender: user.id || user._id,
        recipient: activePartner._id,
        text: body,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white p-8">Loading Neural Sync...</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] mt-4 max-w-7xl mx-auto px-4 md:px-0 gap-4 pb-4">
      
      {/* Left Pane: Conversations & Channels */}
      <div className={`glass-card border-white/20 flex flex-col w-full md:w-1/3 ${activePartner ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter"><MessageSquare className="text-primary" /> Network Comms</h2>
          <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mt-1">Direct Links & Global Channels</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {/* Channels Section */}
          <p className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Global Channels</p>
          <div 
            onClick={() => navigate(`/hub/Engineering & Technology`)}
            className="flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-colors mb-1 hover:bg-white/5 border border-transparent"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary/20 border border-secondary/40 text-secondary flex items-center justify-center font-black">#</div>
            <div>
              <p className="text-sm font-bold text-white uppercase">Engineering Hub</p>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Global Live Chat</p>
            </div>
          </div>
          <div 
            onClick={() => navigate(`/hub/Arts & Creative Fields`)}
            className="flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-colors mb-4 hover:bg-white/5 border border-transparent"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 text-primary flex items-center justify-center font-black">#</div>
            <div>
              <p className="text-sm font-bold text-white uppercase">Creative Hub</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Global Live Chat</p>
            </div>
          </div>

          <p className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest border-t border-white/10 pt-4 mt-2">Direct Links</p>
          {conversations.length === 0 ? (
            <p className="p-4 text-xs text-white/40 text-center italic">No Synaptic Links available. Connect with others first.</p>
          ) : (
            conversations.map(c => (
              <div 
                key={c._id} 
                onClick={() => loadMessages(c)}
                className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-colors mb-2 border ${activePartner?._id === c._id ? 'bg-primary/10 border-primary/30' : 'hover:bg-white/5 border-transparent'}`}
              >
                <img src={c.avatar} className="w-10 h-10 rounded-lg bg-white/10" alt="avatar" />
                <div>
                  <p className="text-sm font-bold text-white uppercase">{c.name}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{c.domain}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Messages Timeline */}
      <div className={`glass-card border-white/20 flex flex-col w-full md:w-2/3 ${!activePartner ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activePartner ? (
          <div className="flex flex-col items-center opacity-30">
            <MessageSquare size={64} className="mb-4" />
            <p className="text-sm uppercase font-bold tracking-widest">Select a channel.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-white/10 shrink-0 flex items-center gap-4">
              <button className="md:hidden p-2 text-white/50 hover:text-white" onClick={() => setActivePartner(null)}>
                 <ArrowLeft size={20} />
              </button>
              <img src={activePartner.avatar} className="w-10 h-10 rounded-lg cursor-pointer" alt="av" onClick={() => navigate(`/profile/${activePartner._id}`)} />
              <div>
                <p className="text-lg font-bold text-white uppercase cursor-pointer hover:underline" onClick={() => navigate(`/profile/${activePartner._id}`)}>{activePartner.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? 'bg-primary animate-pulse' : 'bg-white/20'}`}></span>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">{isPartnerOnline ? 'Synchronized (Online)' : 'Offline'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {msgLoading ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
               ) : messages.length === 0 ? (
                 <p className="text-center text-xs text-white/30 pt-10 italic uppercase tracking-widest">Connection established. Transmit initial node data.</p>
               ) : (
                 messages.map((m, idx) => {
                   const amSender = m.sender === (user.id || user._id);
                   return (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                       key={m._id || idx} className={`flex ${amSender ? 'justify-end' : 'justify-start'}`}
                     >
                       <div className={`max-w-[75%] p-3 rounded-2xl border text-sm ${
                         amSender ? 'bg-primary/10 border-primary/30 text-white rounded-br-sm' : 'bg-white/5 border-white/10 text-white/90 rounded-bl-sm'
                       }`}>
                         {m.text}
                         <p className={`text-[8px] mt-1 font-bold uppercase tracking-widest ${amSender ? 'text-primary/70 text-right' : 'text-white/40 text-left'}`}>
                           {new Date(m.createdAt).toLocaleTimeString()}
                         </p>
                       </div>
                     </motion.div>
                   );
                 })
               )}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span>
                    </div>
                  </motion.div>
                )}
               <div ref={scrollRef}></div>
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/10 shrink-0 flex gap-4 items-center bg-black/20 rounded-b-2xl">
              <input 
                type="text" 
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  socket.emit('dm_typing', { sender: user.id || user._id, recipient: activePartner._id, isTyping: e.target.value.length > 0 });
                }}
                onBlur={() => socket.emit('dm_typing', { sender: user.id || user._id, recipient: activePartner._id, isTyping: false })}
                placeholder="Initiate data transmission..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 placeholder:uppercase placeholder:tracking-widest placeholder:text-xs placeholder:text-white/30"
              />
              <button disabled={!text.trim()} type="submit" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 transition-all disabled:opacity-50 shadow-neon-lime">
                 <Send size={16} className="-ml-0.5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
