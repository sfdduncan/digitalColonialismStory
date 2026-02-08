export function startLoop(renderer, camera, sceneManager, controls) {

  function animate() {
    requestAnimationFrame(animate)

    // Update controls
    if (controls.update) {
      controls.update()
    }

    // Update current scene logic
    sceneManager.update()

    // Render active scene
    renderer.render(sceneManager.activeScene, camera)
  }

  animate()
}
