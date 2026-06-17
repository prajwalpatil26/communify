const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/hubs', require('./routes/hubs'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/search', require('./routes/search'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/telemetry', require('./routes/telemetry'));
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Communify API - The Future of Collaboration' });
});

const http = require('http');
const { Server } = require('socket.io');
const { setIo, addUserSocket, removeUserSocket } = require('./socketStore');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

setIo(io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`[SOCKET] Node Connected: ${socket.id}`);

  // Authenticate socket user
  socket.on('register_node', (userId) => {
    addUserSocket(userId, socket.id);
    console.log(`[TELEMETRY] Node Registered: User ${userId} -> Socket ${socket.id}`);
    const { getOnlineUserIds } = require('./socketStore');
    io.emit('online_users_update', getOnlineUserIds());
  });

  socket.on('get_online_users', () => {
    const { getOnlineUserIds } = require('./socketStore');
    socket.emit('online_users_update', getOnlineUserIds());
  });

  socket.on('join_hub', (domain) => {
    socket.join(domain);
    console.log(`Node ${socket.id} joined Domain Hub: ${domain}`);
  });

  socket.on('send_post', (data) => {
    io.to(data.domain).emit('receive_post', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.domain).emit('user_typing', { isTyping: data.isTyping });
  });

  socket.on('dm_typing', (data) => {
    const { getConnectedUsers } = require('./socketStore');
    const connectedUsers = getConnectedUsers();
    const recipientSocketId = connectedUsers.get(data.recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_dm_typing', { sender: data.sender, isTyping: data.isTyping });
    }
  });

  socket.on('direct_message', async (data) => {
    // data: { sender, recipient, text, createdAt }
    const { getConnectedUsers } = require('./socketStore');
    const connectedUsers = getConnectedUsers();
    const recipientSocketId = connectedUsers.get(data.recipient);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_direct_message', data);
    }
  });


  socket.on('disconnect', () => {
    const removedUserId = removeUserSocket(socket.id);
    console.log(`[SOCKET] Node Disconnected: ${socket.id}`);
    if (removedUserId) {
      const { getOnlineUserIds } = require('./socketStore');
      io.emit('online_users_update', getOnlineUserIds());
    }
  });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('CONNECTED TO NEURAL DATABASE (MONGODB)');
    server.listen(PORT, () => {
      console.log(`SERVER RUNNING IN ANTI-GRAVITY MODE ON PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DATABASE CONNECTION FAILURE:', err);
  });

