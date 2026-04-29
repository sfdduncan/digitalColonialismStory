// Three.js via import map
import * as THREE from 'three'

// Engine
import { createRenderer } from './src/engine/renderer.js'
import { createCamera } from './src/engine/camera.js'
import { createControls } from './src/engine/controls.js'
import { startLoop } from './src/engine/loop.js'

// World
import { SceneManager } from './src/world/sceneManager.js'

// UI
import { initializeHelpUI } from './src/ui/helpUI.js'
import { runUiTour } from './src/ui/uiTour.js'
import { initializeTimeline, updateTimeline, updateTimelineProgress } from './src/ui/timeline.js'
import { subtitleManager } from './src/ui/subtitleManager.js'
import { initializeVerticalTimeline, updateVerticalTimeline } from './src/ui/verticalTimeline.js'
import { archiveImagesManager } from './src/ui/archiveImagesManager.js'

// Make timeline functions and subtitle manager globally accessible for scene manager
window.updateTimeline = updateTimeline;
window.updateTimelineProgress = updateTimelineProgress;
window.subtitleManager = subtitleManager;
window.updateVerticalTimeline = updateVerticalTimeline;

const bibliography = {
  books: [
    `Barker, Joanne. <em>Red Scare: The State's Indigenous Terrorist.</em> Oakland: University of California Press, 2021.`,
    `Barnd, Natchee Blu. <em>Native Space: Geographic Strategies to Unsettle Settler Colonialism.</em> Corvallis: Oregon State University Press, 2017.`,
    `Byrd, Jodi A. <em>Indigenomicon: American Indians, Video Games, and the Structures of Dispossession.</em> Durham: Duke University Press, 2025.`,
    `Coulthard, Glen. <em>Red Skin, White Masks: Rejecting the Colonial Politics of Recognition.</em> Minneapolis: University of Minnesota Press, 2014.`,
    `Deloria, Vine. <em>God Is Red: A Native View of Religion.</em> Golden, CO: Fulcrum Publishing, 1973.`,
    `Estes, Nick. <em>Our History Is the Future: Standing Rock Versus the Dakota Access Pipeline, and the Long Tradition of Indigenous Resistance.</em> London: Verso, 2019.`,
    `Miranda, Deborah. <em>Bad Indians: A Tribal Memoir.</em> Berkeley: Heyday Books, 2013.`,
    `Simpson, Audra. <em>Mohawk Interruptus: Political Life Across the Borders of Settler States.</em> Durham: Duke University Press, 2014.`,
    `Simpson, Leanne Betasamosake. <em>As We Have Always Done: Indigenous Freedom Through Radical Resistance.</em> Minneapolis: University of Minnesota Press, 2017.`,
    `Stark, Heidi Kiiwetinepinesiik. "Criminal Empire: The Making of the Savage in a Lawless Land." <em>Theory & Event</em> 19, no. 4 (2016).`,
    `Wolfe, Patrick. "Settler Colonialism and the Elimination of the Native." <em>Journal of Genocide Research</em> 8, no. 4 (2006): 387–409.`,
  ],
  online: [
    `The Alley Newspaper. "1977 UN Geneva Conference—Dick Bancroft: Champion with a Camera." <em>The Alley,</em> October 2018. https://alleynews.org/2018/10/1977-un-geneva-conference-dick-bancroft-champion-with-a-camera.`,
    `ArcGIS StoryMaps. "Indigenous Boarding Schools." Accessed April 2026. https://storymaps.arcgis.com/stories/d13c4bfd0ab64cddaf54da6695b654f0.`,
    `Art Canada Institute. "Robert Houle: Biography." <em>Robert Houle: Life & Work.</em> Edited by Shirley Madill. Toronto: Art Canada Institute, n.d. https://www.aci-iac.ca/art-books/robert-houle/biography.`,
    `BC Foster Parents Association. "Residential Schools." <em>BC Foster Parents.</em> Accessed April 2026. https://bcfosterparents.ca/project/residential-schools.`,
    `Besaw, Mindy, and Beth Harris. "Hock E Aye Vi Edgar Heap of Birds, Native Hosts (Arkansas)." <em>Smarthistory,</em> March 7, 2020. https://smarthistory.org/hock-e-aye-vi-edgar-heap-of-birds-native-hosts-arkansas.`,
    `CBC News. "Ashamed of My Faith: Catholics Battling Religion after Discovery." CBC, June 2021. https://www.cbc.ca/news/canada/saskatchewan/ashamed-my-faith-catholics-battling-religion-discovery-1.6081426.`,
    `CBS News. "Canada Residential Schools: Unmarked Graves of Indigenous Children." <em>60 Minutes,</em> February 12, 2023. https://www.cbsnews.com/news/canada-residential-schools-unmarked-graves-indigenous-children-60-minutes-2023-02-12.`,
    `Charley, Avis. <em>Avis Charley Art.</em> Accessed April 2026. https://www.avischarleyart.com.`,
    `Enlace Hacktivista. "Extractivist Leaks." Accessed April 2026. https://enlacehacktivista.org/index.php/Extractivist_Leaks/es.`,
    `Estes, Nick. "The U.S. Stole Generations of Indigenous Children to Open the West." <em>High Country News</em> 51, no. 17, September 2019. https://www.hcn.org/issues/51-17/indigenous-affairs-the-us-stole-generations-of-indigenous-children-to-open-the-west.`,
    `Hood Museum of Art, Dartmouth. Object 2008.60. Accessed April 2026. https://hoodmuseum.dartmouth.edu/objects/2008.60.`,
    `International Indian Treaty Council. "Historic News." Accessed April 2026. https://www.iitc.org/historic-news.`,
    `International Peoples Democratic Uhuru Movement. "Geneva Conference." Accessed April 2026. https://ipdpowwow.org/geneva-conference.`,
    `International People's Democratic Movement. "From Kanehsatake to Wetsuweten: Onwards for Self-Determination." Accessed April 2026. https://www.ipmsdl.org/statement/from-kanehsatake-to-wetsuweten-onwards-for-self-determination.`,
    `Katilvik. "Inuit Art Timeline." Accessed April 2026. https://katilvik.com/inuit-art-timeline.`,
    `KPBS. "We Shall Remain: Wounded Knee." KPBS, May 8, 2009. https://www.kpbs.org/news/arts-culture/2009/05/08/we-shall-remain-wounded-knee.`,
    `Library of Congress. Photograph. Resource cph.3c25485. Washington, DC: Library of Congress Prints and Photographs Division. https://www.loc.gov/pictures/resource/cph.3c25485.`,
    `Marin, Nicolas, and Melissa Vida. "'Hacking Should Be Used to Wake Up and Rebel,' Says Hacker Group Guacamaya." <em>Global Voices,</em> January 10, 2023. https://globalvoices.org/2023/01/10/hacking-should-be-used-to-wake-up-and-rebel-says-hacker-group-guacamaya.`,
    `McQuillen, Charles. "George Catlin Indian Gallery: English Language Arts Lesson Plan." CharlesMcQuillen.com, August 21, 2019. https://charlesmcquillen.com/george-catlin-indian-gallery-english-language-arts-lesson-plan.`,
    `The Metropolitan Museum of Art. "Native Perspectives." In conjunction with <em>Art of Native America: The Charles and Valerie Diker Collection.</em> New York: The Metropolitan Museum of Art, 2019. https://www.metmuseum.org/perspectives/native-perspectives.`,
    `Minnesota Public Radio News. "From the Archives: The Sounds of the 1973 Wounded Knee Occupation." MPR News, March 7, 2017. https://www.mprnews.org/story/2017/03/07/history-wounded-knee.`,
    `Moretti-Langholtz, Danielle. <em>Rising: The American Indian Movement and the Third Space of Sovereignty.</em> Virtual exhibition. Williamsburg, VA: Muscarelle Museum of Art, William & Mary, 2020. https://muscarelle.wm.edu/rising/shared-ideologies.`,
    `Moretti-Langholtz, Danielle. <em>Shared Ideologies.</em> Williamsburg, VA: Muscarelle Museum of Art, William & Mary, 2021–2022. https://muscarelle.wm.edu/rising/shared-ideologies.`,
    `National Gallery of Art. <em>The Land Carries Our Ancestors: Contemporary Art by Native Americans.</em> Curated by Jaune Quick-to-See Smith. Washington, DC: National Gallery of Art, September 22, 2023–January 15, 2024. https://www.nga.gov/exhibitions/land-carries-our-ancestors-contemporary-art-native-americans.`,
    `National Museum of the American Indian. "American Indian Movement Photograph Collection." NMAI.AC.449. Washington, DC: Smithsonian Institution, processed 2024. https://americanindian.si.edu/collections-search/edan-record/ead_collection:sova-nmai-ac-449.`,
    `National Museum of the American Indian. "AIM Collection Object." NMAI Object 280067. Washington, DC: Smithsonian Institution. https://americanindian.si.edu/collections-search/object/NMAI_280067.`,
    `National Museum of the American Indian. "AIM Member Items." NMAI Object 280522. Washington, DC: Smithsonian Institution. https://americanindian.si.edu/collections-search/object/NMAI_280522.`,
    `National Museum of the American Indian. "Boarding Schools." <em>Native Knowledge 360°.</em> Washington, DC: Smithsonian Institution. Accessed April 2026. https://americanindian.si.edu/nk360/code-talkers/boarding-schools.`,
    `Native Movement. "Protect the Arctic Refuge." Accessed April 2026. https://www.nativemovement.org/protect-the-arctic-refuge.`,
    `Newberry Library Digital Collections for the Classroom. "Representing Indigenous Peoples in the Archive." Chicago: Newberry Library. Accessed April 2026. https://dcc.newberry.org/?p=14422.`,
    `New York Times. "August 30, 1964." TimesMachine, Page 72. Accessed April 2026. https://timesmachine.nytimes.com/timesmachine/1964/08/30/119440251.html.`,
    `Outpost24. "Threat Actor Profile: Guacamaya." <em>Outpost24 Blog.</em> Accessed April 2026. https://outpost24.com/blog/threat-actor-profile-guacamaya.`,
    `PBS American Experience. "The Lakota Ghost Dance and the Massacre at Wounded Knee." Accessed April 2026. https://www.pbs.org/wgbh/americanexperience/features/american-oz-lakota-ghost-dance-massacre-wounded-knee.`,
    `Rainforest Action Network. "Extreme Energy Injustice." <em>The Understory.</em> Accessed April 2026. https://www.ran.org/the-understory/extreme_energy_injustice.`,
    `Resilience Project. "Daphne Odjig, The Indian in Transition." Accessed April 2026. https://resilienceproject.ca/en/artists/daphne-odjig.`,
    `Ricochet Media. "Kanehsatake: 35 Years Later, Remembering the Day Canada Sent in the Military to Clear Mohawk Land for a Golf Course." Accessed April 2026. https://ricochet.media/indigenous/landback/kanehsatake-35-years-later-remembering-the-day-canada-sent-in-the-military-to-violently-clear-mohawk-land-for-a-golf-course.`,
    `Smithsonian Institution. "Chromolithograph Entitled Custer's Last Fight." Object nmah_326129. Washington, DC: National Museum of American History. https://www.si.edu/object/chromolithograph-entitled-custers-last-fight:nmah_326129.`,
    `Smithsonian Institution. "Group Portrait, North American Indian Delegation." Object siris_arc_390669. Washington, DC: Smithsonian Institution. https://www.si.edu/object/group-portrait-north-american-indian-delegation:siris_arc_390669.`,
    `Smithsonian Institution. "International Indian Council Held at Tallequah, Indian Territory, 1843." Object saam_1985.66.248_934B. Washington, DC: Smithsonian American Art Museum. https://www.si.edu/object/international-indian-council-held-tallequah-indian-territory-1843:saam_1985.66.248_934B.`,
    `Smithsonian Institution. "Sioux Indian Drawing, Cowboy." Object nmah_1020097. Washington, DC: National Museum of American History. https://www.si.edu/object/sioux-indian-drawing-cowboy:nmah_1020097.`,
    `Smithsonian Institution. "Sioux Indian Drawing, Joe Black Fox." Object nmah_1020058. Washington, DC: National Museum of American History. https://www.si.edu/object/sioux-indian-drawing-joe-black-fox:nmah_1020058.`,
    `Smithsonian Institution. "Sioux Indian Drawing, Joe Black Fox." Object nmah_1020074. Washington, DC: National Museum of American History. https://www.si.edu/object/sioux-indian-drawing-joe-black-fox:nmah_1020074.`,
    `Smithsonian Institution. "Sioux Indians, Dakota Plains." Object nmah_1004515. Washington, DC: National Museum of American History. https://www.si.edu/object/sioux-indians-dakota-plains:nmah_1004515.`,
    `Smithsonian Institution. "Troop, Ninth U.S. Cavalry—Famous Indian Fighters." Object nmaahc_2011.155.175. Washington, DC: National Museum of African American History and Culture. https://www.si.edu/object/troop-ninth-us-cavalry-famous-indian-fighters:nmaahc_2011.155.175.`,
    `Smithsonian Institution. "Zitkala-Ša, Sioux Indian and Activist." Object nmah_1006127. Washington, DC: National Museum of American History. https://www.si.edu/object/zitkala-sa-sioux-indian-and-activist:nmah_1006127.`,
    `The Canadian Encyclopedia. "Oka Crisis Timeline." Accessed April 2026. https://www.thecanadianencyclopedia.ca/en/timeline/oka-crisis.`,
    `Verso Books Blog. "The Wounded Knee Massacre and the Long Tradition of Indigenous Resistance." Accessed April 2026. https://www.versobooks.com/blogs/news/4520-the-wounded-knee-massacre-and-the-long-tradition-of-indigenous-resistance.`,
  ]
};



