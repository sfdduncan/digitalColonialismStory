import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { SceneBase } from './SceneBase.js';

export class SceneTwo extends SceneBase {
  constructor() {
    super();

    // Fog for atmosphere
    this.fog = new THREE.Fog(0x222222, 10, 50);

    // Light source
    const light = new THREE.PointLight(0xff0000, 2, 50);
    light.position.set(0, 10, 0);
    this.add(light);

    // Add a rotating sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xff4444 })
    );
    sphere.position.set(0, 5, 0);
    this.objects.push(sphere);
    this.add(sphere);
  }

  update() {
    // Rotate the sphere
    this.objects.forEach((obj) => {
      obj.rotation.y += 0.01;
    });
  }
}