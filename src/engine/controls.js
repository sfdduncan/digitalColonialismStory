import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/PointerLockControls.js';

export function createControls(camera, domElement) {
  // FPS-style mouse + keyboard controls
  const controls = new PointerLockControls(camera, domElement);

  const move = { forward: false, backward: false, left: false, right: false };
  const cameraHeight = 1.5; // Set camera height to simulate eye level

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
        move.backward = true;
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

  // Update camera position based on movement
  function update() {
    const speed = 0.05;
    if (move.forward) controls.moveForward(speed);
    if (move.backward) controls.moveForward(-speed);
    if (move.left) controls.moveRight(-speed);
    if (move.right) controls.moveRight(speed);

    // Keep the camera at a fixed height
    camera.position.y = cameraHeight;
  }

  // Attach update function to the animation loop
  controls.update = update;

  // Click to lock pointer
  document.addEventListener('click', () => {
    controls.lock();
  });

  return controls;
}