// --- Starter screen logic ---
const starterOverlay = document.getElementById('starter-screen-overlay');
const starterSvgContainer = document.getElementById('starter-svg-container');
let starterActive = true;

// Initialize renderer, camera, and sceneManager immediately
const renderer = createRenderer();
const camera = createCamera();
const controls = createControls(camera, renderer.domElement);
const sceneManager = new SceneManager(camera, controls);

// Initialize help UI
const helpUI = initializeHelpUI();

// Initialize timelines
initializeTimeline();
initializeVerticalTimeline();

// Start the render loop immediately so the hack scene renders behind the title card overlay
startLoop(renderer, camera, sceneManager, controls);

const creditsOverlay = document.getElementById('credits-overlay');
const creditsRoll = document.getElementById('credits-roll');
const creditsClose = document.getElementById('credits-close');
let creditsActive = false;
const archivePhotoOverlay = document.getElementById('archive-photo-overlay');
const archivePhotoClose = document.getElementById('archive-photo-close');
const archivePhotoImage = document.getElementById('archive-photo-image');
const archivePhotoKicker = document.getElementById('archive-photo-kicker');
const archivePhotoTitle = document.getElementById('archive-photo-title');
const archivePhotoMeta = document.getElementById('archive-photo-meta');
const archivePhotoCitation = document.getElementById('archive-photo-citation');
const archivePhotoCitationLink = document.getElementById('archive-photo-citation-link');
const archivePhotoDescription = document.getElementById('archive-photo-description');
const photoFocusReticle = document.getElementById('photo-focus-reticle');
let archivePhotoOverlayActive = false;

