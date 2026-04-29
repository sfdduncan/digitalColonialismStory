import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { SceneBase } from './SceneBase.js';
import { hackImages, hackVideos, hackBackgroundVideo } from './hackImageConfig.js';
import { subtitleManager } from '../ui/subtitleManager.js';
import { subtitles } from '../ui/subtitleText.js';
import { sceneAudioManager } from '../ui/sceneAudioManager.js';
import { hackSceneAudioZones } from '../ui/sceneAudioConfig.js';

export class HackScene extends SceneBase {
  constructor(camera) {
    super();
    this.camera = camera;
    this.imageWalls = [];
    this.imageTextures = [];
    this.usedTexturePaths = new Set();
    this.backgroundVideoElements = []; // Track video elements for cleanup

    // Scene configuration
    this.corridorLength = 100;
    this.corridorWidth = 12;
    this.wallDistance = 5;
    this.imageSpacing = 8;
    this.imageHeight = 5;
    this.transitionZone = 60;

    this.setupScene();
  }

  setupScene() {
    this.background = new THREE.Color(0xffffff);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    this.add(ambientLight);

    this.cameraLight = new THREE.PointLight(0x8080ff, 0.8, 30);
    this.cameraLight.position.copy(this.camera.position);
    this.add(this.cameraLight);

    this.fog = new THREE.Fog(0xffffff, 15, 80);

    this.createBackgroundVideoWalls();
    
    this.loadImages();
    
    // Delay subtitles to sync with camera movement start (4-5 seconds)
    setTimeout(() => {
      subtitleManager.loadSubtitles(subtitles.hackScene);
    }, 4500);
    // Audio is started via startAudio(), called by SceneManager when movement begins
  }

  // Called by SceneManager exactly when auto-move begins so audio is tied to movement
  startAudio() {
    sceneAudioManager.loadAudioZones(hackSceneAudioZones);
  }

  async createBackgroundVideoWalls() {
    // Create video element for background
    const bgVideo = document.createElement('video');
    bgVideo.src = hackBackgroundVideo;
    bgVideo.loop = true;
    bgVideo.muted = true;
    bgVideo.playsInline = true;
    bgVideo.autoplay = true;
    bgVideo.setAttribute('webkit-playsinline', 'true');

    this.backgroundVideoElements.push(bgVideo);

    try {
      await bgVideo.play();
    } catch (_) {}

    const bgVideoTexture = new THREE.VideoTexture(bgVideo);
    bgVideoTexture.minFilter = THREE.LinearFilter;
    bgVideoTexture.magFilter = THREE.LinearFilter;

    const boxWidth = 30; // Width of the box (x-axis)
    const boxHeight = 20; // Height of the box (y-axis)
    const corridorStart = 40; // Behind camera start position
    const corridorEnd = -120; // Past transition zone
    const boxLength = corridorStart - corridorEnd; // Total length (z-axis)
    const boxCenterZ = (corridorStart + corridorEnd) / 2;

    // LEFT WALL (runs along the corridor on the left side)
    const leftWallGeo = new THREE.PlaneGeometry(boxLength, boxHeight);
    const leftWallMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture,
      side: THREE.DoubleSide
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-boxWidth / 2, boxHeight / 2, boxCenterZ);
    leftWall.rotation.y = Math.PI / 2;
    this.add(leftWall);
    this.objects.push(leftWall);

    // RIGHT WALL (runs along the corridor on the right side)
    const rightWallGeo = new THREE.PlaneGeometry(boxLength, boxHeight);
    const rightWallMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.position.set(boxWidth / 2, boxHeight / 2, boxCenterZ);
    rightWall.rotation.y = -Math.PI / 2;
    this.add(rightWall);
    this.objects.push(rightWall);

    // FRONT WALL (behind camera start - positive z)
    const frontWallGeo = new THREE.PlaneGeometry(boxWidth, boxHeight);
    const frontWallMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const frontWall = new THREE.Mesh(frontWallGeo, frontWallMat);
    frontWall.position.set(0, boxHeight / 2, corridorStart);
    this.add(frontWall);
    this.objects.push(frontWall);


