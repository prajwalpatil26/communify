import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import useNotificationStore from './store/useNotificationStore';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Hub from './pages/Hub';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Radar from './pages/Radar';
import Nexus from './pages/Nexus';
import ProjectCommand from './pages/ProjectCommand';
import OpportunityCommand from './pages/OpportunityCommand';
import Messages from './pages/Messages';
import Telemetry from './pages/Telemetry';
import Bounties from './pages/Bounties';
import Events from './pages/Events';

function AppContent() {
  const location = useLocation();
  const { loadUser, isAuthenticated, user, token, connectSocket, disconnectSocket, socket } = useAuthStore();
  const { addLiveNotification, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
      fetchNotifications(token);
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user, token, connectSocket, disconnectSocket, fetchNotifications]);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notif) => {
        addLiveNotification(notif);
      });
      // prevent memory leak
      return () => socket.off('new_notification');
    }
  }, [socket, addLiveNotification]);

  return (
    <div className="min-h-screen">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? "pt-20 px-4 max-w-7xl mx-auto" : ""}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={!isAuthenticated ? <PageWrapper><Login /></PageWrapper> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <PageWrapper><Register /></PageWrapper> : <Navigate to="/" />} />
            <Route path="/" element={isAuthenticated ? <PageWrapper><Dashboard /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/hub/:domain" element={isAuthenticated ? <PageWrapper><Hub /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/projects" element={isAuthenticated ? <PageWrapper><Projects /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/projects/:id" element={isAuthenticated ? <PageWrapper><ProjectCommand /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/profile/:id?" element={isAuthenticated ? <PageWrapper><Profile /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/radar" element={isAuthenticated ? <PageWrapper><Radar /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/telemetry" element={isAuthenticated ? <PageWrapper><Telemetry /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/nexus" element={isAuthenticated ? <PageWrapper><Nexus /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/bounties" element={isAuthenticated ? <PageWrapper><Bounties /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/events" element={isAuthenticated ? <PageWrapper><Events /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/opportunity-command" element={isAuthenticated ? <PageWrapper><OpportunityCommand /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/messages" element={isAuthenticated ? <PageWrapper><Messages /></PageWrapper> : <Navigate to="/login" />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

const PageWrapper = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} >
    {children}
  </motion.div>
);

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
