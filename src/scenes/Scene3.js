
// ================================
// SCENE 3 - Village Area
// ================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';

export class Scene3 extends SceneBase {
  constructor() {
    super();
    
    // Scene configuration
    this.sceneWidth = 100;
    this.sceneLength = 100;
    this.loaded = false;
    this.houses = [];
  }

  async enter() {
    if (this.loaded) return;
    this.loaded = true;

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.add(ambient);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(this.sceneWidth, this.sceneLength),
      new THREE.MeshStandardMaterial({ color: 0xc2b280 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    this.add(ground);
    this.objects.push(ground);

    // Load and place houses
    await this.generateHouses();
  }

  async generateHouses() {
    const loader = new GLTFLoader();
    
    try {
      // Load house models
      const [gltf1, gltf2] = await Promise.all([
        loader.loadAsync('./models/oldHouse_1.glb').catch(() => null),
        loader.loadAsync('./models/oldHouse_2.glb').catch(() => null)
      ]);

      const houseModels = [gltf1?.scene, gltf2?.scene].filter(Boolean);
      
      if (houseModels.length === 0) {
        console.warn('No house models could be loaded');
        return;
      }

      const houseSpacing = 9;
      const numHouses = 10;
      const offsetZ = 20;
      const leftX = -10;
      const rightX = 10;

      // Place houses on the left side
      for (let i = 0; i < numHouses; i++) {
        const modelIndex = i % houseModels.length;
        if (houseModels[modelIndex]) {
          const house = houseModels[modelIndex].clone();
          house.position.set(leftX, 0, offsetZ - i * houseSpacing);
          house.scale.set(6, 6, 6);
          this.add(house);
          this.houses.push(house);
          this.objects.push(house);
        }
      }

      // Place houses on the right side
      for (let i = 0; i < numHouses; i++) {
        const modelIndex = (i + 1) % houseModels.length;
        if (houseModels[modelIndex]) {
          const house = houseModels[modelIndex].clone();
          house.position.set(rightX, 0, offsetZ - i * houseSpacing);
          house.scale.set(-6, 6, 6); // Mirror by flipping X
          this.add(house);
          this.houses.push(house);
          this.objects.push(house);
        }
      }
    } catch (error) {
      console.error('Error loading house models:', error);
    }
  }

  update(cameraPosition) {
    // Add any per-frame logic here if needed
  }
}
