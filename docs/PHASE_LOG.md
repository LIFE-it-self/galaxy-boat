# Galaxy Boat — Phase Log

This file tracks the build session by session. Add a new row to the table at the end of every session.

| # | Date       | Session             | Status     | Deviations from plan                                              | Open issues / TODO                                                    |
|---|------------|---------------------|------------|-------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1 | 2026-04-10 | Scaffold + Deploy   | ✓ Complete | Cloned repo lived in `~/code/galaxy-boat/`; merged into cwd       | Rename local folder `hurricane cody` → `galaxy-boat` before Session 2 |

## Session notes

(Free-form notes go here, organized by session number. Use this section for anything that doesn't fit in the table — gotchas, decisions, links to commits, etc.)

### Session 1
Scaffolded Phaser 3.80 + Vite project from scratch (manual fallback, not the `npm create @phaserjs/game` wizard). Created `BootScene` (loading bar, 500ms delay) and `MainMenuScene` (title, subtitle, START button with pointer + Enter input). Configured Vite with `base: './'` for relative paths. Deployed to GitHub Pages via `gh-pages` package. Live at https://LIFE-it-self.github.io/galaxy-boat/.
