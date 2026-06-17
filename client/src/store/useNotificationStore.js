import { create } from 'zustand';
import axios from 'axios';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      set({ 
        notifications: data, 
        unreadCount: data.filter(n => !n.read).length 
      });
    } catch (err) {
      console.error(err);
    }
  },

  addLiveNotification: (notification) => {
    set(state => {
      const exists = state.notifications.find(n => n._id === notification._id);
      if (exists) return state;
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });
  },

  markAsRead: async (token) => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error(err);
    }
  }
}));

export default useNotificationStore;
