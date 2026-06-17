const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Hackathon', 'Internship', 'Research Project', 'Startup Cohort', 'Bounty', 'Global Summit', 'Exhibition', 'Audition', 'Freelance Gig', 'Partnership', 'Mentorship'],
    required: true 
  },
  domain: { type: String, required: true },
  requiredSkills: [{ type: String }],
  reward: { type: String }, // e.g. "Prize Money", "Stipend", "Equity"
  deadline: { type: Date },
  link: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applications: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Shortlisted', 'Accepted', 'Rejected'], default: 'Pending' },
    appliedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
