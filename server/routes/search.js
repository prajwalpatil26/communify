const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Hub = require('../models/Hub');

// Global Search
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [], projects: [], hubs: [] });

    const regex = new RegExp(q, 'i');

    const [users, projects, hubs] = await Promise.all([
      User.find({ 
        isPublic: true, 
        $or: [{ name: regex }, { domain: regex }, { skills: { $in: [regex] } }] 
      }).select('name avatar domain skills experienceLevel').limit(5),
      
      Project.find({ 
        status: 'Open', 
        $or: [{ title: regex }, { domain: regex }, { 'requiredRoles.role': regex }] 
      }).select('title domain status requiredRoles').limit(5),
      
      Hub.find({ 
        $or: [{ domain: regex }, { description: regex }] 
      }).select('domain description').limit(5)
    ]);

    res.json({ users, projects, hubs });
  } catch (err) {
    res.status(500).json({ message: 'Search Error', error: err.message });
  }
});

module.exports = router;
