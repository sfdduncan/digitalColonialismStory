import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/PointerLockControls.js';

export function createControls(camera, domElement) {
  // FPS-style mouse + keyboard controls
  const controls = new PointerLockControls(camera, domElement);

  const move = { forward: false, backward: false, left: false, right: false };
  const cameraHeight = 1.6; // Set camera height to simulate eye level
  
  // Breathing animation
  let breathingTime = 0;
  const breathingSpeed = 2; // Speed of breathing cycle
  const breathingAmount = 0.07; // Subtle up/down movement (1.5cm)
  
  // Idle sway animation - slower, subtle up/down movement
  let swayTime = 0;
  const swaySpeed = 0.5; // Slower than breathing for layered natural feel
  const swayAmount = 0.008; // Very subtle up/down movement (0.8cm)

  // Keydown event listener - only forward movement allowed
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        move.forward = true;
        break;
    }
  });

  // Keyup event listener
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        move.forward = false;
        break;
    }
  });



  // Rotation limits
  const HORIZONTAL_LIMIT = Math.PI/6; // 15 degrees left/right
  const VERTICAL_LIMIT = Math.PI/12; // 15 degrees up/down

  function clampRotation() {
    if (!controls.isLocked) return;

    // Lock roll to prevent camera tilting
    camera.rotation.z = 0;

    // Clamp vertical looking (pitch - up/down)
    camera.rotation.x = Math.max(-VERTICAL_LIMIT, Math.min(VERTICAL_LIMIT, camera.rotation.x));

    // Clamp horizontal turning (yaw - left/right)
    // Normalize to -PI to PI range
    let yaw = camera.rotation.y;
    while (yaw > Math.PI) yaw -= 2 * Math.PI;
    while (yaw < -Math.PI) yaw += 2 * Math.PI;
    
    camera.rotation.y = Math.max(-HORIZONTAL_LIMIT, Math.min(HORIZONTAL_LIMIT, yaw));
  }

  // Clamp rotation after every mousemove when pointer is locked
  document.addEventListener('mousemove', () => {
    if (controls.isLocked) {
      requestAnimationFrame(clampRotation);
    }
  });

  // Update camera position based on movement
  function update() {
    const speed = 0.03;
    
    // Only forward movement allowed
    if (move.forward) controls.moveForward(speed);

    // Clamp rotation after movement
    clampRotation();
    
    // Keep user within the middle path (10 units wide)
    const pathHalfWidth = 5;
    camera.position.x = Math.max(-pathHalfWidth, Math.min(pathHalfWidth, camera.position.x));

    // Skip breathing animation if in aerial view mode
    if (controls.aerialViewActive) {
      return; // Don't override camera position in aerial view
    }

    // Breathing animation - subtle up/down movement
    breathingTime += 0.016; // Approximately 60fps
    const breathingOffset = Math.sin(breathingTime * breathingSpeed) * breathingAmount;

    // Idle sway animation - subtle slow up/down movement (different frequency than breathing)
    swayTime += 0.016;
    const swayOffset = Math.sin(swayTime * swaySpeed) * swayAmount;

    // Combine breathing and sway for natural idle movement
    camera.position.y = cameraHeight + breathingOffset + swayOffset;
  }

  // Attach update function to the animation loop
  controls.update = update;
  
  // Aerial view flag (used to disable position overrides)
  controls.aerialViewActive = false;

  // Click to lock pointer, only if controls are enabled
  let controlsEnabled = true;
  function setControlsEnabled(enabled) {
    controlsEnabled = enabled;
    if (!enabled && controls.isLocked) {
      controls.unlock();
    }
  }

  document.addEventListener('click', () => {
    if (controlsEnabled) {
      controls.lock();
    }
  });

  // Prevent camera movement if controls are disabled
  const origUpdate = controls.update;
  controls.update = function() {
    if (controlsEnabled) {
      origUpdate.call(controls);
    }
  };

  controls.setControlsEnabled = setControlsEnabled;
  controls.getControlsEnabled = () => controlsEnabled;

  return controls;
}
