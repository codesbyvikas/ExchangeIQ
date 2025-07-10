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

// Trust proxy for Render
app.set('trust proxy', 1);
app.use(express.json());

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

// Session Configuration for Render
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
  cookie: {
    secure: true, // Always true on Render (HTTPS)
    httpOnly: true,
    sameSite: 'None', // Required for cross-site cookies
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: mongoose.connection.name,
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    touchAfter: 24 * 3600, // Only update session once per day
    autoRemove: 'interval',
    autoRemoveInterval: 10, // In minutes
  }),
  rolling: true, // Reset expiration on activity
});

// Apply session middleware
app.use(sessionMiddleware);

// Passport Middleware (must be after session middleware)
app.use(passport.initialize());
app.use(passport.session());

// Debugging middleware (remove after fixing)
app.use((req, res, next) => {
  console.log('=== SESSION DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session exists:', !!req.session);
  console.log('Session passport:', req.session.passport);
  console.log('req.user exists:', !!req.user);
  console.log('req.user email:', req.user?.email);
  console.log('isAuthenticated:', req.isAuthenticated ? req.isAuthenticated() : 'N/A');
  console.log('Cookies:', req.headers.cookie);
  console.log('===================');
  next();
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID,
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false
  });
});

// Debug session endpoint (remove after fixing)
app.get('/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
    cookies: req.headers.cookie,
    environment: process.env.NODE_ENV,
  });
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

// Use shared session with Socket.IO
io.use(sharedSession(sessionMiddleware, { 
  autoSave: true 
}));

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

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Session store: MongoDB`);
  console.log(`🔑 Session secret set: ${!!process.env.SESSION_SECRET}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_BASE_URL}`);
});

// Export for testing purposes
module.exports = { app, server, io };