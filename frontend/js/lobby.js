// ===============================
// LOBBY LOGIC (PRO VERSION)
// ===============================

// Check authentication
if (!UserStorage.isAuthenticated()) {
    window.location.href = '../index.html';
}

// Get stored data
const user = UserStorage.getUser();
const room = UserStorage.getRoom();
const selectedCharacter = UserStorage.getCharacter();

// Safety check
if (!room || !selectedCharacter) {
    alert("Room or character missing!");
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
const readyBtn = document.getElementById('readyBtn');
const startBtn = document.getElementById('startBtn');
const leaveBtn = document.getElementById('leaveBtn');
const statusMessage = document.getElementById('statusMessage');

// Icons
const characterIcons = {
    cyborg: '🤖',
    ninja: '🥷',
    warrior: '⚔️',
};

// State
let isReady = false;
let isHost = room.host === user.username;
let player2 = null;

// ===============================
// INIT UI
// ===============================
function initializeLobby() {
    roomTitle.textContent = room.name;
    roomCode.textContent = room.code;
    player1Name.textContent = user.username;

    const character = CONFIG.CHARACTERS[selectedCharacter];
    player1Character.textContent = character.name;
    player1Icon.textContent = characterIcons[selectedCharacter];

    updateUI();
}

// ===============================
// UPDATE UI
// ===============================
function updateUI() {
    player1Status.textContent = isReady ? 'Ready' : 'Not Ready';
    player1Status.className = isReady ? 'player-status ready' : 'player-status not-ready';

    readyBtn.textContent = isReady ? 'Not Ready' : 'Ready';

    if (isHost) {
        startBtn.style.display = 'block';
        startBtn.disabled = !(player2 && isReady && player2.ready);
    } else {
        startBtn.style.display = 'none';
    }

    if (!player2) {
        statusMessage.textContent = "Waiting for opponent...";
    } else if (!isReady) {
        statusMessage.textContent = "Click Ready";
    } else if (!player2.ready) {
        statusMessage.textContent = "Waiting for opponent...";
    } else {
        statusMessage.textContent = "Ready to start!";
    }
}

// ===============================
// SOCKET CONNECTION (PRO)
// ===============================
if (!CONFIG.API.USE_MOCK) {

    wsManager.connect();

    wsManager.on("connect", () => {
        console.log("🔌 Connected");

        // Join room safely
        wsManager.send("room:join", {
            roomId: room.id,
            userId: user.id,
            username: user.username
        });
    });

    // ===============================
    // PLAYER JOINED
    // ===============================
    wsManager.on('player:joined', (data) => {
        player2 = {
            id: data.userId,
            username: data.username,
            ready: false,
            character: null
        };

        player2Card.classList.add('joined');
        player2Card.innerHTML = `
            <div class="player-header">
                <h3>Player 2</h3>
                <span class="player-status not-ready">Not Ready</span>
            </div>
            <div class="player-character">
                <div class="character-icon">👤</div>
                <p>${data.username}</p>
            </div>
        `;

        updateUI();
    });

    // ===============================
    // CHARACTER SELECTED
    // ===============================
    wsManager.on('player:characterSelected', (data) => {
        if (player2 && player2.id === data.userId) {
            player2.character = data.character;

            player2Card.innerHTML = `
                <div class="player-header">
                    <h3>Player 2</h3>
                    <span class="player-status not-ready">Not Ready</span>
                </div>
                <div class="player-character">
                    <div class="character-icon">${characterIcons[data.character]}</div>
                    <p>${player2.username}</p>
                </div>
            `;
        }
    });

    // ===============================
    // READY UPDATE
    // ===============================
    wsManager.on('player:ready', (data) => {
        if (player2 && player2.id === data.userId) {
            player2.ready = data.ready;

            const status = player2Card.querySelector('.player-status');
            if (status) {
                status.textContent = data.ready ? "Ready" : "Not Ready";
                status.className = data.ready
                    ? "player-status ready"
                    : "player-status not-ready";
            }

            updateUI();
        }
    });

    // ===============================
    // GAME START
    // ===============================
    wsManager.on('game:start', () => {
        window.location.href = 'game.html';
    });

    // ===============================
    // PLAYER LEFT
    // ===============================
    wsManager.on('player:left', () => {
        player2 = null;
        player2Card.classList.remove('joined');
        player2Card.innerHTML = "<p>Waiting for player...</p>";
        updateUI();
    });
}

// ===============================
// READY BUTTON
// ===============================
readyBtn.addEventListener('click', () => {
    isReady = !isReady;
    updateUI();

    if (!CONFIG.API.USE_MOCK) {
        wsManager.send('player:ready', {
            roomId: room.id,
            ready: isReady
        });
    }
});

// ===============================
// START GAME
// ===============================
startBtn.addEventListener('click', () => {
    if (!player2 || !isReady || !player2.ready) return;

    wsManager.send("game:start", {
        roomId: room.id
    });
});

// ===============================
// LEAVE ROOM
// ===============================
leaveBtn.addEventListener('click', () => {
    wsManager.disconnect(); // 🔥 cleanup
    UserStorage.setRoom(null);
    window.location.href = 'home.html';
});

// ===============================
// INIT
// ===============================
initializeLobby();
