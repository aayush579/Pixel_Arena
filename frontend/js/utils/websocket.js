// ===============================
// WEBSOCKET MANAGER
// ===============================

class WebSocketManager {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
    }

    // Connect to WebSocket server
    connect(roomId) {
        if (CONFIG.API.USE_MOCK) {
            console.log('🔌 Using mock WebSocket');
            this.connected = true;
            this.emit('connected');
            return;
        }

        const token = UserStorage.getToken();
        const url = `${CONFIG.API.WS_URL}?token=${token}&room=${roomId}`;

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.emit(message.type, message.data);
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('🔌 WebSocket error:', error);
                this.emit('error', error);
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.connected = false;
                this.emit('disconnected');
                this.attemptReconnect(roomId);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    }

    // Disconnect from WebSocket
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }

    // Attempt to reconnect
    attemptReconnect(roomId) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect(roomId);
            }, this.reconnectDelay);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.emit('reconnect_failed');
        }
    }

    // Send message to server
    send(type, data) {
        if (CONFIG.API.USE_MOCK) {
            console.log('📤 Mock WebSocket send:', type, data);
            // Simulate echo back for testing
            setTimeout(() => {
                this.emit(type, data);
            }, 100);
            return;
        }

        if (this.connected && this.ws) {
            const message = JSON.stringify({ type, data });
            this.ws.send(message);
        } else {
            console.warn('WebSocket not connected');
        }
    }

    // Register event listener
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Remove event listener
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    // Emit event to listeners
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Clear all listeners
    clearListeners() {
        this.listeners = {};
    }
}

// Global WebSocket instance
const wsManager = new WebSocketManager();
