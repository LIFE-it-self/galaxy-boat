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
- `CutsceneScene` (`src/scenes/CutsceneScene.js`) is a data-driven scene with two modes: `'fail'` (screen shake → Cody spin → hurricane → Aquaman throne → RETRY button) and `'victory'` (fade-in beach + scrolling credits). Both modes end in `returnToMenu()`, which calls `GameStateManager.reset(game)` to zero the registry (`failureCount`, `ritualProgress`, `completedMinigames`, `talkedToCody`) and bounces back to `MainMenuScene`. Tracks all `delayedCall` handles in `this.timers` and removes them in `shutdown()` so early `returnToMenu()` (RETRY clicked before Aquaman shows) doesn't leak callbacks. All cutscene art is Phaser graphics primitives — no PNG preloads until Session 8.
- `CutsceneRouter` (`src/systems/CutsceneRouter.js`) owns the module-scoped global listeners for `'hurricane-fail'` and `'victory'`. Registered ONCE from `src/index.js` after `new Phaser.Game()` via `registerCutsceneRouter(__game)`. On either event, it stops every active/paused scene except `CutsceneScene` and starts `CutsceneScene` with the appropriate `mode`. The handoff is deferred by a `Promise.resolve().then(...)` microtask so scene state isn't mutated inside a Phaser event callback (the synchronous path from `BaseMinigame.win() → markRitualStep() → EventBus.emit()` historically caused "Cannot read property 'sys' of undefined" crashes). Uses `routerRegistered` + `routing` flags to survive Vite HMR and same-frame double-emits.
- `HUDScene` is display-only as of Session 7 — it subscribes to `changedata-failureCount` to update the counter and nothing else. The Session 3 placeholder hurricane banner was removed; `CutsceneRouter` + `CutsceneScene` handle the fail flow end-to-end.
- Arcade Physics is enabled globally in `src/index.js` (`physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }`). Only `ScubaDiveGame` currently uses physics (player circle + K-fish containers + overlap callbacks). Other scenes ignore physics at near-zero cost.
- Sequence guard (`SequenceGuard.assertCanStartRitual`) fires an immediate `'hurricane-fail'` when a ritual step is attempted out of order. Verified in Session 5: walking straight to the Dinner (step 2) trigger from a fresh game, with no Pipe (step 1) completion, triggers the placeholder hurricane banner.
- `src/index.js` sets `render.preserveDrawingBuffer: true` and `fps.forceSetTimeOut: true` so headless preview screenshots capture live WebGL state and Phaser's clock keeps advancing when the tab isn't focused. `window.__game` is exposed as a dev hook for inspection from the preview eval tool. All three are no-ops for normal play.

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
- Session 8: real sprites are dropped in to replace placeholders
- One Cody variant for v1 (CodySelectScene exists as a stub but is disabled)

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
**Session 7 complete. THE GAME IS PLAYABLE END-TO-END WITH PLACEHOLDER ART.** Act 4 is in: `LullabyGame` (non-ritual 8-note RhythmBar rhythm minigame, 6 required hits, 800ms spacing) and `MermaidNap` (ritual step 4, four deterministic noise events at 3000/7500/12000/16500ms with 2s shush windows; uses an inverted `PowerMeter` tracking "sleep level" that starts at 100 and loses 25 per missed shush). `ritualProgress` can now reach `[1, 2, 3, 4]`, which emits `'victory'` on the EventBus. The Session 3 placeholder hurricane banner in `HUDScene` is gone — `CutsceneRouter` + `CutsceneScene` now handle both the fail flow (shake → spin → hurricane → Aquaman throne → RETRY) and the victory flow (beach + sun + scrolling credits → MainMenu). `CutsceneRouter` listens for `'hurricane-fail'` and `'victory'` at module scope (persists across HMR via `routerRegistered` flag) and defers the scene handoff by a `Promise.resolve().then(...)` microtask to avoid mid-update scene mutation crashes. Cabin Corridor is the 5th room (east of Main Deck, mirror of Galley topology) housing both Act 4 triggers. All three endings verified via playtest: victory path (pipe → dinner → shower → nap), fail-by-threshold (5 losses), and fail-by-order (skipping a ritual step). Game is 100% playable; next is Session 8 — art and audio pass.

## Sprite/asset placeholder conventions (Sessions 1–7)
- Player (Captain) = blue 16×16 rectangle
- Cody = green 16×16 rectangle
- Werewolf Cody = gray 16×16 rectangle with red eye dots
- Aquaman Cody = teal 16×16 rectangle with yellow trident dot
- Mermaids = pink 16×16 rectangles
- K-fish (gold) = yellow K shape from two rectangles
- K-fish (red) = red K shape from two rectangles
- Pipe = brown 8×4 rectangle
- Coke can = red 8×12 rectangle
- Door / interact zone = invisible Phaser zone with a small visible icon overlay (yellow ! mark)
