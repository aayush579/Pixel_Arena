// ===============================
// ROOM MANAGEMENT ROUTES (FINAL FIXED)
// ===============================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { rooms, gameSessions } = require('../models/data');
const { authenticate } = require('../middleware/auth');

// ===============================
// GENERATE ROOM CODE
// ===============================
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===============================
// GET ALL ROOMS
// ===============================
router.get('/', (req, res) => {
    const activeRooms = rooms
        .filter(room => !room.isDeleted)
        .map(room => ({
            id: room.id,
            name: room.name,
            code: room.code,
            host: room.host,
            players: room.players.length,
            maxPlayers: room.maxPlayers,
            status: room.status,
            createdAt: room.createdAt,
        }));

    res.json({
        success: true,
        rooms: activeRooms, // ✅ FIXED
    });
});

// ===============================
// CREATE ROOM
// ===============================
router.post('/', authenticate, (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Room name is required',
            });
        }

        const newRoom = {
            id: uuidv4(),
            name: name.trim(),
            code: generateRoomCode(),
            host: req.user.username,
            hostId: req.user.id,
            players: [
                {
                    id: req.user.id,
                    username: req.user.username,
                    character: null,
                    ready: false,
                },
            ],
            maxPlayers: 2,
            status: 'waiting',
            createdAt: new Date().toISOString(),
            isDeleted: false,
        };

        rooms.push(newRoom);

        res.status(201).json({
            success: true,
            room: newRoom, // ✅ FIXED
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create room',
        });
    }
});

// ===============================
// JOIN ROOM
// ===============================
router.post('/:id/join', authenticate, (req, res) => {
    try {
        const { id } = req.params;
        const room = rooms.find(r => r.id === id && !r.isDeleted);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        if (room.players.length >= room.maxPlayers) {
            return res.status(400).json({
                success: false,
                error: 'Room is full',
            });
        }

        const existingPlayer = room.players.find(p => p.id === req.user.id);

        if (existingPlayer) {
            return res.json({
                success: true,
                room: room, // ✅ FIXED
                message: 'Already in room',
            });
        // We DO NOT push to room.players here!
        // This prevents the room from getting stuck at 2/2 if they abandon the character selection screen.
        // They will be officially added to the room when their socket connects in the lobby.

        res.json({
            success: true,
            room: room,
            message: 'Slot reserved, proceed to character selection'
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join room',
        });
    }
});

// ===============================
// LEAVE ROOM
// ===============================
router.delete('/:id/leave', authenticate, (req, res) => {
    try {
        const { id } = req.params;
        const room = rooms.find(r => r.id === id && !r.isDeleted);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        // Remove player
        room.players = room.players.filter(p => p.id !== req.user.id);

        // Handle room state
        if (room.players.length === 0) {
            room.isDeleted = true;
            gameSessions.delete(id);
        } else if (room.hostId === req.user.id) {
            room.host = room.players[0].username;
            room.hostId = room.players[0].id;
        }

        res.json({
            success: true,
            message: 'Left room successfully',
        });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to leave room',
        });
    }
});

// ===============================
// GET ROOM DETAILS
// ===============================
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const room = rooms.find(r => r.id === id && !r.isDeleted);

    if (!room) {
        return res.status(404).json({
            success: false,
            error: 'Room not found',
        });
    }

    res.json({
        success: true,
        room: room, // ✅ FIXED
    });
});

module.exports = router;
