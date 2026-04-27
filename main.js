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
import { archiveImagesManager } from './src/ui/archiveImagesManager.js'

// Make timeline functions and subtitle manager globally accessible for scene manager
window.updateTimeline = updateTimeline;
window.updateTimelineProgress = updateTimelineProgress;
window.subtitleManager = subtitleManager;
window.updateVerticalTimeline = updateVerticalTimeline;

const creditsSections = [
  {
    title: 'Credits',
    lines: [
      'Replace this block with your project title, collaborators, or exhibition details.'
    ]
  },
  {
    title: 'Citations',
    lines: [
      'Add citation 1',
      'Add citation 2',
      'Add citation 3'
    ]
  },
  {
    title: 'Thank You',
    lines: [
      'Add your acknowledgements here.',
      'Add community, mentors, and supporters here.'
    ]
  }
];



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

const creditsOverlay = document.getElementById('credits-overlay');
const creditsRoll = document.getElementById('credits-roll');
const creditsClose = document.getElementById('credits-close');
let creditsActive = false;
const archivePhotoOverlay = document.getElementById('archive-photo-overlay');
const archivePhotoClose = document.getElementById('archive-photo-close');
const archivePhotoImage = document.getElementById('archive-photo-image');
const archivePhotoKicker = document.getElementById('archive-photo-kicker');
const archivePhotoTitle = document.getElementById('archive-photo-title');
const archivePhotoMeta = document.getElementById('archive-photo-meta');
const archivePhotoCitation = document.getElementById('archive-photo-citation');
const archivePhotoCitationLink = document.getElementById('archive-photo-citation-link');
const archivePhotoDescription = document.getElementById('archive-photo-description');
const photoFocusReticle = document.getElementById('photo-focus-reticle');
let archivePhotoOverlayActive = false;

function renderCredits() {
  if (!creditsRoll) return;

  creditsRoll.innerHTML = creditsSections.map((section, index) => {
    const titleTag = index === 0 ? 'h1' : 'h2';
    const titleClass = index === 0 ? 'credits-heading' : 'credits-section-title';
    const lines = section.lines.map((line) => `<p class="credits-line">${line}</p>`).join('');

    return `
      <section class="credits-section">
        <${titleTag} class="${titleClass}">${section.title}</${titleTag}>
        ${lines}
      </section>
    `;
  }).join('');
}

function setMainSceneUIVisibility(visible) {
  const displayValue = visible ? 'flex' : 'none';
  const timelineHamburgerButton = document.getElementById('timeline-hamburger');
  const helpButton = document.getElementById('help-button');
  const sceneTimeline = document.getElementById('scene-timeline');

  if (timelineHamburgerButton) timelineHamburgerButton.style.display = displayValue;
  if (helpButton) helpButton.style.display = displayValue;
  if (sceneTimeline) sceneTimeline.style.display = displayValue;
}

function showCreditsOverlay() {
  if (creditsActive || !creditsOverlay) return;

  creditsActive = true;
  creditsOverlay.classList.add('active');
  creditsOverlay.setAttribute('aria-hidden', 'false');

  if (timelineOverlay) {
    timelineOverlay.classList.remove('active');
  }

  setMainSceneUIVisibility(false);

  if (controls && controls.setControlsEnabled) {
    controls.setControlsEnabled(false);
  }

  if (window.subtitleManager) {
    window.subtitleManager.hide();
  }

  // Phase 1: show thank-you slide, then auto-transition to rolling credits
  const thankyouEl = document.getElementById('credits-thankyou');
  const creditsWindow = document.getElementById('credits-window');
  const creditsHint = document.getElementById('credits-hint');

  if (thankyouEl) thankyouEl.classList.remove('fade-out');
  if (creditsWindow) creditsWindow.style.display = 'none';
  if (creditsHint) creditsHint.style.display = 'none';

  // After 4 seconds fade out the thank-you and start the roll
  setTimeout(() => {
    if (thankyouEl) thankyouEl.classList.add('fade-out');

    setTimeout(() => {
      if (thankyouEl) thankyouEl.style.display = 'none';
      if (creditsWindow) creditsWindow.style.display = 'flex';
      if (creditsHint) creditsHint.style.display = 'block';

      if (creditsRoll) {
        creditsRoll.classList.remove('animate');
        void creditsRoll.offsetWidth;
        creditsRoll.classList.add('animate');
      }
    }, 1300); // wait for fade-out to finish
  }, 4000);
}

