import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Title
    this.add.text(w / 2, 60, 'GALAXY BOAT', {
      font: 'bold 24px monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(w / 2, 95, 'Get Cody off the boat.', {
      font: '10px monospace',
      color: '#c0c0c0',
    }).setOrigin(0.5);

    // Start button (rectangle background + text label)
    const btnBg = this.add.rectangle(w / 2, 150, 88, 24, 0x1f3a93);
    btnBg.setStrokeStyle(1, 0xffffff);
    this.add.text(w / 2, 150, 'START', {
      font: 'bold 12px monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Mobile-first: support both pointer (click/touch) and Enter key
    btnBg.setInteractive({ useHandCursor: true });
    const onStart = () => {
      console.log('Start clicked — gameplay coming in Session 2');
    };
    btnBg.on('pointerdown', onStart);
    this.input.keyboard.on('keydown-ENTER', onStart);
  }
}
