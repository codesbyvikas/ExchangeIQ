const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  tags: [String],
  iconUrl: { 
    type: String, 
    required: true 
  },
});

module.exports = mongoose.model("Skill", skillSchema);
