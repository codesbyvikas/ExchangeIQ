const User = require('../models/user');

const checkProfileAndRespond = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hasProfession = user.profession && user.profession.trim().length > 0;
    const hasSkillsToTeach = Array.isArray(user.skillsToTeach) && user.skillsToTeach.length > 0;
    const hasSkillsToLearn = Array.isArray(user.skillsToLearn) && user.skillsToLearn.length > 0;

    const incompleteSections = [];
    if (!hasSkillsToLearn) incompleteSections.push("skillsToLearn");
    if (!hasSkillsToTeach) incompleteSections.push("skillsToTeach");
    if (!hasProfession) incompleteSections.push("profession");

    const profileComplete = incompleteSections.length === 0;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      profileComplete,
      missingFields: incompleteSections,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("checkProfileAndRespond error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = checkProfileAndRespond;