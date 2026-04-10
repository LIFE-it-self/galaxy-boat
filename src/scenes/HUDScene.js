// HUDScene — parallel scene that draws the failure counter and current
// objective on top of whatever gameplay scene is running. Launched once
// from OverworldScene.create() (guarded by isActive) and persists across
// every room transition / minigame swap until a hurricane fail bounces
// the player back to MainMenuScene.
//
// HUDScene also owns the temporary "HURRICANE!" placeholder UI that fires
// when failureCount hits FAILURE_THRESHOLD. Real fail cutscene = Session 7.

import Phaser from 'phaser';
import { EventBus } from '../systems/EventBus.js';
import { FAILURE_THRESHOLD, GameStateManager } from '../systems/GameStateManager.js';

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

    // Subscribe to the global hurricane fail event.
    this.onHurricane = this.onHurricane.bind(this);
    EventBus.on('hurricane-fail', this.onHurricane);

    this.events.once('shutdown', this.shutdown, this);
  }

  // Show the placeholder hurricane UI for 2 seconds, then reset state and
  // bounce back to MainMenuScene. The 2s delay is intentionally longer
  // than BaseMinigame's 1.2s result overlay so we override whatever
  // scene.start() the minigame's lose() path called.
  onHurricane(_data) {
    if (this.hurricaneActive) return;
    this.hurricaneActive = true;

    const banner = this.add.text(128, 112, 'HURRICANE! (placeholder)', {
      font: '16px monospace',
      color: '#ff4040',
    }).setOrigin(0.5).setDepth(1100);

    this.time.delayedCall(2000, () => {
      banner.destroy();
      GameStateManager.reset(this.game);

      // Stop every active scene that isn't us or the menu, so the menu
      // re-enters cleanly.
      const scenes = this.scene.manager.scenes;
      scenes.forEach((s) => {
        const key = s.scene.key;
        if (key === 'HUDScene' || key === 'MainMenuScene') return;
        if (this.scene.isActive(key) || this.scene.isPaused(key)) {
          this.scene.stop(key);
        }
      });

      this.scene.start('MainMenuScene');
      this.scene.stop('HUDScene');
    });
  }

  shutdown() {
    if (this.onFailureChanged) {
      this.registry.events.off('changedata-failureCount', this.onFailureChanged, this);
    }
    if (this.onHurricane) {
      EventBus.off('hurricane-fail', this.onHurricane);
    }
    this.hurricaneActive = false;
  }
}
