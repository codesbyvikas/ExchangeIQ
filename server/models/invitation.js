const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    reqType: {
        type:String,
        enum: [ 'exchange', 'learn', 'teach'],
        required: true        
    },
    skillOffered: {
        type: mongoose.Schema.ObjectId,
        ref: 'Skill',
    },
    skillRequested: {
        type: mongoose.Schema.ObjectId,
        ref: 'Skill'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'], 
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}) ;

const Invitation = mongoose.model('Invite', invitationSchema);

export default Invitation;

