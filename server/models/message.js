const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    default: ''
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    enum: ["image", "video", "audio", "document", null],
    default: null
  },
  publicId: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  }
});

// Add index for better query performance
messageSchema.index({ sender: 1, timestamp: -1 });
messageSchema.index({ isRead: 1 });

module.exports = messageSchema;