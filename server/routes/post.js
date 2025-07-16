const express = require('express');
const { LearnPost, TeachPost } = require('../models/post');
const authCheck = require('../middlewares/auth');

const router = express.Router();

router.post('/learn/add', authCheck, async (req, res) => {
  const { learnSkill } = req.body;
  if (!learnSkill) return res.status(400).json({ error: 'Skill ID is required' });

  try {
    const exists = await LearnPost.findOne({ fromUser: req.user._id, learnSkill });
    if (exists) return res.status(409).json({ message: 'Learn post already exists' });

    const post = await LearnPost.create({ fromUser: req.user._id, learnSkill });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/teach/add', authCheck, async (req, res) => {
  const { learnSkill } = req.body;
  if (!learnSkill) return res.status(400).json({ error: 'Skill ID is required' });

  try {
    const exists = await TeachPost.findOne({ fromUser: req.user._id, learnSkill });
    if (exists) return res.status(409).json({ message: 'Teach post already exists' });

    const post = await TeachPost.create({ fromUser: req.user._id, learnSkill });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/learn/show', async (req, res) => {
  try {
    const posts = await LearnPost.find()
      .populate('fromUser', '_id name photo')
      .populate('learnSkill', '_id name');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/teach/show', async (req, res) => {
  try {
    const posts = await TeachPost.find()
      .populate('fromUser', '_id name photo')
      .populate('learnSkill', '_id name');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/learn/:id', authCheck, async (req, res) => {
  try {
    const post = await LearnPost.findOneAndDelete({ _id: req.params.id, fromUser: req.user._id });
    if (!post) return res.status(404).json({ message: 'Learn post not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/teach/:id', authCheck, async (req, res) => {
  try {
    const post = await TeachPost.findOneAndDelete({ _id: req.params.id, fromUser: req.user._id });
    if (!post) return res.status(404).json({ message: 'Teach post not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
