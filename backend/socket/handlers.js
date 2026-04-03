// ===============================
// SOCKET.IO EVENT HANDLERS (FINAL)
// ===============================

const { rooms, socketConnections, gameSessions } = require('../models/data');

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        socket.userId = null;
        socket.username = null;
        socket.roomId = null;

        // ===============================
        // AUTHENTICATE USER
        // ===============================
        socket.on('authenticate', ({ userId, username }) => {
            socket.userId = userId;
            socket.username = username;

            socketConnections.set(userId, socket.id);

            console.log(`✅ Authenticated: ${username}`);
        });

        // ===============================
        // JOIN ROOM
        // ===============================
        socket.on('room:join', ({ roomId, userId, username }) => {
            const room = rooms.find(r => r.id === roomId && !r.isDeleted);

            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }
            // ===============================
// SELECT CHARACTER
// ===============================
socket.on('player:selectCharacter', ({ roomId, character }) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.userId);

    if (player) {
        player.character = character;

        console.log(`🎭 ${socket.username} selected ${character}`);

        // Broadcast to all players
        io.to(roomId).emit('player:characterSelected', {
            userId: socket.userId,
            character
        });

        // Send updated room
        io.to(roomId).emit('room:update', { room });
    }
});

            // ✅ Add player if not exists
            const exists = room.players.find(p => p.id === userId);
            if (!exists) {
                room.players.push({
                    id: userId,
                    username,
                    ready: false
                });
            }

            socket.join(roomId);
            socket.roomId = roomId;
            socket.userId = userId;
            socket.username = username;

            console.log(`👤 ${username} joined ${room.name}`);

            // Notify others
            socket.to(roomId).emit('player:joined', {
                userId,
                username,
                players: room.players
            });

            // Send full state
            io.to(roomId).emit('room:update', { room });
        });

        // ===============================
        // PLAYER READY
        // ===============================
        socket.on('player:ready', ({ roomId, ready }) => {
            const room = rooms.find(r => r.id === roomId);
            if (!room) return;

            const player = room.players.find(p => p.id === socket.userId);
            if (player) {
                player.ready = ready;

                io.to(roomId).emit('player:ready', {
                    userId: socket.userId,
                    ready
                });
            }
        });

        // ===============================
        // PLAYER MOVE
        // ===============================
        socket.on('player:move', (data) => {
            socket.to(data.roomId).emit('player:move', {
                userId: socket.userId,
                ...data
            });
        });

        // ===============================
        // DISCONNECT
        // ===============================
        socket.on('disconnect', () => {
            console.log(`❌ Disconnected: ${socket.id}`);

            if (socket.roomId) {
                const room = rooms.find(r => r.id === socket.roomId);

                if (room) {
                    room.players = room.players.filter(p => p.id !== socket.userId);

                    socket.to(socket.roomId).emit('player:left', {
                        userId: socket.userId
                    });
                }
            }
        });
    });
}

module.exports = { setupSocketHandlers };
