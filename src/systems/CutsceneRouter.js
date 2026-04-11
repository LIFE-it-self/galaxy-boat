// CutsceneRouter — module-level event bridge that listens on the global
// EventBus for 'hurricane-fail' and 'victory' and starts CutsceneScene in
// response. Called once from src/index.js after `new Phaser.Game(config)`.
//
// Why a MODULE instead of a scene:
//   Listeners must persist across scene restarts. If we registered
//   'hurricane-fail' inside a scene's create(), it would get added and
//   removed on every door transition or minigame launch. FailHandler.js
//   is the same pattern — a side-effect module, not a scene.
//
// Why the Promise.resolve().then(...) microtask deferral:
//   Both 'hurricane-fail' and 'victory' are emitted SYNCHRONOUSLY inside
//   BaseMinigame.win/lose and SequenceGuard.assertCanStartRitual, which
//   run mid-update. Calling game.scene.stop(...) and game.scene.start(...)
//   inside a Phaser event callback while the scene manager is in the
//   middle of its update loop has caused "Cannot read property 'sys' of
//   undefined" errors historically. Deferring by a microtask lets Phaser
//   finish the current tick before we mutate the scene list.
//
// Double-start guards:
//   - routerRegistered at module scope prevents HMR from stacking
//     listeners when Vite re-imports this module.
//   - routing flag + game.scene.isActive('CutsceneScene') check prevents
//     a second cutscene from starting if 'hurricane-fail' and 'victory'
//     (somehow) both fire in the same frame.

import { EventBus } from './EventBus.js';

let routerRegistered = false;
let routing = false;

function stopAllExcept(game, keepKeys) {
  game.scene.scenes.forEach((s) => {
    const key = s.scene.key;
    if (keepKeys.includes(key)) return;
    if (game.scene.isActive(key) || game.scene.isPaused(key)) {
      game.scene.stop(key);
    }
  });
}

function route(game, mode, context) {
  if (routing) return;
  if (game.scene.isActive('CutsceneScene')) return;
  routing = true;
  // Microtask deferral — do NOT mutate scene state inside the Phaser
  // event callback that just fired. Wait for the current tick to finish.
  Promise.resolve().then(() => {
    try {
      // Stop BEFORE start — CutsceneScene is not yet in the scene list
      // the first time this runs, so stopAllExcept wouldn't touch it,
      // but on subsequent routes (if a cutscene was previously stopped)
      // we still want to tear everything else down first.
      stopAllExcept(game, ['CutsceneScene']);
      game.scene.start('CutsceneScene', { mode, context });
    } finally {
      routing = false;
    }
  });
}

export function registerCutsceneRouter(game) {
  if (routerRegistered) return;
  routerRegistered = true;
  EventBus.on('hurricane-fail', (data) => route(game, 'fail', data));
  EventBus.on('victory', (data) => route(game, 'victory', data));
}
