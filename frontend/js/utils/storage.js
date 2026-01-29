// ===============================
// LOCAL STORAGE UTILITY
// ===============================

const Storage = {
    // Set item in localStorage
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Storage.set error:', error);
            return false;
        }
    },

    // Get item from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage.get error:', error);
            return defaultValue;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage.remove error:', error);
            return false;
        }
    },

    // Clear all localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage.clear error:', error);
            return false;
        }
    },

    // Check if key exists
    has(key) {
        return localStorage.getItem(key) !== null;
    },
};

// User-specific helpers
const UserStorage = {
    setUser(user) {
        return Storage.set(CONFIG.STORAGE_KEYS.USER, user);
    },

    getUser() {
        return Storage.get(CONFIG.STORAGE_KEYS.USER);
    },

    setToken(token) {
        return Storage.set(CONFIG.STORAGE_KEYS.TOKEN, token);
    },

    getToken() {
        return Storage.get(CONFIG.STORAGE_KEYS.TOKEN);
    },

    setCharacter(characterId) {
        return Storage.set(CONFIG.STORAGE_KEYS.SELECTED_CHARACTER, characterId);
    },

    getCharacter() {
        return Storage.get(CONFIG.STORAGE_KEYS.SELECTED_CHARACTER);
    },

    setRoom(room) {
        return Storage.set(CONFIG.STORAGE_KEYS.ROOM, room);
    },

    getRoom() {
        return Storage.get(CONFIG.STORAGE_KEYS.ROOM);
    },

    clearSession() {
        Storage.remove(CONFIG.STORAGE_KEYS.USER);
        Storage.remove(CONFIG.STORAGE_KEYS.TOKEN);
        Storage.remove(CONFIG.STORAGE_KEYS.ROOM);
    },

    isAuthenticated() {
        return Storage.has(CONFIG.STORAGE_KEYS.TOKEN);
    },
};
