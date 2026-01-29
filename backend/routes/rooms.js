// ===============================
// ROOM MANAGEMENT ROUTES
// ===============================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { rooms } = require('../models/data');
const { authenticate } = require('../middleware/auth');

// Generate room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get all active rooms
router.get('/', (req, res) => {
    // Filter out full rooms or return all
    const activeRooms = rooms.filter(room => !room.isDeleted).map(room => ({
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
        data: activeRooms,
    });
});

// Create new room
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
            status: 'waiting', // waiting, ready, playing, finished
            createdAt: new Date().toISOString(),
            isDeleted: false,
        };

        rooms.push(newRoom);

        res.status(201).json({
            success: true,
            data: newRoom,
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create room',
        });
    }
});

// Join room
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

        // Check if room is full
        if (room.players.length >= room.maxPlayers) {
            return res.status(400).json({
                success: false,
                error: 'Room is full',
            });
        }

        // Check if user is already in room
        const existingPlayer = room.players.find(p => p.id === req.user.id);
        if (existingPlayer) {
            return res.json({
                success: true,
                data: room,
                message: 'Already in room',
            });
        }

        // Add player to room
        room.players.push({
            id: req.user.id,
            username: req.user.username,
            character: null,
            ready: false,
        });

        res.json({
            success: true,
            data: room,
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join room',
        });
    }
});

// Leave room
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

        // Remove player from room
        room.players = room.players.filter(p => p.id !== req.user.id);

        // If room is empty, mark as deleted
        if (room.players.length === 0) {
            room.isDeleted = true;
        } else if (room.hostId === req.user.id && room.players.length > 0) {
            // Transfer host to next player
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

// Get room details
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
        data: room,
    });
});

module.exports = router;
