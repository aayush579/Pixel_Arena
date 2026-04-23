const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {};
let gameActive = true;
let winnerText = "";

// Get user and room info
const user = typeof UserStorage !== 'undefined' ? UserStorage.getUser() : { id: 'test' };
const room = typeof UserStorage !== 'undefined' ? UserStorage.getRoom() : null;
const isHost = room ? room.hostId === user.id : true;

// ===============================
// FLEXIBLE IMAGE LOADER
// ===============================
function loadFrames(path, count, startIndex = 1) {
  const frames = [];

  const patterns = [
    (i) => `${path}${String(startIndex + i).padStart(2, "0")}.png`,
    (i) => `${path}_${startIndex + i}.png`,
    (i) => `${path}${startIndex + i}.png`,
    (i) => `${path}_${String(startIndex + i).padStart(2, "0")}.png`,
  ];

  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = patterns[0](i);
    img.alternativePaths = patterns.slice(1).map(pattern => pattern(i));
    img.currentPatternIndex = 0;
    frames.push(img);
  }

  return frames;
}

// ===============================
// LOAD ANIMATIONS
// ===============================
// We will default to cyborg/walk for all characters since assets might be missing
const animations = {
  idle: loadFrames("../assets/characters/cyborg/idle/idle", 3),
  walk: loadFrames("../assets/characters/walk/walk", 5),
  kick: loadFrames("../assets/characters/cyborg/kick/kick", 3),
  hit: loadFrames("../assets/characters/cyborg/hit/hit", 2)
};

// ===============================
// SMART PRELOADER
// ===============================
function preloadImages() {
  return new Promise((resolve, reject) => {
    const allImages = [];
    for (const animKey in animations) {
      allImages.push(...animations[animKey]);
    }

    let loadedCount = 0;
    let errorCount = 0;
    const totalImages = allImages.length;

    if (totalImages === 0) return resolve();

    function tryLoadImage(img, altIndex = 0) {
      img.onload = () => {
        loadedCount++;
        checkComplete();
      };
      img.onerror = () => {
        if (altIndex < img.alternativePaths.length) {
          img.src = img.alternativePaths[altIndex];
          tryLoadImage(img, altIndex + 1);
        } else {
          errorCount++;
          checkComplete();
        }
      };
    }

    function checkComplete() {
      if (loadedCount + errorCount === totalImages) {
        if (loadedCount === 0) reject(new Error("No images loaded."));
        else resolve();
      }
    }

    allImages.forEach(img => tryLoadImage(img));
  });
}

// ===============================
// PLAYERS
// ===============================
const createPlayer = (isP1) => ({
  x: isP1 ? 150 : 600,
  y: 280,
  w: 48,
  h: 64,
  facing: isP1 ? 1 : -1,
  state: "idle",
  frameIndex: 0,
  frameTimer: 0,
  attacking: false,
  health: 100,
  isP1: isP1
});

const localPlayer = createPlayer(isHost);
const opponent = createPlayer(!isHost);

// ===============================
// WEBSOCKET LOGIC
// ===============================
if (typeof wsManager !== 'undefined') {
  wsManager.on('player:move', (data) => {
    opponent.x = data.x;
    opponent.y = data.y;
    opponent.facing = data.facing;
    opponent.state = data.state;
  });

  wsManager.on('player:action', (data) => {
    opponent.state = data.state;
    opponent.attacking = true;
    opponent.frameIndex = 0;
    
    // Play opponent sound
    if (typeof playSound !== 'undefined') {
      playSound(data.state); // 'kick' or 'hit'
    }

    setTimeout(() => {
      opponent.attacking = false;
      opponent.state = "idle";
    }, data.state === "kick" ? 400 : 300);
  });

  wsManager.on('player:damage', (data) => {
    if (data.targetId === user.id) {
      localPlayer.health -= data.damage;
      if (localPlayer.health < 0) localPlayer.health = 0;
      
      // We are dead
      if (localPlayer.health === 0) {
        gameActive = false;
        winnerText = "Opponent Wins!";
        wsManager.emit('game:over', { roomId: room.id, winnerId: opponent.id, loserId: localPlayer.id });
      }
    }
  });

  wsManager.on('game:over', (data) => {
    gameActive = false;
    winnerText = data.winnerId === user.id ? "You Win!" : "Opponent Wins!";
  });
}

