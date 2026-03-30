// Archive Images Manager - displays images as Three.js objects that float alongside the player

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class ArchiveImagesManager {
  constructor() {
    this.currentImages = [];
    this.displayedImages = new Set();
    this.activeImageMeshes = [];
    this.scene = null;
    this.imageHeight = 2; // Base height for images
    this.wallDistance = 4; // Distance from center path
  }
  
  // Initialize with a Three.js scene
  init(scene) {
    this.scene = scene;
  }
  
  // Load images configuration for a specific scene
  loadImages(imagesArray) {
    this.currentImages = imagesArray || [];
    this.displayedImages.clear();
  }
  
  // Update based on camera position (z-coordinate)
  update(cameraZ) {
    if (!this.scene || !this.currentImages || this.currentImages.length === 0) {
      return;
    }
    
    // Check for new images that should be displayed
    for (const imageConfig of this.currentImages) {
      // Check if we've passed this trigger point and haven't displayed it yet
      if (cameraZ <= imageConfig.trigger && !this.displayedImages.has(imageConfig.trigger)) {
        this.showImage(imageConfig, cameraZ);
        // Note: displayedImages.add() is called immediately in showImage() to prevent duplicate loading
      }
    }
    
    // Update positions of active images to follow camera
    this.updateImagePositions(cameraZ);
  }
  
  // Helper to find next trigger point
  getNextTrigger(cameraZ) {
    for (const img of this.currentImages) {
      if (cameraZ > img.trigger && !this.displayedImages.has(img.trigger)) {
        return img.trigger;
      }
    }
    return 'none';
  }
  
  // Show a new image as a Three.js plane
  showImage(imageConfig, cameraZ) {
    if (!this.scene) {
      console.warn('Archive images manager: Scene not initialized');
      return;
    }
    
    // (texture loading is async, so without this we'd trigger the same image multiple times)
    this.displayedImages.add(imageConfig.trigger);
    
    // Check if this is a video file
    if (imageConfig.isVideo) {
      this.loadVideoTexture(imageConfig, cameraZ);
    } else {
      this.loadImageTexture(imageConfig, cameraZ);
    }
  }
  
  // Load image texture
  loadImageTexture(imageConfig, cameraZ) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
      imageConfig.src,
      (texture) => {
        this.createImageMesh(texture, imageConfig, cameraZ);
      },
      undefined,
      (error) => {
        console.error(`Failed to load archive image: ${imageConfig.src}`, error);
        // Remove from displayed set so it can retry on next update
        this.displayedImages.delete(imageConfig.trigger);
      }
    );
  }
  
  // Load video texture
  loadVideoTexture(imageConfig, cameraZ) {
    const video = document.createElement('video');
    video.src = imageConfig.src;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('webkit-playsinline', 'true');
    
    // Try to play the video
    video.play().catch(err => {
      console.warn('Archive video autoplay failed:', err);
    });
    
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    this.createImageMesh(videoTexture, imageConfig, cameraZ, video);
  }
  
  // Create mesh from texture (shared between image and video)
  createImageMesh(texture, imageConfig, cameraZ, videoElement = null) {
    // Calculate aspect ratio and size
    const aspectRatio = texture.image?.videoWidth
      ? texture.image.videoWidth / texture.image.videoHeight
      : texture.image?.width && texture.image?.height
      ? texture.image.width / texture.image.height
      : 1.6;
    
    const height = this.imageHeight * (0.6 + Math.random() * 0.8); // Varied sizes
    const width = height * aspectRatio;
    
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(width, height);
    
    // Create material with texture
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0, // Start invisible for fade-in effect
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position based on configuration
    const side = imageConfig.side;
    const xPosition = side === 'left' 
      ? -(this.wallDistance + Math.random() * 2) 
      : (this.wallDistance + Math.random() * 2);
    
    // Convert verticalOffset percentage to y position
    const verticalOffsetPercent = parseFloat(imageConfig.verticalOffset) / 100;
    const yPosition = height / 2 + (verticalOffsetPercent * 10 - 2) + 3; // +3 makes images higher in scene (ADJUST THIS NUMBER to change height)
    
    // Calculate z offset from camera (how far behind/ahead of camera this should stay)
    const zOffsetFromCamera = imageConfig.trigger - cameraZ - 2.5; // +3 makes images float alongside/slightly behind camera (ADJUST THIS NUMBER to change forward/backward distance)
    
    mesh.position.set(
      xPosition,
      yPosition,
      cameraZ + zOffsetFromCamera // Position relative to current camera
    );
    
    // Rotate to face the player path
    mesh.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    
    // Store metadata for updates
    mesh.userData = {
      trigger: imageConfig.trigger,
      side: side,
      baseY: yPosition,
      baseX: xPosition,
      zOffsetFromCamera: zOffsetFromCamera, // Store offset to follow camera
      time: 0,
      fadeInProgress: 0, // Track fade-in animation (0 to 1)
      videoElement: videoElement // Store video element if it's a video
    };
    
    this.scene.add(mesh);
    this.activeImageMeshes.push(mesh);
  }
  
  // Update positions of all active images to follow camera
  updateImagePositions(cameraZ) {
    this.activeImageMeshes.forEach((mesh) => {
      const userData = mesh.userData;
      
      // Update time for animation
      userData.time += 0.01;
      
      // Handle fade-in animation
      if (userData.fadeInProgress < 1) {
        userData.fadeInProgress += 0.02; // Fade in over ~50 frames (~0.8 seconds)
        if (userData.fadeInProgress > 1) userData.fadeInProgress = 1;
        mesh.material.opacity = userData.fadeInProgress;
      }
      
      // Apply subtle floating animation
      const verticalDrift = Math.sin(userData.time * 2) * 0.3; // Gentle up/down float
      const horizontalSway = Math.sin(userData.time * 1.5) * 0.2; // Subtle sway
      
      // Update position - images follow the camera with their stored offset
      mesh.position.z = cameraZ + userData.zOffsetFromCamera;
      mesh.position.y = userData.baseY + verticalDrift;
      
      if (userData.side === 'left') {
        mesh.position.x = userData.baseX - horizontalSway;
      } else {
        mesh.position.x = userData.baseX + horizontalSway;
      }
    });
  }
  
  // Check if any photos have been displayed
  hasDisplayedAnyPhotos() {
    return this.displayedImages.size > 0;
  }
  
  // Clear all images
  clear() {
    if (!this.scene) return;
    
    this.currentImages = [];
    this.displayedImages.clear();
    
    // Remove all active meshes from scene
    this.activeImageMeshes.forEach((mesh) => {
      // Stop and clean up video if present
      if (mesh.userData.videoElement) {
        mesh.userData.videoElement.pause();
        mesh.userData.videoElement.src = '';
        mesh.userData.videoElement = null;
      }
      
      this.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose();
        if (mesh.material.emissiveMap) mesh.material.emissiveMap.dispose();
        mesh.material.dispose();
      }
    });
    
    this.activeImageMeshes = [];
  }
}

// Create global instance
export const archiveImagesManager = new ArchiveImagesManager();
