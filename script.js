const sheep = document.getElementById('sheep');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const controls = document.getElementById('controls');
const jumpBtn = document.getElementById('jumpBtn');

let isPlaying = true;
const step = 3;
const baseSize = 30;
const minScale = 2.0;
const maxScale = 5.0;

let pos = {
  x: window.innerWidth / 2,
  y: window.innerHeight * 0.7
};

let jumpInProgress = false;
let jumpScale = 1.0;
let lateralDirection = null;

let keysPressed = {};

function getRestingScale() {
  // Scale changes only with vertical (y) position on grass area (70% bottom)
  const bounds = document.getElementById('gameArea').getBoundingClientRect();
  const grassTop = bounds.height * 0.3;
  const grassHeight = bounds.height - grassTop;
  const relativeY = pos.y - grassTop;
  return minScale + (relativeY / grassHeight) * (maxScale - minScale);
}

function updateSheep(scaleOverride = null) {
  const bounds = document.getElementById('gameArea').getBoundingClientRect();
  const sheepSize = baseSize;

  // Clamp horizontally within game area
  pos.x = Math.max(0, Math.min(pos.x, bounds.width - sheepSize));

  // Clamp vertically only on grass (bottom 70%)
  const grassTop = bounds.height * 0.3;
  pos.y = Math.max(grassTop, Math.min(pos.y, bounds.height - sheepSize));

  // Choose scale:
  // if jumping, scaleOverride used (fixed scale on jump)
  // else scale based on vertical position (simulate distance)
  const scale = scaleOverride !== null ? scaleOverride : getRestingScale();

  // Horizontal movement does not change scale (size)
  // Only vertical changes scale => simulate perspective

  sheep.style.left = `${pos.x}px`;
  sheep.style.top = `${pos.y}px`;
  sheep.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(2)})`;
}

function moveSheep() {
  if (!isPlaying) return;

  if (!jumpInProgress) {
    if (keysPressed['w'] || keysPressed['arrowup']) pos.y -= step;
    if (keysPressed['s'] || keysPressed['arrowdown']) pos.y += step;
  }

  // Move sideways always allowed
  if (keysPressed['a'] || keysPressed['arrowleft']) {
    pos.x -= step;
    if (jumpInProgress) lateralDirection = 'left';
  }

  if (keysPressed['d'] || keysPressed['arrowright']) {
    pos.x += step;
    if (jumpInProgress) lateralDirection = 'right';
  }

  updateSheep();
}

function loop() {
  moveSheep();
  requestAnimationFrame(loop);
}
loop();

function jump() {
  if (!isPlaying || jumpInProgress) return;

  jumpInProgress = true;
  jumpScale = getRestingScale(); // fix scale at current resting size for jump

  const originalY = pos.y;
  const jumpHeight = 60;
  const jumpDuration = 800;
  const frames = 30;
  const interval = jumpDuration / frames;
  let frame = 0;

  const jumpInterval = setInterval(() => {
    frame++;
    const progress = frame / frames;

    // Parabolic jump
    const dy = -4 * jumpHeight * progress * (1 - progress);
    pos.y = originalY + dy;

    // Lateral move only in direction during jump
    if (lateralDirection === 'left') pos.x -= step / 4;
    else if (lateralDirection === 'right') pos.x += step / 4;

    updateSheep(jumpScale); // keep size fixed during jump

    if (frame >= frames) {
      clearInterval(jumpInterval);
      jumpInProgress = false;
      lateralDirection = null;
      pos.y = originalY;
      updateSheep();
    }
  }, interval);
}

// Keyboard input tracking
window.addEventListener('keydown', e => {
  if (!isPlaying) return;
  const key = e.key.toLowerCase();

  keysPressed[key] = true;

  // Space triggers jump
  if (key === ' ') {
    jump();
  }
});

window.addEventListener('keyup', e => {
  keysPressed[e.key.toLowerCase()] = false;
});

// Onscreen buttons control
controls.addEventListener('click', e => {
  if (!isPlaying) return;
  const btn = e.target.closest('button');
  if (!btn) return;

  const dir = btn.dataset.dir;
  if (dir) {
    // Simulate key press for arrow buttons
    moveInDirection(dir);
  } else if (btn.id === 'jumpBtn') {
    jump();
  }
});

function moveInDirection(dir) {
  if (jumpInProgress) lateralDirection = null; // reset lateral during manual button move

  switch (dir) {
    case 'up': pos.y -= step; break;
    case 'down': pos.y += step; break;
    case 'left': pos.x -= step; break;
    case 'right': pos.x += step; break;
  }
  updateSheep();
}

// Play / Stop buttons
playBtn.onclick = () => {
  isPlaying = true;
  playBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  isPlaying = false;
  playBtn.disabled = false;
  stopBtn.disabled = true;
  keysPressed = {};
};

window.addEventListener('resize', updateSheep);
updateSheep();
