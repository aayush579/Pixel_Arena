// ===============================
// API CLIENT
// ===============================

const CONFIG = window.CONFIG;

const API = {
    async request(endpoint, options = {}) {
        const { method = 'GET', body } = options;

        const headers = {};

        // ✅ ONLY standard Authorization header
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
                return { success: false, error: 'Unauthorized' };
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return { success: true, data };
        } catch (error) {
            console.error('API request error:', error);
            return { success: false, error: error.message };
        }
    },

    async call(endpoint, options = {}) {
        if (CONFIG.USE_MOCK) {
            return this.mockRequest(endpoint, options);
        }
        return this.request(endpoint, options);
    },

    rooms: {
        list() {
            return API.call('/rooms');
        },
        create(name) {
            return API.call('/rooms', {
                method: 'POST',
                body: { name },
            });
        },
        join(roomId) {
            return API.call(`/rooms/${roomId}/join`, { method: 'POST' });
        },
    },
};
