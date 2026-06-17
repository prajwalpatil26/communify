const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, domain, skills, bio, experienceLevel, interests, careerGoals } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Generate dummy contextual data so profile isn't empty
    const safeName = name.replace(/\s+/g, '').toLowerCase();
    const links = {
      github: `github.com/${safeName}`,
      linkedin: `linkedin.com/in/${safeName}`,
      portfolio: `www.${safeName}.io`
    };

    const domainPrefix = domain ? domain.split(' ')[0] : 'Technology';
    const education = [{
      institution: `Global Institute of ${domainPrefix}`,
      degree: 'Bachelors',
      field: domain,
      startYear: '2020',
      endYear: '2024'
    }];

    const workHistory = [{
      company: 'FutureTech Corp',
      role: `${experienceLevel === 'Visionary' ? 'Lead' : 'Junior'} ${domainPrefix} Specialist`,
      description: `Developing core infrastructure related to ${domain}.`,
      startYear: '2024',
      endYear: 'Present'
    }];

    user = new User({ 
      name, email, password, domain, skills, bio, experienceLevel, interests, careerGoals, links, education, workHistory 
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name, email, domain, skills } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email, domain: user.domain, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
