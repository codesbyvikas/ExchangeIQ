const Message = require('../models/message');
const Invitation = require('../models/invitation');

module.exports = function(io) {
  io.on('connection', socket => {
    const user = socket.handshake.session?.passport?.user;
    if (!user) return socket.disconnect();

    const uid = user._id;
    socket.join(uid);

    socket.on('send_message', async ({ to, text, media }) => {
      const inv = await Invitation.findOne({
        status: 'accepted',
        $or: [
          { fromUser: uid, toUser: to },
          { fromUser: to, toUser: uid }
        ]
      });
      if (!inv) return socket.emit('chat_error', 'Not allowed to chat');

      const msg = await Message.create({
        sender: uid,
        receiver: to,
        text,
        media,
        invitationId: inv._id,
        invitationType: inv.reqType,
        skillOffered: inv.skillOffered,
        skillRequested: inv.skillRequested
      });
      io.to(uid).emit('receive_message', msg);
      io.to(to).emit('receive_message', msg);
    });

    socket.on('load_messages', async ({ to }) => {
      const inv = await Invitation.findOne({
        status: 'accepted',
        $or: [
          { fromUser: uid, toUser: to },
          { fromUser: to, toUser: uid }
        ]
      });
      if (!inv) return socket.emit('chat_error', 'Not allowed');
      const msgs = await Message.find({ invitationId: inv._id }).sort('createdAt');
      socket.emit('chat_history', msgs);
    });
  });
};
