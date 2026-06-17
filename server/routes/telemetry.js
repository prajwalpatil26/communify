const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Hub = require('../models/Hub');

// Quick mock logic to avoid too many complex DB aggregations during hackathon demo:
router.get('/', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    
    // Skill distribution for pie chart
    const users = await User.find().select('domain skills experienceLevel');
    const domainCounts = {};
    const skillCounts = {};
    const expCounts = { Beginner: 0, Intermediate: 0, Expert: 0, Visionary: 0 };
    
    users.forEach(u => {
      // Domain
      domainCounts[u.domain] = (domainCounts[u.domain] || 0) + 1;
      
      // Skills
      u.skills?.forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
      
      // Exp
      if (u.experienceLevel && expCounts[u.experienceLevel] !== undefined) {
         expCounts[u.experienceLevel]++;
      }
    });

    const domainData = Object.keys(domainCounts).map(k => ({ name: k, value: domainCounts[k] }));
    
    // Sort skills to top 10
    const topSkills = Object.keys(skillCounts).map(k => ({ name: k, count: skillCounts[k] }))
      .sort((a,b) => b.count - a.count).slice(0, 10);
      
    const expData = Object.keys(expCounts).map(k => ({ name: k, count: expCounts[k] }));

    res.json({
        totalUsers,
        totalProjects,
        domainData,
        topSkills,
        expData,
        // Mocked timeseries data for Activity Matrix
        activityData: [
            { time: '00:00', nodes: Math.floor(Math.random() * 50) + 10, pulses: Math.floor(Math.random() * 100) },
            { time: '04:00', nodes: Math.floor(Math.random() * 50) + 20, pulses: Math.floor(Math.random() * 150) },
            { time: '08:00', nodes: Math.floor(Math.random() * 100) + 50, pulses: Math.floor(Math.random() * 300) },
            { time: '12:00', nodes: Math.floor(Math.random() * 200) + 100, pulses: Math.floor(Math.random() * 500) },
            { time: '16:00', nodes: Math.floor(Math.random() * 250) + 150, pulses: Math.floor(Math.random() * 600) },
            { time: '20:00', nodes: Math.floor(Math.random() * 100) + 80, pulses: Math.floor(Math.random() * 400) }
        ]
    });

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
