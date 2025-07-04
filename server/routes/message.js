const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const Invitation = require("../models/invitation");

const getAcceptedInvitation = async (user1, user2) => {
    return await Invitation.findOne({
        status: "accepted",
        $or: [
            { fromUser: user1, toUser: user2},
            { fromUser: user2, toUser: user1},
        ],
    });
}

router.get("/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;
    const invitation = await getAcceptedInvitation(userq, user2);

    if(!invitation) {
        return res.status(403).json({ message: "Chat not allowed"});
    }

    const messages = await Message.findOne({
        InvitationId: invitation._id,
    }).sort({createdAt: 1});

    res.json(messages);
});

module.exports = router ;