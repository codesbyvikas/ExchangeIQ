const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authCheck = require('../middlewares/auth');
const Invitation = require('../models/invitation');
const Chat = require('../models/chat');

router.get('/chat-users', authCheck, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch accepted invitations involving the current user
    const invitations = await Invitation.find({
      status: 'accepted',
      $or: [{ fromUser: userId }, { toUser: userId }],
    })
      .populate({
        path: 'fromUser',
        populate: ['skillsToTeach', 'skillsToLearn'],
      })
      .populate({
        path: 'toUser',
        populate: ['skillsToTeach', 'skillsToLearn'],
      });

    const chatUserMap = new Map();

    invitations.forEach((inv) => {
      const otherUser =
        inv.fromUser._id.toString() === userId.toString()
          ? inv.toUser
          : inv.fromUser;

      if (!chatUserMap.has(otherUser._id.toString())) {
        chatUserMap.set(otherUser._id.toString(), {
          _id: otherUser._id,
          name: otherUser.name,
          photo: otherUser.photo,
          teachSkills: otherUser.skillsToTeach.map((s) => s.name),
          learnSkills: otherUser.skillsToLearn.map((s) => s.name),
        });
      }
    });

    res.json(Array.from(chatUserMap.values()));
  } catch (err) {
    console.error('Error fetching chat users:', err);
    res.status(500).json({ message: 'Failed to fetch chat users' });
  }
});

router.post('/edit', authCheck, async (req, res) => {
  const { name, profession, learnSkills, teachSkills } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (profession) updates.profession = profession;
  if (learnSkills) updates.skillsToLearn = learnSkills;
  if (teachSkills) updates.skillsToTeach = teachSkills;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Internal server error');
  }
});

router.get('/me', authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email photo profession followers following skillsToTeach skillsToLearn createdAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Internal server error");
  }
});





router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email photo profession followers following skillsToTeach skillsToLearn createdAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).send("Internal server error");
  }
});

router.post('/:id/follow', authCheck, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if(targetUserId === currentUserId.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    })
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId }
    });

    res.json({ message: "Followed successfully" });
  } catch(error){
    res.status(500).json({error: "Failed to follow user"});
  }
});

router.post('/:id/unfollow', authCheck, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
    })
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId }
    });

    res.json({ message: "Unfollowed successfully" });
  } catch(error){
    res.status(500).json({error: "Failed to unfollow user"});
  }
});


module.exports = router;
