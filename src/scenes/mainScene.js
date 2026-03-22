// ================================
// MAIN SCENE - Contains all areas
// Scene 1: Snowy area (z=0 to z=-100)
// Scene 2: Forest area (z=-100 to z=-200)  
// Scene 3: Hilly grassland (z=-200 to z=-300)
// Scene 4: Village area (z=-300 to z=-400)
// ================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';
import { subtitleManager } from '../ui/subtitleManager.js';
import { subtitles } from '../ui/subtitleText.js';
import { archiveImagesManager } from '../ui/archiveImagesManager.js';
import { archiveImages } from '../ui/archiveImagesConfig.js';
import { ShaderGrass, HillyShaderGrass } from '../world/ShaderGrass.js';
import { textDisplayManager } from '../ui/textDisplayManager.js';


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
    this.shaderGrass = null; // Shader-based grass for Scene 2
    this.hillyShaderGrass = null; // Hilly shader grass for Scene 3
    this.houses = [];
    this.scene2Generated = false;
    this.scene3Generated = false;
    this.scene4Generated = false;
    this.scene5Generated = false;
    this.treeBatches = {};
    this.currentScene = 1; // Track which scene the user is in

    // Define sky colors for each scene
    this.sceneColors = [
      {
        // Scene 1: Arctic - Light blue/cyan
        background: new THREE.Color(0xe4faff),
        fog: new THREE.Color(0x87ceeb),
        zStart: 50,
        zEnd: -100
      },
      {
        // Scene 2: Forest 
        background: new THREE.Color(0xBDF6FE),
        fog: new THREE.Color(0x6b7c6b),
        zStart: -100,
        zEnd: -200
      },
      {
        // Scene 3: Village - Warm orange/brown sunset
        background: new THREE.Color(0xd4a574),
        fog: new THREE.Color(0xb08855),
        zStart: -200,
        zEnd: -300
      },
      {
        // Scene 4: Dark purple/gray dusk
        background: new THREE.Color(0x6b5b7a),
        fog: new THREE.Color(0x4a3d54),
        zStart: -300,
        zEnd: -450
      }
    ];

    // Scene appearance - start with Scene 1 colors
    this.background = new THREE.Color(0xe4faff);
    this.fog = new THREE.Fog(0x87ceeb, 2, 120);

    // Set camera start position at the igloo (Scene 1)
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, -20);
    
    // Reset rotation to face forward (negative Z) after lookAt
    // This ensures rotation limits work symmetrically
    camera.rotation.set(0, 0, 0);

    // Restrict camera movement
    this.restrictCamera = (camera) => {
      const pathHalfWidth = 5; // Keep user on 10-unit wide path
      camera.position.x = Math.max(-pathHalfWidth, Math.min(pathHalfWidth, camera.position.x));
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

    // Load subtitles for Scene 1 (Arctic/Igloo area)
    subtitleManager.loadSubtitles(subtitles.scene1);
    subtitleManager.update(camera.position.z);
    
    // Initialize and load archive images for MainScene
    archiveImagesManager.init(this); // Pass the scene to the manager
    archiveImagesManager.loadImages(archiveImages.mainScene);
    archiveImagesManager.update(camera.position.z);
    
    // Initialize text display manager
    textDisplayManager.init(this, camera);
    
    // Load bulk text displays with trigger points
      const bulkTextDisplays = [
         {
           trigger: -100, // Between Scene 1 and 2
           text: subtitles.bulkText1[0].text,
           direction: 'left',
           image: './imgs/breakText1.png'
         },
    //   {
    //     trigger: -200, // Between Scene 2 and 3
    //     text: subtitles.bulkText2[0].text,
    //     direction: 'right'
    //   },
    //   {
    //     trigger: -300, // Between Scene 3 and 4
    //     text: subtitles.bulkText3[0].text,
    //     direction: 'left'
    //   }
       ];
       textDisplayManager.loadTextDisplays(bulkTextDisplays);
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
        map: snowTexture
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
    stoneTexture.anisotropy = 10;

    const ground2 = new THREE.Mesh(
      new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
      new THREE.MeshStandardMaterial({
        map: stoneTexture
     })
    );
    ground2.rotation.x = -Math.PI / 2;
    ground2.position.set(0, -0.01, scene2Z);
    this.add(ground2);

    // Initialize procedural tree generation
    this.initializeTreeGeneration();
    
    // Add shader-based grass
    this.shaderGrass = new ShaderGrass(this.areaWidth, this.areaLength, scene2Z);
    const grassMesh = this.shaderGrass.getMesh();
    this.add(grassMesh);
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
  // SCENE 3: Hilly Grassland
  // Position: z=-200 to z=-300
  // Green to yellow grass on rolling hills
  // ================================
  buildScene3() {
    if (this.scene3Generated) return;
    this.scene3Generated = true;

    const scene3Z = -250; // Center of Scene 3

    // Create hilly grassland with shader grass
    this.hillyShaderGrass = new HillyShaderGrass(this.areaWidth, this.areaLength, scene3Z);
    const terrain = this.hillyShaderGrass.getTerrain();
    const grassMesh = this.hillyShaderGrass.getMesh();
    this.add(terrain);
    this.add(grassMesh);
  }

  // ================================
  // SCENE 4: Village Area
  // Position: z=-300 to z=-400
  // Village with houses
  // ================================
  buildScene4() {
    if (this.scene4Generated) return;
    this.scene4Generated = true;

    const scene4Z = -350; // Center of Scene 4

    // Ground with dirt texture
    const textureLoader = new THREE.TextureLoader();
    const dirtTexture = textureLoader.load('./models/claycrack.jpg');
    dirtTexture.wrapS = dirtTexture.wrapT = THREE.RepeatWrapping;
    dirtTexture.repeat.set(10, 10);
    dirtTexture.anisotropy = 16;

    const ground4 = new THREE.Mesh(
      new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
      new THREE.MeshStandardMaterial({
        map: dirtTexture
      })
    );
    ground4.rotation.x = -Math.PI / 2;
    ground4.position.set(0, -0.01, scene4Z);
    this.add(ground4);

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
      const startZ = scene4Z + 40;
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

  // ================================
  // SKY COLOR TRANSITION
  // Smoothly interpolates background and fog colors between scenes
  // ================================
  updateSkyColors(zPosition) {
    // Find which scene transition zone we're in
    let currentZoneIndex = 0;
    let nextZoneIndex = 1;
    
    // Determine the current and next color zones
    for (let i = 0; i < this.sceneColors.length; i++) {
      if (zPosition >= this.sceneColors[i].zEnd) {
        currentZoneIndex = i;
        nextZoneIndex = Math.min(i + 1, this.sceneColors.length - 1);
        break;
      }
    }
    
    const currentZone = this.sceneColors[currentZoneIndex];
    const nextZone = this.sceneColors[nextZoneIndex];
    
    // Calculate transition progress (0 to 1)
    // Transition starts 20 units before the boundary
    const transitionDistance = 20;
    const boundary = currentZone.zEnd;
    const transitionStart = boundary + transitionDistance;
    
    let t = 0; // transition factor (0 = current scene, 1 = next scene)
    
    if (zPosition < transitionStart && zPosition > boundary) {
      // We're in the transition zone
      t = 1 - (zPosition - boundary) / transitionDistance;
      t = Math.max(0, Math.min(1, t)); // clamp to 0-1
      
      // Smooth step easing for smoother transition
      t = t * t * (3 - 2 * t);
      
      // Interpolate background color
      this.background.lerpColors(currentZone.background, nextZone.background, t);
      
      // Interpolate fog color
      this.fog.color.lerpColors(currentZone.fog, nextZone.fog, t);
    } else if (zPosition <= boundary) {
      // Past the boundary, use next zone colors
      this.background.copy(nextZone.background);
      this.fog.color.copy(nextZone.fog);
    } else {
      // Before transition, use current zone colors
      this.background.copy(currentZone.background);
      this.fog.color.copy(currentZone.fog);
    }
  }

  update(userPosition, deltaTime = 0.016) {
    if (!userPosition) return;

    // Update text display manager (for bulk text animations)
    textDisplayManager.update(userPosition.z, deltaTime);

    // Update sky colors based on position
    this.updateSkyColors(userPosition.z);

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
    if (userPosition.z < -300) {
      newScene = 4;
    }
    if (userPosition.z < -400) {
      newScene = 5;
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
      // Load Scene 2 subtitles
      subtitleManager.loadSubtitles(subtitles.scene2);
    }

    // Generate Scene 3 when approaching (10 units before boundary)
    if (!this.scene3Generated && userPosition.z < -190) {
      this.buildScene3();
      // Load Scene 3 subtitles (combine both parts)
      const scene3Subs = [...subtitles.scene3, ...subtitles.scene3Part2];
      subtitleManager.loadSubtitles(scene3Subs);
    }

    // Generate Scene 4 when approaching (10 units before boundary)
    if (!this.scene4Generated && userPosition.z < -290) {
      this.buildScene4();
      // Load Scene 4 subtitles
      subtitleManager.loadSubtitles(subtitles.scene4);
    }

    // Generate Scene 5 when approaching (10 units before boundary)
    if (!this.scene5Generated && userPosition.z < -390) {
      this.buildScene5();
      // Load Scene 5 subtitles
      subtitleManager.loadSubtitles(subtitles.scene5);
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

    // Update shader grass wind animation
    if (this.shaderGrass) {
      this.shaderGrass.update(deltaTime);
    }
    
    // Update hilly shader grass wind animation
    if (this.hillyShaderGrass) {
      this.hillyShaderGrass.update(deltaTime);
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
