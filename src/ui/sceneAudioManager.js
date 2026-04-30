// Scene Audio Manager - handles background audio with z-position zones and crossfading

export class SceneAudioManager {
  constructor() {
    this.audioZones = [];
    this.activeAudioElements = new Map();
    this.currentZoneId = null;
    this.fadeDistance = 15;
    this.fadeCurve = 'cosine';
    // Duck multiplier — reduced while scholar/voice clips are playing
    this.duckFactor = 1.0;
    this.duckTarget = 1.0;
    this.duckSpeed  = 1.5; // units per second toward target
  }
  
  loadAudioZones(zonesConfig) {
    // Stop and discard any existing audio elements before loading new zones
    this.activeAudioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.activeAudioElements.clear();
    this.audioZones = zonesConfig || [];
    this.preloadAudio();
  }
  
  // Preload all audio files
  preloadAudio() {
    this.audioZones.forEach(zone => {
      const audio = new Audio(zone.audioSrc);
      audio.loop = true;
      audio.volume = 0; // Start silent
      audio.preload = 'auto';
      
      // Store the audio element
      this.activeAudioElements.set(zone.id, audio);
      
    });
  }
  
  // Set the target duck level (0 = silent, 1 = full volume)
  setDuckTarget(target) {
    this.duckTarget = Math.max(0, Math.min(1, target));
  }

  update(cameraZ, deltaTime = 0.016) {
    if (this.audioZones.length === 0) return;

    // Smoothly move duckFactor toward duckTarget
    const diff = this.duckTarget - this.duckFactor;
    const step = this.duckSpeed * deltaTime;
    if (Math.abs(diff) <= step) {
      this.duckFactor = this.duckTarget;
    } else {
      this.duckFactor += Math.sign(diff) * step;
    }
    
    // Find which zone(s) we're in or near
    const activeZones = [];
    
    for (const zone of this.audioZones) {
      const inZone = this.isInZone(cameraZ, zone.zStart, zone.zEnd);
      const nearZone = this.isNearZone(cameraZ, zone.zStart, zone.zEnd, this.fadeDistance);
      
      if (inZone || nearZone) {
        const fadeAmount = this.calculateFadeAmount(cameraZ, zone.zStart, zone.zEnd, this.fadeDistance);
        activeZones.push({ zone, fadeAmount });
      }
    }
    
    // Update audio for each zone
    this.audioZones.forEach(zone => {
      const audio = this.activeAudioElements.get(zone.id);
      if (!audio) return;
      
      const activeZone = activeZones.find(az => az.zone.id === zone.id);
      
      if (activeZone) {
        // This zone should be playing
        const targetVolume = activeZone.fadeAmount * zone.volume * this.duckFactor;
        this.setAudioVolume(audio, targetVolume);
        
        // Start playback if not already playing
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      } else {
        // This zone should be silent/stopped
        this.setAudioVolume(audio, 0);
        
        // Pause after fade out completes
        if (audio.volume === 0 && !audio.paused) {
          audio.pause();
        }
      }
    });
  }
  
  // Check if camera is within zone boundaries
  isInZone(cameraZ, zStart, zEnd) {
    // Assumes zEnd < zStart (moving in negative Z direction)
    return cameraZ <= zStart && cameraZ >= zEnd;
  }
  
  // Check if camera is near zone (within fade distance)
  isNearZone(cameraZ, zStart, zEnd, fadeDistance) {
    const expandedStart = zStart + fadeDistance;
    const expandedEnd = zEnd - fadeDistance;
    return cameraZ <= expandedStart && cameraZ >= expandedEnd;
  }
  
  // Calculate fade amount based on position and fade curve
  calculateFadeAmount(cameraZ, zStart, zEnd, fadeDistance) {
    // Full volume in the core zone
    if (cameraZ <= zStart && cameraZ >= zEnd) {
      return 1.0;
    }
    
    // Fade in at start (approaching from positive Z)
    if (cameraZ > zStart && cameraZ <= zStart + fadeDistance) {
      const distanceFromStart = cameraZ - zStart;
      const normalizedDistance = distanceFromStart / fadeDistance;
      return this.applyFadeCurve(1.0 - normalizedDistance);
    }
    
    // Fade out at end (leaving toward negative Z)
    if (cameraZ < zEnd && cameraZ >= zEnd - fadeDistance) {
      const distanceFromEnd = zEnd - cameraZ;
      const normalizedDistance = distanceFromEnd / fadeDistance;
      return this.applyFadeCurve(1.0 - normalizedDistance);
    }
    
    return 0.0;
  }
  
  applyFadeCurve(value) {
    switch (this.fadeCurve) {
      case 'linear': return value;
      case 'exponential': return value * value;
      case 'cosine': return (1 - Math.cos(value * Math.PI)) / 2;
      default: return value;
    }
  }
  
  setAudioVolume(audio, targetVolume) {
    targetVolume = Math.max(0, Math.min(1, targetVolume));
    const currentVolume = audio.volume;
    const smoothingFactor = 0.1;
    audio.volume = currentVolume + ((targetVolume - currentVolume) * smoothingFactor);
    if (Math.abs(audio.volume - targetVolume) < 0.01) audio.volume = targetVolume;
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  muteAll() {
    this.activeAudioElements.forEach(audio => { audio.volume = 0; });
  }

  unmuteAll() {}
  
  // Stop all audio and reset
  stopAll() {
    this.activeAudioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    });
  }
  
  // Clean up (call when destroying the manager)
  destroy() {
    this.stopAll();
    this.activeAudioElements.clear();
    this.audioZones = [];
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================
// Export a single instance to be used across your application
export const sceneAudioManager = new SceneAudioManager();