function renderCredits() {
  if (!creditsRoll) return;

  const bookEntries = bibliography.books
    .map(entry => `<p class="bib-entry">${entry}</p>`)
    .join('');

  const onlineEntries = bibliography.online
    .map(entry => `<p class="bib-entry">${entry}</p>`)
    .join('');

  creditsRoll.innerHTML = `
    <h2 class="credits-heading">Bibliography</h2>
    <h3 class="bib-section-title">Books and Journal Articles</h3>
    <div class="bib-section">${bookEntries}</div>
    <h3 class="bib-section-title">Online and Digital Sources</h3>
    <div class="bib-section">${onlineEntries}</div>
  `;
}

function setMainSceneUIVisibility(visible) {
  const displayValue = visible ? 'flex' : 'none';
  const timelineHamburgerButton = document.getElementById('timeline-hamburger');
  const helpButton = document.getElementById('help-button');
  const sceneTimeline = document.getElementById('scene-timeline');

  if (timelineHamburgerButton) timelineHamburgerButton.style.display = displayValue;
  if (helpButton) helpButton.style.display = displayValue;
  if (sceneTimeline) sceneTimeline.style.display = displayValue;
}

function showCreditsOverlay() {
  if (creditsActive || !creditsOverlay) return;

  creditsActive = true;
  creditsOverlay.classList.add('active');
  creditsOverlay.setAttribute('aria-hidden', 'false');

  if (timelineOverlay) {
    timelineOverlay.classList.remove('active');
  }

  setMainSceneUIVisibility(false);

  if (controls && controls.setControlsEnabled) {
    controls.setControlsEnabled(false);
  }

  if (window.subtitleManager) {
    window.subtitleManager.hide();
    window.subtitleManager.disable();
  }

  // Phase 1: show thank-you slide, then auto-transition to rolling credits
  const thankyouEl = document.getElementById('credits-thankyou');
  const creditsWindow = document.getElementById('credits-window');
  const creditsHint = document.getElementById('credits-hint');

  if (thankyouEl) thankyouEl.classList.remove('fade-out');
  if (creditsWindow) creditsWindow.style.display = 'none';
  if (creditsHint) creditsHint.style.display = 'none';

  // After 4 seconds fade out the thank-you and start the roll
  setTimeout(() => {
    if (thankyouEl) thankyouEl.classList.add('fade-out');

    setTimeout(() => {
      if (thankyouEl) thankyouEl.style.display = 'none';
      if (creditsWindow) creditsWindow.style.display = 'flex';
      if (creditsHint) creditsHint.style.display = 'block';

      if (creditsRoll) {
        creditsRoll.classList.remove('animate');
        void creditsRoll.offsetWidth;
        creditsRoll.classList.add('animate');
      }

      // Let the camera drift forward while credits roll
      if (window.pauseUserMovement) window.pauseUserMovement(false);
      let creditsDriftInterval = setInterval(() => {
        if (!creditsActive) { clearInterval(creditsDriftInterval); return; }
        camera.position.z -= 0.012;
      }, 16);

      // Reload back to title after the roll finishes (70s animation)
      setTimeout(() => {
        clearInterval(creditsDriftInterval);
        window.location.reload();
      }, 71000);

    }, 1300); // wait for fade-out to finish
  }, 4000);
}

