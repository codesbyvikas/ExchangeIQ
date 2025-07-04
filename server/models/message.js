const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    text: String,
    media: String,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    InvitationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invite",
        required: false,
    },
    invitationType: {
        type: String,
        enum: [ 'exchange', 'learn', 'teach'],
        required: false,
    },
    skillOffered:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: false,
    },
    skillRequested: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: false,
    }
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;