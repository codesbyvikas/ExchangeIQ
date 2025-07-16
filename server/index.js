// index.js - Main server file for Render deployment using cookie-session

const express = require("express");
const cookieSession = require("cookie-session");
const passport = require("passport");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
require("./config/google");

const app = express();
const server = http.createServer(app);

// Trust proxy for secure cookies on Render
app.set("trust proxy", 1);
app.use(express.json());

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_BASE_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database connected:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });

// Use cookie-session
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "fallbacksecret"],
    maxAge: 24 * 60 * 60 * 1000, 
    secure: true,
    sameSite: "None",
    httpOnly: true,
  })
);

app.use((req, res, next) => {
  if (!req.session) return next();
  req.session.regenerate = cb => cb(); // no-op for compatibility
  req.session.save = cb => cb();       // no-op for compatibility
  next();
});
// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Debug session
app.use((req, res, next) => {
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/skill", require("./routes/skill"));
app.use("/post", require("./routes/post"));
app.use("/invitation", require("./routes/invitation"));
app.use("/chat", require("./routes/chat"));
app.use("/media", require("./routes/chatMedia"));

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// No shared-session needed since we're not using express-session
require("./sockets/chatSocket")(io);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, io };
