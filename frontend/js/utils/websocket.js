// ===============================
// SOCKET.IO CLIENT MANAGER
// ===============================

import { io } from "socket.io-client";

class WebSocketManager {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io("https://pixel-arena-x64j.onrender.com", {
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

    joinRoom(roomId) {
        const user = UserStorage.getUser();

        this.socket.emit("room:join", {
            roomId,
            userId: user.id,
            username: user.username
        });
    }

    send(event, data) {
        this.socket.emit(event, data);
    }

    on(event, callback) {
        this.socket.on(event, callback);
    }

    disconnect() {
        if (this.socket) this.socket.disconnect();
    }
}

const wsManager = new WebSocketManager();
export default wsManager;