    const ceilingGeo = new THREE.PlaneGeometry(boxWidth, boxLength);
    const ceilingMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, boxHeight, boxCenterZ);
    ceiling.rotation.x = Math.PI / 2;
    this.add(ceiling);
    this.objects.push(ceiling);


    const floorGeo = new THREE.PlaneGeometry(boxWidth, boxLength);
    const floorMat = new THREE.MeshBasicMaterial({
      map: bgVideoTexture.clone(),
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0, boxCenterZ);
    floor.rotation.x = -Math.PI / 2;
    this.add(floor);
    this.objects.push(floor);

  }

  async loadImages() {
    const textureLoader = new THREE.TextureLoader();

    // Load static images
    const loadPromises = hackImages.map(path => {
      return new Promise(resolve => {
        const isGif = path.toLowerCase().endsWith('.gif');
        
        if (isGif) {
          // For GIFs, create an img element in the DOM to enable animation
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
          // For static images, use TextureLoader
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

    // Load corridor videos
    const videoTextures = await Promise.all(hackVideos.map(async (videoPath) => {
      const video = document.createElement('video');
      video.src = videoPath;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.setAttribute('webkit-playsinline', 'true');

      this.backgroundVideoElements.push(video);

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

    this.imageTextures = [...loadedTextures, ...videoTextures];

    this.generateImageWalls();

    // Signal to main.js that the scene is ready to be revealed behind the title card
    window.dispatchEvent(new CustomEvent('hackSceneReady'));
  }

  generateImageWalls() {
    this.usedTexturePaths.clear();

    // Calculate positions to span full corridor length
    const corridorStart = 40; // Behind camera
    const corridorEnd = -120; // End of corridor
    const totalLength = corridorStart - corridorEnd; // 170 units
    const numPositions = Math.floor(totalLength / this.imageSpacing) * 2;

    // Start images from beginning of corridor
    const imageStartZ = corridorStart;

    // Place each video once near the front so videos are visible and never duplicated.
    const videoTextures = this.imageTextures.filter(t => t.userData.isVideo);
    const videoSlots = [
      { x: -this.wallDistance - 1, z: 20, side: 'left' },
      { x: this.wallDistance + 1, z: 10, side: 'right' },
      { x: -this.wallDistance - 1.5, z: 0, side: 'left' },
      { x: this.wallDistance + 1.5, z: -10, side: 'right' }
    ];
    videoTextures.slice(0, videoSlots.length).forEach((videoTexture, index) => {
      const slot = videoSlots[index];
      this.createImageWall(videoTexture, slot.x, slot.z, slot.side);
      this.usedTexturePaths.add(videoTexture.userData.imagePath);
    });

    // Generate corridor wall images (on the sides)
    for (let i = 0; i < numPositions; i++) {
      const baseZ = imageStartZ - (i * this.imageSpacing) / 2;
      const zOffset = (Math.random() - 0.5) * 4;
      const zPosition = baseZ + zOffset;

      const placeLeft = Math.random() > 0.2;
      const placeRight = Math.random() > 0.2;

      if (placeLeft) {
        const leftTexture = this.getRandomTexture();
        if (leftTexture) {
          // Keep images on the left wall, not in the path
          const leftX = -this.wallDistance - Math.random() * 2;
          this.createImageWall(leftTexture, leftX, zPosition, 'left');
        }
      }

      if (placeRight) {
        const rightTexture = this.getRandomTexture();
        if (rightTexture) {
          // Keep images on the right wall, not in the path
          const rightX = this.wallDistance + Math.random() * 2;
          const rightZOffset = (Math.random() - 0.5) * 4;
          this.createImageWall(
            rightTexture,
            rightX,
            baseZ + rightZOffset,
            'right'
          );
        }
      }
    }

    // Add more images beyond the corridor walls
    this.generateBeyondImages();
  }

  generateBeyondImages() {
    const numBeyondImages = 50;

    // Start from beginning of corridor and extend to end
    const imageStartZ = 40;
    const imageEndZ = -120;
    const totalRange = imageStartZ - imageEndZ;

    for (let i = 0; i < numBeyondImages; i++) {
      const texture = this.getRandomTexture();
      if (!texture) continue;

      // Position images beyond the corridor walls (far left and right)
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (this.wallDistance + Math.random() * 25 + 5);
      const y = Math.random() * 20 + 1;
      const z = imageStartZ - Math.random() * totalRange;

      // Keep images facing the corridor (no random rotation)
      const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2;

      this.createFloatingImage(texture, x, y, z, 0, rotY, 0);
    }
  }

  getRandomTexture() {
    const availableTextures = this.imageTextures.filter(texture => {
      const path = texture?.userData?.imagePath;
      return path && !this.usedTexturePaths.has(path);
    });

    if (availableTextures.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableTextures.length);
    const texture = availableTextures[randomIndex];
    this.usedTexturePaths.add(texture.userData.imagePath);
    return texture;
  }

  createImageWall(texture, xPosition, zPosition, side) {
    if (!texture) return;

    // Smaller sizes for corridor images
    const sizeMultiplier = 0.78 + Math.random() * 1.2;
    const randomHeight = this.imageHeight * sizeMultiplier;

    const aspectRatio =
      texture.image?.videoWidth
        ? texture.image.videoWidth / texture.image.videoHeight
        : texture.image?.width && texture.image?.height
        ? texture.image.width / texture.image.height
        : 1.6;

    const width = randomHeight * aspectRatio;

    const geometry = new THREE.PlaneGeometry(width, randomHeight);

    // Basic material with no brightness effects
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    const wall = new THREE.Mesh(geometry, material);

    const baseY = randomHeight / 2;
    // More scattered Y positions - wider variation
    const yOffset = (Math.random() - 0.5) * 8; // Increased from 3 to 8 for more scatter

    wall.position.set(
      xPosition,
      baseY + yOffset + 2, // Added +2 to raise them up a bit
      zPosition
    );

    wall.rotation.y =
      side === 'left' ? Math.PI / 2 : -Math.PI / 2;

    this.add(wall);
    this.imageWalls.push(wall);
    this.objects.push(wall);
  }

  createFloatingImage(texture, x, y, z, rotX, rotY, rotZ) {
    if (!texture) return;

    // Smaller, more varied sizes for scattered images
    const sizeMultiplier = 0.4 + Math.random() * 0.8;
    const randomHeight = this.imageHeight * sizeMultiplier;

    const aspectRatio =
      texture.image?.videoWidth
        ? texture.image.videoWidth / texture.image.videoHeight
        : texture.image?.width && texture.image?.height
        ? texture.image.width / texture.image.height
        : 1.6;

    const width = randomHeight * aspectRatio;

    const geometry = new THREE.PlaneGeometry(width, randomHeight);

    // Basic material with no brightness effects
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);
    wall.rotation.set(rotX, rotY, rotZ);

    this.add(wall);
    this.imageWalls.push(wall);
    this.objects.push(wall);
  }

  update(userPosition) {
    if (!userPosition) return { transition: false };

    if (this.cameraLight) {
      this.cameraLight.position.copy(userPosition);
    }

    // Update subtitles based on camera position
    subtitleManager.update(userPosition.z);
    
    // Update audio based on camera position
    sceneAudioManager.update(userPosition.z);

    // Update animated GIF textures
    this.imageTextures.forEach(texture => {
      if (texture.userData.isAnimated) {
        texture.needsUpdate = true;
      }
    });

    if (userPosition.z < -this.transitionZone) {
      return { transition: true, nextScene: 'MainScene' };
    }

    return { transition: false };
  }

  setStartPosition(camera) {
    camera.position.set(0, 5, 35);  // Z increased to move camera further back
    camera.rotation.set(0, 0, 0);
  }

  exit() {
    // Clean up all video elements (background videos and corridor videos)
    this.backgroundVideoElements.forEach(video => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    });
    this.backgroundVideoElements = [];

    // Clean up GIF image elements from DOM
    this.imageTextures.forEach(texture => {
      if (texture.userData.imageElement) {
        document.body.removeChild(texture.userData.imageElement);
      }
      texture.dispose();
    });
    this.imageTextures = [];

    // Clear subtitles when exiting scene
    subtitleManager.clear();
    
    // Stop all audio when exiting scene
    sceneAudioManager.stopAll();

    super.exit();
  }
}
