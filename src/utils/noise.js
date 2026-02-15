// Simple procedural stone texture generator using canvas and noise
export function generateStoneTexture(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Basic noise generation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Perlin/simple noise
      const value = Math.floor(Math.random() * 100 + 155 + 40 * Math.sin(x * 0.05 + y * 0.05));
      ctx.fillStyle = `rgb(${value},${value - 20},${value - 40})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Create THREE texture
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(100, 100);
  return texture;
}