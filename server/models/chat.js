const mongoose = require("mongoose");
const messageSchema = require("./message")

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  chatType: {
    type: String,
    enum: ['exchange', 'learn', 'teach'],
    required: true
  },
  skillInvolved: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
chatSchema.index({ participants: 1, lastMessage: -1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;