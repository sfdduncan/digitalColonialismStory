import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class CloudShader {
  constructor(sceneConfig = { centerZ: -450, spread: 40, count: 6 }) {
    this.sceneConfig = sceneConfig;
    
    // Vertex shader
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment shader - procedural clouds
    const fragmentShader = `
      #ifdef GL_ES
      precision mediump float;
      #endif

      uniform float time;
      uniform vec3 skyColor;
      uniform vec3 cloudColor;
      uniform vec3 cloudHighlightColor;
      
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      // Hash function for noise
      float hash(vec2 p) {
        float h = dot(p, vec2(127.1, 311.7));
        return fract(sin(h) * 43758.5453123);
      }

      // 2D noise function
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Fractal Brownian Motion for cloud shapes
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }

      void main() {
        // Animate clouds slowly
        vec2 cloudUv = vUv * 3.0;
        cloudUv.x += time * 0.02; // Slow drift
        
        // Create cloud pattern using FBM
        float cloudNoise = fbm(cloudUv);
        
        // Add another layer for depth
        float cloudNoise2 = fbm(cloudUv * 2.0 + vec2(time * 0.015, 0.0));
        cloudNoise = mix(cloudNoise, cloudNoise2, 0.5);
        
        // Create cloud threshold - fade out at edges
        float edgeFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
        edgeFade *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
        
        // Cloud density
        float cloudDensity = smoothstep(0.3, 0.7, cloudNoise) * edgeFade;
        
        // Add highlights to cloud tops
        float highlight = smoothstep(0.6, 0.8, cloudNoise) * edgeFade * 0.3;
        
        // Mix colors
        vec3 finalColor = mix(skyColor, cloudColor, cloudDensity);
        finalColor = mix(finalColor, cloudHighlightColor, highlight);
        
        // Cloud alpha
        float alpha = cloudDensity * 0.85;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    this.uniforms = {
      time: { value: 0.0 },
      skyColor: { value: new THREE.Color(0x87ceeb) },
      cloudColor: { value: new THREE.Color(0xffffff) },
      cloudHighlightColor: { value: new THREE.Color(0xfff8e7) }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    // Create cloud planes at different positions and heights
    this.clouds = [];
    this.createCloudLayers();
  }

  createCloudLayers() {
    // Create multiple cloud layers for depth based on scene config
    const { centerZ, spread, count } = this.sceneConfig;
    const cloudConfigs = this.generateCloudPositions(centerZ, spread, count);

    cloudConfigs.forEach(config => {
      const geometry = new THREE.PlaneGeometry(config.width, config.height);
      const material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: this.getVertexShader(),
        fragmentShader: this.getFragmentShader(),
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending
      });

      const cloud = new THREE.Mesh(geometry, material);
      cloud.position.set(config.x, config.y, config.z);
      cloud.rotation.z = config.rotation;
      
      this.clouds.push(cloud);
    });
  }

  // Generate cloud positions based on scene parameters
  generateCloudPositions(centerZ, spread, count) {
    const positions = [];
    
    for (let i = 0; i < count; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 80,
        y: 15 + Math.random() * 12,
        z: centerZ + (Math.random() - 0.5) * spread,
        width: 40 + Math.random() * 35,
        height: 15 + Math.random() * 12,
        rotation: (Math.random() - 0.5) * 0.4
      });
    }
    
    return positions;
  }

  getVertexShader() {
    return `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  getFragmentShader() {
    return `
      #ifdef GL_ES
      precision mediump float;
      #endif

      uniform float time;
      uniform vec3 skyColor;
      uniform vec3 cloudColor;
      uniform vec3 cloudHighlightColor;
      
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      float hash(vec2 p) {
        float h = dot(p, vec2(127.1, 311.7));
        return fract(sin(h) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }

      void main() {
        vec2 cloudUv = vUv * 3.0;
        cloudUv.x += time * 0.02;
        
        float cloudNoise = fbm(cloudUv);
        float cloudNoise2 = fbm(cloudUv * 2.0 + vec2(time * 0.015, 0.0));
        cloudNoise = mix(cloudNoise, cloudNoise2, 0.5);
        
        float edgeFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
        edgeFade *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
        
        float cloudDensity = smoothstep(0.3, 0.7, cloudNoise) * edgeFade;
        float highlight = smoothstep(0.6, 0.8, cloudNoise) * edgeFade * 0.3;
        
        vec3 finalColor = mix(skyColor, cloudColor, cloudDensity);
        finalColor = mix(finalColor, cloudHighlightColor, highlight);
        
        float alpha = cloudDensity * 0.85;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
  }

  update(deltaTime) {
    this.uniforms.time.value += deltaTime;
  }

  getClouds() {
    return this.clouds;
  }

  dispose() {
    this.clouds.forEach(cloud => {
      if (cloud.geometry) cloud.geometry.dispose();
      if (cloud.material) cloud.material.dispose();
    });
    this.clouds = [];
  }
}
