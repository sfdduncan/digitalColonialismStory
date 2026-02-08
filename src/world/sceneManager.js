import { SceneOne } from '../scenes/SceneOne.js'
import { SceneTwo } from '../scenes/SceneTwo.js'

export class SceneManager {
  constructor(camera) {
    this.camera = camera

    // Initialize scenes
    this.scenes = {
      one: new SceneOne(),
      two: new SceneTwo()
    }

    // Start with scene one
    this.activeScene = this.scenes.one
  }

  update() {
    // Switch scene when player crosses threshold
    if (this.camera.position.z < -20 && this.activeScene !== this.scenes.two) {
      this.switchTo('two')
    }

    this.activeScene.update()
  }

  switchTo(name) {
    // Cleanup old scene
    this.activeScene.exit()

    // Activate new scene
    this.activeScene = this.scenes[name]
    this.activeScene.enter()
  }
}
