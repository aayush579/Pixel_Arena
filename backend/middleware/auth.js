// ===============================
// AUTHENTICATION MIDDLEWARE (UPDATED)
// ===============================

const jwt = require('jsonwebtoken');
const { users } = require('../models/data');

// Authenticate JWT token OR allow guest
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // ===============================
        // ✅ CASE 1: NO TOKEN
        // ===============================
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log("⚠️ No token provided");
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        // ===============================
        // ✅ CASE 2: TOKEN EXISTS → VERIFY
        // ===============================
        const token = authHeader.substring(7); // Remove 'Bearer '

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        const user = users.find(u => u.id === decoded.id);

        // ===============================
        // ❌ INVALID USER
        // ===============================
        if (!user) {
            console.log("⚠️ Invalid token user not found");
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        // ===============================
        // ✅ VALID USER
        // ===============================
        req.user = {
            ...user,
            isGuest: user.isGuest || false
        };

        console.log("✅ Authenticated user:", user.username);
        next();

    } catch (error) {
        // ===============================
        // ❌ TOKEN ERROR
        // ===============================
        console.log("⚠️ Token verification error");
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

module.exports = { authenticate };
