// ===============================
// HOME PAGE LOGIC
// ===============================

// Check authentication
if (!UserStorage.isAuthenticated()) {
    window.location.href = '../index.html';
}

// DOM Elements
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const createRoomBtn = document.getElementById('createRoomBtn');
const quickPlayBtn = document.getElementById('quickPlayBtn');
const searchInput = document.getElementById('searchInput');
const roomsList = document.getElementById('roomsList');
const emptyState = document.getElementById('emptyState');
const createRoomModal = document.getElementById('createRoomModal');
const createRoomForm = document.getElementById('createRoomForm');
const roomNameInput = document.getElementById('roomName');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Get user data
const user = UserStorage.getUser();
userName.textContent = user.username;

// Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Loading
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Logout
logoutBtn.addEventListener('click', () => {
    UserStorage.clearSession();
    showToast('Logged out successfully');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
});

// ===============================
// LOAD ROOMS (FIXED)
// ===============================
async function loadRooms() {
    showLoading();

    try {
        const response = await API.rooms.list();
        console.log('Rooms API response:', response);

        const rooms = Array.isArray(response?.data?.rooms)
            ? response.data.rooms
            : [];

        displayRooms(rooms);
    } catch (error) {
        console.error('Load rooms error:', error);
        displayRooms([]);
        showToast('Failed to load rooms', 'error');
    } finally {
        hideLoading();
    }
}

// ===============================
// DISPLAY ROOMS (FIXED)
// ===============================
function displayRooms(rooms) {
    roomsList.innerHTML = '';

    if (!Array.isArray(rooms) || rooms.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    rooms.forEach(room => {
        const roomCard = createRoomCard(room);
        roomsList.appendChild(roomCard);
    });
}

// ===============================
// ROOM CARD
// ===============================
function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card fade-in';

    const isFull = room.players >= room.maxPlayers;
    const statusClass = isFull ? 'full' : 'open';
    const statusText = isFull ? 'Full' : 'Open';

    card.innerHTML = `
        <div class="room-header">
            <h4 class="room-name">${room.name}</h4>
            <span class="room-status ${statusClass}">${statusText}</span>
        </div>
        <div class="room-info">
            <div class="room-info-item">
                <span class="room-info-label">Host:</span>
                <span class="room-info-value">${room.host}</span>
            </div>
            <div class="room-info-item">
                <span class="room-info-label">Players:</span>
                <span class="room-info-value">${room.players}/${room.maxPlayers}</span>
            </div>
            <div class="room-info-item">
                <span class="room-info-label">Room Code:</span>
                <span class="room-info-value">${room.code}</span>
            </div>
        </div>
        <div class="room-footer">
            <button class="btn ${isFull ? 'btn-secondary' : 'btn-success'}"
                ${isFull ? 'disabled' : ''}>
                ${isFull ? 'Room Full' : 'Join Room'}
            </button>
        </div>
    `;

    if (!isFull) {
        card.querySelector('.btn')
            .addEventListener('click', () => joinRoom(room));
    }

    return card;
}

// ===============================
// JOIN ROOM
// ===============================
async function joinRoom(room) {
    showLoading();

    try {
        const response = await API.rooms.join(room.id);

        if (response.success) {
            UserStorage.setRoom(response.data.room);
            showToast('Joined room successfully!');
            setTimeout(() => {
                window.location.href = 'character-select.html';
            }, 500);
        } else {
            showToast(response.error || 'Failed to join room', 'error');
        }
    } catch (error) {
        console.error('Join room error:', error);
        showToast('An error occurred', 'error');
    } finally {
        hideLoading();
    }
}

// ===============================
// CREATE ROOM MODAL
// ===============================
createRoomBtn.addEventListener('click', () => {
    createRoomModal.classList.add('active');
    roomNameInput.focus();
});

cancelCreateBtn.addEventListener('click', () => {
    createRoomModal.classList.remove('active');
    createRoomForm.reset();
});

createRoomModal.addEventListener('click', (e) => {
    if (e.target === createRoomModal) {
        createRoomModal.classList.remove('active');
        createRoomForm.reset();
    }
});

// ===============================
// CREATE ROOM
// ===============================
createRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const roomName = roomNameInput.value.trim();
    if (!roomName) {
        showToast('Please enter a room name', 'error');
        return;
    }

    showLoading();
    createRoomModal.classList.remove('active');

    try {
        const response = await API.rooms.create(roomName);

        if (response.success) {
            UserStorage.setRoom(response.data.room);
            showToast('Room created successfully!');
            setTimeout(() => {
                window.location.href = 'character-select.html';
            }, 500);
        } else {
            showToast(response.error || 'Failed to create room', 'error');
        }
    } catch (error) {
        console.error('Create room error:', error);
        showToast('An error occurred', 'error');
    } finally {
        hideLoading();
        createRoomForm.reset();
    }
});

// ===============================
// QUICK PLAY (FIXED)
// ===============================
quickPlayBtn.addEventListener('click', async () => {
    showLoading();

    try {
        const response = await API.rooms.list();

        const rooms = Array.isArray(response?.data?.rooms)
            ? response.data.rooms
            : [];

        const availableRooms = rooms.filter(
            room => room.players < room.maxPlayers
        );

        if (availableRooms.length > 0) {
            await joinRoom(availableRooms[0]);
        } else {
            hideLoading();
            showToast('No available rooms. Create one!', 'warning');
        }
    } catch (error) {
        hideLoading();
        console.error('Quick play error:', error);
        showToast('An error occurred', 'error');
    }
});

// ===============================
// SEARCH ROOMS (FIXED)
// ===============================
searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();

    const response = await API.rooms.list();
    const rooms = Array.isArray(response?.data?.rooms)
        ? response.data.rooms
        : [];

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm) ||
        room.host.toLowerCase().includes(searchTerm) ||
        room.code.toLowerCase().includes(searchTerm)
    );

    displayRooms(filteredRooms);
});

// ===============================
// INIT
// ===============================
loadRooms();
setInterval(loadRooms, 5000);
