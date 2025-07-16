const express = require("express");
const Skill = require("../models/skill");
const skillsData = require("../data/skill");
const router = express.Router();

router.post("/seed", async (req, res) => {
  try {
    await Skill.deleteMany();
    const inserted = await Skill.insertMany(skillsData);
    res.status(201).json({ message: "Skills seeded", count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to seed skills" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const newSkills = req.body;
    if (!Array.isArray(newSkills)) return res.status(400).json({ error: "Expected array" });

    const added = [];
    for (const skill of newSkills) {
      if (!skill.name || !skill.tags || !skill.iconUrl) continue;
      const exists = await Skill.findOne({ name: new RegExp(`^${skill.name}$`, 'i') });
      if (!exists) added.push(skill);
    }

    if (added.length) await Skill.insertMany(added);

    res.status(200).json({ message: `${added.length} skills added`, skills: added });
  } catch (err) {
    res.status(500).json({ error: "Failed to add skills" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.status(200).json(skill);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
