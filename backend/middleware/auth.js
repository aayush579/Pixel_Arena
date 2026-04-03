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
        // ✅ CASE 1: NO TOKEN → GUEST USER
        // ===============================
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = {
                id: "guest_" + Date.now(),
                username: "Guest_" + Math.floor(Math.random() * 1000),
                isGuest: true
            };

            console.log("👤 Guest user connected:", req.user.username);
            return next();
        }

        // ===============================
        // ✅ CASE 2: TOKEN EXISTS → VERIFY
        // ===============================
        const token = authHeader.substring(7); // Remove 'Bearer '

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = users.find(u => u.id === decoded.id);

        // ===============================
        // ❌ INVALID USER → FALLBACK TO GUEST
        // ===============================
        if (!user) {
            req.user = {
                id: "guest_" + Date.now(),
                username: "Guest_" + Math.floor(Math.random() * 1000),
                isGuest: true
            };

            console.log("⚠️ Invalid token → fallback to guest");
            return next();
        }

        // ===============================
        // ✅ VALID USER
        // ===============================
        req.user = {
            ...user,
            isGuest: false
        };

        console.log("✅ Authenticated user:", user.username);
        next();

    } catch (error) {
        // ===============================
        // ❌ TOKEN ERROR → FALLBACK TO GUEST
        // ===============================
        console.log("⚠️ Token error → fallback to guest");

        req.user = {
            id: "guest_" + Date.now(),
            username: "Guest_" + Math.floor(Math.random() * 1000),
            isGuest: true
        };

        next();
    }
}

module.exports = { authenticate };
