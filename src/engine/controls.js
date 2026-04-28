import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/PointerLockControls.js';
import { archiveImagesManager } from '../ui/archiveImagesManager.js';
import { subtitleManager } from '../ui/subtitleManager.js';

export function createControls(camera, domElement) {
  const controls = new PointerLockControls(camera, domElement);

  let moveForward = false;
  const cameraHeight = 1.6;
  
  // Automatic movement for hack scene
  let autoMoveEnabled = false;
  const autoMoveSpeed = 0.02; // Slow automatic movement speed

  // Auto-walk toggle for main scene (F key)
  let mainSceneAutoWalk = false;
  const mainSceneAutoWalkSpeed = 0.018;
  
  // Movement pause for text displays
  let movementPaused = false;
  let photoInteractionMode = false;
  let photoInteractionSuppressed = false;
  let mainSceneActive = false; // W/↑ movement only allowed in MainScene
  
  // Create rotation limit fog overlays
  const leftFogOverlay = document.createElement('div');
  leftFogOverlay.id = 'rotation-limit-left';
  leftFogOverlay.className = 'rotation-limit-overlay';
  document.body.appendChild(leftFogOverlay);
  
  const rightFogOverlay = document.createElement('div');
  rightFogOverlay.id = 'rotation-limit-right';
  rightFogOverlay.className = 'rotation-limit-overlay';
  document.body.appendChild(rightFogOverlay);
  
  // Create memory text display
  const memoryTextElement = document.createElement('div');
  memoryTextElement.id = 'memory-text-container';
  memoryTextElement.innerHTML = '<span class="highlight-inverse">The past informs the present and always moves alongside you</span>';
  document.body.appendChild(memoryTextElement);
  
  // Breathing animation
  let breathingTime = 0;
  const breathingSpeed = 2;  // Increase this value for faster breathing
  const breathingAmount = 0.05;  // Increase this value for stronger wobble effect

  // Rotation detection for memory text trigger
  let memoryTextShowing = false; // Track if memory text is currently displayed
  let lastSubtitleText = null; // Store the last subtitle text to replay it
  const LIMIT_THRESHOLD = 0.85; // Threshold for being at rotation limit (85% of max)

  // Forward movement controls
  document.addEventListener('keydown', (event) => {
    // Don't allow manual movement when auto-move is enabled
    if (autoMoveEnabled) return;

    if (event.key === 'f' || event.key === 'F') {
      if (!movementPaused && controlsEnabled) {
        mainSceneAutoWalk = !mainSceneAutoWalk;
      }
      return;
    }
    
    if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
      if (!mainSceneActive) return;
      moveForward = true;
      mainSceneAutoWalk = false; // manual key overrides auto-walk
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
      moveForward = false;
    }
  });

  // Look left/right and up/down limits
  const HORIZONTAL_LIMIT = Math.PI / 12; // ~7.5 degrees left/right
  const VERTICAL_LIMIT = Math.PI / 12;   // ~15 degrees up/down

  function clampRotation() {
    if (!controls.isLocked) return;

    camera.rotation.z = 0; // Prevent roll

    // Clamp up/down looking
    camera.rotation.x = Math.max(-VERTICAL_LIMIT, Math.min(VERTICAL_LIMIT, camera.rotation.x));

    // Clamp left/right looking
    let yaw = camera.rotation.y;
    while (yaw > Math.PI) yaw -= 2 * Math.PI;
    while (yaw < -Math.PI) yaw += 2 * Math.PI;
    camera.rotation.y = Math.max(-HORIZONTAL_LIMIT, Math.min(HORIZONTAL_LIMIT, yaw));
    
    // Update fog overlay opacity based on proximity to limits
    updateRotationLimitFog(yaw);
  }
  
  function updateRotationLimitFog(yaw) {
    // Calculate how close we are to the limits (0 = center, 1 = at limit)
    const normalizedRotation = Math.abs(yaw) / HORIZONTAL_LIMIT;
    
    // Start showing fog when 70% of the way to the limit
    const fogThreshold = 0.7;
    const fogIntensity = Math.max(0, (normalizedRotation - fogThreshold) / (1 - fogThreshold));
    
    // Show fog on the appropriate side
    if (yaw < 0) {
      // Rotating left - show fog on left
      leftFogOverlay.style.opacity = fogIntensity;
      rightFogOverlay.style.opacity = 0;
    } else if (yaw > 0) {
      // Rotating right - show fog on right
      rightFogOverlay.style.opacity = fogIntensity;
      leftFogOverlay.style.opacity = 0;
    } else {
      // Centered - no fog
      leftFogOverlay.style.opacity = 0;
      rightFogOverlay.style.opacity = 0;
    }
  }

  document.addEventListener('mousemove', (event) => {
    if (controls.isLocked) {
      requestAnimationFrame(clampRotation);
    }

    if (photoInteractionMode && controls.isLocked) {
      archiveImagesManager.nudgePointer(event.movementX, event.movementY);
    }
  });

  function update() {
    // Path boundaries (10 units wide)
    const pathHalfWidth = 5;
    
    // Check if movement is paused (for text displays)
    // When paused, forward/backward movement is blocked but mouse look and breathing continue
    if (!movementPaused) {
      // Automatic movement (for hack scene)
      if (autoMoveEnabled) {
        // Move camera forward directly without needing pointer lock
        camera.position.z -= autoMoveSpeed;
      }
      // Manual movement (for main scene)
      else if (mainSceneAutoWalk) {
        camera.position.z -= mainSceneAutoWalkSpeed;
        camera.position.x = Math.max(-pathHalfWidth, Math.min(pathHalfWidth, camera.position.x));
      }
      else if (moveForward) {
        // Move straight down the path (negative Z direction)
        camera.position.z -= 0.025;
        camera.position.x = Math.max(-pathHalfWidth, Math.min(pathHalfWidth, camera.position.x));
      }
    }

    // Mouse look is always active (even when movement paused)
    clampRotation();

    if (controls.aerialViewActive) return;

    // Breathing animation - always active (even when movement paused)
    breathingTime += 0.016;
    const breathingOffset = Math.sin(breathingTime * breathingSpeed) * breathingAmount;
    
    camera.position.y = cameraHeight + breathingOffset;
    
    // Detect rotation and trigger memory text
    checkRotationForMemoryText();
    updatePhotoInteractionMode();
  }

  controls.update = update;
  
  // Function to check for rotation and trigger memory text
  function checkRotationForMemoryText() {
    // Only trigger if at least one photo has been displayed
    if (!archiveImagesManager.hasDisplayedAnyPhotos()) {
      return;
    }
    
    // Trigger throughout MainScene journey (Scenes 1-6), but NOT in HackScene or Scene 7
    // Active when z is between 0 and -600 (MainScene only, excludes initial HackScene)
    if (camera.position.z <= 0 && camera.position.z > -600) {
      const currentRotation = camera.rotation.y;
      const normalizedRotation = Math.abs(currentRotation) / HORIZONTAL_LIMIT;
      
      // Show text when at rotation limit, hide when not
      if (normalizedRotation >= LIMIT_THRESHOLD) {
        // At rotation limit - show text if not already showing
        if (!memoryTextShowing) {
          // Store current subtitle if one is showing
          if (subtitleManager.isVisible && subtitleManager.subtitleElement) {
            lastSubtitleText = subtitleManager.subtitleElement.textContent;
            // Hide the current subtitle
            subtitleManager.hide();
          }
          
          memoryTextElement.classList.add('visible');
          memoryTextShowing = true;
        }
      } else {
        // Not at rotation limit - hide text if showing
        if (memoryTextShowing) {
          memoryTextElement.classList.remove('visible');
          memoryTextShowing = false;
          
          // Replay the subtitle that was showing when memory text appeared
          if (lastSubtitleText && subtitleManager.subtitleElement) {
            subtitleManager.show(lastSubtitleText);
            lastSubtitleText = null;
          }
        }
      }
    } else {
      // Outside MainScene zones - hide text if showing
      if (memoryTextShowing) {
        memoryTextElement.classList.remove('visible');
        memoryTextShowing = false;
        lastSubtitleText = null;
      }
    }
  }

  function isWithinArchivePhotoZone() {
    return camera.position.z <= 0 && camera.position.z > -600;
  }

  function setPhotoInteractionMode(enabled, options = {}) {
    const { relock = false, suppressUntilRotateAway = false } = options;

    if (photoInteractionMode === enabled) {
      if (!enabled && relock && controlsEnabled && !controls.isLocked) {
        controls.lock();
      }
      return;
    }

    photoInteractionMode = enabled;
    document.body.classList.toggle('photo-pointer-mode', enabled);

    if (enabled) {
      archiveImagesManager.resetPointer();
    }

    if (!enabled && suppressUntilRotateAway) {
      photoInteractionSuppressed = true;
    }

    if (!enabled && relock && controlsEnabled && !controls.isLocked) {
      controls.lock();
    }

    if (!enabled && window.setArchivePhotoFocusState) {
      window.setArchivePhotoFocusState(false, null);
    }
  }

  function updatePhotoInteractionMode() {
    if (!controlsEnabled || autoMoveEnabled || movementPaused || controls.aerialViewActive) {
      if (photoInteractionMode) {
        setPhotoInteractionMode(false);
      }
      return;
    }

    if (!archiveImagesManager.hasDisplayedAnyPhotos() || !isWithinArchivePhotoZone()) {
      if (photoInteractionMode) {
        setPhotoInteractionMode(false);
      }
      return;
    }

    const normalizedRotation = Math.abs(camera.rotation.y) / HORIZONTAL_LIMIT;
    const atPhotoWall = normalizedRotation >= LIMIT_THRESHOLD;

    if (!atPhotoWall) {
      photoInteractionSuppressed = false;
    }

    if (photoInteractionSuppressed) {
      if (photoInteractionMode) {
        setPhotoInteractionMode(false);
      }
      return;
    }

    if (controls.isLocked && atPhotoWall) {
      setPhotoInteractionMode(true);
    }
  }
  
  // Aerial view flag (used to disable position overrides)
  controls.aerialViewActive = false;

  // Automatic movement control (for hack scene)
  controls.setAutoMoveEnabled = function(enabled) {
    autoMoveEnabled = enabled;
    // Don't disable controls here - we need update to run for auto-movement
  };
  controls.getAutoMoveEnabled = () => autoMoveEnabled;

  // Click to lock pointer, only if controls are enabled
  let controlsEnabled = true;
  function setControlsEnabled(enabled) {
    controlsEnabled = enabled;
    if (!enabled) {
      mainSceneAutoWalk = false;
    }
    if (!enabled && photoInteractionMode) {
      setPhotoInteractionMode(false);
    }
    if (!enabled && controls.isLocked) {
      controls.unlock();
    }
  }

  document.addEventListener('click', () => {
    if (photoInteractionMode) {
      return;
    }

    // Allow pointer lock in hackScene (auto-move) too, so user can look around
    if (controlsEnabled || autoMoveEnabled) {
      controls.lock();
    }
  });

  // Prevent camera movement if controls are disabled (unless auto-move is active)
  const origUpdate = controls.update;
  controls.update = function() {
    if (controlsEnabled || autoMoveEnabled) {
      origUpdate.call(controls);
    }
  };

  controls.setControlsEnabled = setControlsEnabled;
  controls.getControlsEnabled = () => controlsEnabled;
  controls.setMainSceneActive = (val) => { mainSceneActive = val; };
  controls.setPhotoInteractionMode = setPhotoInteractionMode;
  controls.isPhotoInteractionMode = () => photoInteractionMode;
  
  // Expose pause movement function globally for text display manager
  window.pauseUserMovement = function(shouldPause) {
    movementPaused = shouldPause;
  };

  return controls;
}
