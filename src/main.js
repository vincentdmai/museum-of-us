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
    { label: '▲', row: 1, col: 2, key: 'ArrowUp' },
    { label: '◀', row: 2, col: 1, key: 'ArrowLeft' },
    { label: '▶', row: 2, col: 3, key: 'ArrowRight' },
    { label: '▼', row: 3, col: 2, key: 'ArrowDown' },
  ];

  buttons.forEach(({ label, row, col, key }) => {
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
    `;

    const fireKey = (down) => {
      const evt = new KeyboardEvent(down ? 'keydown' : 'keyup', {
        key,
        bubbles: true,
      });
      document.dispatchEvent(evt);
    };

    btn.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        fireKey(true);
      },
      { passive: false },
    );
    btn.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        fireKey(false);
      },
      { passive: false },
    );
    btn.addEventListener('mousedown', () => fireKey(true));
    btn.addEventListener('mouseup', () => fireKey(false));
    dpad.appendChild(btn);
  });

  document.body.appendChild(dpad);
}
