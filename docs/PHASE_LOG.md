# Galaxy Boat — Phase Log

This file tracks the build session by session. Add a new row to the table at the end of every session.

| # | Date       | Session             | Status     | Deviations from plan                                              | Open issues / TODO                                                    |
|---|------------|---------------------|------------|-------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | 2026-04-10 | Scaffold + Deploy   | ✓ Complete | Cloned repo lived in `~/code/galaxy-boat/`; merged into cwd       | Rename local folder `hurricane cody` → `galaxy-boat` before Session 2 |
| 2 | 2026-04-10 | Overworld + Rooms   | ✓ Complete | `PLAYER_SPEED` constant defined but not yet wired to Player tween | None                                                                  |

## Session notes

(Free-form notes go here, organized by session number. Use this section for anything that doesn't fit in the table — gotchas, decisions, links to commits, etc.)

### Session 1
Scaffolded Phaser 3.80 + Vite project from scratch (manual fallback, not the `npm create @phaserjs/game` wizard). Created `BootScene` (loading bar, 500ms delay) and `MainMenuScene` (title, subtitle, START button with pointer + Enter input). Configured Vite with `base: './'` for relative paths. Deployed to GitHub Pages via `gh-pages` package. Live at https://LIFE-it-self.github.io/galaxy-boat/.

### Session 2
Built the boat overworld. Added `src/constants.js` (tile size, colors, tile types), `src/data/rooms.js` with 4 hand-authored room layouts (Main Deck, Bar, Galley, Bridge) as 14×16 JS arrays, `src/objects/Player.js` (plain class with tile-snapped 4-direction movement via 150ms tween + `isMoving` lock), and `src/scenes/OverworldScene.js` which renders a room, polls keyboard cursors, exposes a 4-button on-screen touch cross in the bottom-left corner, and transitions between rooms via `scene.restart` after a 300ms camera fade. Doors are passable tiles (`canEnter` only blocks walls); the overworld checks for a door tile in `update()` once the player's tween finishes, then triggers the fade. MainMenu START now launches `OverworldScene` with `roomId: 'main-deck'`. All 6 door transitions verified end-to-end (Main Deck ↔ Bar ↔ Galley, Main Deck ↔ Bridge), wall collision verified on all 4 sides, both keyboard and touch input verified on desktop and mobile (375×812) viewports. Zero console errors / warnings.
