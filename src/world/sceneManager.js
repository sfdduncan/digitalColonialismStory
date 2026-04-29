
import { HackScene } from '../scenes/hackScene.js';
import { MainScene } from '../scenes/mainScene.js';

export class SceneManager {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.isTransitioning = false;
    this.maxSceneNumber = 7;
    this.pendingSceneJump = null;
    this.pendingCreditsPreview = false;
    this.hackSceneMovementTimeout = null;
    
    // Aerial view toggle state
    this.isAerialView = false;
    this.savedCameraState = null;
    
    // Initialize scenes
    this.hackScene = new HackScene(camera);
    this.mainScene = null; // Lazy load when transitioning
    
    // Start with hack scene
    this.currentScene = this.hackScene;
    this.hackScene.setStartPosition(this.camera);

    // Failsafe: number keys jump to scenes
    this.handleNumericSceneJump = this.handleNumericSceneJump.bind(this);
    window.addEventListener('keydown', this.handleNumericSceneJump);
  }

  // Called after the fade-in completes — camera floats in place for 4 seconds then moves
  startHackSceneMovement() {
    this.cancelHackSceneMovement();

    this.hackSceneMovementTimeout = setTimeout(() => {
      this.hackSceneMovementTimeout = null;

      if (this.currentScene !== this.hackScene) {
        return;
      }

      if (this.controls.setAutoMoveEnabled) {
        this.controls.setAutoMoveEnabled(true);
      }
      // Start hack scene audio now that movement has begun
      if (this.hackScene.startAudio) {
        this.hackScene.startAudio();
      }
    }, 4000);  // Adjust this value (ms) to change how long camera floats before moving
  }

  cancelHackSceneMovement() {
    if (this.hackSceneMovementTimeout !== null) {
      clearTimeout(this.hackSceneMovementTimeout);
      this.hackSceneMovementTimeout = null;
    }

    if (this.controls.setAutoMoveEnabled) {
      this.controls.setAutoMoveEnabled(false);
    }
  }

  async update(renderer) {
    // Restrict camera within boundaries (unless in aerial view)
    if (!this.isAerialView && this.currentScene.restrictCamera) {
      this.currentScene.restrictCamera(this.camera);
    }
    
    // Update and render the scene
    if (this.currentScene.update) {
      // Calculate deltaTime
      const now = performance.now() * 0.001;
      if (!this.lastTime) this.lastTime = now;
      const deltaTime = now - this.lastTime;
      this.lastTime = now;
      
      const result = this.currentScene.update(this.camera.position, deltaTime, renderer);
      
      // Update vertical timeline based on camera position
      if (window.updateVerticalTimeline) {
        window.updateVerticalTimeline(this.camera.position.z);
      }
      
      // Handle scene transitions
      if (result && result.transition) {
        this.handleSceneTransition(result.nextScene);
      }
    }
    
    renderer.render(this.currentScene, this.camera);
  }

  handleSceneTransition(nextSceneName) {
    if (this.isTransitioning) return;

    if (nextSceneName === 'MainScene' && !this.mainScene) {
      this.isTransitioning = true;
      this.cancelHackSceneMovement();

      // Trigger initial flash transition effect
      if (window.triggerFlashTransition) {
        window.triggerFlashTransition();
      }
      
      // Clear hackScene subtitles immediately
      if (window.subtitleManager) {
        window.subtitleManager.clear();
      }
      
      // Wait briefly before switching (switch during flash)
      setTimeout(() => {
        if (this.currentScene.exit) {
          this.currentScene.exit();
        }

        // Create main scene (loads its own subtitles after hackScene has cleared)
        this.mainScene = new MainScene(this.camera);
        
        // Disable automatic movement and re-enable user controls
        this.cancelHackSceneMovement();
        if (this.controls.setControlsEnabled) {
          this.controls.setControlsEnabled(true);
        }
        if (this.controls.setMainSceneActive) {
          this.controls.setMainSceneActive(true);
        }
        
        // Switch to main scene
        this.currentScene = this.mainScene;
        
        // Set camera position for main scene (at the igloo)
        this.camera.position.set(0, 1.7, -5);

        // Apply pending scene jump from numeric failsafe (if any)
        if (this.pendingSceneJump !== null) {
          this.jumpToMainSceneSection(this.pendingSceneJump);
          this.pendingSceneJump = null;
        }

        if (this.pendingCreditsPreview && window.showCreditsOverlay) {
          window.showCreditsOverlay();
          this.pendingCreditsPreview = false;
        }
        
        // Disable subtitles until help menu is closed
        if (window.subtitleManager) {
          window.subtitleManager.disable();
        }
        
        // Show UI elements (timeline, help button, hamburger) and help overlay
        if (window.showMainSceneUI) {
          window.showMainSceneUI();
        }
        
        this.isTransitioning = false;
      }, 600); // Switch scene at peak of flash (30% of 2000ms)
    }
  }

  handleNumericSceneJump(event) {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;

    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    if (event.key.toLowerCase() === 'c') {
      if (this.currentScene !== this.mainScene) {
        this.pendingCreditsPreview = true;
        this.handleSceneTransition('MainScene');
        return;
      }

      if (window.showCreditsOverlay) {
        window.showCreditsOverlay();
      }
      return;
    }

    // Check for key 9 - toggle aerial view
    if (event.key === '9') {
      this.toggleAerialView();
      return;
    }

    if (!/^[1-9]$/.test(event.key)) return;

    const sceneNumber = parseInt(event.key, 10);
    if (sceneNumber < 1 || sceneNumber > this.maxSceneNumber) return;

    if (this.currentScene !== this.mainScene) {
      this.pendingSceneJump = sceneNumber;
      this.handleSceneTransition('MainScene');
      return;
    }

    this.jumpToMainSceneSection(sceneNumber);
  }

  toggleAerialView() {
    if (!this.isAerialView) {
      // Save current camera state
      this.savedCameraState = {
        position: this.camera.position.clone(),
        rotation: this.camera.rotation.clone()
      };
      
      // Disable camera position overrides in controls
      if (this.controls) {
        this.controls.aerialViewActive = true;
      }
      
      // Move to aerial view - high above, looking down
      const currentZ = this.camera.position.z;
      this.camera.position.set(0, 100, currentZ); // 200 units above, centered
      this.camera.rotation.set(-Math.PI / 2, 0, 0); // Look straight down
      
      this.isAerialView = true;
    } else {
      // Re-enable camera position overrides in controls
      if (this.controls) {
        this.controls.aerialViewActive = false;
      }
      
      // Restore saved camera state
      if (this.savedCameraState) {
        this.camera.position.copy(this.savedCameraState.position);
        this.camera.rotation.copy(this.savedCameraState.rotation);
      }
      
      this.isAerialView = false;
    }
  }

  jumpToMainSceneSection(sceneNumber) {
    if (!this.mainScene) return;

    this.cancelHackSceneMovement();

    // Build scenes progressively
    if (sceneNumber >= 2 && !this.mainScene.scene2Generated) {
      this.mainScene.buildScene2();
    }

    if (sceneNumber >= 3 && !this.mainScene.scene3Generated) {
      this.mainScene.buildScene3();
    }

    if (sceneNumber >= 4 && !this.mainScene.scene4Generated) {
      this.mainScene.buildScene4();
    }

    if (sceneNumber >= 5 && !this.mainScene.scene5Generated) {
      this.mainScene.buildScene5();
    }

    if (sceneNumber >= 6 && !this.mainScene.scene6Generated) {
      this.mainScene.buildScene6();
    }

    if (sceneNumber >= 7 && !this.mainScene.scene7Generated) {
      this.mainScene.buildScene7();
    }

    const sceneZPositions = {
      1: -5,
      2: -100,
      3: -200,
      4: -300,
      5: -400,
      6: -500,
      7: -600
    };

    this.camera.position.x = 0;
    this.camera.position.z = sceneZPositions[sceneNumber] ?? 10;

    this.mainScene.currentScene = sceneNumber;

    if (window.updateTimeline) {
      window.updateTimeline(sceneNumber);
    }

    if (window.updateTimelineProgress) {
      window.updateTimelineProgress(this.camera.position.z);
    }
  }
}
