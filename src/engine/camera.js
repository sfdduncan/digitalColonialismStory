import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export function createCamera() {
  // Perspective camera mimics human vision
  const camera = new THREE.PerspectiveCamera(
    75,                              // field of view
    window.innerWidth / window.innerHeight,
    0.1,                             // near clip
    1000                             // far clip
  )

  // Starting position
camera.position.set(0, 0.1, 1)

  return camera
}
