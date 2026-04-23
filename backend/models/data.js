// ===============================
// FILE-BASED DATA STORAGE
// ===============================
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../db.json');

// Initialize DB if it doesn't exist
function initDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({
            users: [],
            rooms: []
        }, null, 2));
    }
}

function readDB() {
    try {
        initDB();
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Failed to read DB:", err);
        return { users: [], rooms: [] };
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Failed to write DB:", err);
    }
}

// Memory wrapper for seamless integration with existing code
class DBWrapper {
    constructor() {
        this.gameSessions = new Map();
        this.socketConnections = new Map();
    }

    get users() {
        return readDB().users;
    }

    get rooms() {
        return readDB().rooms;
    }

    saveUsers(newUsers) {
        const data = readDB();
        data.users = newUsers;
        writeDB(data);
    }

    saveRooms(newRooms) {
        const data = readDB();
        data.rooms = newRooms;
        writeDB(data);
    }
}

const db = new DBWrapper();

// For backward compatibility with existing code that mutates arrays directly,
// we create Proxy objects that automatically save when mutated!
const usersProxy = new Proxy([], {
    get(target, prop) {
        const users = db.users;
        if (typeof users[prop] === 'function') {
            return function (...args) {
                const res = users[prop](...args);
                db.saveUsers(users);
                return res;
            }
        }
        return users[prop];
    },
    set(target, prop, value) {
        const users = db.users;
        users[prop] = value;
        db.saveUsers(users);
        return true;
    }
});

const roomsProxy = new Proxy([], {
    get(target, prop) {
        const rooms = db.rooms;
        // Intercept array methods that mutate the array
        if (typeof rooms[prop] === 'function') {
            return function (...args) {
                const res = rooms[prop](...args);
                db.saveRooms(rooms);
                return res;
            }
        }
        return rooms[prop];
    },
    set(target, prop, value) {
        const rooms = db.rooms;
        rooms[prop] = value;
        db.saveRooms(rooms);
        return true;
    }
});

// Provide a global save function so code can manually save nested mutations
const saveDatabase = () => {
    // Reading and immediately saving via proxy triggers a write
    db.saveRooms(db.rooms);
};

module.exports = {
    users: usersProxy,
    rooms: roomsProxy,
    gameSessions: db.gameSessions,
    socketConnections: db.socketConnections,
    saveDatabase
};
