// Boat overworld room definitions for Session 2.
//
// Each room is a 14-row by 16-column grid (matches the 256x224 internal
// resolution at 16px per tile).
//
//   layout[y][x]   y = row (0 = top), x = column (0 = left)
//   0 = floor      walkable
//   1 = wall       blocks the player
//   2 = door       walkable; OverworldScene fades the camera and switches
//                  scenes when the player lands on this tile
//
// `doors` lists every door tile in the layout along with the target room
// and the (tile) coordinates the player should spawn at in that target.
// `playerSpawn` is only used the very first time you enter a room from the
// main menu (door traversal supplies its own spawn coords).
//
// Door graph:
//
//                  [BRIDGE]
//                     |
//                     | top door of MAIN-DECK
//                     |
//                  [MAIN-DECK]
//                     |
//                     | bottom door of MAIN-DECK
//                     |
//                  [BAR] ----- right door of BAR ----- [GALLEY]
//

export const ROOMS = {
  // ─────────────────────────────────────────────────────────────────────
  // MAIN DECK — biggest room, two doors (bottom -> bar, top -> bridge)
  // ─────────────────────────────────────────────────────────────────────
  'main-deck': {
    id: 'main-deck',
    displayName: 'Main Deck',
    // 14 rows x 16 cols. Door at (8, 0) top-center -> bridge.
    //                    Door at (8, 13) bottom-center -> bar.
    layout: [
      [1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1], // row  0  (top wall, door col 8)
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  1
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  2
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  3
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  4
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  5
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  6
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  7  (default spawn row)
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  8
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  9
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 10
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 11
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 12
      [1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1], // row 13 (bottom wall, door col 8)
    ],
    doors: [
      // top door -> bridge. Player spawns just above bridge's bottom door.
      { x: 8, y: 0,  targetRoom: 'bridge', spawnX: 8, spawnY: 12 },
      // bottom door -> bar. Player spawns just below bar's top door.
      { x: 8, y: 13, targetRoom: 'bar',    spawnX: 8, spawnY: 1  },
    ],
    playerSpawn: { x: 8, y: 7 },
  },

  // ─────────────────────────────────────────────────────────────────────
  // BAR — door at top back to main deck, door at right to galley
  // ─────────────────────────────────────────────────────────────────────
  'bar': {
    id: 'bar',
    displayName: 'Bar',
    // Door at (8, 0)  top-center  -> main-deck.
    // Door at (15, 7) right-center -> galley.
    layout: [
      [1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1], // row  0  (top wall, door col 8)
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  1
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  2
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  3
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  4
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  5
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  6
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // row  7  (door col 15 -> galley)
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  8
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  9
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 10
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 11
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 12
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 13
    ],
    doors: [
      { x: 8,  y: 0, targetRoom: 'main-deck', spawnX: 8, spawnY: 12 },
      { x: 15, y: 7, targetRoom: 'galley',    spawnX: 1, spawnY: 7  },
    ],
    playerSpawn: { x: 8, y: 7 },
  },

  // ─────────────────────────────────────────────────────────────────────
  // GALLEY — single door at left back to bar
  // ─────────────────────────────────────────────────────────────────────
  'galley': {
    id: 'galley',
    displayName: 'Galley',
    // Door at (0, 7) left-center -> bar.
    layout: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row  0
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  1
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  2
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  3
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  4
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  5
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  6
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  7  (door col 0 -> bar)
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  8
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  9
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 10
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 11
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 12
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 13
    ],
    doors: [
      { x: 0, y: 7, targetRoom: 'bar', spawnX: 14, spawnY: 7 },
    ],
    playerSpawn: { x: 8, y: 7 },
  },

  // ─────────────────────────────────────────────────────────────────────
  // BRIDGE — single door at bottom back to main deck
  // ─────────────────────────────────────────────────────────────────────
  'bridge': {
    id: 'bridge',
    displayName: 'Bridge',
    // Door at (8, 13) bottom-center -> main-deck.
    layout: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row  0
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  1
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  2
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  3
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  4
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  5
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  6
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  7
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  8
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row  9
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 10
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 11
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 12
      [1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1], // row 13 (door col 8 -> main-deck)
    ],
    doors: [
      { x: 8, y: 13, targetRoom: 'main-deck', spawnX: 8, spawnY: 1 },
    ],
    playerSpawn: { x: 8, y: 7 },
  },
};
