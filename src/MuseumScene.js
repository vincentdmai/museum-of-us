// MuseumScene.js
import SpriteGenerator from './SpriteGenerator.js';
import PhotoModal from './Photomodal.js';

const TILE = 16;
const SCALE = 3; // 3× pixel scale → 48px per tile on screen

// Map layout — 16 cols × 12 rows (tile indices, 0-based)
// Row 0-1: wall tiles  Row 2-11: floor tiles
// Special positions handled via object layer below
const MAP_W = 16,
  MAP_H = 12;

/*  Tile index legend (matches SpriteGenerator tileset columns/rows):
    0  = wood floor A
    1  = wood floor B
    2  = wall upper (wallpaper)
    3  = wall lower (wainscoting)
    4  = rug centre
    5  = rug border horizontal
    6  = rug corner
    7  = skirting board row
   16  = bookshelf lower  (row 1, col 0)
   17  = bookshelf top    (row 1, col 1)
   18  = fireplace        (row 1, col 2)
   19  = fireplace mantle (row 1, col 3)
   20  = potted plant     (row 1, col 4)
   21  = small table      (row 1, col 5)
   22  = floor cushion    (row 1, col 6)
   23  = window           (row 1, col 7)
   32  = chest            (row 2, col 0)
*/

const FLOOR_A = 0,
  FLOOR_B = 1;
const WALL_UP = 2,
  WALL_LO = 3,
  SKIRTING = 7;
const RUG_C = 4,
  RUG_BH = 5,
  RUG_CO = 6;
const BOOKLO = 16,
  BOOKHI = 17,
  FIRE = 18,
  MANTLE = 19;
const PLANT = 20,
  TABLE = 21,
  CUSHION = 22,
  WINDOW = 23;
const COUCH_L = 24,
  COUCH_M = 25,
  COUCH_R = 26;
const LAMP = 27,
  COFFEE_TBL = 28,
  COFFEE_MAG = 29,
  COFFEE_MATCHA = 30;

// prettier-ignore
const GROUND_LAYER = [
  // row 0: upper wall
  [WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP,WALL_UP],
  // row 1: lower wall / wainscot
  [WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO,WALL_LO],
  // row 2: skirting + floor begins
  [SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING,SKIRTING],
  // rows 3-11: floor (alternating A/B for wood grain)
  [FLOOR_A,FLOOR_B,FLOOR_A,RUG_CO, RUG_BH,RUG_BH,RUG_BH,RUG_BH, RUG_BH,RUG_BH,RUG_BH,RUG_CO, FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B],
  [FLOOR_B,FLOOR_A,FLOOR_B,RUG_BH, RUG_C, RUG_C, RUG_C, RUG_C,  RUG_C, RUG_C, RUG_C, RUG_BH, FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A],
  [FLOOR_A,FLOOR_B,FLOOR_A,RUG_BH, RUG_C, RUG_C, RUG_C, RUG_C,  RUG_C, RUG_C, RUG_C, RUG_BH, FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B],
  [FLOOR_B,FLOOR_A,FLOOR_B,RUG_BH, RUG_C, RUG_C, RUG_C, RUG_C,  RUG_C, RUG_C, RUG_C, RUG_BH, FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A],
  [FLOOR_A,FLOOR_B,FLOOR_A,RUG_BH, RUG_C, RUG_C, RUG_C, RUG_C,  RUG_C, RUG_C, RUG_C, RUG_BH, FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B],
  [FLOOR_B,FLOOR_A,FLOOR_B,RUG_CO, RUG_BH,RUG_BH,RUG_BH,RUG_BH, RUG_BH,RUG_BH,RUG_BH,RUG_CO, FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A],
  [FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B],
  [FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A],
  [FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B,FLOOR_A,FLOOR_B],
];

