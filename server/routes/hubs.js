const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hub = require('../models/Hub');

// Get all hubs
router.get('/', async (req, res) => {
  try {
    const hubs = await Hub.find();
    res.json(hubs);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single hub by domain
router.get('/:domain', async (req, res) => {
  try {
    const hub = await Hub.findOne({ domain: req.params.domain }).populate('posts.author posts.comments.author', 'name avatar');
    if (!hub) return res.status(404).json({ message: 'Hub not found' });
    res.json(hub);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Post in hub
router.post('/:domain/posts', auth, async (req, res) => {
  try {
    const { content } = req.body;
    let hub = await Hub.findOne({ domain: req.params.domain });
    if (!hub) {
      // Create hub if it doesn't exist (simulating auto-hub creation)
      hub = new Hub({ domain: req.params.domain, description: `${req.params.domain} Research and Discussion` });
    }

    hub.posts.unshift({ author: req.user.id, content });
    await hub.save();
    
    const updatedHub = await Hub.findById(hub._id).populate('posts.author', 'name avatar');
    res.json(updatedHub.posts[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Like/Unlike a post
router.post('/:domain/posts/:id/like', auth, async (req, res) => {
  try {
    const hub = await Hub.findOne({ domain: req.params.domain });
    if (!hub) return res.status(404).json({ message: 'Hub not found' });

    const post = hub.posts.id(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if liked
    if (post.likes.includes(req.user.id)) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);
    }
    await hub.save();
    
    // We send back the whole post to simply merge the array
    const updatedHub = await Hub.findById(hub._id).populate('posts.author posts.comments.author', 'name avatar');
    const updatedPost = updatedHub.posts.id(req.params.id);
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add a comment
router.post('/:domain/posts/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const hub = await Hub.findOne({ domain: req.params.domain });
    if (!hub) return res.status(404).json({ message: 'Hub not found' });

    const post = hub.posts.id(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author: req.user.id, content });
    await hub.save();

    const updatedHub = await Hub.findById(hub._id).populate('posts.author posts.comments.author', 'name avatar');
    const updatedPost = updatedHub.posts.id(req.params.id);
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
