// PlaceholderGame — first BaseMinigame subclass. Used to verify the
// transition → minigame → result → return loop in Session 3.
//   SPACE         = win
//   X             = lose
//   tap top half  = win
//   tap bot half  = lose

import { BaseMinigame } from './BaseMinigame.js';

export default class PlaceholderGame extends BaseMinigame {
  constructor() {
    super('PlaceholderGame');
  }

  setupGame() {
    this.add.text(128, 80, 'Placeholder', {
      font: '16px monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(128, 110, 'Press SPACE = win', {
      font: '10px monospace',
      color: '#88ff88',
    }).setOrigin(0.5);

    this.add.text(128, 130, 'Press X = lose', {
      font: '10px monospace',
      color: '#ff8888',
    }).setOrigin(0.5);

    // Tap support: top half wins, bottom half loses.
    this.input.on('pointerdown', (p) => {
      if (p.y < 112) this.win();
      else this.lose();
    });

    this.input.keyboard.on('keydown-SPACE', () => this.win());
    this.input.keyboard.on('keydown-X', () => this.lose());
  }
}
