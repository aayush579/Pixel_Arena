// ===============================
// API CLIENT (FINAL FIXED)
// ===============================
const CONFIG = window.CONFIG;
const API = {
    // ===============================
    // MAIN REQUEST FUNCTION
    // ===============================
    async request(endpoint, options = {}) {
        const { method = 'GET', body } = options;
        const headers = {};
        const token = UserStorage.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (body) {
            headers['Content-Type'] = 'application/json';
        }
        try {
            const url = `${CONFIG.API_BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
            if (response.status === 401) {
                UserStorage.clearSession();
                window.location.href = '../index.html';
                return { success: false };
            }
            const data = await response.json();
            console.log(`🔍 API [${method} ${endpoint}]:`, JSON.stringify(data));
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            // ✅ Return the raw server response as-is inside data
            return { success: true, data };
        } catch (error) {
            console.error('API error:', error);
            return { success: false, error: error.message };
        }
    },

    // ===============================
    // CALL WRAPPER
    // ===============================
    async call(endpoint, options = {}) {
        if (CONFIG.USE_MOCK) {
            return this.mockRequest(endpoint, options);
        }
        return this.request(endpoint, options);
    },

    // ===============================
    // HELPER: Extract room from any response shape
    // Backend can return: { data: room } or { data: { data: room } }
    // ===============================
    extractRoom(res) {
        if (!res.success) return null;
        const d = res.data;
        // Shape 1: { success, data: { id, name, ... } }  ← direct room
        if (d && d.id) return d;
        // Shape 2: { success, data: { data: { id, name, ... } } }
        if (d && d.data && d.data.id) return d.data;
        return null;
    },

    // ===============================
    // HELPER: Extract rooms array from any response shape
    // Backend returns: { success, rooms: [...] } or { success, data: [...] }
    // ===============================
    extractRooms(res) {
        if (!res.success) return [];
        const d = res.data;
        // Shape 1: { success:true, rooms:[...] }  ← your backend's actual shape
        if (d && Array.isArray(d.rooms)) return d.rooms;
        // Shape 2: { success:true, data:[...] }
        if (d && Array.isArray(d.data)) return d.data;
        // Shape 3: data is directly the array
        if (Array.isArray(d)) return d;
        return [];
    },

    // ===============================
    // ROOM APIs
    // ===============================
    rooms: {
        async list() {
            return API.call('/rooms');
        },

        async create(name) {
            const res = await API.call('/rooms', {
                method: 'POST',
                body: { name },
            });

            if (res.success) {
                const roomData = API.extractRoom(res);
                if (roomData) {
                    UserStorage.setRoom(roomData);
                    console.log("✅ Room created & stored:", JSON.stringify(roomData));
                } else {
                    console.warn("⚠️ Could not extract room from create response:", res);
                }
            }
            return res;
        },

        async join(roomId) {
            const res = await API.call(`/rooms/${roomId}/join`, {
                method: 'POST'
            });

            if (res.success) {
                const roomData = API.extractRoom(res);
                if (roomData) {
                    UserStorage.setRoom(roomData);
                    console.log("✅ Room joined & stored:", JSON.stringify(roomData));
                } else {
                    console.warn("⚠️ Could not extract room from join response:", res);
                }
            }
            return res;
        }
    }
};
