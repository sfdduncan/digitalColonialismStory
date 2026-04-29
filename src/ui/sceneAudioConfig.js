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
    volume: 0.01
  },

  // ── Scene 2: Forest / European Colonisation begins (z=-100 → -200) ─────────
  // Sara Curruchich is Maya Kaqchikel (Guatemala); "Kixampe" means "stand up"
  // in a Mayan language — directly mirrors the Maya Q'eqchi' narrative
  {
    id: 'scene2_colonization',
    audioSrc: 'audio/forest_birds.mp3',
    zStart: -100,
    zEnd: -200,
    volume: 0.1
  },

  // ── Scene 3: Grassland / Historical Resistance — AIM, Wounded Knee (z=-200 → -300)
  // "Somos Sur" (We Are the South) — Ana Tijoux ft. Shadia Mansour
  // Pan-South solidarity anthem connecting Latin American and Palestinian struggles
  {
    id: 'scene3_resistance',
    audioSrc: 'audio/grass_rustle.mp3',
    zStart: -200,
    zEnd: -300,
    volume: 0.1
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
  {
    id: 'scene5_nature',
    audioSrc: 'audio/ocean_waves.mp3',
    zStart: -400,
    zEnd: -500,
    volume: 0.2
  },
  // "Guatemala No Se Vende" — Aurora Nohemí / Isaías Pérez
  // Directly names Guatemala; mirrors the Fenix mine and Panzós massacre narrative
  {
    id: 'scene5_hacktivista',
    audioSrc: 'audio_hacktivista/Guatemala no se vende - intro - Guatemala no se vende interpretada por Aurora Nohemí Autor： Isaías Perez.mp3',
    zStart: -400,
    zEnd: -500,
    volume: 0.45
  },

  // ── Scene 6: Tropical Rainforest / Guacamaya breach (z=-500 → -600) ────────
  {
    id: 'scene6_nature',
    audioSrc: 'audio/rainforest.mp3',
    zStart: -500,
    zEnd: -600,
    volume: 0.1
  },
  // Grone Aukan — "Extractivismo" — literally about extractivism;
  // captures the urgency behind Guacamaya's decision to breach the networks
  {
    id: 'scene6_hacktivista',
    audioSrc: 'audio_hacktivista/Extractivismo - Grone Aukan - Extractivismo.mp3',
    zStart: -500,
    zEnd: -600,
    volume: 0.45
  },

  // ── Scene 7: Hack Corridor / Finale (z=-600 → -700) ────────────────────────
  // niñx debacle — "Lo que somos" — plays the moment the user steps into scene 7
  {
    id: 'scene7_finale',
    audioSrc: 'audio_hacktivista/Lo que somos - Niñx debacle  Lo que somos.mp3',
    zStart: -600,
    zEnd: -700,
    volume: 0.6
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
    volume: 0.01
  },
];


// ============================================================
// SCHOLAR AUDIO TRIGGERS
// ============================================================
// One-shot clips drawn from scholars_audios/, played on top of
// the ambient zone audio via ScholarAudioManager.
// Each clip fades in over fadeInDuration seconds and fades out
// over fadeOutDuration seconds before it ends naturally.
// z — camera Z position that fires the trigger (fires once).

export const scholarAudioTriggers = [

  // ── Scene 1 ───────────────────────────────────────────────────────────────
  // After Deloria's "web of relations" card (subtitle trigger z=0)
  // Names the scale of what settler colonialism systematically did
  {
    z: -7,
    audioSrc: 'scholars_audios/Vine Deloria on Native Americans (1972)_clips/settler_colonialism_process.mp3',
    volume: 0.85,
    fadeInDuration: .25,
    fadeOutDuration: .25,
  },

  // ── Scene 2 ───────────────────────────────────────────────────────────────
  // After the first mechanisms-of-elimination card (subtitle trigger z=-85)
  // Wolfe naming the logic of elimination in his own voice
  {
    z: -92,
    audioSrc: 'scholars_audios/YTDown_YouTube_Learn-about-settler-colonialism-with-Pat_Media_xrEBcQLd4Vc_007_128k_clips/settlerColonialism_LogicOfElimination_Wolfe.mp3',
    volume: 0.85,
    fadeInDuration: .25,
    fadeOutDuration: .25,
  },

  // ── Scene 3 ───────────────────────────────────────────────────────────────
  // After the Ghost Dance card (subtitle trigger z=-208)
  // Deloria on land as the through-line before the Alcatraz card
  {
    z: -216,
    audioSrc: 'scholars_audios/Vine Deloria on Native Americans (1972)_clips/onDefenseofLand_Deloria.mp3',
    volume: 0.85,
    fadeInDuration: .25,
    fadeOutDuration: .25,
  },
  // After the Alcatraz occupation card (subtitle trigger z=-232)
  // Deloria reflecting on the moment before the narration moves to Zapatistas
  {
    z: -240,
    audioSrc: 'scholars_audios/Vine Deloria on Native Americans (1972)_clips/alcatraz_Deloria.mp3',
    volume: 0.85,
    fadeInDuration: .25,
    fadeOutDuration: .25,
  },

  // ── Scene 4 ───────────────────────────────────────────────────────────────
  // After Simpson's refusal card (subtitle trigger z=-318)
  // Her voice extending the definition before the narration moves to grounded normativity
  {
    z: -326,
    audioSrc: 'scholars_audios/Simpson_Mohawk_Interruptus_IGOV_clips/refusal_audra.mp3',
    volume: 0.85,
    fadeInDuration: .25,
    fadeOutDuration: .25,
  },
  // After the grounded normativity card (subtitle trigger z=-338)
  // Coulthard naming the hemispheric, connected nature of Indigenous resistance
  {
    z: -346,
    audioSrc: 'scholars_audios/Coulthard_Fanonian_Antinomies_SFU_2017_clips/panIndianism_Coulthard.mp3',
    volume: 0.85,
    fadeInDuration: .25,
    fadeOutDuration: .25,
  },

  // ── Scene 7 ───────────────────────────────────────────────────────────────
  // After the "what settler colonialism has always required" card (subtitle trigger z=-678)
  // Pierce on speculation before the narration applies kinstillation to Guacamaya
  {
    z: -686,
    audioSrc: 'scholars_audios/Indigenomicon and Speculative Relations： Indigenous Worlding and Repair_clips/onSpeculation_Pierce.mp3',
    volume: 0.85,
    fadeInDuration: .25,
    fadeOutDuration: .25,
  },

];


