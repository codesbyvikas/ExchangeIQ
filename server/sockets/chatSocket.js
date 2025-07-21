module.exports = (io) => {
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("📡 New socket connected:", socket.id);

    socket.on("setup", (userId) => {
      socket.join(userId);
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`✅ [setup] Socket ${socket.id} registered for user ${userId}`);
    });
    socket.on("chatMessage", ({ roomId, message }) => {
      io.to(roomId).emit("chatMessage", { message, from: socket.id });
    });

    // Agora call
    socket.on("callUser", ({ userToCall, from, type, channelName, callerInfo }) => {
  const targetSocketId = userSockets.get(userToCall);
  console.log(`📞 Trying to call ${userToCall}. Socket: ${targetSocketId}`);

  if (targetSocketId) {
    io.to(targetSocketId).emit("callIncoming", {
      from,
      type: type || "video",
      channelName,
      callerInfo,
    });
  } else {
    socket.emit("callFailed", { reason: "User is offline" });
  }
});
    socket.on("answerCall", ({ to }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callAccepted");
      }
    });

    socket.on("rejectCall", ({ to }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callRejected");
      }
    });

    socket.on("endCall", ({ to }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callEnded");
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      if (socket.userId) {
        userSockets.delete(socket.userId);
        socket.broadcast.emit("userStatusUpdate", {
          userId: socket.userId,
          status: "offline",
        });
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  process.on("SIGTERM", () => {
    userSockets.clear();
  });
};
