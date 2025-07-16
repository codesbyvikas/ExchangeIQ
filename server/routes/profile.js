const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Invitation = require('../models/invitation');
const authCheck = require('../middlewares/auth');

router.get('/chat-users', authCheck, async (req, res) => {
  try {
    const invitations = await Invitation.find({
      status: 'accepted',
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }]
    }).populate('fromUser').populate('toUser');

    const chatUsers = new Map();

    for (const inv of invitations) {
      const other = inv.fromUser._id.toString() === req.user._id.toString() ? inv.toUser : inv.fromUser;
      chatUsers.set(other._id.toString(), {
        _id: other._id,
        name: other.name,
        photo: other.photo,
        teachSkills: other.skillsToTeach,
        learnSkills: other.skillsToLearn
      });
    }

    res.json(Array.from(chatUsers.values()));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat users' });
  }
});

router.get('/me', authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email photo profession skillsToTeach skillsToLearn followers following createdAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email photo profession skillsToTeach skillsToLearn followers following createdAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.post('/edit', authCheck, async (req, res) => {
  const { name, profession, learnSkills, teachSkills } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      ...(name && { name }),
      ...(profession && { profession }),
      ...(learnSkills && { skillsToLearn: learnSkills }),
      ...(teachSkills && { skillsToTeach: teachSkills }),
    }, { new: true });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.post('/:id/follow', authCheck, async (req, res) => {
  try {
    const target = req.params.id;
    if (target === req.user._id.toString()) return res.status(400).json({ error: "You can't follow yourself" });

    await User.findByIdAndUpdate(target, { $addToSet: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target } });

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to follow user" });
  }
});

router.post('/:id/unfollow', authCheck, async (req, res) => {
  try {
    const target = req.params.id;
    await User.findByIdAndUpdate(target, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: target } });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

module.exports = router;
