// Archive Images Manager - displays images as Three.js objects that float alongside the player

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class ArchiveImagesManager {
  constructor() {
    this.currentImages = [];
    this.displayedImages = new Set();
    this.activeImageMeshes = [];
    this.scene = null;
    this.camera = null;
    this.imageHeight = 1.0; // Base height for images (smaller for orbital display)
    this.orbitRadius = 3.5; // Distance from camera for circular orbit
    this.globalOrbitTime = 0; // Slowly advances to gently rotate all images
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(2, 2);
    this.focusedMesh = null;
    this.isModalOpen = false;
    this.domElement = null;
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandlePointerMove = this.handlePointerMove.bind(this);
  }
  
  // Initialize with a Three.js scene
  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = document.querySelector('canvas');
    this.resetPointer();
    document.removeEventListener('click', this.boundHandleClick);
    window.removeEventListener('mousemove', this.boundHandlePointerMove);
    document.addEventListener('click', this.boundHandleClick);
    window.addEventListener('mousemove', this.boundHandlePointerMove);
  }

  syncPointerCursor() {
    const x = `${((this.pointer.x + 1) * 50).toFixed(2)}%`;
    const y = `${((1 - this.pointer.y) * 50).toFixed(2)}%`;
    document.documentElement.style.setProperty('--archive-photo-cursor-x', x);
    document.documentElement.style.setProperty('--archive-photo-cursor-y', y);
  }

  resetPointer() {
    this.pointer.set(0, 0);
    this.syncPointerCursor();
  }

  nudgePointer(deltaX, deltaY) {
    if (!this.domElement) {
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = THREE.MathUtils.clamp(this.pointer.x + ((deltaX / rect.width) * 2), -1, 1);
    this.pointer.y = THREE.MathUtils.clamp(this.pointer.y - ((deltaY / rect.height) * 2), -1, 1);
    this.syncPointerCursor();
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
    if (!this.scene) return;

    if (!imageConfig?.src) {
      this.displayedImages.add(imageConfig.trigger);
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
    video.play().catch(() => {});
    
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
    
    const height = this.imageHeight * (0.6 + Math.random() * 0.5); // Varied sizes
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
    
    // Assign a slot on the orbit circle, distributed evenly among active images
    // Each new image gets the next slot, with a small random nudge to prevent
    // perfect stacking if many images are added at once.
    const slotCount = 8;
    const slotIndex = this.activeImageMeshes.length % slotCount;
    const orbitAngle = (slotIndex / slotCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
    
    // Eye-level height with a bit of per-image variation
    const yPosition = 1.5 + Math.random() * 1.2;
    
    // Start the image at its orbit position relative to the camera
    const camPos = this.camera.position;
    mesh.position.set(
      camPos.x + this.orbitRadius * Math.cos(orbitAngle),
      yPosition,
      camPos.z + this.orbitRadius * Math.sin(orbitAngle)
    );
    mesh.lookAt(camPos);
    
    // Store metadata for updates
    mesh.userData = {
      imageConfig,
      trigger: imageConfig.trigger,
      orbitAngle: orbitAngle, // Fixed slot angle; global drift is added in update
      baseY: yPosition,
      time: 0,
      fadeInProgress: 0, // Track fade-in animation (0 to 1)
      videoElement: videoElement, // Store video element if it's a video
      focusAmount: 0,
      baseScale: new THREE.Vector3(1, 1, 1)
    };
    
    this.scene.add(mesh);
    this.activeImageMeshes.push(mesh);
  }
  
  // Update positions of all active images to follow camera
  updateImagePositions(cameraZ) {
    // Slowly advance the global orbit so images gently drift around the viewer
    this.globalOrbitTime += 0.0015;

    const camPos = this.camera.position;

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
      
      // Gentle vertical bob
      const verticalDrift = Math.sin(userData.time * 1.5) * 0.15;
      
      // Orbit the camera: each image keeps its slot angle plus the slow global rotation
      const currentAngle = userData.orbitAngle + this.globalOrbitTime;
      mesh.position.x = camPos.x + this.orbitRadius * Math.cos(currentAngle);
      mesh.position.z = camPos.z + this.orbitRadius * Math.sin(currentAngle);
      mesh.position.y = userData.baseY + verticalDrift;
      
      // Always face the camera so the image is legible from any position
      mesh.lookAt(camPos);

      const isFocused = this.focusedMesh === mesh;
      userData.focusAmount += ((isFocused ? 1 : 0) - userData.focusAmount) * 0.12;
      const focusScale = 1 + userData.focusAmount * 0.08;
      mesh.scale.setScalar(focusScale);
      mesh.material.emissiveIntensity = 0.6 + userData.focusAmount * 0.55;
    });

    this.updateFocusedMesh();
  }

  updateFocusedMesh() {
    if (!this.camera || this.isModalOpen || this.activeImageMeshes.length === 0) {
      this.setFocusedMesh(null);
      return;
    }

    if (!window.isArchivePhotoPointerMode || !window.isArchivePhotoPointerMode()) {
      this.setFocusedMesh(null);
      return;
    }

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersections = this.raycaster.intersectObjects(this.activeImageMeshes, false);
    this.setFocusedMesh(intersections[0]?.object || null);
  }

  handlePointerMove(event) {
    if (!this.domElement || !window.isArchivePhotoPointerMode || !window.isArchivePhotoPointerMode()) {
      return;
    }

    if (document.pointerLockElement === this.domElement) {
      return;
    }

    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.syncPointerCursor();
  }

  setFocusedMesh(mesh) {
    this.focusedMesh = mesh;

    if (window.setArchivePhotoFocusState) {
      window.setArchivePhotoFocusState(Boolean(mesh), mesh?.userData?.imageConfig || null);
    }
  }

  handleClick(event) {
    if (!window.isArchivePhotoPointerMode || !window.isArchivePhotoPointerMode() || this.isModalOpen) {
      return;
    }

    if (!this.focusedMesh) {
      window.setArchivePhotoPointerMode?.(false, { relock: true, suppressUntilRotateAway: true });
      return;
    }

    const { imageConfig } = this.focusedMesh.userData;
    if (!imageConfig || !window.showArchivePhotoOverlay) {
      return;
    }

    this.isModalOpen = true;
    this.setFocusedMesh(null);
    window.showArchivePhotoOverlay(imageConfig);
  }

  setModalOpen(isOpen) {
    this.isModalOpen = isOpen;

    if (!isOpen) {
      this.updateFocusedMesh();
    }
  }
  
  // Check if any photos have been displayed
  hasDisplayedAnyPhotos() {
    return this.displayedImages.size > 0;
  }
  
  // Clear all images
  clear() {
    if (!this.scene) return;

    document.removeEventListener('click', this.boundHandleClick);
    window.removeEventListener('mousemove', this.boundHandlePointerMove);
    this.setModalOpen(false);
    this.setFocusedMesh(null);
    this.resetPointer();
    
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
