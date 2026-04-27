# Galaxy Boat — CLAUDE.md

## What this is
A browser-based pixel-art mini-RPG built in Phaser 3. Player is Captain Chowder John. Goal: get Cody off the Galaxy Boat by completing minigames and a 4-step ritual (pipe → dinner → shower → nap) in the correct order. Failure or wrong order = Cody becomes a hurricane and sinks Florida. Fail cutscene shows Cody on a coral throne as Aquaman.

This is an inside joke for the developer's friend group. It is not a commercial product. Tone is absurd, nothing takes itself seriously. 15–30 minute playthrough.

## Tech stack (decided, do not change)
- Phaser 3.80.x
- Vite (bundler + dev server)
- Vanilla JavaScript (no TypeScript)
- No Tiled (rooms are JS arrays in src/data/rooms.js)
- No Grid Engine plugin (custom 4-direction movement in src/objects/Player.js)
- No localStorage (state lives in game.registry)
- Free (CC0 / CC-BY) assets only

## Commands
- `npm run dev` — start dev server, opens at http://localhost:5173
- `npm run build` — production build to dist/
- `npm run preview` — preview production build locally
- `npm run deploy` — push dist/ to gh-pages branch (deploys to GitHub Pages)

## Architecture
- All minigames extend `src/scenes/minigames/BaseMinigame.js`. **Never modify `BaseMinigame.js` from inside a minigame file** — it is the contract. Subclasses override `setupGame()` and call `this.win()` / `this.lose()`.
- Add new minigames as one new scene file plus one entry in `src/data/levels.js`
- Rooms are JS arrays in `src/data/rooms.js`. Each room has a layout (2D array), doors (with target room + spawn coords), an optional `triggers` array (tile-based minigame launch points), and a default playerSpawn. Add new rooms by adding entries here, no other code changes needed for the room data itself.
- Trigger zones live in `rooms.js` as a `triggers` array on each room (`{ x, y, levelId }`). `OverworldScene` checks for trigger overlap after every move and calls `startMinigameForLevel`. Sequence-guarded levels run `SequenceGuard.assertCanStartRitual` before launching the TransitionScene.
- Once a minigame is in `completedMinigames`, its trigger is dormant — no `!` marker, the player walks right over it. To re-test a minigame, manually clear it from the registry via the dev console.
- Game state lives on Phaser's `game.registry` via `src/systems/GameStateManager.js`. Always write through `set()` (not in-place mutation) so `changedata-*` events fire for HUD subscribers.
- Failure threshold lives in `src/systems/GameStateManager.js` as `FAILURE_THRESHOLD` (currently 5).
- Cross-scene events go through `src/systems/EventBus.js` (a shared Phaser `EventEmitter` singleton). Notable events: `'dialog-complete'`, `'hurricane-fail'`, `'victory'`.
- Ritual order is enforced by `src/systems/SequenceGuard.js`
- HUD is a parallel scene (`HUDScene`), launched (not started) from `OverworldScene` and guarded by `scene.isActive` so it persists across `scene.restart()` (door transitions).
- Dialog is a parallel scene (`DialogScene`), launched (not started). Overworld uses a `dialogActive` flag rather than `scene.pause()` to gate input while dialog is open.
- Scene render order is the order of the `scene:` array in `src/index.js`. `HUDScene` MUST stay LAST so it draws on top of every gameplay scene.
- `CutsceneScene` (`src/scenes/CutsceneScene.js`) is a data-driven scene with two modes: `'fail'` (screen shake → Cody spin → hurricane → Aquaman throne → RETRY button) and `'victory'` (fade-in beach + scrolling credits). Both modes end in `returnToMenu()`, which calls `stopMusic()` then `GameStateManager.reset(game)` to zero the registry and bounces back to `MainMenuScene`. Tracks all `delayedCall` handles in `this.timers` and removes them in `shutdown()` so early `returnToMenu()` doesn't leak callbacks. Fail mode plays `bgm-fail` + `sfx-hurricane`; victory mode plays `bgm-victory`. Both modes use real sprites/images when loaded (cutscene-hurricane, cutscene-aquaman, cody) with Phaser graphics fallbacks.
- `CutsceneRouter` (`src/systems/CutsceneRouter.js`) owns the module-scoped global listeners for `'hurricane-fail'` and `'victory'`. Registered ONCE from `src/index.js` after `new Phaser.Game()` via `registerCutsceneRouter(__game)`. On either event, it stops every active/paused scene except `CutsceneScene` and starts `CutsceneScene` with the appropriate `mode`. The handoff is deferred by a `Promise.resolve().then(...)` microtask so scene state isn't mutated inside a Phaser event callback (the synchronous path from `BaseMinigame.win() → markRitualStep() → EventBus.emit()` historically caused "Cannot read property 'sys' of undefined" crashes). Uses `routerRegistered` + `routing` flags to survive Vite HMR and same-frame double-emits.
- `HUDScene` is display-only as of Session 7 — it subscribes to `changedata-failureCount` to update the counter and nothing else. The Session 3 placeholder hurricane banner was removed; `CutsceneRouter` + `CutsceneScene` handle the fail flow end-to-end.
- Arcade Physics is enabled globally in `src/index.js` (`physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }`). Only `ScubaDiveGame` currently uses physics (player circle + K-fish containers + overlap callbacks). Other scenes ignore physics at near-zero cost.
- Sequence guard (`SequenceGuard.assertCanStartRitual`) fires an immediate `'hurricane-fail'` when a ritual step is attempted out of order. Verified in Session 5: walking straight to the Dinner (step 2) trigger from a fresh game, with no Pipe (step 1) completion, triggers the placeholder hurricane banner.
- `src/index.js` sets `render.preserveDrawingBuffer: true` and `fps.forceSetTimeOut: true` so headless preview screenshots capture live WebGL state and Phaser's clock keeps advancing when the tab isn't focused. `window.__game` is exposed as a dev hook for inspection from the preview eval tool. All three are no-ops for normal play.
- Asset preloading is centralized in `src/scenes/BootScene.js`. All sprites, tilesets, cutscene images, BGM, and SFX are loaded there with `this.load.on('loaderror', ...)` so a missing file logs a warning instead of crashing. Every scene that creates characters/tiles uses `if (this.textures.exists(key)) { sprite } else { rectangle }` — the game is fully playable with zero assets loaded.
- Music is managed by `src/systems/MusicManager.js` — two exports: `playMusic(scene, key, volume)` and `stopMusic(scene)`. Tracks current BGM via `game.registry` (`currentMusicKey`, `currentMusicInstance`) so room transitions don't restart the overworld theme. Handles browser autoplay lock via `scene.sound.once('unlocked', ...)`.
- `src/objects/GenericNPC.js` is a reusable NPC class taking `(scene, tileX, tileY, dialogId, textureKey, fallbackColor)`. Same `isAdjacentTo()` check as Cody/Mermaid. Uses sprite if textureKey loaded, rectangle with fallbackColor otherwise. Shows "!" marker.
- Game is mobile-first. All interactive elements respond to `pointerdown`. Touch buttons are 32x32 (d-pads) or 44x36 (action buttons) in the 256x224 canvas, scaling to ~96px+ physical on phones.
- Phaser scale mode: `FIT` with `CENTER_BOTH`. Letterbox bars appear in portrait; a CSS-only "Rotate to landscape" overlay shows on phone-width screens in portrait orientation.
- PWA: manual manifest (`public/manifest.webmanifest`) + service worker (`public/sw.js`). Friends can install the gh-pages URL via "Add to Home Screen". Service worker uses cache-first strategy for offline play. Bump `CACHE_VERSION` in `sw.js` to force re-cache on deploy.

