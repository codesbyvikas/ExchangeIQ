const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authCheck = require('../middlewares/auth');

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


router.get("/me", authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email photo profession skillsToTeach skillsToLearn createdAt"
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
      "name email photo profession skillsToTeach skillsToLearn createdAt"
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


module.exports = router;
