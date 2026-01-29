// ===============================
// PIXEL ARENA - CONFIGURATION
// ===============================

const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:3000/api', // Change this when backend is ready
        WS_URL: 'ws://localhost:3000', // WebSocket URL
        USE_MOCK: true, // Set to false when backend is ready
    },

    // Game Configuration
    GAME: {
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 400,
        FPS: 60,
        PLAYER_SPEED: 4,
        PLAYER_WIDTH: 48,
        PLAYER_HEIGHT: 64,
        PLAYER_START_HEALTH: 100,
        ATTACK_DAMAGE: {
            kick: 10,
            hit: 8,
        },
        ATTACK_DURATION: {
            kick: 400,
            hit: 300,
        },
    },

    // Character Definitions
    CHARACTERS: {
        cyborg: {
            id: 'cyborg',
            name: 'Cyborg',
            description: 'Balanced fighter with equal stats',
            stats: {
                speed: 4,
                power: 8,
                defense: 7,
            },
            animations: {
                idle: { path: 'assets/characters/cyborg/idle/idle', frames: 3 },
                walk: { path: 'assets/characters/walk/walk', frames: 5 },
                kick: { path: 'assets/characters/cyborg/kick/kick', frames: 3 },
                hit: { path: 'assets/characters/cyborg/hit/hit', frames: 2 },
            },
        },
        ninja: {
            id: 'ninja',
            name: 'Ninja',
            description: 'Fast and agile, but fragile',
            stats: {
                speed: 6,
                power: 7,
                defense: 5,
            },
            animations: {
                // Using cyborg assets as placeholder
                idle: { path: 'assets/characters/cyborg/idle/idle', frames: 3 },
                walk: { path: 'assets/characters/walk/walk', frames: 5 },
                kick: { path: 'assets/characters/cyborg/kick/kick', frames: 3 },
                hit: { path: 'assets/characters/cyborg/hit/hit', frames: 2 },
            },
        },
        warrior: {
            id: 'warrior',
            name: 'Warrior',
            description: 'Slow but powerful and tanky',
            stats: {
                speed: 3,
                power: 9,
                defense: 9,
            },
            animations: {
                // Using cyborg assets as placeholder
                idle: { path: 'assets/characters/cyborg/idle/idle', frames: 3 },
                walk: { path: 'assets/characters/walk/walk', frames: 5 },
                kick: { path: 'assets/characters/cyborg/kick/kick', frames: 3 },
                hit: { path: 'assets/characters/cyborg/hit/hit', frames: 2 },
            },
        },
    },

    // Room Configuration
    ROOM: {
        MAX_PLAYERS: 2,
        ROOM_CODE_LENGTH: 6,
    },

    // Storage Keys
    STORAGE_KEYS: {
        USER: 'pixel_arena_user',
        TOKEN: 'pixel_arena_token',
        SELECTED_CHARACTER: 'pixel_arena_character',
        ROOM: 'pixel_arena_room',
    },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