// Furniture / decor object layer [tileX, tileY, tileIndex, collides]
const OBJECTS = [
  // Windows — between paintings (cols 3, 8, 10, 14)
  [5,  0, WINDOW,       false],
  [6,  0, WINDOW,       false],
  [12, 0, WINDOW,       false],
  [13, 0, WINDOW,       false],
  // Lamps — in wall row, collides:false to avoid spilling into walkable row 3
  [1,  1, LAMP,         false],
  [14, 1, LAMP,         false],
  // Plants — same reasoning
  [2,  1, PLANT,        false],
  [13, 1, PLANT,        false],
  // Conversation pit — 5-wide sectional sofa (cols 4-8, row 4)
  [4,  4, COUCH_L,      true],
  [5,  4, COUCH_M,      true],
  [6,  4, COUCH_M,      true],
  [7,  4, COUCH_M,      true],
  [8,  4, COUCH_R,      true],
  // Side table right of pit
  [10, 4, TABLE,        true],
  // Spacious coffee table (plain | magazine | matcha | plain)
  [5,  6, COFFEE_TBL,   false],
  [6,  6, COFFEE_MAG,   false],
  [7,  6, COFFEE_MATCHA,false],
  [8,  6, COFFEE_TBL,   false],
  // Floor cushions flanking the table
  [4,  7, CUSHION,      false],
  [9,  7, CUSHION,      false],
  // Corner plants
  [1,  9, PLANT,        false],
  [14, 9, PLANT,        false],
];

// Painting positions [tileX (wall col), paintingIndex]
// Paintings hang on the top wall (row 0-1), we'll render them as overlays
const PAINTING_POSITIONS = [
  { tileX: 3, paintingIdx: 0 },
  { tileX: 8, paintingIdx: 1 },
  { tileX: 10, paintingIdx: 2 },
  { tileX: 14, paintingIdx: 3 },
  // Side wall left (col 0, varying rows)
  { tileX: 0, tileY: 4, paintingIdx: 4, vertical: true },
  { tileX: 0, tileY: 7, paintingIdx: 5, vertical: true },
];

