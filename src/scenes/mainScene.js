// ================================
// MAIN SCENE - Contains all areas
// Scene 1: Snowy area (z=0 to z=-100)
// Scene 2: Forest area (z=-100 to z=-200)  
// Scene 3: Hilly grassland (z=-200 to z=-300)
// Scene 4: Mountain pass (z=-300 to z=-400)
// ================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';
import { subtitleManager } from '../ui/subtitleManager.js';
import { subtitles } from '../ui/subtitleText.js';
import { archiveImagesManager } from '../ui/archiveImagesManager.js';
import { archiveImages } from '../ui/archiveImagesConfig.js';
import { ShaderGrass, HillyShaderGrass } from '../world/ShaderGrass.js';
import { OceanShader } from '../world/OceanShader.js';
// import { textDisplayManager } from '../ui/textDisplayManager.js';


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
    this.tropicalTrees = []; // Tropical trees for Scene 5 (unused now - ocean scene)
    this.scene6Trees = []; // Tropical trees for Scene 6
    this.shaderGrass = null; // Shader-based grass for Scene 2
    this.hillyShaderGrass = null; // Hilly shader grass for Scene 3
    this.oceanShader = null; // Ocean shader for Scene 5
    this.rainSystem6 = null; // Rain particles for Scene 6
    this.houses = [];
    this.scene2Generated = false;
    this.scene3Generated = false;
    this.scene4Generated = false;
    this.scene5Generated = false;
    this.scene6Generated = false;
    this.treeBatches = {};
    this.tropicalTreeBatches = {}; // Unused for Scene 5 (ocean) - kept for compatibility
    this.scene6TreeBatches = {}; // Batches for tropical trees in Scene 6
    this.currentScene = 1; // Track which scene the user is in

    // Define sky colors for each scene
    this.sceneColors = [
      {
        // Scene 1: Arctic - Light blue/cyan
        background: new THREE.Color(0xe4faff),
        fog: new THREE.Color(0x87ceeb),
        fogNear: 2,
        fogFar: 120,
        zStart: 50,
        zEnd: -100
      },
      {
        // Scene 2: Forest 
        background: new THREE.Color(0xBDF6FE),
        fog: new THREE.Color(0x6b7c6b),
        fogNear: 2,
        fogFar: 120,
        zStart: -100,
        zEnd: -200
      },
      {
        // Scene 3: Village - Warm orange/brown sunset
        background: new THREE.Color(0xd4a574),
        fog: new THREE.Color(0xb08855),
        fogNear: 2,
        fogFar: 120,
        zStart: -200,
        zEnd: -300
      },
      {
        // Scene 4: Mountain pass
        background: new THREE.Color(0xe4faff),
        fog: new THREE.Color(0xe4faff),
        fogNear: 10000, // Very far away
        fogFar: 10000, // Very far away
        zStart: -300,
        zEnd: -400
      },
      {
        // Scene 5: Ocean - Clear atmosphere with neutral weak fog
        background: new THREE.Color(0x87ceeb), // Blue sky
        fog: new THREE.Color(0xb0c4de), // Light steel blue - neutral and subtle
        fogNear: 30,
        fogFar: 200,
        zStart: -400,
        zEnd: -500
      },
      {
        // Scene 6: Tropical Rainforest - Rainy blue/gray atmosphere
        background: new THREE.Color(0x8b9da8),
        fog: new THREE.Color(0x6b7d87),
        fogNear: 2,
        fogFar: 1200,
        zStart: -500,
        zEnd: -600
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
      camera.position.z = Math.max(-600, Math.min(50, camera.position.z)); // Allow movement through all 6 scenes
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
    // textDisplayManager.init(this, camera);
    
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
       // textDisplayManager.loadTextDisplays(bulkTextDisplays);
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
          
          // Create narrow walls on each side of the path (5 units wide, right alongside path)
          const wallWidth = 5;
          
          if (placeOnLeft) {
            // Left wall: from -5 (path edge) extending left 5 units to -10
            x = -(this.pathWidth / 2) - Math.random() * wallWidth;
          } else {
            // Right wall: from +5 (path edge) extending right 5 units to +10
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
  // SCENE 4: Mountain Pass Area
  // Position: z=-300 to z=-400
  // Rocky cliffs on sides similar to Scene 1 ice walls
  // ================================
  buildScene4() {
    if (this.scene4Generated) return;
    this.scene4Generated = true;

    const scene4Z = -350; // Center of Scene 4

    // Ground with dirt/rock texture
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

    // Load cliff/mountain rock models for sides (similar to Scene 1 ice walls)
    const loader = new GLTFLoader();
    
    loader.load('./models/cliff_rock_boulder_field.glb', (gltf) => {
      // Left cliff - 7.5 units from center
      const cliffLeft = gltf.scene.clone();
      cliffLeft.position.set(-15, -4, -300);
      cliffLeft.rotation.y = Math.PI / 2 + 0.3; // Rotated counterclockwise
      cliffLeft.scale.set(0.25, 0.5, 0.25);
      this.add(cliffLeft);

      // Right cliff - 7.5 units from center (mirrored)
      const cliffRight = gltf.scene.clone();
      cliffRight.position.set(15, -4, -400);
      cliffRight.rotation.y = -Math.PI / 2 + 0.3; // Rotated counterclockwise
      cliffRight.scale.set(0.25, 0.5, 0.25);
      this.add(cliffRight);
    });
    
    // Beach sand models at the end of Scene 4 (transition to ocean)
    loader.load('./models/beach_sand_photoscan.glb', (gltf) => {
      // Left beach sand
      const sandLeft = gltf.scene.clone();
      sandLeft.position.set(-15, -2, -385);
      sandLeft.scale.set(2, 2, 2.25);
      this.add(sandLeft);

      // Right beach sand
      const sandRight = gltf.scene.clone();
      sandRight.position.set(-5, -2.25, -368);
      sandRight.rotation.y = Math.PI / 2 ; // Rotate to face opposite direction
      sandRight.scale.set(1.6, 1.6, 1.6);
      this.add(sandRight);
    });
  }


  // ================================
  // SCENE 5: Ocean
  // Position: z=-400 to z=-500
  // Full-screen ocean shader effect
  // ================================
  buildScene5() {
    if (this.scene5Generated) return;
    this.scene5Generated = true;   
    
    // Create ocean shader - fills entire scene with animated water
    this.oceanShader = new OceanShader();
    this.add(this.oceanShader.getMesh());
    
    // Volcano island configurations
    // Easily customize position, rotation, and scale for each island
    const volcanoConfigs = [
      {
        file: 'kohala_volcano_hawaii.glb',
        position: { x: 30, y: -3, z: -455 },
        rotation: { x: 0, y: Math.PI / 3 + .95, z: 0 },
        scale: { x: .0048, y: .006 , z: .002 }
      },

      {
        file: 'kohala_volcano_hawaii.glb',
        position: { x: -35, y: -2.5, z: -455 },
        rotation: { x: 0, y: -Math.PI/4 - 1, z: 0 },
        scale: { x: .0048, y: .006 , z: .002 }
      }
    ];
    
    // Load and place volcano islands
    const loader = new GLTFLoader();
    volcanoConfigs.forEach(config => {
      loader.load(
        `./models/${config.file}`,
        (gltf) => {
          const volcano = gltf.scene;
          volcano.position.set(config.position.x, config.position.y, config.position.z);
          volcano.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
          volcano.scale.set(config.scale.x, config.scale.y, config.scale.z);
          this.add(volcano);
          console.log(`Loaded ${config.file} successfully at`, volcano.position);
        },
        undefined,
        (error) => {
          console.error(`Error loading ${config.file}:`, error);
        }
      );
    });
  }

  // ================================
  // SCENE 6: Tropical Rainforest
  // Position: z=-500 to z=-600
  // Generates procedurally with tropical trees
  // ================================
  buildScene6() {
    if (this.scene6Generated) return;
    this.scene6Generated = true;   
    
    const scene6Z = -550; // Center of Scene 6
    
    // Ground with tropical/earthy texture
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('./models/stone_texture.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);
    groundTexture.anisotropy = 10;

    const ground6 = new THREE.Mesh(
      new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
      new THREE.MeshStandardMaterial({
        map: groundTexture,
        color: 0x4a6741 // Darker green-brown tint for rainforest floor
      })
    );
    ground6.rotation.x = -Math.PI / 2;
    ground6.position.set(0, -0.01, scene6Z);
    this.add(ground6);
    
    // Initialize procedural tropical tree generation
    this.initializeScene6TreeGeneration();
    
    // Create rain effect
    this.createRainEffect6();
  }
  
  createRainEffect6() {
    const rainCount = 2000;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 6);
    const rainVelocities = new Float32Array(rainCount);
    
    const lineLength = 0.5;
    
    for (let i = 0; i < rainCount; i++) {
      const i6 = i * 6;
      const x = (Math.random() - 0.5) * 50;
      const y = Math.random() * 30 + 5;
      const z = (Math.random() - 0.5) * 50 - 550;
      
      rainPositions[i6] = x;
      rainPositions[i6 + 1] = y;
      rainPositions[i6 + 2] = z;
      
      rainPositions[i6 + 3] = x;
      rainPositions[i6 + 4] = y - lineLength;
      rainPositions[i6 + 5] = z;
      
      rainVelocities[i] = Math.random() * 0.3 + 0.5;
    }
    
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));
    
    const rainMaterial = new THREE.LineBasicMaterial({
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.6
    });
    
    this.rainSystem6 = new THREE.LineSegments(rainGeometry, rainMaterial);
    this.add(this.rainSystem6);
  }

  initializeScene6TreeGeneration() {
    const batchSize = 40;
    const scene6Start = -500;
    const scene6End = -600;
    const batchCount = Math.ceil((scene6End - scene6Start) / -batchSize);

    for (let batch = 0; batch < batchCount; batch++) {
      this.scene6TreeBatches[batch] = false;
    }

    this.scene6TreeConfig = {
      models: [
        { file: 'tropical_tree2.glb', yOffset: 0, scale: 0.5 },
       // { file: 'tropicaltree3.glb', yOffset: -1, scale: 0.15 }
      ],
      batchSize: batchSize,
      batchCount: batchCount,
      scene6Start: scene6Start
    };
  }

  generateScene6TreeBatch(batchIndex) {
    if (this.scene6TreeBatches[batchIndex]) return;
    this.scene6TreeBatches[batchIndex] = true;

    const { models, batchSize, scene6Start } = this.scene6TreeConfig;
    const loader = new GLTFLoader();
    
    const batchStartZ = scene6Start - (batchIndex * batchSize);
    const batchEndZ = batchStartZ - batchSize;

    models.forEach((modelConfig) => {
      loader.load(`./models/${modelConfig.file}`, (gltf) => {
        for (let i = 0; i < 12; i++) {
          const placeOnLeft = Math.random() > 0.5;
          let x, z;
          
          const wallWidth = 5;
          
          if (placeOnLeft) {
            x = -(this.pathWidth / 2) - Math.random() * wallWidth;
          } else {
            x = (this.pathWidth / 2) + Math.random() * wallWidth;
          }
          
          const baseZ = batchStartZ - (i * batchSize / 12);
          const zOffset = (Math.random() - 0.5) * 4;
          z = baseZ + zOffset;

          const tree = gltf.scene.clone();
          tree.position.set(x, 0 + modelConfig.yOffset, z);
          tree.rotation.y = Math.random() * Math.PI * 2;
          
          const treeScale = modelConfig.scale || 0.05;
          tree.scale.setScalar(treeScale);
          
          tree.userData.baseScale = treeScale;
          
          this.add(tree);
          this.scene6Trees.push(tree);
        }
      });
    });
  }
  
  // ================================
  // CAMERA TERRAIN FOLLOWING
  // ================================
  adjustCameraHeightForTerrain(cameraPosition) {
    const baseHeight = 1.6; // Normal camera height above ground
    let terrainHeight = 0;
    
    // Scene 3: Hilly grassland (z=-200 to z=-300)
    if (cameraPosition.z < -200 && cameraPosition.z > -300 && this.hillyShaderGrass) {
      terrainHeight = this.hillyShaderGrass.getTerrainHeight(cameraPosition.x, cameraPosition.z);
    }
    // Scene 4: River valley (z=-300 to z=-400)
    else if (cameraPosition.z < -300 && cameraPosition.z > -400) {
      terrainHeight = this.getScene4TerrainHeight(cameraPosition.x, cameraPosition.z);
    }
    
    // Smoothly adjust camera height
    const targetHeight = terrainHeight + baseHeight;
    cameraPosition.y = targetHeight;
  }
  
  // Get terrain height for Scene 4 (river valley)
  getScene4TerrainHeight(x, z) {
    const scene4Start = -300;
    const hillAmplitude = 5;
    const hillFrequency = 0.02;
    const riverHalfWidth = 2.5;
    
    // If in river area, return river level (lower)
    if (Math.abs(x) < riverHalfWidth) {
      return -0.5; // River is below ground
    }
    
    // Calculate hill height (matching terrain generation)
    const heightZ = (Math.sin(z * hillFrequency) + 1) * hillAmplitude / 2;
    const distanceFromRiver = Math.abs(x) - riverHalfWidth;
    const heightX = Math.sin(distanceFromRiver * 0.1) * hillAmplitude * 0.3;
    
    return heightZ + heightX;
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
      
      // Interpolate fog distances
      this.fog.near = currentZone.fogNear + (nextZone.fogNear - currentZone.fogNear) * t;
      this.fog.far = currentZone.fogFar + (nextZone.fogFar - currentZone.fogFar) * t;
    } else if (zPosition <= boundary) {
      // Past the boundary, use next zone colors
      this.background.copy(nextZone.background);
      this.fog.color.copy(nextZone.fog);
      this.fog.near = nextZone.fogNear;
      this.fog.far = nextZone.fogFar;
    } else {
      // Before transition, use current zone colors
      this.background.copy(currentZone.background);
      this.fog.color.copy(currentZone.fog);
      this.fog.near = currentZone.fogNear;
      this.fog.far = currentZone.fogFar;
    }
  }

  update(userPosition, deltaTime = 0.016, renderer = null) {
    if (!userPosition) return;

    // Update text display manager (for bulk text animations)
    // textDisplayManager.update(userPosition.z, deltaTime);

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
    if (userPosition.z < -500) {
      newScene = 6;
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

    // Generate Scene 4 early (when entering Scene 3) so it's visible in the distance
    if (!this.scene4Generated && userPosition.z < -210) {
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

    // Generate Scene 6 when approaching (10 units before boundary)
    if (!this.scene6Generated && userPosition.z < -490) {
      this.buildScene6();
      // Load Scene 6 subtitles
      subtitleManager.loadSubtitles(subtitles.scene6);
    }

    // Procedural tree batch generation for Scene 2
    if (this.treeConfig && this.scene2Generated) {
      const { batchSize, batchCount, scene2Start } = this.treeConfig;
      
      for (let batch = 0; batch < batchCount; batch++) {
        const batchStartZ = scene2Start - (batch * batchSize);
        const batchEndZ = batchStartZ - batchSize;
        
        // Generate batch if player is within 10 units
        if (!this.treeBatches[batch] && 
            userPosition.z < batchStartZ + 10 && 
            userPosition.z > batchEndZ - 10) {
          this.generateTreeBatch(batch);
        }
      }
    }

    // Procedural tropical tree batch generation for Scene 6
    if (this.scene6TreeConfig && this.scene6Generated) {
      const { batchSize, batchCount, scene6Start } = this.scene6TreeConfig;
      
      for (let batch = 0; batch < batchCount; batch++) {
        const batchStartZ = scene6Start - (batch * batchSize);
        const batchEndZ = batchStartZ - batchSize;
        
        // Generate batch if player is within 10 units
        if (!this.scene6TreeBatches[batch] && 
            userPosition.z < batchStartZ + 10 && 
            userPosition.z > batchEndZ - 10) {
          this.generateScene6TreeBatch(batch);
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
    
    // Update ocean shader (Scene 5)
    if (this.oceanShader) {
      this.oceanShader.update(deltaTime);
    }
    
    // Update rain effect (Scene 6)
    if (this.rainSystem6 && userPosition.z < -480 && userPosition.z > -620) {
      const positions = this.rainSystem6.geometry.attributes.position.array;
      const velocities = this.rainSystem6.geometry.attributes.velocity.array;
      const lineLength = 0.5;
      
      const lineCount = positions.length / 6;
      
      for (let i = 0; i < lineCount; i++) {
        const i6 = i * 6;
        
        positions[i6 + 1] -= velocities[i] * 60 * deltaTime;
        positions[i6 + 4] -= velocities[i] * 60 * deltaTime;
        
        if (positions[i6 + 4] < 0) {
          const x = userPosition.x + (Math.random() - 0.5) * 50;
          const y = 30 + Math.random() * 10;
          const z = userPosition.z + (Math.random() - 0.5) * 50;
          
          positions[i6] = x;
          positions[i6 + 1] = y;
          positions[i6 + 2] = z;
          
          positions[i6 + 3] = x;
          positions[i6 + 4] = y - lineLength;
          positions[i6 + 5] = z;
        }
      }
      
      this.rainSystem6.geometry.attributes.position.needsUpdate = true;
    }
    
    // Adjust camera height to follow terrain in Scene 3
    if (userPosition.z < -200 && userPosition.z > -300 && this.hillyShaderGrass) {
      const terrainHeight = this.hillyShaderGrass.getTerrainHeight(userPosition.x, userPosition.z);
      const baseHeight = 1.6; // Normal camera height above ground
      userPosition.y = terrainHeight + baseHeight;
    }

    // Scale trees based on proximity to user (Scene 2)
    this.trees.forEach((tree) => {
      const distance = Math.abs(tree.position.z - userPosition.z);
      if (distance < 10) {
        // Trees grow larger as you get closer
        const scale = THREE.MathUtils.clamp(0.05 + (1 - distance / 10) * 0.15, 0.05, 0.2);
        tree.scale.setScalar(scale);
      } else {
        tree.scale.setScalar(0.05); // Small when far
      }
    });

    // Scale tropical trees based on proximity to user (Scene 6)
    this.scene6Trees.forEach((tree) => {
      const distance = Math.abs(tree.position.z - userPosition.z);
      const baseScale = tree.userData.baseScale || 0.05;
      
      if (distance < 10) {
        const growthMultiplier = 1 + (1 - distance / 10) * 3;
        const scale = baseScale * growthMultiplier;
        tree.scale.setScalar(scale);
      } else {
        tree.scale.setScalar(baseScale);
      }
    });
  }
}
