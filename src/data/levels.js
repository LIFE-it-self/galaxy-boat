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
  // More entries added in Sessions 4–7
};
