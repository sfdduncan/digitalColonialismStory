// Help/Instructions UI

export function initializeHelpUI() {
  // Create help button
  const helpButton = document.createElement('button');
  helpButton.id = 'help-button';
  helpButton.setAttribute('aria-label', 'Show controls help');
  helpButton.innerHTML = '?';
  document.body.appendChild(helpButton);

  // Create help overlay
  const helpOverlay = document.createElement('div');
  helpOverlay.id = 'help-overlay';
  helpOverlay.innerHTML = `
    <div id="help-content">
      <button id="help-close" aria-label="Close help">&times;</button>
      <h2><span class="highlight">How to Move</span></h2>
      <div class="help-instructions">
        <div class="help-item">
          <strong><span class="highlight">W</span></strong> or <strong><span class="highlight">↑</span></strong>
          <p>Move forward</p>
        </div>
        <div class="help-item">
          <strong><span class="highlight">Mouse</span></strong>
          <p>Look around (click to activate)</p>
        </div>
        <div class="help-item">
          <strong><span class="highlight">ESC</span></strong>
          <p>Release mouse control</p>
        </div>
      </div>
      <p class="help-note"><span class="highlight">Click anywhere to begin your journey</span></p>
    </div>
  `;
  document.body.appendChild(helpOverlay);

  // Toggle help overlay
  function toggleHelp() {
    helpOverlay.classList.toggle('active');
    
    // Hide/show UI elements
    const timelineHamburger = document.getElementById('timeline-hamburger');
    const sceneTimeline = document.getElementById('scene-timeline');
    
    if (helpOverlay.classList.contains('active')) {
      // Hide UI elements
      if (helpButton) helpButton.style.display = 'none';
      if (timelineHamburger) timelineHamburger.style.display = 'none';
      if (sceneTimeline) sceneTimeline.style.display = 'none';
      // Disable subtitles while help is open
      if (window.subtitleManager) window.subtitleManager.disable();
    } else {
      // Show UI elements
      if (helpButton) helpButton.style.display = 'flex';
      if (timelineHamburger) timelineHamburger.style.display = 'flex';
      if (sceneTimeline) sceneTimeline.style.display = 'flex';
      // Enable subtitles when help is closed
      if (window.subtitleManager) window.subtitleManager.enable();
    }
  }

  // Event listeners
  helpButton.addEventListener('click', toggleHelp);
  
  const closeButton = document.getElementById('help-close');
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleHelp();
  });

  // Close when clicking anywhere on the overlay (backdrop or content)
  helpOverlay.addEventListener('click', (e) => {
    toggleHelp();
  });

  // Close with any key press
  document.addEventListener('keydown', (e) => {
    if (helpOverlay.classList.contains('active')) {
      toggleHelp();
    }
  });

  // Return function to show help overlay programmatically
  return {
    show: () => {
      if (!helpOverlay.classList.contains('active')) {
        helpOverlay.classList.add('active');
        
        // Hide UI elements
        const timelineHamburger = document.getElementById('timeline-hamburger');
        const sceneTimeline = document.getElementById('scene-timeline');
        if (helpButton) helpButton.style.display = 'none';
        if (timelineHamburger) timelineHamburger.style.display = 'none';
        if (sceneTimeline) sceneTimeline.style.display = 'none';
        // Disable subtitles while help is open
        if (window.subtitleManager) window.subtitleManager.disable();
      }
    },
    hide: () => {
      if (helpOverlay.classList.contains('active')) {
        helpOverlay.classList.remove('active');
        
        // Show UI elements
        const timelineHamburger = document.getElementById('timeline-hamburger');
        const sceneTimeline = document.getElementById('scene-timeline');
        if (helpButton) helpButton.style.display = 'flex';
        if (timelineHamburger) timelineHamburger.style.display = 'flex';
        if (sceneTimeline) sceneTimeline.style.display = 'flex';
        // Enable subtitles when help is closed
        if (window.subtitleManager) window.subtitleManager.enable();
      }
    }
  };
}