function hideCreditsOverlay() {
  if (!creditsActive || !creditsOverlay) return;

  creditsActive = false;
  creditsOverlay.classList.remove('active');
  creditsOverlay.setAttribute('aria-hidden', 'true');

  if (creditsRoll) {
    creditsRoll.classList.remove('animate');
  }

  if (sceneManager && sceneManager.currentScene === sceneManager.mainScene) {
    setMainSceneUIVisibility(true);

    if (controls && controls.setControlsEnabled) {
      controls.setControlsEnabled(true);
    }
  }
}

function setArchivePhotoFocusState(isFocused, imageConfig) {
  if (photoFocusReticle) {
    photoFocusReticle.classList.remove('is-visible', 'is-focused');
  }

  document.body.classList.toggle('archive-photo-hover-target', Boolean(isFocused));

  const label = isFocused
    ? `Open details for ${imageConfig?.title || imageConfig?.alt || 'archive photo'}`
    : 'Look at a side photo to inspect it';
  if (photoFocusReticle) {
    photoFocusReticle.setAttribute('aria-label', label);
  }
}

function setArchivePhotoPointerMode(enabled, options = {}) {
  if (!controls?.setPhotoInteractionMode) return;

  controls.setPhotoInteractionMode(enabled, options);
  document.body.classList.toggle('archive-photo-hover-target', false);

  if (!enabled) {
    setArchivePhotoFocusState(false, null);
  }
}

