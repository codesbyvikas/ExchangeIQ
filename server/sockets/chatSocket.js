const Message = require("../models/message");
const Invitation = require("../models/invitation");

module.exports = function setupChat(io) {
  io.on("connection", (socket) => {
    console.log("✅ New socket connected:", socket.id);

    const user = socket.handshake.session?.passport?.user;
    if (!user) {
      console.log("❌ No user session, disconnecting socket:", socket.id);
      return socket.disconnect();
    }

    const userId = user._id;
    socket.join(userId);
    console.log(`👤 User ${userId} joined room ${userId}`);

    socket.on("send_message", async ({ to, text, media }) => {
      console.log(`📨 Message from ${userId} to ${to}: ${text || "[media]"}`);

      const invitation = await Invitation.findOne({
        status: "accepted",
        $or: [
          { fromUser: userId, toUser: to },
          { fromUser: to, toUser: userId },
        ],
      });

      if (!invitation) {
        return socket.emit("chat_error", {
          message: "You can only chat after invitation is accepted.",
        });
      }

      const message = await Message.create({
        sender: userId,
        receiver: to,
        text,
        media: media || null,
        invitationId: invitation._id,
        invitationType: invitation.reqType,
        skillOffered: invitation.skillOffered,
        skillRequested: invitation.skillRequested,
      });

      io.to(userId).emit("receive_message", message);
      io.to(to).emit("receive_message", message);
    });

    socket.on("load_messages", async ({ to }) => {
      const invitation = await Invitation.findOne({
        status: "accepted",
        $or: [
          { fromUser: userId, toUser: to },
          { fromUser: to, toUser: userId },
        ],
      });

      if (!invitation) {
        return socket.emit("chat_error", { message: "Chat not allowed." });
      }

      const messages = await Message.find({
        invitationId: invitation._id,
      }).sort({ createdAt: 1 });

      socket.emit("chat_history", messages);
    });

    socket.on("disconnect", () => {
      console.log("👋 Socket disconnected:", socket.id);
    });
  });
};
