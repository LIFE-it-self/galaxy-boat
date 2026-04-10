// Player — Captain Chowder John.
//
// Plain JS class (intentionally NOT a Phaser plugin or game object subclass).
// Wraps a single rectangle sprite and exposes tile-snapped 4-direction
// movement. The owning scene calls tryMove() and supplies a canEnter()
// callback that knows about walls / out-of-bounds.

import { TILE_SIZE, COLORS } from '../constants.js';

export class Player {
  constructor(scene, tileX, tileY) {
    this.scene = scene;
    this.tileX = tileX;
    this.tileY = tileY;
    this.isMoving = false;

    // Placeholder visual: a 16x16 solid blue square. Real sprite lands in
    // Session 8. Position is centered in the tile (origin defaults to 0.5).
    this.sprite = scene.add.rectangle(
      tileX * TILE_SIZE + TILE_SIZE / 2,
      tileY * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE,
      TILE_SIZE,
      COLORS.PLAYER
    );
    this.sprite.setDepth(10);
  }

  // Try to move one tile in the given direction.
  //   dir       — 'up' | 'down' | 'left' | 'right'
  //   canEnter  — function(tileX, tileY) => boolean (provided by the scene)
  // Returns true if the move was started, false if it was blocked or if a
  // previous move is still tweening.
  tryMove(dir, canEnter) {
    if (this.isMoving) return false;

    let dx = 0;
    let dy = 0;
    if (dir === 'up')         dy = -1;
    else if (dir === 'down')  dy = 1;
    else if (dir === 'left')  dx = -1;
    else if (dir === 'right') dx = 1;

    const nextX = this.tileX + dx;
    const nextY = this.tileY + dy;

    if (!canEnter(nextX, nextY)) return false;

    this.isMoving = true;
    this.tileX = nextX;
    this.tileY = nextY;

    this.scene.tweens.add({
      targets: this.sprite,
      x: nextX * TILE_SIZE + TILE_SIZE / 2,
      y: nextY * TILE_SIZE + TILE_SIZE / 2,
      duration: 150,
      onComplete: () => { this.isMoving = false; },
    });

    return true;
  }
}
