// ===============================
// CHARACTER SELECT LOGIC (FINAL FIXED)
// ===============================

// Check authentication
if (!UserStorage.isAuthenticated()) {
    window.location.href = '../index.html';
}

// DOM Elements
const charactersGrid = document.getElementById('charactersGrid');
const confirmBtn = document.getElementById('confirmBtn');
const backBtn = document.getElementById('backBtn');

// State
let selectedCharacter = null;

// Character icons/emojis
const characterIcons = {
    cyborg: '🤖',
    ninja: '🥷',
    warrior: '⚔️',
};

// ===============================
// LOAD CHARACTERS
// ===============================
function loadCharacters() {
    charactersGrid.innerHTML = '';

    Object.values(CONFIG.CHARACTERS).forEach(character => {
        const card = createCharacterCard(character);
        charactersGrid.appendChild(card);
    });
}

// ===============================
// CREATE CARD
// ===============================
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card fade-in';
    card.dataset.characterId = character.id;

    const maxStat = 10;

    card.innerHTML = `
        <div class="character-preview">
            <div class="character-preview-placeholder">
                ${characterIcons[character.id] || '👤'}
            </div>
        </div>
        <h3 class="character-name">${character.name}</h3>
        <p class="character-description">${character.description}</p>

        <div class="character-stats">
            ${createStat("Speed", character.stats.speed, maxStat)}
            ${createStat("Power", character.stats.power, maxStat)}
            ${createStat("Defense", character.stats.defense, maxStat)}
        </div>
    `;

    card.addEventListener('click', () => selectCharacter(character.id));

    return card;
}

// ===============================
// CREATE STAT BAR
// ===============================
function createStat(name, value, max) {
    return `
        <div class="stat-item">
            <div class="stat-label">
                <span>${name}</span>
                <span>${value}/${max}</span>
            </div>
            <div class="stat-bar">
                <div class="stat-bar-fill" style="width:${(value / max) * 100}%"></div>
            </div>
        </div>
    `;
}

// ===============================
// SELECT CHARACTER
// ===============================
function selectCharacter(characterId) {
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });

    const selectedCard = document.querySelector(`[data-character-id="${characterId}"]`);

    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedCharacter = characterId;
        confirmBtn.disabled = false;
    }
}

// ===============================
// CONFIRM SELECTION (IMPORTANT FIX)
// ===============================
confirmBtn.addEventListener('click', () => {
    if (!selectedCharacter) return;

    const room = UserStorage.getRoom();
    const user = UserStorage.getUser();

    console.log("Room:", room);
    console.log("User:", user);

    // Safety checks
    if (!room || !room.id) {
        alert("Room not found!");
        return;
    }

    if (!user || !user.id) {
        alert("User not found!");
        return;
    }

    // Save locally
    UserStorage.setCharacter(selectedCharacter);

    // ===============================
    // CONNECT SOCKET
    // ===============================
    if (!wsManager.socket || !wsManager.socket.connected) {
        console.log("🔌 Connecting socket...");
        wsManager.connect();
    }

    // ===============================
    // JOIN ROOM FIRST
    // ===============================
    wsManager.send("room:join", {
        roomId: room.id,
        userId: user.id,
        username: user.username
    });

    // ===============================
    // SEND CHARACTER AFTER JOIN
    // ===============================
    setTimeout(() => {
        wsManager.send("player:selectCharacter", {
            roomId: room.id,
            character: selectedCharacter
        });

        console.log("🎭 Character sent:", selectedCharacter);
    }, 300);

    // ===============================
    // UI FEEDBACK
    // ===============================
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = `${CONFIG.CHARACTERS[selectedCharacter].name} selected!`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);

    // ===============================
    // NAVIGATE TO LOBBY
    // ===============================
    setTimeout(() => {
        window.location.href = 'lobby.html';
    }, 700);
});

// ===============================
// BACK BUTTON
// ===============================
backBtn.addEventListener('click', () => {
    UserStorage.setRoom(null);
    window.location.href = 'home.html';
});

// ===============================
// INIT
// ===============================
loadCharacters();

// Preselect previous
const prev = UserStorage.getCharacter();
if (prev) selectCharacter(prev);
