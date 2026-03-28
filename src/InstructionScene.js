// InstructionScene.js — shown after character select, before museum
export default class InstructionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Instructions' });
  }

  init(data) {
    this.charKey = data.character || 'vincent';
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const isMobile = width <= 480;

    // ── Background ───────────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x1c1a12, 1);
    bg.fillRect(0, 0, width, height);
    // Floor strip at bottom
    bg.fillStyle(0xd4bc94, 1);
    bg.fillRect(0, height - 48, width, 48);
    bg.fillStyle(0xc4aa80, 1);
    bg.fillRect(0, height - 48, width, 3);

    // ── Outer panel ──────────────────────────────────────────────────────────
    const pad = 16;
    const panelW = Math.min(width - pad * 2, 480);
    const panelH = height - 80;
    const panelX = cx - panelW / 2;
    const panelY = 16;

    const panel = this.add.graphics();
    panel.fillStyle(0x2a2618, 1);
    panel.fillRect(panelX, panelY, panelW, panelH);
    panel.lineStyle(3, 0xc8a870, 1);
    panel.strokeRect(panelX, panelY, panelW, panelH);
    panel.lineStyle(1, 0x8a7040, 0.6);
    panel.strokeRect(panelX + 5, panelY + 5, panelW - 10, panelH - 10);

    // ── Title ────────────────────────────────────────────────────────────────
    this.add
      .text(cx, panelY + 22, '✦  HOW TO PLAY  ✦', {
        fontFamily: '"Press Start 2P"',
        fontSize: isMobile ? '10px' : '13px',
        color: '#c8a870',
        stroke: '#3a2c10',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(2, 0x8a7040, 0.8);
    div.lineBetween(panelX + 20, panelY + 58, panelX + panelW - 20, panelY + 58);

    // ── Controls ─────────────────────────────────────────────────────────────
    const controls = isMobile
      ? [
          { icon: '✦', key: 'D-PAD',            desc: 'Move around the museum' },
          { icon: '👆', key: 'Tap a painting',   desc: 'View your memory' },
          { icon: '✕', key: 'Tap outside photo', desc: 'Close and keep exploring' },
        ]
      : [
          { icon: '✦', key: '↑  ↓  ←  →   /   W A S D', desc: 'Move around the museum' },
          { icon: '🖱', key: 'Click a painting',           desc: 'View your memory' },
          { icon: '✕', key: 'ESC  /  Click outside',      desc: 'Close and keep exploring' },
        ];

    const rowH    = isMobile ? 60 : 68;
    const startY  = panelY + 70;
    const iconX   = panelX + 28;
    const textX   = panelX + 64;

    controls.forEach(({ icon, key, desc }, i) => {
      const y = startY + i * rowH;

      // Row background
      const rb = this.add.graphics();
      rb.fillStyle(0x3a3020, 0.5);
      rb.fillRect(panelX + 12, y - 4, panelW - 24, rowH - 8);
      rb.lineStyle(1, 0x6a5828, 0.4);
      rb.strokeRect(panelX + 12, y - 4, panelW - 24, rowH - 8);

      // Icon
      this.add
        .text(iconX, y + (rowH / 2) - 14, icon, {
          fontFamily: '"Press Start 2P"',
          fontSize: isMobile ? '14px' : '16px',
          color: '#c8a870',
        })
        .setOrigin(0.5, 0);

      // Key / action (VT323 for readability)
      this.add
        .text(textX, y + 4, key, {
          fontFamily: 'VT323, monospace',
          fontSize: isMobile ? '22px' : '26px',
          color: '#f0e8d0',
          letterSpacing: 1,
        })
        .setOrigin(0, 0);

      // Description
      this.add
        .text(textX, y + (isMobile ? 28 : 32), desc, {
          fontFamily: 'VT323, monospace',
          fontSize: isMobile ? '18px' : '20px',
          color: '#9aba98',
        })
        .setOrigin(0, 0);
    });

    // ── Bottom accent ─────────────────────────────────────────────────────────
    div.lineBetween(panelX + 20, panelY + panelH - 36, panelX + panelW - 20, panelY + panelH - 36);

    this.add
      .text(cx, panelY + panelH - 26, '♥   3 years of memories   ♥', {
        fontFamily: 'VT323, monospace',
        fontSize: isMobile ? '20px' : '22px',
        color: '#9aba98',
      })
      .setOrigin(0.5);

    // ── Tap-to-begin prompt ───────────────────────────────────────────────────
    const prompt = this.add
      .text(cx, height - 28, 'TAP ANYWHERE TO BEGIN  ▶', {
        fontFamily: '"Press Start 2P"',
        fontSize: isMobile ? '7px' : '9px',
        color: '#f0e8d0',
        stroke: '#1c1a12',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.15 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    // ── Input ─────────────────────────────────────────────────────────────────
    this.input.once('pointerdown', () => this._go());
    this.input.keyboard.once('keydown', () => this._go());
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _go() {
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('Museum', { character: this.charKey });
    });
  }
}
