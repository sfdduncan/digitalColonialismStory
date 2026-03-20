// ================================
// MAIN SCENE - Contains all areas
// Scene 1: Snowy area (z=0 to z=-100)
// Scene 2: Forest area (z=-100 to z=-200)  
// Scene 3: Village area (z=-200 to z=-300)
// ================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';
import { subtitleManager } from '../ui/subtitleManager.js';
import { subtitles } from '../ui/subtitleText.js';
import { archiveImagesManager } from '../ui/archiveImagesManager.js';
import { archiveImages } from '../ui/archiveImagesConfig.js';


export class MainScene extends SceneBase {
  constructor(camera) {
    super();

    // Trigger flash transition for smooth loading
    if (window.triggerFlashTransition) {
      window.triggerFlashTransition();
    }

    // World configuration - consistent dimensions across all areas
    this.areaWidth = 100;
    this.areaLength = 100;
    this.pathWidth = 10;
    this.pathCenterX = 0;

    // Track objects and generation state
    this.trees = [];
    this.grass = [];
    this.houses = [];
    this.scene2Generated = false;
    this.scene3Generated = false;
    this.treeBatches = {};
    this.grassBatches = {};
    this.currentScene = 1; // Track which scene the user is in

    // Scene appearance
    this.background = new THREE.Color(0xe4faff);
    this.fog = new THREE.Fog(0x87ceeb, 2, 120);

    // Set camera start position at the igloo (Scene 1)
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, -20);

    // Restrict camera movement
    this.restrictCamera = (camera) => {
      const boundary = 50;
      camera.position.x = Math.max(-boundary, Math.min(boundary, camera.position.x));
      camera.position.z = Math.max(-350, Math.min(50, camera.position.z));
    };

    // Global lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.add(ambient);

