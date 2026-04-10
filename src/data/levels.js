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
  // Act 2 — top-down underwater K-fish collection. Not a ritual step; the
  // mermaid hints "the K-fish first" but DinnerService is the only enforced
  // ritual gate in the galley. First minigame to use Arcade Physics.
  'scuba-dive': {
    id: 'scuba-dive',
    sceneKey: 'ScubaDiveGame',
    instruction: 'DIVE!',
    location: 'Galley Hatch',
    isRitual: false,
    act: 2,
    config: { targetFish: 10, lives: 3, durationMs: 30000, fishSpawnIntervalMs: 600 },
  },
  // Act 2 — Ritual Step 2. Three Michelin-vs-mundane menu picks. Sequence
  // guard blocks this if pipe-smoke (step 1) hasn't been completed.
  'dinner-service': {
    id: 'dinner-service',
    sceneKey: 'DinnerService',
    instruction: 'EAT!',
    location: 'Galley',
    isRitual: true,
    ritualStep: 2,
    act: 2,
    config: {},
  },
  // Act 3 — rapid-tap survival against a fast-draining vertical PowerMeter.
  // SPACE adds +tapPower, alternating Q/W or mobile L/R adds +8, same key
  // twice in a row adds only +4, mobile center button adds +6. First reuse
  // of PowerMeter in vertical orientation. Not a ritual step.
  'motorboat': {
    id: 'motorboat',
    sceneKey: 'MotorboatGame',
    instruction: 'BLOW!',
    location: 'Open Sea',
    isRitual: false,
    act: 3,
    config: { durationMs: 20000, decayPerSec: 50, tapPower: 12, alternateBonus: 4 },
  },
  // Act 3 — Ritual Step 3. Temperature-slider minigame. LEFT/RIGHT (or the
  // on-screen L/R buttons) nudge the temperature; random mermaid splashes
  // nudge it back. Win by accumulating targetSecondsInZone seconds in the
  // green band within totalDurationMs. Sequence guard blocks this if
  // dinner-service (step 2) hasn't been completed.
  'mermaid-shower': {
    id: 'mermaid-shower',
    sceneKey: 'MermaidShower',
    instruction: 'WASH!',
    location: 'Mermaid Grotto',
    isRitual: true,
    ritualStep: 3,
    act: 3,
    config: { greenZone: [35, 65], targetSecondsInZone: 10, totalDurationMs: 25000, splashIntervalMs: 1200 },
  },
  // More entries added in Session 7
};
