// UI onboarding tour — runs once when the main scene first loads
// Highlights key UI elements before the move guide opens.

const STEPS = [
  {
    targetId: 'help-button',
    title: 'Controls Guide',
    body: 'Press <strong>?</strong> at any time to review how to navigate.',
    tooltipSide: 'right',
    padding: 12,
  },
  {
    targetId: 'timeline-hamburger',
    title: 'Story Timeline',
    body: 'Open this to see key historical events as you move through the experience.',
    tooltipSide: 'left',
    padding: 12,
  },
  {
    targetId: 'scene-timeline',
    title: 'Your Progress',
    body: 'This bar shows how far you have traveled through the story.',
    tooltipSide: 'below',
    paddingX: 32,
    paddingY: 8,
  },
];

export function runUiTour(onComplete) {
  let currentStep = 0;
  let advancing = false;

  // ── Build DOM ──────────────────────────────────────────────
  const container = document.createElement('div');
  container.id = 'ui-tour-container';

  const spotlight = document.createElement('div');
  spotlight.className = 'ui-tour-spotlight';

  const tooltip = document.createElement('div');
  tooltip.className = 'ui-tour-tooltip';

  const hint = document.createElement('p');
  hint.className = 'ui-tour-hint';

  container.appendChild(spotlight);
  container.appendChild(tooltip);
  container.appendChild(hint);
  document.body.appendChild(container);

  // ── Position helpers ───────────────────────────────────────
  function positionSpotlight(rect, step) {
    const px = step.paddingX ?? step.padding ?? 10;
    const py = step.paddingY ?? step.padding ?? 10;
    spotlight.style.left   = `${rect.left   - px}px`;
    spotlight.style.top    = `${rect.top    - py}px`;
    spotlight.style.width  = `${rect.width  + px * 2}px`;
    spotlight.style.height = `${rect.height + py * 2}px`;
  }

  function positionTooltip(rect, side) {
    const GAP = 20;
    tooltip.style.left      = '';
    tooltip.style.right     = '';
    tooltip.style.top       = '';
    tooltip.style.bottom    = '';
    tooltip.style.transform = '';

    if (side === 'right') {
      tooltip.style.left = `${rect.right + GAP}px`;
      tooltip.style.top  = `${rect.top}px`;
    } else if (side === 'left') {
      tooltip.style.right = `${window.innerWidth - rect.left + GAP}px`;
      tooltip.style.top   = `${rect.top}px`;
    } else if (side === 'below') {
      const centerX = rect.left + rect.width / 2;
      tooltip.style.left      = `${centerX}px`;
      tooltip.style.top       = `${rect.bottom + GAP}px`;
      tooltip.style.transform = 'translateX(-50%)';
    }
  }

  // ── Show a step ────────────────────────────────────────────
  function showStep(index) {
    const step   = STEPS[index];
    const target = document.getElementById(step.targetId);

    if (!target) {
      // Target not found — skip
      currentStep++;
      if (currentStep < STEPS.length) showStep(currentStep);
      else finish();
      return;
    }

    const rect    = target.getBoundingClientRect();
    const padding = step.padding ?? 10;

    positionSpotlight(rect, step);
    positionTooltip(rect, step.tooltipSide);

    tooltip.innerHTML = `
      <h3 class="ui-tour-title">${step.title}</h3>
      <p  class="ui-tour-body">${step.body}</p>
    `;

    hint.textContent = `Press any key or click to continue`;

    // Fade in on first step; subsequent steps just reposition (transition handles it)
    if (index === 0) {
      requestAnimationFrame(() => {
        container.classList.add('tour-visible');
      });
    }
  }

  // ── Advance ────────────────────────────────────────────────
  function advance() {
    if (advancing) return;
    advancing = true;

    currentStep++;
    if (currentStep >= STEPS.length) {
      finish();
      return;
    }

    // Small delay so rapid keypresses don't skip two steps at once
    setTimeout(() => {
      advancing = false;
      showStep(currentStep);
    }, 120);
  }

  // ── Finish ─────────────────────────────────────────────────
  function finish() {
    container.classList.remove('tour-visible');
    container.classList.add('tour-fade-out');

    document.removeEventListener('keydown', onKey);
    container.removeEventListener('click', onClick);

    // Re-enable camera movement (the help overlay will manage it from here)
    if (window.pauseUserMovement) window.pauseUserMovement(false);

    setTimeout(() => {
      container.remove();
      onComplete();
    }, 500);
  }

  // ── Event listeners ────────────────────────────────────────
  function onKey(e) {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
    advance();
  }

  function onClick() {
    advance();
  }

  document.addEventListener('keydown', onKey);
  container.addEventListener('click', onClick);

  // ── Disable camera while tour is active ────────────────────
  if (window.pauseUserMovement) window.pauseUserMovement(true);

  // ── Kick off ───────────────────────────────────────────────
  showStep(0);
}
