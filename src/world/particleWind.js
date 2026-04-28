import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

/**
 * ParticleWind - Sand blowing in the wind effect for the desert/mountain pass scene.
 * Particles drift right-to-left with subtle vertical drift to simulate windblown sand.
 */
export class ParticleWind {
  constructor(centerZ = -350) {
    this.centerZ = centerZ;

    // Bounding volume around which particles are spawned and recycled
    this.spreadX = 60;   // half-width on each side of player
    this.spreadY = 12;   // vertical range
    this.spreadZ = 60;   // half-depth on each side of player

    this.particleCount = 20500;

    // Build geometry, attributes, and material
    this._buildSystem();
  }

  _buildSystem() {
    const count = this.particleCount;
    const positions  = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3); // per-particle vx, vy, vz
    const sizes      = new Float32Array(count);

    const cx = 0;
    const cy = 2;                // hover a bit above ground
    const cz = this.centerZ;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random start position spread across the volume
      positions[i3]     = cx + (Math.random() - 0.5) * this.spreadX * 2;
      positions[i3 + 1] = cy + Math.random() * this.spreadY;
      positions[i3 + 2] = cz + (Math.random() - 0.5) * this.spreadZ * 2;

      // Wind blows right (+x) → left (-x)
      // Base horizontal speed 3–9, gentle vertical drift, tiny z flutter
      velocities[i3]     = -(Math.random() * 6 + 3);           // vx (leftward)
      velocities[i3 + 1] = (Math.random() - 0.6) * 0.8;        // vy slight downward bias
      velocities[i3 + 2] = (Math.random() - 0.5) * 1.2;        // vz minor side flutter

      // Very small particles – vary between 0.03 and 0.09
      sizes[i] = Math.random() * 0.06 + 0.03;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',  new THREE.BufferAttribute(positions,  3));
    geometry.setAttribute('velocity',  new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size',      new THREE.BufferAttribute(sizes,      1));

    // Warm sandy/tan colour
    const material = new THREE.PointsMaterial({
      color: 0xd4b483,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false; // always render – it follows the camera
  }

  /**
   * Returns the THREE.Points mesh to be added to the scene.
   */
  getMesh() {
    return this.points;
  }

  /**
   * Call every frame from the scene's update loop.
   * @param {number} deltaTime  - seconds since last frame
   * @param {{x:number, y:number, z:number}} userPosition - current camera/player world position
   */
  update(deltaTime, userPosition) {
    const positions  = this.points.geometry.attributes.position.array;
    const velocities = this.points.geometry.attributes.velocity.array;
    const count      = this.particleCount;

    const px = userPosition.x;
    const pz = userPosition.z;

    const halfX = this.spreadX;
    const halfZ = this.spreadZ;

    const minY = 0;
    const maxY = minY + this.spreadY;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Advance position
      positions[i3]     += velocities[i3]     * deltaTime;
      positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
      positions[i3 + 2] += velocities[i3 + 2] * deltaTime;

      // Recycle if drifted outside the player-centred bounding box
      const dx = positions[i3]     - px;
      const dy = positions[i3 + 1];
      const dz = positions[i3 + 2] - pz;

      if (
        dx < -halfX || dx > halfX ||
        dy < minY   || dy > maxY  ||
        dz < -halfZ || dz > halfZ
      ) {
        // Re-spawn on the right side of the player so it sweeps through
        positions[i3]     = px + halfX * (0.8 + Math.random() * 0.2);
        positions[i3 + 1] = minY + Math.random() * this.spreadY;
        positions[i3 + 2] = pz  + (Math.random() - 0.5) * halfZ * 2;

        // Re-randomise velocity slightly
        velocities[i3]     = -(Math.random() * 6 + 3);
        velocities[i3 + 1] = (Math.random() - 0.6) * 0.8;
        velocities[i3 + 2] = (Math.random() - 0.5) * 1.2;
      }
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Dispose GPU resources.
   */
  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
    if (this.points.parent) {
      this.points.parent.remove(this.points);
    }
  }
}
