// ===============================
// SOCKET.IO CLIENT MANAGER (FINAL FIXED)
// ===============================

const CONFIG = window.CONFIG;

class WebSocketManager {
    constructor() {
        this.socket = null;
    }

    // ===============================
    // CONNECT
    // ===============================
    connect() {
        const socketUrl = CONFIG.API?.SOCKET_URL || CONFIG.SOCKET_URL;
        this.socket = io(socketUrl, {
            transports: ["websocket"]
        });

        this.socket.on("connect", () => {
            console.log("✅ Connected:", this.socket.id);

            const user = UserStorage.getUser();

            // 🔥 Authenticate
            this.socket.emit("authenticate", {
                userId: user.id,
                username: user.username
            });
        });

        this.socket.on("disconnect", () => {
            console.log("❌ Disconnected");
        });
    }

    // ===============================
    // JOIN ROOM
    // ===============================
    joinRoom(roomId) {
        const user = UserStorage.getUser();

        this.socket.emit("room:join", {
            roomId,
            userId: user.id,
            username: user.username
        });
    }

    // ===============================
    // SEND EVENT
    // ===============================
    send(event, data) {
        if (!this.socket) {
            console.warn("⚠️ Socket not connected");
            return;
        }
        this.socket.emit(event, data);
    }

    // ===============================
    // LISTEN EVENTS
    // ===============================
    on(event, callback) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    // ===============================
    // DISCONNECT
    // ===============================
    disconnect() {
        if (this.socket) this.socket.disconnect();
    }
}

// ===============================
// GLOBAL INSTANCE (IMPORTANT)
// ===============================
window.wsManager = new WebSocketManager();
