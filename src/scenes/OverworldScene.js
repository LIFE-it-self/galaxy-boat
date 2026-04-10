// OverworldScene — renders one boat room at a time and runs the player
// around inside it. Door tiles transition (with a camera fade) to another
// room by restarting this same scene with new init data.

import Phaser from 'phaser';
import { TILE_SIZE, COLORS, TILE_TYPES } from '../constants.js';
import { ROOMS } from '../data/rooms.js';
import { Player } from '../objects/Player.js';

export default class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  // Phaser calls init() before create(). It receives the data object passed
  // to scene.start() / scene.restart().
  init(data) {
    this.roomId = (data && data.roomId) || 'main-deck';
    this.spawnOverrideX = data && data.spawnX;
    this.spawnOverrideY = data && data.spawnY;
    this.isTransitioning = false;
  }

  create() {
    this.currentRoom = ROOMS[this.roomId];

    // 1. Render every tile of the room layout. We use simple rectangles
    //    for now (real sprites land in Session 8). Depth ordering: floor
    //    underneath, walls above floor, doors above walls.
    this.renderRoomTiles();

    // 2. Spawn the player. If the scene was started by a door (override
    //    coords supplied), use those — otherwise use the room's default.
    const spawnX = this.spawnOverrideX != null ? this.spawnOverrideX : this.currentRoom.playerSpawn.x;
    const spawnY = this.spawnOverrideY != null ? this.spawnOverrideY : this.currentRoom.playerSpawn.y;
    this.player = new Player(this, spawnX, spawnY);

    // 3. Keyboard input: arrow keys, polled in update().
    this.cursors = this.input.keyboard.createCursorKeys();

    // 4. On-screen touch buttons (mobile-first). Always visible — desktop
    //    users can also click them with a mouse.
    this.createTouchButtons();

    // 5. Camera fade-in so room transitions feel intentional.
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  update() {
    if (this.isTransitioning) return;
    if (this.player.isMoving) return;

    // If we just finished tweening onto a door tile, trigger the
    // transition before accepting any more input.
    const tile = this.currentRoom.layout[this.player.tileY][this.player.tileX];
    if (tile === TILE_TYPES.DOOR) {
      this.tryEnterDoor(this.player.tileX, this.player.tileY);
      return;
    }

    // Held-key movement. The if/else chain prevents diagonal moves: only
    // one direction can fire per frame.
    if (this.cursors.left.isDown)       this.handleMove('left');
    else if (this.cursors.right.isDown) this.handleMove('right');
    else if (this.cursors.up.isDown)    this.handleMove('up');
    else if (this.cursors.down.isDown)  this.handleMove('down');
  }

  // Render every tile in this.currentRoom.layout as a colored rectangle.
  renderRoomTiles() {
    const layout = this.currentRoom.layout;
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const t = layout[y][x];
        let color, depth;
        if (t === TILE_TYPES.WALL) {
          color = COLORS.WALL;
          depth = 1;
        } else if (t === TILE_TYPES.DOOR) {
          color = COLORS.DOOR;
          depth = 2;
        } else {
          color = COLORS.FLOOR;
          depth = 0;
        }
        const rect = this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE,
          color
        );
        rect.setDepth(depth);
      }
    }
  }

  // Build a 4-button cross in the bottom-left corner. Buttons sit at
  // depth 100, well above the player (10) and tiles (0-2). Each button is
  // a semi-transparent rectangle with a small arrow text label.
  createTouchButtons() {
    const buttonDefs = [
      { dir: 'up',    x: 35, y: 170, label: '\u2191' }, // ↑
      { dir: 'down',  x: 35, y: 210, label: '\u2193' }, // ↓
      { dir: 'left',  x: 15, y: 190, label: '\u2190' }, // ←
      { dir: 'right', x: 55, y: 190, label: '\u2192' }, // →
    ];

    buttonDefs.forEach(def => {
      const bg = this.add.rectangle(def.x, def.y, 20, 20, 0xffffff, 0.3);
      bg.setStrokeStyle(1, 0xffffff, 0.8);
      bg.setDepth(100);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.handleMove(def.dir));

      const label = this.add.text(def.x, def.y, def.label, {
        font: '12px monospace',
        color: '#ffffff',
      });
      label.setOrigin(0.5);
      label.setDepth(101);
    });
  }

  // Try to step the player one tile. The door check happens later, in
  // update(), once the tween has actually arrived at the destination tile.
  handleMove(dir) {
    if (this.isTransitioning) return;
    this.player.tryMove(dir, (x, y) => this.canEnter(x, y));
  }

  // Walls block. Out-of-bounds blocks. Floor and door tiles are walkable.
  canEnter(tileX, tileY) {
    const layout = this.currentRoom.layout;
    if (tileY < 0 || tileY >= layout.length) return false;
    if (tileX < 0 || tileX >= layout[0].length) return false;
    return layout[tileY][tileX] !== TILE_TYPES.WALL;
  }

  // The player has just landed on a door tile. Look it up, fade out, and
  // restart the scene with the target room and spawn coords. We use the
  // camerafadeoutcomplete event so the fade actually plays before the
  // restart blows the scene away.
  tryEnterDoor(tileX, tileY) {
    const door = this.currentRoom.doors.find(d => d.x === tileX && d.y === tileY);
    if (!door) return;

    this.isTransitioning = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({
        roomId: door.targetRoom,
        spawnX: door.spawnX,
        spawnY: door.spawnY,
      });
    });
  }
}
