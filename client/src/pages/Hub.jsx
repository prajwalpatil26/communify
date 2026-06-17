import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Users, Shield, TrendingUp, Radio, Heart, MessageCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { io } from 'socket.io-client';

const Hub = () => {
  const { domain } = useParams();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [liveNodes, setLiveNodes] = useState(0);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { token, user } = useAuthStore();
  const socketRef = useRef();

  useEffect(() => {
    // Establish Socket Connection
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join_hub', domain);

    socketRef.current.on('receive_post', (postObject) => {
      setPosts((prevPosts) => {
        if (prevPosts.some(p => p._id === postObject._id)) return prevPosts;
        return [postObject, ...prevPosts];
      });
    });

    socketRef.current.on('user_typing', ({ isTyping }) => {
      setLiveNodes(prev => isTyping ? prev + 1 : Math.max(0, prev - 1));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [domain]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/hubs/${domain}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(res.data.posts || []);
        setLoading(false);
      } catch (err) {
        console.error("Hub fetch failed", err);
        setLoading(false);
      }
    };
    if (token) fetchPosts();
  }, [domain, token]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      // Optistic UI Update
      const tempPost = { _id: Date.now().toString(), content: newPost, author: { _id: user.id || user._id, name: user.name, avatar: user.avatar }, createdAt: new Date().toISOString() };
      setPosts([tempPost, ...posts]);
      setNewPost('');

      const res = await axios.post(`http://localhost:5000/api/hubs/${domain}/posts`, 
        { content: tempPost.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Emit the formally saved post to all other clients in the room
      socketRef.current.emit('send_post', { ...res.data, domain });
      
      // Silently swap the temp object with the real DB object
      setPosts(prev => prev.map(p => p._id === tempPost._id ? res.data : p));

    } catch (err) {
      console.error("Post failed", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/hubs/${domain}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/hubs/${domain}/posts/${postId}/comment`, 
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
      setCommentText('');
      setActiveCommentPostId(null);
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] mt-4">
      <div className="glass-card p-6 border-white/20 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center text-primary shadow-neon-lime">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">{domain} Neural Hub</h2>
            <p className="text-white/40 text-xs font-bold flex items-center gap-2 italic uppercase">
              <Users size={12} /> 1.2k Active Visionaries • <Shield size={12} /> Verified Protocols Only
            </p>
          </div>
        </div>
        <div className="hidden lg:flex gap-4">
          <div className="bg-white/5 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-white/40 font-bold uppercase">Activity Level</p>
            <p className="text-sm font-bold text-primary flex items-center gap-1 justify-center"><TrendingUp size={14} /> High</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col glass-card border-white/10 overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <AnimatePresence>
            {posts.map((post, idx) => (
              <motion.div 
                key={post._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${post.author?._id === user?.id ? 'flex-row-reverse' : ''}`}
              >
                <img 
                  src={post.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anon'} 
                  className="w-10 h-10 rounded-lg bg-white/10 shrink-0" 
                  alt="avatar" 
                />
                <div className={`max-w-[70%] ${post.author?._id === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-white/60 uppercase">{post.author?.name}</span>
                    <span className="text-[10px] text-white/20">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`p-4 rounded-2xl text-sm ${
                    post.author?._id === user?.id 
                    ? 'bg-primary text-background font-medium rounded-tr-none shadow-neon-lime' 
                    : 'bg-white/5 text-white border border-white/10 rounded-tl-none'
                  }`}>
                    {post.content}
                    
                    {/* Social Actions */}
                    <div className="mt-3 pt-3 border-t border-current/10 flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                      <button 
                        onClick={() => handleLike(post._id)} 
                        className={`flex items-center gap-1 hover:opacity-70 transition-opacity ${post.likes?.includes(user?.id) ? 'text-red-500' : 'opacity-70'}`}
                      >
                        <Heart size={14} className={post.likes?.includes(user?.id) ? 'fill-current' : ''} /> {post.likes?.length || 0}
                      </button>
                      <button 
                        onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
                        className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <MessageCircle size={14} /> {post.comments?.length || 0}
                      </button>
                    </div>

                    {/* Comments Section */}
                    {activeCommentPostId === post._id && (
                      <div className="mt-4 space-y-3">
                        {post.comments?.map((c, i) => (
                           <div key={i} className="bg-black/20 p-2 rounded-lg flex items-start gap-2">
                             <img src={c.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anon'} className="w-5 h-5 rounded" alt="" />
                             <div>
                               <p className="text-[10px] font-bold opacity-70 uppercase">{c.author?.name}</p>
                               <p className="text-xs">{c.content}</p>
                             </div>
                           </div>
                        ))}
                        <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-2">
                          <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 bg-black/20 border border-current/20 rounded px-2 py-1 text-xs placeholder:text-current/40 outline-none" 
                            placeholder="Add a comment..."
                          />
                          <button type="submit" className="bg-current/20 px-2 py-1 rounded text-xs hover:bg-current/40">Send</button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && <div className="text-center text-white/20 italic">Synchronizing with node...</div>}
          {!loading && posts.length === 0 && <div className="text-center text-white/20 italic mt-10">Neural Hub frequency silent. Be the first to pulse.</div>}
        </div>

        {/* Input Area */}
        <div className="px-6 pb-2">
          <AnimatePresence>
            {liveNodes > 0 && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-primary italic flex items-center gap-2 mb-1">
                <span className="flex gap-1"><span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span><span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span><span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span></span>
                Another node is transmitting...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-4">
          <input 
            type="text" 
            value={newPost}
            onChange={(e) => {
              setNewPost(e.target.value);
              socketRef.current?.emit('typing', { domain, isTyping: e.target.value.length > 0 });
            }}
            onBlur={() => socketRef.current?.emit('typing', { domain, isTyping: false })}
            placeholder={`Transmit to ${domain} hub...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-sm text-white focus:border-primary/50 outline-none transition-all"
          />
          <button 
            type="submit"
            className="p-3 bg-primary text-background rounded-xl shadow-neon-lime hover:scale-105 transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Hub;
