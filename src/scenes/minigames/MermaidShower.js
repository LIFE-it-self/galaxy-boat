// MermaidShower — Ritual Step 3. Cody stands under a shower. The player
// holds LEFT/RIGHT (keyboard) or tap-and-hold the on-screen L/R buttons
// to drive a temperature indicator. Mermaids randomly splash the
// temperature by ±15 every 1.2s. Win by accumulating 10 cumulative
// seconds in the green zone (35..65) within a 25-second total window.
// The in-zone counter PAUSES when out of zone — it never decreases.
//
// Sequence guard: ritual step 3 is enforced by OverworldScene BEFORE this
// scene starts. Do NOT call assertCanStartRitual from here, and do NOT
// call markRitualStep — BaseMinigame.win() handles the ritual bookkeeping
// automatically because the level config has isRitual: true.
//
// Held-key input: LEFT/RIGHT are POLLED via cursors.left.isDown in
// update(), not listened for as keydown events. Phaser's keydown fires
// once on press; we need continuous input while the key is held.

import Phaser from 'phaser';
import { BaseMinigame } from './BaseMinigame.js';

export default class MermaidShower extends BaseMinigame {
  constructor() {
    super('MermaidShower');
  }

  setupGame() {
    const cfg = (this.levelConfig && this.levelConfig.config) || {};
    const greenZone = cfg.greenZone || [35, 65];
    this.greenMin = greenZone[0];
    this.greenMax = greenZone[1];
    this.targetSecondsInZone = cfg.targetSecondsInZone || 10;
    this.totalDurationMs = cfg.totalDurationMs || 25000;
    this.splashIntervalMs = cfg.splashIntervalMs || 1200;

    this.temperature = 50;      // starts dead center of green zone
    this.inZoneMs = 0;
    this.totalElapsedMs = 0;
    this.touchLeft = false;
    this.touchRight = false;

    // Dim bathroom background.
    this.add.rectangle(128, 112, 256, 224, 0x202040);

    // Temperature bar (top of screen). 200px wide, 10px tall.
    this.barX = 28;
    this.barY = 28;
    this.barW = 200;
    const barH = 10;

    // Zones are painted first (depth 7), border goes on top (depth 8).
    // Widths sum to 200: cold(40)+cool(30)+green(60)+warm(40)+hot(30).
    const zones = [
      { w: 40, color: 0x4040ff },  // cold-blue   0–20%
      { w: 30, color: 0x40a0c0 },  // cool-cyan   20–35%
      { w: 60, color: 0x40c040 },  // green       35–65%
      { w: 40, color: 0xc08040 },  // warm-orange 65–85%
      { w: 30, color: 0xc04040 },  // hot-red     85–100%
    ];
    let zx = this.barX;
    zones.forEach(z => {
      this.add.rectangle(zx, this.barY, z.w, barH, z.color)
        .setOrigin(0, 0)
        .setDepth(7);
      zx += z.w;
    });
    this.add.rectangle(this.barX, this.barY, this.barW, barH)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffffff)
      .setFillStyle(0x000000, 0)
      .setDepth(8);

    // Temperature indicator — downward-pointing triangle above the bar.
    // Phaser.GameObjects.Triangle takes (x, y, x1, y1, x2, y2, x3, y3).
    this.tempIndicator = this.add.triangle(
      this.barX + (this.temperature / 100) * this.barW,
      this.barY - 2,
      0, -6,
      -4, 0,
      4, 0,
      0xffffff
    ).setDepth(9);

    // Showerhead — small white rectangle centered above Cody.
    this.add.rectangle(128, 76, 24, 6, 0xffffff).setDepth(6);

    // Cody — slightly taller (16x20) since he's standing, not just a head.
    this.cody = this.add.rectangle(128, 140, 16, 20, 0x40c040).setDepth(10);

    // Two pink mermaids flanking Cody. baseY anchors the splash jump.
    this.mermaidLeft = this.add.rectangle(96, 152, 14, 18, 0xff69b4).setDepth(10);
    this.mermaidLeft.baseY = 152;
    this.mermaidRight = this.add.rectangle(160, 152, 14, 18, 0xff69b4).setDepth(10);
    this.mermaidRight.baseY = 152;

    // Labels.
    this.add.text(8, 12, 'TEMPERATURE', {
      font: '8px monospace',
      color: '#aaaaaa',
    }).setDepth(100);

