// ============================================================================
// ONBOARDING FLOW - Beyond Burnout
// ============================================================================

const onboardingState = {
  currentScreen: 0,
  goals: [],
  biggestStruggle: '',
  baseline: {
    sleep: 0,
    stress: 5,
    energy: 'moderate',
    movement: 0
  },
  recommendedStep: '',
  selectedHabits: [],
  reminderTime: '20:00',
  tutorialStep: 1
};

const screens = [
  'welcome-screen',
  'goal-screen',
  'struggle-screen',
  'baseline-screen',
  'recommendation-screen',
  'habit-selection-screen',
  'tutorial-screen',
  'commitment-screen'
];

// ============================================================================
// SCREEN NAVIGATION
// ============================================================================

function nextOnboardingScreen() {
  if (!validateCurrentScreen()) return;
  saveCurrentScreenData();

  document.getElementById(screens[onboardingState.currentScreen]).classList.remove('active');
  onboardingState.currentScreen++;
  document.getElementById(screens[onboardingState.currentScreen]).classList.add('active');

  if (screens[onboardingState.currentScreen] === 'recommendation-screen') {
    generateRecommendation();
  }

  if (screens[onboardingState.currentScreen] === 'habit-selection-screen') {
    populateHabitSelection();
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function prevOnboardingScreen() {
  document.getElementById(screens[onboardingState.currentScreen]).classList.remove('active');
  onboardingState.currentScreen--;
  document.getElementById(screens[onboardingState.currentScreen]).classList.add('active');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateCurrentScreen() {
  const currentScreenId = screens[onboardingState.currentScreen];

  switch (currentScreenId) {
    case 'goal-screen': {
      const goals = document.querySelectorAll('input[name="goal"]:checked');
      if (goals.length === 0) {
        showValidationMessage('Please select at least one goal');
        return false;
      }
      return true;
    }
    case 'struggle-screen': {
      const struggle = document.querySelector('input[name="struggle"]:checked');
      if (!struggle) {
        showValidationMessage('Please select your biggest challenge');
        return false;
      }
      return true;
    }
    case 'habit-selection-screen': {
      if (onboardingState.selectedHabits.length === 0) {
        showValidationMessage('Please select at least one habit to start with');
        return false;
      }
      return true;
    }
    default:
      return true;
  }
}

function showValidationMessage(msg) {
  // Remove existing
  const existing = document.querySelector('.validation-msg');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'validation-msg';
  el.textContent = msg;
  const screen = document.getElementById(screens[onboardingState.currentScreen]);
  screen.appendChild(el);

  setTimeout(() => el.remove(), 3000);
}

// ============================================================================
// DATA SAVING
// ============================================================================

function saveCurrentScreenData() {
  const currentScreenId = screens[onboardingState.currentScreen];

  switch (currentScreenId) {
    case 'goal-screen':
      onboardingState.goals = Array.from(document.querySelectorAll('input[name="goal"]:checked'))
        .map(input => input.value);
      break;

    case 'struggle-screen': {
      const struggle = document.querySelector('input[name="struggle"]:checked');
      onboardingState.biggestStruggle = struggle ? struggle.value : '';
      break;
    }

    case 'baseline-screen':
      onboardingState.baseline = {
        sleep: parseInt(document.getElementById('baseline-sleep-value').textContent),
        stress: parseInt(document.getElementById('baseline-stress').value),
        energy: document.querySelector('input[name="energy"]:checked')?.value || 'moderate',
        movement: parseInt(document.getElementById('baseline-movement-value').textContent)
      };
      break;

    case 'commitment-screen':
      onboardingState.reminderTime = document.getElementById('reminder-time').value;
      break;
  }

  localStorage.setItem('onboardingState', JSON.stringify(onboardingState));
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

function generateRecommendation() {
  const struggle = onboardingState.biggestStruggle;
  const baseline = onboardingState.baseline;

  let recommendedStep = '';
  let reason = '';

  if (struggle === 'sleep' || baseline.sleep < 3) {
    recommendedStep = 'sleep';
    reason = 'Poor sleep affects everything else - energy, stress, and recovery. Let\'s start by building a solid sleep foundation.';
  } else if (struggle === 'stress' || baseline.stress > 7) {
    recommendedStep = 'stress';
    reason = 'High stress keeps your nervous system in overdrive. Learning to calm your body quickly will help everything else fall into place.';
  } else if (struggle === 'energy' || baseline.energy === 'low') {
    recommendedStep = 'energy';
    reason = 'Stabilizing your energy through simple habits will give you the foundation to tackle everything else.';
  } else if (struggle === 'all') {
    recommendedStep = 'sleep';
    reason = 'When everything feels hard, we start with sleep. It\'s the foundation that supports your stress, energy, and recovery.';
  } else {
    recommendedStep = 'sleep';
    reason = 'Most people benefit from starting with sleep - it\'s the foundation of recovery.';
  }

  onboardingState.recommendedStep = recommendedStep;

  const stepInfo = {
    sleep: { icon: 'moon', title: 'Sleep Sanctuary', description: 'Reset your body\'s natural rhythm' },
    stress: { icon: 'wind', title: 'Stress Soothers', description: 'Calm your nervous system' },
    energy: { icon: 'zap', title: 'Energy Essentials', description: 'Stabilize daily energy' }
  };

  const step = stepInfo[recommendedStep];
  const card = document.getElementById('recommended-step');
  card.innerHTML = `
    <div class="recommended-step-icon">
      <i data-lucide="${step.icon}"></i>
    </div>
    <div class="recommended-step-content">
      <h3>${step.title}</h3>
      <p>${step.description}</p>
    </div>
  `;

  document.getElementById('recommendation-why').innerHTML = `<p>${reason}</p>`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// HABIT SELECTION
// ============================================================================

function populateHabitSelection() {
  const step = onboardingState.recommendedStep;
  const habitsGroup = document.getElementById('recommended-habits-group');

  let habits = [];
  let stepName = '';

  if (step === 'sleep') {
    stepName = 'Sleep Sanctuary';
    habits = [
      { id: 'sleep-bedtime', name: 'Consistent bedtime window (30-45 min)', icon: 'clock' },
      { id: 'sleep-wake', name: 'Same wake up time', icon: 'sunrise' },
      { id: 'sleep-temp', name: 'Cool room (65-68\u00B0F)', icon: 'thermometer' },
      { id: 'sleep-lights', name: 'Dim lights 1 hour before bed', icon: 'lightbulb' },
      { id: 'sleep-screens', name: 'Replace screens with activity', icon: 'book-open' }
    ];
  } else if (step === 'stress') {
    stepName = 'Stress Soothers';
    habits = [
      { id: 'stress-sigh', name: 'Physiological sigh (2-3x morning)', icon: 'wind' },
      { id: 'stress-breathe', name: 'Mindfulness breathing (5 min)', icon: 'heart' },
      { id: 'stress-journal', name: 'Thought journal', icon: 'book' }
    ];
  } else if (step === 'energy') {
    stepName = 'Energy Essentials';
    habits = [
      { id: 'energy-sun', name: 'Morning sunlight (5-20 min)', icon: 'sun' },
      { id: 'energy-water', name: 'Hydrate with electrolytes', icon: 'droplet' },
      { id: 'energy-caffeine', name: 'Delay caffeine 90 minutes', icon: 'coffee' }
    ];
  }

  habitsGroup.innerHTML = `
    <h3>Select 2-3 habits from ${stepName}</h3>
    <div class="habit-checkboxes">
      ${habits.map(habit => `
        <label class="habit-checkbox">
          <input type="checkbox" value="${habit.id}" onchange="updateHabitSelection()">
          <div class="habit-checkbox-content">
            <i data-lucide="${habit.icon}"></i>
            <span>${habit.name}</span>
          </div>
        </label>
      `).join('')}
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateHabitSelection() {
  const selected = Array.from(document.querySelectorAll('.habit-checkboxes input:checked'))
    .map(input => input.value);

  onboardingState.selectedHabits = selected;
  document.getElementById('habits-selected-count').textContent = selected.length;

  const continueBtn = document.getElementById('habit-continue-btn');
  continueBtn.disabled = selected.length === 0;
}

// ============================================================================
// BASELINE HELPERS
// ============================================================================

function changeBaselineValue(type, delta) {
  const valueEl = document.getElementById(`baseline-${type}-value`);
  let current = parseInt(valueEl.textContent);
  let newValue = Math.max(0, Math.min(7, current + delta));
  valueEl.textContent = newValue;
}

// ============================================================================
// TUTORIAL
// ============================================================================

let tutorialStep = 1;

function advanceTutorial() {
  const check1 = document.getElementById('tut-check1');
  const check2 = document.getElementById('tut-check2');

  if (check1.checked && check2.checked && tutorialStep === 1) {
    tutorialStep = 2;
    document.getElementById('tutorial-step-2').style.display = 'block';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function nextTutorialStep() {
  if (tutorialStep === 1) {
    // Auto-check both to advance
    document.getElementById('tut-check1').checked = true;
    document.getElementById('tut-check2').checked = true;
    tutorialStep = 2;
    document.getElementById('tutorial-step-2').style.display = 'block';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } else if (tutorialStep === 2) {
    tutorialStep = 3;
    document.getElementById('tutorial-step-3').style.display = 'block';
    document.getElementById('tutorial-next-btn').textContent = 'Continue';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } else {
    nextOnboardingScreen();
  }
}

// ============================================================================
// COMPLETE ONBOARDING
// ============================================================================

function completeOnboarding() {
  saveCurrentScreenData();

  localStorage.setItem('onboardingComplete', 'true');
  localStorage.setItem('onboardingData', JSON.stringify(onboardingState));
  localStorage.setItem('userXP', '0');
  localStorage.setItem('phase2Unlocked', 'false');
  localStorage.setItem('phase3Unlocked', 'false');

  // Save baseline
  localStorage.setItem('baselineData', JSON.stringify({
    date: new Date().toISOString(),
    ...onboardingState.baseline
  }));

  // First week goals
  localStorage.setItem('firstWeekGoals', JSON.stringify({
    baselineComplete: true,
    threeDayStreak: false,
    sevenDayStreak: false,
    fiftyXP: false
  }));

  window.location.href = 'index.html';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('load', () => {
  // If already completed, go to app
  if (localStorage.getItem('onboardingComplete') === 'true') {
    window.location.href = 'index.html';
    return;
  }

  // Show first screen
  document.getElementById(screens[0]).classList.add('active');

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
