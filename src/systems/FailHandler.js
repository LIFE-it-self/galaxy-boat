// FailHandler — global, side-effect-only listener for 'hurricane-fail'.
// Logs to the console for debugging. The user-visible fail UI lives in
// CutsceneScene, started by CutsceneRouter in response to the same event;
// this file just exists so we have a single import-and-forget place for
// cross-cutting fail behavior. Imported once from src/index.js.

import { EventBus } from './EventBus.js';

EventBus.on('hurricane-fail', (data) => {
  console.log('[hurricane-fail]', data);
});
