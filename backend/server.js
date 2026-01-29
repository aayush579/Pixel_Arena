// ===============================
// MAIN SERVER FILE
// ===============================

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Import routes and handlers
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const { setupSocketHandlers } = require("./socket/handlers");

// ===============================
// APP + SERVER INIT
// ===============================

const app = express();
const server = http.createServer(app);

// ===============================
// MANUAL CORS (FINAL FIX)
// ===============================

app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Allow Vercel (prod + previews) and localhost
    if (
        origin &&
        (origin.endsWith(".vercel.app") ||
            origin === "http://localhost:3000" ||
            origin === "http://localhost:5173")
    ) {
        res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// ===============================
// BODY PARSERS
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// REQUEST LOGGING
// ===============================

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req, res) => {
    res.status(200).send("🎮 Pixel Arena Backend is Live 🚀");
});

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
    });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        error: err.message || "Internal server error",
    });
});

// ===============================
// SOCKET.IO SETUP (SIMPLE & SAFE)
// ===============================

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

setupSocketHandlers(io);

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("");
    console.log("🎮 ================================");
    console.log("🎮  PIXEL ARENA SERVER");
    console.log("🎮 ================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("🎮 ================================");
    console.log("");
});

// ===============================
// GRACEFUL SHUTDOWN
// ===============================

process.on("SIGTERM", () => {
    console.log("SIGTERM received: closing server");
    server.close(() => {
        console.log("HTTP server closed");
    });
});

module.exports = { app, server, io };
