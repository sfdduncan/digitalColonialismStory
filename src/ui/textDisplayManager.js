
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { subtitleManager } from './subtitleManager.js';

export class TextDisplayManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.isDisplaying = false;
    this.isPaused = false;
    this.currentDisplay = null;
    this.animationProgress = 0;
    this.displayQueue = [];
    this.displayedTexts = new Set();
    
    // Animation configuration
    this.tileSize = 0.1; // Size of each square tile in world units
    this.animInDuration = 5; // Duration of flow-in animation in seconds
    this.displayTime = 6000; // Time to pause and display (4 seconds for reading)
    this.animOutDuration = 5; // Duration of flow-out animation in seconds
    this.postAnimDelay = 500; // Delay after animation before resuming movement
    
    // Animation states: 'in' (flowing in from left), 'display' (paused), 'out' (flowing out to right)
    this.animState = 'in';
    
    // Container will be initialized when init() is called
    this.textContainer = null;
  }
  
  // Initialize with scene and camera (must be called before use)
  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Create container for images if not already created
    if (!this.textContainer && this.scene) {
      this.textContainer = new THREE.Group();
      this.scene.add(this.textContainer);
    }
  }
  
  // Add image displays with their trigger positions
  loadTextDisplays(displays) {
    this.displayQueue = displays || [];
    this.displayedTexts.clear();
  }
  
  // Check if we should trigger an image display based on position
  update(cameraZ, deltaTime) {
    // Check for new displays to trigger
    if (!this.isDisplaying && this.displayQueue.length > 0) {
      for (const display of this.displayQueue) {
        if (cameraZ <= display.trigger && !this.displayedTexts.has(display.trigger)) {
          this.showTextDisplay(display.text, display.direction || 'left', display.image);
          this.displayedTexts.add(display.trigger);
          break;
        }
      }
    }
    
    // Update animation if displaying
    if (this.isDisplaying) {
      this.updateAnimation(deltaTime);
    }
  }
  
  // Show an image display - pauses movement and displays image
  showTextDisplay(text, direction = 'left', imageSrc = null) {
    if (this.isDisplaying) return;
    
    if (!imageSrc) {
      console.error('TextDisplayManager: No image source provided');
      return;
    }
    
    // Fade out subtitle smoothly before starting breakText animation
    subtitleManager.hide();
    
    this.isDisplaying = true;
    this.isPaused = true;
    this.animState = 'in'; // Start with tiles flowing in from left
    this.animationProgress = 0;
    this.animStartTime = Date.now();
    
    // Notify controls to pause - user cannot move during entire sequence
    if (window.pauseUserMovement) {
      window.pauseUserMovement(true);
    }
    
    // Load texture and create instanced mesh
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageSrc,
      (texture) => {
        this.createInstancedMesh(texture);
      },
      undefined,
      (error) => {
        console.error('Failed to load image:', imageSrc, error);
        this.endDisplay();
      }
    );
  }
  
  
  // Create instanced mesh with tiles (like script.js AnimatedPlane)
  createInstancedMesh(texture) {
    if (!this.textContainer || !this.camera) {
      console.error('TextDisplayManager: not initialized properly');
      return;
    }
    
    // Calculate image dimensions
    const imageHeight = 8;
    const aspect = texture.image ? (texture.image.width / texture.image.height) : 4;
    const imageWidth = imageHeight * aspect;
    
    // Calculate number of tiles
    const nx = Math.ceil(imageWidth / this.tileSize);
    const ny = Math.ceil(imageHeight / this.tileSize);
    const tileCount = nx * ny;
    
    // Create single tile geometry
    const tileGeometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
    
    // Create custom material with shader
    const material = this.createShaderMaterial(texture, nx, ny);
    
    // Create instanced mesh
    const instancedMesh = new THREE.InstancedMesh(tileGeometry, material, tileCount);
    
    // Position each tile instance and setup attributes
    this.setupInstancedAttributes(instancedMesh, nx, ny, imageWidth, imageHeight);
    
    // Position in front of camera
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    const distance = 9;
    instancedMesh.position.copy(this.camera.position).add(cameraDirection.multiplyScalar(distance));
    instancedMesh.position.y += 2; // Move image up
    instancedMesh.quaternion.copy(this.camera.quaternion);
    
    this.textContainer.add(instancedMesh);
    this.currentDisplay = instancedMesh;
  }
  
  // Create shader material with custom vertex shader for tile animation
  createShaderMaterial(texture, nx, ny) {
    const uvScale = new THREE.Vector2();
    const ratio = nx / ny;
    const tRatio = texture.image.width / texture.image.height;
    
    if (ratio > tRatio) {
      uvScale.set(1 / nx, (tRatio / ratio) / ny);
    } else {
      uvScale.set((ratio / tRatio) / nx, 1 / ny);
    }
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      onBeforeCompile: (shader) => {
        // Add custom uniforms
        shader.uniforms.progress = { value: 0 };
        shader.uniforms.uvScale = { value: uvScale };
        
        // Store reference for later updates
        material.userData.shader = shader;


        // 1. Declare our own UV varying alongside Three's built-in uv pars
        shader.vertexShader = shader.vertexShader.replace(
          '#include <uv_pars_vertex>',
          `
          #include <uv_pars_vertex>
          varying vec2 vTileUv;
          `
        );

        // 2. Declare custom attributes + uniforms + helpers before main()
        shader.vertexShader = shader.vertexShader.replace(
          'void main() {',
          `
          attribute vec3 offset;
          attribute vec3 rotation;
          attribute vec2 uvOffset;

          uniform float progress;
          uniform vec2 uvScale;

          mat3 rotationMatrixXYZ(vec3 r) {
            float cx = cos(r.x); float sx = sin(r.x);
            float cy = cos(r.y); float sy = sin(r.y);
            float cz = cos(r.z); float sz = sin(r.z);
            return mat3(
               cy * cz,  cx * sz + sx * sy * cz,  sx * sz - cx * sy * cz,
              -cy * sz,  cx * cz - sx * sy * sz,  sx * cz + cx * sy * sz,
                    sy,              -sx * cy,               cx * cy
            );
          }

          void main() {
          `
        );

        // 3. Compute vTileUv using the base uv attribute directly — safe at any point
        shader.vertexShader = shader.vertexShader.replace(
          '#include <uv_vertex>',
          `
          #include <uv_vertex>
          vTileUv = uv * uvScale + uvOffset;
          `
        );

        // 4. Override projection to apply our tile offset + rotation
        shader.vertexShader = shader.vertexShader.replace(
          '#include <project_vertex>',
          `
          mat3 rotMat = rotationMatrixXYZ(progress * rotation);
          vec3 rotatedPosition = rotMat * transformed;
          vec3 finalPosition = rotatedPosition + progress * offset;

          vec4 mvPosition = vec4(finalPosition, 1.0);
          #ifdef USE_INSTANCING
            mvPosition = instanceMatrix * mvPosition;
          #endif
          mvPosition = modelViewMatrix * mvPosition;
          gl_Position = projectionMatrix * mvPosition;
          `
        );


        // 5. Declare the matching varying in the fragment shader
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <uv_pars_fragment>',
          `
          #include <uv_pars_fragment>
          varying vec2 vTileUv;
          `
        );

        // 6. Replace the map sampling chunk to use vTileUv instead of vMapUv
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `
          #ifdef USE_MAP
            vec4 sampledDiffuseColor = texture2D(map, vTileUv);
            diffuseColor *= sampledDiffuseColor;
          #endif
          `
        );
      }
    });
    
    return material;
  }
  
  // Setup instanced mesh attributes (position, offset, rotation, uvOffset)
  setupInstancedAttributes(instancedMesh, nx, ny, imageWidth, imageHeight) {
    const tileCount = nx * ny;
    const geometry = instancedMesh.geometry;
    
    // Create UV offset attribute for each tile
    const uvOffsets = new Float32Array(tileCount * 2);
    const uvScale = instancedMesh.material.userData.shader ? 
      instancedMesh.material.userData.shader.uniforms.uvScale.value : 
      new THREE.Vector2(1/nx, 1/ny);
    
    const nW = uvScale.x * nx;
    const nH = uvScale.y * ny;
    
    // Create offset and rotation attributes
    const offsets = new Float32Array(tileCount * 3);
    const rotations = new Float32Array(tileCount * 3);
    
    // Position tiles and set attributes
    const dummy = new THREE.Object3D();
    const startX = -imageWidth / 2;
    const startY = -imageHeight / 2;
    
    let index = 0;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        // Position tile in grid
        const x = startX + (i + 0.5) * this.tileSize;
        const y = startY + (j + 0.5) * this.tileSize;
        dummy.position.set(x, y, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);
        
        // UV offset for this tile
        uvOffsets[index * 2]     = uvScale.x * i + (1 - nW) / 2;
        uvOffsets[index * 2 + 1] = uvScale.y * j + (1 - nH) / 2;
        
        // Create enhanced wind-blown spiral effect
        // Tiles come from varied heights and spiral inward with turbulent motion
        const travelDistance = 45 + Math.random() * 20; // 45-65 units horizontal (increased)
        
        // Enhanced vertical variation - tiles come from high above and far below
        const verticalSpread = 20 + Math.random() * 15; // 20-35 units vertical spread (increased)
        const spiralFactor = (i / nx) * Math.PI * 3; // Tighter spiral (increased from 2π to 3π)
        const rowFactor = (j / ny) * Math.PI * 2;
        
        // Multi-layered spiral with wave turbulence
        const verticalOffset = Math.sin(spiralFactor + rowFactor) * verticalSpread;
        const turbulence = Math.sin(spiralFactor * 2 + rowFactor * 3) * 8; // Add wave turbulence
        
        // Larger circular/spiral motion for dramatic wind effect
        const spiralRadius = 8 + Math.random() * 6; // 8-14 units (increased)
        const spiralX = Math.cos(spiralFactor) * spiralRadius;
        const spiralY = Math.sin(spiralFactor + rowFactor * 0.5) * spiralRadius;
        
        // Additional chaotic motion
        const chaos = (Math.random() - 0.5) * 12; // More random variation
        
        offsets[index * 3]     = travelDistance + spiralX + (Math.random() - 0.5) * 8; // X - with more variation
        offsets[index * 3 + 1] = verticalOffset + spiralY + turbulence + chaos; // Y - layered turbulence
        offsets[index * 3 + 2] = Math.random() * 12 + 8;  // Z - deeper depth variation (8-20)
        
        // More dramatic rotation for chaotic wind-blown effect
        const angle = Math.PI * 4; // Even more rotation range (4π)
        rotations[index * 3]     = (Math.random() - 0.5) * angle * 1.2;
        rotations[index * 3 + 1] = (Math.random() - 0.5) * angle;
        rotations[index * 3 + 2] = (Math.random() - 0.5) * angle * 1.8; // Much more Z rotation
        
        index++;
      }
    }
    
    // Set attributes
    geometry.setAttribute('uvOffset', new THREE.InstancedBufferAttribute(uvOffsets, 2));
    geometry.setAttribute('offset',   new THREE.InstancedBufferAttribute(offsets, 3));
    geometry.setAttribute('rotation', new THREE.InstancedBufferAttribute(rotations, 3));
    
    instancedMesh.instanceMatrix.needsUpdate = true;
  }

  
  // Update animation - three states: flow in, pause, flow out
  updateAnimation(deltaTime) {
    if (!this.currentDisplay) return;
    
    const now = Date.now();
    const elapsed = (now - this.animStartTime) / 1000; // seconds
    
    if (this.animState === 'in') {
      // Tiles flowing in from left with easing
      // Progress goes from -1 (scattered left) to 0 (formed image)
      const t = Math.min(elapsed / this.animInDuration, 1);
      
      // Ease out cubic - starts fast, slows down (like wind settling)
      const eased = 1 - Math.pow(1 - t, 3);
      this.animationProgress = -1 + eased; // -1 to 0
      
      // Update shader uniform
      if (this.currentDisplay.material && this.currentDisplay.material.userData.shader) {
        this.currentDisplay.material.userData.shader.uniforms.progress.value = this.animationProgress;
      }
      
      // Fade in with easing
      this.currentDisplay.material.opacity = eased;
      
      // Transition to 'display' state when animation completes
      if (t >= 1) {
        this.animState = 'display';
        this.animStartTime = now;
        this.animationProgress = 0;
      }
      
    } else if (this.animState === 'display') {
      // Image is stable and readable - paused at center
      this.animationProgress = 0;
      
      if (this.currentDisplay.material && this.currentDisplay.material.userData.shader) {
        this.currentDisplay.material.userData.shader.uniforms.progress.value = 0;
      }
      
      // Full opacity while displaying
      this.currentDisplay.material.opacity = 1;
      
      // After displayTime, transition to 'out' state
      if (elapsed >= this.displayTime / 1000) {
        this.animState = 'out';
        this.animStartTime = now;
      }
      
    } else if (this.animState === 'out') {
      // Tiles flowing out to right with easing
      // Progress goes from 0 (formed image) to 1 (scattered right)
      const t = Math.min(elapsed / this.animOutDuration, 1);
      
      // Ease in cubic - starts slow, speeds up (like wind picking up)
      const eased = Math.pow(t, 3);
      this.animationProgress = eased; // 0 to 1
      
      // Update shader uniform
      if (this.currentDisplay.material && this.currentDisplay.material.userData.shader) {
        this.currentDisplay.material.userData.shader.uniforms.progress.value = this.animationProgress;
      }
      
      // Fade out with easing
      this.currentDisplay.material.opacity = 1 - eased;
      
      // End animation when complete
      if (t >= 1) {
        setTimeout(() => {
          this.endDisplay();
        }, this.postAnimDelay);
      }
    }
  }
  
  // End the display and resume movement
  endDisplay() {
    this.clearText();
    this.isDisplaying = false;
    this.isPaused = false;
    this.animationProgress = 0;
    this.animState = 'in'; // Reset for next display
    
    // Resume user movement
    if (window.pauseUserMovement) {
      window.pauseUserMovement(false);
    }
  }
  
  // Clear all meshes
  clearText() {
    if (this.currentDisplay) {
      if (this.currentDisplay.geometry) this.currentDisplay.geometry.dispose();
      if (this.currentDisplay.material) {
        if (this.currentDisplay.material.map) this.currentDisplay.material.map.dispose();
        this.currentDisplay.material.dispose();
      }
      if (this.textContainer) {
        this.textContainer.remove(this.currentDisplay);
      }
      this.currentDisplay = null;
    }
  }
  
  // Check if currently paused
  isPausedForDisplay() {
    return this.isPaused;
  }
}

// Create and export singleton instance
export const textDisplayManager = new TextDisplayManager();