import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export function createRenderer() {
  // Create WebGL renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // Match device resolution
  renderer.setPixelRatio(window.devicePixelRatio);

  // Full window size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Append canvas to DOM
  document.body.appendChild(renderer.domElement);

  // Handle resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return renderer;
}
