// Subtitle manager - handles displaying subtitles based on camera position

export class SubtitleManager {
  constructor() {
    this.currentSubtitles = [];
    this.displayedSubtitles = new Set();
    this.subtitleElement = null;
    this.fadeTimeout = null;
    this.isVisible = false;
    this.enabled = true; // Flag to enable/disable subtitle display
    
    this.createSubtitleElement();
  }
  
  createSubtitleElement() {
    // Create subtitle container
    this.subtitleElement = document.createElement('div');
    this.subtitleElement.id = 'subtitle-container';
    this.subtitleElement.className = 'subtitle-hidden';
    document.body.appendChild(this.subtitleElement);
  }
  
  // Load subtitles for a specific scene
  loadSubtitles(subtitlesArray) {
    this.currentSubtitles = subtitlesArray || [];
    this.displayedSubtitles.clear();
  }
  
  // Update based on camera position (z-coordinate)
  update(cameraZ) {
    if (!this.enabled || !this.currentSubtitles || this.currentSubtitles.length === 0) return;
    
    // Find the most recent subtitle that should be displayed
    let activeSubtitle = null;
    
    for (const subtitle of this.currentSubtitles) {
      // Check if we've passed this trigger point
      if (cameraZ <= subtitle.trigger && !this.displayedSubtitles.has(subtitle.trigger)) {
        activeSubtitle = subtitle;
        break;
      }
    }
    
    // Display the subtitle if found
    if (activeSubtitle) {
      this.show(activeSubtitle.text);
      this.displayedSubtitles.add(activeSubtitle.trigger);
    }
  }
  
  // Show subtitle with text
  show(text) {
    if (!this.subtitleElement) return;
    
    // Clear any existing fade timeout
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }
    
    // Set text with highlight span and show
    this.subtitleElement.innerHTML = `<span class="highlight">${text}</span>`;
    this.subtitleElement.className = 'subtitle-visible';
    this.isVisible = true;
    
    // Auto-hide after duration based on text length
    const duration = Math.max(4000, text.length * 50); // Min 4 seconds, +50ms per character
    
    this.fadeTimeout = setTimeout(() => {
      this.hide();
    }, duration);
  }
  
  // Hide subtitle
  hide() {
    if (!this.subtitleElement) return;
    
    this.subtitleElement.className = 'subtitle-hidden';
    this.isVisible = false;
  }
  
  // Clear all subtitles and reset
  clear() {
    this.currentSubtitles = [];
    this.displayedSubtitles.clear();
    this.hide();
    
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
  }
  
  // Force display a subtitle (useful for testing)
  forceShow(text, duration = 5000) {
    this.show(text);
    
    if (duration > 0) {
      this.fadeTimeout = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }
  
  // Enable subtitle display
  enable() {
    this.enabled = true;
  }
  
  // Disable subtitle display (prevents update() from showing new subtitles)
  disable() {
    this.enabled = false;
  }
}

// Create a singleton instance
export const subtitleManager = new SubtitleManager();
