// ================================
// SCENE MANAGER
// Manages scene transitions
// ================================

import { HackScene } from '/src/scenes/HackScene.js';
import { MainScene } from '/src/scenes/mainScene.js';

export class SceneManager {
  constructor(camera) {
    this.camera = camera;
    
    // Initialize scenes
    this.hackScene = new HackScene(camera);
    this.mainScene = null; // Lazy load when transitioning
    
    // Start with hack scene
    this.currentScene = this.hackScene;
    this.hackScene.setStartPosition(this.camera);
  }

  async update(renderer) {
    // Restrict camera within boundaries
    if (this.currentScene.restrictCamera) {
      this.currentScene.restrictCamera(this.camera);
    }
    
    // Update and render the scene
    if (this.currentScene.update) {
      const result = this.currentScene.update(this.camera.position);
      
      // Handle scene transitions
      if (result && result.transition) {
        this.handleSceneTransition(result.nextScene);
      }
    }
    
    renderer.render(this.currentScene, this.camera);
  }

  handleSceneTransition(nextSceneName) {
    if (nextSceneName === 'MainScene' && !this.mainScene) {
      // Trigger initial flash transition effect
      if (window.triggerFlashTransition) {
        window.triggerFlashTransition();
      }
      
      // Wait briefly before switching (switch during flash)
      setTimeout(() => {
        // Create main scene (which triggers another flash)
        this.mainScene = new MainScene(this.camera);
        
        // Exit current scene
        if (this.currentScene.exit) {
          this.currentScene.exit();
        }
        
        // Switch to main scene
        this.currentScene = this.mainScene;
        
        // Set camera position for main scene (at the igloo)
        this.camera.position.set(0, 10, 10);
        
        // Show UI elements (timeline, help button, hamburger)
        if (window.showMainSceneUI) {
          window.showMainSceneUI();
        }
        
        console.log('Transitioned to MainScene');
      }, 200); // Switch scene at peak of flash (25% of 800ms)
    }
  }
}
