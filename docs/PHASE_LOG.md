# Galaxy Boat — Phase Log

This file tracks the build session by session. Add a new row to the table at the end of every session.

| # | Date       | Session             | Status     | Deviations from plan                                              | Open issues / TODO                                                    |
|---|------------|---------------------|------------|-------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | 2026-04-10 | Scaffold + Deploy   | ✓ Complete | Cloned repo lived in `~/code/galaxy-boat/`; merged into cwd       | Rename local folder `hurricane cody` → `galaxy-boat` before Session 2 |
| 2 | 2026-04-10 | Overworld + Rooms   | ✓ Complete | `PLAYER_SPEED` constant defined but not yet wired to Player tween | None                                                                  |
| 3 | 2026-04-10 | Dialog + Minigame Shell | ✓ Complete | HUDScene placed LAST in scene array (not 4th) so it renders on top of minigames; TALK button at (90,190) instead of plan's (85,190) | Hurricane banner is placeholder text; real cutscene in Session 7. `EventBus.once('dialog-complete')` is global, not NPC-scoped — fine while only Cody talks |

## Session notes

(Free-form notes go here, organized by session number. Use this section for anything that doesn't fit in the table — gotchas, decisions, links to commits, etc.)

### Session 1
Scaffolded Phaser 3.80 + Vite project from scratch (manual fallback, not the `npm create @phaserjs/game` wizard). Created `BootScene` (loading bar, 500ms delay) and `MainMenuScene` (title, subtitle, START button with pointer + Enter input). Configured Vite with `base: './'` for relative paths. Deployed to GitHub Pages via `gh-pages` package. Live at https://LIFE-it-self.github.io/galaxy-boat/.

### Session 2
Built the boat overworld. Added `src/constants.js` (tile size, colors, tile types), `src/data/rooms.js` with 4 hand-authored room layouts (Main Deck, Bar, Galley, Bridge) as 14×16 JS arrays, `src/objects/Player.js` (plain class with tile-snapped 4-direction movement via 150ms tween + `isMoving` lock), and `src/scenes/OverworldScene.js` which renders a room, polls keyboard cursors, exposes a 4-button on-screen touch cross in the bottom-left corner, and transitions between rooms via `scene.restart` after a 300ms camera fade. Doors are passable tiles (`canEnter` only blocks walls); the overworld checks for a door tile in `update()` once the player's tween finishes, then triggers the fade. MainMenu START now launches `OverworldScene` with `roomId: 'main-deck'`. All 6 door transitions verified end-to-end (Main Deck ↔ Bar ↔ Galley, Main Deck ↔ Bridge), wall collision verified on all 4 sides, both keyboard and touch input verified on desktop and mobile (375×812) viewports. Zero console errors / warnings.

### Session 3
Built the dialog → minigame → result loop. New files:
- `src/systems/EventBus.js` — shared Phaser `EventEmitter` singleton.
- `src/systems/GameStateManager.js` — registry-backed state (`failureCount`, `ritualProgress`, `completedMinigames`, `selectedCodyVariant`, `currentAct`). Exports `FAILURE_THRESHOLD = 5`. All writes go through `registry.set()` so HUD subscribers fire on `changedata-*`.
- `src/systems/SequenceGuard.js` — `assertCanStartRitual(game, stepNumber)` validates ritual step order, emits `'hurricane-fail'` on mismatch.
- `src/systems/FailHandler.js` — side-effect module: console-logs `'hurricane-fail'` events for debug. Imported from `src/index.js` for its side effect only.
- `src/data/levels.js` — `LEVELS` registry; one entry: `placeholder`.
- `src/data/dialogs.js` — `DIALOGS` registry; one entry: `cody-intro` (4 lines).
- `src/scenes/HUDScene.js` — parallel HUD. Top-left `Failures: N/5`, top-right `Objective: Find Cody`. Subscribes to `changedata-failureCount` for live updates and to EventBus `'hurricane-fail'`. On hurricane: shows red banner for 2s, resets state, stops every active scene except itself + MainMenuScene, starts MainMenuScene, stops itself. Guarded by `hurricaneActive` flag against re-entry.
- `src/scenes/DialogScene.js` — bottom-of-screen typewriter dialog box (30ms/char). First press fast-forwards line, second advances. Emits `'dialog-complete'` on EventBus when done. 50ms input grace before listeners attach to swallow the launching pointerdown.
- `src/scenes/TransitionScene.js` — black title card with instruction + location. 2s auto-advance OR space/tap to skip. `advanced` flag prevents double-fire.
- `src/scenes/minigames/BaseMinigame.js` — **sacred file, do not edit from minigame subclasses.** Named export. Exposes `setupGame()`/`evaluate()` overrides and `win()`/`lose()` helpers that handle state, GameStateManager bookkeeping, the result overlay, and the return-scene start.
- `src/scenes/minigames/PlaceholderGame.js` — first BaseMinigame subclass. SPACE wins, X loses, top-half tap wins, bottom-half tap loses.
- `src/objects/Cody.js` — green 16×16 NPC with yellow `!` marker. `isAdjacentTo()` uses Manhattan distance.

Modifications: `src/scenes/BootScene.js` calls `GameStateManager.init(this.game)` before transitioning to MainMenu. `src/scenes/OverworldScene.js` spawns Cody at tile (8,6) on Main Deck, adds a TALK touch button, registers Z/Enter listeners, launches HUDScene (guarded by `isActive` so door restarts don't stack instances), and gates input via a `dialogActive` flag while DialogScene is open. `src/index.js` imports the new scenes and `FailHandler.js`; scene array is `[BootScene, MainMenuScene, OverworldScene, DialogScene, TransitionScene, PlaceholderGame, HUDScene]` — HUDScene MUST be last so it renders on top of minigames.

**Render order bug caught & fixed during verification**: HUDScene was originally placed at index 3 in the scene array, which caused PlaceholderGame to draw over it. Moving HUDScene to the end of the array fixed it.

Verified end to end on desktop: boot → menu → main deck → talk to Cody → typewriter dialog → 4 lines → black title card → PlaceholderGame → SPACE wins → return to overworld with `Failures: 0/5`. Lose path tested: X → LOSE overlay → return → `Failures: 1/5`. Lost 5 times → red HURRICANE banner → 2s later bounced back to MainMenuScene with state reset confirmed (`Failures: 0/5` on next playthrough). All 6 door transitions still work; HUD persists across them. Zero console errors.
