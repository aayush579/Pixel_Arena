// ===============================
// LOCAL STORAGE UTILITY (FIXED)
// ===============================

const Storage = {
    // ===============================
    // SET ITEM
    // ===============================
    set(key, value) {
        try {
            // Prevent saving undefined
            if (value === undefined) {
                console.warn(`⚠️ Tried to store undefined for key: ${key}`);
                return false;
            }

            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Storage.set error:', error);
            return false;
        }
    },

    // ===============================
    // GET ITEM (IMPORTANT FIX)
    // ===============================
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);

            // ✅ Handle null / undefined safely
            if (!item || item === "undefined") {
                return defaultValue;
            }

            return JSON.parse(item);
        } catch (error) {
            console.error('Storage.get error:', error);

            // ❌ Remove corrupted data
            localStorage.removeItem(key);

            return defaultValue;
        }
    },

    // ===============================
    // REMOVE ITEM
    // ===============================
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage.remove error:', error);
            return false;
        }
    },

    // ===============================
    // CLEAR ALL
    // ===============================
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage.clear error:', error);
            return false;
        }
    },

    // ===============================
    // CHECK EXISTENCE
    // ===============================
    has(key) {
        const item = localStorage.getItem(key);
        return item !== null && item !== "undefined";
    },
};

// ===============================
// USER STORAGE HELPERS
// ===============================
const UserStorage = {

    // USER
    setUser(user) {
        return Storage.set(CONFIG.STORAGE_KEYS.USER, user);
    },

    getUser() {
        return Storage.get(CONFIG.STORAGE_KEYS.USER);
    },

    // TOKEN
    setToken(token) {
        return Storage.set(CONFIG.STORAGE_KEYS.TOKEN, token);
    },

    getToken() {
        return Storage.get(CONFIG.STORAGE_KEYS.TOKEN);
    },

    // CHARACTER
    setCharacter(characterId) {
        return Storage.set(CONFIG.STORAGE_KEYS.SELECTED_CHARACTER, characterId);
    },

    getCharacter() {
        return Storage.get(CONFIG.STORAGE_KEYS.SELECTED_CHARACTER);
    },

    // ROOM (IMPORTANT FIX)
    setRoom(room) {
        if (!room || !room.id) {
            console.warn("⚠️ Invalid room data:", room);
            return false;
        }
        return Storage.set(CONFIG.STORAGE_KEYS.ROOM, room);
    },

    getRoom() {
        const room = Storage.get(CONFIG.STORAGE_KEYS.ROOM);

        if (!room) {
            console.warn("⚠️ No room found in storage");
            return null;
        }

        return room;
    },

    // CLEAR SESSION
    clearSession() {
        Storage.remove(CONFIG.STORAGE_KEYS.USER);
        Storage.remove(CONFIG.STORAGE_KEYS.TOKEN);
        Storage.remove(CONFIG.STORAGE_KEYS.ROOM);
        Storage.remove(CONFIG.STORAGE_KEYS.SELECTED_CHARACTER);
    },

    // AUTH CHECK
    isAuthenticated() {
        return Storage.has(CONFIG.STORAGE_KEYS.TOKEN);
    },
};
