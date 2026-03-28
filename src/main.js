// main.js
import CharacterSelect from './CharacterSelect.js';
import InstructionScene from './InstructionScene.js';
import MuseumScene from './MuseumScene.js';

const isMobile = window.innerWidth <= 768;
const GAME_W = isMobile ? Math.min(window.innerWidth, 480) : 768;
const GAME_H = isMobile ? Math.min(window.innerHeight, 480) : 576;

const config = {
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#0a0a0f',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [CharacterSelect, InstructionScene, MuseumScene],
};

const game = new Phaser.Game(config);

// Shared D-pad state read directly by MuseumScene
window.dpadKeys = { up: false, down: false, left: false, right: false };

// Mobile touch controls — D-pad overlay
if (isMobile) {
  _buildDPad();
}

function _buildDPad() {
  const dpad = document.createElement('div');
  dpad.id = 'dpad';
  dpad.style.cssText = `
    position:fixed; bottom:20px; left:20px; z-index:800;
    display:grid; grid-template-columns: repeat(3,44px); grid-template-rows: repeat(3,44px);
    gap:4px;
  `;

  const buttons = [
    { label: '▲', row: 1, col: 2, dir: 'up' },
    { label: '◀', row: 2, col: 1, dir: 'left' },
    { label: '▶', row: 2, col: 3, dir: 'right' },
    { label: '▼', row: 3, col: 2, dir: 'down' },
  ];

  buttons.forEach(({ label, row, col, dir }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      grid-row:${row}; grid-column:${col};
      width:44px; height:44px;
      background:#1a0d2a; border:2px solid #c0a060; color:#f0d898;
      font-size:18px; cursor:pointer; border-radius:4px;
      font-family:'Press Start 2P',monospace;
      -webkit-tap-highlight-color: transparent;
      touch-action: none;
      user-select: none;
    `;

    const press = () => { window.dpadKeys[dir] = true; };
    const release = () => { window.dpadKeys[dir] = false; };

    btn.addEventListener('touchstart', (e) => { e.preventDefault(); press(); }, { passive: false });
    btn.addEventListener('touchend',   (e) => { e.preventDefault(); release(); }, { passive: false });
    btn.addEventListener('touchcancel',(e) => { e.preventDefault(); release(); }, { passive: false });
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
    dpad.appendChild(btn);
  });

  document.body.appendChild(dpad);
}
