import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/PointerLockControls.js';

export function createControls(camera, domElement) {
  // FPS-style mouse + keyboard controls
  const controls = new PointerLockControls(camera, domElement);

  const move = { forward: false, backward: false, left: false, right: false };
  const cameraHeight = 1.6; // Set camera height to simulate eye level

  // Keydown event listener
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        move.forward = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        move.backward = false;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        move.left = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        move.right = true;
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
      case 'ArrowDown':
      case 's':
      case 'S':
        move.backward = false;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        move.left = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        move.right = false;
        break;
    }
  });



  // Clamp yaw (left/right) to ±45° (±Math.PI/4)
  const YAW_LIMIT = Math.PI / 4; // 45 degrees

  function clampYaw() {
    if (controls.yawObject) {
      const y = controls.yawObject.rotation.y;
      if (y < -YAW_LIMIT) controls.yawObject.rotation.y = -YAW_LIMIT;
      else if (y > YAW_LIMIT) controls.yawObject.rotation.y = YAW_LIMIT;
    }
  }


  // Clamp yaw after every mousemove, but only when pointer is locked
  document.addEventListener('mousemove', () => {
    if (controls.isLocked) clampYaw();
  });

  // Update camera position based on movement
  function update() {
    const speed = 0.03;
    if (move.forward) controls.moveForward(speed);
    if (move.backward) controls.moveForward(-speed);
    if (move.left) controls.moveRight(-speed);
    if (move.right) controls.moveRight(speed);

    // Clamp yaw after movement
    clampYaw();

    // Keep the camera at a fixed height
    camera.position.y = cameraHeight;
  }

  // Attach update function to the animation loop
  controls.update = update;

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
