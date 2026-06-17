const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { getIo, getConnectedUsers } = require('../socketStore');

// Send Connection Request
router.post('/request/:id', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const recipientId = req.params.id;

    if (senderId === recipientId) return res.status(400).json({ msg: "Cannot connect with yourself" });

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ msg: "User not found" });

    const senderIdStr = senderId.toString();
    const alreadyRequested = recipient.connectionRequests.some(id => id.toString() === senderIdStr);
    const alreadyConnected = recipient.connections.some(id => id.toString() === senderIdStr);

    if (alreadyRequested || alreadyConnected) {
      return res.status(400).json({ msg: "Request already sent or connected" });
    }

    recipient.connectionRequests.push(senderId);
    await recipient.save();

    // Create Notification
    const sender = await User.findById(senderId);
    const notif = new Notification({
      recipient: recipientId,
      sender: senderId,
      type: 'connection_request',
      content: `${sender.name} sent you a Synaptic Link request.`
    });
    await notif.save();

    // Real-time Emission
    const connectedUsers = getConnectedUsers();
    const recipientSocket = connectedUsers.get(recipientId);
    if (recipientSocket) {
      getIo().to(recipientSocket).emit('new_notification', notif);
    }

    res.json({ msg: "Request sent" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// Accept Connection
router.post('/accept/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const senderId = req.params.id;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user.connectionRequests.includes(senderId)) {
      return res.status(400).json({ msg: "No pending request" });
    }

    user.connectionRequests = user.connectionRequests.filter(id => id.toString() !== senderId);
    user.connections.push(senderId);
    await user.save();

    sender.connections.push(userId);
    await sender.save();

    // Notification back to sender
    const notif = new Notification({
      recipient: senderId,
      sender: userId,
      type: 'connection_accepted',
      content: `${user.name} accepted your Synaptic Link.`
    });
    await notif.save();

    // Real-time Emission
    const connectedUsers = getConnectedUsers();
    const senderSocket = connectedUsers.get(senderId);
    if (senderSocket) {
      getIo().to(senderSocket).emit('new_notification', notif);
    }

    res.json({ msg: "Connection accepted" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// Endorse a skill
router.post('/endorse/:id', auth, async (req, res) => {
  try {
    const endorserId = req.user.id;
    const targetUserId = req.params.id;
    const { skill } = req.body;

    const targetUser = await User.findById(targetUserId);
    const endorser = await User.findById(endorserId);

    // Ensure connection exists
    if (!targetUser.connections.includes(endorserId)) {
      return res.status(403).json({ msg: "Must be connected to endorse" });
    }

    // Checking if already endorsed
    const existingEndorsement = targetUser.endorsements.find(e => e.skill === skill && e.endorsedBy.toString() === endorserId);
    if (existingEndorsement) return res.status(400).json({ msg: "Skill already endorsed by you" });

    targetUser.endorsements.push({ skill, endorsedBy: endorserId });
    targetUser.collaborationScore += 10;
    await targetUser.save();

    const notif = new Notification({
      recipient: targetUserId,
      sender: endorserId,
      type: 'endorsement',
      content: `${endorser.name} verified your parameter: ${skill}.`
    });
    await notif.save();

    const connectedUsers = getConnectedUsers();
    const targetSocket = connectedUsers.get(targetUserId);
    if (targetSocket) getIo().to(targetSocket).emit('new_notification', notif);

    res.json({ msg: "Endorsement successful", collaborationScore: targetUser.collaborationScore });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

module.exports = router;
