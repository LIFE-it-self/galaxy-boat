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
  // More dialogs added later
};
