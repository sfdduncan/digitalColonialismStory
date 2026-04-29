// imageCorridor.js
// Cascade-reveals image wall meshes from nearest the user to farthest down the corridor.

const STAGGER_MS = 80;   // delay between each image reveal
const FADE_MS    = 300;  // duration of each individual fade-in


export function startCorridorCascade(meshes) {
  if (!meshes || meshes.length === 0) return;

  // Sort nearest → farthest (player enters from Scene 6 side, so highest z is nearest)
  const sorted = [...meshes].sort((a, b) => b.position.z - a.position.z);

  sorted.forEach((mesh, index) => {
    setTimeout(() => {
      fadeInMesh(mesh);
    }, index * STAGGER_MS);
  });
}

function fadeInMesh(mesh) {
  const startTime = performance.now();

  function tick() {
    const t = Math.min((performance.now() - startTime) / FADE_MS, 1);
    if (mesh.material) {
      mesh.material.opacity = t;
    }
    if (t < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}
