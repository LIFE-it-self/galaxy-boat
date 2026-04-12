// GenericNPC — reusable NPC class for hint characters.
// Same interaction pattern as Cody/Mermaid: sprite + "!" marker, adjacency check.

import { TILE_SIZE } from '../constants.js';

export class GenericNPC {
  constructor(scene, tileX, tileY, dialogId, textureKey, fallbackColor) {
    this.scene = scene;
    this.tileX = tileX;
    this.tileY = tileY;
    this.dialogId = dialogId;

    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    if (textureKey && scene.textures.exists(textureKey)) {
      this.sprite = scene.add.sprite(px, py, textureKey);
      this.sprite.setDisplaySize(TILE_SIZE, TILE_SIZE);
    } else {
      this.sprite = scene.add.rectangle(px, py, TILE_SIZE, TILE_SIZE, fallbackColor);
    }
    this.sprite.setDepth(9);

    this.marker = scene.add.text(
      px, py - TILE_SIZE + 4,
      '!',
      { font: '10px monospace', color: '#ffff00' }
    ).setOrigin(0.5).setDepth(11);
  }

  isAdjacentTo(playerTileX, playerTileY) {
    const dx = Math.abs(this.tileX - playerTileX);
    const dy = Math.abs(this.tileY - playerTileY);
    return (dx + dy) === 1;
  }
}