## Reusable UI Components
Plain JS classes (not Phaser scenes) that wrap a few `scene.add.*` objects. Constructed inside a minigame's `setupGame()` and destroyed automatically when the scene shuts down.

- `src/ui/RhythmBar.js` — note-and-hit-zone rhythm tap UI. Notes spawn from the right and travel toward a green hit zone on the left; `hit()` returns true if the nearest pending note is inside ±150ms. Used by `CokeDrinkGame` and `LullabyGame`. Note: `NOTE_TRAVEL_MS = 1500` is a module-level constant — not configurable per-instance.
- `src/ui/PowerMeter.js` — fillable bar with decay. `add(delta)` bumps the value (negative deltas are clamped to 0), `decay(deltaMs)` drains it (call from `update(time, delta)`), `value` is a plain property (not a getter — would conflict with internal assignments). Supports horizontal (default) and vertical orientation. The fill is green when ≥50% of max, yellow 25–50%, red <25% — so if you want the bar to read "green = good" for something that GROWS toward danger, invert the semantics (store the inverse and call `add(-delta)` on penalty). `MermaidNap` does exactly this: it tracks "sleep level" starting at 100 and subtracts 25 per missed shush, so the bar visually reads "green = asleep (good) → red = awake (lose)". Used by `PipeSmoke` (horizontal, grow-to-win), `MotorboatGame` (vertical, grow-to-win), and `MermaidNap` (horizontal, inverted semantics).

