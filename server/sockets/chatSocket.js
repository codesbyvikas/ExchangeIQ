// sockets/chatSocket.js
module.exports = (io) => {
  // Store user socket mapping
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("📡 New socket connected:", socket.id);

    // Join a chat room and store user mapping
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    // Chat messaging
    socket.on("chatMessage", ({ roomId, message }) => {
      io.to(roomId).emit("chatMessage", { message, from: socket.id });
    });

    // WebRTC Signaling Events
    
    // Handle call initiation
    socket.on("callUser", ({ userToCall, signalData, from, type }) => {
      console.log(`📞 Call from ${from} to ${userToCall} (${type})`);
      
      const targetSocketId = userSockets.get(userToCall);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callIncoming", {
          signal: signalData,
          from: from,
          type: type || 'video'
        });
      } else {
        // User is offline
        socket.emit("callFailed", { reason: "User is offline" });
      }
    });

    // Handle call answer
    socket.on("answerCall", ({ to, signal }) => {
      console.log(`📞 Call answered by ${socket.userId} to ${to}`);
      
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callAccepted", signal);
      }
    });

    // Handle ICE candidates
    socket.on("ice-candidate", ({ candidate, to }) => {
      console.log(`🧊 ICE candidate from ${socket.userId} to ${to}`);
      
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("ice-candidate", {
          candidate: candidate,
          from: socket.userId
        });
      }
    });

    // Handle call rejection
    socket.on("rejectCall", ({ to }) => {
      console.log(`❌ Call rejected by ${socket.userId} to ${to}`);
      
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callRejected");
      }
    });

    // Handle call end
    socket.on("endCall", ({ to }) => {
      console.log(`📞 Call ended by ${socket.userId} to ${to}`);
      
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("callEnded");
      }
    });

    // Handle user status updates
    socket.on("updateStatus", ({ status }) => {
      socket.broadcast.emit("userStatusUpdate", {
        userId: socket.userId,
        status: status
      });
    });

    // Handle screen sharing
    socket.on("shareScreen", ({ to, signal }) => {
      console.log(`🖥️ Screen share from ${socket.userId} to ${to}`);
      
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("screenShareOffer", {
          signal: signal,
          from: socket.userId
        });
      }
    });

    socket.on("acceptScreenShare", ({ to, signal }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("screenShareAccepted", signal);
      }
    });

    socket.on("stopScreenShare", ({ to }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("screenShareStopped");
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      
      // Clean up user mapping
      if (socket.userId) {
        userSockets.delete(socket.userId);
        
        // Notify other users that this user is offline
        socket.broadcast.emit("userStatusUpdate", {
          userId: socket.userId,
          status: "offline"
        });
      }
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  // Cleanup on server shutdown
  process.on('SIGTERM', () => {
    userSockets.clear();
  });
};