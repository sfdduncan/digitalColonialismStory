import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { SceneBase } from './SceneBase.js';
import { subtitleManager } from '../ui/subtitleManager.js';
import { subtitles } from '../ui/subtitleText.js';
import { archiveImagesManager } from '../ui/archiveImagesManager.js';
import { archiveImages } from '../ui/archiveImagesConfig.js';
import { ShaderGrass, HillyShaderGrass } from '../world/ShaderGrass.js';
import { OceanShader } from '../world/OceanShader.js';
import { CloudShader } from '../world/CloudShader.js';
import { hackImages, hackVideos, hackBackgroundVideo } from './hackImageConfig.js';
import { sceneAudioManager } from '../ui/sceneAudioManager.js';
import { mainSceneAudioZones } from '../ui/sceneAudioConfig.js';
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
    this.tropicalTrees = []; // Tropical trees for Scene 5 (unused now - ocean scene)
    this.scene6Trees = []; // Tropical trees for Scene 6
    this.shaderGrass = null; // Shader-based grass for Scene 2
    this.hillyShaderGrass = null; // Hilly shader grass for Scene 3
    this.oceanShader = null; // Ocean shader for Scene 5
    this.cloudShader = null; // Cloud shader for Scene 5
    this.rainSystem6 = null; // Rain particles for Scene 6
    this.houses = [];
    
    // Polar bear family (mom and two cubs)
    this.polarBears = []; // Array of {mesh, mixer, startX, targetX, speed, moving}
    this.polarBearTriggered = false; // Track if bear family has been triggered
    
    // Scene 7 (hack corridor) tracking
    this.scene7ImageWalls = [];
    this.scene7ImageTextures = [];
    this.scene7VideoElements = []; // Track all video elements for cleanup
    this.scene7LastUsedTextures = new Map(); // Track last used textures to avoid repetition
    
    // Scene object tracking for disposal
    this.scene1Objects = [];
    this.scene2Objects = [];
    this.scene3Objects = [];
    this.scene4Objects = [];
    this.scene5Objects = [];
    this.scene6Objects = [];
    this.scene7Objects = [];
    
    this.scene1Disposed = false;
    this.scene2Disposed = false;
    this.scene3Disposed = false;
    this.scene4Disposed = false;
    this.scene5Disposed = false;
    this.scene6Disposed = false;
    
    this.scene2Generated = false;
    this.scene3Generated = false;
    this.scene4Generated = false;
    this.scene5Generated = false;
    this.scene6Generated = false;
    this.scene7Generated = false;
    this.endCreditsShown = false;
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
        fogNear: 10000,
        fogFar: 10000,
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
        // Scene 6: Tropical Rainforest - Dusk
        background: new THREE.Color(0x1a2d45),   // Deep navy, darker than ocean, trending toward Scene 7's black
        fog: new THREE.Color(0x2a4a3a),          // Dark teal-green, feels like dense canopy mist
        fogNear: 2,
        fogFar: 55,                              // Tighter than other scenes — dense forest
        zStart: -500,
        zEnd: -600
      },
      {
        // Scene 7: Dark corridor (hack scene) - Return to digital
        background: new THREE.Color(0x050505),
        fog: new THREE.Color(0x050505),
        fogNear: 20,
        fogFar: 60,
        zStart: -600,
        zEnd: -700
      }
    ];

    // Scene appearance - start with Scene 1 colors
    this.background = new THREE.Color(0xe4faff);
    this.fog = new THREE.Fog(0x87ceeb, 2, 120);

