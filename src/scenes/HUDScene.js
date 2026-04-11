// HUDScene — parallel scene that draws the failure counter and current
// objective on top of whatever gameplay scene is running. Launched once
// from OverworldScene.create() (guarded by isActive) and persists across
// every room transition / minigame swap.
//
// As of Session 7 HUDScene is display-only: it no longer listens for
// 'hurricane-fail'. The CutsceneRouter module (src/systems/CutsceneRouter.js)
// handles the event and starts CutsceneScene, which itself stops every
// other active scene (including this one) before rendering the fail or
// victory cutscene.

import Phaser from 'phaser';
import { FAILURE_THRESHOLD } from '../systems/GameStateManager.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    // Top-left: failure counter, updated via registry change events.
    const initialCount = this.registry.get('failureCount') || 0;
    this.failText = this.add.text(4, 4, `Failures: ${initialCount}/${FAILURE_THRESHOLD}`, {
      font: '8px monospace',
      color: '#ffffff',
    }).setDepth(1000);

    // Top-right: objective text (static for Session 3).
    this.objectiveText = this.add.text(252, 4, 'Objective: Find Cody', {
      font: '8px monospace',
      color: '#ffffff',
    }).setOrigin(1, 0).setDepth(1000);

    // Subscribe to registry changes for the failure counter.
    this.onFailureChanged = (parent, value) => {
      this.failText.setText(`Failures: ${value}/${FAILURE_THRESHOLD}`);
    };
    this.registry.events.on('changedata-failureCount', this.onFailureChanged, this);

    this.events.once('shutdown', this.shutdown, this);
  }

  shutdown() {
    if (this.onFailureChanged) {
      this.registry.events.off('changedata-failureCount', this.onFailureChanged, this);
    }
  }
}
