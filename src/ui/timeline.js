// Timeline progress indicator

export function initializeTimeline() {
  // Create timeline container
  const timeline = document.createElement('div');
  timeline.id = 'scene-timeline';
  
  // Create background line
  const backgroundLine = document.createElement('div');
  backgroundLine.className = 'timeline-background';
  timeline.appendChild(backgroundLine);
  
  // Create timeline points for each scene
// 7 dots evenly spaced 0–100%; Scene 7 dot is the endpoint of the line
const scenes = [
  { id: 1, label: 'Scene 1', position: 0 },
  { id: 2, label: 'Scene 2', position: 16.67 },
  { id: 3, label: 'Scene 3', position: 33.33 },
  { id: 4, label: 'Scene 4', position: 50 },
  { id: 5, label: 'Scene 5', position: 66.67 },
  { id: 6, label: 'Scene 6', position: 83.33 },
  { id: 7, label: 'Scene 7', position: 100 }
];
  
  scenes.forEach((scene) => {
    const point = document.createElement('div');
    point.className = 'timeline-point';
    point.setAttribute('data-scene', scene.id);
    point.setAttribute('title', scene.label);
    point.style.left = `${scene.position}%`;
    timeline.appendChild(point);
  });
  
  // Add progress indicator ball
  const progressBall = document.createElement('div');
  progressBall.id = 'timeline-progress';
  timeline.appendChild(progressBall);
  
  document.body.appendChild(timeline);
  
  // Set initial scene as active
  updateTimeline(1);
  updateTimelineProgress(10); // Start at igloo (z=10)
}

export function updateTimeline(sceneNumber) {
  const points = document.querySelectorAll('.timeline-point');
  
  points.forEach((point) => {
    const pointScene = parseInt(point.getAttribute('data-scene'));
    
    if (pointScene < sceneNumber) {
      // Completed scenes
      point.classList.add('completed');
      point.classList.remove('active');
    } else if (pointScene === sceneNumber) {
      // Current scene
      point.classList.add('active');
      point.classList.remove('completed');
    } else {
      // Future scenes
      point.classList.remove('completed', 'active');
    }
  });
}

export function updateTimelineProgress(zPosition) {
  // Range: z=0 (Scene 1 start) to z=-600 (Scene 7 start = last dot)
  const totalStart = 0;
  const totalEnd = -600;
  const totalRange = Math.abs(totalEnd - totalStart);

  // Clamp so ball never exceeds the last dot
  const clampedZ = Math.max(totalEnd, Math.min(totalStart, zPosition));

  // Calculate progress as percentage (0 to 100)
  const progress = Math.abs(clampedZ - totalStart) / totalRange;

  const progressBall = document.getElementById('timeline-progress');
  if (progressBall) {
    progressBall.style.left = `${progress * 100}%`;
  }
}