// ===============================
// INPUT
// ===============================
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function setupButtons() {
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const btnKick = document.getElementById("btn-kick");
  const btnHit = document.getElementById("btn-hit");

  btnLeft.addEventListener("mousedown", () => keys.a = true);
  btnLeft.addEventListener("mouseup", () => keys.a = false);
  btnLeft.addEventListener("mouseleave", () => keys.a = false);
  btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); keys.a = true; });
  btnLeft.addEventListener("touchend", (e) => { e.preventDefault(); keys.a = false; });

  btnRight.addEventListener("mousedown", () => keys.d = true);
  btnRight.addEventListener("mouseup", () => keys.d = false);
  btnRight.addEventListener("mouseleave", () => keys.d = false);
  btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); keys.d = true; });
  btnRight.addEventListener("touchend", (e) => { e.preventDefault(); keys.d = false; });

  btnKick.addEventListener("click", () => keys.k = true);
  btnKick.addEventListener("touchstart", (e) => { e.preventDefault(); keys.k = true; });

  btnHit.addEventListener("click", () => keys.h = true);
  btnHit.addEventListener("touchstart", (e) => { e.preventDefault(); keys.h = true; });
}

// ===============================
// HIT DETECTION
// ===============================
function checkHitDetection(attackType) {
  // Hitbox parameters
  const attackRange = attackType === 'kick' ? 40 : 30;
  const damage = attackType === 'kick' ? 10 : 5;

  let hitBoxX = localPlayer.facing === 1 ? localPlayer.x + localPlayer.w : localPlayer.x - attackRange;
  let hitBoxW = attackRange;

  // Check overlap with opponent
  if (
    hitBoxX < opponent.x + opponent.w &&
    hitBoxX + hitBoxW > opponent.x &&
    localPlayer.y < opponent.y + opponent.h &&
    localPlayer.y + localPlayer.h > opponent.y
  ) {
    // Hit connects
    opponent.health -= damage;
    if (opponent.health < 0) opponent.health = 0;

    if (typeof wsManager !== 'undefined' && room) {
      const opp = room.players.find(p => p.id !== user.id);
      if (opp) {
        wsManager.emit('player:damage', {
          roomId: room.id,
          targetId: opp.id,
          damage: damage
        });
      }
    }
  }
}

// ===============================
// UPDATE LOGIC
// ===============================
let lastX = localPlayer.x;

function update() {
  if (!gameActive) return;

  let moving = false;

  if (keys.a || keys.ArrowLeft) {
    localPlayer.x -= 4;
    localPlayer.facing = -1;
    localPlayer.state = "walk";
    moving = true;
  }

  if (keys.d || keys.ArrowRight) {
    localPlayer.x += 4;
    localPlayer.facing = 1;
    localPlayer.state = "walk";
    moving = true;
  }

  // Bounds checking
  if (localPlayer.x < 0) localPlayer.x = 0;
  if (localPlayer.x > canvas.width - localPlayer.w) localPlayer.x = canvas.width - localPlayer.w;

  if ((keys.k || keys[' ']) && !localPlayer.attacking) {
    localPlayer.attacking = true;
    localPlayer.state = "kick";
    localPlayer.frameIndex = 0;
    keys.k = false; // Reset key

    if (typeof playSound !== 'undefined') playSound('kick');
    
    if (typeof wsManager !== 'undefined' && room) {
      wsManager.emit('player:action', { roomId: room.id, state: 'kick' });
    }

    // Check hit at frame 1 (middle of animation)
    setTimeout(() => checkHitDetection('kick'), 150);

    setTimeout(() => {
      localPlayer.attacking = false;
      localPlayer.state = "idle";
    }, 400);
  }

  if ((keys.h || keys.H) && !localPlayer.attacking) {
    localPlayer.attacking = true;
    localPlayer.state = "hit";
    localPlayer.frameIndex = 0;
    keys.h = false;
    keys.H = false;

    if (typeof playSound !== 'undefined') playSound('hit');
    
    if (typeof wsManager !== 'undefined' && room) {
      wsManager.emit('player:action', { roomId: room.id, state: 'hit' });
    }

    // Check hit at frame 1
    setTimeout(() => checkHitDetection('hit'), 150);

    setTimeout(() => {
      localPlayer.attacking = false;
      localPlayer.state = "idle";
    }, 300);
  }

  if (!moving && !localPlayer.attacking) {
    localPlayer.state = "idle";
  }

  // Emit movement only if changed
  if ((localPlayer.x !== lastX || localPlayer.state === "idle") && typeof wsManager !== 'undefined' && room && !localPlayer.attacking) {
    wsManager.emit('player:move', {
      roomId: room.id,
      x: localPlayer.x,
      y: localPlayer.y,
      facing: localPlayer.facing,
      state: localPlayer.state
    });
    lastX = localPlayer.x;
  }
}

