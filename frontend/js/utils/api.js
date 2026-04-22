// ===============================
// API CLIENT (FIXED)
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
            console.log(`🔍 API [${method} ${endpoint}] raw response:`, JSON.stringify(data));
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
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

            console.log("🏗️ Create room res:", JSON.stringify(res));

            if (res.success) {
                // Try all possible locations the room could be
                const roomData = res.data?.data || res.data;
                console.log("🏗️ Extracted roomData:", JSON.stringify(roomData));

                if (roomData && roomData.id) {
                    UserStorage.setRoom(roomData);
                    console.log("✅ Room stored:", roomData);
                } else {
                    console.warn("⚠️ Could not extract room:", res);
                }
            }
            return res;
        },

        async join(roomId) {
            const res = await API.call(`/rooms/${roomId}/join`, {
                method: 'POST'
            });

            console.log("🚪 Join room res:", JSON.stringify(res));

            if (res.success) {
                // Try all possible locations the room could be
                const roomData = res.data?.data || res.data;
                console.log("🚪 Extracted roomData:", JSON.stringify(roomData));

                if (roomData && roomData.id) {
                    UserStorage.setRoom(roomData);
                    console.log("✅ Joined room stored:", roomData);
                } else {
                    console.warn("⚠️ Could not extract room:", res);
                }
            }
            return res;
        }
    }
};
