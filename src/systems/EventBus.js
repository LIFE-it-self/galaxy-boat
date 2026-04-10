// Shared event emitter used for cross-scene messages that don't fit cleanly
// into scene start/stop data flow. Examples: 'dialog-complete', 'hurricane-fail',
// 'victory'. Subscribers must remember to off() in shutdown() to avoid leaks
// across scene restarts.

import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();
