// Scholar Audio Manager
// Plays one-shot triggered audio clips (scholar voices, scene songs) on top of
// the ambient SceneAudioManager zones.  Each clip fades in at the start and
// fades out before it ends so it never pops in or out abruptly.

import { sceneAudioManager } from './sceneAudioManager.js';

const DUCK_LEVEL = 0.12; // how quiet background drops while scholar speaks

export class ScholarAudioManager {
  constructor() {
    this.triggers      = [];          // array of trigger config objects
    this.firedTriggers = new Set();   // z values that have already fired
    this.activeClips   = [];          // currently playing / fading clips
  }

  // ─── Config ──────────────────────────────────────────────────────────────────

  loadTriggers(triggersConfig) {
    this.reset();
    this.triggers = triggersConfig || [];
  }

  // ─── Per-frame update ─────────────────────────────────────────────────────────

  // Call this every frame from the scene's update() method.
  // cameraZ   — current camera Z position
  // deltaTime — seconds since last frame (e.g. 0.016 for 60 fps)
  update(cameraZ, deltaTime = 0.016) {
    // Fire new triggers when camera passes their Z threshold
    for (const trigger of this.triggers) {
      if (cameraZ <= trigger.z && !this.firedTriggers.has(trigger.z)) {
        this.firedTriggers.add(trigger.z);
        this._playClip(trigger);
      }
    }

    // Tick active clips (fade in / playing / fade out)
    this.activeClips = this.activeClips.filter(clip =>
      this._tickClip(clip, deltaTime)
    );

    // Duck background music while any scholar clip is active
    const anyActive = this.activeClips.length > 0;
    sceneAudioManager.setDuckTarget(anyActive ? DUCK_LEVEL : 1.0);
  }

  // ─── Playback ─────────────────────────────────────────────────────────────────

  _playClip(trigger) {
    const audio = new Audio(trigger.audioSrc);
    audio.loop    = false;
    audio.volume  = 0;
    audio.preload = 'auto';

    const clip = {
      audio,
      targetVolume:     trigger.volume          ?? 0.8,
      fadeInDuration:   trigger.fadeInDuration  ?? 1.5,   // seconds
      fadeOutDuration:  trigger.fadeOutDuration ?? 2.0,   // seconds
      state:            'fadein',  // fadein | playing | fadeout
      fadeTimer:        0,
      duration:         null,      // populated from metadata
    };

    audio.addEventListener('loadedmetadata', () => {
      clip.duration = audio.duration;
    });

    audio.addEventListener('ended', () => {
      // Audio ended naturally (e.g. shorter than fade-out window)
      clip.state = 'done';
    });

    audio.play().catch(() => {
      // Autoplay blocked — silently ignore; user interaction will unlock audio
    });

    this.activeClips.push(clip);
  }

  // Returns false when the clip is finished and can be removed.
  _tickClip(clip, deltaTime) {
    if (clip.state === 'done') return false;

    const { audio } = clip;

    if (clip.state === 'fadein') {
      clip.fadeTimer += deltaTime;
      const progress  = Math.min(clip.fadeTimer / clip.fadeInDuration, 1.0);
      audio.volume    = this._ease(progress) * clip.targetVolume;

      if (progress >= 1.0) {
        clip.state     = 'playing';
        clip.fadeTimer = 0;
      }

    } else if (clip.state === 'playing') {
      // Begin fade-out when we're fadeOutDuration seconds from the end
      if (clip.duration !== null &&
          audio.currentTime >= clip.duration - clip.fadeOutDuration) {
        clip.state     = 'fadeout';
        clip.fadeTimer = 0;
      }

    } else if (clip.state === 'fadeout') {
      clip.fadeTimer += deltaTime;
      const progress  = Math.min(clip.fadeTimer / clip.fadeOutDuration, 1.0);
      audio.volume    = this._ease(1.0 - progress) * clip.targetVolume;

      if (progress >= 1.0) {
        audio.pause();
        return false;
      }
    }

    return true;
  }

  // Cosine ease — smooth S-curve between 0 and 1
  _ease(t) {
    return (1 - Math.cos(t * Math.PI)) / 2;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  reset() {
    this.activeClips.forEach(clip => {
      clip.audio.pause();
      clip.audio.src = '';
    });
    this.activeClips   = [];
    this.firedTriggers = new Set();
  }

  destroy() {
    this.reset();
    this.triggers = [];
  }
}

export const scholarAudioManager = new ScholarAudioManager();
