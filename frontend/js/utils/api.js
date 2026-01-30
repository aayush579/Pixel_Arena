// ===============================
// API CLIENT
// ===============================

// Bind global config
const CONFIG = window.CONFIG;

const API = {
    // ===============================
    // Helper to make HTTP requests
    // ===============================
    async request(endpoint, options = {}) {
        const { method = 'GET', body } = options;

        const headers = {};

        // 🔐 Attach auth token (ALL COMMON FORMATS)
        const token = UserStorage.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; // modern
            headers['x-auth-token'] = token;              // common express
        }

        // JSON body
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

            // 🚨 Auto logout on auth failure
            if (response.status === 401) {
                console.warn('Unauthorized — logging out');
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

    // ===============================
    // Mock request handler
    // ===============================
    async mockRequest(endpoint, options = {}) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const { method = 'GET', body } = options;

        // --- Auth ---
        if (endpoint === '/auth/login') {
            return {
                success: true,
                data: {
                    user: { id: 1, username: body.username, email: 'test@test.com' },
                    token: 'mock_token_' + Date.now(),
                },
            };
        }

        if (endpoint === '/auth/me') {
            return { success: true, data: { user: UserStorage.getUser() } };
        }

        // --- Rooms ---
        if (endpoint === '/rooms' && method === 'GET') {
            return {
                success: true,
                data: {
                    rooms: [
                        { id: 1, name: 'Room 1', host: 'player1', players: 1, maxPlayers: 2, code: 'ABC123' },
                        { id: 2, name: 'Epic Battle', host: 'gamer99', players: 1, maxPlayers: 2, code: 'XYZ789' },
                    ],
                },
            };
        }

        return { success: false, error: 'Mock endpoint not found' };
    },

    // ===============================
    // Main API dispatcher
    // ===============================
    async call(endpoint, options = {}) {
        if (CONFIG.USE_MOCK) {
            return this.mockRequest(endpoint, options);
        }
        return this.request(endpoint, options);
    },

    // ===============================
    // Auth endpoints
    // ===============================
    auth: {
        login(username, password) {
            return API.call('/auth/login', {
                method: 'POST',
                body: { username, password },
            });
        },
        me() {
            return API.call('/auth/me');
        },
    },

    // ===============================
    // Room endpoints
    // ===============================
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
