// ===============================
// FILE-BASED DATA STORAGE (FIXED)
// ===============================
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../db.json');

// In-memory state
let memoryDB = {
    users: [],
    rooms: []
};

// Initialize and load DB
function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2));
    } else {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(data);
            if (parsed.users) memoryDB.users = parsed.users;
            if (parsed.rooms) memoryDB.rooms = parsed.rooms;
        } catch (err) {
            console.error("Failed to read DB:", err);
        }
    }
}

// Load DB immediately
loadDB();

// Save DB function
function saveDatabase() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2));
    } catch (err) {
        console.error("Failed to write DB:", err);
    }
}

// Proxy to auto-save when array methods like push() are called on the root arrays
function createAutoSaveArray(arr) {
    return new Proxy(arr, {
        get(target, prop) {
            const val = target[prop];
            if (typeof val === 'function') {
                return function (...args) {
                    const res = val.apply(target, args);
                    // Only save on mutating methods
                    if (['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop)) {
                        saveDatabase();
                    }
                    return res;
                }
            }
            return val;
        },
        set(target, prop, value) {
            target[prop] = value;
            saveDatabase();
            return true;
        }
    });
}

const usersProxy = createAutoSaveArray(memoryDB.users);
const roomsProxy = createAutoSaveArray(memoryDB.rooms);

const gameSessions = new Map();
const socketConnections = new Map();

module.exports = {
    users: usersProxy,
    rooms: roomsProxy,
    gameSessions,
    socketConnections,
    saveDatabase // Used to manually save when nested properties like room.players are mutated
};
