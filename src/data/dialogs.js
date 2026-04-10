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
  // More dialogs added later
};
