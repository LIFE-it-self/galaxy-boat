// PipeSmoke — Ritual Step 1. Cody puffs the pipe; the player taps to puff,
// the PowerMeter ("PIPE LIT") drains over time, and they need 5 puffs
// before the meter empties. BaseMinigame.win() automatically records the
// ritual step because the level config has isRitual: true.
//
// The sequence guard for ritual ordering happens in
// OverworldScene.startMinigameForLevel BEFORE this scene starts, so by
// the time setupGame() runs we know step 1 was the right step.

import { BaseMinigame } from './BaseMinigame.js';
import { PowerMeter } from '../../ui/PowerMeter.js';

export default class PipeSmoke extends BaseMinigame {
  constructor() {
    super('PipeSmoke');
  }

  setupGame() {
    const cfg = (this.levelConfig && this.levelConfig.config) || {};
    this.required = cfg.puffsRequired || 5;
    this.puffPower = cfg.puffPower || 30;
    const decayRate = cfg.decayPerSec || 25;

    // Cody (green) holding a small brown pipe at his mouth.
    this.cody = this.add.rectangle(128, 112, 16, 16, 0x40c040);
    this.pipe = this.add.rectangle(138, 116, 8, 4, 0x8b4513);

    this.add.text(8, 16, 'TAP TO PUFF', {
      font: '8px monospace',
      color: '#aaaaaa',
    }).setDepth(100);

    this.powerMeter = new PowerMeter(this, 16, 188, 224, 12, {
      max: 100,
      initial: 100,
      decayPerSec: decayRate,
      label: 'PIPE LIT',
    });

    this.puffs = 0;
    this.puffText = this.add.text(248, 16, 'Puffs: 0/' + this.required, {
      font: '8px monospace',
      color: '#ffffff',
    }).setOrigin(1, 0).setDepth(100);

    this.input.on('pointerdown', () => this.puff());
    this.input.keyboard.on('keydown-SPACE', () => this.puff());
  }

  puff() {
    if (this.state !== 'PLAY') return;
    this.powerMeter.add(this.puffPower);

    // Smoke ring — white circle that drifts up and fades.
    const ring = this.add.circle(138, 108, 3, 0xffffff);
    this.tweens.add({
      targets: ring,
      y: 70,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        if (ring && ring.active) ring.destroy();
      },
    });

    this.puffs++;
    if (this.puffText && this.puffText.active) {
      this.puffText.setText('Puffs: ' + this.puffs + '/' + this.required);
    }

    if (this.puffs >= this.required) this.win();
  }

  // Phaser auto-calls this every frame on Scene subclasses that define it.
  // BaseMinigame does not define update(), so this is the only update path.
  update(time, delta) {
    if (this.state !== 'PLAY') return;
    if (!this.powerMeter) return;
    this.powerMeter.decay(delta);
    if (this.powerMeter.value <= 0) this.lose();
  }
}
