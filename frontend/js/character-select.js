// ===============================
// CHARACTER SELECT LOGIC
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

// Character icons/emojis for preview
const characterIcons = {
    cyborg: '🤖',
    ninja: '🥷',
    warrior: '⚔️',
};

// Load and display characters
function loadCharacters() {
    charactersGrid.innerHTML = '';

    Object.values(CONFIG.CHARACTERS).forEach(character => {
        const card = createCharacterCard(character);
        charactersGrid.appendChild(card);
    });
}

// Create character card
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card fade-in';
    card.dataset.characterId = character.id;

    // Calculate max stat for percentage
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
      <div class="stat-item">
        <div class="stat-label">
          <span class="stat-name">Speed</span>
          <span class="stat-value">${character.stats.speed}/${maxStat}</span>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill" style="width: ${(character.stats.speed / maxStat) * 100}%"></div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">
          <span class="stat-name">Power</span>
          <span class="stat-value">${character.stats.power}/${maxStat}</span>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill" style="width: ${(character.stats.power / maxStat) * 100}%"></div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">
          <span class="stat-name">Defense</span>
          <span class="stat-value">${character.stats.defense}/${maxStat}</span>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill" style="width: ${(character.stats.defense / maxStat) * 100}%"></div>
        </div>
      </div>
    </div>
  `;

    // Add click handler
    card.addEventListener('click', () => selectCharacter(character.id));

    return card;
}

// Select character
function selectCharacter(characterId) {
    // Remove previous selection
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-character-id="${characterId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedCharacter = characterId;
        confirmBtn.disabled = false;
    }
}

// Confirm selection
confirmBtn.addEventListener('click', () => {
    if (!selectedCharacter) {
        return;
    }

    // Store selected character
    UserStorage.setCharacter(selectedCharacter);

    // Show toast
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = `${CONFIG.CHARACTERS[selectedCharacter].name} selected!`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);

    // Navigate to lobby
    setTimeout(() => {
        window.location.href = 'lobby.html';
    }, 500);
});

// Back button
backBtn.addEventListener('click', () => {
    // Clear room data
    UserStorage.setRoom(null);
    window.location.href = 'home.html';
});

// Load characters on page load
loadCharacters();

// Pre-select if already chosen
const previouslySelected = UserStorage.getCharacter();
if (previouslySelected) {
    selectCharacter(previouslySelected);
}
