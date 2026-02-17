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
  // Position them at the actual scene boundaries
  const scenes = [
    { id: 1, label: 'Scene 1', position: 0 },       // z=0 (start)
    { id: 2, label: 'Scene 2', position: 33.33 },   // z=-100 (33.33% of journey)
    { id: 3, label: 'Scene 3', position: 66.67 }    // z=-200 (66.67% of journey)
    // Add more scenes as needed
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

export function updateTimelineProgress(zPosition, totalScenes = 3) {
  // Scene boundaries
  const sceneBoundaries = [
    { start: 0, end: -100 },    // Scene 1
    { start: -100, end: -200 }, // Scene 2
    { start: -200, end: -300 }  // Scene 3
  ];
  
  // Total z range
  const totalStart = 0;
  const totalEnd = -300;
  const totalRange = Math.abs(totalEnd - totalStart);
  
  // Clamp position to valid range
  const clampedZ = Math.max(totalEnd, Math.min(totalStart, zPosition));
  
  // Calculate progress as percentage (0 to 1)
  const progress = Math.abs(clampedZ - totalStart) / totalRange;
  
  // Update progress ball position (0% to 100% of timeline width)
  const progressBall = document.getElementById('timeline-progress');
  if (progressBall) {
    progressBall.style.left = `${progress * 100}%`;
  }
}
