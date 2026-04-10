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
  // More dialogs added later
};
