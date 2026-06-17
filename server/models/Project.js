const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requiredRoles: [{
    role: { type: String, required: true }, // e.g., "Frontend Dev"
    skills: [{ type: String }],
    filled: { type: Boolean, default: false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applications: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roleAppliedFor: String,
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    appliedAt: { type: Date, default: Date.now }
  }],
  kanbanTasks: [{
    title: String,
    description: String,
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    blockHash: { type: String },
    completedAt: { type: Date }
  }],
  status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
