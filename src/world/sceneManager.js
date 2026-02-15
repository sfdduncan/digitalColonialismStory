
import { MainScene } from '../scenes/MainScene.js';
import { Scene3 } from '../scenes/Scene3.js';

export class SceneManager {
  constructor(camera) {
    this.camera = camera;
    this.mainScene = new MainScene(this.camera);
    this.scene3 = new Scene3();
    this.currentScene = this.mainScene;
    this.inScene3 = false;
  }

  async update(renderer) {
    // Check for scene transition (z < -300 triggers Scene3)
    if (!this.inScene3 && this.camera.position.z < -300) {
      this.inScene3 = true;
      if (this.currentScene.exit) this.currentScene.exit();
      await this.scene3.enter();
      this.currentScene = this.scene3;
      // Optionally, set camera position for Scene3
      this.camera.position.set(0, 10, 10);
      this.camera.lookAt(0, 0, 0);
    }

    // Restrict camera within world boundaries if defined
    if (this.currentScene.restrictCamera) {
      this.currentScene.restrictCamera(this.camera);
    }
    // Update and render the current scene
    if (this.currentScene.update) {
      this.currentScene.update(this.camera.position);
    }
    renderer.render(this.currentScene, this.camera);
  }
}
