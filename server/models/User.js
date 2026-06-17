const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default' },
  bio: { type: String },
  domain: { 
    type: String, 
    required: true 
  },
  skills: [{ type: String }], // e.g., ["Python", "PyTorch", "Rust"]
  interests: [{ type: String }],
  experienceLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Expert', 'Visionary'],
    default: 'Beginner'
  },
  careerGoals: [{ type: String }],
  links: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: String,
    endYear: String
  }],
  workHistory: [{
    company: String,
    role: String,
    description: String,
    startYear: String,
    endYear: String
  }],
  isPublic: { type: Boolean, default: true },
  savedOpportunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' }],
  collaborationScore: { type: Number, default: 0 },
  topMatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  endorsements: [{
    skill: String,
    endorsedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
