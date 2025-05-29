const sheep = document.getElementById('sheep');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
let isPlaying = true;
const step = 10;
const baseSize = 30;
const minScale = 1.2;
const maxScale = 5.0;

let pos = {
  x: window.innerWidth / 2,
  y: window.innerHeight * 0.7
};

function updateSheep() {
  const bounds = document.getElementById('gameArea').getBoundingClientRect();
  const sheepSize = baseSize;

  // Boundaries
  pos.x = Math.max(0, Math.min(pos.x, bounds.width - sheepSize));
  pos.y = Math.max(bounds.height * 0.3, Math.min(pos.y, bounds.height - sheepSize));

  // Scale based on vertical position
  const range = bounds.height - bounds.height * 0.3;
  const relativeY = pos.y - bounds.height * 0.3;
  const scale = minScale + (relativeY / range) * (maxScale - minScale);

  sheep.style.left = `${pos.x}px`;
  sheep.style.top = `${pos.y}px`;
  sheep.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(2)})`;
}

function move(direction) {
  if (!isPlaying) return;
  if (direction === 'up') pos.y -= step;
  if (direction === 'down') pos.y += step;
  if (direction === 'left') pos.x -= step;
  if (direction === 'right') pos.x += step;
  updateSheep();
}

window.addEventListener('keydown', e => {
  if (!isPlaying) return;
  if (["ArrowUp", "w"].includes(e.key)) move('up');
  if (["ArrowDown", "s"].includes(e.key)) move('down');
  if (["ArrowLeft", "a"].includes(e.key)) move('left');
  if (["ArrowRight", "d"].includes(e.key)) move('right');
});

playBtn.onclick = () => {
  isPlaying = true;
  playBtn.disabled = true;
  stopBtn.disabled = false;
};
stopBtn.onclick = () => {
  isPlaying = false;
  playBtn.disabled = false;
  stopBtn.disabled = true;
};

window.addEventListener('resize', updateSheep);
updateSheep();
