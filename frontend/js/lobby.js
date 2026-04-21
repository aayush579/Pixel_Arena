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
        statusMessage.textContent = "Click Ready when you're set!";
    } else if (!player2.ready) {
        statusMessage.textContent = "Waiting for opponent to ready up...";
    } else {
        statusMessage.textContent = "Both players ready — Start the game!";
    }
}

// ===============================
// SOCKET LISTENERS
// ===============================
function setupSocketListeners() {

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

    // Temporary debug — remove later
wsManager.on('room:update', (data) => {
    console.log("📦 room:update received:", JSON.stringify(data.room?.players));
});

wsManager.on('player:joined', (data) => {
    console.log("👤 player:joined received:", data);
});
    // ===============================
    // ROOM UPDATE (full state sync)
    // ===============================
    wsManager.on('room:update', (data) => {
        const updatedRoom = data.room;
        if (!updatedRoom) return;

        updatedRoom.players.forEach(p => {
            if (p.id !== user.id) {
                // Update player 2 state from server
                player2 = player2 || { id: p.id, username: p.username, ready: false, character: null };
                player2.ready = p.ready;
                player2.character = p.character;

                if (p.character) {
                    player2Card.innerHTML = `
                        <div class="player-header">
                            <h3>Player 2</h3>
                            <span class="player-status ${p.ready ? 'ready' : 'not-ready'}">${p.ready ? 'Ready' : 'Not Ready'}</span>
                        </div>
                        <div class="player-character">
                            <div class="character-icon">${characterIcons[p.character] || '👤'}</div>
                            <p>${p.username}</p>
                        </div>
                    `;
                }
            }
        });

        updateUI();
    });

    // ===============================
    // CHARACTER SELECTED
    // ===============================
    wsManager.on('player:characterSelected', (data) => {
        if (data.userId === user.id) return; // ignore own event

        if (player2 && player2.id === data.userId) {
            player2.character = data.character;

            player2Card.innerHTML = `
                <div class="player-header">
                    <h3>Player 2</h3>
                    <span class="player-status not-ready">Not Ready</span>
                </div>
                <div class="player-character">
                    <div class="character-icon">${characterIcons[data.character] || '👤'}</div>
                    <p>${player2.username}</p>
                </div>
            `;
        }
    });

    // ===============================
    // READY UPDATE
    // ===============================
    wsManager.on('player:ready', (data) => {
        if (data.userId === user.id) return; // ignore own event

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
        player2Card.innerHTML = `
            <div class="player-header">
                <h3 class="player-label">Player 2</h3>
                <span class="player-status waiting" id="player2Status">Waiting...</span>
            </div>
            <div class="player-character">
                <div class="character-icon waiting-icon">❓</div>
                <div class="character-info">
                    <h4 class="character-name">Waiting for opponent...</h4>
                    <p class="player-name"></p>
                </div>
            </div>
        `;
        updateUI();
    });
}

// ===============================
// SOCKET CONNECTION
// ✅ FIXED: CONFIG.USE_MOCK (not CONFIG.API.USE_MOCK)
// ✅ FIXED: Don't reconnect if already connected from character-select
// ===============================
if (!CONFIG.USE_MOCK) {

    setupSocketListeners();

    if (!wsManager.socket || !wsManager.socket.connected) {
        // Not connected yet — connect and join
        wsManager.connect();

        wsManager.on("connect", () => {
            console.log("🔌 Connected to lobby");
            wsManager.send("room:join", {
                roomId: room.id,
                userId: user.id,
                username: user.username
            });
        });

    } else {
        // ✅ Already connected from character-select — just re-join
        console.log("🔌 Already connected, rejoining room...");
        wsManager.send("room:join", {
            roomId: room.id,
            userId: user.id,
            username: user.username
        });
    }
}

// ===============================
// READY BUTTON
// ✅ FIXED: CONFIG.USE_MOCK (not CONFIG.API.USE_MOCK)
// ===============================
readyBtn.addEventListener('click', () => {
    isReady = !isReady;
    updateUI();

    if (!CONFIG.USE_MOCK) {
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
    wsManager.disconnect();
    UserStorage.setRoom(null);
    window.location.href = 'home.html';
});

// ===============================
// INIT
// ===============================
initializeLobby();
