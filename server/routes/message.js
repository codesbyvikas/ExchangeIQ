const express = require('express');
const Invitation = require('../models/invitation');
const Message = require('../models/message');
const router = express.Router();

const checkInvitation = async (u1, u2) => {
  return Invitation.findOne({
    status: 'accepted',
    $or: [
      { fromUser: u1, toUser: u2 },
      { fromUser: u2, toUser: u1 }
    ]
  });
};

router.get('/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const inv = await checkInvitation(user1, user2);
    if (!inv) return res.status(403).json({ message: 'Not allowed' });
    const msgs = await Message.find({ invitationId: inv._id }).sort('createdAt');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { from, to, text, media } = req.body;
    const inv = await checkInvitation(from, to);
    if (!inv) return res.status(403).json({ message: 'Not allowed to chat' });

    const msg = await Message.create({
      sender: from,
      receiver: to,
      text,
      media,
      invitationId: inv._id,
      invitationType: inv.reqType,
      skillOffered: inv.skillOffered,
      skillRequested: inv.skillRequested
    });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
