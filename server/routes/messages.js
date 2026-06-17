const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get total unread messages count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({ recipient: req.user.id, read: false });
    res.json({ unread: count });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get active conversations (users you have connected with AND optionally have message history with)
router.get('/conversations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('connections', 'name avatar domain isPublic');
    
    // In a heavy system, we would sort connections by recently messaged.
    // For now, we return all connected users as valid "Conversation" targets.
    res.json(user.connections);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get direct messages with a specific user
router.get('/:id', auth, async (req, res) => {
  try {
    const partnerId = req.params.id;
    const userId = req.user.id;

    // Strict constraint check:
    const user = await User.findById(userId);
    if (!user.connections.includes(partnerId)) {
        return res.status(403).json({ message: 'Synaptic Link required for neural chat.' });
    }

    // Mark as read
    await Message.updateMany(
      { sender: partnerId, recipient: userId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: partnerId },
        { sender: partnerId, recipient: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send a direct message
router.post('/:id', auth, async (req, res) => {
  try {
    const partnerId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;

    const user = await User.findById(userId);
    if (!user.connections.includes(partnerId)) {
      return res.status(403).json({ message: 'Synaptic Link required for neural chat.' });
    }

    const newMessage = new Message({
      sender: userId,
      recipient: partnerId,
      text
    });
    const savedMsg = await newMessage.save();

    // Optionally create a notification if we want robust backend notifications for chat
    const Notification = require('../models/Notification');
    await new Notification({
      recipient: partnerId,
      sender: userId,
      type: 'direct_message',
      content: `${user.name} sent you a neural transmission.`
    }).save();

    res.json(savedMsg);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
