// MusicManager — thin helper for per-scene BGM switching.
// Tracks the currently playing track via game.registry so scenes that share
// the same track (e.g. MainMenu → OverworldScene both use bgm-overworld)
// don't restart it on every scene transition.
//
// Usage:
//   import { playMusic, stopMusic } from '../systems/MusicManager.js';
//   playMusic(this, 'bgm-overworld');   // in scene.create()
//   stopMusic(this);                     // when you need silence

export function playMusic(scene, key, volume = 0.4) {
  const game = scene.game || scene.sys.game;
  const currentKey = game.registry.get('currentMusicKey');

  // Same track already playing — do nothing.
  if (currentKey === key) {
    const existing = game.registry.get('currentMusicInstance');
    if (existing && existing.isPlaying) return;
  }

  // Stop whatever is playing now.
  stopMusic(scene);

  // If the audio key was never loaded (asset missing), bail silently.
  if (!scene.cache.audio.exists(key)) {
    console.warn('[MusicManager] Audio key not loaded:', key);
    return;
  }

  // Handle browser autoplay lock: defer until the first user interaction.
  if (scene.sound.locked) {
    scene.sound.once('unlocked', () => {
      _startTrack(scene, key, volume);
    });
  } else {
    _startTrack(scene, key, volume);
  }
}

function _startTrack(scene, key, volume) {
  const music = scene.sound.add(key, { loop: true, volume });
  music.play();
  const game = scene.game || scene.sys.game;
  game.registry.set('currentMusicKey', key);
  game.registry.set('currentMusicInstance', music);
}

export function stopMusic(scene) {
  const game = scene.game || scene.sys.game;
  const instance = game.registry.get('currentMusicInstance');
  if (instance) {
    if (instance.isPlaying) instance.stop();
    instance.destroy();
  }
  game.registry.set('currentMusicKey', null);
  game.registry.set('currentMusicInstance', null);
}