function isArchivePhotoPointerMode() {
  return Boolean(controls?.isPhotoInteractionMode?.());
}

function showArchivePhotoOverlay(imageConfig) {
  if (!archivePhotoOverlay || !imageConfig) return;

  archivePhotoOverlayActive = true;
  archivePhotoOverlay.classList.add('active');
  archivePhotoOverlay.setAttribute('aria-hidden', 'false');

  if (archivePhotoImage) {
    archivePhotoImage.src = imageConfig.src;
    archivePhotoImage.alt = imageConfig.alt || imageConfig.title || 'Archive photo';
    archivePhotoImage.onload = () => {
      const photoWindow = archivePhotoOverlay.querySelector('.archive-photo-window');
      if (photoWindow) {
        photoWindow.classList.toggle('is-portrait', archivePhotoImage.naturalHeight > archivePhotoImage.naturalWidth);
      }
    };
  }

  if (archivePhotoKicker) {
    archivePhotoKicker.textContent = '';
  }

  if (archivePhotoTitle) {
    archivePhotoTitle.textContent = imageConfig.title || imageConfig.alt || 'Untitled';
  }

  if (archivePhotoMeta) {
    const artist = imageConfig.artist || 'Unknown artist';
    const medium = imageConfig.medium || 'Archival image';
    archivePhotoMeta.textContent = `${artist} / ${medium}`;
  }

  if (archivePhotoCitation && archivePhotoCitationLink) {
    const citationUrl = imageConfig.citationUrl || imageConfig.source || '';
    const citationLabel = imageConfig.citationLabel || imageConfig.sourceLabel || citationUrl;

    if (citationUrl) {
      archivePhotoCitation.hidden = false;
      archivePhotoCitationLink.href = citationUrl;
      archivePhotoCitationLink.textContent = citationLabel;
      archivePhotoCitationLink.setAttribute('aria-label', `Open citation source for ${imageConfig.title || imageConfig.alt || 'archive image'}`);
    } else {
      archivePhotoCitation.hidden = true;
      archivePhotoCitationLink.removeAttribute('href');
      archivePhotoCitationLink.textContent = '';
    }
  }

  if (archivePhotoDescription) {
    archivePhotoDescription.textContent = imageConfig.description || imageConfig.alt || '';
  }

  if (controls && controls.setControlsEnabled) {
    controls.setControlsEnabled(false);
  }

  setArchivePhotoPointerMode(false);

  archiveImagesManager.setModalOpen(true);
  setArchivePhotoFocusState(false, null);
}

