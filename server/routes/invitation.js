const express = require("express");
const Invitation = require("../models/invitation");
const Chat = require("../models/chat"); // Add this import
const router = express.Router(); 
const authCheck = require("../middlewares/auth");

router.post('/send', authCheck, async (req, res) => {
    try {
        const {
            toUser,
            reqType,
            skillOffered,
            skillRequested 
        } = req.body;

        const invitation = await Invitation.create({
            fromUser: req.user._id,
            toUser,
            reqType,
            skillOffered,
            skillRequested
        });

        res.status(201).json(invitation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', authCheck, async (req, res) => {
    try {
        const userId = req.user._id;

        const invitations = await Invitation.find({
            $or: [{ fromUser: userId }, { toUser: userId }]
        })
        .populate('fromUser', 'name photo')
        .populate('toUser', 'name photo')
        .populate('skillOffered', 'name iconUrl')
        .populate('skillRequested', 'name iconUrl')
        .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Modified status update route to create chat when accepted
router.patch('/:id/status', authCheck, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['pending', 'accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const invitation = await Invitation.findById(id)
            .populate('skillOffered', 'name')
            .populate('skillRequested', 'name');

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this invitation' });
        }

        invitation.status = status;
        await invitation.save();

        // Create chat when invitation is accepted
        if (status === 'accepted') {
            try {
                // Check if chat already exists between these users for this skill
                const existingChat = await Chat.findOne({
                    participants: { $all: [invitation.fromUser, invitation.toUser] },
                    skillInvolved: invitation.reqType === 'exchange' ? invitation.skillOffered : 
                                  invitation.reqType === 'learn' ? invitation.skillRequested :
                                  invitation.skillOffered
                });

                if (!existingChat) {
                    const skillInvolved = invitation.reqType === 'exchange' ? invitation.skillOffered : 
                                         invitation.reqType === 'learn' ? invitation.skillRequested :
                                         invitation.skillOffered;

                    const newChat = await Chat.create({
                        participants: [invitation.fromUser, invitation.toUser],
                        chatType: invitation.reqType,
                        skillInvolved: skillInvolved,
                        messages: [{
                            sender: invitation.fromUser,
                            text: `Hello! I'm excited to ${invitation.reqType === 'exchange' ? 'exchange skills' : 
                                  invitation.reqType === 'learn' ? 'learn from you' : 'teach you'} regarding ${skillInvolved.name}!`,
                            timestamp: new Date(),
                            isRead: false
                        }]
                    });

                    console.log('Chat created successfully:', newChat._id);
                }
            } catch (chatError) {
                console.error('Error creating chat:', chatError);
                // Don't fail the invitation acceptance if chat creation fails
            }
        }

        res.json(invitation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;