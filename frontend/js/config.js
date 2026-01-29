// ===============================
// PIXEL ARENA - CONFIGURATION
// ===============================

window.CONFIG = {
  // Backend URLs (CHANGE TO YOUR REAL RAILWAY SERVICE URL)
  API_BASE_URL: "https://YOUR-BACKEND-NAME.up.railway.app/api",
  SOCKET_URL: "https://YOUR-BACKEND-NAME.up.railway.app",

  USE_MOCK: false,

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
      hit: 8
    },
    ATTACK_DURATION: {
      kick: 400,
      hit: 300
    }
  },

  // Character Definitions
  CHARACTERS: {
    cyborg: {
      id: "cyborg",
      name: "Cyborg",
      description: "Balanced fighter with equal stats",
      stats: { speed: 4, power: 8, defense: 7 },
      animations: {
        idle: { path: "assets/characters/cyborg/idle/idle", frames: 3 },
        walk: { path: "assets/characters/walk/walk", frames: 5 },
        kick: { path: "assets/characters/cyborg/kick/kick", frames: 3 },
        hit: { path: "assets/characters/cyborg/hit/hit", frames: 2 }
      }
    },

    ninja: {
      id: "ninja",
      name: "Ninja",
      description: "Fast and agile, but fragile",
      stats: { speed: 6, power: 7, defense: 5 },
      animations: {
        idle: { path: "assets/characters/cyborg/idle/idle", frames: 3 },
        walk: { path: "assets/characters/walk/walk", frames: 5 },
        kick: { path: "assets/characters/cyborg/kick/kick", frames: 3 },
        hit: { path: "assets/characters/cyborg/hit/hit", frames: 2 }
      }
    },

    warrior: {
      id: "warrior",
      name: "Warrior",
      description: "Slow but powerful and tanky",
      stats: { speed: 3, power: 9, defense: 9 },
      animations: {
        idle: { path: "assets/characters/cyborg/idle/idle", frames: 3 },
        walk: { path: "assets/characters/walk/walk", frames: 5 },
        kick: { path: "assets/characters/cyborg/kick/kick", frames: 3 },
        hit: { path: "assets/characters/cyborg/hit/hit", frames: 2 }
      }
    }
  },

  ROOM: {
    MAX_PLAYERS: 2,
    ROOM_CODE_LENGTH: 6
  },

  STORAGE_KEYS: {
    USER: "pixel_arena_user",
    TOKEN: "pixel_arena_token",
    SELECTED_CHARACTER: "pixel_arena_character",
    ROOM: "pixel_arena_room"
  }
};