function hideArchivePhotoOverlay() {
  if (!archivePhotoOverlay || !archivePhotoOverlayActive) return;

  archivePhotoOverlayActive = false;
  archivePhotoOverlay.classList.remove('active');
  archivePhotoOverlay.setAttribute('aria-hidden', 'true');

  if (archivePhotoImage) {
    archivePhotoImage.removeAttribute('src');
    archivePhotoOverlay.querySelector('.archive-photo-window')?.classList.remove('is-portrait');
  }

  if (archivePhotoCitation && archivePhotoCitationLink) {
    archivePhotoCitation.hidden = true;
    archivePhotoCitationLink.removeAttribute('href');
    archivePhotoCitationLink.textContent = '';
  }

  if (controls && controls.setControlsEnabled && sceneManager && sceneManager.currentScene === sceneManager.mainScene) {
    controls.setControlsEnabled(true);
    setArchivePhotoPointerMode(false, { relock: true, suppressUntilRotateAway: true });
  }

  archiveImagesManager.setModalOpen(false);
  setArchivePhotoFocusState(false, null);
}

renderCredits();

// Load title card PNG into the container
fetch('imgs/title_card.png')
  .then(r => r.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Title card';
    starterSvgContainer.appendChild(img);
  });

// When hack scene assets are ready, reveal the scene through the title card overlay
window.addEventListener('hackSceneReady', () => {
  if (starterActive && starterOverlay) {
    starterOverlay.classList.add('scene-revealed');
  }
}, { once: true });

