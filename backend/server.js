// ===============================
// MAIN SERVER FILE
// ===============================

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Import routes and handlers
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const { setupSocketHandlers } = require('./socket/handlers');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIO(server, {
    cors: {
        origin: '*', // In production, specify your frontend URL
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('');
    console.log('🎮 ================================');
    console.log('🎮  PIXEL ARENA SERVER');
    console.log('🎮 ================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        console.log(`🌍 Public URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
        console.log(`🔌 WebSocket: wss://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    } else {
        console.log(`🌐 HTTP: http://localhost:${PORT}`);
        console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    }

    console.log('🎮 ================================');
    console.log('');
});


// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = { app, server, io };
