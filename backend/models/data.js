// ===============================
// IN-MEMORY DATA STORAGE
// ===============================
// Note: In production, use a real database (MongoDB, PostgreSQL, etc.)

// Users array
const users = [];

// Rooms array
const rooms = [];

// Active game sessions
const gameSessions = new Map();

// Socket connections
const socketConnections = new Map(); // userId -> socketId

module.exports = {
    users,
    rooms,
    gameSessions,
    socketConnections,
};