function hideStarterScreen() {
  if (!starterActive) return;
  starterActive = false;

  const fadeElement = document.getElementById('fade-to-scene');

  // Fade out the starter overlay and fade to black simultaneously
  starterOverlay.style.opacity = 0;
  if (fadeElement) {
    fadeElement.style.transition = 'opacity 0.7s ease-in-out';
    fadeElement.classList.add('fade-in');
  }

  setTimeout(() => {
    // Fully black now — swap to content warning (starts at opacity 0)
    starterOverlay.style.display = 'none';
    showContentWarning();

    // Lift the black overlay so the content warning fades in beneath it
    setTimeout(() => {
      if (fadeElement) {
        fadeElement.style.transition = 'opacity 0.6s ease-in-out';
        fadeElement.classList.remove('fade-in');
        fadeElement.classList.add('fade-out');
      }
    }, 150);
  }, 700);
}

function startGame() {
  // Loop already started at initialization; nothing extra needed here.
}

// Show hamburger and help button when reaching MainScene
function showMainSceneUI() {
  setMainSceneUIVisibility(true);

  // Wait for the flash transition to fully clear before showing the tour
  setTimeout(() => {
    // Run the UI tour first, then open the move guide
    runUiTour(() => {
      if (helpUI) helpUI.show();
    });
  }, 1600); // flash peaks at 600ms and fully fades by ~2000ms; 1600ms gives a clean gap
}

// Flash transition effect
function triggerFlashTransition() {
  const flashElement = document.getElementById('flash-transition');
  if (!flashElement) return;
  
  // Add flashing class to trigger animation
  flashElement.classList.add('flashing');
  
  // Remove class after animation completes
  setTimeout(() => {
    flashElement.classList.remove('flashing');
  }, 2000); // Match animation duration
}

// Make functions globally accessible
window.showMainSceneUI = showMainSceneUI;
window.triggerFlashTransition = triggerFlashTransition;
window.showCreditsOverlay = showCreditsOverlay;
window.showArchivePhotoOverlay = showArchivePhotoOverlay;
window.hideArchivePhotoOverlay = hideArchivePhotoOverlay;
window.setArchivePhotoFocusState = setArchivePhotoFocusState;
window.setArchivePhotoPointerMode = setArchivePhotoPointerMode;
window.isArchivePhotoPointerMode = isArchivePhotoPointerMode;

// --- Content warning screen logic ---
const contentWarningOverlay = document.getElementById('content-warning-overlay');
const contentWarningSlides = Array.from(document.querySelectorAll('.content-warning-slide'));
const warningSteps = Array.from(document.querySelectorAll('.warning-step'));
const warningStepContinue = document.getElementById('warning-step-continue');
let contentWarningActive = false;
let currentContentWarningSlide = 0;
let currentWarningStep = 0;

function setWarningStep(index) {
  currentWarningStep = index;
  warningSteps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });
  // Re-trigger the continue hint animation
  if (warningStepContinue) {
    warningStepContinue.style.animation = 'none';
    warningStepContinue.offsetHeight; // reflow
    warningStepContinue.style.animation = '';
  }
}

function setContentWarningSlide(index) {
  currentContentWarningSlide = index;
  contentWarningSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === index);
  });
}

function showContentWarning() {
  if (!contentWarningOverlay) {
    startGame();
    return;
  }

  contentWarningActive = true;
  currentWarningStep = 0;
  setWarningStep(0);
  setContentWarningSlide(0);
  contentWarningOverlay.classList.add('active');
}

