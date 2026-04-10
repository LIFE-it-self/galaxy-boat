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
import ScubaDiveGame from './scenes/minigames/ScubaDiveGame.js';
import DinnerService from './scenes/minigames/DinnerService.js';
import MotorboatGame from './scenes/minigames/MotorboatGame.js';
import MermaidShower from './scenes/minigames/MermaidShower.js';
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
  // preserveDrawingBuffer lets external tools (dev/verification screenshots)
  // capture the current WebGL canvas contents. Minor perf cost at 256x224,
  // negligible for this game. Safe to keep on permanently.
  render: {
    preserveDrawingBuffer: true,
  },
  // forceSetTimeOut uses setTimeout instead of requestAnimationFrame for the
  // game loop. rAF is throttled/paused in unfocused/headless browsers, which
  // stops Phaser's delayed calls and tweens from ever firing during preview
  // verification. setTimeout keeps the clock running regardless of focus.
  fps: {
    forceSetTimeOut: true,
    target: 60,
  },
  // Arcade Physics is enabled globally so ScubaDiveGame can use overlap
  // callbacks for player vs K-fish collisions. Other scenes ignore physics
  // at near-zero cost — OverworldScene's tile-based tween movement is
  // unaffected.
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { y: 0 } },
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
    ScubaDiveGame,
    DinnerService,
    MotorboatGame,
    MermaidShower,
    HUDScene,
  ],
};

const __game = new Phaser.Game(config);
// Debug hook — lets Vite dev tools / preview inspection reach the Phaser
// game instance. Safe in dev; harmless in prod (the symbol just exists).
if (typeof window !== 'undefined') window.__game = __game;
