const User = require('../models/User');

/**
 * Neural Synergy Match Engine V2 (TF-IDF & Logarithmic Decay)
 * This proprietary algorithm calculates highly accurate synaptic synergy
 * between nodes by weighing rare skills heavily and applying non-linear
 * decay to experience differentials.
 */

// Simulated Inverse Document Frequency (IDF) Map
// Rare skills have higher weights. Common skills have lower weights.
const skillIDFMap = {
  'HTML': 0.1, 'CSS': 0.1, 'JavaScript': 0.3, 'Python': 0.4,
  'React': 0.5, 'Node.js': 0.5, 'C++': 0.6, 'Java': 0.6,
  'MongoDB': 0.5, 'SQL': 0.4,
  'PyTorch': 0.9, 'CUDA': 1.2, 'Transformers': 1.1, // AI
  'Solidity': 1.2, 'Rust': 1.3, 'Ethereum': 1.0,    // Web3
  'Pixhawk': 1.4, 'Arduino': 0.8                    // Hardware
};

const getSkillWeight = (skill) => skillIDFMap[skill] || 0.7; // Default weight for unmapped skills

const calculateSynergy = (userA, userB) => {
  // 1. TF-IDF Weighted Skill Proximity (50% Weight)
  const setA = new Set(userA.skills);
  const setB = new Set(userB.skills);
  
  let intersectionWeight = 0;
  let unionWeight = 0;

  const union = new Set([...setA, ...setB]);
  union.forEach(skill => {
    const weight = getSkillWeight(skill);
    unionWeight += weight;
    if (setA.has(skill) && setB.has(skill)) {
      intersectionWeight += weight;
    }
  });

  const skillScore = unionWeight === 0 ? 0 : (intersectionWeight / unionWeight) * 100;

  // 2. Vectorized Domain Resonance (30% Weight)
  const domainScore = userA.domain === userB.domain ? 100 : 0;

  // 3. Logarithmic Experience Decay (20% Weight)
  const expLevels = ['Beginner', 'Intermediate', 'Expert', 'Visionary'];
  const levelA = expLevels.indexOf(userA.experienceLevel);
  const levelB = expLevels.indexOf(userB.experienceLevel);
  
  // Apply a non-linear decay: smaller gaps matter less, large gaps penalize heavily.
  const diff = Math.abs(levelA - levelB);
  const decayFactor = Math.log(diff + 1) / Math.log(expLevels.length); // 0 to 1 range
  const expScore = (1 - decayFactor) * 100;

  // Weighted Neural Synthesis
  const totalScore = (skillScore * 0.5) + (domainScore * 0.3) + (expScore * 0.2);
  
  // Cap at 100
  return Math.min(Math.round(totalScore), 100);
};

const getTopMatches = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const allUsers = await User.find({ _id: { $ne: userId } });
  
  const matches = allUsers.map(otherUser => ({
    user: otherUser,
    synergy: calculateSynergy(user, otherUser),
    commonSkills: user.skills.filter(skill => otherUser.skills.includes(skill))
  }));

  // Sort by synergy vector (Descending)
  return matches
    .sort((a, b) => b.synergy - a.synergy)
    .slice(0, 5);
};

module.exports = {
  calculateSynergy,
  getTopMatches
};