## Key patterns
- Minigame lifecycle: TITLE_CARD → INSTRUCTION → PLAY → EVALUATE → WIN/LOSE (handled by BaseMinigame)
- Scene transitions: `this.scene.start('SceneKey', { data })`
- Cross-scene data: `this.registry.get('key')` / `this.registry.set('key', value)`
- Ritual steps: scenes that extend BaseMinigame and set `isRitual: true` in their level config

## Failure threshold
- 5 failed minigames = hurricane fail cutscene
- Wrong-order ritual attempt = immediate hurricane fail cutscene

## Resolution
- Internal: 256×224 (SNES standard)
- pixelArt: true, roundPixels: true
- Tile size: 16×16
- Character sprites: 16×16 (or 16×24 for taller)

## Art strategy
- Sessions 1–7: placeholder rectangles, circles, Phaser graphics primitives only
- Session 8: real sprites replace placeholders; every creation site checks `textures.exists(key)` and falls back to the original rectangle if the asset is missing
- One Cody variant for v1 (CodySelectScene exists as a stub but is disabled)

## Asset inventory (Session 8+)
All assets live under `public/assets/`. BootScene preloads everything; missing files log a warning and fall back to rectangles.

**Sprites** (`sprites/`): captain.png (16x16), cody.png (16x12), cody-werewolf.png, cody-aquaman.png, mermaid-1.png, mermaid-2.png, k-fish-gold.png, k-fish-red.png
**Tilesets** (`tilesets/`): floor.png, wall.png, door.png (16x16 each, extracted from boat-tileset.png)
**Cutscenes** (`cutscenes/`): hurricane.png, aquaman.png (full-screen 256x224)
**BGM** (`audio/`): bgm-overworld.mp3, bgm-minigame.mp3, bgm-underwater.mp3, bgm-victory.mp3, bgm-fail.mp3
**SFX** (`audio/`): sfx-howl.wav, sfx-splash.wav, sfx-puff.wav, sfx-ding.wav, sfx-buzz.wav, sfx-hurricane.wav

## Required reading at the start of every session
- This file (CLAUDE.md)
- docs/GAME-DESIGN.md (game design source of truth)
- docs/PHASE_LOG.md (what's been built so far, in what order)

## What NOT to do
- Do NOT use TypeScript
- Do NOT add npm dependencies unless explicitly approved
- Do NOT modify src/scenes/minigames/BaseMinigame.js from a minigame file
- Do NOT use localStorage (use game.registry)
- Do NOT build a character creator (one Cody for v1)
- Do NOT use copyrighted music or art
- Do NOT introduce Tiled, Grid Engine, or any plugin/tool not already in package.json
- Do NOT skip git hooks with --no-verify
- Do NOT add type hints, docstrings, or refactors to code that wasn't part of the current session's goal
- Do NOT mark a task complete if anything is broken — keep it in_progress and ask the user

## Current phase
**Session 9 complete. MOBILE POLISH + PWA DONE.** Touch buttons resized for thumbs (d-pads 32x32, action buttons 44x36). Mobile CSS added (touch-action:none, overflow:hidden, overscroll-behavior:none) to prevent scroll bounce and pull-to-refresh. Landscape hint overlay appears on phone-width screens in portrait. PWA manifest + service worker added for "Add to Home Screen" and offline play. Difficulty tuned across all 7 configurable minigames — erring on forgiving for casual mobile play. No new npm dependencies (vite-plugin-pwa incompatible with Vite 8; manual PWA instead). Game is ready to ship. Next: Session 10 — production build, itch.io upload, single HTML file, QR code.

## Sprite fallback conventions
Every character/tile creation uses `if (this.textures.exists(key)) { sprite } else { rectangle }`. Color flashes use `if (obj.setTint) { obj.setTint(color) } else { obj.setFillStyle(color) }` — Sprites have `setTint`, Rectangles have `setFillStyle`. Fallback colors: Player=blue, Cody=green, Mermaids=pink (`0xff69b4`), K-fish gold=yellow, K-fish red=red, Pipe=brown, Coke=red, GenericNPCs=per-instance fallbackColor param.
