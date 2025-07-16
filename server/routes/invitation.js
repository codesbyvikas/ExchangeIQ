const express = require("express");
const Invitation = require("../models/invitation");
const Chat = require("../models/chat");
const authCheck = require("../middlewares/auth");

const router = express.Router();

router.post('/send', authCheck, async (req, res) => {
  const { toUser, reqType, skillOffered, skillRequested } = req.body;
  try {
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
    const invitations = await Invitation.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }]
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

router.patch('/:id/status', authCheck, async (req, res) => {
  const { status } = req.body;
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('skillOffered')
      .populate('skillRequested');

    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
    if (invitation.toUser.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized' });

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
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

        await Chat.create({
          participants: [invitation.fromUser, invitation.toUser],
          chatType: invitation.reqType,
          skillInvolved,
          messages: [{
            sender: invitation.fromUser,
            text: `Hello! I'm excited to ${invitation.reqType === 'exchange' ? 'exchange skills' : 
                   invitation.reqType === 'learn' ? 'learn from you' : 'teach you'} about ${skillInvolved.name}.`,
            timestamp: new Date(),
            isRead: false
          }]
        });
      }
    }

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
