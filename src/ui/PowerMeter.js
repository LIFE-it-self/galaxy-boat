// PowerMeter — reusable fillable bar with decay for tap-to-charge minigames.
//
// Not a Phaser scene. A plain JS class wrapping a few Phaser rectangles in
// the owning scene. Used by PipeSmoke in Session 4 and reused by
// MotorboatGame later.
//
// API:
//   const m = new PowerMeter(scene, x, y, w, h, { max: 100, decayPerSec: 25 });
//   m.add(30);                  // bump on a tap
//   m.decay(deltaMs);           // call from scene.update(time, delta)
//   if (m.value <= 0) lose();   // plain property — no getter
//   m.destroy();
//
// IMPORTANT: this.value is a plain property, NOT a getter. Do not turn it
// into one — internal assignments would silently fail.

import Phaser from 'phaser';

const COLOR_HIGH = 0x40c040;
const COLOR_MID = 0xc0c040;
const COLOR_LOW = 0xc04040;

export class PowerMeter {
  constructor(scene, x, y, width, height, opts = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.max = opts.max != null ? opts.max : 100;
    this.value = opts.initial != null ? opts.initial : this.max;
    this.decayPerSec = opts.decayPerSec != null ? opts.decayPerSec : 25;
    this.orientation = opts.orientation || 'horizontal';
    this.label = opts.label || '';

    // Border. Origin (0,0) so x/y is the top-left corner — easier to reason
    // about than centered rectangles when the fill grows from one side.
    this.border = scene.add.rectangle(x, y, width, height)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffffff)
      .setFillStyle(0x000000, 0)
      .setDepth(8);

    // Fill. Starts full and shrinks toward one side as the value drops.
    this.fill = scene.add.rectangle(x, y, width, height, COLOR_HIGH)
      .setOrigin(0, 0)
      .setDepth(7);

    if (this.label) {
      this.labelText = scene.add.text(x, y - 10, this.label, {
        font: '8px monospace',
        color: '#ffffff',
      }).setDepth(8);
    }

    this._redraw();
  }

  add(delta) {
    this.value = Phaser.Math.Clamp(this.value + delta, 0, this.max);
    this._redraw();
  }

  // deltaMs comes straight from Phaser's update(time, delta) callback.
  decay(deltaMs) {
    this.value = Math.max(0, this.value - this.decayPerSec * deltaMs / 1000);
    this._redraw();
  }

  destroy() {
    if (this.border) this.border.destroy();
    if (this.fill) this.fill.destroy();
    if (this.labelText) this.labelText.destroy();
  }

  _redraw() {
    if (!this.fill || !this.fill.active) return;
    const ratio = this.max > 0 ? this.value / this.max : 0;

    let color = COLOR_HIGH;
    if (ratio < 0.25) color = COLOR_LOW;
    else if (ratio < 0.5) color = COLOR_MID;

    this.fill.setFillStyle(color);

    if (this.orientation === 'vertical') {
      // Grow from the bottom up: shrink height and push the top down so
      // the bottom edge stays anchored at (x, y + height).
      const newH = Math.max(0, this.height * ratio);
      this.fill.height = newH;
      this.fill.y = this.y + (this.height - newH);
    } else {
      this.fill.width = Math.max(0, this.width * ratio);
    }
  }
}
