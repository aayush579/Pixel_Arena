// ===============================
// SOCKET.IO EVENT HANDLERS (FINAL FIXED)
// ===============================

const { rooms, socketConnections, gameSessions, saveDatabase } = require('../models/data');

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
        // ✅ FIXED: player:selectCharacter moved OUTSIDE this handler
        // ===============================
        socket.on('room:join', ({ roomId, userId, username }) => {
            const room = rooms.find(r => r.id === roomId && !r.isDeleted);

            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            // Add player if not already in room
            const exists = room.players.find(p => p.id === userId);
            if (!exists) {
                if (room.players.length >= room.maxPlayers) {
                    socket.emit('error', { message: 'Room is already full' });
                    return;
                }
                
                room.players.push({
                    id: userId,
                    username,
                    character: null,
                    ready: false
                });
                saveDatabase();
            }

            socket.join(roomId);
            socket.roomId = roomId;
            socket.userId = userId;
            socket.username = username;

            console.log(`👤 ${username} joined room: ${room.name} (${room.players.length} players)`);
            console.log(`👥 Players in room:`, room.players.map(p => p.username));

            // ✅ Notify OTHER players that someone joined
            socket.to(roomId).emit('player:joined', {
                userId,
                username,
                players: room.players
            });

            // ✅ Send full room state to ALL players including the one who just joined
            io.to(roomId).emit('room:update', { room });
        });

        // ===============================
        // SELECT CHARACTER
        // ✅ FIXED: Now correctly OUTSIDE room:join
        //    so it registers once per connection, not per join
        // ===============================
        socket.on('player:selectCharacter', ({ roomId, character }) => {
            const room = rooms.find(r => r.id === roomId);
            if (!room) return;

            const player = room.players.find(p => p.id === socket.userId);

            if (player) {
                player.character = character;
                saveDatabase();
                console.log(`🎭 ${socket.username} selected ${character}`);

                // Broadcast to all players in room
                io.to(roomId).emit('player:characterSelected', {
                    userId: socket.userId,
                    character
                });

                // Send updated room state
                io.to(roomId).emit('room:update', { room });
            }
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
                saveDatabase();
                console.log(`✅ ${socket.username} is ${ready ? 'ready' : 'not ready'}`);

                io.to(roomId).emit('player:ready', {
                    userId: socket.userId,
                    ready
                });

                // Send updated room state
                io.to(roomId).emit('room:update', { room });
            }
        });

        // ===============================
        // GAME START
        // ===============================
        socket.on('game:start', ({ roomId }) => {
            const room = rooms.find(r => r.id === roomId);
            if (!room) return;

            console.log(`🎮 Game starting in room: ${room.name}`);
            room.status = 'playing';
            saveDatabase();

            io.to(roomId).emit('game:start', { roomId });
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
        // PLAYER ACTION (Attack/Hit)
        // ===============================
        socket.on('player:action', (data) => {
            socket.to(data.roomId).emit('player:action', {
                userId: socket.userId,
                ...data
            });
        });

        // ===============================
        // PLAYER DAMAGE
        // ===============================
        socket.on('player:damage', (data) => {
            // Relays damage to the opponent
            socket.to(data.roomId).emit('player:damage', {
                userId: socket.userId,
                targetId: data.targetId,
                damage: data.damage
            });
        });

        // ===============================
        // GAME OVER
        // ===============================
        socket.on('game:over', (data) => {
            const room = rooms.find(r => r.id === data.roomId);
            if (room) {
                room.status = 'finished';
                saveDatabase();
            }
            io.to(data.roomId).emit('game:over', {
                winnerId: data.winnerId,
                loserId: data.loserId
            });
        });

        // ===============================
        // DISCONNECT
        // ===============================
        socket.on('disconnect', () => {
            console.log(`❌ Disconnected: ${socket.id} (${socket.username})`);

            if (socket.userId) {
                socketConnections.delete(socket.userId);
            }

            if (socket.roomId) {
                const room = rooms.find(r => r.id === socket.roomId);

                if (room) {
                    room.players = room.players.filter(p => p.id !== socket.userId);
                    saveDatabase();
                    console.log(`👥 Players remaining:`, room.players.map(p => p.username));

                    socket.to(socket.roomId).emit('player:left', {
                        userId: socket.userId,
                        username: socket.username
                    });

                    // Send updated room state to remaining players
                    io.to(socket.roomId).emit('room:update', { room });

                    // Clean up empty rooms and their game sessions
                    if (room.players.length === 0) {
                        room.isDeleted = true;
                        saveDatabase();
                        gameSessions.delete(socket.roomId);
                        console.log(`🗑️ Room ${room.name} marked as deleted (empty)`);
                    }
                }
            }
        });
    });
}

module.exports = { setupSocketHandlers };
