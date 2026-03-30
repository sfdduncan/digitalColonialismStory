import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class OceanShader {
  constructor() {
    // Vertex shader - simple passthrough
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Fragment shader - ocean rendering with top-down camera to fill the quad
    const fragmentShader = `
      #ifdef GL_ES
      precision mediump float;
      #endif

      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;

      const int NUM_STEPS = 8;
      const float PI = 3.1415;
      const float EPSILON = 1e-3;
      // Sea parameters
      const int ITER_GEOMETRY = 3;
      const int ITER_FRAGMENT = 8;
      const float SEA_HEIGHT = 0.6;
      const float SEA_CHOPPY = 4.0;
      const float SEA_SPEED = 0.3;
      const float SEA_FREQ = 0.25;
      const vec3 SEA_BASE = vec3(0.3, 0.5, 0.5);
      const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);

      #define SEA_TIME time * SEA_SPEED

      float hash(vec2 p) {
        float h = dot(p,vec2(127.1,311.7));	
        return fract(sin(h)*43758.5453123);
      }
      
      float noise(in vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);	
        vec2 u = f*f*(3.0-2.0*f);
        return -1.0+2.0*mix(mix(hash(i + vec2(0.0,0.0)), 
                         hash(i + vec2(1.0,0.0)), u.x),
                    mix(hash(i + vec2(0.0,1.0)), 
                         hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      // lighting
      float diffuse(vec3 n,vec3 l,float p) { 
        return pow(dot(n,l) * 0.4 + 0.6,p); 
      }
      
      float specular(vec3 n,vec3 l,vec3 e,float s) {    
        float nrm = (s + 8.0) / (3.1415 * 8.0);
        return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
      }

      // sea
      float sea_octave(vec2 uv, float choppy) {
        uv += noise(uv);        
        vec2 wv = 1.0-abs(sin(uv));
        vec2 swv = abs(cos(uv));    
        wv = mix(wv,swv,wv);
        return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
      }

      float map_detailed(vec3 p) {
        float freq = SEA_FREQ;
        float amp = SEA_HEIGHT;
        float choppy = SEA_CHOPPY;
        vec2 uv = p.xz; 
        uv.x *= 0.75;
        mat2 m = mat2(1.6,1.2,-1.2,1.6);
        
        float d, h = 0.0;    
        for(int i = 0; i < ITER_FRAGMENT; i++) {        
          d = sea_octave((uv+SEA_TIME)*freq,choppy);
          d += sea_octave((uv-SEA_TIME)*freq,choppy);
          h += d * amp;        
          uv *= m; 
          freq *= 1.9; 
          amp *= 0.22;
          choppy = mix(choppy,1.0,0.2);
        }
        return h;
      }

      vec3 getNormal(vec3 p, float eps) {
        vec3 n;
        float h = map_detailed(p);
        n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - h;
        n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - h;
        n.y = eps;
        return normalize(n);
      }

      // main
      void main() {
        // Map vUv directly to world-space xz position on the plane
        // Scale controls how "zoomed in" the wave pattern is
        float scale = 20.0;
        vec3 p = vec3(
          (vUv.x - 0.5) * scale,
          SEA_HEIGHT,
          (vUv.y - 0.5) * scale + time * 0.5
        );

        float h = map_detailed(p);
        p.y = h;

        vec3 n = getNormal(p, 0.01);

        vec3 eye = normalize(vec3(0.0, -1.0, 0.0)); // looking straight down
        vec3 light = normalize(vec3(0.0, 1.0, 0.8));

        // Fresnel
        float fresnel_o = 1.0 - max(dot(n, -eye), 0.0);
        float fresnel = pow(fresnel_o, 3.0) * 0.65;
        vec3 refl = vec3(0.3, 0.4, 0.5);

        vec3 color = SEA_BASE;
        color = mix(color, refl, fresnel);

        // Wave peak highlights
        color += SEA_WATER_COLOR * (h - SEA_HEIGHT) * 0.5;

        // Lighting
        color += vec3(diffuse(n, light, 60.0) * SEA_WATER_COLOR) * 0.12;
        color += vec3(specular(n, light, eye, 60.0));

        // Post
        color = pow(color, vec3(0.75));

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.uniforms = {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      depthWrite: true,
      depthTest: true
    });

    const geometry = new THREE.PlaneGeometry(100, 100, 64, 64);
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Rotated 90 degrees along x-axis from original position
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = -450;
  }

  update(deltaTime) {
    this.uniforms.time.value += deltaTime;
  }

  getMesh() {
    return this.mesh;
  }
}