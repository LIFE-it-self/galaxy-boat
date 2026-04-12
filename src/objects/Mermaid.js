// Mermaid — Galley NPC. Same plain-class style as Cody: not a Phaser game
// object subclass, just a wrapper around a colored rectangle and a "!"
// marker text. The owning scene checks isAdjacentTo() during the interact
// handler.
//
// Lives separately from Cody so they can diverge in Session 8 (mermaids
// will likely get their own sprite, animation, and possibly sing dialog
// before fish hand-off).

import { TILE_SIZE } from '../constants.js';

export class Mermaid {
  constructor(scene, tileX, tileY, dialogId) {
    this.scene = scene;
    this.tileX = tileX;
    this.tileY = tileY;
    this.dialogId = dialogId;

    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    if (scene.textures.exists('mermaid-1')) {
      this.sprite = scene.add.sprite(px, py, 'mermaid-1');
      this.sprite.setDisplaySize(TILE_SIZE, TILE_SIZE);
    } else {
      this.sprite = scene.add.rectangle(px, py, TILE_SIZE, TILE_SIZE, 0xff69b4);
    }
    this.sprite.setDepth(9);

    // "!" marker hovering above her head, signals interactable.
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
