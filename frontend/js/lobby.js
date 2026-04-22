// ===============================
// LOBBY LOGIC (FIXED)
// ===============================

// Check authentication
if (!UserStorage.isAuthenticated()) {
    window.location.href = '../index.html';
}

// Get stored data
const user = UserStorage.getUser();
const room = UserStorage.getRoom();
const selectedCharacter = UserStorage.getCharacter();

// Debug — remove after confirming fix
console.log("🏠 Room data:", JSON.stringify(room));
console.log("👤 User data:", JSON.stringify(user));

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

// ✅ FIXED: Use hostId (user ID) not host (username) for reliable host detection
let isHost = room.hostId === user.id;

console.log(`🎮 Is host: ${isHost} (room.hostId=${room.hostId}, user.id=${user.id})`);

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

    // ✅ Show correct label based on who you are
    const player1Label = document.querySelector('.player-1 .player-label');
    if (player1Label) {
        player1Label.textContent = isHost ? 'Player 1 (Host)' : 'Player 2';
    }

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
        statusMessage.textContent = "Waiting for opponent to join...";
    } else if (!isReady) {
        statusMessage.textContent = "Click Ready when you're set!";
    } else if (!player2.ready) {
        statusMessage.textContent = "Waiting for opponent to ready up...";
    } else {
        statusMessage.textContent = isHost
            ? "Both ready — press Start!"
            : "Both ready — waiting for host to start!";
    }
}

// ===============================
// RENDER OPPONENT CARD
// ===============================
function renderPlayer2Card(username, character, ready) {
    player2Card.classList.add('joined');
    player2Card.innerHTML = `
        <div class="player-header">
            <h3 class="player-label">${isHost ? 'Player 2' : 'Player 1 (Host)'}</h3>
            <span class="player-status ${ready ? 'ready' : 'not-ready'}">${ready ? 'Ready' : 'Not Ready'}</span>
        </div>
        <div class="player-character">
            <div class="character-icon">${character ? (characterIcons[character] || '👤') : '👤'}</div>
            <div class="character-info">
                <h4 class="character-name">${character ? (CONFIG.CHARACTERS[character]?.name || character) : 'Choosing...'}</h4>
                <p class="player-name">${username}</p>
            </div>
        </div>
    `;
}

// ===============================
// SOCKET LISTENERS
// ===============================
function setupSocketListeners() {

    // ✅ room:update fires on every join — use it to sync full state
    wsManager.on('room:update', (data) => {
        const updatedRoom = data.room;
        if (!updatedRoom) return;

        console.log("📦 room:update players:", JSON.stringify(updatedRoom.players));

        updatedRoom.players.forEach(p => {
            if (p.id !== user.id) {
                player2 = {
                    id: p.id,
                    username: p.username,
                    ready: p.ready || false,
                    character: p.character || null
                };
                renderPlayer2Card(p.username, p.character, p.ready);
            }
        });

        updateUI();
    });

    // Player joined notification
    wsManager.on('player:joined', (data) => {
        console.log("👤 player:joined:", data);

        player2 = {
            id: data.userId,
            username: data.username,
            ready: false,
            character: null
        };

        renderPlayer2Card(data.username, null, false);
        updateUI();
    });

    // Opponent selected character
    wsManager.on('player:characterSelected', (data) => {
        if (data.userId === user.id) return;

        if (player2 && player2.id === data.userId) {
            player2.character = data.character;
            renderPlayer2Card(player2.username, data.character, player2.ready);
        }
    });

    // Opponent ready status changed
    wsManager.on('player:ready', (data) => {
        if (data.userId === user.id) return;

        if (player2 && player2.id === data.userId) {
            player2.ready = data.ready;

            const status = player2Card.querySelector('.player-status');
            if (status) {
                status.textContent = data.ready ? "Ready" : "Not Ready";
                status.className = data.ready ? "player-status ready" : "player-status not-ready";
            }

            updateUI();
        }
    });

    // Game started
    wsManager.on('game:start', () => {
        window.location.href = 'game.html';
    });

    // Opponent left
    wsManager.on('player:left', (data) => {
        console.log("❌ player:left:", data);

        player2 = null;
        player2Card.classList.remove('joined');
        player2Card.innerHTML = `
            <div class="player-header">
                <h3 class="player-label">${isHost ? 'Player 2' : 'Player 1 (Host)'}</h3>
                <span class="player-status waiting">Waiting...</span>
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
// START GAME (host only)
// ===============================
startBtn.addEventListener('click', () => {
    if (!isHost || !player2 || !isReady || !player2.ready) return;

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
