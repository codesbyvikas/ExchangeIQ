// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { LearnPost, TeachPost } = require('../models/post');
const authCheck = require('../middlewares/auth');

//learn
router.post('/learn/add', authCheck, async (req, res) => {
  const userId = req.user._id;
  const { learnSkill } = req.body;

  if (!learnSkill) {
    return res.status(400).json({ error: 'Skill ID is required' });
  }

  try {
    const exists = await LearnPost.findOne({ fromUser: userId, learnSkill });
    if (exists) {
      return res.status(409).json({ message: 'Learn post already exists' });
    }

    const post = await LearnPost.create({ fromUser: userId, learnSkill });
    return res.status(201).json(post);
  } catch (err) {
    console.error('Error creating learn post:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// TeachPost
router.post('/teach/add', authCheck, async (req, res) => {
  const userId = req.user._id;
  const { learnSkill } = req.body;

  if (!learnSkill) {
    return res.status(400).json({ error: 'Skill ID is required' });
  }

  try {
    const exists = await TeachPost.findOne({ fromUser: userId, learnSkill });
    if (exists) {
      return res.status(409).json({ message: 'Teach post already exists' });
    }

    const post = await TeachPost.create({ fromUser: userId, learnSkill });
    return res.status(201).json(post);
  } catch (err) {
    console.error('Error creating teach post:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

//Get all LearnPosts
router.get('/learn/show', async (req, res) => {
  try {
    const posts = await LearnPost.find()
      .populate('fromUser', '_id name photo')
      .populate('learnSkill', '_id name');

    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching learn posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//Get all TeachPosts
router.get('/teach/show', async (req, res) => {
  try {
    const posts = await TeachPost.find()
      .populate('fromUser', '_id name photo')
      .populate('learnSkill', '_id name');

    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching teach posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
