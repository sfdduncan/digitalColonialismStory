// Audio zones configuration for MainScene
// Spatial crossfade is handled automatically by SceneAudioManager:
// volume fades in (cosine curve) over 15 units before entering a zone,
// and fades out over 15 units after leaving it.

export const mainSceneAudioZones = [

  // ── Scene 1: Arctic / Indigenous Stewardship (z=0 → -100) ──────────────────
  // Mapuche warrior/land ceremonial song — grounds the opening in Indigenous
  // relationships to land before colonisation
  {
    id: 'scene1_stewardship',
    audioSrc: 'audio/polar_wind.mp3',
    zStart: 0,
    zEnd: -100,
    volume: 0.05
  },

  // ── Scene 2: Forest / European Colonisation begins (z=-100 → -200) ─────────
  // Sara Curruchich is Maya Kaqchikel (Guatemala); "Kixampe" means "stand up"
  // in a Mayan language — directly mirrors the Maya Q'eqchi' narrative
  {
    id: 'scene2_colonization',
    audioSrc: 'audio/forest_birds.mp3',
    zStart: -100,
    zEnd: -200,
    volume: 0.2
  },

  // ── Scene 3: Grassland / Historical Resistance — AIM, Wounded Knee (z=-200 → -300)
  // "Somos Sur" (We Are the South) — Ana Tijoux ft. Shadia Mansour
  // Pan-South solidarity anthem connecting Latin American and Palestinian struggles
  {
    id: 'scene3_resistance',
    audioSrc: 'audio/grass_rustle.mp3',
    zStart: -200,
    zEnd: -300,
    volume: 0.2
  },

  // ── Scene 4: Mountain Pass / International Struggle — Standing Rock, UN (z=-300 → -400)
  // "Lucha Eterna" (Eternal Struggle) — multi-collective featuring Taki Amaru
  // (referencing Túpac Amaru II) and Black Mama, M. Ankayli, DJ Mic
  {
    id: 'scene4_struggle',
    audioSrc: 'audio/desert_sanddunes.mp3',
    zStart: -300,
    zEnd: -400,
    volume: 0.4
  },

  // ── Scene 5: Ocean / Fenix Mine / Panzós Massacre (z=-400 → -500) ──────────
  // Grone Aukan — "Extractivismo" — literally about extractivism;
  // mirrors the scene where the Fenix mine history and 1978 massacre unfold
  {
    id: 'scene5_extractivism',
    audioSrc: 'audio/ocean_waves.mp3',
    zStart: -400,
    zEnd: -500,
    volume: 0.3
  },

  // ── Scene 6: Tropical Rainforest / Guacamaya breach (z=-500 → -600) ────────
  // niñx debacle — "Muere la tierra, mueres tú" (If the land dies, you die)
  // Captures the urgency that drives Guacamaya's decision to breach the networks
  {
    id: 'scene6_guacamaya',
    audioSrc: 'audio/rainforest.mp3',
    zStart: -500,
    zEnd: -600,
    volume: 0.2
  },

  // ── Scene 7: Hack Corridor / Finale (z=-600 → -700) ────────────────────────
  // "Voces Kontra el Kapital — Action Without Borders"
  // Closes the story with collective, borderless resistance
  {
    id: 'scene7_finale',
    audioSrc: 'audio_hacktivista/Voces Kontra el Kapital - Kontra el proyecto del capitalismo, acción sin fronteras.mp3',
    zStart: -600,
    zEnd: -700,
    volume: 0.1
  }

];

// ========================================
// HACK SCENE AUDIO (intro corridor)
// ========================================
// Camera starts at z=35 and auto-moves to z=-90 before transitioning to MainScene
export const hackSceneAudioZones = [
  {
    id: 'hack_intro',
    audioSrc: 'audio_hacktivista/Hack Back! v2 (1).mp4',
    zStart: 35,
    zEnd: -100,
    volume: 0.1
  },
];


