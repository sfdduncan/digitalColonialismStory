import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class Area {
  constructor({ positionZ = 0, width = 100, length = 100, material = null, customInit = null } = {}) {
    this.group = new THREE.Group();
    this.positionZ = positionZ;
    this.width = width;
    this.length = length;
    this.material = material || new THREE.MeshStandardMaterial({ color: 0xffffff });

    // Create ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      this.material
    );
    ground.position.z = positionZ;
    ground.rotation.x = -Math.PI / 2;
    this.group.add(ground);

    // Allow custom initialization (e.g., add trees, objects)
    if (typeof customInit === 'function') {
      customInit(this.group);
    }
  }

  getObject3D() {
    return this.group;
  }
}
