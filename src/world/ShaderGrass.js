// Shader-based grass system with wind animation
// Based on: https://medium.com/antaeus-ar/making-grass-with-triangles-in-glsl-using-three-js-e106771a71ff

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class ShaderGrass {
  constructor(width, length, positionZ, options = {}) {
    this.width = width;
    this.length = length;
    this.positionZ = positionZ;
    this.time = 0;
    
    // Grass configuration
    this.grassCount = 250000; // Number of grass blades
    this.grassHeight = 0.6;
    this.grassWidth = 0.12;
    
    // Optional configuration
    this.pathWidth = options.pathWidth || 0; // Width of clear path in middle
    this.patchiness = options.patchiness || 0; // 0-1, higher = more patchy
    
    this.create();
  }
  
  create() {
    // Create instanced geometry for grass blades
    const geometry = this.createGrassGeometry();
    const material = this.createGrassMaterial();
    
    this.mesh = new THREE.InstancedMesh(geometry, material, this.grassCount);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    
    // Position each grass blade
    this.positionGrassBlades();
    
    return this.mesh;
  }
  
  createGrassGeometry() {
    // Create a simple blade of grass (triangle)
    const geometry = new THREE.BufferGeometry();
    
    // Vertices for a grass blade (wider at bottom, narrow at top)
    const vertices = new Float32Array([
      -this.grassWidth / 2, 0, 0,  // bottom left
      this.grassWidth / 2, 0, 0,   // bottom right
      0, this.grassHeight, 0        // top center
    ]);
    
    // UVs for texture mapping
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      0.5, 1
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    return geometry;
  }
  
  createGrassMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        grassBaseColor: { value: new THREE.Color(0x2d5016) },  // Dark green base
        grassTipColor: { value: new THREE.Color(0x6b9b37) },   // Lighter green tip
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vDisplacement;
        
        // Simple noise function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        void main() {
          vUv = uv;
          
          vec3 pos = position;
          vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
          
          // Wind effect - sway grass based on position and time
          float windStrength = 0.3;
          float windSpeed = 1.5;
          
          // Use world position for variation
          float windNoise = sin(worldPosition.x * 0.5 + time * windSpeed) * 
                           cos(worldPosition.z * 0.5 + time * windSpeed * 0.7);
          
          // Only affect the top of the grass blade (based on y position)
          float heightFactor = uv.y; // 0 at bottom, 1 at top
          
          // Apply wind displacement
          worldPosition.x += windNoise * windStrength * heightFactor;
          worldPosition.z += sin(worldPosition.x * 0.3 + time * windSpeed * 0.5) * 
                            windStrength * 0.5 * heightFactor;
          
          vDisplacement = windNoise * heightFactor;
          
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 grassBaseColor;
        uniform vec3 grassTipColor;
        varying vec2 vUv;
        varying float vDisplacement;
        
        void main() {
          // Gradient from base to tip
          vec3 color = mix(grassBaseColor, grassTipColor, vUv.y);
          
          // Add slight variation based on displacement
          color += vDisplacement * 0.1;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
    
    return material;
  }
  
  positionGrassBlades() {
    const dummy = new THREE.Object3D();
    
    // Simple noise function for patchiness
    const noise = (x, z) => {
      const n = Math.sin(x * 0.1) * Math.cos(z * 0.1) + 
                Math.sin(x * 0.05 + 3.14) * Math.cos(z * 0.05);
      return (n + 2) / 4; // Normalize to 0-1
    };
    
    let placedCount = 0;
    let attempts = 0;
    const maxAttempts = this.grassCount * 3; // Try up to 3x to place grass
    
    // Grass covers the entire scene (user can walk through it)
    while (placedCount < this.grassCount && attempts < maxAttempts) {
      attempts++;
      
      // Random position across the entire scene width and length
      const x = (Math.random() - 0.5) * this.width;
      const z = this.positionZ + (Math.random() - 0.5) * this.length;
      
      // Skip if in path area (middle corridor)
      if (this.pathWidth > 0 && Math.abs(x) < this.pathWidth / 2) {
        continue;
      }
      
      // Skip some positions for patchiness using noise
      if (this.patchiness > 0) {
        const noiseValue = noise(x, z);
        if (Math.random() < this.patchiness && noiseValue < 0.5) {
          continue; // Skip this position
        }
      }
      
      dummy.position.set(x, 0, z);
      
      // Random rotation around Y axis
      dummy.rotation.y = Math.random() * Math.PI * 2;
      
      // Random scale variation (height and width)
      const scaleVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      dummy.scale.set(
        scaleVariation * (0.8 + Math.random() * 0.4),
        scaleVariation,
        scaleVariation
      );
      
      dummy.updateMatrix();
      this.mesh.setMatrixAt(placedCount, dummy.matrix);
      placedCount++;
    }
    
    // If we didn't place all grass, update the count
    if (placedCount < this.grassCount) {
      console.log(`Placed ${placedCount} grass blades out of ${this.grassCount} requested`);
    }
    
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  
  update(deltaTime) {
    // Update time for wind animation
    this.time += deltaTime;
    if (this.mesh && this.mesh.material) {
      this.mesh.material.uniforms.time.value = this.time;
    }
  }
  
  getMesh() {
    return this.mesh;
  }
}

// ================================
// HILLY SHADER GRASS
// Green-to-yellow grass on rolling hills
// ================================

export class HillyShaderGrass {
  constructor(width, length, positionZ) {
    this.width = width;
    this.length = length;
    this.positionZ = positionZ;
    this.time = 0;
    
    // Grass configuration
    this.grassCount = 200000; // Number of grass blades (increased for complete coverage)
    this.grassHeight = 1.0; // Taller grass for better visibility
    this.grassWidth = 0.12; // Wider blades for better coverage
    
    // Hill configuration
    this.hillAmplitude = 3; // Height of hills
    this.hillFrequency = 0.1; // How wavy the hills are
    
    this.create();
  }
  
  create() {
    // Create the hilly terrain
    this.createTerrain();
    
    // Create instanced geometry for grass blades
    const geometry = this.createGrassGeometry();
    const material = this.createGrassMaterial();
    
    this.mesh = new THREE.InstancedMesh(geometry, material, this.grassCount);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    
    // Position each grass blade on the hills
    this.positionGrassBlades();
    
    return this.mesh;
  }
  
  createTerrain() {
    // Create hilly ground with displacement
    const geometry = new THREE.PlaneGeometry(this.width, this.length, 100, 100);
    
    // Displace vertices to create hills
    const positions = geometry.attributes.position.array;
    const halfLength = this.length / 2;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1]; // In PlaneGeometry, z is actually y
      
      // Create fade factor to flatten hills towards the end (negative z)
      // Fade over the last 30 units of the scene
      const fadeDistance = 30;
      const distanceFromEnd = halfLength + z; // Distance from the far end
      let fadeFactor = 1.0;
      
      if (distanceFromEnd < fadeDistance) {
        // Smooth fade from 1 to 0 using smoothstep
        fadeFactor = Math.max(0.01, distanceFromEnd / fadeDistance); // Minimum 0.01 to keep grass visible
        fadeFactor = fadeFactor * fadeFactor * (3 - 2 * fadeFactor); // smoothstep
      }
      
      // Create hills using sine waves, multiplied by fade factor
      // Offset to ensure terrain starts at y=0 (minimum height)
      const rawHeight = Math.sin(x * this.hillFrequency) * Math.cos(z * this.hillFrequency);
      const height = (rawHeight + 1) * this.hillAmplitude * fadeFactor / 2; // Range: 0 to hillAmplitude
      positions[i + 2] = height;
    }
    
    geometry.computeVertexNormals();
    
    // Create material for hills (brownish ground)
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b7355, // Brown earth color
      roughness: 0.9,
      metalness: 0.1
    });
    
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.position.set(0, 0, this.positionZ); // Start at y=0
    
    return this.terrain;
  }
  
  // Function to get terrain height at any x, z position
  getTerrainHeight(x, z) {
    // Transform world Z to match the local coordinate system used in terrain generation
    // After rotation, worldZ maps to -localY: localY = -(worldZ - this.positionZ)
    const adjustedZ = -(z - this.positionZ);
    const halfLength = this.length / 2;
    
    // Create fade factor to flatten hills towards the end (negative z)
    const fadeDistance = 30;
    const distanceFromEnd = halfLength + adjustedZ;
    let fadeFactor = 1.0;
    
    if (distanceFromEnd < fadeDistance) {
      // Smooth fade from 1 to 0 using smoothstep
      fadeFactor = Math.max(0.01, distanceFromEnd / fadeDistance); // Minimum 0.01 to keep grass visible
      fadeFactor = fadeFactor * fadeFactor * (3 - 2 * fadeFactor); // smoothstep
    }
    
    // Match terrain generation: offset to ensure minimum height is 0
    const rawHeight = Math.sin(x * this.hillFrequency) * Math.cos(adjustedZ * this.hillFrequency);
    return (rawHeight + 1) * this.hillAmplitude * fadeFactor / 2; // Range: 0 to hillAmplitude
  }
  
  createGrassGeometry() {
    // Create a simple blade of grass (triangle)
    const geometry = new THREE.BufferGeometry();
    
    // Vertices for a grass blade (wider at bottom, narrow at top)
    const vertices = new Float32Array([
      -this.grassWidth / 2, 0, 0,  // bottom left
      this.grassWidth / 2, 0, 0,   // bottom right
      0, this.grassHeight, 0        // top center
    ]);
    
    // UVs for texture mapping
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      0.5, 1
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    return geometry;
  }
  
  createGrassMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        grassBaseColor: { value: new THREE.Color(0x4a7c2b) },  // Green base
        grassTipColor: { value: new THREE.Color(0xd4af37) },   // Golden yellow tip
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vDisplacement;
        
        void main() {
          vUv = uv;
          
          vec3 pos = position;
          vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
          
          // Wind effect - sway grass based on position and time
          float windStrength = 0.4;
          float windSpeed = 1.2;
          
          // Use world position for variation
          float windNoise = sin(worldPosition.x * 0.5 + time * windSpeed) * 
                           cos(worldPosition.z * 0.5 + time * windSpeed * 0.7);
          
          // Only affect the top of the grass blade (based on y position)
          float heightFactor = uv.y; // 0 at bottom, 1 at top
          
          // Apply wind displacement
          worldPosition.x += windNoise * windStrength * heightFactor;
          worldPosition.z += sin(worldPosition.x * 0.3 + time * windSpeed * 0.5) * 
                            windStrength * 0.5 * heightFactor;
          
          vDisplacement = windNoise * heightFactor;
          
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 grassBaseColor;
        uniform vec3 grassTipColor;
        varying vec2 vUv;
        varying float vDisplacement;
        
        void main() {
          // Gradient from green base to yellow tip
          vec3 color = mix(grassBaseColor, grassTipColor, vUv.y);
          
          // Add slight variation based on displacement
          color += vDisplacement * 0.1;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
    
    return material;
  }
  
  positionGrassBlades() {
    const dummy = new THREE.Object3D();
    
    // Grass covers the entire scene
    for (let i = 0; i < this.grassCount; i++) {
      // Random position across the entire scene width and length
      const x = (Math.random() - 0.5) * this.width;
      const z = this.positionZ + (Math.random() - 0.5) * this.length;
      
      // Get terrain height at this position
      const terrainHeight = this.getTerrainHeight(x, z);
      
      dummy.position.set(x, terrainHeight, z);
      
      // Random rotation around Y axis
      dummy.rotation.y = Math.random() * Math.PI * 2;
      
      // Slight tilt to follow terrain slope (optional, can add normal calculation)
      // For now, keep upright with random variation
      dummy.rotation.z = (Math.random() - 0.5) * 0.2;
      
      // Random scale variation (height and width) - larger for better coverage
      const scaleVariation = 0.8 + Math.random() * 0.5; // 0.8 to 1.3
      dummy.scale.set(
        scaleVariation * (0.9 + Math.random() * 0.3),
        scaleVariation,
        scaleVariation
      );
      
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  
  update(deltaTime) {
    // Update time for wind animation
    this.time += deltaTime;
    if (this.mesh && this.mesh.material) {
      this.mesh.material.uniforms.time.value = this.time;
    }
  }
  
  getMesh() {
    return this.mesh;
  }
  
  getTerrain() {
    return this.terrain;
  }
}
