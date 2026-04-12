// DIALOGS — registry of all dialog content. Each entry is { speaker, lines }.
// DialogScene reads `lines` and types them out one at a time. Speaker is
// not currently rendered (added in a later session if needed).

export const DIALOGS = {
  'cody-intro': {
    speaker: 'Cody',
    lines: [
      'Captain. We need to talk.',
      'I cannot leave this boat.',
      'There is a ritual. Pipe. Dinner. Shower. Nap.',
      'Help me. In that order.',
    ],
  },
  // Shown the SECOND time the player talks to Cody after cody-intro.
  // OverworldScene.tryInteract swaps to this id when registry.talkedToCody
  // is true. Pure narrative — no minigame fires from this dialog.
  'cody-hint-1': {
    speaker: 'Cody',
    lines: [
      'I keep thinking about the ritual.',
      'Pipe first. Always pipe first.',
      'You will know when it is time.',
    ],
  },
  // Galley mermaid — hints at the order of operations in the galley:
  // confirm pipe is done, push toward dinner, but mention K-fish first.
  'galley-mermaid': {
    speaker: 'Galley Mermaid',
    lines: [
      'You smell like smoke. Good.',
      'Now eat. The dinner is ready.',
      'But first, the K-fish. Cody needs the K-fish.',
    ],
  },
  'bar-bartender': {
    speaker: 'Ghost Bartender',
    lines: [
      'Coke first, captain. Always Coke first.',
      'The pipe wants its smoke after the howl.',
    ],
  },
  'bridge-parrot': {
    speaker: 'Parrot',
    lines: [
      'BLOW THE BOAT. *squawk* SHOWER.',
      'WET CODY. THEN SLEEPY CODY. *squawk*',
    ],
  },
  'galley-cook': {
    speaker: 'Cooking Mermaid',
    lines: [
      'Smell that pipe smoke? Good.',
      'Now find the K-fish before you eat. They are slippery.',
    ],
  },
  'cabin-ghost': {
    speaker: 'Cabin Ghost',
    lines: [
      'The lullaby first. Then the nap.',
      'Cody must be tired before he can sleep.',
    ],
  },
};
