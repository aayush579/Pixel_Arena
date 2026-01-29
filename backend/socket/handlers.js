// ===============================
// SOCKET.IO EVENT HANDLERS
// ===============================

const { rooms, socketConnections, gameSessions } = require('../models/data');

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Store socket connection
        socket.userId = null;
        socket.roomId = null;

        // ===============================
        // AUTHENTICATION
        // ===============================
        socket.on('authenticate', (data) => {
            const { userId, username } = data;
            socket.userId = userId;
            socket.username = username;
            socketConnections.set(userId, socket.id);

            console.log(`✅ User authenticated: ${username} (${userId})`);

            socket.emit('authenticated', { success: true });
        });

        // ===============================
        // ROOM MANAGEMENT
        // ===============================

        // Join room
        socket.on('room:join', (data) => {
            const { roomId, userId, username } = data;
            const room = rooms.find(r => r.id === roomId && !r.isDeleted);

            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            // Join socket.io room
            socket.join(roomId);
            socket.roomId = roomId;
            socket.userId = userId;
            socket.username = username;

            console.log(`👤 ${username} joined room: ${room.name}`);

            // Notify other players
            socket.to(roomId).emit('player:joined', {
                userId,
                username,
                players: room.players,
            });

            // Send current room state to joining player
            socket.emit('room:state', { room });
        });

        // Leave room
        socket.on('room:leave', () => {
            if (socket.roomId) {
                handlePlayerLeave(socket);
            }
        });

        // Player ready status
        socket.on('player:ready', (data) => {
            const { roomId, ready } = data;
            const room = rooms.find(r => r.id === roomId);

            if (!room) return;

            // Update player ready status
            const player = room.players.find(p => p.id === socket.userId);
            if (player) {
                player.ready = ready;

                // Broadcast to room
                io.to(roomId).emit('player:ready', {
                    userId: socket.userId,
                    username: socket.username,
                    ready,
                });

                console.log(`${ready ? '✅' : '❌'} ${socket.username} is ${ready ? 'ready' : 'not ready'}`);

                // Check if all players are ready
                const allReady = room.players.every(p => p.ready) && room.players.length === room.maxPlayers;

                if (allReady) {
                    room.status = 'ready';
                    io.to(roomId).emit('room:ready', { room });
                }
            }
        });

        // Start game
        socket.on('game:start', (data) => {
            const { roomId } = data;
            const room = rooms.find(r => r.id === roomId);

            if (!room) return;

            // Only host can start
            if (room.hostId !== socket.userId) {
                socket.emit('error', { message: 'Only host can start the game' });
                return;
            }

            // Check if all players are ready
            const allReady = room.players.every(p => p.ready) && room.players.length === room.maxPlayers;

            if (!allReady) {
                socket.emit('error', { message: 'Not all players are ready' });
                return;
            }

            room.status = 'playing';

            // Initialize game session
            const gameSession = {
                roomId,
                players: room.players.map(p => ({
                    id: p.id,
                    username: p.username,
                    character: p.character,
                    health: 100,
                    position: { x: 0, y: 0 },
                    state: 'idle',
                })),
                startedAt: new Date().toISOString(),
            };

            gameSessions.set(roomId, gameSession);

            console.log(`🎮 Game started in room: ${room.name}`);

            // Notify all players
            io.to(roomId).emit('game:start', { gameSession });
        });

        // ===============================
        // GAME ACTIONS
        // ===============================

        // Player movement
        socket.on('player:move', (data) => {
            const { roomId, position, facing, state } = data;

            // Broadcast to other players in room
            socket.to(roomId).emit('player:move', {
                userId: socket.userId,
                position,
                facing,
                state,
            });
        });

        // Player attack
        socket.on('player:attack', (data) => {
            const { roomId, attackType, position } = data;

            console.log(`⚔️ ${socket.username} attacked: ${attackType}`);

            // Broadcast to other players
            socket.to(roomId).emit('player:attack', {
                userId: socket.userId,
                attackType,
                position,
                timestamp: Date.now(),
            });
        });

        // Player hit (damage)
        socket.on('player:hit', (data) => {
            const { roomId, targetId, damage } = data;
            const gameSession = gameSessions.get(roomId);

            if (!gameSession) return;

            // Update target health
            const targetPlayer = gameSession.players.find(p => p.id === targetId);
            if (targetPlayer) {
                targetPlayer.health = Math.max(0, targetPlayer.health - damage);

                console.log(`💥 ${targetPlayer.username} took ${damage} damage (${targetPlayer.health} HP remaining)`);

                // Broadcast damage event
                io.to(roomId).emit('player:damaged', {
                    targetId,
                    damage,
                    health: targetPlayer.health,
                });

                // Check for game over
                if (targetPlayer.health <= 0) {
                    const winner = gameSession.players.find(p => p.id !== targetId);

                    console.log(`🏆 ${winner.username} wins!`);

                    io.to(roomId).emit('game:over', {
                        winner: {
                            id: winner.id,
                            username: winner.username,
                        },
                        loser: {
                            id: targetPlayer.id,
                            username: targetPlayer.username,
                        },
                    });

                    // Clean up game session
                    gameSessions.delete(roomId);

                    // Update room status
                    const room = rooms.find(r => r.id === roomId);
                    if (room) {
                        room.status = 'finished';
                    }
                }
            }
        });

        // ===============================
        // DISCONNECT
        // ===============================
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);

            if (socket.userId) {
                socketConnections.delete(socket.userId);
            }

            if (socket.roomId) {
                handlePlayerLeave(socket);
            }
        });

        // ===============================
        // HELPER FUNCTIONS
        // ===============================
        function handlePlayerLeave(socket) {
            const room = rooms.find(r => r.id === socket.roomId);

            if (room) {
                // Remove player from room
                room.players = room.players.filter(p => p.id !== socket.userId);

                console.log(`👋 ${socket.username} left room: ${room.name}`);

                // Notify other players
                socket.to(socket.roomId).emit('player:left', {
                    userId: socket.userId,
                    username: socket.username,
                });

                // If room is empty, mark as deleted
                if (room.players.length === 0) {
                    room.isDeleted = true;
                    gameSessions.delete(socket.roomId);
                } else if (room.hostId === socket.userId) {
                    // Transfer host
                    room.host = room.players[0].username;
                    room.hostId = room.players[0].id;

                    io.to(socket.roomId).emit('host:changed', {
                        newHost: room.players[0],
                    });
                }
            }

            socket.leave(socket.roomId);
            socket.roomId = null;
        }
    });

    return io;
}

module.exports = { setupSocketHandlers };
