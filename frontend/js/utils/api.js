// ===============================
// API CLIENT
// ===============================

const API = {
    // Mock data for development
    mockData: {
        users: [
            { id: 1, username: 'player1', email: 'player1@test.com', password: 'password123' },
        ],
        rooms: [
            { id: 1, name: 'Room 1', host: 'player1', players: 1, maxPlayers: 2, code: 'ABC123' },
            { id: 2, name: 'Epic Battle', host: 'gamer99', players: 1, maxPlayers: 2, code: 'XYZ789' },
        ],
    },

    // Helper to make HTTP requests
    async request(endpoint, options = {}) {
        const { method = 'GET', body, headers = {} } = options;

        // Add auth token if available
        const token = UserStorage.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Add content type for JSON
        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const url = `${CONFIG.API.BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

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

    // Mock request handler
    async mockRequest(endpoint, options = {}) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const { method = 'GET', body } = options;

        // Mock authentication
        if (endpoint === '/auth/login') {
            const { username, password } = body;
            const user = this.mockData.users.find(
                u => (u.username === username || u.email === username) && u.password === password
            );

            if (user) {
                return {
                    success: true,
                    data: {
                        user: { id: user.id, username: user.username, email: user.email },
                        token: 'mock_token_' + Date.now(),
                    },
                };
            }
            return { success: false, error: 'Invalid credentials' };
        }

        if (endpoint === '/auth/signup') {
            const { username, email, password } = body;

            // Check if user exists
            const exists = this.mockData.users.find(u => u.username === username || u.email === email);
            if (exists) {
                return { success: false, error: 'User already exists' };
            }

            const newUser = { id: this.mockData.users.length + 1, username, email, password };
            this.mockData.users.push(newUser);

            return {
                success: true,
                data: {
                    user: { id: newUser.id, username: newUser.username, email: newUser.email },
                    token: 'mock_token_' + Date.now(),
                },
            };
        }

        if (endpoint === '/auth/me') {
            const user = UserStorage.getUser();
            return { success: true, data: { user } };
        }

        // Mock rooms
        if (endpoint === '/rooms' && method === 'GET') {
            return { success: true, data: { rooms: this.mockData.rooms } };
        }

        if (endpoint === '/rooms' && method === 'POST') {
            const { name } = body;
            const user = UserStorage.getUser();
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const newRoom = {
                id: this.mockData.rooms.length + 1,
                name,
                host: user.username,
                players: 1,
                maxPlayers: 2,
                code,
            };

            this.mockData.rooms.push(newRoom);
            return { success: true, data: { room: newRoom } };
        }

        if (endpoint.startsWith('/rooms/') && endpoint.endsWith('/join')) {
            const roomId = parseInt(endpoint.split('/')[2]);
            const room = this.mockData.rooms.find(r => r.id === roomId);

            if (room && room.players < room.maxPlayers) {
                room.players++;
                return { success: true, data: { room } };
            }
            return { success: false, error: 'Room is full or not found' };
        }

        return { success: false, error: 'Endpoint not found' };
    },

    // Main API methods
    async call(endpoint, options = {}) {
        if (CONFIG.API.USE_MOCK) {
            return this.mockRequest(endpoint, options);
        }
        return this.request(endpoint, options);
    },

    // Auth endpoints
    auth: {
        async login(username, password) {
            return API.call('/auth/login', {
                method: 'POST',
                body: { username, password },
            });
        },

        async signup(username, email, password) {
            return API.call('/auth/signup', {
                method: 'POST',
                body: { username, email, password },
            });
        },

        async logout() {
            return API.call('/auth/logout', { method: 'POST' });
        },

        async me() {
            return API.call('/auth/me');
        },
    },

    // Room endpoints
    rooms: {
        async list() {
            return API.call('/rooms');
        },

        async create(name) {
            return API.call('/rooms', {
                method: 'POST',
                body: { name },
            });
        },

        async join(roomId) {
            return API.call(`/rooms/${roomId}/join`, { method: 'POST' });
        },

        async leave(roomId) {
            return API.call(`/rooms/${roomId}/leave`, { method: 'DELETE' });
        },

        async get(roomId) {
            return API.call(`/rooms/${roomId}`);
        },
    },
};
