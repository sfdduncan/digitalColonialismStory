// Scene Audio Manager - handles background audio with z-index zones and crossfading

export class SceneAudioManager {
  constructor() {
    this.audioZones = [];
    this.activeAudioElements = new Map(); // Track playing audio by zone id
    this.currentZoneId = null;
    
   
    this.masterVolume = 0.7;
    
    // Fade distance in world units
    // LINE TO EDIT: How far before/after zone boundary should crossfade occur
    // Larger = smoother/longer fade, Smaller = quicker transition
    this.fadeDistance = 15;
    
    // Fade curve type: 'linear', 'exponential', or 'cosine'
    // LINE TO EDIT: Change fade curve for different feel
    // 'linear' = constant fade rate
    // 'exponential' = quick start, slow end (more natural)
    // 'cosine' = smooth S-curve (smoothest)
    this.fadeCurve = 'cosine';
  }
  
  // ========================================
  // AUDIO ZONES SETUP
  // Call this to define your scene audio zones
  // ========================================
  loadAudioZones(zonesConfig) {
    
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
  
  update(cameraZ) {
    if (this.audioZones.length === 0) return;
    
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
        const targetVolume = activeZone.fadeAmount * zone.volume * this.masterVolume;
        this.setAudioVolume(audio, targetVolume);
        
        // Start playback if not already playing
        if (audio.paused) {
          audio.play().catch(err => {
            console.warn(`Auto-play blocked for ${zone.id}. User interaction may be required.`, err);
          });
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
  
  // Apply fade curve to normalized value (0-1)
  applyFadeCurve(value) {
    // LINE TO EDIT: Modify fade curve behavior here if needed
    switch (this.fadeCurve) {
      case 'linear':
        return value;
      
      case 'exponential':
        // Exponential curve (ease-in-out)
        return value * value;
      
      case 'cosine':
        // Smooth cosine curve
        return (1 - Math.cos(value * Math.PI)) / 2;
      
      default:
        return value;
    }
  }
  
  // Set audio volume with smooth transitions
  setAudioVolume(audio, targetVolume) {
    // Clamp volume between 0 and 1
    targetVolume = Math.max(0, Math.min(1, targetVolume));
    
    // Smooth volume changes to avoid clicking
    const currentVolume = audio.volume;
    const volumeDiff = targetVolume - currentVolume;
    const smoothingFactor = 0.1; // LINE TO EDIT: Lower = smoother but slower response
    
    audio.volume = currentVolume + (volumeDiff * smoothingFactor);
    
    // Snap to target if very close
    if (Math.abs(audio.volume - targetVolume) < 0.01) {
      audio.volume = targetVolume;
    }
  }
  
  
  // Set master volume
  setMasterVolume(volume) {
    // LINE TO EDIT: Call this method to change master volume at runtime
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  // Mute/unmute all audio
  muteAll() {
    this.activeAudioElements.forEach(audio => {
      audio.volume = 0;
    });
  }
  
  unmuteAll() {
    // Volumes will restore on next update() call
  }
  
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
