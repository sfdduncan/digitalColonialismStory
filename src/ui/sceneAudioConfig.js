// Audio zones configuration for MainScene
// Define background audio for different sections of the journey

export const mainSceneAudioZones = [
{
    id: 'scene1_opening',
    audioSrc: 'audio/polar_wind.mp3',  // PATH TO EDIT: Your audio file
    zStart: 0,                              // Z-POSITION TO EDIT: Zone start
    zEnd: -100,                             // Z-POSITION TO EDIT: Zone end
    volume: 0.01                           // VOLUME TO EDIT: 0.0 (silent) to 1.0 (full)
  },
  
  // ========================================
  // ZONE 2: Middle section
  // ========================================
  // LINE TO EDIT: Change these values for your second scene
  {
    id: 'scene2_middle',
    audioSrc: 'audio/forest_birds.mp3',  // PATH TO EDIT
    zStart: -100,                           // Z-POSITION TO EDIT
    zEnd: -200,                             // Z-POSITION TO EDIT
    volume: 0.3                             // VOLUME TO EDIT
  },
  
  // ========================================
  // ZONE 3: Later section
  // ========================================
  // LINE TO EDIT: Change these values for your third scene
  {
    id: 'scene3_later',
    audioSrc: 'audio/scene3_ambient.mp3',  // PATH TO EDIT
    zStart: -200,                           // Z-POSITION TO EDIT
    zEnd: -300,                             // Z-POSITION TO EDIT
    volume: 0.85                            // VOLUME TO EDIT
  },
  
  // ========================================
  // ADD MORE ZONES AS NEEDED
  // ========================================
  // Copy the structure above to add more audio zones
  // Example:
  // {
  //   id: 'scene4_final',
  //   audioSrc: 'audio/scene4_ambient.mp3',
  //   zStart: -300,
  //   zEnd: -400,
  //   volume: 1.0
  // },
];

// ========================================
// HACK SCENE AUDIO (intro corridor)
// ========================================
// Camera starts at z=25 and transitions to MainScene at z=-90
export const hackSceneAudioZones = [
  {
    id: 'hack_corridor',
    audioSrc: 'audio/Hack Back! v2 (1).mp4',    // PATH TO EDIT: Your hack scene audio file
    zStart: 10,                             // Z-POSITION TO EDIT: Start (behind camera)
    zEnd: -100,                             // Z-POSITION TO EDIT: End (past transition)
    volume: 0.05                            // VOLUME TO EDIT: 0.0 to 1.0
  },
];


