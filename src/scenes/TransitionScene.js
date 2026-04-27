// TransitionScene — black title card shown before each minigame. Holds for
// 2 seconds, then auto-advances to nextSceneKey with nextSceneData. Tap or
// SPACE skips the wait. Receives:
//   { instruction, location, nextSceneKey, nextSceneData }

import Phaser from 'phaser';

const HOLD_MS = 2000;
const INPUT_GRACE = 50; // prevents the launching tap from instantly skipping

export default class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' });
  }

  init(data) {
    this.instruction = (data && data.instruction) || '';
    this.location = (data && data.location) || '';
    this.hint = (data && data.hint) || '';
    this.nextSceneKey = data && data.nextSceneKey;
    this.nextSceneData = (data && data.nextSceneData) || {};
    this.advanced = false;
    this.inputReady = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);

    this.add.text(128, 80, this.instruction, {
      font: '24px monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(128, 112, this.location, {
      font: '10px monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    if (this.hint) {
      this.add.text(128, 140, this.hint, {
        font: '8px monospace',
        color: '#ffff80',
        wordWrap: { width: 220 },
        align: 'center',
      }).setOrigin(0.5);
    }

    this.time.delayedCall(HOLD_MS, () => this.goNext());

    // Defer skip listeners so the launching pointerdown doesn't fire here.
    this.skipHandler = () => this.goNext();
    this.time.delayedCall(INPUT_GRACE, () => {
      this.inputReady = true;
      this.input.on('pointerdown', this.skipHandler);
      this.input.keyboard.on('keydown-SPACE', this.skipHandler);
    });

    this.events.once('shutdown', this.shutdown, this);
  }

  goNext() {
    if (this.advanced) return;
    this.advanced = true;
    if (!this.nextSceneKey) return;
    this.scene.start(this.nextSceneKey, this.nextSceneData);
  }

  shutdown() {
    if (this.skipHandler) {
      this.input.off('pointerdown', this.skipHandler);
      this.input.keyboard.off('keydown-SPACE', this.skipHandler);
    }
  }
}