// ===============================
// ANIMATION UPDATE
// ===============================
function updateAnimForPlayer(p) {
  const frames = animations[p.state];
  if (!frames || frames.length === 0) return;

  p.frameTimer++;
  if (p.frameTimer > 10) {
    p.frameTimer = 0;
    p.frameIndex++;

    if (p.frameIndex >= frames.length) {
      p.frameIndex = 0;
      if (p.state !== "idle" && p.state !== "walk") {
        p.state = "idle";
      }
    }
  }
}

// ===============================
// DRAW LOGIC
// ===============================
function drawPlayer(p) {
  const frames = animations[p.state];
  if (!frames || frames.length === 0) return;

  const frame = frames[p.frameIndex];
  if (frame && frame.complete && frame.naturalWidth > 0) {
    ctx.save();
    if (p.facing === -1) {
      ctx.translate(p.x + p.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(frame, 0, p.y, p.w, p.h);
    } else {
      ctx.drawImage(frame, p.x, p.y, p.w, p.h);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = p === localPlayer ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
}

function drawHealthBars() {
  const barWidth = 300;
  const barHeight = 20;
  const margin = 20;

  // Determine who is P1 (Left) and P2 (Right) for the UI layout
  const p1 = localPlayer.isP1 ? localPlayer : opponent;
  const p2 = !localPlayer.isP1 ? localPlayer : opponent;

  // P1 Health (Left)
  ctx.fillStyle = "red";
  ctx.fillRect(margin, margin, barWidth, barHeight);
  ctx.fillStyle = "green";
  ctx.fillRect(margin, margin, (p1.health / 100) * barWidth, barHeight);
  
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText(localPlayer.isP1 ? "You (P1)" : "Opponent (P1)", margin, margin - 5);

  // P2 Health (Right)
  ctx.fillStyle = "red";
  ctx.fillRect(canvas.width - margin - barWidth, margin, barWidth, barHeight);
  ctx.fillStyle = "green";
  // Right aligned bar
  const p2HealthWidth = (p2.health / 100) * barWidth;
  ctx.fillRect(canvas.width - margin - p2HealthWidth, margin, p2HealthWidth, barHeight);

  ctx.fillText(!localPlayer.isP1 ? "You (P2)" : "Opponent (P2)", canvas.width - margin - barWidth, margin - 5);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground line
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(0, localPlayer.y + localPlayer.h);
  ctx.lineTo(canvas.width, localPlayer.y + localPlayer.h);
  ctx.stroke();

  drawPlayer(localPlayer);
  drawPlayer(opponent);

  drawHealthBars();

  if (!gameActive) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = "24px Arial";
    ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2 + 30);
    
    ctx.font = "16px Arial";
    ctx.fillText("Returning to lobby in 5 seconds...", canvas.width / 2, canvas.height / 2 + 80);
    
    // Auto return to lobby
    if (window.gameOverTimer === undefined) {
      window.gameOverTimer = setTimeout(() => {
        window.location.href = 'lobby.html';
      }, 5000);
    }
  }
}

// ===============================
// GAME LOOP
// ===============================
function loop() {
  update();
  updateAnimForPlayer(localPlayer);
  updateAnimForPlayer(opponent);
  draw();
  requestAnimationFrame(loop);
}

// ===============================
// START GAME
// ===============================
preloadImages()
  .then(() => {
    setupButtons();
    loop();
  })
  .catch(error => {
    console.error("Fatal error:", error.message);
  });