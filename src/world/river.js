/**
 * River.js — Flowing water along a winding curve
 * 
 * Creates a curved river with animated flowing water shader
 * 
 * Usage:
 *   const myRiver = new river({ waterColor: new THREE.Color(0x184D72) });
 *   scene.add(myRiver);
 *   
 *   // In render loop:
 *   myRiver.update(deltaTime);
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class river extends THREE.Object3D {
  constructor(options = {}) {
    super();
    
    const controlPoints = options.controlPoints || [
      new THREE.Vector3(0, 0.1, -300),
      new THREE.Vector3(-6, 0.1, -325),
      new THREE.Vector3(4, 0.1, -350),
      new THREE.Vector3(-4, 0.1, -375),
      new THREE.Vector3(6, 0.1, -387.5),
      new THREE.Vector3(0, 0.1, -400)
    ];
    
    const riverWidth = options.riverWidth || 8;
    const waterColor = options.waterColor || new THREE.Color(0x184D72);
    
    // Create spline curve for winding river
    this.riverCurve = new THREE.CatmullRomCurve3(controlPoints);
    this.riverWidth = riverWidth;
    this.waterColor = waterColor;
    
    // Create flowing water mesh
    this.createWaterMesh();
    
    this._time = 0;
  }
  
  createWaterMesh() {
    const segments = 150;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const indices = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = this.riverCurve.getPoint(t);
      const tangent = this.riverCurve.getTangent(t);
      
      // Perpendicular vector for river width
      const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      
      // Left and right edges
      const leftPoint = point.clone().add(perpendicular.clone().multiplyScalar(this.riverWidth / 2));
      const rightPoint = point.clone().sub(perpendicular.clone().multiplyScalar(this.riverWidth / 2));
      
      vertices.push(leftPoint.x, leftPoint.y, leftPoint.z);
      vertices.push(rightPoint.x, rightPoint.y, rightPoint.z);
      
      // UVs for texture mapping
      uvs.push(0, t * 10);
      uvs.push(1, t * 10);
      
      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Flowing water shader
    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: this.waterColor },
        flowSpeed: { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float time;
        uniform float flowSpeed;
        
        // Noise function for waves
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          vec3 pos = position;
          
          // Flowing waves
          float flowCoord = vUv.y - time * flowSpeed;
          float wave1 = sin(flowCoord * 3.0 + vUv.x * 2.0) * 0.05;
          float wave2 = sin(flowCoord * 5.0 - vUv.x * 3.0) * 0.03;
          
          // Noise-based ripples
          vec2 noiseCoord = vec2(vUv.x * 3.0, flowCoord * 2.0);
          float ripple = noise(noiseCoord) * 0.04;
          
          pos.y += wave1 + wave2 + ripple;
          
          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 waterColor;
        uniform float flowSpeed;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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
        
        void main() {
          // Flowing UV coordinates
          vec2 flowUV = vUv;
          flowUV.y -= time * flowSpeed * 0.2;
          
          // Animated surface patterns
          float pattern1 = noise(flowUV * 4.0);
          float pattern2 = noise(flowUV * 8.0 + time * 0.1);
          float pattern3 = noise(flowUV * 12.0 - time * 0.15);
          float surface = pattern1 * 0.4 + pattern2 * 0.3 + pattern3 * 0.3;
          
          // Depth variation
          float edgeDist = abs(vUv.x - 0.5) * 2.0;
          float depth = 1.0 - edgeDist * 0.2;
          
          // Lighting
          vec3 viewDir = normalize(-vPosition);
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
          
          float diff = max(dot(vNormal, lightDir), 0.0) * 0.7 + 0.3;
          
          // Specular highlights
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0) * 0.4;
          
          // Fresnel effect
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0) * 0.3;
          
          // Combine
          vec3 col = waterColor * diff * (depth * 0.8 + surface * 0.2);
          col += vec3(spec);
          col += vec3(fresnel) * vec3(0.6, 0.8, 1.0);
          
          gl_FragColor = vec4(col, 0.92);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true
    });
    
    this._mesh = new THREE.Mesh(geometry, waterMaterial);
    this.add(this._mesh);
    
    console.log('River: Water mesh created with', segments, 'segments');
  }
  
  update(deltaTime = 0.016) {
    this._time += deltaTime;
    if (this._mesh && this._mesh.material.uniforms) {
      this._mesh.material.uniforms.time.value = this._time;
    }
  }
}