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
  const breathingAmount = 0.1; // Subtle up/down movement (1.5cm)
  
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
  const HORIZONTAL_LIMIT = Math.PI / 6; // 30 degrees left/right turning
  const VERTICAL_LIMIT_UP = Math.PI / 12; // 15 degrees looking up
  const VERTICAL_LIMIT_DOWN = Math.PI / 12; // 15 degrees looking down

  // Store initial rotation when pointer locks
  let initialHorizontalRotation = 0;
  let hasSetInitialRotation = false;

  function clampRotation() {
    if (!controls.isLocked) return;

    // Set initial rotation on first lock
    if (!hasSetInitialRotation) {
      initialHorizontalRotation = camera.rotation.y;
      hasSetInitialRotation = true;
    }

    // Lock roll to prevent camera tilting
    camera.rotation.z = 0;

    // Clamp vertical looking (pitch - up/down on X axis)
    if (camera.rotation.x > VERTICAL_LIMIT_UP) {
      camera.rotation.x = VERTICAL_LIMIT_UP;
    } else if (camera.rotation.x < -VERTICAL_LIMIT_DOWN) {
      camera.rotation.x = -VERTICAL_LIMIT_DOWN;
    }

    // Clamp horizontal turning (yaw - left/right on Y axis)
    const currentRotation = camera.rotation.y;
    const rotationDelta = currentRotation - initialHorizontalRotation;
    
    // Normalize the delta to handle angle wrapping
    let normalizedDelta = rotationDelta;
    while (normalizedDelta > Math.PI) normalizedDelta -= 2 * Math.PI;
    while (normalizedDelta < -Math.PI) normalizedDelta += 2 * Math.PI;
    
    if (normalizedDelta < -HORIZONTAL_LIMIT) {
      camera.rotation.y = initialHorizontalRotation - HORIZONTAL_LIMIT;
    } else if (normalizedDelta > HORIZONTAL_LIMIT) {
      camera.rotation.y = initialHorizontalRotation + HORIZONTAL_LIMIT;
    }
  }

  // Clamp rotation after every mousemove when pointer is locked
  document.addEventListener('mousemove', () => {
    if (controls.isLocked) {
      requestAnimationFrame(clampRotation);
    }
  });

  // Update camera position based on movement
  function update() {
    const speed = 0.05;
    
    // Only forward movement allowed
    if (move.forward) controls.moveForward(speed);

    // Clamp rotation after movement
    clampRotation();

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

  // Click to lock pointer, only if controls are enabled
  let controlsEnabled = true;
  function setControlsEnabled(enabled) {
    controlsEnabled = enabled;
    if (!enabled && controls.isLocked) {
      controls.unlock();
      hasSetInitialRotation = false; // Reset when unlocking
    }
  }

  document.addEventListener('click', () => {
    if (controlsEnabled) {
      controls.lock();
    }
  });

  // Reset initial rotation when pointer lock changes
  controls.addEventListener('unlock', () => {
    hasSetInitialRotation = false;
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
