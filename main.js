// Three.js via import map
import * as THREE from 'three'

// Engine
import { createRenderer } from './src/engine/renderer.js'
import { createCamera } from './src/engine/camera.js'
import { createControls } from './src/engine/controls.js'
import { startLoop } from './src/engine/loop.js'

// World
import { SceneManager } from './src/world/sceneManager.js'

// UI
import { initializeHelpUI } from './src/ui/helpUI.js'
import { initializeTimeline, updateTimeline, updateTimelineProgress } from './src/ui/timeline.js'
import { subtitleManager } from './src/ui/subtitleManager.js'
import { initializeVerticalTimeline, updateVerticalTimeline } from './src/ui/verticalTimeline.js'

// Make timeline functions and subtitle manager globally accessible for scene manager
window.updateTimeline = updateTimeline;
window.updateTimelineProgress = updateTimelineProgress;
window.subtitleManager = subtitleManager;
window.updateVerticalTimeline = updateVerticalTimeline;



// --- Starter screen logic ---
const starterOverlay = document.getElementById('starter-screen-overlay');
const starterSvgContainer = document.getElementById('starter-svg-container');
let starterActive = true;

// Initialize renderer, camera, and sceneManager immediately
const renderer = createRenderer();
const camera = createCamera();
const controls = createControls(camera, renderer.domElement);
const sceneManager = new SceneManager(camera, controls);

// Initialize help UI
const helpUI = initializeHelpUI();

// Initialize timelines
initializeTimeline();
initializeVerticalTimeline();

// Load PNG into the container
fetch('imgs/title_card.png')
  .then(r => r.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;
    starterSvgContainer.appendChild(img);
  });

function hideStarterScreen() {
  if (!starterActive) return;
  starterActive = false;
  starterOverlay.style.opacity = 0;
  setTimeout(() => {
    starterOverlay.style.display = 'none';
    // Don't show UI elements yet - wait until MainScene
    startGame();
  }, 500);
}

function startGame() {
  startLoop(renderer, camera, sceneManager, controls);
}

// Hide starter screen on any key press
window.addEventListener('keydown', (e) => {
  if (starterActive) {
    hideStarterScreen();
    return;
  }
});

// Show hamburger and help button when reaching MainScene
function showMainSceneUI() {
  const timelineHamburger = document.getElementById('timeline-hamburger');
  if (timelineHamburger) timelineHamburger.style.display = 'flex';
  
  const helpButton = document.getElementById('help-button');
  if (helpButton) helpButton.style.display = 'flex';
  
  const sceneTimeline = document.getElementById('scene-timeline');
  if (sceneTimeline) sceneTimeline.style.display = 'flex';
  
  // Automatically show help overlay when scene one starts
  if (helpUI) helpUI.show();
}

// Flash transition effect
function triggerFlashTransition() {
  const flashElement = document.getElementById('flash-transition');
  if (!flashElement) return;
  
  // Add flashing class to trigger animation
  flashElement.classList.add('flashing');
  
  // Remove class after animation completes
  setTimeout(() => {
    flashElement.classList.remove('flashing');
  }, 2000); // Match animation duration
}

// Make functions globally accessible
window.showMainSceneUI = showMainSceneUI;
window.triggerFlashTransition = triggerFlashTransition;

// Pause/unpause user movement (for text displays)
window.pauseUserMovement = function(paused) {
  if (controls && controls.setControlsEnabled) {
    controls.setControlsEnabled(!paused);
  }
};

// --- Timeline hamburger menu logic ---
const timelineHamburger = document.getElementById('timeline-hamburger');
const timelineOverlay = document.getElementById('timeline-overlay');

function updateControlsForTimelineOverlay() {
  const helpButton = document.getElementById('help-button');
  const sceneTimeline = document.getElementById('scene-timeline');
  
  if (timelineOverlay.classList.contains('active')) {
    controls.setControlsEnabled(false);
    // Hide UI elements
    if (timelineHamburger) timelineHamburger.style.display = 'none';
    if (helpButton) helpButton.style.display = 'none';
    if (sceneTimeline) sceneTimeline.style.display = 'none';
  } else {
    controls.setControlsEnabled(true);
    // Show UI elements
    if (timelineHamburger) timelineHamburger.style.display = 'flex';
    if (helpButton) helpButton.style.display = 'flex';
    if (sceneTimeline) sceneTimeline.style.display = 'flex';
  }
}

if (timelineHamburger && timelineOverlay) {
  timelineHamburger.addEventListener('click', () => {
    timelineOverlay.classList.toggle('active');
    updateControlsForTimelineOverlay();
  });
  // Optional: close overlay when clicking outside or pressing Escape
  timelineOverlay.addEventListener('click', (e) => {
    if (e.target === timelineOverlay) {
      timelineOverlay.classList.remove('active');
      updateControlsForTimelineOverlay();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      timelineOverlay.classList.remove('active');
      updateControlsForTimelineOverlay();
    }
  });
  // Add close (X) button logic
  const timelineClose = document.getElementById('timeline-close');
  if (timelineClose) {
    timelineClose.addEventListener('click', () => {
      timelineOverlay.classList.remove('active');
      updateControlsForTimelineOverlay();
    });
  }
}