function hideContentWarning() {
  contentWarningActive = false;

  // Unlock audio playback — must happen synchronously inside the user gesture handler
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx) { const ctx = new AudioCtx(); ctx.resume().then(() => ctx.close()); }

  const fadeElement = document.getElementById('fade-to-scene');

  // Step 1: Instantly put the black overlay behind the content warning (no transition)
  if (fadeElement) {
    fadeElement.style.transition = 'none';
    fadeElement.classList.remove('fade-out');
    fadeElement.classList.add('fade-in');
    // Force reflow so the instant snap is applied before we re-enable transitions
    fadeElement.offsetHeight; // eslint-disable-line no-unused-expressions
    fadeElement.style.transition = '';
  }

  // Step 2: Fade the content warning out over 1s (text melts into black)
  if (contentWarningOverlay) {
    contentWarningOverlay.style.transition = 'opacity 1s ease-in-out';
    contentWarningOverlay.style.opacity = '0';
  }

  setTimeout(() => {
    // Content warning is now invisible — hide it properly
    if (contentWarningOverlay) {
      contentWarningOverlay.classList.remove('active');
      contentWarningOverlay.style.transition = '';
      contentWarningOverlay.style.opacity = '';
    }

    // Step 3: Reveal the scene by fading the black overlay out over 1s
    if (fadeElement) {
      fadeElement.style.transition = 'opacity 1s ease-in-out';
      fadeElement.classList.remove('fade-in');
      fadeElement.classList.add('fade-out');
    }

    // Start camera moving after the reveal begins
    if (sceneManager) sceneManager.startHackSceneMovement();
  }, 1000); // wait for the 1s fade-out to complete
}

// Dismiss the starter title card on any key or mouse click
window.addEventListener('mousedown', (e) => {
  if (starterActive) {
    hideStarterScreen();
  }
});

// Handle key press to dismiss screens
window.addEventListener('keydown', (e) => {
  if (starterActive) {
    hideStarterScreen();
    return;
  }
  
  if (contentWarningActive) {
    if (currentContentWarningSlide === 0) {
      if (currentWarningStep < warningSteps.length - 1) {
        setWarningStep(currentWarningStep + 1);
      } else {
        setContentWarningSlide(1);
      }
    } else if (currentContentWarningSlide < contentWarningSlides.length - 1) {
      setContentWarningSlide(currentContentWarningSlide + 1);
    } else {
      hideContentWarning();
    }
    return;
  }
});

// Pause/unpause user movement (for text displays)
window.pauseUserMovement = function(paused) {
  if (controls && controls.setControlsEnabled) {
    controls.setControlsEnabled(!paused);
  }
};

// --- Timeline hamburger menu logic ---
const timelineHamburger = document.getElementById('timeline-hamburger');
const timelineOverlay = document.getElementById('timeline-overlay');

function updateControlsForTimelineOverlay() {
  if (timelineOverlay.classList.contains('active')) {
    controls.setControlsEnabled(false);
    setMainSceneUIVisibility(false);
  } else {
    controls.setControlsEnabled(true);
    setMainSceneUIVisibility(true);
  }
}

if (timelineHamburger && timelineOverlay) {
  timelineHamburger.addEventListener('click', () => {
    timelineOverlay.classList.toggle('active');
    updateControlsForTimelineOverlay();
  });
  // Optional: close overlay when clicking outside or pressing Escape
  timelineOverlay.addEventListener('click', (e) => {
    if (e.target === timelineOverlay) {
      timelineOverlay.classList.remove('active');
      updateControlsForTimelineOverlay();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isArchivePhotoPointerMode()) {
        setArchivePhotoPointerMode(false, { relock: true, suppressUntilRotateAway: true });
        return;
      }

      if (archivePhotoOverlayActive) {
        hideArchivePhotoOverlay();
        return;
      }

      if (creditsActive) {
        hideCreditsOverlay();
        return;
      }

      timelineOverlay.classList.remove('active');
      updateControlsForTimelineOverlay();
    }
  });
  // Add close (X) button logic
  const timelineClose = document.getElementById('timeline-close');
  if (timelineClose) {
    timelineClose.addEventListener('click', () => {
      timelineOverlay.classList.remove('active');
      updateControlsForTimelineOverlay();
    });
  }
}

if (creditsClose) {
  creditsClose.addEventListener('click', hideCreditsOverlay);
}

if (archivePhotoClose) {
  archivePhotoClose.addEventListener('click', hideArchivePhotoOverlay);
}

if (archivePhotoOverlay) {
  archivePhotoOverlay.addEventListener('click', (event) => {
    if (event.target === archivePhotoOverlay) {
      hideArchivePhotoOverlay();
    }
  });
}
