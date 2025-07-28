const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learnSkill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LearnPost = mongoose.model('LearnPost', postSchema, 'learnposts');
const TeachPost = mongoose.model('TeachPost', postSchema, 'teachposts');

module.exports = { LearnPost, TeachPost };
