// SpriteGenerator.js
// Draws all pixel-art sprites programmatically onto a Phaser texture atlas.

export default class SpriteGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  // ── Palette helpers ──────────────────────────────────────────────────────
  static VINCENT = {
    skin:        '#f0c090',
    skinShad:    '#cc9060',
    hair:        '#1a1008',   // very dark, slightly brown-black
    // denim jacket
    shirt:       '#5878b0',
    shirtShad:   '#3858a0',
    jacketLight: '#6890c8',   // lighter denim highlight
    jacketDark:  '#304888',   // collar/lapel shadow
    // baggy pants + dark sneakers
    pants:       '#4a5068',
    pantsShad:   '#2a3048',
    shoes:       '#1a1008',
    eyes:        '#2a1a0a',
    // accessories
    glasses:     '#7a5030',   // warm tortoiseshell frames
    bandana:     '#c04040',   // classic red bandana
    hat:         '#c83030',   // red snapback cap
    hatBrim:     '#a02020',   // brim underside
    baggyPants:  true,        // flag — widens leg rects
  };

  static LISA = {
    skin:     '#f5c9a0',
    skinShad: '#d4956a',
    hair:     '#2a1008',      // dark root
    hairHigh: '#8a6040',      // warm caramel highlight
    // pink hoodie
    shirt:     '#f090b0',
    shirtShad: '#d06888',
    // pink sweatpants
    skirt:     '#f0a0b8',
    skirtShad: '#d07890',
    pants:     '#f5c9a0',     // skin peek below sweatpants
    pantsShad: '#d4956a',
    // brown ugg boots
    uggs:     '#9a7050',      // main boot tan
    uggsTop:  '#c0987a',      // lighter cuff
    uggsDark: '#6a4828',      // boot shadow
    shoes:    '#9a7050',      // fallback = same as uggs
    eyes:     '#2a1a0a',
  };

  static DOG = {
    // black & white shih tzu
    body: '#e8e8e8',
    bodyShad: '#b0b0b0',
    dark: '#1a1a1a',
    darkShad: '#0a0a0a',
    nose: '#1a0a0a',
    eyes: '#1a1a1a',
    tongue: '#e05070',
  };

  static CAT = {
    // grey tabby
    body: '#8a8a8a',
    bodyShad: '#5a5a5a',
    stripe: '#4a4a4a',
    belly: '#c8c8c0',
    eyes: '#70a030',
    nose: '#e07080',
    inner_ear: '#d08090',
  };

  // ── Public entry: generate all textures ─────────────────────────────────
  generateAll() {
    this._makeCharSheet('vincent', SpriteGenerator.VINCENT, false);
    this._makeCharSheet('lisa', SpriteGenerator.LISA, true);
    this._makeDogSheet();
    this._makeCatSheet();
    this._makePaintingFrame();
    this._makeTileset();
  }

  // ── Character sprite sheet (4 dirs × 3 frames = 12 frames, 16×24 each) ──
  _makeCharSheet(key, p, isGirl) {
    const W = 16,
      H = 24,
      COLS = 3,
      ROWS = 4;
    const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
    const dirs = ['down', 'left', 'right', 'up'];

    dirs.forEach((dir, row) => {
      for (let frame = 0; frame < COLS; frame++) {
        const ox = frame * W,
          oy = row * H;
        this._drawChar(gfx, ox, oy, p, isGirl, dir, frame);
      }
    });

    gfx.generateTexture(key, W * COLS, H * ROWS);
    gfx.destroy();

    // Register frame data so generateFrameNumbers works
    const texture = this.scene.textures.get(key);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        texture.add(r * COLS + c, 0, c * W, r * H, W, H);
      }
    }

    // register animation frames
    const scene = this.scene;
    const frameRate = 8;
    dirs.forEach((dir, row) => {
      const startFrame = row * COLS;
      scene.anims.create({
        key: `${key}_walk_${dir}`,
        frames: scene.anims.generateFrameNumbers(key, {
          start: startFrame,
          end: startFrame + 2,
        }),
        frameRate,
        repeat: -1,
      });
      scene.anims.create({
        key: `${key}_idle_${dir}`,
        frames: scene.anims.generateFrameNumbers(key, {
          start: startFrame,
          end: startFrame,
        }),
        frameRate: 4,
        repeat: -1,
      });
    });
  }

  _drawChar(g, ox, oy, p, isGirl, dir, frame) {
    const px = (x, y, c) => {
      g.fillStyle(this._hex(c), 1);
      g.fillRect(ox + x, oy + y, 1, 1);
    };
    const rect = (x, y, w, h, c) => {
      g.fillStyle(this._hex(c), 1);
      g.fillRect(ox + x, oy + y, w, h);
    };

    const isBack = dir === 'up';

    // ── Shadow ────────────────────────────────────────────────────────────
    rect(4, 22, 8, 2, '#00000033');

    // ── Lower body: boots / baggy pants / normal ──────────────────────────
    if (p.uggs) {
      // Tall Ugg boots — cover lower legs
      if (!isBack) {
        rect(3, 15, 4, 7, p.uggs);
        rect(9, 15, 4, 7, p.uggs);
        rect(3, 15, 4, 1, p.uggsTop);   // lighter cuff edge
        rect(9, 15, 4, 1, p.uggsTop);
        rect(4, 16, 2, 5, p.uggsDark);  // inner boot shadow
        rect(10, 16, 2, 5, p.uggsDark);
      } else {
        rect(3, 15, 4, 7, p.uggs);
        rect(9, 15, 4, 7, p.uggs);
      }
    } else if (p.baggyPants) {
      // Wide baggy pants
      if (!isBack) {
        rect(4, 17, 3, 4, p.pants);
        rect(9, 17, 3, 4, p.pants);
        rect(4, 17, 1, 4, p.pantsShad);
        rect(3, 20, 5, 2, p.shoes);
        rect(9, 20, 5, 2, p.shoes);
      } else {
        rect(4, 17, 3, 5, p.pants);
        rect(9, 17, 3, 5, p.pants);
      }
    } else {
      // Standard pants + shoes
      if (!isBack) {
        rect(5, 17, 2, 4, p.pants);
        rect(9, 17, 2, 4, p.pants);
        rect(5 + (frame === 0 ? -1 : frame === 2 ? 1 : 0), 17, 2, 4, p.pantsShad);
        rect(4, 20, 3, 2, p.shoes);
        rect(9, 20, 3, 2, p.shoes);
      } else {
        rect(5, 17, 2, 5, p.pants);
        rect(9, 17, 2, 5, p.pants);
      }
    }

    // ── Torso ─────────────────────────────────────────────────────────────
    if (isGirl) {
      // Pink hoodie body
      rect(4, 10, 8, 6, p.shirt);
      rect(5, 11, 6, 5, p.shirtShad);
      if (!isBack) rect(5, 14, 6, 2, p.shirtShad); // front pocket seam
      // Pink sweatpants waist/hips (uses skirt slot)
      rect(3, 15, 10, 4, p.skirt);
      rect(4, 15, 8, 2, p.skirtShad);
    } else {
      // Denim jacket
      rect(4, 10, 8, 9, p.shirt);
      rect(5, 11, 6, 7, p.shirtShad);
      if (!isBack) {
        rect(4, 10, 2, 8, p.jacketLight); // left chest highlight
        rect(6, 10, 4, 2, p.jacketDark);  // collar/lapel shadow
      }
    }

    // ── Bandana at neck (Vincent only) ────────────────────────────────────
    if (p.bandana && !isBack) {
      rect(5,  9, 6, 1, p.bandana); // neck wrap
      rect(7,  9, 2, 3, p.bandana); // hanging fold
    }

    // ── Arms (walk bob) ───────────────────────────────────────────────────
    const armOff = frame === 1 ? 0 : frame === 0 ? 1 : -1;
    if (dir !== 'up') {
      rect(2, 10 + armOff, 2, 6, p.shirt);
      rect(12, 10 - armOff, 2, 6, p.shirt);
      rect(2, 15 + armOff, 2, 2, p.skin);
      rect(12, 15 - armOff, 2, 2, p.skin);
    } else {
      rect(2, 10, 2, 6, p.shirt);
      rect(12, 10, 2, 6, p.shirt);
    }

    // ── Head ──────────────────────────────────────────────────────────────
    rect(4, 2, 8, 8, p.skin);
    rect(4, 3, 8, 1, p.skinShad);

    // ── Hair ──────────────────────────────────────────────────────────────
    if (isGirl) {
      // Dark root top + long highlighted tresses
      rect(3, 0, 10, 4, p.hair);
      rect(2, 2, 2, 9, p.hair);   // left tress (long)
      rect(12, 2, 2, 9, p.hair);  // right tress
      if (!isBack) {
        // Warm caramel highlights scattered through tresses
        rect(2, 5, 2, 2, p.hairHigh);
        rect(12, 5, 2, 2, p.hairHigh);
        rect(2, 8, 2, 2, p.hairHigh);
        rect(12, 8, 2, 2, p.hairHigh);
        rect(4, 3, 3, 1, p.hairHigh); // highlight stripe at top
      }
    } else {
      // Red snapback cap
      if (p.hat) {
        rect(4,  0, 8, 3, p.hat);      // cap body
        rect(3,  2, 10, 1, p.hatBrim); // brim (slightly wider)
        rect(5,  0, 6, 1, p.hat);      // top round
        rect(4,  0, 1, 3, p.hatBrim);  // left side shadow
        // tiny hair tufts peeking below brim
        rect(3,  3, 2, 1, p.hair);
        rect(11, 3, 2, 1, p.hair);
      } else {
        rect(3, 0, 10, 3, p.hair);
        rect(3, 2, 3,  2, p.hair);
        rect(10, 2, 3, 2, p.hair);
      }
    }

    // ── Face ──────────────────────────────────────────────────────────────
    if (dir === 'down') {
      px(6, 6, p.eyes);
      px(9, 6, p.eyes);
      rect(6, 8, 4, 1, '#c09070');
      // Glasses (Vincent)
      if (p.glasses) {
        rect(5, 5, 3, 3, p.glasses);  // left lens frame
        rect(6, 6, 1, 1, p.skin);     // lens interior
        rect(9, 5, 3, 3, p.glasses);  // right lens frame
        rect(10, 6, 1, 1, p.skin);
        rect(8, 6, 1, 1, p.glasses);  // nose bridge
      }
    } else if (dir === 'left') {
      px(5, 6, p.eyes);
      px(6, 8, '#c09070');
      if (p.glasses) {
        rect(4, 5, 3, 2, p.glasses);
        rect(5, 6, 1, 1, p.skin);
      }
    } else if (dir === 'right') {
      px(10, 6, p.eyes);
      px(9, 8, '#c09070');
      if (p.glasses) {
        rect(9, 5, 3, 2, p.glasses);
        rect(10, 6, 1, 1, p.skin);
      }
    }
  }

  // ── Dog sprite sheet (shih tzu, sitting, 16×16, 2 frames idle) ───────────
  _makeDogSheet() {
    const W = 16,
      H = 16;
    const g = this.scene.make.graphics({ add: false });
    const p = SpriteGenerator.DOG;
    const rect = (x, y, w, h, c) => {
      g.fillStyle(this._hex(c), 1);
      g.fillRect(x, y, w, h);
    };

    // Frame 0 - sitting normal
    this._drawDog(g, 0, 0, p, false);
    // Frame 1 - sitting, head slightly tilted (tongue out)
    this._drawDog(g, W, 0, p, true);

    g.generateTexture('dog', W * 2, H);
    g.destroy();

    const dogTex = this.scene.textures.get('dog');
    dogTex.add(0, 0, 0, 0, W, H);
    dogTex.add(1, 0, W, 0, W, H);

    this.scene.anims.create({
      key: 'dog_idle',
      frames: this.scene.anims.generateFrameNumbers('dog', {
        start: 0,
        end: 1,
      }),
      frameRate: 1,
      repeat: -1,
    });
  }

  _drawDog(g, ox, oy, p, tongue) {
    const rect = (x, y, w, h, c) => {
      g.fillStyle(this._hex(c), 1);
      g.fillRect(ox + x, oy + y, w, h);
    };
    // Body
    rect(3, 8, 10, 6, p.body);
    rect(3, 8, 4, 6, p.dark); // black patches
    rect(10, 10, 3, 4, p.dark);
    // Legs
    rect(4, 13, 2, 3, p.body);
    rect(10, 13, 2, 3, p.body);
    rect(4, 13, 2, 3, p.dark);
    // Tail
    rect(13, 7, 3, 3, p.body);
    // Head
    rect(4, 2, 9, 7, p.body);
    rect(4, 2, 4, 4, p.dark);
    // Snout
    rect(5, 6, 6, 3, p.bodyShad);
    rect(7, 5, 2, 1, p.nose); // nose
    if (tongue) rect(7, 7, 2, 2, p.tongue);
    // Eyes
    rect(5, 3, 2, 2, p.eyes);
    rect(10, 3, 2, 2, p.body);
    rect(10, 3, 1, 1, p.eyes);
    // Fur tufts
    rect(4, 1, 2, 2, p.body);
    rect(11, 1, 2, 2, p.body);
    rect(4, 1, 2, 2, p.dark);
  }

  // ── Cat sprite sheet (grey tabby, 16×14, 2 frames) ───────────────────────
  _makeCatSheet() {
    const W = 16,
      H = 16;
    const g = this.scene.make.graphics({ add: false });
    const p = SpriteGenerator.CAT;

    this._drawCat(g, 0, 0, p, false);
    this._drawCat(g, W, 0, p, true);

    g.generateTexture('cat', W * 2, H);
    g.destroy();

    const catTex = this.scene.textures.get('cat');
    catTex.add(0, 0, 0, 0, W, H);
    catTex.add(1, 0, W, 0, W, H);

    this.scene.anims.create({
      key: 'cat_idle',
      frames: this.scene.anims.generateFrameNumbers('cat', {
        start: 0,
        end: 1,
      }),
      frameRate: 1,
      repeat: -1,
    });
  }

  _drawCat(g, ox, oy, p, blink) {
    const rect = (x, y, w, h, c) => {
      g.fillStyle(this._hex(c), 1);
      g.fillRect(ox + x, oy + y, w, h);
    };
    // Body loaf
    rect(3, 7, 10, 7, p.body);
    rect(3, 7, 10, 2, p.bodyShad);
    // Stripes
    rect(3, 9, 2, 5, p.stripe);
    rect(7, 8, 2, 6, p.stripe);
    rect(11, 9, 2, 5, p.stripe);
    // Belly
    rect(5, 9, 6, 5, p.belly);
    // Tail curl
    rect(13, 5, 3, 5, p.body);
    rect(13, 5, 1, 2, p.stripe);
    // Head
    rect(4, 1, 8, 7, p.body);
    // Ears
    rect(3, 0, 3, 3, p.body);
    rect(11, 0, 3, 3, p.body);
    rect(4, 0, 1, 2, p.inner_ear);
    rect(12, 0, 1, 2, p.inner_ear);
    // Stripes on head
    rect(5, 1, 1, 2, p.stripe);
    rect(7, 1, 2, 2, p.stripe);
    rect(10, 1, 1, 2, p.stripe);
    // Eyes
    if (!blink) {
      rect(5, 4, 3, 2, p.eyes);
      rect(9, 4, 3, 2, p.eyes);
      rect(6, 4, 1, 2, '#1a1a1a');
      rect(10, 4, 1, 2, '#1a1a1a');
    } else {
      rect(5, 5, 3, 1, p.bodyShad);
      rect(9, 5, 3, 1, p.bodyShad);
    }
    // Nose & whiskers
    rect(7, 6, 2, 1, p.nose);
    rect(2, 5, 3, 1, p.bodyShad);
    rect(11, 5, 3, 1, p.bodyShad);
  }

  // ── Painting frame texture (32×40) ──────────────────────────────────────
  _makePaintingFrame() {
    const g = this.scene.make.graphics({ add: false });
    // Will be tinted per painting; draw in golden
    const c = (col) => parseInt(col.replace('#', ''), 16);
    g.fillStyle(0xc0a060, 1);
    g.fillRect(0, 0, 32, 40);
    g.fillStyle(0x8b6b30, 1);
    g.fillRect(3, 3, 26, 34);
    g.fillStyle(0x1a1008, 1);
    g.fillRect(5, 5, 22, 30);
    // corner ornaments
    [
      [0, 0],
      [28, 0],
      [0, 36],
      [28, 36],
    ].forEach(([x, y]) => {
      g.fillStyle(0xffd070, 1);
      g.fillRect(x, y, 4, 4);
    });
    g.generateTexture('painting_frame', 32, 40);
    g.destroy();
  }

  // ── Tileset (assembled from rects, 16×16 each, 8-column sheet) ──────────
  _makeTileset() {
    const T = 16; // tile size
    const COLS = 8,
      ROWS = 12;
    const g = this.scene.make.graphics({ add: false });

    const tile = (col, row, fn) => {
      fn(col * T, row * T);
    };
    const rect = (ox, oy, x, y, w, h, c) => {
      g.fillStyle(this._hex(c), 1);
      g.fillRect(ox + x, oy + y, w, h);
    };

    // 0,0 – wood floor A
    tile(0, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#c8966a');
      rect(ox, oy, 0, 0, 16, 1, '#d4a07a');
      rect(ox, oy, 0, 8, 16, 1, '#b07850');
      rect(ox, oy, 8, 0, 1, 8, '#b07850');
    });
    // 1,0 – wood floor B
    tile(1, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#b8865a');
      rect(ox, oy, 0, 4, 16, 1, '#c89060');
      rect(ox, oy, 0, 12, 16, 1, '#a07040');
      rect(ox, oy, 4, 4, 1, 8, '#a07040');
    });
    // 2,0 – wall (top wallpaper)
    tile(2, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#8a7898');
      rect(ox, oy, 0, 0, 16, 1, '#6a5878');
      rect(ox, oy, 0, 15, 16, 1, '#6a5878');
      // small diamond pattern
      [2, 6, 10, 14].forEach((x) =>
        [3, 11].forEach((y) => {
          rect(ox, oy, x, y, 2, 2, '#7a6888');
        }),
      );
    });
    // 3,0 – wall (lower wainscoting)
    tile(3, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#6a5060');
      rect(ox, oy, 1, 1, 14, 14, '#7a6070');
      rect(ox, oy, 0, 0, 16, 1, '#9a8090');
    });
    // 4,0 – rug centre (deep red)
    tile(4, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#802030');
      [1, 5, 9, 13].forEach((x) => {
        rect(ox, oy, x, 0, 1, 16, '#702028');
      });
    });
    // 5,0 – rug border
    tile(5, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#a03040');
      rect(ox, oy, 2, 2, 12, 12, '#802030');
      rect(ox, oy, 0, 0, 16, 2, '#c09070');
      rect(ox, oy, 0, 14, 16, 2, '#c09070');
    });
    // 6,0 – rug corner
    tile(6, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#a03040');
      rect(ox, oy, 2, 2, 14, 14, '#802030');
      rect(ox, oy, 0, 0, 16, 2, '#c09070');
      rect(ox, oy, 0, 0, 2, 16, '#c09070');
    });
    // 7,0 – skirting board
    tile(7, 0, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#8a7898');
      rect(ox, oy, 0, 14, 16, 2, '#c0b0d0');
    });

    // Row 1 – furniture
    // 0,1 – bookshelf lower
    tile(0, 1, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#7a5030');
      rect(ox, oy, 1, 1, 14, 14, '#5a3818');
      // books
      [
        [1, '#c03030'],
        [3, '#3060a0'],
        [5, '#308040'],
        [7, '#a09020'],
        [9, '#804080'],
        [11, '#c06020'],
        [13, '#205080'],
      ].forEach(([x, c]) => {
        rect(ox, oy, x, 1, 2, 14, c);
      });
    });
    // 1,1 – bookshelf top (same)
    tile(1, 1, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#7a5030');
      rect(ox, oy, 1, 1, 14, 14, '#5a3818');
      [
        [1, '#a02020'],
        [3, '#204080'],
        [5, '#206030'],
        [7, '#808010'],
        [9, '#602060'],
        [11, '#a04010'],
        [13, '#103060'],
      ].forEach(([x, c]) => {
        rect(ox, oy, x, 1, 2, 14, c);
      });
      // small vase on top
      rect(ox, oy, 6, 0, 4, 2, '#e8c060');
    });
    // 2,1 – fireplace
    tile(2, 1, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#6a5040');
      rect(ox, oy, 2, 0, 12, 14, '#2a1a0a');
      rect(ox, oy, 4, 8, 8, 6, '#ff6010'); // fire glow
      rect(ox, oy, 5, 9, 6, 5, '#ffa030');
      rect(ox, oy, 6, 10, 4, 4, '#ffee80');
      rect(ox, oy, 0, 14, 16, 2, '#8a7060'); // mantle
    });
    // 3,1 – fireplace mantle top
    tile(3, 1, (ox, oy) => {
      rect(ox, oy, 0, 14, 16, 2, '#8a7060');
      rect(ox, oy, 0, 0, 16, 14, '#8a7898'); // wall above
      // candle on mantle
      rect(ox, oy, 5, 10, 2, 4, '#f8f0d0');
      rect(ox, oy, 5, 9, 2, 1, '#ffd070');
      rect(ox, oy, 6, 8, 1, 1, '#ff8020');
    });
    // 4,1 – potted plant (big)
    tile(4, 1, (ox, oy) => {
      rect(ox, oy, 0, 8, 16, 8, '#8a7898'); // wall bg
      rect(ox, oy, 5, 13, 6, 3, '#7a5030'); // pot
      rect(ox, oy, 6, 11, 4, 3, '#5a3818');
      // leaves
      rect(ox, oy, 4, 4, 8, 8, '#208040');
      rect(ox, oy, 2, 6, 5, 6, '#308050');
      rect(ox, oy, 9, 5, 5, 7, '#186030');
      rect(ox, oy, 5, 1, 6, 5, '#40a060');
    });
    // 5,1 – small table
    tile(5, 1, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#c8966a'); // floor
      rect(ox, oy, 1, 5, 14, 4, '#8a5030'); // tabletop
      rect(ox, oy, 3, 9, 3, 7, '#6a3818'); // legs
      rect(ox, oy, 10, 9, 3, 7, '#6a3818');
    });
    // 6,1 – cushion / floor pillow
    tile(6, 1, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#c8966a');
      rect(ox, oy, 2, 6, 12, 7, '#a03060');
      rect(ox, oy, 3, 7, 10, 5, '#c04070');
      rect(ox, oy, 6, 7, 4, 5, '#d06090');
    });
    // 7,1 – window (wall tile)
    tile(7, 1, (ox, oy) => {
      rect(ox, oy, 0, 0, 16, 16, '#8a7898');
      rect(ox, oy, 2, 1, 12, 14, '#80b8e8'); // sky
      rect(ox, oy, 2, 1, 12, 6, '#a0d0f8'); // upper sky
      rect(ox, oy, 8, 1, 1, 14, '#7a6070'); // cross
      rect(ox, oy, 2, 8, 12, 1, '#7a6070');
      rect(ox, oy, 1, 0, 14, 1, '#b0a0b8'); // frame
      rect(ox, oy, 1, 15, 14, 1, '#b0a0b8');
      rect(ox, oy, 1, 0, 1, 16, '#b0a0b8');
      rect(ox, oy, 14, 0, 1, 16, '#b0a0b8');
    });

    // Row 2: floor items / decorations
    // 0,2 – chest / small dresser
    tile(0, 2, (ox, oy) => {
      rect(ox, oy, 1, 4, 14, 11, '#8a5030');
      rect(ox, oy, 1, 4, 14, 2, '#6a3818'); // lid edge
      rect(ox, oy, 6, 8, 4, 3, '#c0a060'); // clasp
      rect(ox, oy, 7, 9, 2, 1, '#1a1008');
    });

    g.generateTexture('tileset', T * COLS, T * ROWS);
    g.destroy();
  }

  _hex(str) {
    return parseInt(str.replace('#', ''), 16);
  }
}
