// Vertical timeline with progressive reveal

const timelineEvents = [
  {
    id: 1,
    year: "Pre-1492",
    title: "Indigenous Stewardship",
    description: "Indigenous peoples across the Americas maintain millennia-old relationships with their lands through knowledge systems, language, ceremony, and sustained relation to place",
    side: "left",
    revealTrigger: -10 // Reveals when user reaches this z-position
  },
  {
    id: 2,
    year: "1492+",
    title: "European Colonization",
    description: "European powers begin systematic dismantling of Indigenous life, land, and knowledge across the Americas",
    side: "right",
    revealTrigger: -60
  },
  {
    id: 3,
    year: "Late 1800s",
    title: "United Fruit Company",
    description: "Maya Q'eqchi' communities dispossessed as United Fruit Company accumulates vast tracts of territory in Guatemala",
    side: "left",
    revealTrigger: -110
  },
  {
    id: 4,
    year: "1866",
    title: "Fort Laramie Treaty",
    description: "Red Cloud's alliance of Lakotas, Cheyennes, and Arapahos compels US to sign treaty on Indigenous terms",
    side: "right",
    revealTrigger: -210
  },
  {
    id: 5,
    year: "1954",
    title: "CIA Coup in Guatemala",
    description: "CIA removes President Jacobo Árbenz at behest of corporate interests",
    side: "left",
    revealTrigger: -130
  },
  {
    id: 6,
    year: "1960s",
    title: "Mining Concession",
    description: "Canadian company obtains Fenix mine concession by lobbying Guatemalan military to suspend constitution",
    side: "right",
    revealTrigger: -120
  },
  {
    id: 7,
    year: "1968",
    title: "American Indian Movement",
    description: "AIM founded in Minneapolis to combat police violence and assert Indigenous sovereignty",
    side: "left",
    revealTrigger: -310
  },
  {
    id: 8,
    year: "1973",
    title: "Wounded Knee Occupation",
    description: "AIM and Oglala Sioux stage 71-day armed occupation, declaring independent nation under 1868 Fort Laramie Treaty",
    side: "right",
    revealTrigger: -330
  },
  {
    id: 9,
    year: "May 29, 1978",
    title: "Panzós Massacre",
    description: "Guatemalan Army murders at least 140 Maya Q'eqchi' people marching to demand land rights",
    side: "left",
    revealTrigger: -160
  },
  {
    id: 10,
    year: "2016",
    title: "Standing Rock",
    description: "Water protectors gather to stop Dakota Access Pipeline using encampment, legal challenge, prayer, and coordinated action",
    side: "right",
    revealTrigger: -360
  },
  {
    id: 11,
    year: "Late 1990s-2000s",
    title: "Digital Extraction",
    description: "Internet, cloud computing, and AI introduce new dimensions of colonial extraction targeting Indigenous knowledge and data",
    side: "left",
    revealTrigger: -410
  },
  {
    id: 12,
    year: "March 2022",
    title: "Guacamaya Breach",
    description: "Hacktivist collective breaches Fenix nickel project networks, exposing four terabytes of data on working conditions, environmental damage, and corporate violence",
    side: "right",
    revealTrigger: -550
  }
];

let revealedEvents = new Set();
let currentUserZ = 0;

export function initializeVerticalTimeline() {
  const container = document.getElementById('vertical-timeline');
  if (!container) return;

  // Create main vertical line
  const mainLine = document.createElement('div');
  mainLine.className = 'timeline-vertical-line';
  container.appendChild(mainLine);

  // Create events
  timelineEvents.forEach(event => {
    const eventElement = createTimelineEvent(event);
    container.appendChild(eventElement);
  });
  
  // Reveal first event by default
  revealedEvents.add(1);
  const firstEvent = document.querySelector('[data-event-id="1"]');
  if (firstEvent) {
    firstEvent.classList.remove('hidden');
    firstEvent.classList.add('revealed');
  }
}

function createTimelineEvent(event) {
  const eventContainer = document.createElement('div');
  eventContainer.className = `timeline-event ${event.side} hidden`;
  eventContainer.setAttribute('data-event-id', event.id);
  eventContainer.setAttribute('data-reveal-trigger', event.revealTrigger);

  // Create branch line
  const branchLine = document.createElement('div');
  branchLine.className = 'timeline-branch';
  
  // Create circle at end of branch
  const circle = document.createElement('div');
  circle.className = 'timeline-circle';
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'timeline-content';
  
  // Add year (highlighted)
  const yearElement = document.createElement('div');
  yearElement.className = 'timeline-year';
  yearElement.innerHTML = `<span class="highlight">${event.year}</span>`;
  
  // Add title (highlighted)
  const titleElement = document.createElement('div');
  titleElement.className = 'timeline-title';
  titleElement.innerHTML = `<span class="highlight">${event.title}</span>`;
  
  // Add description (no highlight)
  const descElement = document.createElement('div');
  descElement.className = 'timeline-description';
  descElement.textContent = event.description;
  
  content.appendChild(yearElement);
  content.appendChild(titleElement);
  content.appendChild(descElement);
  
  eventContainer.appendChild(branchLine);
  eventContainer.appendChild(circle);
  eventContainer.appendChild(content);
  
  return eventContainer;
}

export function updateVerticalTimeline(userZ) {
  currentUserZ = userZ;
  
  const events = document.querySelectorAll('.timeline-event');
  
  events.forEach(event => {
    const eventId = parseInt(event.getAttribute('data-event-id'));
    const revealTrigger = parseFloat(event.getAttribute('data-reveal-trigger'));
    
    // Reveal event if user has passed the trigger point
    if (userZ <= revealTrigger && !revealedEvents.has(eventId)) {
      event.classList.remove('hidden');
      event.classList.add('revealed');
      revealedEvents.add(eventId);
    }
  });
}

// Reset timeline when restarting
export function resetVerticalTimeline() {
  revealedEvents.clear();
  const events = document.querySelectorAll('.timeline-event');
  events.forEach(event => {
    event.classList.add('hidden');
    event.classList.remove('revealed');
  });
}
