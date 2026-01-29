// ===============================
// AUTHENTICATION ROUTES
// ===============================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../models/data');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required',
            });
        }

        // Check if user already exists
        const existingUser = users.find(
            u => u.username === username || u.email === email
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Username or email already exists',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const { password: _, ...userData } = newUser;

        res.status(201).json({
            success: true,
            data: {
                user: userData,
                token,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create account',
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required',
            });
        }

        // Find user (can login with username or email)
        const user = users.find(
            u => u.username === username || u.email === username
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const { password: _, ...userData } = user;

        res.json({
            success: true,
            data: {
                user: userData,
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
        });
    }
});

// Get current user (protected route)
router.get('/me', authenticate, (req, res) => {
    const { password, ...userData } = req.user;

    res.json({
        success: true,
        data: userData,
    });
});

// Logout (client-side token removal, but we can track it here)
router.post('/logout', authenticate, (req, res) => {
    // In a real app, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

module.exports = router;
