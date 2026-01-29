const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {};

// ===============================
// FLEXIBLE IMAGE LOADER
// ===============================
function loadFrames(path, count, startIndex = 1) {
  const frames = [];

  // Try multiple naming patterns
  const patterns = [
    (i) => `${path}${String(startIndex + i).padStart(2, "0")}.png`,  // idle01.png
    (i) => `${path}_${startIndex + i}.png`,                           // idle_1.png
    (i) => `${path}${startIndex + i}.png`,                            // idle1.png
    (i) => `${path}_${String(startIndex + i).padStart(2, "0")}.png`, // idle_01.png
  ];

  for (let i = 0; i < count; i++) {
    const img = new Image();

    // Try the first pattern (most common)
    img.src = patterns[0](i);

    // Store alternative patterns
    img.alternativePaths = patterns.slice(1).map(pattern => pattern(i));
    img.currentPatternIndex = 0;

    console.log(`Loading: ${img.src}`);

    frames.push(img);
  }

  return frames;
}

// ===============================
// LOAD ANIMATIONS
// ===============================
const animations = {
  idle: loadFrames("../assets/characters/cyborg/idle/idle", 3),
  walk: loadFrames("../assets/characters/walk/walk", 5),
  kick: loadFrames("../assets/characters/cyborg/kick/kick", 3),
  hit: loadFrames("../assets/characters/cyborg/hit/hit", 2)
};

// ===============================
// SMART PRELOADER (tries alternative paths)
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

    console.log(`Total images to load: ${totalImages}`);

    if (totalImages === 0) {
      resolve();
      return;
    }

    function tryLoadImage(img, altIndex = 0) {
      img.onload = () => {
        loadedCount++;
        console.log(`✓ Loaded ${loadedCount}/${totalImages}: ${img.src}`);
        checkComplete();
      };

      img.onerror = () => {
        // Try alternative path if available
        if (altIndex < img.alternativePaths.length) {
          console.log(`✗ Failed: ${img.src}, trying alternative...`);
          img.src = img.alternativePaths[altIndex];
          tryLoadImage(img, altIndex + 1);
        } else {
          errorCount++;
          console.error(`✗ All attempts failed for image ${errorCount}`);
          checkComplete();
        }
      };
    }

    function checkComplete() {
      if (loadedCount + errorCount === totalImages) {
        if (loadedCount === 0) {
          reject(new Error("No images loaded. Check your assets folder structure."));
        } else {
          console.log(`✓ Loaded ${loadedCount}/${totalImages} images`);
          if (errorCount > 0) {
            console.warn(`⚠ ${errorCount} images failed to load`);
          }
          resolve();
        }
      }
    }

    // Start loading all images
    allImages.forEach(img => tryLoadImage(img));
  });
}

// ===============================
// PLAYER
// ===============================
const player = {
  x: 200,
  y: 280,
  w: 48,
  h: 64,
  facing: 1,
  state: "idle",
  frameIndex: 0,
  frameTimer: 0,
  attacking: false
};

// ===============================
// INPUT
// ===============================
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ===============================
// BUTTON CONTROLS
// ===============================
function setupButtons() {
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const btnKick = document.getElementById("btn-kick");
  const btnHit = document.getElementById("btn-hit");

  // Movement buttons
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

  // Action buttons
  btnKick.addEventListener("click", () => keys.k = true);
  btnKick.addEventListener("touchstart", (e) => { e.preventDefault(); keys.k = true; });

  btnHit.addEventListener("click", () => keys.h = true);
  btnHit.addEventListener("touchstart", (e) => { e.preventDefault(); keys.h = true; });
}

// ===============================
// UPDATE LOGIC
// ===============================
function update() {
  let moving = false;

  if (keys.a || keys.ArrowLeft) {
    player.x -= 4;
    player.facing = -1;
    player.state = "walk";
    moving = true;
  }

  if (keys.d || keys.ArrowRight) {
    player.x += 4;
    player.facing = 1;
    player.state = "walk";
    moving = true;
  }

  if ((keys.k || keys[' ']) && !player.attacking) {
    player.attacking = true;
    player.state = "kick";
    player.frameIndex = 0;
    keys.k = false; // Reset key

    // Play kick sound
    if (typeof playSound !== 'undefined') {
      playSound('kick');
    }

    setTimeout(() => {
      player.attacking = false;
      player.state = "idle";
    }, 400);
  }

  if ((keys.h || keys.H) && !player.attacking) {
    player.attacking = true;
    player.state = "hit";
    player.frameIndex = 0;
    keys.h = false; // Reset key
    keys.H = false;

    // Play hit sound
    if (typeof playSound !== 'undefined') {
      playSound('hit');
    }

    setTimeout(() => {
      player.attacking = false;
      player.state = "idle";
    }, 300);
  }

  if (!moving && !player.attacking) {
    player.state = "idle";
  }
}

// ===============================
// ANIMATION UPDATE
// ===============================
function updateAnimation() {
  const frames = animations[player.state];
  if (!frames || frames.length === 0) return;

  player.frameTimer++;
  if (player.frameTimer > 10) {
    player.frameTimer = 0;
    player.frameIndex++;

    if (player.frameIndex >= frames.length) {
      player.frameIndex = 0;

      if (player.state !== "idle" && player.state !== "walk") {
        player.state = "idle";
      }
    }
  }
}

// ===============================
// DRAW
// ===============================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const frames = animations[player.state];
  if (!frames || frames.length === 0) {
    drawPlaceholder("No frames loaded");
    return;
  }

  const frame = frames[player.frameIndex];

  if (frame && frame.complete && frame.naturalWidth > 0) {
    ctx.save();
    if (player.facing === -1) {
      ctx.translate(player.x + player.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(frame, 0, player.y, player.w, player.h);
    } else {
      ctx.drawImage(frame, player.x, player.y, player.w, player.h);
    }
    ctx.restore();
  } else {
    drawPlaceholder("Loading...");
  }

  // Ground line
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(0, player.y + player.h);
  ctx.lineTo(canvas.width, player.y + player.h);
  ctx.stroke();

  // Debug info
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`State: ${player.state} | Frame: ${player.frameIndex + 1}/${frames.length}`, 10, 30);
}

function drawPlaceholder(text) {
  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(text, player.x, player.y - 5);
}

// ===============================
// GAME LOOP
// ===============================
function loop() {
  update();
  updateAnimation();
  draw();
  requestAnimationFrame(loop);
}

// ===============================
// START GAME
// ===============================
console.log("🎮 Starting Pixel Arena...");
console.log("📂 Will try multiple naming patterns:");
console.log("   - idle01.png, idle02.png...");
console.log("   - idle_1.png, idle_2.png...");
console.log("   - idle1.png, idle2.png...");

preloadImages()
  .then(() => {
    console.log("🎮 Starting game loop...");
    setupButtons();
    loop();
  })
  .catch(error => {
    console.error("❌ Fatal error:", error.message);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Failed to load images!", 250, 200);
    ctx.font = "14px Arial";
    ctx.fillText("Check console (F12) for details", 250, 230);
  });