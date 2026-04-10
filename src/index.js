import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import OverworldScene from './scenes/OverworldScene.js';
import HUDScene from './scenes/HUDScene.js';
import DialogScene from './scenes/DialogScene.js';
import TransitionScene from './scenes/TransitionScene.js';
import PlaceholderGame from './scenes/minigames/PlaceholderGame.js';
import CokeDrinkGame from './scenes/minigames/CokeDrinkGame.js';
import PipeSmoke from './scenes/minigames/PipeSmoke.js';
import './systems/FailHandler.js'; // side-effect: registers global hurricane-fail logger

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
  // Scene order matters for rendering: parallel scenes draw in this order,
  // so HUDScene goes LAST to ensure it overlays every gameplay scene.
  scene: [
    BootScene,
    MainMenuScene,
    OverworldScene,
    DialogScene,
    TransitionScene,
    PlaceholderGame,
    CokeDrinkGame,
    PipeSmoke,
    HUDScene,
  ],
};

new Phaser.Game(config);
