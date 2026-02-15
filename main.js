// Overlay text helper
export function showSceneTextOverlay(text) {
	const overlay = document.getElementById('scene-text-overlay');
	if (overlay) {
		overlay.innerHTML = text;
		overlay.style.display = 'block';
	}
}

export function hideSceneTextOverlay() {
	const overlay = document.getElementById('scene-text-overlay');
	if (overlay) overlay.style.display = 'none';
}
// Three.js via import map
import * as THREE from 'three'

// Engine
import { createRenderer } from './src/engine/renderer.js'
import { createCamera } from './src/engine/camera.js'
import { createControls } from './src/engine/controls.js'
import { startLoop } from './src/engine/loop.js'

// World
import { SceneManager } from './src/world/sceneManager.js'



// --- Starter screen logic ---
const starterOverlay = document.getElementById('starter-screen-overlay');
const starterSvgContainer = document.getElementById('starter-svg-container');
let starterActive = true;

// Initialize renderer, camera, and sceneManager immediately
const renderer = createRenderer();
const camera = createCamera();
const sceneManager = new SceneManager(camera);
const controls = createControls(camera, renderer.domElement);

// Load SVG into the container
fetch('imgs/starter_screen.svg')
  .then(r => r.text())
  .then(svg => {
    starterSvgContainer.innerHTML = svg;
  });

function hideStarterScreen() {
  if (!starterActive) return;
  starterActive = false;
  starterOverlay.style.opacity = 0;
  setTimeout(() => {
    starterOverlay.style.display = 'none';
    showHamburger();
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

// Show hamburger only after starter overlay is gone
function showHamburger() {
  const timelineHamburger = document.getElementById('timeline-hamburger');
  if (timelineHamburger) timelineHamburger.style.display = 'flex';
}

// --- Timeline hamburger menu logic ---
const timelineHamburger = document.getElementById('timeline-hamburger');
const timelineOverlay = document.getElementById('timeline-overlay');

function updateControlsForTimelineOverlay() {
  if (timelineOverlay.classList.contains('active')) {
    controls.setControlsEnabled(false);
  } else {
    controls.setControlsEnabled(true);
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