    this.inZoneText = this.add.text(128, 44, '0.0 / ' + this.targetSecondsInZone + 's IN ZONE', {
      font: '8px monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(100);

    this.timerText = this.add.text(248, 12, Math.ceil(this.totalDurationMs / 1000).toString(), {
      font: '8px monospace',
      color: '#ffff80',
    }).setOrigin(1, 0).setDepth(100);

    // Looping droplet timer — tweened circles, not particles.
    this.dropletTimer = this.time.addEvent({
      delay: 120,
      loop: true,
      callback: this.emitDroplet,
      callbackScope: this,
    });

    // Splash timer — every splashIntervalMs a random mermaid nudges the
    // temperature by ±15 (sign depends on which mermaid splashes).
    this.splashTimer = this.time.addEvent({
      delay: this.splashIntervalMs,
      loop: true,
      callback: this.doSplash,
      callbackScope: this,
    });

    // Polled keyboard input (LEFT/RIGHT arrows).
    this.cursors = this.input.keyboard.createCursorKeys();

    // Mobile L/R held-buttons (ScubaDive pattern — pointerdown sets a
    // flag, pointerup AND pointerout clear it so sliding off doesn't stick).
    this.createTouchButtons();

    this.events.once('shutdown', this.shutdownGame, this);
  }

  createTouchButtons() {
    const defs = [
      { x: 30,  label: '\u2190', flag: 'touchLeft' },
      { x: 226, label: '\u2192', flag: 'touchRight' },
    ];
    defs.forEach(def => {
      const bg = this.add.rectangle(def.x, 200, 36, 30, 0xffffff, 0.3);
      bg.setStrokeStyle(1, 0xffffff, 0.8);
      bg.setDepth(100);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => { this[def.flag] = true; });
      bg.on('pointerup',   () => { this[def.flag] = false; });
      bg.on('pointerout',  () => { this[def.flag] = false; });
      this.add.text(def.x, 200, def.label, {
        font: '12px monospace',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(101);
    });
  }

  colorForTemperature() {
    if (this.temperature < 20) return 0x4040ff;
    if (this.temperature < 35) return 0x40a0c0;
    if (this.temperature <= 65) return 0xffffff;
    if (this.temperature <= 85) return 0xc08040;
    return 0xc04040;
  }

  codyTintForTemperature() {
    if (this.temperature < 35) return 0x80a0ff;
    if (this.temperature <= 65) return 0x40c040;
    return 0xff6040;
  }

  emitDroplet() {
    if (this.state !== 'PLAY') return;
    const spawnX = 128 + Phaser.Math.Between(-10, 10);
    const drop = this.add.circle(spawnX, 82, 1, this.colorForTemperature()).setDepth(5);
    this.tweens.add({
      targets: drop,
      y: 136,
      alpha: 0.4,
      duration: 500,
      onComplete: () => {
        if (drop && drop.active) drop.destroy();
      },
    });
  }

  doSplash() {
    if (this.state !== 'PLAY') return;

    // Which mermaid splashes, which way the temp moves.
    const fromLeft = Math.random() < 0.5;
    const mermaid = fromLeft ? this.mermaidLeft : this.mermaidRight;
    const nudge = fromLeft ? -15 : 15;

    this.temperature = Phaser.Math.Clamp(this.temperature + nudge, 0, 100);

    // Mermaid jump yoyo.
    this.tweens.add({
      targets: mermaid,
      y: mermaid.baseY - 6,
      duration: 120,
      yoyo: true,
    });

    // Blue particle burst — 6 circles radiating out.
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const burst = this.add.circle(mermaid.x, mermaid.y, 2, 0x40a0ff).setDepth(11);
      this.tweens.add({
        targets: burst,
        x: mermaid.x + Math.cos(angle) * 12,
        y: mermaid.y + Math.sin(angle) * 12,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          if (burst && burst.active) burst.destroy();
        },
      });
    }
  }

  shutdownGame() {
    if (this.dropletTimer) {
      this.dropletTimer.remove(false);
      this.dropletTimer = null;
    }
    if (this.splashTimer) {
      this.splashTimer.remove(false);
      this.splashTimer = null;
    }
  }

  update(time, delta) {
    if (this.state !== 'PLAY') return;

    // Polled input — LEFT and RIGHT can't both apply on the same frame.
    const leftDown = (this.cursors && this.cursors.left.isDown) || this.touchLeft;
    const rightDown = (this.cursors && this.cursors.right.isDown) || this.touchRight;
    if (leftDown && !rightDown) {
      this.temperature -= 25 * delta / 1000;
    } else if (rightDown && !leftDown) {
      this.temperature += 25 * delta / 1000;
    }
    this.temperature = Phaser.Math.Clamp(this.temperature, 0, 100);

    // Indicator follows clamped temperature.
    if (this.tempIndicator && this.tempIndicator.active) {
      this.tempIndicator.x = this.barX + (this.temperature / 100) * this.barW;
    }

    // Cody tint reflects temperature (blue / green / red).
    if (this.cody && this.cody.active) {
      this.cody.setFillStyle(this.codyTintForTemperature());
    }

    // In-zone accumulator — pauses (does NOT decrease) when out of zone.
    if (this.temperature >= this.greenMin && this.temperature <= this.greenMax) {
      this.inZoneMs += delta;
    }
    if (this.inZoneText && this.inZoneText.active) {
      const secs = (this.inZoneMs / 1000).toFixed(1);
      this.inZoneText.setText(secs + ' / ' + this.targetSecondsInZone + 's IN ZONE');
    }

    // Total elapsed + remaining-timer UI.
    this.totalElapsedMs += delta;
    if (this.timerText && this.timerText.active) {
      const remaining = Math.max(0, this.totalDurationMs - this.totalElapsedMs);
      this.timerText.setText(Math.ceil(remaining / 1000).toString());
    }

    // Win check BEFORE lose check — if they both trigger the same frame,
    // the player earned the win.
    if (this.inZoneMs >= this.targetSecondsInZone * 1000) {
      this.win();
      return;
    }
    if (this.totalElapsedMs >= this.totalDurationMs) {
      this.lose();
      return;
    }
  }
}