function hideCreditsOverlay() {
  if (!creditsActive || !creditsOverlay) return;

  creditsActive = false;
  creditsOverlay.classList.remove('active');
  creditsOverlay.setAttribute('aria-hidden', 'true');

  if (creditsRoll) {
    creditsRoll.classList.remove('animate');
  }

  if (sceneManager && sceneManager.currentScene === sceneManager.mainScene) {
    setMainSceneUIVisibility(true);

    if (controls && controls.setControlsEnabled) {
      controls.setControlsEnabled(true);
    }
  }
}

function setArchivePhotoFocusState(isFocused, imageConfig) {
  if (photoFocusReticle) {
    photoFocusReticle.classList.remove('is-visible', 'is-focused');
  }

  document.body.classList.toggle('archive-photo-hover-target', Boolean(isFocused));

  const label = isFocused
    ? `Open details for ${imageConfig?.title || imageConfig?.alt || 'archive photo'}`
    : 'Look at a side photo to inspect it';
  if (photoFocusReticle) {
    photoFocusReticle.setAttribute('aria-label', label);
  }
}

function setArchivePhotoPointerMode(enabled, options = {}) {
  if (!controls?.setPhotoInteractionMode) return;

  controls.setPhotoInteractionMode(enabled, options);
  document.body.classList.toggle('archive-photo-hover-target', false);

  if (!enabled) {
    setArchivePhotoFocusState(false, null);
  }
}

function isArchivePhotoPointerMode() {
  return Boolean(controls?.isPhotoInteractionMode?.());
}

function showArchivePhotoOverlay(imageConfig) {
  if (!archivePhotoOverlay || !imageConfig) return;

  archivePhotoOverlayActive = true;
  archivePhotoOverlay.classList.add('active');
  archivePhotoOverlay.setAttribute('aria-hidden', 'false');

  if (archivePhotoImage) {
    archivePhotoImage.src = imageConfig.src;
    archivePhotoImage.alt = imageConfig.alt || imageConfig.title || 'Archive photo';
  }

  if (archivePhotoKicker) {
    archivePhotoKicker.textContent = '';
  }

  if (archivePhotoTitle) {
    archivePhotoTitle.textContent = imageConfig.title || imageConfig.alt || 'Untitled';
  }

  if (archivePhotoMeta) {
    const artist = imageConfig.artist || 'Unknown artist';
    const medium = imageConfig.medium || 'Archival image';
    archivePhotoMeta.textContent = `${artist} / ${medium}`;
  }

  if (archivePhotoCitation && archivePhotoCitationLink) {
    const citationUrl = imageConfig.citationUrl || imageConfig.source || '';
    const citationLabel = imageConfig.citationLabel || imageConfig.sourceLabel || citationUrl;

    if (citationUrl) {
      archivePhotoCitation.hidden = false;
      archivePhotoCitationLink.href = citationUrl;
      archivePhotoCitationLink.textContent = citationLabel;
      archivePhotoCitationLink.setAttribute('aria-label', `Open citation source for ${imageConfig.title || imageConfig.alt || 'archive image'}`);
    } else {
      archivePhotoCitation.hidden = true;
      archivePhotoCitationLink.removeAttribute('href');
      archivePhotoCitationLink.textContent = '';
    }
  }

  if (archivePhotoDescription) {
    archivePhotoDescription.textContent = imageConfig.description || imageConfig.alt || '';
  }

  if (controls && controls.setControlsEnabled) {
    controls.setControlsEnabled(false);
  }

  setArchivePhotoPointerMode(false);

  archiveImagesManager.setModalOpen(true);
  setArchivePhotoFocusState(false, null);
}

function hideArchivePhotoOverlay() {
  if (!archivePhotoOverlay || !archivePhotoOverlayActive) return;

  archivePhotoOverlayActive = false;
  archivePhotoOverlay.classList.remove('active');
  archivePhotoOverlay.setAttribute('aria-hidden', 'true');

  if (archivePhotoImage) {
    archivePhotoImage.removeAttribute('src');
  }

  if (archivePhotoCitation && archivePhotoCitationLink) {
    archivePhotoCitation.hidden = true;
    archivePhotoCitationLink.removeAttribute('href');
    archivePhotoCitationLink.textContent = '';
  }

  if (controls && controls.setControlsEnabled && sceneManager && sceneManager.currentScene === sceneManager.mainScene) {
    controls.setControlsEnabled(true);
    setArchivePhotoPointerMode(false, { relock: true, suppressUntilRotateAway: true });
  }

  archiveImagesManager.setModalOpen(false);
  setArchivePhotoFocusState(false, null);
}

