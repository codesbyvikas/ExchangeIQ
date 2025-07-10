// 1. First, install connect-mongo
// Run: npm install connect-mongo

// 2. Update your index.js session configuration
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo"); 
const passport = require("passport");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const sharedSession = require("express-socket.io-session");

dotenv.config();
require("./config/google");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.set('trust proxy', 1);

const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174", 
  process.env.FRONTEND_BASE_URL, 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database connected");
    console.log("📦 Using database:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// FIXED SESSION CONFIGURATION FOR PRODUCTION
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30, 
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
});

// Passport Middleware
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint for Render
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

// Socket.IO setup with production configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

io.use(sharedSession(sessionMiddleware, { autoSave: true }));

// Load socket logic
require("./sockets/chatSocket")(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});

// Start Server with Socket.IO bound
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Session store: MongoDB`);
});

// Export for testing purposes
module.exports = { app, server, io };