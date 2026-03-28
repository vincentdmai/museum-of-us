// CharacterSelect.js
export default class CharacterSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelect' });
  }

  preload() {
    // Phaser is loaded via CDN; no external assets needed
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // ── Background ──────────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0a1a, 0x0d0a1a, 0x1a0d2a, 0x1a0d2a, 1);
    bg.fillRect(0, 0, width, height);

    // Pixel star field
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const s = Phaser.Math.Between(1, 2);
      this.add.rectangle(
        x,
        y,
        s,
        s,
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1.0),
      );
    }

    // ── Title panel ─────────────────────────────────────────────────────────
    const panelW = Math.min(width - 20, 360);
    const panel = this.add.graphics();
    panel.fillStyle(0x1a0d2a, 1);
    panel.fillRect(cx - panelW / 2, 12, panelW, 52);
    panel.lineStyle(3, 0xc0a060, 1);
    panel.strokeRect(cx - panelW / 2, 12, panelW, 52);
    panel.lineStyle(1, 0x8b6b30, 1);
    panel.strokeRect(cx - panelW / 2 + 3, 15, panelW - 6, 46);

    this.add
      .text(cx, 28, '✦ MUSEUM OF US ✦', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#f0d898',
        stroke: '#8b6b30',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0);

    this.add
      .text(cx, 46, 'choose your character', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#c0a060',
      })
      .setOrigin(0.5, 0);

    // ── Character cards ──────────────────────────────────────────────────────
    const cardW = Math.min((width - 60) / 2, 130);
    const cardH = 160;
    const gap = 20;
    const totalW = cardW * 2 + gap;
    const leftX = cx - totalW / 2;
    const cardY = 80;

    [
      {
        key: 'vincent',
        label: 'VINCENT',
        sub: 'player 1',
        color: 0x3a5f8a,
        accent: 0x80b8e8,
      },
      {
        key: 'lisa',
        label: 'LISA',
        sub: 'player 2',
        color: 0xc05080,
        accent: 0xf090b8,
      },
    ].forEach((ch, i) => {
      const cx2 = leftX + i * (cardW + gap) + cardW / 2;
      const cy2 = cardY + cardH / 2;

      // Card bg
      const card = this.add.graphics();
      card.fillStyle(0x120820, 1);
      card.fillRect(cx2 - cardW / 2, cardY, cardW, cardH);
      card.lineStyle(3, ch.color, 1);
      card.strokeRect(cx2 - cardW / 2, cardY, cardW, cardH);

      // Sprite preview (drawn as coloured pixel art silhouette)
      this._drawCharPreview(cx2, cardY + 70, ch.key, ch.color);

      // Name
      this.add
        .text(cx2, cardY + cardH - 44, ch.label, {
          fontFamily: '"Press Start 2P"',
          fontSize: '9px',
          color: '#' + ch.accent.toString(16).padStart(6, '0'),
          stroke: '#000',
          strokeThickness: 2,
        })
        .setOrigin(0.5);

      this.add
        .text(cx2, cardY + cardH - 28, ch.sub, {
          fontFamily: '"Press Start 2P"',
          fontSize: '6px',
          color: '#8878a8',
        })
        .setOrigin(0.5);

      // Select button
      const btnW = cardW - 16,
        btnH = 20;
      const btn = this.add.graphics();
      btn.fillStyle(ch.color, 1);
      btn.fillRect(cx2 - btnW / 2, cardY + cardH - 18, btnW, btnH);

      const btnText = this.add
        .text(cx2, cardY + cardH - 8, 'SELECT ▶', {
          fontFamily: '"Press Start 2P"',
          fontSize: '7px',
          color: '#ffffff',
        })
        .setOrigin(0.5);

      // Hit zone
      const zone = this.add
        .zone(cx2, cy2, cardW, cardH)
        .setInteractive({ cursor: 'pointer' });

      zone.on('pointerover', () => {
        card.clear();
        card.fillStyle(0x1e1030, 1);
        card.fillRect(cx2 - cardW / 2, cardY, cardW, cardH);
        card.lineStyle(3, ch.accent, 1);
        card.strokeRect(cx2 - cardW / 2, cardY, cardW, cardH);
        btn.clear();
        btn.fillStyle(ch.accent, 1);
        btn.fillRect(cx2 - btnW / 2, cardY + cardH - 18, btnW, btnH);
      });

      zone.on('pointerout', () => {
        card.clear();
        card.fillStyle(0x120820, 1);
        card.fillRect(cx2 - cardW / 2, cardY, cardW, cardH);
        card.lineStyle(3, ch.color, 1);
        card.strokeRect(cx2 - cardW / 2, cardY, cardW, cardH);
        btn.clear();
        btn.fillStyle(ch.color, 1);
        btn.fillRect(cx2 - btnW / 2, cardY + cardH - 18, btnW, btnH);
      });

      zone.on('pointerdown', () => {
        this._flashAndStart(cx2, cy2, ch.key);
      });
    });

    // ── Prompt ───────────────────────────────────────────────────────────────
    const prompt = this.add
      .text(cx, height - 22, '↑↓←→ MOVE   CLICK PAINTINGS TO REMEMBER ♥', {
        fontFamily: '"Press Start 2P"',
        fontSize: '5px',
        color: '#6a5878',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.3 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });
  }

  _drawCharPreview(cx, cy, charKey, color) {
    const g = this.add.graphics();
    const S = 4;

    const pix = (x, y, c) => {
      g.fillStyle(c, 1);
      g.fillRect(cx + (x - 8) * S, cy + (y - 12) * S, S, S);
    };
    const row = (x1, x2, y, c) => {
      for (let x = x1; x <= x2; x++) pix(x, y, c);
    };

    if (charKey === 'lisa') {
      const skin = 0xf5c9a0, hair = 0x2a1008, hairHi = 0x8a6040;
      const hoodie = 0xf090b0, hoodieShad = 0xd06888;
      const pants = 0xf0a0b8;
      const ugg = 0x9a7050, uggTop = 0xc0987a, uggShad = 0x6a4828;
      const eye = 0x2a1a0a;

      // Hair top (dark roots, wide)
      row(5, 11, 0, hair);
      row(4, 12, 1, hair);
      row(4, 12, 2, hair);

      // Face
      for (let y = 3; y <= 8; y++) row(5, 11, y, skin);

      // Long side tresses with caramel highlights running down
      for (let y = 3; y <= 13; y++) {
        const c = y % 3 === 0 ? hairHi : hair;
        pix(4, y, c);
        pix(12, y, c);
      }

      // Eyes + mouth
      pix(7, 5, eye); pix(9, 5, eye);
      row(7, 9, 7, 0xc09070);

      // Pink hoodie body + shading
      for (let y = 8; y <= 12; y++) row(5, 11, y, hoodie);
      row(6, 10, 11, hoodieShad);
      row(6, 10, 12, hoodieShad);

      // Arms
      pix(4, 8, hoodie); pix(4, 9, hoodie); pix(4, 10, skin);
      pix(12, 8, hoodie); pix(12, 9, hoodie); pix(12, 10, skin);

      // Pink sweatpants
      row(4, 12, 13, pants);
      row(4, 12, 14, pants);

      // Ugg boots (tall, covers lower leg)
      row(4, 7,  14, uggTop);   row(9, 12, 14, uggTop);  // cuff
      row(4, 7,  15, ugg);      row(9, 12, 15, ugg);
      row(4, 7,  16, ugg);      row(9, 12, 16, ugg);
      pix(5, 15, uggShad); pix(6, 15, uggShad);
      pix(10, 15, uggShad); pix(11, 15, uggShad);

    } else {
      const skin = 0xf0c090, hair = 0x1a1008;
      const denim = 0x5878b0, denimLight = 0x6890c8, denimShad = 0x3858a0;
      const bandana = 0xc04040;
      const pants = 0x4a5068, pantsShad = 0x2a3048;
      const shoes = 0x1a1008;
      const eye = 0x2a1a0a, glasses = 0x7a5030;

      // Red snapback cap
      const hat = 0xc83030, hatBrim = 0xa02020;
      row(4, 12, 0, hat);
      row(4, 12, 1, hat);
      row(3, 13, 2, hatBrim);  // brim slightly wider
      // hair peeking out under brim
      pix(3, 3, hair); pix(4, 3, hair);
      pix(12, 3, hair); pix(13, 3, hair);

      // Face
      for (let y = 3; y <= 8; y++) row(5, 11, y, skin);

      // Eyes
      pix(7, 5, eye); pix(9, 5, eye);
      // Mouth
      row(7, 9, 7, 0xc09070);

      // Glasses — round tortoiseshell frames
      pix(5,4,glasses); pix(6,4,glasses); pix(7,4,glasses);
      pix(5,5,glasses);                    pix(7,5,glasses);
      pix(5,6,glasses); pix(6,6,glasses); pix(7,6,glasses);
      pix(8,5,glasses); // bridge
      pix(9,4,glasses);  pix(10,4,glasses); pix(11,4,glasses);
      pix(9,5,glasses);                      pix(11,5,glasses);
      pix(9,6,glasses);  pix(10,6,glasses);  pix(11,6,glasses);

      // Red bandana at neck
      row(6, 10, 8, bandana);
      pix(7, 9, bandana); pix(8, 9, bandana);

      // Denim jacket
      for (let y = 9; y <= 12; y++) row(5, 11, y, denim);
      pix(5, 9, denimLight); pix(5, 10, denimLight); pix(5, 11, denimLight);
      pix(6, 9, denimShad);  pix(7, 9, denimShad);

      // Arms
      pix(4, 9, denim); pix(4, 10, denim); pix(4, 11, skin);
      pix(12, 9, denim); pix(12, 10, denim); pix(12, 11, skin);

      // Baggy pants (wide legs)
      row(4, 7,  12, pants); row(9, 12, 12, pants);
      row(4, 7,  13, pants); row(9, 12, 13, pants);
      pix(4,12,pantsShad); pix(4,13,pantsShad);
      pix(9,12,pantsShad); pix(9,13,pantsShad);

      // Wide shoes
      row(3, 8,  14, shoes);
      row(9, 13, 14, shoes);
    }
  }

  _flashAndStart(cx, cy, charKey) {
    const flash = this.add
      .rectangle(cx, cy, 200, 200, 0xffffff, 0)
      .setDepth(10);
    this.tweens.add({
      targets: flash,
      fillAlpha: { from: 0, to: 0.8 },
      duration: 120,
      yoyo: true,
      onComplete: () => {
        this.cameras.main.fade(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start('Instructions', { character: charKey });
        });
      },
    });
  }
}
