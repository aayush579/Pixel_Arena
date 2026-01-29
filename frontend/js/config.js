// ===============================
// PIXEL ARENA - CONFIGURATION
// ===============================

window.CONFIG = {
  // ===============================
  // API CONFIG
  // ===============================
  API_BASE_URL: "https://pixelarena-production.up.railway.app/api",
  SOCKET_URL: "https://pixelarena-production.up.railway.app",
  USE_MOCK: false,

  // ===============================
  // GAME CONFIG
  // ===============================
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
      hit: 8
    },
    ATTACK_DURATION: {
      kick: 400,
      hit: 300
    }
  },

  // ===============================
  // CHARACTERS
  // ===============================
  CHARACTERS: {
    cyborg: {
      id: "cyborg",
      name: "Cyborg",
      description: "Balanced fighter with equal stats",
      stats: { speed: 4, power: 8, defense: 7 }
    },
    ninja: {
      id: "ninja",
      name: "Ninja",
      description: "Fast and agile, but fragile",
      stats: { speed: 6, power: 7, defense: 5 }
    },
    warrior: {
      id: "warrior",
      name: "Warrior",
      description: "Slow but powerful and tanky",
      stats: { speed: 3, power: 9, defense: 9 }
    }
  },

  // ===============================
  // ROOM CONFIG
  // ===============================
  ROOM: {
    MAX_PLAYERS: 2,
    ROOM_CODE_LENGTH: 6
  },

  // ===============================
  // STORAGE KEYS (IMPORTANT)
  // ===============================
  STORAGE_KEYS: {
    USER: "pixel_arena_user",
    TOKEN: "pixel_arena_token",
    SELECTED_CHARACTER: "pixel_arena_character",
    ROOM: "pixel_arena_room"
  }
};

// Make CONFIG globally accessible
var CONFIG = window.CONFIG;
