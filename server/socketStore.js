let io;
const connectedUsers = new Map();

// Map userId -> socketId
module.exports = {
  setIo: (socketIoInstance) => {
    io = socketIoInstance;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
  getConnectedUsers: () => connectedUsers,
  addUserSocket: (userId, socketId) => {
    connectedUsers.set(userId, socketId);
  },
  removeUserSocket: (socketId) => {
    let removedUserId = null;
    for (let [userId, sId] of connectedUsers.entries()) {
      if (sId === socketId) {
         removedUserId = userId;
         connectedUsers.delete(userId);
         break;
      }
    }
    return removedUserId;
  },
  getOnlineUserIds: () => {
    return Array.from(connectedUsers.keys());
  }
};
