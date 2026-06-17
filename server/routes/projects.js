const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Create a new project (Team)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, domain, requiredRoles } = req.body;
    const project = new Project({
      title,
      description,
      domain,
      creator: req.user.id,
      requiredRoles,
      members: [req.user.id]
    });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get all open projects
router.get('/', async (req, res) => {
  try {
    const { domain } = req.query;
    let query = { status: 'Open' };
    if (domain) query.domain = domain;

    const projects = await Project.find(query)
      .populate('creator', 'name avatar domain')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get a single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name avatar domain')
      .populate('members', 'name avatar domain role')
      .populate('kanbanTasks.assignedTo', 'name avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Apply to a project
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const { roleAppliedFor } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if already applied
    const alreadyApplied = project.applications.find(app => app.user.toString() === req.user.id);
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

    project.applications.push({ user: req.user.id, roleAppliedFor });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Kanban: Add task to project
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });

    project.kanbanTasks.push({ title, description, assignedTo });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Kanban: Update task status
router.put('/:projectId/tasks/:taskId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.projectId);
    
    const task = project.kanbanTasks.id(req.params.taskId);
    if(task) {
      task.status = status;

      // Proof-of-Collaboration Cryptographic Minting
      if (status === 'Done' && !task.blockHash) {
        const crypto = require('crypto');
        const timestamp = new Date().toISOString();
        const payload = `${project._id}-${req.user.id}-${task._id}-${timestamp}`;
        task.blockHash = '0x' + crypto.createHash('sha256').update(payload).digest('hex');
        task.completedAt = new Date();
      }

      await project.save();
    }

    // Return populated project to update UI immediately
    const updatedProject = await Project.findById(req.params.projectId)
      .populate('creator', 'name avatar domain')
      .populate('members', 'name avatar domain role')
      .populate('kanbanTasks.assignedTo', 'name avatar');
      
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
