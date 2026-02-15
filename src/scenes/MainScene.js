import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';
import { Area } from '../world/Area.js';
import { showSceneTextOverlay, hideSceneTextOverlay } from '../main.js';

export class MainScene extends SceneBase {
  constructor(camera) {
    super();

    this.sceneTwoGenerated = false;
    this.sceneTwoObjects = [];
    this.trees = [];
    this.treeBatches = {};
    this.areas = [];

    // SceneTwo Z region
    this.sceneTwoStartZ = -10;      // front edge of SceneTwo
    this.sceneTwoOverlap = 20;      // overlap distance for fading SceneOne objects

    // Set initial camera position
    camera.position.set(0, 10, 75);
    camera.lookAt(0, 0, 0);

    // Restrict camera movement within world boundaries
    this.restrictCamera = (camera) => {
      const boundary = 50;
      camera.position.x = Math.max(-boundary, Math.min(boundary, camera.position.x));
      // Allow z to go much further negative to reach all areas
      camera.position.z = Math.max(-550, Math.min(boundary, camera.position.z));
    };

    // --- SceneOne region (z=50 to z=0) ---
    this.background = new THREE.Color(0xe4faff);
    this.fog = new THREE.Fog(0x87ceeb, 2, 80);

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(10, 10, 10);
    this.add(light1);

    // Area 1: Snowy area (z=25, 100x50)
    const textureLoader = new THREE.TextureLoader();
    const snowTexture = textureLoader.load('../models/snow.jpg');
    snowTexture.wrapS = snowTexture.wrapT = THREE.RepeatWrapping;
    snowTexture.repeat.set(100, 100);
    snowTexture.anisotropy = 16;
    const area1 = new Area({
      positionZ: 25,
      width: 100,
      length: 100,
      material: new THREE.MeshStandardMaterial({
        map: snowTexture,
        emissive: new THREE.Color(0xe0f7fa),
        emissiveIntensity: 0.75
      }),
      customInit: (group) => {
        // Igloo
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('../models/igloo.glb', (gltf) => {
          const iceBlock = gltf.scene.clone();
          iceBlock.position.set(0, -0.009, 49);
          iceBlock.rotation.y = Math.PI;
          iceBlock.scale.set(4, 4, 4);
          iceBlock.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material.emissive.set(0xe0f7fa);
              child.material.emissiveIntensity = 0.8;
              child.material.needsUpdate = true;
            }
          });
          group.add(iceBlock);
        });
        // Ice walls
        gltfLoader.load('../models/wall_of_ice.glb', (gltf) => {
          const wall1 = gltf.scene.clone();
          wall1.position.set(-25, -3, 25);
          wall1.rotation.y = Math.PI / 2;
          wall1.scale.set(3, 2, 5);
          group.add(wall1);
          const wall2 = gltf.scene.clone();
          wall2.position.set(25, -3, 25);
          wall2.rotation.y = -Math.PI / 2;
          wall2.scale.set(3, 2, 5);
          group.add(wall2);
        });
      }
    });
    this.areas.push(area1);
    this.add(area1.getObject3D());

    // GLTF loader for static SceneOne objects
    const gltfLoader = new GLTFLoader();

    // Igloo
    gltfLoader.load('../models/igloo.glb', (gltf) => {
      const iceBlock = gltf.scene.clone();
      iceBlock.position.set(0, -0.009, 49);
      iceBlock.rotation.y = Math.PI;
      iceBlock.scale.set(4, 4, 4);
      iceBlock.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissive.set(0xe0f7fa);
          child.material.emissiveIntensity = 0.8;
          child.material.needsUpdate = true;
        }
      });
      this.add(iceBlock);
    });

    // Ice walls
    gltfLoader.load('../models/wall_of_ice.glb', (gltf) => {
      const wall1 = gltf.scene.clone();
      wall1.position.set(-25, -3, 25);
      wall1.rotation.y = Math.PI / 2;
      wall1.scale.set(3, 2, 5);
      this.add(wall1);

      const wall2 = gltf.scene.clone();
      wall2.position.set(25, -3, 25);
      wall2.rotation.y = -Math.PI / 2;
      wall2.scale.set(3, 2, 5);
      this.add(wall2);
    });

    // Persistent Sun
    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
    );
    this.sun.position.set(50, 50, -50);
    this.add(this.sun);

    // Path parameters
    this.pathWidth = 10;
    this.pathCenterX = 0;
  }

  // --- SceneTwo region (z=0 to z=-300) ---
  generateSceneTwo() {
    if (this.sceneTwoGenerated) return;
    this.sceneTwoGenerated = true;

    const textureLoader = new THREE.TextureLoader();
    const stoneTexture = textureLoader.load('../models/stone_texture.jpg');
    stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
    stoneTexture.repeat.set(100, 100);

    // Area 2: Forested area (z=-75, 100x100)
    const area2 = new Area({
      positionZ: this.sceneTwoStartZ - 75,
      width: 100,
      length: 100,
      material: new THREE.MeshStandardMaterial({ map: stoneTexture }),
      customInit: (group) => {
        this.generateSceneTwoVegetation = this.generateSceneTwoVegetation.bind(this);
        this.generateSceneTwoVegetation(group);
      }
    });
    this.areas.push(area2);
    this.add(area2.getObject3D());

    // Area 3 (houses) will be generated later when user reaches the end of area 2
    this.sceneThreeGenerated = false;
  }

  // --- SceneThree region (z=-175 and beyond) ---
  generateSceneThree() {
    if (this.sceneThreeGenerated) return;
    this.sceneThreeGenerated = true;
    // Area 3: Houses lined up (z=-175, 100x100)
    const scene3Ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0xc2b280 })
    );
    scene3Ground.rotation.x = -Math.PI / 2;
    scene3Ground.position.set(0, -0.01, this.sceneTwoStartZ - 175); // z=-175
    this.add(scene3Ground);

    // Load and place houses
    const loader = new GLTFLoader();
    Promise.all([
      new Promise((resolve, reject) => loader.load('../models/oldHouse_1.glb', resolve, undefined, reject)),
      new Promise((resolve, reject) => loader.load('../models/oldHouse_2.glb', resolve, undefined, reject))
    ]).then(([gltf1, gltf2]) => {
      const houseModels = [gltf1.scene, gltf2.scene];
      const houseSpacing = 9;
      const numHouses = 10;
      const offsetZ = this.sceneTwoStartZ - 135;
      const leftX = -10;
      const rightX = 10;
      for (let i = 0; i < numHouses; i++) {
        // Alternate models for variety
        const houseL = houseModels[i % 2].clone();
        houseL.position.set(leftX, 0, offsetZ - i * houseSpacing);
        houseL.scale.set(6, 6, 6);
        this.add(houseL);
        const houseR = houseModels[(i + 1) % 2].clone();
        houseR.position.set(rightX, 0, offsetZ - i * houseSpacing);
        // Mirror the right-side house by flipping X scale
        houseR.scale.set(-6, 6, 6);
        this.add(houseR);
      }
      // Ambient light for scene 3
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      this.add(ambient);
    }).catch((error) => {
      console.error('Error loading house models:', error);
    });
  }

  generateSceneTwoVegetation(group = this) {
    // Procedural batch-based tree generation
    const gltfLoader = new GLTFLoader();
    const isWithinPath = (x) => Math.abs(x - this.pathCenterX) <= this.pathWidth / 2;
    const treeModels = ['pine_tree.glb', 'spruce_tree.glb', 'tree.glb'];
    const batchSize = 10; // Each batch covers 10 units in z
    // Only generate trees within area 2 boundaries: z=-75 to z=-175
    const area2Start = this.sceneTwoStartZ - 75;
    const area2End = area2Start - 100;
    const batchCount = Math.floor((area2Start - area2End) / batchSize);
    for (let batch = 0; batch < batchCount; batch++) {
      this.treeBatches[batch] = false; // Not generated yet
    }

    // Store for later use in update()
    this._treeModels = treeModels;
    this._gltfLoader = gltfLoader;
    this._isWithinPath = isWithinPath;
    this._batchSize = batchSize;
    this._batchCount = batchCount;
    this._groupForTrees = group;
  }

  update(userPosition) {

        // Pre-generate SceneThree slightly before the player reaches it
        if (userPosition.z < this.sceneTwoStartZ - 175 + 10 && !this.sceneThreeGenerated) {
          this.generateSceneThree();
        }
    if (!userPosition) return;

    // --- Floating text overlay logic for SceneOne (z=50 to z=0) ---
    // Example: show text at z=40, z=20, hide after z<0
    if (userPosition.z > 0 && userPosition.z <= 50) {
      if (userPosition.z > 35 && userPosition.z <= 50) {
        showSceneTextOverlay('Welcome to the snowy expanse.');
      } else if (userPosition.z > 10 && userPosition.z <= 35) {
        showSceneTextOverlay('The cold bites as you move forward...');
      } else if (userPosition.z > 0 && userPosition.z <= 10) {
        showSceneTextOverlay('You approach the edge of the forest.');
      }
    } else {
      hideSceneTextOverlay();
    }

    // Pre-generate SceneTwo slightly before the player reaches it
    if (userPosition.z < this.sceneTwoStartZ + 10 && !this.sceneTwoGenerated) {
      this.generateSceneTwo();
    }

    // Procedural tree batch generation
    if (this._treeModels && this.treeBatches) {
      // Determine which batch the player is near
      const playerZ = userPosition.z;
      for (let batch = 0; batch < this._batchCount; batch++) {
        const batchStart = this.sceneTwoStartZ - batch * this._batchSize;
        const batchEnd = batchStart - this._batchSize;
        // If player is within 10 units of this batch and not generated
        if (!this.treeBatches[batch] && playerZ < batchStart + 10 && playerZ > batchEnd - 10) {
          this.treeBatches[batch] = true;
          // Generate trees for this batch
          this._treeModels.forEach((model) => {
            this._gltfLoader.load(`../models/${model}`, (gltf) => {
              for (let i = 0; i < 10; i++) {
                let x, z;
                do {
                  x = Math.random() * 100 - 50;
                  z = batchStart - Math.random() * this._batchSize;
                } while (this._isWithinPath(x));
                const tree = gltf.scene.clone();
                tree.position.set(x, 0, z);
                tree.rotation.y = Math.random() * Math.PI * 2;
                tree.scale.setScalar(0.02);
                this._groupForTrees.add(tree);
                this.trees.push(tree);
                this.sceneTwoObjects.push(tree);
              }
            });
          });
        }
      }
    }

    // Update tree scale based on proximity to user (gradual appearance)
    if (this.trees) {
      this.trees.forEach((tree) => {
        const distance = Math.abs(tree.position.z - userPosition.z);
        if (distance < 20) {
          // Trees get larger as you get closer
          const scale = THREE.MathUtils.clamp(0.05 + (1 - distance / 20) * 0.15, 0.05, 0.2);
          tree.scale.set(scale, scale, scale);
        } else {
          tree.scale.set(0.05, 0.05, 0.05); // default small size for distant trees
        }
      });
    }

    // Fade out SceneOne objects in the overlap zone
    this.children.forEach((child) => {
      if (child.material && child.position.z >= this.sceneTwoStartZ - this.sceneTwoOverlap &&
          child.position.z <= this.sceneTwoStartZ) {
        const t = (child.position.z - (this.sceneTwoStartZ - this.sceneTwoOverlap)) / this.sceneTwoOverlap;
        child.material.opacity = THREE.MathUtils.clamp(1 - t, 0, 1);
        child.material.transparent = true;
      }
    });
  }
}