;

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
    this.buildScene1();

    // Load subtitles for Scene 1 (Arctic/Igloo area)
    subtitleManager.loadSubtitles(subtitles.scene1);
    // Note: Don't call update() here - will be called in game loop with correct camera position
    
    // Load audio zones for MainScene
    sceneAudioManager.loadAudioZones(mainSceneAudioZones);
    // Note: Don't call update() here - will be called in game loop with correct camera position
    
    // Initialize and load archive images for MainScene
    archiveImagesManager.clear(); // Clear any previous state
    archiveImagesManager.init(this, camera); // Pass the scene and camera to the manager
    archiveImagesManager.loadImages(archiveImages.mainScene);
    // Note: Don't call update() here - camera position will be reset after transition
    // The first update() will be called in the game loop with the correct camera position
    
    // Initialize text display manager
    textDisplayManager.init(this, camera);

    const getBreakText = (key, fallbackSceneKey) => {
      const bulkEntry = subtitles[key]?.[0]?.text;
      const fallbackEntry = subtitles[fallbackSceneKey]?.[0]?.text;
      return bulkEntry || fallbackEntry || '';
    };
    
    // Bulk text overlays are temporarily disabled.
    // Restore the commented entries below to re-enable between-scene break text.
    const bulkTextDisplays = [];
    /*
    const bulkTextDisplays = [
      {
        trigger: -100, // Between Scene 1 and 2
        text: getBreakText('bulkText1', 'scene2'),
        direction: 'left',
        image: './imgs/breakText1.png'
      },
      {
        trigger: -200, // Between Scene 2 and 3
        text: getBreakText('bulkText2', 'scene3'),
        direction: 'right',
        image: './imgs/breakText2.png'
      },
      {
        trigger: -300, // Between Scene 3 and 4
        text: getBreakText('bulkText3', 'scene4'),
        direction: 'left',
        image: './imgs/breakText3.png'
      }
    ];
    */
    textDisplayManager.loadTextDisplays(bulkTextDisplays);
  }

  // Scene 1: Snowy Ice Area (z=0 to z=-100)
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
        emissiveIntensity: 0.4, 
        emissive: new THREE.Color(0x0fefefe) // cyan 
      })
    );
    ground1.rotation.x = -Math.PI / 2;
    ground1.position.set(0, -0.01, scene1Z);
    this.add(ground1);
    this.scene1Objects.push(ground1);

    // Load models
    const loader = new GLTFLoader();

    // Igloo at the starting point
    loader.load('./models/igloo.glb', (gltf) => {
      const igloo = gltf.scene;
      igloo.position.set(0, .5, -5);
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
      this.scene1Objects.push(igloo);
    });

    // Ice walls on sides
    loader.load('./models/wall_of_ice.glb', (gltf) => {
      const wall1 = gltf.scene.clone();
      wall1.position.set(-25, -2.5, scene1Z);
      wall1.rotation.y = Math.PI / 2;
      wall1.scale.set(1.6, 2, 5);
      this.add(wall1);
      this.scene1Objects.push(wall1);

      const wall2 = gltf.scene.clone();
      wall2.position.set(25, -2.5, scene1Z);
      wall2.rotation.y = -Math.PI / 2;
      wall2.scale.set(1.6, 2, 5);
      this.add(wall2);
      this.scene1Objects.push(wall2);
    });
  }

  // Scene 2: Forest Area (z=-100 to z=-200) - Generates procedurally
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
    this.scene2Objects.push(ground2);

    // Initialize procedural tree generation
    this.initializeTreeGeneration();
    
    // Add shader-based grass
    this.shaderGrass = new ShaderGrass(this.areaWidth, this.areaLength, scene2Z);
    const grassMesh = this.shaderGrass.getMesh();
    this.add(grassMesh);
  }

  initializeTreeGeneration() {
    // Setup for batch-based procedural tree generation
    const batchSize = 15; // Each batch covers 15 units in z
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
          // Calculate z position first to check for clear zones
          const baseZ = batchStartZ - (i * batchSize / 15);
          const zOffset = (Math.random() - 0.5) * 4;
          const z = baseZ + zOffset;
          
          // Check if we're in a breakText zone - wider path for floating images
          const inBreakTextZone = (z > -115 && z < -90) || (z > -210 && z < -190) || (z > -310 && z < -290);
          
          // Randomly choose left or right side
          const placeOnLeft = Math.random() > 0.5;
          let x;
          
          if (inBreakTextZone) {
            // Wider gap (30 units total) for breakText zones
            const breakTextPathHalfWidth = 20; // 30 units wide total
            const wallWidth = 5;
            
            if (placeOnLeft) {
              // Left wall: starts at -15, extends left 5 units to -20
              x = -breakTextPathHalfWidth - Math.random() * wallWidth;
            } else {
              // Right wall: starts at +15, extends right 5 units to +20
              x = breakTextPathHalfWidth + Math.random() * wallWidth;
            }
          } else {
            // Normal narrow walls (10 units wide path)
            const wallWidth = 5;
            
            if (placeOnLeft) {
              // Left wall: from -5 (path edge) extending left 5 units to -10
              x = -(this.pathWidth / 2) - Math.random() * wallWidth;
            } else {
              // Right wall: from +5 (path edge) extending right 5 units to +10
              x = (this.pathWidth / 2) + Math.random() * wallWidth;
            }
          }

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

  // Scene 3: Hilly Grassland (z=-200 to z=-300) - Green to yellow grass on rolling hills
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

  // Scene 4: Mountain Pass Area (z=-300 to z=-400) - Rocky cliffs on sides
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
    this.scene4Objects.push(ground4);

    // Load cliff/mountain rock models for sides (similar to Scene 1 ice walls)
    const loader = new GLTFLoader();
    
    loader.load('./models/cliff_rock_boulder_field.glb', (gltf) => {
      // Left cliff - 7.5 units from center
      const cliffLeft = gltf.scene.clone();
      cliffLeft.position.set(-15, -4, -300);
      cliffLeft.rotation.y = Math.PI / 2 + 0.3;
      cliffLeft.scale.set(0.25, 0.65, 0.25);
      this.add(cliffLeft);
      this.scene4Objects.push(cliffLeft);

      // Right cliff - 7.5 units from center (mirrored)
      const cliffRight = gltf.scene.clone();
      cliffRight.position.set(15, -4, -400);
      cliffRight.rotation.y = -Math.PI / 2 + 0.3;
      cliffRight.scale.set(0.25, 0.65, 0.25);
      this.add(cliffRight);
      this.scene4Objects.push(cliffRight);
    });
    
    // Beach sand models at the end of Scene 4 (transition to ocean)
    loader.load('./models/beach_sand_photoscan.glb', (gltf) => {
      // Left beach sand
      const sandLeft = gltf.scene.clone();
      sandLeft.position.set(-15, -2, -385);
      sandLeft.scale.set(2, 2, 2.25);
      this.add(sandLeft);
      this.scene4Objects.push(sandLeft);

      // Right beach sand
      const sandRight = gltf.scene.clone();
      sandRight.position.set(-5, -2.25, -368);
      sandRight.rotation.y = Math.PI / 2 ; // Rotate to face opposite direction
      sandRight.scale.set(1.6, 1.6, 1.6);
      this.add(sandRight);
      this.scene4Objects.push(sandRight);
    });
  }


  // Scene 5: Ocean (z=-400 to z=-500) - Full-screen ocean shader effect
  buildScene5() {
    if (this.scene5Generated) return;
    this.scene5Generated = true;   
    
    // Create ocean shader - fills entire scene with animated water
    this.oceanShader = new OceanShader();
    this.add(this.oceanShader.getMesh());
    
    // Create clouds above the ocean
    this.cloudShader = new CloudShader();
    this.cloudShader.getClouds().forEach(cloud => {
      this.add(cloud);
      this.scene5Objects.push(cloud);
    });
    
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
          this.scene5Objects.push(volcano);
        },
        undefined,
        () => {}
      );
    });
  }

  // Scene 6: Tropical Rainforest (z=-500 to z=-600) - Generates procedurally with tropical trees
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
    this.scene6Objects.push(ground6);
    
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
    const batchSize = 10;
    const scene6Start = -500;
    const scene6End = -600;
    const batchCount = Math.ceil((scene6End - scene6Start) / -batchSize);

    for (let batch = 0; batch < batchCount; batch++) {
      this.scene6TreeBatches[batch] = false;
    }

    this.scene6TreeConfig = {
      models: [
        { file: 'tropical_tree2.glb', yOffset: 0, scale: 0.25 },
        { file: 'jungle_tree (2).glb', yOffset: -1, scale: 0.25 }, 
        { file: 'bushes_tropical.glb', yOffset: 0, scale: 0.25 }
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
          
          const wallWidth = 20;
          
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
  
  // Camera terrain following
  adjustCameraHeightForTerrain(cameraPosition) {
    const baseHeight = 1.7; // Normal camera height above ground
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
  
  // Scene 7: Dark Hack Corridor (z=-600 to z=-700) - Matches the HackScene setup
  async buildScene7() {
    if (this.scene7Generated) return;
    this.scene7Generated = true;

    const scene7Start = -600;
    const corridorLength = 100;
    const wallDistance = 5;
    const imageSpacing = 8;
    const imageHeight = 5;

    // Create background video walls (like HackScene)
    await this.createScene7BackgroundVideoWalls();

    // Load all images and videos
    const textureLoader = new THREE.TextureLoader();
    
    // Load static images (including GIFs)
    const loadPromises = hackImages.map(path => {
      return new Promise(resolve => {
        const isGif = path.toLowerCase().endsWith('.gif');
        
        if (isGif) {
          const img = document.createElement('img');
          img.src = path;
          img.style.display = 'none';
          document.body.appendChild(img);
          
          img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            texture.userData.imagePath = path;
            texture.userData.isAnimated = true;
            texture.userData.imageElement = img;
            resolve(texture);
          };
          img.onerror = () => resolve(null);
        } else {
          textureLoader.load(
            path,
            texture => {
              texture.userData.imagePath = path;
              resolve(texture);
            },
            undefined,
            () => resolve(null)
          );
        }
      });
    });

    const loadedTextures = (await Promise.all(loadPromises)).filter(t => t);

    // Load ALL corridor videos from hackVideos array
    const videoTextures = await Promise.all(hackVideos.map(async (videoPath) => {
      const video = document.createElement('video');
      video.src = videoPath;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.setAttribute('webkit-playsinline', 'true');

      this.scene7VideoElements.push(video);

      try {
        await video.play();
      } catch (_) {}

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.userData.imagePath = videoPath;
      videoTexture.userData.isVideo = true;
      
      return videoTexture;
    }));

    this.scene7ImageTextures = [...loadedTextures, ...videoTextures];

    // Generate image walls
    this.generateScene7ImageWalls(scene7Start, corridorLength, wallDistance, imageSpacing, imageHeight);
  }

  async createScene7BackgroundVideoWalls() {
    // Create video element for background walls
    const bgVideo = document.createElement('video');
    bgVideo.src = hackBackgroundVideo;
    bgVideo.loop = true;
    bgVideo.muted = true;
    bgVideo.playsInline = true;
    bgVideo.autoplay = true;
    bgVideo.setAttribute('webkit-playsinline', 'true');

    this.scene7VideoElements.push(bgVideo);

    try {
      await bgVideo.play();
    } catch (_) {}

    const bgVideoTexture = new THREE.VideoTexture(bgVideo);
    bgVideoTexture.minFilter = THREE.LinearFilter;
    bgVideoTexture.magFilter = THREE.LinearFilter;

    const boxWidth = 30;
    const boxHeight = 20;
    const corridorStart = -600;
    const corridorEnd = -720;
    const boxLength = corridorStart - corridorEnd;
    const boxCenterZ = (corridorStart + corridorEnd) / 2;

    // LEFT WALL
    const leftWallGeo = new THREE.PlaneGeometry(boxLength, boxHeight);
    const leftWallMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture,
      side: THREE.DoubleSide
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-boxWidth / 2, boxHeight / 2, boxCenterZ);
    leftWall.rotation.y = Math.PI / 2;
    this.add(leftWall);
    this.scene7Objects.push(leftWall);

    // RIGHT WALL
    const rightWallGeo = new THREE.PlaneGeometry(boxLength, boxHeight);
    const rightWallMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(boxWidth / 2, boxHeight / 2, boxCenterZ);
    rightWall.rotation.y = -Math.PI / 2;
    this.add(rightWall);
    this.scene7Objects.push(rightWall);

    // FRONT WALL (at corridor start)
    const frontWallGeo = new THREE.PlaneGeometry(boxWidth, boxHeight);
    const frontWallMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const frontWall = new THREE.Mesh(frontWallGeo, frontWallMat);
    frontWall.position.set(0, boxHeight / 2, corridorStart);
    this.add(frontWall);
    this.scene7Objects.push(frontWall);

    // CEILING
    const ceilingGeo = new THREE.PlaneGeometry(boxWidth, boxLength);
    const ceilingMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, boxHeight, boxCenterZ);
    ceiling.rotation.x = Math.PI / 2;
    this.add(ceiling);
    this.scene7Objects.push(ceiling);

    // FLOOR
    const floorGeo = new THREE.PlaneGeometry(boxWidth, boxLength);
    const floorMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0, boxCenterZ);
    floor.rotation.x = -Math.PI / 2;
    this.add(floor);
    this.scene7Objects.push(floor);
  }

  generateScene7ImageWalls(scene7Start, corridorLength, wallDistance, imageSpacing, imageHeight) {
    const corridorStart = scene7Start;
    const corridorEnd = scene7Start - corridorLength - 20;
    const totalLength = corridorStart - corridorEnd;
    const numPositions = Math.floor(totalLength / imageSpacing) * 2;

    const imageStartZ = corridorStart;

    // Place videos prominently near the front of the corridor first
    const videoTextures = this.scene7ImageTextures.filter(t => t.userData.isVideo);
    if (videoTextures.length > 0) {
      const videoTexture = videoTextures[0];
      this.createScene7ImageWall(videoTexture, -wallDistance - 1, scene7Start - 8, 'left', imageHeight);
      this.createScene7ImageWall(videoTexture, wallDistance + 1, scene7Start - 16, 'right', imageHeight);
      if (videoTextures.length > 1) {
        this.createScene7ImageWall(videoTextures[1], -wallDistance - 1.5, scene7Start - 24, 'left', imageHeight);
      }
    }

    // Generate corridor wall images
    for (let i = 0; i < numPositions; i++) {
      const baseZ = imageStartZ - (i * imageSpacing) / 2;
      const zOffset = (Math.random() - 0.5) * 4;
      const zPosition = baseZ + zOffset;

      const placeLeft = Math.random() > 0.2;
      const placeRight = Math.random() > 0.2;

      if (placeLeft) {
        const leftTexture = this.getRandomScene7Texture('left-' + i);
        if (leftTexture) {
          const leftX = -wallDistance - Math.random() * 2;
          this.createScene7ImageWall(leftTexture, leftX, zPosition, 'left', imageHeight);
        }
      }

      if (placeRight) {
        const rightTexture = this.getRandomScene7Texture('right-' + i);
        if (rightTexture) {
          const rightX = wallDistance + Math.random() * 2;
          const rightZOffset = (Math.random() - 0.5) * 4;
          this.createScene7ImageWall(rightTexture, rightX, baseZ + rightZOffset, 'right', imageHeight);
        }
      }
    }

    // Add images beyond the corridor walls
    this.generateScene7BeyondImages(imageStartZ, corridorEnd, wallDistance);
  }

  generateScene7BeyondImages(imageStartZ, imageEndZ, wallDistance) {
    const numBeyondImages = 50;
    const totalRange = imageStartZ - imageEndZ;

    for (let i = 0; i < numBeyondImages; i++) {
      const texture = this.getRandomScene7Texture('beyond-' + i);
      if (!texture) continue;

      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (wallDistance + Math.random() * 25 + 5);
      const y = Math.random() * 20 + 1;
      const z = imageStartZ - Math.random() * totalRange;

      const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2;

      this.createScene7FloatingImage(texture, x, y, z, 0, rotY, 0);
    }
  }

  getRandomScene7Texture(positionKey) {
    if (this.scene7ImageTextures.length === 0) return null;
    
    const lastPath = this.scene7LastUsedTextures.get(positionKey);
    let attempts = 0;
    let texture;
    
    do {
      const randomIndex = Math.floor(Math.random() * this.scene7ImageTextures.length);
      texture = this.scene7ImageTextures[randomIndex];
      attempts++;
    } while (texture.userData.imagePath === lastPath && attempts < 10 && this.scene7ImageTextures.length > 1);
    
    this.scene7LastUsedTextures.set(positionKey, texture.userData.imagePath);
    return texture;
  }

  createScene7FloatingImage(texture, x, y, z, rotX, rotY, rotZ) {
    if (!texture) return;

    const sizeMultiplier = 0.4 + Math.random() * 0.8;
    const randomHeight = 5 * sizeMultiplier;

    const aspectRatio =
      texture.image?.videoWidth
        ? texture.image.videoWidth / texture.image.videoHeight
        : texture.image?.width && texture.image?.height
        ? texture.image.width / texture.image.height
        : 1.6;

    const width = randomHeight * aspectRatio;
    const geometry = new THREE.PlaneGeometry(width, randomHeight);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);
    wall.rotation.set(rotX, rotY, rotZ);

    this.add(wall);
    this.scene7ImageWalls.push(wall);
  }

  createScene7ImageWall(texture, xPosition, zPosition, side, baseHeight) {
    if (!texture) return;

    const sizeMultiplier = 0.4 + Math.random() * 0.8;
    const randomHeight = baseHeight * sizeMultiplier;

    const aspectRatio =
      texture.image?.videoWidth
        ? texture.image.videoWidth / texture.image.videoHeight
        : texture.image?.width && texture.image?.height
        ? texture.image.width / texture.image.height
        : 1.6;

    const width = randomHeight * aspectRatio;
    const geometry = new THREE.PlaneGeometry(width, randomHeight);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    const wall = new THREE.Mesh(geometry, material);

    const baseY = randomHeight / 2;
    const yOffset = (Math.random() - 0.5) * 8;

    wall.position.set(xPosition, baseY + yOffset + 2, zPosition);
    wall.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

    this.add(wall);
    this.scene7ImageWalls.push(wall);
  }
  
  // To add more scenes: Create buildSceneX() method, position it, set this.sceneXGenerated = false, add generation trigger in update()

  // Scene disposal methods - Clean up objects from previous scenes to reduce memory/lag
  disposeObject(obj) {
    if (!obj) return;
    
    if (obj.geometry) obj.geometry.dispose();
    
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => {
          if (mat.map) mat.map.dispose();
          if (mat.emissiveMap) mat.emissiveMap.dispose();
          mat.dispose();
        });
      } else {
        if (obj.material.map) obj.material.map.dispose();
        if (obj.material.emissiveMap) obj.material.emissiveMap.dispose();
        obj.material.dispose();
      }
    }
    
    if (obj.parent) obj.parent.remove(obj);
  }

  disposeScene1() {
    if (this.scene1Disposed) return;
    this.scene1Disposed = true;
    
    // Dispose polar bears
    this.polarBears.forEach(bear => {
      this.disposeObject(bear.mesh);
    });
    this.polarBears = [];
    
    // Dispose all tracked Scene 1 objects
    this.scene1Objects.forEach(obj => this.disposeObject(obj));
    this.scene1Objects = [];
  }

  disposeScene2() {
    if (this.scene2Disposed) return;
    this.scene2Disposed = true;
    
    // Dispose trees
    this.trees.forEach(tree => this.disposeObject(tree));
    this.trees = [];
    
    // Dispose shader grass
    if (this.shaderGrass) {
      this.disposeObject(this.shaderGrass.getMesh());
      this.shaderGrass = null;
    }
    
    // Dispose all tracked Scene 2 objects
    this.scene2Objects.forEach(obj => this.disposeObject(obj));
    this.scene2Objects = [];
  }

  disposeScene3() {
    if (this.scene3Disposed) return;
    this.scene3Disposed = true;
    
    // Dispose hilly shader grass
    if (this.hillyShaderGrass) {
      const terrain = this.hillyShaderGrass.getTerrain();
      const grass = this.hillyShaderGrass.getMesh();
      this.disposeObject(terrain);
      this.disposeObject(grass);
      this.hillyShaderGrass = null;
    }
    
    // Dispose all tracked Scene 3 objects
    this.scene3Objects.forEach(obj => this.disposeObject(obj));
    this.scene3Objects = [];
  }

  disposeScene4() {
    if (this.scene4Disposed) return;
    this.scene4Disposed = true;
    
    // Dispose all tracked Scene 4 objects
    this.scene4Objects.forEach(obj => this.disposeObject(obj));
    this.scene4Objects = [];
  }

  disposeScene5() {
    if (this.scene5Disposed) return;
    this.scene5Disposed = true;
    
    // Dispose ocean shader
    if (this.oceanShader) {
      this.disposeObject(this.oceanShader.getMesh());
      this.oceanShader = null;
    }
    
    // Dispose cloud shader
    if (this.cloudShader) {
      this.cloudShader.dispose();
      this.cloudShader = null;
    }
    
    // Dispose all tracked Scene 5 objects
    this.scene5Objects.forEach(obj => this.disposeObject(obj));
    this.scene5Objects = [];
  }

  disposeScene6() {
    if (this.scene6Disposed) return;
    this.scene6Disposed = true;
    
    // Dispose tropical trees
    this.scene6Trees.forEach(tree => this.disposeObject(tree));
    this.scene6Trees = [];
    
    // Dispose rain system
    if (this.rainSystem6) {
      this.disposeObject(this.rainSystem6);
      this.rainSystem6 = null;
    }
    
    // Dispose all tracked Scene 6 objects
    this.scene6Objects.forEach(obj => this.disposeObject(obj));
    this.scene6Objects = [];
  }

  // Clean up Scene 7 video elements when needed
  disposeScene7Videos() {
    // Stop and clean up all video elements
    this.scene7VideoElements.forEach(video => {
      video.pause();
      video.src = '';
    });
    this.scene7VideoElements = [];
  }

  // Sky color transition - Smoothly interpolates background and fog colors between scenes
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
    textDisplayManager.update(userPosition.z, deltaTime);

    // Update sky colors based on position
    this.updateSkyColors(userPosition.z);

    // Update subtitles based on camera position while moving through MainScene.
    subtitleManager.update(userPosition.z);
    
    // Update scene audio based on camera position
    sceneAudioManager.update(userPosition.z);
    
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
    if (userPosition.z < -600) {
      newScene = 7;
    }
    
    // Update timeline if scene changed
    if (newScene !== this.currentScene) {
      this.currentScene = newScene;
      if (window.updateTimeline) {
        window.updateTimeline(this.currentScene);
      }
    }

    // Dispose scenes that are 2+ scenes behind to reduce lag
    if (this.currentScene >= 3) this.disposeScene1();
    if (this.currentScene >= 4) this.disposeScene2();
    if (this.currentScene >= 5) this.disposeScene3();
    if (this.currentScene >= 6) this.disposeScene4();
    if (this.currentScene >= 7) this.disposeScene5();

    // Generate Scene 2 when approaching (at 80% through Scene 1)
    if (!this.scene2Generated && userPosition.z < -70) {
      this.buildScene2();
      // Load Scene 2 subtitles
      subtitleManager.loadSubtitles(subtitles.scene2);
    }

    // Generate Scene 3 when approaching (at 80% through Scene 2)
    if (!this.scene3Generated && userPosition.z < -180) {
      this.buildScene3();
      // Load Scene 3 subtitles
      subtitleManager.loadSubtitles(subtitles.scene3);
    }

    // Generate Scene 4 when approaching (at 80% through Scene 3)
    if (!this.scene4Generated && userPosition.z < -250) {
      this.buildScene4();
      // Load Scene 4 subtitles
      subtitleManager.loadSubtitles(subtitles.scene4);
    }

    // Generate Scene 5 when approaching (at 80% through Scene 4)
    if (!this.scene5Generated && userPosition.z < -380) {
      this.buildScene5();
      // Load Scene 5 subtitles
      subtitleManager.loadSubtitles(subtitles.scene5);
    }

    // Generate Scene 6 when approaching (at 80% through Scene 5)
    if (!this.scene6Generated && userPosition.z < -480) {
      this.buildScene6();
      // Load Scene 6 subtitles
      subtitleManager.loadSubtitles(subtitles.scene6);
    }

    // Generate Scene 7 (hack corridor) when approaching (at 80% through Scene 6)
    if (!this.scene7Generated && userPosition.z < -580) {
      this.buildScene7();
      // Load Scene 7 subtitles
      subtitleManager.loadSubtitles(subtitles.scene7);
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
    
    // Update cloud shader (Scene 5)
    if (this.cloudShader) {
      this.cloudShader.update(deltaTime);
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
      const growthDistance = 20; // Distance over which trees grow (increase for slower growth)
      if (distance < growthDistance) {
        // Trees grow larger as you get closer
        const scale = THREE.MathUtils.clamp(0.05 + (1 - distance / growthDistance) * 0.15, 0.05, 0.2);
        tree.scale.setScalar(scale);
      } else {
        tree.scale.setScalar(0.05); // Small when far
      }
    });

    // Scale tropical trees based on proximity to user (Scene 6)
    this.scene6Trees.forEach((tree) => {
      const distance = Math.abs(tree.position.z - userPosition.z);
      const baseScale = tree.userData.baseScale || 0.05;
      const growthDistance = 20;

      if (distance < growthDistance) {
        const scale = THREE.MathUtils.clamp(
          baseScale + (1 - distance / growthDistance) * 0.2,
          baseScale,
          baseScale + 0.2
        );
        tree.scale.setScalar(scale);
      } else {
        tree.scale.setScalar(baseScale);
      }
    });

    // Update animated GIF textures for Scene 7
    if (this.scene7Generated && userPosition.z < -580) {
      this.scene7ImageTextures.forEach(texture => {
        if (texture.userData.isAnimated) {
          texture.needsUpdate = true;
        }
      });
    }

    if (!this.endCreditsShown && userPosition.z < -825) {
      this.endCreditsShown = true;

      if (window.showCreditsOverlay) {
        window.showCreditsOverlay();
      }
    }
  }
}
