const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['teach', 'learn'],
    required: true,
  },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSkill =  mongoose.model('UserSkill', userSkillSchema);

module.exports = UserSkill;

