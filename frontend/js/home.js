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

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Show/hide loading
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Logout
logoutBtn.addEventListener('click', () => {
    UserStorage.clearSession();
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
});

// Load rooms
async function loadRooms() {
    showLoading();

    try {
        const response = await API.rooms.list();

        if (response.success) {
            displayRooms(response.data.rooms);
        } else {
            showToast('Failed to load rooms', 'error');
        }
    } catch (error) {
        console.error('Load rooms error:', error);
        showToast('An error occurred', 'error');
    } finally {
        hideLoading();
    }
}

// Display rooms
function displayRooms(rooms) {
    roomsList.innerHTML = '';

    if (rooms.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    rooms.forEach(room => {
        const roomCard = createRoomCard(room);
        roomsList.appendChild(roomCard);
    });
}

// Create room card element
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
      <button class="btn ${isFull ? 'btn-secondary' : 'btn-success'}" ${isFull ? 'disabled' : ''}>
        ${isFull ? 'Room Full' : 'Join Room'}
      </button>
    </div>
  `;

    // Add click handler for join button
    if (!isFull) {
        const joinBtn = card.querySelector('.btn');
        joinBtn.addEventListener('click', () => joinRoom(room));
    }

    return card;
}

// Join room
async function joinRoom(room) {
    showLoading();

    try {
        const response = await API.rooms.join(room.id);

        if (response.success) {
            // Store room data
            UserStorage.setRoom(response.data.room);

            showToast('Joined room successfully!', 'success');

            // Navigate to character select
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

// Show create room modal
createRoomBtn.addEventListener('click', () => {
    createRoomModal.classList.add('active');
    roomNameInput.focus();
});

// Hide create room modal
cancelCreateBtn.addEventListener('click', () => {
    createRoomModal.classList.remove('active');
    createRoomForm.reset();
});

// Close modal on background click
createRoomModal.addEventListener('click', (e) => {
    if (e.target === createRoomModal) {
        createRoomModal.classList.remove('active');
        createRoomForm.reset();
    }
});

// Create room
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
            // Store room data
            UserStorage.setRoom(response.data.room);

            showToast('Room created successfully!', 'success');

            // Navigate to character select
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

// Quick play - join first available room
quickPlayBtn.addEventListener('click', async () => {
    showLoading();

    try {
        const response = await API.rooms.list();

        if (response.success) {
            const availableRooms = response.data.rooms.filter(
                room => room.players < room.maxPlayers
            );

            if (availableRooms.length > 0) {
                // Join first available room
                await joinRoom(availableRooms[0]);
            } else {
                hideLoading();
                showToast('No available rooms. Create one!', 'warning');
            }
        } else {
            hideLoading();
            showToast('Failed to find rooms', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Quick play error:', error);
        showToast('An error occurred', 'error');
    }
});

// Search rooms
searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();

    const response = await API.rooms.list();

    if (response.success) {
        const filteredRooms = response.data.rooms.filter(room =>
            room.name.toLowerCase().includes(searchTerm) ||
            room.host.toLowerCase().includes(searchTerm) ||
            room.code.toLowerCase().includes(searchTerm)
        );

        displayRooms(filteredRooms);
    }
});

// Load rooms on page load
loadRooms();

// Refresh rooms every 5 seconds
setInterval(loadRooms, 5000);
