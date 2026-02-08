import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';

export class SceneOne extends SceneBase {
  constructor() {
    super();

    // Set light blue sky color
    this.background = new THREE.Color(0x90d5ff);

    // Fog for atmosphere
    this.fog = new THREE.Fog(0x87ceeb, 5, 50);

    // Light source
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.add(light);

    // Snow texture ground with tiling and anisotropy
    const textureLoader = new THREE.TextureLoader();
    const snowTexture = textureLoader.load('../models/stone_texture.jpg'); // Replace with actual file path
    snowTexture.wrapS = THREE.RepeatWrapping;
    snowTexture.wrapT = THREE.RepeatWrapping;
    snowTexture.repeat.set(10, 10); // Repeat the texture 10 times in both directions
    snowTexture.anisotropy = 16; // A good default value

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        map: snowTexture,
        emissiveIntensity: 0.1 // Adjust brightness
      })
    );
    ground.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
    this.add(ground);

    // Add whispy white spots in the sky
    const cloudGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });

    for (let i = 0; i < 20; i++) {
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        Math.random() * 50 - 25, // Random x position
        Math.random() * 10 + 20, // Random height
        Math.random() * 50 - 25 // Random z position
      );
      this.add(cloud);
    }

    // Load and scatter grass models

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('../models/grass_1.glb', (gltf) => {
      for (let i = 0; i < 50; i++) {
        const grass = gltf.scene.clone();
        grass.position.set(
          Math.random() * 100 - 50, // Random x position
          0, // On the ground
          Math.random() * 100 - 50 // Random z position
        );
        grass.rotation.y = 3.25; // Random rotation around the vertical axis
        grass.rotation.x = 0; // Ensure the grass is upright
        grass.rotation.z = 0; // Ensure the grass is upright
        grass.scale.set(1, 1, 1); // Adjust scale if needed
        this.add(grass);
      }
    });

    // Load and scatter tree models
    const treeModels = ['pine_tree.glb', 'spruce_tree.glb', 'tree.glb'];
    treeModels.forEach((model) => {
      gltfLoader.load(`../models/${model}`, (gltf) => {
        for (let i = 0; i < 300; i++) {
          const tree = gltf.scene.clone();
          tree.position.set(
            Math.random() * 100 - 50, // Random x position
            0, // On the ground
            Math.random() * 100 - 50 // Random z position
          );
          tree.rotation.y = Math.random() * Math.PI * 2; // Random rotation around the vertical axis
          tree.rotation.x = 0; // Ensure the tree is upright
          tree.rotation.z = 0; // Ensure the tree is upright
          tree.scale.set(.07, .07, .07); // Adjust scale for trees
          this.add(tree);
        }
      });
    });
  }

  update() {
    // Optional per-frame logic
  }
}
