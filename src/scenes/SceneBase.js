import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class SceneBase extends THREE.Scene {
  constructor() {
    super()

    // Track objects for cleanup
    this.objects = []
  }

  // Called when scene becomes active
  enter() {}

  // Called every frame
  update() {}

  // Cleanup memory
  exit() {
    this.objects.forEach(obj => {
      obj.geometry?.dispose()
      obj.material?.dispose()
      this.remove(obj)
    })
  }
}