renderCredits();

// Load PNG into the container
fetch('imgs/titleCardFinal.jpg')
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
    // Show content warning before starting the game
    showContentWarning();
  }, 500);
}

function startGame() {
  startLoop(renderer, camera, sceneManager, controls);
}

// Show hamburger and help button when reaching MainScene
function showMainSceneUI() {
  setMainSceneUIVisibility(true);
  
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
window.showCreditsOverlay = showCreditsOverlay;
window.showArchivePhotoOverlay = showArchivePhotoOverlay;
window.hideArchivePhotoOverlay = hideArchivePhotoOverlay;
window.setArchivePhotoFocusState = setArchivePhotoFocusState;
window.setArchivePhotoPointerMode = setArchivePhotoPointerMode;
window.isArchivePhotoPointerMode = isArchivePhotoPointerMode;

// --- Content warning screen logic ---
const contentWarningOverlay = document.getElementById('content-warning-overlay');
const contentWarningSlides = Array.from(document.querySelectorAll('.content-warning-slide'));
const warningSteps = Array.from(document.querySelectorAll('.warning-step'));
const warningStepContinue = document.getElementById('warning-step-continue');
let contentWarningActive = false;
let currentContentWarningSlide = 0;
let currentWarningStep = 0;

function setWarningStep(index) {
  currentWarningStep = index;
  warningSteps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });
  // Re-trigger the continue hint animation
  if (warningStepContinue) {
    warningStepContinue.style.animation = 'none';
    warningStepContinue.offsetHeight; // reflow
    warningStepContinue.style.animation = '';
  }
}

function setContentWarningSlide(index) {
  currentContentWarningSlide = index;
  contentWarningSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === index);
  });
}

function showContentWarning() {
  if (!contentWarningOverlay) {
    startGame();
    return;
  }

  contentWarningActive = true;
  currentWarningStep = 0;
  setWarningStep(0);
  setContentWarningSlide(0);
  contentWarningOverlay.classList.add('active');
}

function hideContentWarning() {
  contentWarningActive = false;

  // Unlock audio playback — must happen synchronously inside the user gesture handler
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx) { const ctx = new AudioCtx(); ctx.resume().then(() => ctx.close()); }

  const fadeElement = document.getElementById('fade-to-scene');
  if (fadeElement) fadeElement.classList.add('fade-in');
  
  setTimeout(() => {
    // Hide content warning once black
    contentWarningOverlay.classList.remove('active');
    // Start the game
    startGame();
    // Fade out (reveal scene)
    setTimeout(() => {
      if (fadeElement) {
        fadeElement.classList.remove('fade-in');
        fadeElement.classList.add('fade-out');
      }
      // Start camera moving after user has had time to orient (4 seconds after fade-in)
      if (sceneManager) sceneManager.startHackSceneMovement();
    }, 500);
  }, 400);
}

// Handle key press to dismiss screens
window.addEventListener('keydown', (e) => {
  if (starterActive) {
    hideStarterScreen();
    return;
  }
  
  if (contentWarningActive) {
    if (currentContentWarningSlide === 0) {
      if (currentWarningStep < warningSteps.length - 1) {
        setWarningStep(currentWarningStep + 1);
      } else {
        setContentWarningSlide(1);
      }
    } else if (currentContentWarningSlide < contentWarningSlides.length - 1) {
      setContentWarningSlide(currentContentWarningSlide + 1);
    } else {
      hideContentWarning();
    }
    return;
  }
});

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
  if (timelineOverlay.classList.contains('active')) {
    controls.setControlsEnabled(false);
    setMainSceneUIVisibility(false);
  } else {
    controls.setControlsEnabled(true);
    setMainSceneUIVisibility(true);
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
      if (isArchivePhotoPointerMode()) {
        setArchivePhotoPointerMode(false, { relock: true, suppressUntilRotateAway: true });
        return;
      }

      if (archivePhotoOverlayActive) {
        hideArchivePhotoOverlay();
        return;
      }

      if (creditsActive) {
        hideCreditsOverlay();
        return;
      }

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

if (creditsClose) {
  creditsClose.addEventListener('click', hideCreditsOverlay);
}

if (archivePhotoClose) {
  archivePhotoClose.addEventListener('click', hideArchivePhotoOverlay);
}

if (archivePhotoOverlay) {
  archivePhotoOverlay.addEventListener('click', (event) => {
    if (event.target === archivePhotoOverlay) {
      hideArchivePhotoOverlay();
    }
  });
}
