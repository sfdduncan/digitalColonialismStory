
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';

export class Scene3 extends SceneBase {
  constructor() {
    super();
    this.houses = [];
    this.loader = new GLTFLoader();
    this.loaded = false;
  }

  async enter() {
    if (this.loaded) return;
    this.loaded = true;
    // Add ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 60),
      new THREE.MeshStandardMaterial({ color: 0xc2b280 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    this.add(ground);

    // Load the GLTF model
    const gltf = await this.loader.loadAsync('models/old_home_1.gltf');
    const houseModel = gltf.scene;
    const houseSpacing = 10; // space between houses
    const numHouses = 5; // per side
    const offsetZ = 0;
    const leftX = -8;
    const rightX = 8;

    // Place houses on the left
    for (let i = 0; i < numHouses; i++) {
      const house = houseModel.clone();
      house.position.set(leftX, 0, offsetZ - i * houseSpacing);
      house.scale.set(2.5, 2.5, 2.5);
      this.add(house);
      this.houses.push(house);
    }
    // Place houses on the right
    for (let i = 0; i < numHouses; i++) {
      const house = houseModel.clone();
      house.position.set(rightX, 0, offsetZ - i * houseSpacing);
      house.scale.set(2.5, 2.5, 2.5);
      this.add(house);
      this.houses.push(house);
    }
    // Optionally: add ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.add(ambient);
  }

  update(userPosition) {
    // ...add any per-frame logic if needed...
  }
}
