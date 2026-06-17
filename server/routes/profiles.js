const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getTopMatches } = require('../services/matchEngine');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get Leaderboard (Radar)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaders = await User.find({ isPublic: true })
      .sort({ collaborationScore: -1 })
      .limit(10)
      .select('name avatar domain experienceLevel collaborationScore links');
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user profile by ID
router.get('/:id', auth, async (req, res) => {
  if (req.params.id === 'me') return next(); // In case it conflicts with /me
  try {
    const profile = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name avatar domain')
      .populate('connectionRequests', 'name avatar')
      .populate('endorsements.endorsedBy', 'name avatar');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Profile not found' });
    res.status(500).json({ message: 'Server Error' });
  }
});


// Update profile
router.put('/me', auth, async (req, res) => {
  try {
    const { bio, domain, skills, interests, experienceLevel, careerGoals, links, education, workHistory, isPublic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { bio, domain, skills, interests, experienceLevel, careerGoals, links, education, workHistory, isPublic } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});



// Get matches for current user
router.get('/matches', auth, async (req, res) => {
  try {
    const matches = await getTopMatches(req.user.id);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Sync GitHub Portfolio
router.post('/github-sync', auth, async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) return res.status(400).json({ message: 'GitHub handling missing' });

    // In a real app, this would use Axios to call https://api.github.com/users/${githubUsername}/repos
    // Creating dynamic mock data based on the username to simulate a successful API sync
    const simulatedRepos = [
      { title: `${githubUsername}-core`, description: "A high-performance algorithmic backend router.", domain: "Backend", status: "Completed" },
      { title: `neural-net-ui`, description: "Frontend visualization matrix.", domain: "AI", status: "In Progress" }
    ];

    const user = await User.findById(req.user.id);
    // Push the simulated repos into the user's work history or portfolio
    simulatedRepos.forEach(repo => {
      user.workHistory.push({
        company: "GitHub Sync",
        role: repo.title,
        description: repo.description,
        startYear: '2026',
        endYear: 'Present'
      });
    });

    user.links.github = `https://github.com/${githubUsername}`;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'GitHub Sync Error', error: err.message });
  }
});

module.exports = router;
