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
    revealTrigger: -95
  },
  {
    id: 3,
    year: "1866",
    title: "Red Cloud's War",
    description: "Lakota, Cheyenne, and Arapaho forces compel the US to sign the Fort Laramie Treaty on Indigenous terms",
    side: "left",
    revealTrigger: -225
  },
  {
    id: 4,
    year: "1890",
    title: "Wounded Knee Massacre",
    description: "US forces massacre Lakota people amid repression of the Ghost Dance movement",
    side: "right",
    revealTrigger: -263
  },
  {
    id: 5,
    year: "1969",
    title: "Occupation of Alcatraz",
    description: "Native activists from multiple nations occupy Alcatraz, building community institutions and asserting sovereignty",
    side: "left",
    revealTrigger: -275
  },
  {
    id: 6,
    year: "1973",
    title: "Wounded Knee Occupation",
    description: "AIM and Oglala Lakota activists hold Wounded Knee for 71 days under treaty-based claims",
    side: "right",
    revealTrigger: -305
  },
  {
    id: 7,
    year: "1977",
    title: "Indigenous Delegates at the UN",
    description: "Delegates across the Americas address the UN, demanding recognition of Indigenous peoples and inherent rights",
    side: "left",
    revealTrigger: -350
  },
  {
    id: 8,
    year: "2016",
    title: "Standing Rock",
    description: "Water protectors from more than 200 tribes mobilize to defend water, land, and sacred sites",
    side: "right",
    revealTrigger: -405
  },
  {
    id: 9,
    year: "1960s",
    title: "Fenix Mining Concession",
    description: "Open-pit nickel extraction is legalized on Maya Q'eqchi' territory through military-state power",
    side: "left",
    revealTrigger: -472
  },
  {
    id: 10,
    year: "May 29, 1978",
    title: "Panzós Massacre",
    description: "Guatemalan Army opens fire on Maya Q'eqchi' marchers demanding recognition of land title",
    side: "right",
    revealTrigger: -500
  },
  {
    id: 11,
    year: "2010-2013",
    title: "Hudbay Lawsuits",
    description: "Maya Q'eqchi' survivors pursue landmark cases in Canadian courts; Ontario allows claims to proceed",
    side: "left",
    revealTrigger: -540
  },
  {
    id: 12,
    year: "March 2022",
    title: "Guacamaya Breach",
    description: "Hacktivist collective breaches extractive and military networks, exposing surveillance and violence across Abya Yala",
    side: "right",
    revealTrigger: -698
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
