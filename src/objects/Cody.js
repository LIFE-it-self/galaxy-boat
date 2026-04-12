// Cody — the NPC the player talks to. Same plain-class style as Player:
// not a Phaser game object subclass, just a wrapper around a rectangle and
// a "!" marker text. The owning scene checks isAdjacentTo() during the
// interact handler.

import { TILE_SIZE, COLORS } from '../constants.js';

export class Cody {
  constructor(scene, tileX, tileY, dialogId) {
    this.scene = scene;
    this.tileX = tileX;
    this.tileY = tileY;
    this.dialogId = dialogId;

    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    if (scene.textures.exists('cody')) {
      this.sprite = scene.add.sprite(px, py, 'cody');
      this.sprite.setDisplaySize(TILE_SIZE, TILE_SIZE);
    } else {
      this.sprite = scene.add.rectangle(px, py, TILE_SIZE, TILE_SIZE, COLORS.CODY);
    }
    this.sprite.setDepth(9);

    // "!" marker hovering above his head, signals interactable.
    this.marker = scene.add.text(
      tileX * TILE_SIZE + TILE_SIZE / 2,
      tileY * TILE_SIZE - 4,
      '!',
      { font: '10px monospace', color: '#ffff00' }
    ).setOrigin(0.5).setDepth(11);
  }

  // Manhattan-distance-1 check. Diagonal neighbors do not count.
  isAdjacentTo(playerTileX, playerTileY) {
    const dx = Math.abs(this.tileX - playerTileX);
    const dy = Math.abs(this.tileY - playerTileY);
    return (dx + dy) === 1;
  }
}
