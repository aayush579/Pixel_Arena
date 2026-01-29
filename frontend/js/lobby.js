// ===============================
// LOBBY LOGIC
// ===============================

// Check authentication
if (!UserStorage.isAuthenticated()) {
    window.location.href = '../index.html';
}

// Get user and room data
const user = UserStorage.getUser();
const room = UserStorage.getRoom();
const selectedCharacter = UserStorage.getCharacter();

if (!room || !selectedCharacter) {
    window.location.href = 'home.html';
}

// DOM Elements
const roomTitle = document.getElementById('roomTitle');
const roomCode = document.getElementById('roomCode');
const player1Name = document.getElementById('player1Name');
const player1Character = document.getElementById('player1Character');
const player1Icon = document.getElementById('player1Icon');
const player1Status = document.getElementById('player1Status');
const player2Card = document.getElementById('player2Card');
const player2Status = document.getElementById('player2Status');
const readyBtn = document.getElementById('readyBtn');
const startBtn = document.getElementById('startBtn');
const leaveBtn = document.getElementById('leaveBtn');
const statusMessage = document.getElementById('statusMessage');

// Character icons
const characterIcons = {
    cyborg: '🤖',
    ninja: '🥷',
    warrior: '⚔️',
};

// State
let isReady = false;
let isHost = room.host === user.username;
let player2Joined = false;
let player2Ready = false;

// Initialize lobby
function initializeLobby() {
    roomTitle.textContent = room.name;
    roomCode.textContent = room.code;
    player1Name.textContent = user.username;

    const character = CONFIG.CHARACTERS[selectedCharacter];
    player1Character.textContent = character.name;
    player1Icon.textContent = characterIcons[selectedCharacter];

    // Update ready button
    if (isHost) {
        readyBtn.textContent = 'Ready';
    } else {
        readyBtn.textContent = 'Ready';
    }

    updateUI();
}

// Update UI based on state
function updateUI() {
    // Update player 1 status
    if (isReady) {
        player1Status.textContent = 'Ready';
        player1Status.className = 'player-status ready';
        readyBtn.textContent = 'Not Ready';
        readyBtn.classList.remove('btn-secondary');
        readyBtn.classList.add('btn-warning');
    } else {
        player1Status.textContent = 'Not Ready';
        player1Status.className = 'player-status not-ready';
        readyBtn.textContent = 'Ready';
        readyBtn.classList.remove('btn-warning');
        readyBtn.classList.add('btn-secondary');
    }

    // Update start button (only for host)
    if (isHost) {
        startBtn.style.display = 'block';
        if (player2Joined && isReady && player2Ready) {
            startBtn.disabled = false;
            statusMessage.textContent = 'Both players ready! Click Start Game to begin.';
        } else {
            startBtn.disabled = true;
            if (!player2Joined) {
                statusMessage.textContent = 'Waiting for opponent to join...';
            } else if (!isReady) {
                statusMessage.textContent = 'Click Ready when you\'re prepared to fight!';
            } else if (!player2Ready) {
                statusMessage.textContent = 'Waiting for opponent to be ready...';
            }
        }
    } else {
        startBtn.style.display = 'none';
        if (!player2Joined) {
            statusMessage.textContent = 'Waiting for opponent to join...';
        } else if (!isReady) {
            statusMessage.textContent = 'Click Ready when you\'re prepared to fight!';
        } else {
            statusMessage.textContent = 'Waiting for host to start the game...';
        }
    }
}

// Simulate player 2 joining (mock mode)
function simulatePlayer2Join() {
    setTimeout(() => {
        player2Joined = true;

        // Update player 2 card
        player2Card.classList.add('joined');
        player2Card.innerHTML = `
      <div class="player-header">
        <h3 class="player-label">Player 2</h3>
        <span class="player-status not-ready" id="player2Status">Not Ready</span>
      </div>
      <div class="player-character">
        <div class="character-icon">${characterIcons.ninja}</div>
        <div class="character-info">
          <h4 class="character-name">Ninja</h4>
          <p class="player-name">Opponent</p>
        </div>
      </div>
    `;

        updateUI();

        // Show toast
        showToast('Opponent joined!', 'success');

        // Simulate opponent getting ready after a delay
        setTimeout(() => {
            player2Ready = true;
            const p2Status = document.getElementById('player2Status');
            if (p2Status) {
                p2Status.textContent = 'Ready';
                p2Status.className = 'player-status ready';
            }
            updateUI();
            showToast('Opponent is ready!', 'success');
        }, 3000);
    }, 2000);
}

// Show toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Ready button
readyBtn.addEventListener('click', () => {
    isReady = !isReady;
    updateUI();

    // Send ready status via WebSocket (in real implementation)
    if (CONFIG.API.USE_MOCK) {
        console.log('Player ready status:', isReady);
    } else {
        wsManager.send('player:ready', { ready: isReady });
    }
});

// Start game button
startBtn.addEventListener('click', () => {
    if (!player2Joined || !isReady || !player2Ready) {
        return;
    }

    showToast('Starting game...', 'success');

    // Navigate to game
    setTimeout(() => {
        window.location.href = 'game.html';
    }, 1000);
});

// Leave room button
leaveBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to leave the room?')) {
        UserStorage.setRoom(null);
        showToast('Left room', 'warning');

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 500);
    }
});

// Initialize
initializeLobby();

// In mock mode, simulate player 2 joining
if (CONFIG.API.USE_MOCK) {
    simulatePlayer2Join();
}

// WebSocket listeners (for real backend)
if (!CONFIG.API.USE_MOCK) {
    wsManager.connect(room.id);

    wsManager.on('player:joined', (data) => {
        player2Joined = true;
        // Update player 2 UI with real data
        updateUI();
        showToast('Opponent joined!', 'success');
    });

    wsManager.on('player:ready', (data) => {
        player2Ready = data.ready;
        updateUI();
    });

    wsManager.on('game:start', () => {
        window.location.href = 'game.html';
    });

    wsManager.on('player:left', () => {
        showToast('Opponent left the room', 'warning');
        player2Joined = false;
        player2Ready = false;
        updateUI();
    });
}
