const User = require('../models/user');
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

const checkProfileAndRedirect = async (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect(`${FRONTEND_BASE_URL}/login`);
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.redirect(`${FRONTEND_BASE_URL}/login`);
    }

    const hasProfession = user.profession && user.profession.trim().length > 0;
    const hasSkillsToTeach = Array.isArray(user.skillsToTeach) && user.skillsToTeach.length > 0;
    const hasSkillsToLearn = Array.isArray(user.skillsToLearn) && user.skillsToLearn.length > 0;

    

    if (!hasSkillsToTeach) {
      return res.redirect(`${FRONTEND_BASE_URL}/profile/skills/teach`);
    }

    if (!hasSkillsToLearn) {
      return res.redirect(`${FRONTEND_BASE_URL}/profile/skills/learn`);
    }
    
    if (!hasProfession) {
      return res.redirect(`${FRONTEND_BASE_URL}/set-profession`);
    }

    next();
  } catch (err) {
    console.error('checkProfileAndRedirect error:', err);
    return res.redirect(`${FRONTEND_BASE_URL}/login`);
  }
};

module.exports = checkProfileAndRedirect;
