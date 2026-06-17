const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const { getIo, getConnectedUsers } = require('../socketStore');

// Create Opportunity
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, domain, requiredSkills, reward, deadline, link } = req.body;
    const opportunity = new Opportunity({
      title, description, type, domain, requiredSkills, reward, deadline, link,
      creator: req.user.id
    });
    await opportunity.save();
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get saved opportunities for current user
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedOpportunities');
    res.json(user.savedOpportunities);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Bookmark/Unbookmark opportunity
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const oppId = req.params.id;
    
    const isSaved = user.savedOpportunities.includes(oppId);
    if (isSaved) {
      user.savedOpportunities = user.savedOpportunities.filter(id => id.toString() !== oppId);
    } else {
      user.savedOpportunities.push(oppId);
    }
    await user.save();
    res.json({ message: isSaved ? 'Removed bookmark' : 'Bookmarked', isSaved: !isSaved });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all opportunities (mock AI filtering)
router.get('/', async (req, res) => {
  try {
    const { domain, skills } = req.query;
    let query = {};
    
    if (domain) query.domain = domain;
    // Basic filter: match any skill if provided
    if (skills) {
      const skillList = skills.split(',');
      query.requiredSkills = { $in: skillList };
    }

    const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Seed mock data (Dev only)
router.post('/seed', async (req, res) => {
  try {
    const mockData = [
      {
        title: "NeuroLink Hackathon 2026",
        description: "Build the interface for the next generation of brain-computer interaction.",
        type: "Hackathon",
        domain: "AI",
        requiredSkills: ["Python", "NeuroTech", "React"],
        reward: "$50,000",
        deadline: new Date("2026-10-10")
      },
      {
        title: "Quantum Ledger Internship",
        description: "Join our fintech team to secure transactions with quantum encryption.",
        type: "Internship",
        domain: "Fintech",
        requiredSkills: ["Rust", "Cryptography"],
        reward: "$4000/mo",
        deadline: new Date("2026-06-01")
      }
    ];
    await Opportunity.insertMany(mockData);
    res.json({ message: 'Data Seeded' });
  } catch (err) {
    res.status(500).json({ message: 'Seed failed', error: err.message });
  }
});

// Apply to Opportunity
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const oppId = req.params.id;
    const userId = req.user.id;
    
    const opportunity = await Opportunity.findById(oppId);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    
    // Check if already applied
    if (opportunity.applications.some(app => app.user.toString() === userId)) {
      return res.status(400).json({ message: 'Already applied' });
    }
    
    opportunity.applications.push({ user: userId });
    await opportunity.save();
    
    // Notify creator
    if (opportunity.creator) {
      const user = await User.findById(userId);
      const notif = new Notification({
        recipient: opportunity.creator,
        sender: userId,
        type: 'application_update',
        content: `${user.name} deployed an application for ${opportunity.title}.`
      });
      await notif.save();
      
      const connectedUsers = getConnectedUsers();
      const creatorSocket = connectedUsers.get(opportunity.creator.toString());
      if (creatorSocket) getIo().to(creatorSocket).emit('new_notification', notif);
    }
    
    res.json({ message: 'Application Deployed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get Opportunities created by me
router.get('/my-postings', auth, async (req, res) => {
  try {
    const opps = await Opportunity.find({ creator: req.user.id })
      .populate('applications.user', 'name email avatar skills domain')
      .sort({ createdAt: -1 });
    res.json(opps);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update Application Status
router.put('/:id/applications/:appId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const oppId = req.params.id;
    const opp = await Opportunity.findById(oppId);
    
    if (!opp) return res.status(404).json({ message: 'Not found' });
    if (opp.creator.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    
    const application = opp.applications.find(app => app._id.toString() === req.params.appId);
    if (!application) return res.status(404).json({ message: 'App not found' });
    
    application.status = status;
    await opp.save();
    
    // Notify Applicant
    const notif = new Notification({
      recipient: application.user,
      sender: req.user.id,
      type: 'application_update',
      content: `Your application status for ${opp.title} is now: ${status}.`
    });
    await notif.save();
    
    const connectedUsers = getConnectedUsers();
    const applicantSocket = connectedUsers.get(application.user.toString());
    if (applicantSocket) getIo().to(applicantSocket).emit('new_notification', notif);
    
    res.json({ message: 'Status updated', application });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
