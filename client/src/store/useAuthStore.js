import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  socket: null,
  onlineUsers: [],

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ loading: false });
      console.error('Login error', err);
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ loading: false });
      console.error('Registration error', err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/profiles/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: res.data, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  connectSocket: () => {
    const { user, socket } = get();
    if (!user || socket) return;

    const newSocket = io('http://localhost:5000');
    newSocket.emit('register_node', user.id || user._id);
    
    newSocket.on('online_users_update', (users) => {
      set({ onlineUsers: users });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  }
}));

export default useAuthStore;
