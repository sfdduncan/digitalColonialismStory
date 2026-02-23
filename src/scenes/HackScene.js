// ================================
// HACK SCENE (Pre-Scene)
// Dark corridor with images from imgs/hack folder
// ================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { SceneBase } from './SceneBase.js';
import { hackImages } from './hackImageConfig.js';
import { subtitleManager } from '../ui/subtitleManager.js';
import { subtitles } from '../ui/subtitleText.js';

export class HackScene extends SceneBase {
  constructor(camera) {
    super();
    this.camera = camera;
    this.imageWalls = [];
    this.imageTextures = [];
    this.lastUsedTextures = new Map();

    // Scene configuration
    this.corridorLength = 50;
    this.corridorWidth = 12;
    this.wallDistance = 5;
    this.imageSpacing = 8;
    this.imageHeight = 5;
    this.transitionZone = 50;

    this.setupScene();
  }

  setupScene() {
    this.background = new THREE.Color(0x050505);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    this.add(ambientLight);

    this.cameraLight = new THREE.PointLight(0x8080ff, 0.8, 30);
    this.cameraLight.position.copy(this.camera.position);
    this.add(this.cameraLight);

    this.fog = new THREE.Fog(0x050505, 20, 60);

    this.createGridFloor();
    this.loadImages();
    
    // Load subtitles for this scene
    subtitleManager.loadSubtitles(subtitles.hackScene);
  }

  createGridFloor() {
    const gridSize = 200;
    const gridDivisions = 40;

    const grid = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      0x0080ff,
      0x003366
    );
    grid.position.y = 0;
    grid.position.z = -gridSize / 2;

    this.add(grid);
    this.objects.push(grid);

    const floorGeometry = new THREE.PlaneGeometry(
      this.corridorWidth * 2,
      this.corridorLength
    );

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x000811,
      emissive: 0x001133,
      emissiveIntensity: 0.1,
      roughness: 0.8,
      metalness: 0.2
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01;
    floor.position.z = -this.corridorLength / 2;

    this.add(floor);
    this.objects.push(floor);
  }

  async loadImages() {
    const textureLoader = new THREE.TextureLoader();

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

    // Create video texture
    const video = document.createElement('video');
    video.src = 'imgs/hack/hack_video.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('webkit-playsinline', 'true');

    this.videoElement = video;

    try {
      await video.play();
    } catch (err) {
      console.warn('Video autoplay failed:', err);
    }

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.userData.imagePath = 'imgs/hack/hack_video.mp4';

    this.imageTextures = [...loadedTextures, videoTexture];

    this.generateImageWalls();
  }

  generateImageWalls() {
    const numPositions =
      Math.floor(this.corridorLength / this.imageSpacing) * 2;

    // Generate corridor wall images (on the sides)
    for (let i = 0; i < numPositions; i++) {
      const baseZ = -(i * this.imageSpacing) / 2;
      const zOffset = (Math.random() - 0.5) * 4;
      const zPosition = baseZ + zOffset;

      const placeLeft = Math.random() > 0.2;
      const placeRight = Math.random() > 0.2;

      if (placeLeft) {
        const leftTexture = this.getRandomTexture('left-' + i);
        if (leftTexture) {
          // Keep images on the left wall, not in the path
          const leftX = -this.wallDistance - Math.random() * 2;
          this.createImageWall(leftTexture, leftX, zPosition, 'left');
        }
      }

      if (placeRight) {
        const rightTexture = this.getRandomTexture('right-' + i);
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
    const numBeyondImages = 80;

    for (let i = 0; i < numBeyondImages; i++) {
      const texture = this.getRandomTexture('beyond-' + i);
      if (!texture) continue;

      // Position images beyond the corridor walls (far left and right)
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (this.wallDistance + Math.random() * 25 + 5);
      const y = Math.random() * 20 + 1;
      const z = -Math.random() * this.corridorLength * 1.2;

      // Keep images facing the corridor (no random rotation)
      const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2;

      this.createFloatingImage(texture, x, y, z, 0, rotY, 0);
    }
  }

  getRandomTexture(positionKey) {
    if (this.imageTextures.length === 0) return null;
    
    // Get the last used image path for this position
    const lastPath = this.lastUsedTextures.get(positionKey);
    let attempts = 0;
    let texture;
    
    // Try to get a texture with a different filename (max 10 attempts)
    do {
      const randomIndex = Math.floor(
        Math.random() * this.imageTextures.length
      );
      texture = this.imageTextures[randomIndex];
      attempts++;
    } while (texture.userData.imagePath === lastPath && attempts < 10 && this.imageTextures.length > 1);
    
    // Store the image path (not the texture object) for comparison
    this.lastUsedTextures.set(positionKey, texture.userData.imagePath);
    return texture;
  }

  createImageWall(texture, xPosition, zPosition, side) {
    if (!texture) return;

    // More varied sizes for corridor walls
    const sizeMultiplier = 0.4 + Math.random() * 1.8;
    const randomHeight = this.imageHeight * sizeMultiplier;

    const aspectRatio =
      texture.image?.videoWidth
        ? texture.image.videoWidth / texture.image.videoHeight
        : texture.image?.width && texture.image?.height
        ? texture.image.width / texture.image.height
        : 1.6;

    const width = randomHeight * aspectRatio;

    const geometry = new THREE.PlaneGeometry(width, randomHeight);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      side: THREE.DoubleSide
    });

    const wall = new THREE.Mesh(geometry, material);

    const baseY = randomHeight / 2;
    const yOffset = (Math.random() - 0.5) * 3;

    wall.position.set(
      xPosition,
      baseY + yOffset,
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

    // More varied sizes for scattered images
    const sizeMultiplier = 0.3 + Math.random() * 2;
    const randomHeight = this.imageHeight * sizeMultiplier;

    const aspectRatio =
      texture.image?.videoWidth
        ? texture.image.videoWidth / texture.image.videoHeight
        : texture.image?.width && texture.image?.height
        ? texture.image.width / texture.image.height
        : 1.6;

    const width = randomHeight * aspectRatio;

    const geometry = new THREE.PlaneGeometry(width, randomHeight);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.3
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
    camera.position.set(0, 5, 10);
    camera.rotation.set(0, 0, 0);
  }

  exit() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.load();
      this.videoElement = null;
    }

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

    super.exit();
  }
}