    // Sun (persistent across all areas)
    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
    );
    this.sun.position.set(50, 50, -50);
    this.add(this.sun);

    // Only build Scene 1 initially
    // Scene 2 and 3 will generate when user approaches
    this.buildScene1();

    // Load subtitles for MainScene (starts at Scene 1 / igloo).
    subtitleManager.loadSubtitles(subtitles.mainScene);
    subtitleManager.update(camera.position.z);
    
    // Initialize and load archive images for MainScene
    archiveImagesManager.init(this); // Pass the scene to the manager
    archiveImagesManager.loadImages(archiveImages.mainScene);
    archiveImagesManager.update(camera.position.z);
  }

  // ================================
  // SCENE 1: Snowy Ice Area
  // Position: z=0 to z=-100
  // ================================
  buildScene1() {
    const scene1Z = -50; // Center of Scene 1

    // Ground with snow texture
    const textureLoader = new THREE.TextureLoader();
    const snowTexture = textureLoader.load('./models/snow.jpg');
    snowTexture.wrapS = snowTexture.wrapT = THREE.RepeatWrapping;
    snowTexture.repeat.set(10, 10);
    snowTexture.anisotropy = 16;

    const ground1 = new THREE.Mesh(
      new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
      new THREE.MeshStandardMaterial({
        map: snowTexture,
        emissive: new THREE.Color(0xe0f7fa),
        emissiveIntensity: 0.75
      })
    );
    ground1.rotation.x = -Math.PI / 2;
    ground1.position.set(0, -0.01, scene1Z);
    this.add(ground1);

    // Load models
    const loader = new GLTFLoader();

    // Igloo at the starting point
    loader.load('./models/igloo.glb', (gltf) => {
      const igloo = gltf.scene;
      igloo.position.set(0, 0, 10);
      igloo.rotation.y = Math.PI;
      igloo.scale.set(4, 4, 4);
      igloo.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissive.set(0xe0f7fa);
          child.material.emissiveIntensity = 0.5;
          child.material.needsUpdate = true;
        }
      });
      this.add(igloo);
    });

    // Ice walls on sides
    loader.load('./models/wall_of_ice.glb', (gltf) => {
      const wall1 = gltf.scene.clone();
      wall1.position.set(-25, -2.2, scene1Z);
      wall1.rotation.y = Math.PI / 2;
      wall1.scale.set(3, 2, 5);
      this.add(wall1);

      const wall2 = gltf.scene.clone();
      wall2.position.set(25, -3, scene1Z);
      wall2.rotation.y = -Math.PI / 2;
      wall2.scale.set(3, 2, 5);
      this.add(wall2);
    });
  }

  // ================================
  // SCENE 2: Forest Area
  // Position: z=-100 to z=-200
  // Generates procedurally as user approaches
  // ================================
  buildScene2() {
    if (this.scene2Generated) return;
    this.scene2Generated = true;

    const scene2Z = -150; // Center of Scene 2

    // Ground with stone texture
    const textureLoader = new THREE.TextureLoader();
    const stoneTexture = textureLoader.load('./models/stone_texture.jpg');
    stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
    stoneTexture.repeat.set(10, 10);

    const ground2 = new THREE.Mesh(
      new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
      new THREE.MeshStandardMaterial({ map: stoneTexture })
    );
    ground2.rotation.x = -Math.PI / 2;
    ground2.position.set(0, -0.01, scene2Z);
    this.add(ground2);

    // Initialize procedural tree and grass generation
    this.initializeTreeGeneration();
    this.initializeGrassGeneration();
  }

  initializeGrassGeneration() { 
    // Setup for batch-based procedural grass generation 
    const grassBatchSize = 50; 
    const scene2Start = -100; 
    const scene2End = -200; 
    const grassBatchCount = Math.ceil((scene2End - scene2Start) / - grassBatchSize)

    for (let batch = 0; batch < grassBatchCount; batch++) {
      this.grassBatches[batch] = false;
    }

    this.grassConfig = {
      models: [
        { file: 'shortGrass.glb', yOffset: -5 },
        { file: 'mediumGrass.glb', yOffset: -9 },
        { file: 'tallGrass.glb', yOffset: 1 }
      ],
      batchSize: grassBatchSize,
      batchCount: grassBatchCount,
      scene2Start: scene2Start
    };
  }

  generateGrassBatch(batchIndex) {
    if (this.grassBatches[batchIndex]) return;
    this.grassBatches[batchIndex] = true;

    const { models, batchSize: grassBatchSize, scene2Start } = this.grassConfig;
    const loader = new GLTFLoader();
    
    const batchStartZ = scene2Start - (batchIndex * grassBatchSize);
    const batchEndZ = batchStartZ - grassBatchSize;

    models.forEach((modelConfig) => {
      loader.load(`./models/${modelConfig.file}`, (gltf) => {
        // Create 30 grass per model per batch
        for (let i = 0; i < 30; i++) {
          // Place grass on left or right side (like hack scene images)
          const placeOnLeft = Math.random() > 0.5;
          let x, z;
          
          // Create narrow walls on each side of the path (15 units wide)
          const wallWidth = 15;
          
          if (placeOnLeft) {
            // Left wall: from -5 (path edge) extending left 15 units to -20
            x = -(this.pathWidth / 2) - Math.random() * wallWidth;
          } else {
            // Right wall: from +5 (path edge) extending right 15 units to +20
            x = (this.pathWidth / 2) + Math.random() * wallWidth;
          }
          
          // Add z-offset variation like hack scene for better corridor effect
          const baseZ = batchStartZ - (i * grassBatchSize / 30);
          const zOffset = (Math.random() - 0.5) * 4;
          z = baseZ + zOffset;

          const grass  = gltf.scene.clone();
          grass.position.set(x, 0 + modelConfig.yOffset, z);
          grass.rotation.y = Math.random() * Math.PI * 2;
          grass.scale.setScalar(0.03); // Static size
          this.add(grass);
          this.grass.push(grass);
        }
      });
    });
  }

  initializeTreeGeneration() {
    // Setup for batch-based procedural tree generation
    const batchSize = 20; // Each batch covers 20 units in z
    const scene2Start = -100;
    const scene2End = -200;
    const batchCount = Math.ceil((scene2End - scene2Start) / -batchSize);

    // Initialize all batches as not generated
    for (let batch = 0; batch < batchCount; batch++) {
      this.treeBatches[batch] = false;
    }

    // Store parameters for use in update()
    this.treeConfig = {
      models: [
        { file: 'pine_tree.glb', yOffset: 0 },
        { file: 'spruce_tree.glb', yOffset: 0 },
        { file: 'tree.glb', yOffset: 0 }
      ],
      batchSize: batchSize,
      batchCount: batchCount,
      scene2Start: scene2Start
    };
  }

  generateTreeBatch(batchIndex) {
    if (this.treeBatches[batchIndex]) return;
    this.treeBatches[batchIndex] = true;

    const { models, batchSize, scene2Start } = this.treeConfig;
    const loader = new GLTFLoader();
    
    const batchStartZ = scene2Start - (batchIndex * batchSize);
    const batchEndZ = batchStartZ - batchSize;

    models.forEach((modelConfig) => {
      loader.load(`./models/${modelConfig.file}`, (gltf) => {
        // Create 15 trees per model per batch (increased density)
        for (let i = 0; i < 15; i++) {
          // Randomly choose left or right side
          const placeOnLeft = Math.random() > 0.5;
          let x, z;
          
          // Create narrow walls on each side of the path (15 units wide)
          const wallWidth = 15;
          
          if (placeOnLeft) {
            // Left wall: from -5 (path edge) extending left 15 units to -20
            x = -(this.pathWidth / 2) - Math.random() * wallWidth;
          } else {
            // Right wall: from +5 (path edge) extending right 15 units to +20
            x = (this.pathWidth / 2) + Math.random() * wallWidth;
          }
          
          // Add z-offset variation like hack scene for better corridor effect
          const baseZ = batchStartZ - (i * batchSize / 15);
          const zOffset = (Math.random() - 0.5) * 4;
          z = baseZ + zOffset;

          const tree = gltf.scene.clone();
          tree.position.set(x, 0 + modelConfig.yOffset, z);
          tree.rotation.y = Math.random() * Math.PI * 2;
          tree.scale.setScalar(0.05); // Start small
          this.add(tree);
          this.trees.push(tree);
        }
      });
    });
  }

  // ================================
  // SCENE 3: Village Area
  // Position: z=-200 to z=-300
  // Only generates when user reaches this area
  // ================================
  buildScene3() {
    if (this.scene3Generated) return;
    this.scene3Generated = true;

    const scene3Z = -250; // Center of Scene 3

    // Ground
    const ground3 = new THREE.Mesh(
      new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
      new THREE.MeshStandardMaterial({ color: 0xc2b280 })
    );
    ground3.rotation.x = -Math.PI / 2;
    ground3.position.set(0, -0.01, scene3Z);
    this.add(ground3);

    // Load and place houses
    const loader = new GLTFLoader();
    Promise.all([
      loader.loadAsync('./models/oldHouse_1.glb').catch(() => null),
      loader.loadAsync('./models/oldHouse_2.glb').catch(() => null)
    ]).then(([gltf1, gltf2]) => {
      const houseModels = [gltf1?.scene, gltf2?.scene].filter(Boolean);
      
      if (houseModels.length === 0) {
        console.warn('No house models could be loaded');
        return;
      }

      const houseSpacing = 9;
      const numHouses = 10;
      const startZ = scene3Z + 40;
      const leftX = -10;
      const rightX = 10;

      // Place houses on left side
      for (let i = 0; i < numHouses; i++) {
        const modelIndex = i % houseModels.length;
        if (houseModels[modelIndex]) {
          const house = houseModels[modelIndex].clone();
          house.position.set(leftX, 0, startZ - i * houseSpacing);
          house.scale.set(6, 6, 6);
          this.add(house);
          this.houses.push(house);
        }
      }

      // Place houses on right side
      for (let i = 0; i < numHouses; i++) {
        const modelIndex = (i + 1) % houseModels.length;
        if (houseModels[modelIndex]) {
          const house = houseModels[modelIndex].clone();
          house.position.set(rightX, 0, startZ - i * houseSpacing);
          house.scale.set(-6, 6, 6); // Mirror by flipping X
          this.add(house);
          this.houses.push(house);
        }
      }
    });
  }


  buildScene4() {
    if (this.scene4Generated) return;
      this.scene4Generated = true;  

      const scene4Z = -350; // Center of Scene 4
      // Ground
      const ground4 = new THREE.Mesh(
        new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
        new THREE.MeshStandardMaterial({ color: 0x808080 })
      );
      ground4.rotation.x = -Math.PI / 2;
      ground4.position.set(0, -0.01, scene4Z);
      this.add(ground4);
      // Add your models and objects here
      const loader = new GLTFLoader();  
      // Example: Load and place models
      loader.load('./models/your_model.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, scene4Z);
        model.scale.set(1, 1, 1);
        this.add(model);
      });

  }


  buildScene5() {
    if (this.scene5Generated) return;
      this.scene5Generated = true;   
      const scene5Z = -450; // Center of Scene 5
      // Ground
      const ground5 = new THREE.Mesh(
        new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
        new THREE.MeshStandardMaterial({ color: 0x404040 })
      );
      ground5.rotation.x = -Math.PI / 2;
      ground5.position.set(0, -0.01, scene5Z);
      this.add(ground5);
      // Add your models and objects here
      const loader = new GLTFLoader();
      // Example: Load and place models
      loader.load('./models/your_model.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, scene5Z);
        model.scale.set(1, 1, 1);
        this.add(model);
      });
  }
  // ================================
  // TO ADD MORE SCENES:
  // 1. Create buildScene4() method following the pattern above
  // 2. Position it at z=-300 to z=-400 (or similar)
  // 3. Set this.scene4Generated = false in constructor
  // 4. Add generation trigger in update() method
  // ================================

  update(userPosition) {
    if (!userPosition) return;

    // Update subtitles based on camera position while moving through MainScene.
    subtitleManager.update(userPosition.z);
    
    // Update archive images based on camera position
    archiveImagesManager.update(userPosition.z);

    // Update timeline progress indicator
    if (window.updateTimelineProgress) {
      window.updateTimelineProgress(userPosition.z);
    }

    // Determine current scene based on Z position
    let newScene = 1;
    if (userPosition.z < -100) {
      newScene = 2;
    }
    if (userPosition.z < -200) {
      newScene = 3;
    }
    
    // Update timeline if scene changed
    if (newScene !== this.currentScene) {
      this.currentScene = newScene;
      if (window.updateTimeline) {
        window.updateTimeline(this.currentScene);
      }
    }

    // Generate Scene 2 when approaching (10 units before boundary)
    if (!this.scene2Generated && userPosition.z < -90) {
      this.buildScene2();
    }

    // Generate Scene 3 when approaching (10 units before boundary)
    if (!this.scene3Generated && userPosition.z < -190) {
      this.buildScene3();
    }

    // Generate Scene 4 when approaching (10 units before boundary)
    if (!this.scene4Generated && userPosition.z < -290) {
      this.buildScene4();
    }

    // Generate Scene 5 when approaching (10 units before boundary)
    if (!this.scene5Generated && userPosition.z < -390) {
      this.buildScene5();
    }

    // Procedural tree batch generation for Scene 2
    if (this.treeConfig && this.scene2Generated) {
      const { batchSize, batchCount, scene2Start } = this.treeConfig;
      
      for (let batch = 0; batch < batchCount; batch++) {
        const batchStartZ = scene2Start - (batch * batchSize);
        const batchEndZ = batchStartZ - batchSize;
        
        // Generate batch if player is within 30 units
        if (!this.treeBatches[batch] && 
            userPosition.z < batchStartZ + 30 && 
            userPosition.z > batchEndZ - 30) {
          this.generateTreeBatch(batch);
        }
      }
    }

    // Procedural grass batch generation for Scene 2
    if (this.grassConfig && this.scene2Generated) {
      const { batchSize: grassBatchSize, batchCount: grassBatchCount, scene2Start: grassScene2Start } = this.grassConfig;
      
      for (let batch = 0; batch < grassBatchCount; batch++) {
        const batchStartZ = grassScene2Start - (batch * grassBatchSize);
        const batchEndZ = batchStartZ - grassBatchSize;
        
        // Generate batch if player is within 30 units
        if (!this.grassBatches[batch] && 
            userPosition.z < batchStartZ + 30 && 
            userPosition.z > batchEndZ - 30) {
          this.generateGrassBatch(batch);
        }
      }
    }

    // Scale trees based on proximity to user
    this.trees.forEach((tree) => {
      const distance = Math.abs(tree.position.z - userPosition.z);
      if (distance < 30) {
        // Trees grow larger as you get closer
        const scale = THREE.MathUtils.clamp(0.05 + (1 - distance / 30) * 0.15, 0.05, 0.2);
        tree.scale.setScalar(scale);
      } else {
        tree.scale.setScalar(0.05); // Small when far
      }
    });
  }
}
