import Phaser from 'phaser';
import { GameStateManager } from '../systems/GameStateManager.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Static loading bar (no real assets yet — Session 1 uses placeholder graphics)
    const box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(w / 2 - 80, h / 2 - 8, 160, 16);

    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 1);
    bar.fillRect(w / 2 - 78, h / 2 - 6, 156, 12);

    this.add.text(w / 2, h / 2 - 24, 'Loading...', {
      font: '10px monospace',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  create() {
    // Seed the registry with default game state before any other scene runs.
    GameStateManager.init(this.game);

    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
