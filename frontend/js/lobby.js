// ===============================
// LOBBY LOGIC (FINAL FIXED)
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
let player2Joined = false;
let player2Ready = false;

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
    player1Status.className = isReady
        ? 'player-status ready'
        : 'player-status not-ready';

    readyBtn.textContent = isReady ? 'Not Ready' : 'Ready';

    if (isHost) {
        startBtn.style.display = 'block';
        startBtn.disabled = !(player2Joined && isReady && player2Ready);
    } else {
        startBtn.style.display = 'none';
    }

    if (!player2Joined) {
        statusMessage.textContent = "Waiting for opponent...";
    } else if (!isReady) {
        statusMessage.textContent = "Click Ready";
    } else if (!player2Ready) {
        statusMessage.textContent = "Waiting for opponent...";
    } else {
        statusMessage.textContent = "Ready to start!";
    }
}

// ===============================
// SOCKET CONNECTION (FIXED)
// ===============================
if (!CONFIG.API.USE_MOCK) {

    wsManager.connect();

    // ✅ JOIN ROOM AFTER CONNECT
    setTimeout(() => {
        wsManager.send("room:join", {
            roomId: room.id,
            userId: user.id,
            username: user.username
        });

        console.log("✅ Joined room:", room.id);
    }, 300);

    // ===============================
    // SOCKET LISTENERS
    // ===============================

    wsManager.on('player:joined', (data) => {
        player2Joined = true;

        player2Card.classList.add('joined');
        player2Card.innerHTML = `
            <div class="player-header">
                <h3>Player 2</h3>
                <span class="player-status not-ready">Not Ready</span>
            </div>
            <p>${data.username}</p>
        `;

        updateUI();
    });

    wsManager.on('player:ready', (data) => {
        player2Ready = data.ready;
        updateUI();
    });

    wsManager.on('game:start', () => {
        window.location.href = 'game.html';
    });

    wsManager.on('player:left', () => {
        player2Joined = false;
        player2Ready = false;
        updateUI();
    });
}

// ===============================
// READY BUTTON (FIXED)
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
    if (!player2Joined || !isReady || !player2Ready) return;

    wsManager.send("game:start", {
        roomId: room.id
    });
});

// ===============================
// LEAVE ROOM
// ===============================
leaveBtn.addEventListener('click', () => {
    UserStorage.setRoom(null);
    window.location.href = 'home.html';
});

// ===============================
// INIT
// ===============================
initializeLobby();