export default class MuseumScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Museum' });
  }

  init(data) {
    this.charKey = data.character || 'vincent';
  }

  preload() {
    this.load.json('manifest', 'assets/photos/manifest.json');
  }

  create() {
    const { width, height } = this.scale;

    // Generate all sprites programmatically
    const gen = new SpriteGenerator(this);
    gen.generateAll();

    // Load photo manifest from Phaser cache (loaded synchronously in preload)
    const raw = this.cache.json.get('manifest');
    this.manifest = raw || {
      paintings: PAINTING_POSITIONS.map((_, i) => ({
        id: `painting_${i + 1}`,
        photo: `assets/photos/photo${i + 1}.jpg`,
        caption: `Memory #${i + 1} — add your photo and caption in manifest.json ♥`,
        date: '— —',
        frameColor: [
          '#c0a060',
          '#8b6b4a',
          '#4a7c8b',
          '#6b4a8b',
          '#4a8b5a',
          '#8b4a4a',
        ][i % 6],
      })),
    };
    this.modal = new PhotoModal();

    this._buildTilemap();
    this._spawnPaintings();
    this._spawnFurniture();
    this._spawnPets();
    this._spawnPlayer();
    this._setupInput();
    this._setupCamera(width, height);
    this._setupHint();

    // Fade in
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Character name toast
    this.time.delayedCall(700, () =>
      this._showToast(
        `Welcome, ${this.charKey === 'vincent' ? 'Vincent' : 'Lisa'}! ♥`,
      ),
    );
  }

  // ── Tilemap ────────────────────────────────────────────────────────────────
  _buildTilemap() {
    const T = TILE * SCALE;
    this.mapOffX = 0;
    this.mapOffY = 0;
    this.tileGraphics = this.add.graphics().setDepth(0);

    // Draw ground layer
    for (let row = 0; row < MAP_H; row++) {
      for (let col = 0; col < MAP_W; col++) {
        const idx = GROUND_LAYER[row][col];
        this._drawTile(this.tileGraphics, col * T, row * T, idx);
      }
    }

    // Collision map (true = blocked)
    this.collisionMap = Array.from({ length: MAP_H }, () =>
      new Array(MAP_W).fill(false),
    );
    // Top 2 rows always blocked (walls)
    for (let c = 0; c < MAP_W; c++) {
      this.collisionMap[0][c] = true;
      this.collisionMap[1][c] = true;
      this.collisionMap[2][c] = true;
    }
    // Edges
    for (let r = 0; r < MAP_H; r++) {
      this.collisionMap[r][0] = true;
      this.collisionMap[r][MAP_W - 1] = true;
    }
  }

  _drawTile(g, px, py, tileIdx) {
    const col = tileIdx % 8;
    const row = Math.floor(tileIdx / 8);
    // We re-use the tileset texture by rendering it as a cropped image
    // Since we generated the texture, we blit via an Image object approach:
    // Instead, we draw each tile type directly here for reliability.
    const T = TILE * SCALE;
    const S = SCALE;

    // Helper lambdas
    const fill = (c) => g.fillStyle(c, 1);
    const rect = (x, y, w, h, c) => {
      g.fillStyle(c, 1);
      g.fillRect(px + x * S, py + y * S, w * S, h * S);
    };

    switch (tileIdx) {
      case FLOOR_A:
        // warm light oak planks
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(0, 0, 16, 1, 0xe0caa0);
        rect(0, 8, 16, 1, 0xbca070);
        rect(8, 0, 1, 8, 0xbca070);
        break;
      case FLOOR_B:
        rect(0, 0, 16, 16, 0xc4aa80);
        rect(0, 4, 16, 1, 0xd4b888);
        rect(0, 12, 16, 1, 0xb09060);
        rect(4, 4, 1, 8, 0xb09060);
        break;
      case WALL_UP:
        // sage green wallpaper with subtle diamond
        rect(0, 0, 16, 16, 0x8fa88a);
        rect(0, 0, 16, 1, 0x6e8a6e);
        rect(0, 15, 16, 1, 0x6e8a6e);
        [2, 6, 10, 14].forEach((x) =>
          [3, 11].forEach((y) => {
            rect(x, y, 2, 2, 0x7d987d);
          }),
        );
        break;
      case WALL_LO:
        // cream wainscoting panel
        rect(0, 0, 16, 16, 0xe8e0cc);
        rect(2, 2, 12, 12, 0xf4f0e4);
        rect(0, 0, 16, 1, 0xd0c8b0);
        rect(0, 15, 16, 1, 0xd0c8b0);
        break;
      case SKIRTING:
        // white skirting board
        rect(0, 0, 16, 16, 0xe8e0cc);
        rect(0, 13, 16, 3, 0xfaf6ee);
        rect(0, 13, 16, 1, 0xd0c8b0);
        break;
      case RUG_C:
        // earthy terracotta rug
        rect(0, 0, 16, 16, 0xa8623a);
        [1, 5, 9, 13].forEach((x) => rect(x, 0, 1, 16, 0x965430));
        break;
      case RUG_BH:
        rect(0, 0, 16, 16, 0xbe7848);
        rect(2, 2, 12, 12, 0xa8623a);
        rect(0, 0, 16, 2, 0xd49060);
        rect(0, 14, 16, 2, 0xd49060);
        break;
      case RUG_CO:
        rect(0, 0, 16, 16, 0xbe7848);
        rect(2, 2, 14, 14, 0xa8623a);
        rect(0, 0, 16, 2, 0xd49060);
        rect(0, 0, 2, 16, 0xd49060);
        break;
    }
  }

  // ── Furniture objects ──────────────────────────────────────────────────────
  _spawnFurniture() {
    const T = TILE * SCALE;
    this.furnitureGroup = this.add.group();

    OBJECTS.forEach(([tileX, tileY, tileIdx, collides]) => {
      const sprite = this._makeFurnitureSprite(tileX * T, tileY * T, tileIdx);
      if (sprite) {
        sprite.setDepth(tileY * 10 + 5);
        this.furnitureGroup.add(sprite);
        if (collides) {
          this.collisionMap[tileY] && (this.collisionMap[tileY][tileX] = true);
        }
      }
    });
  }

  _makeFurnitureSprite(px, py, tileIdx) {
    const T = TILE * SCALE;
    const S = SCALE;
    const g = this.make.graphics({ x: px, y: py, add: true });

    const rect = (x, y, w, h, c) => {
      g.fillStyle(c, 1);
      g.fillRect(x * S, y * S, w * S, h * S);
    };

    switch (tileIdx) {
      case BOOKLO:
        rect(0, 0, 16, 16, 0x7a5030);
        rect(1, 1, 14, 14, 0x5a3818);
        [
          [1, 0xc03030],
          [3, 0x3060a0],
          [5, 0x308040],
          [7, 0xa09020],
          [9, 0x804080],
          [11, 0xc06020],
          [13, 0x205080],
        ].forEach(([x, c]) => rect(x, 1, 2, 14, c));
        break;
      case BOOKHI:
        rect(0, 0, 16, 16, 0x7a5030);
        rect(1, 1, 14, 14, 0x5a3818);
        [
          [1, 0xa02020],
          [3, 0x204080],
          [5, 0x206030],
          [7, 0x808010],
          [9, 0x602060],
          [11, 0xa04010],
          [13, 0x103060],
        ].forEach(([x, c]) => rect(x, 1, 2, 14, c));
        rect(6, 0, 4, 2, 0xe8c060); // vase on top
        break;
      case FIRE:
        rect(0, 0, 16, 16, 0x6a5040);
        rect(2, 0, 12, 14, 0x2a1a0a);
        rect(4, 8, 8, 6, 0xff6010);
        rect(5, 9, 6, 5, 0xffa030);
        rect(6, 10, 4, 4, 0xffee80);
        rect(0, 14, 16, 2, 0x8a7060);
        // animate fire flicker via tween on alpha
        this.tweens.add({
          targets: g,
          alpha: { from: 0.9, to: 1 },
          duration: 200,
          yoyo: true,
          repeat: -1,
        });
        break;
      case MANTLE:
        rect(0, 0, 16, 16, 0x8a7898);
        rect(0, 14, 16, 2, 0x8a7060);
        rect(5, 10, 2, 4, 0xf8f0d0);
        rect(5, 9, 2, 1, 0xffd070);
        rect(6, 8, 1, 1, 0xff8020);
        break;
      case PLANT:
        rect(0, 8, 16, 8, 0x8a7898);
        rect(5, 13, 6, 3, 0x7a5030);
        rect(6, 11, 4, 3, 0x5a3818);
        rect(4, 4, 8, 8, 0x208040);
        rect(2, 6, 5, 6, 0x308050);
        rect(9, 5, 5, 7, 0x186030);
        rect(5, 1, 6, 5, 0x40a060);
        break;
      case TABLE:
        // light-oak side table
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(2, 4, 12, 3, 0xb89060); // tabletop edge
        rect(3, 7, 10, 2, 0xc4a870); // tabletop surface
        rect(4, 9, 2, 7, 0x7a5028); // legs
        rect(10, 9, 2, 7, 0x7a5028);
        rect(6, 4, 3, 2, 0xf0e8d0); // mug
        rect(7, 3, 2, 1, 0xe8dcc8);
        break;
      case CUSHION:
        // sage floor cushion
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(2, 5, 12, 8, 0x7a9878);
        rect(3, 6, 10, 6, 0x8aaa88);
        rect(6, 6, 4, 6, 0x9aba98);
        rect(2, 5, 12, 1, 0x5a7858); // top seam
        break;
      case WINDOW:
        // bright window on sage wall
        rect(0, 0, 16, 16, 0x8fa88a);
        rect(2, 1, 12, 14, 0xb8d8f0);
        rect(2, 1, 12, 6, 0xd0ecff);
        rect(8, 1, 1, 14, 0xe8e0cc); // frame
        rect(2, 8, 12, 1, 0xe8e0cc);
        rect(1, 0, 14, 1, 0xd0c8b0);
        rect(1, 15, 14, 1, 0xd0c8b0);
        rect(1, 0, 1, 16, 0xd0c8b0);
        rect(14, 0, 1, 16, 0xd0c8b0);
        break;
      // ── Couch (left / mid / right tiles) ──────────────────────────────────
      case COUCH_L:
        // left arm + backrest
        rect(0, 0, 16, 16, 0xd4bc94); // floor behind
        rect(0, 2, 16, 6, 0x7a9878); // backrest
        rect(0, 2, 16, 1, 0x5a7858); // backrest top edge
        rect(0, 8, 5, 8, 0x8aaa88); // left arm side
        rect(0, 8, 16, 8, 0x8aaa88); // seat cushion
        rect(1, 9, 14, 6, 0x9aba98); // cushion highlight
        rect(0, 8, 5, 1, 0x6a8a68); // arm top
        rect(0, 15, 16, 1, 0x5a7858); // front edge shadow
        break;
      case COUCH_M:
        // centre seat
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(0, 2, 16, 6, 0x7a9878);
        rect(0, 2, 16, 1, 0x5a7858);
        rect(0, 8, 16, 8, 0x8aaa88);
        rect(1, 9, 14, 6, 0x9aba98);
        rect(7, 8, 2, 8, 0x7a9878); // centre cushion seam
        rect(0, 15, 16, 1, 0x5a7858);
        break;
      case COUCH_R:
        // right arm + backrest
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(0, 2, 16, 6, 0x7a9878);
        rect(0, 2, 16, 1, 0x5a7858);
        rect(11, 8, 5, 8, 0x8aaa88); // right arm side
        rect(0, 8, 16, 8, 0x8aaa88);
        rect(1, 9, 14, 6, 0x9aba98);
        rect(11, 8, 5, 1, 0x6a8a68); // arm top
        rect(0, 15, 16, 1, 0x5a7858);
        break;
      // ── Floor lamp ────────────────────────────────────────────────────────
      case LAMP:
        rect(0, 0, 16, 16, 0xd4bc94); // floor
        rect(7, 12, 2, 4, 0xc8a050); // base pole
        rect(5, 11, 6, 2, 0x8a6c30); // base foot
        rect(6, 2, 4, 9, 0xc8a050); // pole
        rect(3, 0, 10, 4, 0xf0e8c8); // shade outer
        rect(4, 1, 8, 3, 0xfff8e8); // shade inner (lit)
        rect(5, 3, 6, 1, 0xd0a840); // shade bottom rim
        // warm glow dot
        rect(7, 4, 2, 2, 0xffe8a0);
        break;
      // ── Coffee table ──────────────────────────────────────────────────────
      case COFFEE_TBL:
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(0, 6, 16, 2,  0x6a4020);
        rect(0, 8, 16, 5,  0xe8d4a0);
        rect(0, 8, 16, 1,  0xf4e8b8);
        rect(0, 13, 16, 3, 0xc4a060);
        rect(1, 13, 2,  3, 0x5a3010);
        rect(13, 13, 2, 3, 0x5a3010);
        rect(5, 9,  6,  4, 0xf0e8d8);
        rect(6, 10, 4,  2, 0xe0d4c8);
        break;
      case COFFEE_MAG:
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(0, 6, 16, 2,  0x6a4020);
        rect(0, 8, 16, 5,  0xe8d4a0);
        rect(0, 8, 16, 1,  0xf4e8b8);
        rect(0, 13, 16, 3, 0xc4a060);
        rect(1, 13, 2,  3, 0x5a3010);
        rect(13, 13, 2, 3, 0x5a3010);
        // open magazine
        rect(2, 9,  12, 7, 0xfaf6f0);
        rect(7, 9,  2,  7, 0xd0c8b8);
        rect(3, 10, 3,  1, 0xb0a898);
        rect(3, 12, 4,  1, 0xb0a898);
        rect(3, 14, 3,  1, 0xb0a898);
        rect(9, 9,  4,  3, 0x8ab8c8);
        rect(9, 13, 4,  1, 0xb0a898);
        rect(9, 15, 3,  1, 0xb0a898);
        break;
      case COFFEE_MATCHA:
        rect(0, 0, 16, 16, 0xd4bc94);
        rect(0, 6, 16, 2,  0x6a4020);
        rect(0, 8, 16, 5,  0xe8d4a0);
        rect(0, 8, 16, 1,  0xf4e8b8);
        rect(0, 13, 16, 3, 0xc4a060);
        rect(1, 13, 2,  3, 0x5a3010);
        rect(13, 13, 2, 3, 0x5a3010);
        // saucer
        rect(3, 13, 10, 2, 0xf0ece4);
        rect(4, 12, 8,  1, 0xe0dcd4);
        // cup
        rect(5, 9,  6,  5, 0xf0ece4);
        rect(6, 9,  4,  4, 0xf8f4ec);
        rect(6, 9,  4,  2, 0x7aaa48);
        rect(6, 9,  4,  1, 0x9acc68);
        // steam
        rect(7, 5,  1,  1, 0xd4e8d0);
        rect(8, 4,  1,  1, 0xd4e8d0);
        rect(7, 3,  1,  1, 0xd4e8d0);
        rect(9, 6,  1,  1, 0xd4e8d0);
        break;
      default:
        return null;
    }
    return g;
  }

  // ── Paintings ──────────────────────────────────────────────────────────────
  _spawnPaintings() {
    const T = TILE * SCALE;
    this.paintings = [];

    PAINTING_POSITIONS.forEach((pos, i) => {
      if (i >= this.manifest.paintings.length) return;

      const data = this.manifest.paintings[i];
      const isVertical = pos.vertical;
      const tileY = pos.tileY || 0;

      const wx = pos.tileX * T + (isVertical ? 0 : T / 2);
      const wy = tileY * T + (isVertical ? T : 4 * SCALE);

      // Frame — intentionally small so they don't crowd the wall
      const fw = isVertical ? 16 : 22,
        fh = isVertical ? 22 : 14;
      const frame = this.add.graphics({ x: wx - (fw * SCALE) / 2, y: wy });
      frame.setDepth(5);
      this._drawPaintingFrame(frame, fw, fh, data.frameColor || '#c0a060');

      // Inner "photo" rectangle (coloured placeholder that glows on hover)
      const iw = fw - 10,
        ih = fh - 10;
      const inner = this.add.graphics({
        x: wx - (iw * SCALE) / 2,
        y: wy + 5 * SCALE,
      });
      inner.fillStyle(0x1a1a2a, 1);
      inner.fillRect(0, 0, iw * SCALE, ih * SCALE);

      // Interaction zone
      const zone = this.add
        .zone(wx, wy + (fh * SCALE) / 2, fw * SCALE, fh * SCALE)
        .setInteractive({ cursor: 'pointer' })
        .setDepth(10);

      zone.on('pointerover', () => {
        inner.clear();
        inner.fillStyle(0x3a2a5a, 1);
        inner.fillRect(0, 0, iw * SCALE, ih * SCALE);
        this.hintBubble.classList.add('visible');
        this._hintTimeout && clearTimeout(this._hintTimeout);
      });
      zone.on('pointerout', () => {
        inner.clear();
        inner.fillStyle(0x1a1a2a, 1);
        inner.fillRect(0, 0, iw * SCALE, ih * SCALE);
        this._hintTimeout = setTimeout(
          () => this.hintBubble.classList.remove('visible'),
          1500,
        );
      });
      zone.on('pointerdown', () => {
        this.modal.show({ ...data, index: i + 1 });
      });

      // Painting number label
      this.add
        .text(wx, wy + (fh - 4) * SCALE, `♥`, {
          fontFamily: '"Press Start 2P"',
          fontSize: `${5 * SCALE}px`,
          color: '#c0a060',
        })
        .setOrigin(0.5, 0)
        .setDepth(6);

      this.paintings.push({ zone, data });
    });
  }

  _drawPaintingFrame(g, fw, fh, colorHex) {
    const S = SCALE;
    const c = parseInt(colorHex.replace('#', ''), 16);
    const cDark = Math.max(0, c - 0x303010);
    g.fillStyle(c, 1);
    g.fillRect(0, 0, fw * S, fh * S);
    g.fillStyle(cDark, 1);
    g.fillRect(3 * S, 3 * S, (fw - 6) * S, (fh - 6) * S);
    g.fillStyle(0x1a1008, 1);
    g.fillRect(5 * S, 5 * S, (fw - 10) * S, (fh - 10) * S);
    // corner ornaments
    [
      [0, 0],
      [fw - 4, 0],
      [0, fh - 4],
      [fw - 4, fh - 4],
    ].forEach(([x, y]) => {
      g.fillStyle(0xffd070, 1);
      g.fillRect(x * S, y * S, 4 * S, 4 * S);
    });
  }

  // ── Pets ───────────────────────────────────────────────────────────────────
  _spawnPets() {
    const T = TILE * SCALE;

    // Taro the shih tzu — near fireplace
    this.dog = this.add
      .sprite(6 * T + T / 2, 3 * T, 'dog')
      .setScale(SCALE)
      .setDepth(30)
      .play('dog_idle');

    // Tofu the tabby cat — on rug
    this.cat = this.add
      .sprite(8 * T, 6 * T, 'cat')
      .setScale(SCALE)
      .setDepth(30)
      .play('cat_idle');

    // Name labels
    const petLabel = (sprite, name) => {
      const lbl = this.add
        .text(sprite.x, sprite.y - 20 * SCALE * 0.5, name, {
          fontFamily: '"Press Start 2P"',
          fontSize: '6px',
          color: '#f0d898',
          stroke: '#000',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(31);
      this.tweens.add({
        targets: lbl,
        y: lbl.y - 2,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    };
    petLabel(this.dog, 'Taro');
    petLabel(this.cat, 'Tofu');

    // Click interactions
    const petSpeak = (sprite, lines) => {
      sprite.setInteractive({ cursor: 'pointer' });
      sprite.on('pointerdown', () => {
        const msg = Array.isArray(lines)
          ? lines[Phaser.Math.Between(0, lines.length - 1)]
          : lines;
        const bubble = this.add
          .text(sprite.x, sprite.y - 28 * SCALE * 0.5, msg, {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#2a1a3a',
            padding: { x: 6, y: 4 },
          })
          .setOrigin(0.5, 1)
          .setDepth(100);
        this.tweens.add({
          targets: bubble,
          y: bubble.y - 20,
          alpha: { from: 1, to: 0 },
          duration: 1400,
          ease: 'Quad.easeOut',
          onComplete: () => bubble.destroy(),
        });
      });
    };

    petSpeak(this.dog, ['woof!', '*sneeze*']);
    petSpeak(this.cat, 'meowww');
  }

  // ── Player ────────────────────────────────────────────────────────────────
  _spawnPlayer() {
    const T = TILE * SCALE;
    this.player = this.add
      .sprite(8 * T, 7 * T, this.charKey)
      .setScale(SCALE * 1.2)
      .setDepth(50);

    this.player.play(`${this.charKey}_idle_down`);
    this.playerTileX = 8;
    this.playerTileY = 7;
    this.isMoving = false;
    this.lastDir = 'down';
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.moveTimer = 0;
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  _setupCamera(width, height) {
    const mapPixW = MAP_W * TILE * SCALE;
    const mapPixH = MAP_H * TILE * SCALE;
    this.cameras.main.setBounds(0, 0, mapPixW, mapPixH);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.physics.world.setBounds(0, 0, mapPixW, mapPixH);
  }

  _setupHint() {
    this.hintBubble = document.getElementById('hint-bubble');
    this.hintBubble.textContent = '🖱 CLICK to view memory';
  }

  // ── Update loop ──────────────────────────────────────────────────────────
  update(time, delta) {
    if (!this.player) return;
    if (
      this.modal &&
      document.getElementById('photo-modal').classList.contains('visible')
    )
      return;

    this.moveTimer -= delta;
    if (this.moveTimer > 0) return;

    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;

    let dx = 0,
      dy = 0,
      dir = this.lastDir;
    if (up) {
      dy = -1;
      dir = 'up';
    }
    if (down) {
      dy = 1;
      dir = 'down';
    }
    if (left) {
      dx = -1;
      dir = 'left';
    }
    if (right) {
      dx = 1;
      dir = 'right';
    }

    if (dx !== 0 || dy !== 0) {
      const nx = this.playerTileX + dx;
      const ny = this.playerTileY + dy;
      if (
        nx >= 0 &&
        nx < MAP_W &&
        ny >= 0 &&
        ny < MAP_H &&
        !this.collisionMap[ny][nx]
      ) {
        this.playerTileX = nx;
        this.playerTileY = ny;
        const T = TILE * SCALE;
        this.tweens.add({
          targets: this.player,
          x: nx * T + T / 2,
          y: ny * T + T / 2,
          duration: 160,
          ease: 'Linear',
        });
        this.player.play(`${this.charKey}_walk_${dir}`, true);
      } else {
        // Bump into wall
        this.player.play(`${this.charKey}_idle_${dir}`, true);
      }
      this.lastDir = dir;
      this.moveTimer = 160;
    } else {
      this.player.play(`${this.charKey}_idle_${this.lastDir}`, true);
    }

    // Depth sort
    this.player.setDepth(this.playerTileY * 10 + 9);
    this.dog.setDepth((this.dog.y / (TILE * SCALE)) * 10 + 8);
    this.cat.setDepth((this.cat.y / (TILE * SCALE)) * 10 + 8);
  }

  _showToast(msg) {
    const t = this.add
      .text(
        this.cameras.main.scrollX + this.scale.width / 2,
        this.cameras.main.scrollY + this.scale.height - 30,
        msg,
        {
          fontFamily: '"Press Start 2P"',
          fontSize: '8px',
          color: '#f0d898',
          stroke: '#000',
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5)
      .setDepth(100)
      .setScrollFactor(0);

    this.tweens.add({
      targets: t,
      y: t.y - 20,
      alpha: { from: 1, to: 0 },
      duration: 2500,
      ease: 'Cubic.easeIn',
      onComplete: () => t.destroy(),
    });
  }
}
