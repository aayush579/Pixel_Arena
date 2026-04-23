// ===============================
// PIXEL ARENA - CONFIGURATION
// ===============================
window.CONFIG = {
  // ===============================
  // API CONFIG
  // ===============================
  API_BASE_URL: (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10."))
      ? `http://${window.location.hostname}:3000/api`
      : "https://pixel-arena-x64j.onrender.com/api",
  SOCKET_URL: (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10."))
      ? `http://${window.location.hostname}:3000`
      : "https://pixel-arena-x64j.onrender.com",

  // ✅ FIXED: USE_MOCK lives here at top level
  USE_MOCK: false,

  // ✅ ADDED: API object so CONFIG.API.USE_MOCK also works
  //    (prevents crashes if any file uses either path)
  API: {
    USE_MOCK: false,
    BASE_URL: (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10."))
      ? `http://${window.location.hostname}:3000/api`
      : "https://pixel-arena-x64j.onrender.com/api",
    SOCKET_URL: (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10."))
      ? `http://${window.location.hostname}:3000`
      : "https://pixel-arena-x64j.onrender.com"
  },

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
  // STORAGE KEYS
  // ===============================
  STORAGE_KEYS: {
    USER: "pixel_arena_user",
    TOKEN: "pixel_arena_token",
    SELECTED_CHARACTER: "pixel_arena_character",
    ROOM: "pixel_arena_room"
  }
};
