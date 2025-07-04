const express = require("express");
const session = require("express-session");
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

//  Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//  MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ Database connected");
  console.log("📦 Using database:", mongoose.connection.name);
});

//  Session Middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
});

//  Passport Middleware
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

//  Routes
app.use("/auth", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/skill", require("./routes/skill"));
app.use("/post", require("./routes/post"));
app.use("/invitation", require("./routes/invitation"));
app.use("/messages", require("./routes/message"));
app.use("/chat", require("./routes/chat"))

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
io.use(sharedSession(sessionMiddleware, { autoSave: true }));

// Load socket logic
require("./sockets/chatSocket")(io);

//  Start Server with Socket.IO bound
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
});
