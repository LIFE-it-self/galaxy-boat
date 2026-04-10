// LEVELS — registry of every minigame in the game. Each entry is the data
// payload that BaseMinigame reads from this.levelConfig at scene start.
// Adding a level = new entry here + new scene class extending BaseMinigame.
// No edits to BaseMinigame, OverworldScene, or any system file required.

export const LEVELS = {
  'placeholder': {
    id: 'placeholder',
    sceneKey: 'PlaceholderGame',
    instruction: 'TEST!',
    location: 'Anywhere',
    isRitual: false,
    act: 0,
    config: {},
  },
  // Act 1 — werewolf rhythm. Cody drinks a Coke, transforms under a moon,
  // and the player taps in time with 8 howl notes. Not a ritual step (Act 1
  // setup, not the ritual itself).
  'coke-drink': {
    id: 'coke-drink',
    sceneKey: 'CokeDrinkGame',
    instruction: 'DRINK!',
    location: 'Ship Bar',
    isRitual: false,
    act: 1,
    config: { beats: 8, requiredHits: 6, noteTravelMs: 1500 },
  },
  // Act 1 — Ritual Step 1. Tap-to-puff against a draining "PIPE LIT" meter.
  // 5 puffs win the level; BaseMinigame.win() auto-records ritual step 1
  // because isRitual is true. Sequence guard runs in OverworldScene BEFORE
  // this scene starts.
  'pipe-smoke': {
    id: 'pipe-smoke',
    sceneKey: 'PipeSmoke',
    instruction: 'PUFF!',
    location: 'Main Deck',
    isRitual: true,
    ritualStep: 1,
    act: 1,
    config: { puffsRequired: 5, puffPower: 30, decayPerSec: 25 },
  },
  // More entries added in Sessions 5–7
};
