import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import OverworldScene from './scenes/OverworldScene.js';

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  parent: 'game-container',
  backgroundColor: '#0a0e27',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MainMenuScene, OverworldScene],
};

new Phaser.Game(config);
