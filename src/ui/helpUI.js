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
      <h2>How to Move</h2>
      <div class="help-instructions">
        <div class="help-item">
          <strong>W</strong> or <strong>↑</strong>
          <p>Move forward</p>
        </div>
        <div class="help-item">
          <strong>Mouse</strong>
          <p>Look around (click to activate)</p>
        </div>
        <div class="help-item">
          <strong>ESC</strong>
          <p>Release mouse control</p>
        </div>
      </div>
      <p class="help-note">Click anywhere to begin your journey</p>
    </div>
  `;
  document.body.appendChild(helpOverlay);

  // Toggle help overlay
  function toggleHelp() {
    helpOverlay.classList.toggle('active');
  }

  // Event listeners
  helpButton.addEventListener('click', toggleHelp);
  
  const closeButton = document.getElementById('help-close');
  closeButton.addEventListener('click', toggleHelp);

  // Close when clicking outside content
  helpOverlay.addEventListener('click', (e) => {
    if (e.target === helpOverlay) {
      toggleHelp();
    }
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpOverlay.classList.contains('active')) {
      toggleHelp();
    }
  });
}
