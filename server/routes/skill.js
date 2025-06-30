// routes/skills.js
const express = require("express");
const Skill = require("../models/skill");
const skillsData = require("../data/skill");
const router = express.Router();

// Seed all skills
router.post("/seed", async (req, res) => {
  try {
    await Skill.deleteMany(); // 
    const inserted = await Skill.insertMany(skillsData);
    res.status(201).json({ message: "Skills seeded", count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to seed skills", details: err });
  }
});

router.post("/add", async (req, res) => {
  try {
    const newSkills = req.body;
    if (!Array.isArray(newSkills)) {
      return res.status(400).json({ error: "Expected an array of skills." });
    }

    const uniqueSkills = [];

    for (const skill of newSkills) {
      if (!skill.name || !skill.tags || !skill.iconUrl) continue;

      const exists = await Skill.findOne({ name: new RegExp(`^${skill.name}$`, 'i') });
      if (!exists) {
        uniqueSkills.push(skill);
      }
    }

    if (uniqueSkills.length > 0) {
      await Skill.insertMany(uniqueSkills);
    }

    res.status(200).json({
      message: `${uniqueSkills.length} new skills added.`,
      skills: uniqueSkills.map(s => s.name),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add new skills", details: err });
  }
});

// Get all skills
router.get("/all", async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.status(200).json(skill);
  } catch (err) {
    console.error('Error fetching skill by ID:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
