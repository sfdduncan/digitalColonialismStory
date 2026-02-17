// ================================
// SCENE TEMPLATE
// Copy this method into MainScene.js to add new scenes
// ================================

// HOW TO ADD A NEW SCENE (e.g., Scene 4):
//
// 1. In MainScene constructor, add:
//    this.scene4Generated = false;
//
// 2. Copy the buildScene4() method below and paste it into MainScene.js after buildScene3()
//
// 3. In the update() method, add a generation trigger:
//    if (!this.scene4Generated && userPosition.z < -290) {
//      this.buildScene4();
//    }
//
// 4. In the update() method, add scene detection for timeline:
//    if (userPosition.z < -300) {
//      newScene = 4;
//    }
//
// 5. In src/ui/timeline.js, add to the scenes array:
//    { id: 4, label: 'Scene 4' }
//
// 6. Customize the content in buildScene4()

/*
  // ================================
  // SCENE 4: Your Scene Name
  // Position: z=-300 to z=-400
  // Only generates when user reaches this area
  // ================================
  buildScene4() {
    if (this.scene4Generated) return;
    this.scene4Generated = true;

    const scene4Z = -350; // Center of Scene 4

    // Ground - customize texture/color as needed
    const textureLoader = new THREE.TextureLoader();
    const ground4 = new THREE.Mesh(
      new THREE.PlaneGeometry(this.areaWidth, this.areaLength),
      new THREE.MeshStandardMaterial({ color: 0x808080 })
    );
    ground4.rotation.x = -Math.PI / 2;
    ground4.position.set(0, -0.01, scene4Z);
    this.add(ground4);

    // Add your models and objects here
    const loader = new GLTFLoader();
    
    // Example: Load and place models
    loader.load('./models/your_model.glb', (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, scene4Z);
      model.scale.set(1, 1, 1);
      this.add(model);
    });

    // Example: Create simple geometry
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    box.position.set(10, 2.5, scene4Z);
    this.add(box);
  }
*/

// SCENE POSITIONING REFERENCE:
// Scene 1: z=0 to z=-100 (center: -50, trigger: immediate)
// Scene 2: z=-100 to z=-200 (center: -150, trigger: z < -90)
// Scene 3: z=-200 to z=-300 (center: -250, trigger: z < -190)
// Scene 4: z=-300 to z=-400 (center: -350, trigger: z < -290)
// Scene 5: z=-400 to z=-500 (center: -450, trigger: z < -390)
// etc.

export default {};
