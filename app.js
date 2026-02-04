// ============================================================================
// BURNOUT RESCUE ROADMAP - V2.0 MODULAR JAVASCRIPT - POLISHED
// ============================================================================

// Global Constants
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Calendar State
let currentSleepCalendarDate = new Date();
let currentEnergyCalendarDate = new Date();
let currentMovementCalendarDate = new Date();
let currentNutritionCalendarDate = new Date();

// Sleep Habits
const sleepHabits = [
  { name: 'Bedtime window (30-45 min)', icon: 'clock' },
  { name: 'Same Wake Up Time', icon: 'sunrise' },
  { name: 'Cool room (65-68 degrees)', icon: 'thermometer' },
  { name: 'Dim Lights 1 Hr Before Bed', icon: 'lightbulb' },
  { name: 'Replace Screens with Activity', icon: 'book-open' }
];

// Energy Habits
const energyHabits = [
  { name: 'Morning Sunlight (5-20 min)', icon: 'sun' },
  { name: 'Hydrate with Electrolytes', icon: 'droplet' },
  { name: 'Delay Caffeine 90 minutes', icon: 'coffee' }
];

// Nutrition Habits (user-defined)
let nutritionHabits = [];

// Stress Phases
const stressPhases = [
  {
    days: '1-2',
    title: 'Phase 1: Physiological Sigh',
    tasks: [
      'Practice Physiological Sigh 2-3 times in morning',
      'Practice Physiological Sigh once during stress'
    ]
  },
  {
    days: '3-4',
    title: 'Phase 2: Add Mindfulness',
    tasks: [
      'Continue Physiological Sigh',
      'Add 2-3 min Mindfulness breathing daily'
    ]
  },
  {
    days: '5-7',
    title: 'Phase 3: Thought Awareness',
    tasks: [
      'Continue Physiological Sigh',
      'Increase Mindfulness to 5 min daily',
      'Write down 1 thought/feeling'
    ]
  },
  {
    days: '8-11',
    title: 'Phase 4: CBT Practice',
    tasks: [
      'Physiological Sigh',
      '5 min Mindfulness breathing',
      'Complete 1 CBT thought record'
    ]
  },
  {
    days: '12-14',
    title: 'Phase 5: Integration',
    tasks: [
      'Continue all three practices',
      'Reflect daily on which was most effective'
    ]
  }
];

const stressMilestones = [
  'I know how to calm my body quickly (Days 1-2)',
  'I can sit with my breath without judgement (Days 3-4)',
  'I\'m noticing my thoughts instead of being run by them (Days 5-7)',
  'I can catch and record my thoughts daily (Days 8-11)',
  'I can use all three tools together without overwhelm (Days 12-14)'
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Auto-save functionality
let saveTimeout;
function autoSave(key, value) {
  clearTimeout(saveTimeout);
  
  const indicator = document.getElementById('saveIndicator');
  const saveText = document.getElementById('saveText');
  
  // Show "Saving..."
  if (saveText) saveText.textContent = 'Saving...';
  if (indicator) {
    indicator.classList.add('show', 'saving');
  }
  
  saveTimeout = setTimeout(() => {
    // Save to localStorage
    localStorage.setItem(key, value);
    
    // Show "Saved"
    if (saveText) saveText.textContent = 'Saved ✓';
    if (indicator) {
      indicator.classList.remove('saving');
      
      // Hide after 2 seconds
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 2000);
    }
  }, 500);
}

// ============================================================================
// UNIVERSAL CALENDAR COMPONENT
// ============================================================================

function renderUniversalCalendar(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const {
    currentDate,
    getDataForDate,
    calculateCompletion,
    onDateClick,
    monthLabelId
  } = config;
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Update month label if provided
  if (monthLabelId) {
    const label = document.getElementById(monthLabelId);
    if (label) {
      label.textContent = `${monthNames[month]} ${year}`;
    }
  }
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
  const daysInMonth = lastDay.getDate();
  
  let calendarHTML = '<div class="calendar-header">';
  daysOfWeek.forEach(day => {
    calendarHTML += `<div class="calendar-day-label">${day}</div>`;
  });
  calendarHTML += '</div><div class="calendar-grid">';
  
  // Empty cells before month starts
  for (let i = 0; i < startDay; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
  }
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  
  // Render each day
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = getDataForDate(dateKey);
    const completion = calculateCompletion(data);
    
    const isToday = isCurrentMonth && today.getDate() === day;
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (completion.state === 'completed') classes += ' completed';
    else if (completion.state === 'partial') classes += ' partial';
    
    const clickHandler = onDateClick ? `onclick="${onDateClick.name}('${dateKey}')"` : '';
    
    calendarHTML += `
      <div class="${classes}" ${clickHandler}>
        <div class="calendar-day-number">${day}</div>
        <div class="calendar-day-indicator">${completion.indicator || ''}</div>
      </div>
    `;
  }
  
  calendarHTML += '</div>';
  container.innerHTML = calendarHTML;
  
  // Refresh Lucide icons
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
}

function navigateCalendarMonth(currentDate, delta) {
  const newDate = new Date(currentDate);
  newDate.setMonth(newDate.getMonth() + delta);
  return newDate;
}

// ============================================================================
// NAVIGATION
// ============================================================================

function navigateToStep(step) {
  const devMode = new URLSearchParams(window.location.search).get('dev') === '1';
  const phase2Locked = !devMode && localStorage.getItem('phase2Unlocked') !== 'true';
  const phase3Locked = !devMode && localStorage.getItem('phase3Unlocked') !== 'true';

  const phase2Steps = ['mindset', 'movement', 'nutrition'];
  const phase3Steps = ['productivity', 'boundary', 'purpose'];

  if (phase2Locked && phase2Steps.includes(step)) {
    handleLockedStep(step);
    return;
  }
  if (phase3Locked && phase3Steps.includes(step)) {
    handleLockedStep(step);
    return;
  }

  // Hide all sections
  document.querySelectorAll('.step-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(step + '-section');
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.nav-link[data-step="${step}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Close mobile menu if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

function handleLockedStep(step) {
  // Dev mode: navigate directly instead of blocking
  const devMode = new URLSearchParams(window.location.search).get('dev') === '1';
  if (devMode) {
    navigateToStep(step);
    return;
  }
  const xp = getUserXP();
  const phase2Steps = ['mindset', 'movement', 'nutrition'];
  if (phase2Steps.includes(step)) {
    const remaining = Math.max(100 - xp, 0);
    alert(`Reach Level 2 (${remaining} XP to go) to unlock Phase 2!`);
  } else {
    const remaining = Math.max(5000 - xp, 0);
    alert(`Reach Level 5 (${remaining} XP to go) to unlock Phase 3!`);
  }
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebar = document.getElementById('sidebar');
  
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (sidebar) sidebar.classList.add('open');
    });
  }
  
  if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('open');
    });
  }
  
  // Nav link clicks
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const step = link.getAttribute('data-step');
      navigateToStep(step);
    });
  });
});

// Progress calculation functions removed - dashboard now shows streaks instead of percentages

// ============================================================================
// DASHBOARD UPDATE LOGIC
// ============================================================================

function updateDashboard() {
  // Calculate streaks for all steps
  const sleepStreak = calculateSleepStreak();
  const stressStreak = calculateStressStreak();
  const energyStreak = calculateEnergyStreak();
  const mindsetStreak = calculateMindsetStreak();
  const movementStreak = calculateMovementStreak();
  const nutritionStreak = calculateNutritionStreak();

  const streaks = [sleepStreak, stressStreak, energyStreak, mindsetStreak, movementStreak, nutritionStreak];

  // Update dashboard stat cards
  const longestStreak = Math.max(...streaks, 0);
  const streakEl = document.getElementById('dash-current-streak');
  if (streakEl) streakEl.textContent = longestStreak;

  // Calculate total days active
  const allDates = new Set();
  [
    getAllSleepData(),
    getAllStressData(),
    getAllEnergyData(),
    getAllMindsetData(),
    getAllMovementData(),
    getAllNutritionData()
  ].forEach(data => {
    Object.keys(data).forEach(date => allDates.add(date));
  });
  const daysActiveEl = document.getElementById('dash-days-active');
  if (daysActiveEl) daysActiveEl.textContent = allDates.size;

  // Active habits count
  let activeHabits = sleepHabits.length + energyHabits.length + nutritionHabits.length;
  // Stress has variable tasks, mindset is 1 journal, movement is 1 session
  activeHabits += 2; // stress + mindset + movement simplified
  const activeHabitsEl = document.getElementById('dash-active-habits');
  if (activeHabitsEl) activeHabitsEl.textContent = activeHabits;

  // Total check-ins
  let totalCheckins = 0;
  const sleepData = getAllSleepData();
  Object.values(sleepData).forEach(d => { totalCheckins += (d.checks?.filter(c => c).length || 0); });
  const energyData = getAllEnergyData();
  Object.values(energyData).forEach(d => { totalCheckins += (d.checks?.filter(c => c).length || 0); });
  const nutritionData = getAllNutritionData();
  Object.values(nutritionData).forEach(d => { totalCheckins += (d.checks?.filter(c => c).length || 0); });
  const stressData = getAllStressData();
  Object.values(stressData).forEach(d => { if (d.completed) totalCheckins++; });
  const mindsetData = getAllMindsetData();
  Object.values(mindsetData).forEach(d => { if (d.situation && d.situation.trim()) totalCheckins++; });
  const movementData = getAllMovementData();
  Object.values(movementData).forEach(d => { if (d.type && d.type.trim()) totalCheckins++; });

  const totalCheckinsEl = document.getElementById('dash-total-checkins');
  if (totalCheckinsEl) totalCheckinsEl.textContent = totalCheckins;

  // Update step card streak displays
  updateStepStreak('sleep', sleepStreak);
  updateStepStreak('stress', stressStreak);
  updateStepStreak('energy', energyStreak);
  updateStepStreak('mindset', mindsetStreak);
  updateStepStreak('movement', movementStreak);
  updateStepStreak('nutrition', nutritionStreak);

  // Update phase summary stats
  const p1Sleep = document.getElementById('phase1-sleep-streak');
  const p1Stress = document.getElementById('phase1-stress-streak');
  const p1Energy = document.getElementById('phase1-energy-streak');
  if (p1Sleep) p1Sleep.textContent = sleepStreak + 'd';
  if (p1Stress) p1Stress.textContent = stressStreak + 'd';
  if (p1Energy) p1Energy.textContent = energyStreak + 'd';

  const p2Mindset = document.getElementById('phase2-mindset-streak');
  const p2Movement = document.getElementById('phase2-movement-streak');
  const p2Nutrition = document.getElementById('phase2-nutrition-streak');
  if (p2Mindset) p2Mindset.textContent = mindsetStreak + 'd';
  if (p2Movement) p2Movement.textContent = movementStreak + 'd';
  if (p2Nutrition) p2Nutrition.textContent = nutritionStreak + 'd';

  // Update nav streaks
  updateNavStreak('sleep', sleepStreak);
  updateNavStreak('stress', stressStreak);
  updateNavStreak('energy', energyStreak);
  updateNavStreak('mindset', mindsetStreak);
  updateNavStreak('movement', movementStreak);
  updateNavStreak('nutrition', nutritionStreak);

  // Phase 3 streaks
  const productivityStreak = calculateProductivityStreak();
  const boundaryStreak = calculateBoundaryStreak();
  const purposeStreak = calculatePurposeStreak();

  const p3Productivity = document.getElementById('phase3-productivity-streak');
  const p3Boundary = document.getElementById('phase3-boundary-streak');
  const p3Purpose = document.getElementById('phase3-purpose-streak');
  if (p3Productivity) p3Productivity.textContent = productivityStreak + 'd';
  if (p3Boundary) p3Boundary.textContent = boundaryStreak + 'd';
  if (p3Purpose) p3Purpose.textContent = purposeStreak + 'd';

  updateStepStreak('productivity', productivityStreak);
  updateStepStreak('boundary', boundaryStreak);
  updateStepStreak('purpose', purposeStreak);

  updateNavStreak('productivity', productivityStreak);
  updateNavStreak('boundary', boundaryStreak);
  updateNavStreak('purpose', purposeStreak);

  // Include Phase 3 data in total days active
  [getAllProductivityData(), getAllGrowthData()].forEach(data => {
    Object.keys(data).forEach(date => allDates.add(date));
  });
  if (daysActiveEl) daysActiveEl.textContent = allDates.size;

  // Update longest streak to include Phase 3
  const allStreaks = [...streaks, productivityStreak, boundaryStreak, purposeStreak];
  const overallLongest = Math.max(...allStreaks, 0);
  if (streakEl) streakEl.textContent = overallLongest;

  // Update XP display
  updateXPDisplay();

  // Update phase lock states
  updatePhaseLocks();
  


  // Update today's focus
  updateTodaysFocus();
}

function updateStepStreak(step, streak) {
  const streakEl = document.getElementById(step + '-streak-display');
  if (streakEl) streakEl.textContent = streak;
}

function updateNavStreak(step, streak) {
  const navEl = document.getElementById('nav-' + step + '-streak');
  if (navEl) {
    navEl.innerHTML = `<i data-lucide="flame" style="width:14px;height:14px;display:inline;vertical-align:middle;"></i> ${streak}`;
    setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 10);
  }
}

// UPDATED: Today's Focus with Icons (Issue #1)
function updateTodaysFocus() {
  const container = document.getElementById('today-focus-items');
  if (!container) return;

  const todayKey = getTodayKey();
  const focusItems = [];

  const devMode = new URLSearchParams(window.location.search).get('dev') === '1';
  const phase2Open = devMode || localStorage.getItem('phase2Unlocked') === 'true';
  const phase3Open = devMode || localStorage.getItem('phase3Unlocked') === 'true';

  // Check actual completion status for TODAY — Phase 1 (always shown)
  const sleepData = loadSleepDataForDate(todayKey);
  const sleepComplete = (sleepData.checks?.filter(c => c).length || 0) >= 3;

  const stressData = loadStressDataForDate(todayKey);
  const stressComplete = stressData.completed || false;

  const energyData = loadEnergyDataForDate(todayKey);
  const energyComplete = (energyData.checks?.filter(c => c).length || 0) >= 2;

  // Phase 2 — only check if unlocked
  let mindsetComplete = true;
  let movementComplete = true;
  let nutritionComplete = true;
  let mindsetData, movementData, nutritionData;

  if (phase2Open) {
    mindsetData = loadMindsetDataForDate(todayKey);
    mindsetComplete = mindsetData.situation && mindsetData.situation.trim() !== '';

    movementData = loadMovementDataForDate(todayKey);
    movementComplete = movementData.type && movementData.type.trim() !== '';

    nutritionData = loadNutritionDataForDate(todayKey);
    nutritionComplete = nutritionHabits.length > 0 &&
      (nutritionData.checks?.filter(c => c).length || 0) >= nutritionHabits.length * 0.5;
  }

  // Build suggestions for incomplete items — Phase 1
  if (!sleepComplete) {
    const sleepChecked = sleepData.checks?.filter(c => c).length || 0;
    focusItems.push({
      step: `${sleepChecked}/5 habits logged`,
      icon: 'moon',
      title: 'Log your sleep habits',
      link: 'sleep'
    });
  }

  if (!stressComplete) {
    focusItems.push({
      step: 'Practice not yet logged',
      icon: 'wind',
      title: 'Log your stress practice',
      link: 'stress'
    });
  }

  if (!energyComplete) {
    const energyChecked = energyData.checks?.filter(c => c).length || 0;
    focusItems.push({
      step: `${energyChecked}/3 habits logged`,
      icon: 'zap',
      title: 'Log your energy habits',
      link: 'energy'
    });
  }

  // Phase 2 items — only show when unlocked
  if (phase2Open && !mindsetComplete) {
    focusItems.push({
      step: 'Journal not yet logged',
      icon: 'brain',
      title: 'Log your mindset journal',
      link: 'mindset'
    });
  }

  if (phase2Open && !movementComplete) {
    focusItems.push({
      step: 'Session not yet logged',
      icon: 'activity',
      title: 'Log your movement session',
      link: 'movement'
    });
  }

  if (phase2Open && !nutritionComplete && nutritionHabits.length > 0) {
    const nutrChecked = nutritionData.checks?.filter(c => c).length || 0;
    focusItems.push({
      step: `${nutrChecked}/${nutritionHabits.length} habits logged`,
      icon: 'apple',
      title: 'Log your nutrition habits',
      link: 'nutrition'
    });
  }
  
  // If everything is complete, show celebration with streak info
  if (focusItems.length === 0) {
    const streaks = [
      calculateSleepStreak(),
      calculateStressStreak(),
      calculateEnergyStreak(),
      calculateMindsetStreak(),
      calculateMovementStreak(),
      calculateNutritionStreak()
    ];
    const longestStreak = Math.max(...streaks, 0);

    container.innerHTML = `
      <div style="padding: 32px; text-align: center;">
        <div style="margin-bottom: 16px;">
          <div class="stat-icon" style="margin: 0 auto; background: var(--brand-sage);">
            <i data-lucide="check-circle" style="color: white;"></i>
          </div>
        </div>
        <div style="font-size: 1.3em; font-weight: 600; color: var(--brand-sage); margin-bottom: 8px;">All Habits Logged!</div>
        <div style="color: var(--text-secondary); font-size: 1.05em;">
          ${longestStreak > 0 ? `You're on a ${longestStreak}-day streak. Keep it going!` : 'Great start! Come back tomorrow to build your streak.'}
        </div>
      </div>
    `;
    
    // Refresh icons
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 50);
  } else {
    container.innerHTML = focusItems.map(item => `
      <div class="focus-item" onclick="navigateToStep('${item.link}')">
        <div class="focus-icon-wrapper">
          <i data-lucide="${item.icon}"></i>
        </div>
        <div class="focus-content">
          <div class="focus-title">${item.title}</div>
          <div class="focus-step">${item.step}</div>
        </div>
        <div class="focus-arrow">
          <i data-lucide="chevron-right"></i>
        </div>
      </div>
    `).join('');
    
    // Refresh icons
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 50);
  }
}

// ============================================================================
// STREAK CALCULATION HELPERS
// ============================================================================

function calculateSleepStreak() {
  const allData = getAllSleepData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const checks = allData[dates[i]].checks?.filter(c => c).length || 0;
    if (checks >= 3) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateStressStreak() {
  const allData = getAllStressData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    if (allData[dates[i]].completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateEnergyStreak() {
  const allData = getAllEnergyData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const checks = allData[dates[i]].checks?.filter(c => c).length || 0;
    if (checks >= 2) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateMindsetStreak() {
  const allData = getAllMindsetData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    if (data.situation && data.situation.trim() !== '') {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateMovementStreak() {
  const allData = getAllMovementData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    if (data.type && data.type.trim() !== '') {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateNutritionStreak() {
  if (nutritionHabits.length === 0) return 0;
  
  const allData = getAllNutritionData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const checks = allData[dates[i]].checks?.filter(c => c).length || 0;
    if (checks >= nutritionHabits.length * 0.5) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// ============================================================================
// CELEBRATION SYSTEM - UPDATED WITH ICONS (Issue #1)
// ============================================================================

function showCelebration(title, message) {
  // Create celebration modal
  const modal = document.createElement('div');
  modal.className = 'celebration-modal show';
  modal.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-icon">
        <div class="stat-icon" style="width: 80px; height: 80px; margin: 0 auto 20px; background: var(--brand-sage);">
          <i data-lucide="award" style="width: 48px; height: 48px; color: white;"></i>
        </div>
      </div>
      <div class="celebration-title">${title}</div>
      <div class="celebration-message">${message}</div>
      <button class="btn btn-primary" onclick="this.closest('.celebration-modal').remove()">Continue</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Initialize icons
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    modal.remove();
  }, 5000);
}
// ============================================================================
// SLEEP SANCTUARY TRACKER
// ============================================================================

function initSleepTracker() {
  renderTodaySleepTracker();
  renderSleepCalendar();
  renderSleepHabitDashboard();
  calculateSleepStats();
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 100);
}

function renderTodaySleepTracker() {
  const container = document.getElementById('today-sleep-tracker');
  if (!container) return;
  
  const today = new Date();
  const dateStr = `${daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  
  const todayDateEl = document.getElementById('today-sleep-date');
  if (todayDateEl) todayDateEl.textContent = dateStr;
  
  const todayKey = getTodayKey();
  const data = loadSleepDataForDate(todayKey);
  
  container.innerHTML = `
    <div class="checklist">
      ${sleepHabits.map((habit, i) => `
        <div class="checklist-item">
          <input 
            type="checkbox" 
            id="today-sleep-check${i}" 
            ${data.checks && data.checks[i] ? 'checked' : ''}
            onchange="updateTodaySleepTracker()"
          >
          <label for="today-sleep-check${i}">${habit.name}</label>
        </div>
      `).join('')}
    </div>
    
    <div class="input-grid" style="margin-top: 20px;">
      <div class="input-field">
        <label for="today-sleep-hours">Hours Slept</label>
        <input 
          type="number" 
          step="0.5" 
          min="0" 
          max="24" 
          id="today-sleep-hours" 
          placeholder="7.5"
          value="${data.hours || ''}"
          oninput="updateTodaySleepTracker()"
        >
      </div>
      <div class="input-field">
        <label for="today-sleep-bedtime">Bedtime</label>
        <input 
          type="time" 
          id="today-sleep-bedtime"
          value="${data.bedtime || ''}"
          oninput="updateTodaySleepTracker()"
        >
      </div>
      <div class="input-field">
        <label for="today-sleep-wake">Wake Time</label>
        <input 
          type="time" 
          id="today-sleep-wake"
          value="${data.wake || ''}"
          oninput="updateTodaySleepTracker()"
        >
      </div>
      <div class="input-field full-width">
        <label for="today-sleep-notes">Notes</label>
        <textarea 
          id="today-sleep-notes" 
          placeholder="How did you sleep? How do you feel?"
          oninput="updateTodaySleepTracker()"
        >${data.notes || ''}</textarea>
      </div>
    </div>
  `;
}

function updateTodaySleepTracker() {
  const todayKey = getTodayKey();
  const checks = [];

  for (let i = 0; i < 5; i++) {
    const checkbox = document.getElementById(`today-sleep-check${i}`);
    checks.push(checkbox ? checkbox.checked : false);
  }

  const hours = document.getElementById('today-sleep-hours')?.value || '';
  const bedtime = document.getElementById('today-sleep-bedtime')?.value || '';
  const wake = document.getElementById('today-sleep-wake')?.value || '';
  const notes = document.getElementById('today-sleep-notes')?.value || '';

  saveSleepDataForDate(todayKey, { checks, hours, bedtime, wake, notes });

  // Award XP if habits logged
  if (checks.filter(c => c).length >= 3) {
    awardDailyXP('sleep');
    awardStreakXP(calculateSleepStreak(), 'sleep');
  }

  calculateSleepStats();
  renderSleepCalendar();
  renderSleepHabitDashboard();
}

function changeSleepMonth(delta) {
  currentSleepCalendarDate = navigateCalendarMonth(currentSleepCalendarDate, delta);
  renderSleepCalendar();
}

function renderSleepCalendar() {
  renderUniversalCalendar('sleep-calendar', {
    currentDate: currentSleepCalendarDate,
    getDataForDate: loadSleepDataForDate,
    calculateCompletion: (data) => {
      const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
      let state = 'empty';
      if (completedCount >= 4) state = 'completed';
      else if (completedCount >= 2) state = 'partial';
      return {
        state,
        indicator: completedCount > 0 ? `${completedCount}/5` : ''
      };
    },
    onDateClick: jumpToSleepDate,
    monthLabelId: 'sleep-calendar-month-label'
  });
}

function jumpToSleepDate(dateKey) {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}, ${year}`;
  
  const data = loadSleepDataForDate(dateKey);
  const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
  
  if (completedCount > 0 || data.hours) {
    alert(`${dateStr}\n\nHabits: ${completedCount}/5\nHours: ${data.hours || 'Not logged'}\nBedtime: ${data.bedtime || 'N/A'}\nWake: ${data.wake || 'N/A'}\nNotes: ${data.notes || 'None'}`);
  } else {
    alert(`${dateStr}\n\nNo data logged for this day yet.`);
  }
}

function renderSleepHabitDashboard() {
  const container = document.getElementById('sleep-habit-dashboard');
  if (!container) return;
  
  let dashboardHTML = '<div class="habit-dashboard-grid">';
  
  sleepHabits.forEach((habit, habitIndex) => {
    const stats = calculateSleepHabitStats(habitIndex);
    
    dashboardHTML += `
      <div class="habit-card">
        <div class="habit-card-header">
          <div class="habit-title">${habit.name}</div>
          <div class="habit-icon">
            <i data-lucide="${habit.icon}"></i>
          </div>
        </div>
        
        <div class="habit-stats">
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.streak}</div>
            <div class="habit-stat-label">Streak</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.total}</div>
            <div class="habit-stat-label">Days</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.percentage}%</div>
            <div class="habit-stat-label">Rate</div>
          </div>
        </div>
        
        <div class="habit-progress-bar">
          <div class="habit-progress-fill" style="width: ${stats.percentage}%"></div>
        </div>
      </div>
    `;
  });
  
  dashboardHTML += '</div>';
  container.innerHTML = dashboardHTML;
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
}

// FIXED: Habit stats calculation - no more 200% error
function calculateSleepHabitStats(habitIndex) {
  const allData = getAllSleepData();
  const dates = Object.keys(allData).sort();
  
  let streak = 0;
  let totalDaysWithHabit = 0;
  
  // Calculate streak (consecutive days from most recent)
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    if (data.checks && data.checks[habitIndex]) {
      streak++;
      totalDaysWithHabit++;
    } else if (data.checks) {
      break; // Streak broken
    }
  }
  
  // Count total days this habit was completed
  dates.forEach(date => {
    const data = allData[date];
    if (data.checks && data.checks[habitIndex] && !streak) {
      totalDaysWithHabit++;
    }
  });
  
  // FIXED: Calculate percentage as (days with habit / total tracking days) * 100
  // This ensures it never exceeds 100%
  const totalTrackingDays = dates.length;
  const percentage = totalTrackingDays > 0 
    ? Math.min(Math.round((totalDaysWithHabit / totalTrackingDays) * 100), 100) 
    : 0;
  
  return { streak, total: totalDaysWithHabit, percentage };
}

function loadSleepDataForDate(dateKey) {
  const saved = localStorage.getItem('sleepDataByDate');
  if (!saved) return {};
  
  try {
    const data = JSON.parse(saved);
    return data[dateKey] || {};
  } catch (e) {
    return {};
  }
}

function saveSleepDataForDate(dateKey, data) {
  let allData = {};
  const saved = localStorage.getItem('sleepDataByDate');
  
  if (saved) {
    try {
      allData = JSON.parse(saved);
    } catch (e) {
      allData = {};
    }
  }
  
  allData[dateKey] = data;
  autoSave('sleepDataByDate', JSON.stringify(allData));
}

function getAllSleepData() {
  const saved = localStorage.getItem('sleepDataByDate');
  if (!saved) return {};
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
}

function calculateSleepStats() {
  const allData = getAllSleepData();
  const dates = Object.keys(allData).sort();
  
  let streak = 0;
  let totalDays = 0;
  let totalHours = 0;
  let hoursCount = 0;
  
  // Calculate streak
  for (let i = dates.length - 1; i >= 0; i--) {
    const checks = allData[dates[i]].checks?.filter(c => c).length || 0;
    if (checks >= 3) {
      streak++;
      totalDays++;
    } else {
      break;
    }
  }
  
  // Calculate totals
  dates.forEach(date => {
    const data = allData[date];
    const checks = data.checks?.filter(c => c).length || 0;
    
    if (checks >= 3 && dates.indexOf(date) < dates.length - streak) {
      totalDays++;
    }
    
    if (data.hours) {
      totalHours += parseFloat(data.hours);
      hoursCount++;
    }
  });
  
  // This month stats
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthDates = dates.filter(d => d.startsWith(thisMonthKey));
  const monthComplete = thisMonthDates.filter(d => {
    const checks = allData[d].checks?.filter(c => c).length || 0;
    return checks >= 3;
  }).length;
  const monthPct = thisMonthDates.length > 0 ? Math.round((monthComplete / thisMonthDates.length) * 100) : 0;
  
  const avgHours = hoursCount > 0 ? (totalHours / hoursCount).toFixed(1) : 0;
  
  const streakEl = document.getElementById('sleep-streak');
  const monthlyEl = document.getElementById('sleep-monthly');
  const totalEl = document.getElementById('sleep-total');
  const avgEl = document.getElementById('sleep-avg');
  
  if (streakEl) streakEl.textContent = streak;
  if (monthlyEl) monthlyEl.textContent = monthPct + '%';
  if (totalEl) totalEl.textContent = totalDays;
  if (avgEl) avgEl.textContent = avgHours;
  
  if (streak > 0 && streak % 7 === 0) {
    showCelebration(`${streak} Day Streak!`, 'You\'re building incredible sleep habits!');
  }
  
  updateDashboard();
}

// ============================================================================
// STRESS SOOTHERS TRACKER
// ============================================================================

function initStressTracker() {
  renderTodayStressTracker();
  renderStressJourney();
  renderStressMilestones();
  calculateStressStats();
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 100);
}

function renderTodayStressTracker() {
  const container = document.getElementById('today-stress-tracker');
  if (!container) return;
  
  const today = new Date();
  const dateStr = `${daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  
  const todayDateEl = document.getElementById('today-stress-date');
  if (todayDateEl) todayDateEl.textContent = dateStr;
  
  const todayKey = getTodayKey();
  const data = loadStressDataForDate(todayKey);
  
  // Calculate which day of the program based on completed dates
  const allData = getAllStressData();
  const completedDates = Object.keys(allData).sort();
  const dayNum = completedDates.indexOf(todayKey) >= 0 ? completedDates.indexOf(todayKey) + 1 : completedDates.length + 1;
  const actualDayNum = Math.min(dayNum, 14);
  
  // Find which phase this day belongs to
  let currentPhase = stressPhases[0];
  for (let phase of stressPhases) {
    const [start, end] = phase.days.split('-').map(n => parseInt(n));
    if (actualDayNum >= start && actualDayNum <= end) {
      currentPhase = phase;
      break;
    }
  }
  
  container.innerHTML = `
    <div style="margin-bottom: 20px; padding: 16px; background: var(--bg-cream); border-radius: 8px;">
      <div style="font-weight: 600; color: var(--brand-sage); margin-bottom: 4px;">Day ${actualDayNum} of 14</div>
      <div style="font-size: 1.1em; font-weight: 600; color: var(--text-primary);">${currentPhase.title}</div>
    </div>
    
    <div class="checklist">
      ${currentPhase.tasks.map((task, i) => `
        <div class="checklist-item">
          <input 
            type="checkbox" 
            id="today-stress-check${i}" 
            ${data.tasks && data.tasks[i] ? 'checked' : ''}
            onchange="updateTodayStressTracker()"
          >
          <label for="today-stress-check${i}">${task}</label>
        </div>
      `).join('')}
    </div>
    
    <div class="input-grid" style="margin-top: 20px;">
      <div class="input-field full-width">
        <label for="today-stress-notes">Daily Reflection</label>
        <textarea 
          id="today-stress-notes" 
          placeholder="How did today's practice go? What did you notice?"
          oninput="updateTodayStressTracker()"
        >${data.notes || ''}</textarea>
      </div>
    </div>
  `;
}

function updateTodayStressTracker() {
  const todayKey = getTodayKey();

  // Get current phase based on progress
  const allData = getAllStressData();
  const completedDates = Object.keys(allData).sort();
  const dayNum = completedDates.indexOf(todayKey) >= 0 ? completedDates.indexOf(todayKey) + 1 : completedDates.length + 1;
  const actualDayNum = Math.min(dayNum, 14);

  let currentPhase = stressPhases[0];
  for (let phase of stressPhases) {
    const [start, end] = phase.days.split('-').map(n => parseInt(n));
    if (actualDayNum >= start && actualDayNum <= end) {
      currentPhase = phase;
      break;
    }
  }

  const tasks = [];
  for (let i = 0; i < currentPhase.tasks.length; i++) {
    const checkbox = document.getElementById(`today-stress-check${i}`);
    tasks.push(checkbox ? checkbox.checked : false);
  }

  const notes = document.getElementById('today-stress-notes')?.value || '';
  const completed = tasks.every(t => t);

  saveStressDataForDate(todayKey, { tasks, notes, completed });

  // Award XP if practice completed
  if (completed) {
    awardDailyXP('stress');
    awardStreakXP(calculateStressStreak(), 'stress');
  }

  calculateStressStats();
  renderStressJourney();
}

function renderStressJourney() {
  const container = document.getElementById('stress-journey-grid');
  if (!container) return;
  
  const allData = getAllStressData();
  const dates = Object.keys(allData).sort();
  
  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; margin-top: 16px;">';
  
  for (let day = 1; day <= 14; day++) {
    const dateKey = dates[day - 1];
    const data = dateKey ? allData[dateKey] : null;
    const isCompleted = data && data.completed;
    const isToday = dateKey === getTodayKey();
    
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (isCompleted) classes += ' completed';
    else if (data) classes += ' partial';
    
    html += `
      <div class="${classes}">
        <div class="calendar-day-number">Day ${day}</div>
        <div class="calendar-day-indicator">${isCompleted ? '✓' : (data ? '○' : '')}</div>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
}

function renderStressMilestones() {
  const container = document.getElementById('stress-milestones-list');
  if (!container) return;
  
  const milestones = getStressMilestones();
  
  container.innerHTML = stressMilestones.map((milestone, i) => `
    <div class="checklist-item">
      <input 
        type="checkbox" 
        id="stress-milestone${i}" 
        ${milestones[i] ? 'checked' : ''}
        onchange="updateStressMilestones()"
      >
      <label for="stress-milestone${i}">${milestone}</label>
    </div>
  `).join('');
}

function updateStressMilestones() {
  const milestones = [];
  for (let i = 0; i < stressMilestones.length; i++) {
    const checkbox = document.getElementById(`stress-milestone${i}`);
    milestones.push(checkbox ? checkbox.checked : false);
  }
  
  localStorage.setItem('stressMilestones', JSON.stringify(milestones));
  calculateStressStats();
}

function getStressMilestones() {
  const saved = localStorage.getItem('stressMilestones');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

function loadStressDataForDate(dateKey) {
  const saved = localStorage.getItem('stressDataByDate');
  if (!saved) return {};
  
  try {
    const data = JSON.parse(saved);
    return data[dateKey] || {};
  } catch (e) {
    return {};
  }
}

function saveStressDataForDate(dateKey, data) {
  let allData = {};
  const saved = localStorage.getItem('stressDataByDate');
  
  if (saved) {
    try {
      allData = JSON.parse(saved);
    } catch (e) {
      allData = {};
    }
  }
  
  allData[dateKey] = data;
  autoSave('stressDataByDate', JSON.stringify(allData));
}

function getAllStressData() {
  const saved = localStorage.getItem('stressDataByDate');
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
}

function calculateStressStats() {
  const allData = getAllStressData();
  const dates = Object.keys(allData).sort();
  const completedDates = dates.filter(d => allData[d].completed);
  const milestones = getStressMilestones();
  const completedMilestones = milestones.filter(m => m).length;
  
  const daysComplete = dates.length;
  const actualDayNum = Math.min(daysComplete, 14);
  
  // Find current phase
  let phaseName = 'Days 1-2';
  for (let phase of stressPhases) {
    const [start, end] = phase.days.split('-').map(n => parseInt(n));
    if (actualDayNum >= start && actualDayNum <= end) {
      phaseName = `Days ${phase.days}`;
      break;
    }
  }
  
  const percentage = Math.round((daysComplete / 14) * 100);
  
  // Calculate streak
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    if (allData[dates[i]].completed) {
      streak++;
    } else {
      break;
    }
  }
  
  const phaseEl = document.getElementById('stress-phase');
  const daysEl = document.getElementById('stress-days');
  const pctEl = document.getElementById('stress-pct');
  const streakEl = document.getElementById('stress-streak');
  const milestonesEl = document.getElementById('stress-milestones');
  const journeyEl = document.getElementById('stress-journey-progress');
  
  if (phaseEl) phaseEl.textContent = phaseName;
  if (daysEl) daysEl.textContent = `${daysComplete}/14`;
  if (pctEl) pctEl.textContent = percentage + '%';
  if (streakEl) streakEl.textContent = streak;
  if (milestonesEl) milestonesEl.textContent = `${completedMilestones}/5`;
  if (journeyEl) journeyEl.textContent = `${daysComplete}/14 Complete`;
  
  updateDashboard();
}

// ============================================================================
// ENERGY ESSENTIALS TRACKER
// ============================================================================

function initEnergyTracker() {
  renderTodayEnergyTracker();
  renderEnergyCalendar();
  renderEnergyHabitDashboard();
  calculateEnergyStats();
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 100);
}

function renderTodayEnergyTracker() {
  const container = document.getElementById('today-energy-tracker');
  if (!container) return;
  
  const today = new Date();
  const dateStr = `${daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  
  const todayDateEl = document.getElementById('today-energy-date');
  if (todayDateEl) todayDateEl.textContent = dateStr;
  
  const todayKey = getTodayKey();
  const data = loadEnergyDataForDate(todayKey);
  
  container.innerHTML = `
    <div class="checklist">
      ${energyHabits.map((habit, i) => `
        <div class="checklist-item">
          <input 
            type="checkbox" 
            id="today-energy-check${i}" 
            ${data.checks && data.checks[i] ? 'checked' : ''}
            onchange="updateTodayEnergyTracker()"
          >
          <label for="today-energy-check${i}">${habit.name}</label>
        </div>
      `).join('')}
    </div>
    
    <div class="input-grid" style="margin-top: 20px;">
      <div class="input-field">
        <label for="today-energy-level">Energy Level (1-10)</label>
        <input 
          type="number" 
          min="1" 
          max="10" 
          id="today-energy-level" 
          placeholder="8"
          value="${data.energyLevel || ''}"
          oninput="updateTodayEnergyTracker()"
        >
      </div>
      <div class="input-field full-width">
        <label for="today-energy-notes">Notes</label>
        <textarea 
          id="today-energy-notes" 
          placeholder="How are you feeling? Any patterns you notice?"
          oninput="updateTodayEnergyTracker()"
        >${data.notes || ''}</textarea>
      </div>
    </div>
  `;
}

function updateTodayEnergyTracker() {
  const todayKey = getTodayKey();
  const checks = [];

  for (let i = 0; i < 3; i++) {
    const checkbox = document.getElementById(`today-energy-check${i}`);
    checks.push(checkbox ? checkbox.checked : false);
  }

  const energyLevel = document.getElementById('today-energy-level')?.value || '';
  const notes = document.getElementById('today-energy-notes')?.value || '';

  saveEnergyDataForDate(todayKey, { checks, energyLevel, notes });

  // Award XP if habits logged
  if (checks.filter(c => c).length >= 2) {
    awardDailyXP('energy');
    awardStreakXP(calculateEnergyStreak(), 'energy');
  }

  calculateEnergyStats();
  renderEnergyCalendar();
  renderEnergyHabitDashboard();
}

function changeEnergyMonth(delta) {
  currentEnergyCalendarDate = navigateCalendarMonth(currentEnergyCalendarDate, delta);
  renderEnergyCalendar();
}

function renderEnergyCalendar() {
  renderUniversalCalendar('energy-calendar', {
    currentDate: currentEnergyCalendarDate,
    getDataForDate: loadEnergyDataForDate,
    calculateCompletion: (data) => {
      const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
      let state = 'empty';
      if (completedCount === 3) state = 'completed';
      else if (completedCount >= 1) state = 'partial';
      return {
        state,
        indicator: completedCount > 0 ? `${completedCount}/3` : ''
      };
    },
    onDateClick: jumpToEnergyDate,
    monthLabelId: 'energy-calendar-month-label'
  });
}

function jumpToEnergyDate(dateKey) {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}, ${year}`;
  
  const data = loadEnergyDataForDate(dateKey);
  const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
  
  if (completedCount > 0 || data.energyLevel) {
    alert(`${dateStr}\n\nHabits completed: ${completedCount}/3\nEnergy level: ${data.energyLevel || 'Not logged'}\nNotes: ${data.notes || 'None'}`);
  } else {
    alert(`${dateStr}\n\nNo data logged for this day yet.`);
  }
}

function renderEnergyHabitDashboard() {
  const container = document.getElementById('energy-habit-dashboard');
  if (!container) return;
  
  let dashboardHTML = '<div class="habit-dashboard-grid">';
  
  energyHabits.forEach((habit, habitIndex) => {
    const stats = calculateEnergyHabitStats(habitIndex);
    
    dashboardHTML += `
      <div class="habit-card">
        <div class="habit-card-header">
          <div class="habit-title">${habit.name}</div>
          <div class="habit-icon">
            <i data-lucide="${habit.icon}"></i>
          </div>
        </div>
        
        <div class="habit-stats">
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.streak}</div>
            <div class="habit-stat-label">Streak</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.total}</div>
            <div class="habit-stat-label">Days</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.percentage}%</div>
            <div class="habit-stat-label">Rate</div>
          </div>
        </div>
        
        <div class="habit-progress-bar">
          <div class="habit-progress-fill" style="width: ${stats.percentage}%"></div>
        </div>
      </div>
    `;
  });
  
  dashboardHTML += '</div>';
  container.innerHTML = dashboardHTML;
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
}

// FIXED: Same fix applied to energy habit stats
function calculateEnergyHabitStats(habitIndex) {
  const allData = getAllEnergyData();
  const dates = Object.keys(allData).sort();
  
  let streak = 0;
  let totalDaysWithHabit = 0;
  
  // Calculate streak
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    if (data.checks && data.checks[habitIndex]) {
      streak++;
      totalDaysWithHabit++;
    } else if (data.checks) {
      break;
    }
  }
  
  // Count total
  dates.forEach(date => {
    const data = allData[date];
    if (data.checks && data.checks[habitIndex] && !streak) {
      totalDaysWithHabit++;
    }
  });
  
  // FIXED: Proper percentage calculation
  const totalTrackingDays = dates.length;
  const percentage = totalTrackingDays > 0 
    ? Math.min(Math.round((totalDaysWithHabit / totalTrackingDays) * 100), 100) 
    : 0;
  
  return { streak, total: totalDaysWithHabit, percentage };
}

function loadEnergyDataForDate(dateKey) {
  const saved = localStorage.getItem('energyDataByDate');
  if (!saved) return {};
  
  try {
    const data = JSON.parse(saved);
    return data[dateKey] || {};
  } catch (e) {
    return {};
  }
}

function saveEnergyDataForDate(dateKey, data) {
  let allData = {};
  const saved = localStorage.getItem('energyDataByDate');
  
  if (saved) {
    try {
      allData = JSON.parse(saved);
    } catch (e) {
      allData = {};
    }
  }
  
  allData[dateKey] = data;
  autoSave('energyDataByDate', JSON.stringify(allData));
}

function getAllEnergyData() {
  const saved = localStorage.getItem('energyDataByDate');
  if (!saved) return {};
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
}

function calculateEnergyStats() {
  const allData = getAllEnergyData();
  const dates = Object.keys(allData).sort();
  
  let streak = 0;
  let totalDays = 0;
  let totalScore = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
    
    if (completedCount >= 2) {
      streak++;
      totalDays++;
      totalScore += completedCount;
    } else {
      break;
    }
  }
  
  for (let i = 0; i < dates.length - streak; i++) {
    const data = allData[dates[i]];
    const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
    
    if (completedCount >= 2) {
      totalDays++;
      totalScore += completedCount;
    }
  }
  
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthDates = dates.filter(d => d.startsWith(thisMonthKey));
  const monthComplete = thisMonthDates.filter(d => {
    const data = allData[d];
    const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
    return completedCount >= 2;
  }).length;
  const monthPct = thisMonthDates.length > 0 ? Math.round((monthComplete / thisMonthDates.length) * 100) : 0;
  
  const avgScore = totalDays > 0 ? (totalScore / totalDays).toFixed(1) : 0;
  
  const streakEl = document.getElementById('energy-streak');
  const monthlyEl = document.getElementById('energy-monthly');
  const totalEl = document.getElementById('energy-total');
  const avgEl = document.getElementById('energy-avg');
  
  if (streakEl) streakEl.textContent = streak;
  if (monthlyEl) monthlyEl.textContent = monthPct + '%';
  if (totalEl) totalEl.textContent = totalDays;
  if (avgEl) avgEl.textContent = avgScore + '/3';
  
  if (streak > 0 && streak % 7 === 0) {
    showCelebration(`${streak} Day Streak!`, 'You\'re mastering your energy habits!');
  }
  
  updateDashboard();
}
// ============================================================================
// MINDSET MASTERY TRACKER
// ============================================================================

function initMindsetTracker() {
  loadMindsetReflection();
  renderTodayMindsetTracker();
  calculateMindsetStats();
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 100);
}

function renderTodayMindsetTracker() {
  const container = document.getElementById('today-mindset-tracker');
  if (!container) return;
  
  const todayKey = getTodayKey();
  const data = loadMindsetDataForDate(todayKey);
  
  // Calculate which day of the program based on completed dates
  const allData = getAllMindsetData();
  const completedDates = Object.keys(allData).sort();
  const dayNum = completedDates.indexOf(todayKey) >= 0 ? completedDates.indexOf(todayKey) + 1 : completedDates.length + 1;
  const actualDayNum = Math.min(dayNum, 12);
  
  const todayDateEl = document.getElementById('today-mindset-date');
  if (todayDateEl) todayDateEl.textContent = `Day ${actualDayNum} of 12`;
  
  container.innerHTML = `
    <div class="input-field" style="margin-bottom: 16px;">
      <label for="mind-situation">Situation I faced today:</label>
      <input 
        type="text" 
        id="mind-situation" 
        placeholder="e.g., workout skipped, stressful meeting..."
        value="${data.situation || ''}"
        oninput="updateTodayMindset()"
      >
    </div>
    
    <div class="input-field" style="margin-bottom: 16px;">
      <label for="mind-story">The story I told myself was:</label>
      <textarea 
        id="mind-story" 
        placeholder="My mindset was..."
        oninput="updateTodayMindset()"
      >${data.story || ''}</textarea>
    </div>
    
    <div style="margin-bottom: 16px;">
      <label style="display: block; font-size: 0.9em; color: var(--text-secondary); margin-bottom: 8px;">This mindset was:</label>
      <div style="display: flex; gap: 16px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input 
            type="radio" 
            name="mind-type" 
            value="enhancing"
            ${data.type === 'enhancing' ? 'checked' : ''}
            onchange="updateTodayMindset()"
            style="margin-right: 8px; accent-color: var(--brand-sage);"
          >
          Enhancing
        </label>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input 
            type="radio" 
            name="mind-type" 
            value="debilitating"
            ${data.type === 'debilitating' ? 'checked' : ''}
            onchange="updateTodayMindset()"
            style="margin-right: 8px; accent-color: var(--brand-sage);"
          >
          Debilitating
        </label>
      </div>
    </div>
  `;
}

function updateTodayMindset() {
  const todayKey = getTodayKey();
  const situation = document.getElementById('mind-situation')?.value || '';
  const story = document.getElementById('mind-story')?.value || '';
  const typeRadios = document.getElementsByName('mind-type');
  let type = '';
  typeRadios.forEach(radio => {
    if (radio.checked) type = radio.value;
  });

  saveMindsetDataForDate(todayKey, { situation, story, type });

  // Award XP if journal entry logged
  if (situation && situation.trim()) {
    awardDailyXP('mindset');
    awardStreakXP(calculateMindsetStreak(), 'mindset');
  }

  calculateMindsetStats();
}

function loadMindsetReflection() {
  const reflection = localStorage.getItem('mindsetReflection');
  if (reflection) {
    try {
      const data = JSON.parse(reflection);
      const origEl = document.getElementById('mind-orig');
      const reframeEl = document.getElementById('mind-reframe');
      const morningEl = document.getElementById('mind-morning');
      const eveningEl = document.getElementById('mind-evening');
      
      if (origEl) origEl.value = data.orig || '';
      if (reframeEl) reframeEl.value = data.reframe || '';
      if (morningEl) morningEl.value = data.morning || '';
      if (eveningEl) eveningEl.value = data.evening || '';
    } catch (e) {}
  }
}

function saveMindsetReflection() {
  const orig = document.getElementById('mind-orig')?.value || '';
  const reframe = document.getElementById('mind-reframe')?.value || '';
  const morning = document.getElementById('mind-morning')?.value || '';
  const evening = document.getElementById('mind-evening')?.value || '';
  
  autoSave('mindsetReflection', JSON.stringify({ orig, reframe, morning, evening }));
  calculateMindsetStats();
}

function loadMindsetDataForDate(dateKey) {
  const saved = localStorage.getItem('mindsetDataByDate');
  if (!saved) return {};
  
  try {
    const data = JSON.parse(saved);
    return data[dateKey] || {};
  } catch (e) {
    return {};
  }
}

function saveMindsetDataForDate(dateKey, data) {
  let allData = {};
  const saved = localStorage.getItem('mindsetDataByDate');
  
  if (saved) {
    try {
      allData = JSON.parse(saved);
    } catch (e) {
      allData = {};
    }
  }
  
  allData[dateKey] = data;
  autoSave('mindsetDataByDate', JSON.stringify(allData));
}

function getAllMindsetData() {
  const saved = localStorage.getItem('mindsetDataByDate');
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
}

function calculateMindsetStats() {
  const allData = getAllMindsetData();
  const dates = Object.keys(allData).sort();
  
  let completed = 0;
  let reframes = 0;
  let streak = 0;
  
  dates.forEach(date => {
    const dayData = allData[date];
    if (dayData && dayData.situation && dayData.situation.trim() !== '') {
      completed++;
      if (dayData.type === 'enhancing') reframes++;
    }
  });
  
  // Calculate streak from most recent dates backwards
  for (let i = dates.length - 1; i >= 0; i--) {
    const dayData = allData[dates[i]];
    if (dayData && dayData.situation && dayData.situation.trim() !== '') {
      streak++;
    } else {
      break;
    }
  }
  
  // Check if reflection is complete
  const reflection = localStorage.getItem('mindsetReflection');
  let hasReflection = 0;
  if (reflection) {
    try {
      const data = JSON.parse(reflection);
      if (data.orig || data.reframe || data.morning || data.evening) hasReflection = 1;
    } catch (e) {}
  }
  
  const pct = Math.round((completed / 12) * 100);
  
  const daysEl = document.getElementById('mindset-days');
  const streakEl = document.getElementById('mindset-streak');
  const pctEl = document.getElementById('mindset-pct');
  const reflectionsEl = document.getElementById('mindset-reflections');
  
  if (daysEl) daysEl.textContent = `${completed}/12`;
  if (streakEl) streakEl.textContent = streak;
  if (pctEl) pctEl.textContent = pct + '%';
  if (reflectionsEl) reflectionsEl.textContent = hasReflection;
  
  if (completed > 0 && completed % 4 === 0) {
    showCelebration(`Mindset Progress!`, `${completed} days of powerful awareness!`);
  }
  
  updateDashboard();
}

// ============================================================================
// MOVEMENT MOMENTUM TRACKER
// ============================================================================

function initMovementTracker() {
  renderTodayMovementTracker();
  renderMovementCalendar();
  calculateMovementStats();
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 100);
}

function renderTodayMovementTracker() {
  const container = document.getElementById('today-movement-tracker');
  if (!container) return;
  
  const today = new Date();
  const dateStr = `${daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  
  const todayDateEl = document.getElementById('today-movement-date');
  if (todayDateEl) todayDateEl.textContent = dateStr;
  
  const todayKey = getTodayKey();
  const data = loadMovementDataForDate(todayKey);
  
  container.innerHTML = `
    <div class="input-grid">
      <div class="input-field">
        <label for="today-move-type">Movement Type</label>
        <input 
          type="text" 
          id="today-move-type" 
          placeholder="Walk, yoga, lift..."
          value="${data.type || ''}"
          oninput="updateTodayMovement()"
        >
      </div>
      <div class="input-field">
        <label for="today-move-duration">Duration (min)</label>
        <input 
          type="number" 
          id="today-move-duration" 
          placeholder="30"
          value="${data.duration || ''}"
          oninput="updateTodayMovement()"
        >
      </div>
      <div class="input-field">
        <label for="today-move-before">Energy Before (1-5)</label>
        <input 
          type="number" 
          min="1" 
          max="5" 
          id="today-move-before" 
          placeholder="2"
          value="${data.before || ''}"
          oninput="updateTodayMovement()"
        >
      </div>
      <div class="input-field">
        <label for="today-move-after">Energy After (1-5)</label>
        <input 
          type="number" 
          min="1" 
          max="5" 
          id="today-move-after" 
          placeholder="4"
          value="${data.after || ''}"
          oninput="updateTodayMovement()"
        >
      </div>
      <div class="input-field full-width">
        <label for="today-move-notes">Notes</label>
        <textarea 
          id="today-move-notes" 
          placeholder="How did it feel? What did you learn?"
          oninput="updateTodayMovement()"
        >${data.notes || ''}</textarea>
      </div>
    </div>
  `;
}

function updateTodayMovement() {
  const todayKey = getTodayKey();
  const type = document.getElementById('today-move-type')?.value || '';
  const duration = document.getElementById('today-move-duration')?.value || '';
  const before = document.getElementById('today-move-before')?.value || '';
  const after = document.getElementById('today-move-after')?.value || '';
  const notes = document.getElementById('today-move-notes')?.value || '';

  saveMovementDataForDate(todayKey, { type, duration, before, after, notes });

  // Award XP if movement logged
  if (type && type.trim()) {
    awardDailyXP('movement');
    awardStreakXP(calculateMovementStreak(), 'movement');
  }

  calculateMovementStats();
  renderMovementCalendar();
}

function changeMovementMonth(delta) {
  currentMovementCalendarDate = navigateCalendarMonth(currentMovementCalendarDate, delta);
  renderMovementCalendar();
}

function renderMovementCalendar() {
  renderUniversalCalendar('movement-calendar', {
    currentDate: currentMovementCalendarDate,
    getDataForDate: loadMovementDataForDate,
    calculateCompletion: (data) => {
      const hasMovement = data.type && data.type.trim() !== '';
      return {
        state: hasMovement ? 'completed' : 'empty',
        indicator: hasMovement ? '✓' : ''
      };
    },
    onDateClick: jumpToMovementDate,
    monthLabelId: 'movement-calendar-month-label'
  });
}

function jumpToMovementDate(dateKey) {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}, ${year}`;
  
  const data = loadMovementDataForDate(dateKey);
  
  if (data.type) {
    const boost = data.before && data.after ? (parseInt(data.after) - parseInt(data.before)) : 0;
    alert(`${dateStr}\n\nType: ${data.type}\nDuration: ${data.duration || 'N/A'} min\nEnergy boost: ${boost > 0 ? '+' + boost : boost}\nNotes: ${data.notes || 'None'}`);
  } else {
    alert(`${dateStr}\n\nNo movement logged for this day yet.`);
  }
}

function loadMovementDataForDate(dateKey) {
  const saved = localStorage.getItem('movementDataByDate');
  if (!saved) return {};
  
  try {
    const data = JSON.parse(saved);
    return data[dateKey] || {};
  } catch (e) {
    return {};
  }
}

function saveMovementDataForDate(dateKey, data) {
  let allData = {};
  const saved = localStorage.getItem('movementDataByDate');
  
  if (saved) {
    try {
      allData = JSON.parse(saved);
    } catch (e) {
      allData = {};
    }
  }
  
  allData[dateKey] = data;
  autoSave('movementDataByDate', JSON.stringify(allData));
}

function getAllMovementData() {
  const saved = localStorage.getItem('movementDataByDate');
  if (!saved) return {};
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
}

function calculateMovementStats() {
  const allData = getAllMovementData();
  const dates = Object.keys(allData).sort();
  
  let streak = 0;
  let total = 0;
  let boostSum = 0;
  let boostCount = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    if (data.type && data.type.trim() !== '') {
      streak++;
      total++;
      
      if (data.before && data.after) {
        boostSum += (parseInt(data.after) - parseInt(data.before));
        boostCount++;
      }
    } else {
      break;
    }
  }
  
  for (let i = 0; i < dates.length - streak; i++) {
    const data = allData[dates[i]];
    if (data.type && data.type.trim() !== '') {
      total++;
      
      if (data.before && data.after) {
        boostSum += (parseInt(data.after) - parseInt(data.before));
        boostCount++;
      }
    }
  }
  
  // This week
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
  
  const thisWeekDates = dates.filter(d => d >= weekStartKey);
  const weekTotal = thisWeekDates.filter(d => {
    const data = allData[d];
    return data.type && data.type.trim() !== '';
  }).length;
  
  const avgBoost = boostCount > 0 ? (boostSum / boostCount).toFixed(1) : 0;
  
  const streakEl = document.getElementById('movement-streak');
  const totalEl = document.getElementById('movement-total');
  const weekEl = document.getElementById('movement-week');
  const avgEl = document.getElementById('movement-avg');
  
  if (streakEl) streakEl.textContent = streak;
  if (totalEl) totalEl.textContent = total;
  if (weekEl) weekEl.textContent = weekTotal;
  if (avgEl) avgEl.textContent = avgBoost >= 0 ? '+' + avgBoost : avgBoost;
  
  if (streak > 0 && streak % 7 === 0) {
    showCelebration(`${streak} Day Streak!`, 'Your body thanks you!');
  }
  
  updateDashboard();
}

// ============================================================================
// NUTRITION NAVIGATION TRACKER
// ============================================================================

function initNutritionTracker() {
  loadNutritionHabits();
  if (nutritionHabits.length > 0) {
    showNutritionTrackers();
    renderTodayNutritionTracker();
    renderNutritionCalendar();
    renderNutritionHabitDashboard();
  }
  calculateNutritionStats();
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 100);
}

function loadNutritionHabits() {
  const saved = localStorage.getItem('nutritionHabits');
  if (saved) {
    try {
      nutritionHabits = JSON.parse(saved);
      
      // Populate the input fields
      for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`nutr-h${i}`);
        if (input && nutritionHabits[i - 1]) {
          input.value = nutritionHabits[i - 1];
        }
      }
    } catch (e) {
      nutritionHabits = [];
    }
  }
}

function generateNutritionTracker() {
  nutritionHabits = [];
  
  for (let i = 1; i <= 5; i++) {
    const habitInput = document.getElementById(`nutr-h${i}`);
    if (habitInput && habitInput.value.trim() !== '') {
      nutritionHabits.push(habitInput.value.trim());
    }
  }
  
  if (nutritionHabits.length === 0) {
    alert('Please enter at least one habit!');
    return;
  }
  
  localStorage.setItem('nutritionHabits', JSON.stringify(nutritionHabits));
  
  showNutritionTrackers();
  renderTodayNutritionTracker();
  renderNutritionCalendar();
  renderNutritionHabitDashboard();
  calculateNutritionStats();
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 100);
}

function showNutritionTrackers() {
  const setupCard = document.getElementById('nutrition-setup-card');
  const todayCard = document.getElementById('nutrition-today-card');
  const calendarCard = document.getElementById('nutrition-calendar-card');
  const dashboardContainer = document.getElementById('nutrition-habit-dashboard-container');
  
  if (setupCard) setupCard.style.display = 'none';
  if (todayCard) todayCard.style.display = 'block';
  if (calendarCard) calendarCard.style.display = 'block';
  if (dashboardContainer) dashboardContainer.style.display = 'block';
}

function renderTodayNutritionTracker() {
  const container = document.getElementById('today-nutrition-tracker');
  if (!container) return;
  
  const today = new Date();
  const dateStr = `${daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  
  const todayDateEl = document.getElementById('today-nutrition-date');
  if (todayDateEl) todayDateEl.textContent = dateStr;
  
  const todayKey = getTodayKey();
  const data = loadNutritionDataForDate(todayKey);
  
  container.innerHTML = `
    <div class="checklist">
      ${nutritionHabits.map((habit, i) => `
        <div class="checklist-item">
          <input 
            type="checkbox" 
            id="today-nutr-check${i}" 
            ${data.checks && data.checks[i] ? 'checked' : ''}
            onchange="updateTodayNutrition()"
          >
          <label for="today-nutr-check${i}">${habit}</label>
        </div>
      `).join('')}
    </div>
    
    <div class="input-grid" style="margin-top: 20px;">
      <div class="input-field full-width">
        <label for="today-nutr-notes">Reflection</label>
        <textarea 
          id="today-nutr-notes" 
          placeholder="Which foods gave you energy? Any patterns you notice?"
          oninput="updateTodayNutrition()"
        >${data.notes || ''}</textarea>
      </div>
    </div>
  `;
}

function updateTodayNutrition() {
  const todayKey = getTodayKey();
  const checks = [];

  for (let i = 0; i < nutritionHabits.length; i++) {
    const checkbox = document.getElementById(`today-nutr-check${i}`);
    checks.push(checkbox ? checkbox.checked : false);
  }

  const notes = document.getElementById('today-nutr-notes')?.value || '';

  saveNutritionDataForDate(todayKey, { checks, notes });

  // Award XP if enough habits logged
  if (checks.filter(c => c).length >= nutritionHabits.length * 0.5) {
    awardDailyXP('nutrition');
    awardStreakXP(calculateNutritionStreak(), 'nutrition');
  }

  calculateNutritionStats();
  renderNutritionCalendar();
  renderNutritionHabitDashboard();
}

function changeNutritionMonth(delta) {
  currentNutritionCalendarDate = navigateCalendarMonth(currentNutritionCalendarDate, delta);
  renderNutritionCalendar();
}

function renderNutritionCalendar() {
  renderUniversalCalendar('nutrition-calendar', {
    currentDate: currentNutritionCalendarDate,
    getDataForDate: loadNutritionDataForDate,
    calculateCompletion: (data) => {
      const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
      const totalHabits = nutritionHabits.length;
      let state = 'empty';
      if (completedCount >= totalHabits * 0.8) state = 'completed';
      else if (completedCount >= totalHabits * 0.5) state = 'partial';
      return {
        state,
        indicator: completedCount > 0 ? `${completedCount}/${totalHabits}` : ''
      };
    },
    onDateClick: jumpToNutritionDate,
    monthLabelId: 'nutrition-calendar-month-label'
  });
}

function jumpToNutritionDate(dateKey) {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}, ${year}`;
  
  const data = loadNutritionDataForDate(dateKey);
  const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
  
  if (completedCount > 0) {
    alert(`${dateStr}\n\nHabits completed: ${completedCount}/${nutritionHabits.length}\nNotes: ${data.notes || 'None'}`);
  } else {
    alert(`${dateStr}\n\nNo data logged for this day yet.`);
  }
}

function renderNutritionHabitDashboard() {
  const container = document.getElementById('nutrition-habit-dashboard');
  if (!container) return;
  
  let dashboardHTML = '<div class="habit-dashboard-grid">';
  
  nutritionHabits.forEach((habit, habitIndex) => {
    const stats = calculateNutritionHabitStats(habitIndex);
    
    dashboardHTML += `
      <div class="habit-card">
        <div class="habit-card-header">
          <div class="habit-title">${habit}</div>
          <div class="habit-icon">
            <i data-lucide="apple"></i>
          </div>
        </div>
        
        <div class="habit-stats">
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.streak}</div>
            <div class="habit-stat-label">Streak</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.total}</div>
            <div class="habit-stat-label">Days</div>
          </div>
          <div class="habit-stat">
            <div class="habit-stat-value">${stats.percentage}%</div>
            <div class="habit-stat-label">Rate</div>
          </div>
        </div>
        
        <div class="habit-progress-bar">
          <div class="habit-progress-fill" style="width: ${stats.percentage}%"></div>
        </div>
      </div>
    `;
  });
  
  dashboardHTML += '</div>';
  container.innerHTML = dashboardHTML;
  
  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 50);
}

// FIXED: Same fix for nutrition habit stats
function calculateNutritionHabitStats(habitIndex) {
  const allData = getAllNutritionData();
  const dates = Object.keys(allData).sort();
  
  let streak = 0;
  let totalDaysWithHabit = 0;
  
  // Calculate streak
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    if (data.checks && data.checks[habitIndex]) {
      streak++;
      totalDaysWithHabit++;
    } else if (data.checks) {
      break;
    }
  }
  
  // Count total
  dates.forEach(date => {
    const data = allData[date];
    if (data.checks && data.checks[habitIndex] && !streak) {
      totalDaysWithHabit++;
    }
  });
  
  // FIXED: Proper percentage calculation
  const totalTrackingDays = dates.length;
  const percentage = totalTrackingDays > 0 
    ? Math.min(Math.round((totalDaysWithHabit / totalTrackingDays) * 100), 100) 
    : 0;
  
  return { streak, total: totalDaysWithHabit, percentage };
}

function loadNutritionDataForDate(dateKey) {
  const saved = localStorage.getItem('nutritionDataByDate');
  if (!saved) return {};
  
  try {
    const data = JSON.parse(saved);
    return data[dateKey] || {};
  } catch (e) {
    return {};
  }
}

function saveNutritionDataForDate(dateKey, data) {
  let allData = {};
  const saved = localStorage.getItem('nutritionDataByDate');
  
  if (saved) {
    try {
      allData = JSON.parse(saved);
    } catch (e) {
      allData = {};
    }
  }
  
  allData[dateKey] = data;
  autoSave('nutritionDataByDate', JSON.stringify(allData));
}

function getAllNutritionData() {
  const saved = localStorage.getItem('nutritionDataByDate');
  if (!saved) return {};
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
}

function calculateNutritionStats() {
  if (nutritionHabits.length === 0) {
    const streakEl = document.getElementById('nutrition-streak');
    const totalEl = document.getElementById('nutrition-total');
    const monthlyEl = document.getElementById('nutrition-monthly');
    const pctEl = document.getElementById('nutrition-pct');
    
    if (streakEl) streakEl.textContent = 0;
    if (totalEl) totalEl.textContent = 0;
    if (monthlyEl) monthlyEl.textContent = '0%';
    if (pctEl) pctEl.textContent = '0%';
    return;
  }
  
  const allData = getAllNutritionData();
  const dates = Object.keys(allData).sort();
  
  let streak = 0;
  let totalChecks = 0;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const data = allData[dates[i]];
    const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
    
    if (completedCount >= nutritionHabits.length * 0.5) {
      streak++;
      totalChecks += completedCount;
    } else {
      break;
    }
  }
  
  for (let i = 0; i < dates.length - streak; i++) {
    const data = allData[dates[i]];
    const completedCount = data.checks ? data.checks.filter(c => c).length : 0;
    totalChecks += completedCount;
  }
  
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthDates = dates.filter(d => d.startsWith(thisMonthKey));
  
  let monthChecks = 0;
  let monthPossible = 0;
  thisMonthDates.forEach(d => {
    const data = allData[d];
    if (data.checks) {
      monthChecks += data.checks.filter(c => c).length;
      monthPossible += nutritionHabits.length;
    }
  });
  
  const monthPct = monthPossible > 0 ? Math.round((monthChecks / monthPossible) * 100) : 0;
  const overallPct = dates.length > 0 ? Math.round((totalChecks / (dates.length * nutritionHabits.length)) * 100) : 0;
  
  const streakEl = document.getElementById('nutrition-streak');
  const totalEl = document.getElementById('nutrition-total');
  const monthlyEl = document.getElementById('nutrition-monthly');
  const pctEl = document.getElementById('nutrition-pct');
  
  if (streakEl) streakEl.textContent = streak;
  if (totalEl) totalEl.textContent = totalChecks;
  if (monthlyEl) monthlyEl.textContent = monthPct + '%';
  if (pctEl) pctEl.textContent = overallPct + '%';
  
  if (streak > 0 && streak % 7 === 0) {
    showCelebration(`${streak} Day Streak!`, 'Nourishing your body consistently!');
  }
  
  updateDashboard();
}

// ============================================================================
// XP & PHASE UNLOCK SYSTEM
// ============================================================================

function getUserXP() {
  return parseInt(localStorage.getItem('userXP') || '0');
}

function addXP(amount, reason) {
  const currentXP = getUserXP();
  const newXP = currentXP + amount;
  localStorage.setItem('userXP', newXP.toString());

  checkPhaseUnlocks(newXP);
  showXPNotification(amount, reason);
  updateXPDisplay();
}

function checkPhaseUnlocks(xp) {
  const phase2Unlocked = localStorage.getItem('phase2Unlocked') === 'true';
  const phase3Unlocked = localStorage.getItem('phase3Unlocked') === 'true';

  if (xp >= 100 && !phase2Unlocked) {
    localStorage.setItem('phase2Unlocked', 'true');
    showCelebration('Phase 2 Unlocked!', 'You\'ve unlocked Rebuild Routines - Mindset, Movement, and Nutrition are now available!');
    updatePhaseLocks();
  }

  if (xp >= 5000 && !phase3Unlocked) {
    localStorage.setItem('phase3Unlocked', 'true');
    showCelebration('Phase 3 Unlocked!', 'You\'ve unlocked Rise with Resilience - Productivity, Boundaries, and Purpose are now available!');
    updatePhaseLocks();
  }
}

function showXPNotification(amount, reason) {
  const notification = document.createElement('div');
  notification.className = 'xp-notification';
  notification.innerHTML = `
    <div class="xp-notif-icon">
      <i data-lucide="star"></i>
    </div>
    <div>
      <div class="xp-notif-amount">+${amount} XP</div>
      <div class="xp-notif-reason">${reason}</div>
    </div>
  `;

  document.body.appendChild(notification);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => { notification.classList.add('show'); }, 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => { notification.remove(); }, 300);
  }, 3000);
}

function updateXPDisplay() {
  const xp = getUserXP();
  const xpDisplay = document.getElementById('user-xp-display');
  if (xpDisplay) xpDisplay.textContent = xp;

  // Update dashboard level bar
  const levels = [
    { level: 1, xpNeeded: 0, next: 500 },
    { level: 2, xpNeeded: 500, next: 1200 },
    { level: 3, xpNeeded: 1200, next: 2500 },
    { level: 4, xpNeeded: 2500, next: 5000 },
    { level: 5, xpNeeded: 5000, next: null }
  ];

  let current = levels[0];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xpNeeded) {
      current = levels[i];
      break;
    }
  }

  const levelBadge = document.getElementById('xp-level-badge');
  const totalDisplay = document.getElementById('xp-total-display');
  const nextLevel = document.getElementById('xp-next-level');
  const barFill = document.getElementById('xp-bar-fill');

  if (levelBadge) levelBadge.textContent = `Level ${current.level}`;
  if (totalDisplay) totalDisplay.textContent = `${xp} XP`;

  if (current.next) {
    const progress = ((xp - current.xpNeeded) / (current.next - current.xpNeeded)) * 100;
    if (barFill) barFill.style.width = Math.min(progress, 100) + '%';
    if (nextLevel) nextLevel.textContent = `${current.next - xp} XP to Level ${current.level + 1}`;
  } else {
    if (barFill) barFill.style.width = '100%';
    if (nextLevel) nextLevel.textContent = 'Max Level!';
  }

  // Update phase 2 unlock bar
  const phase2Unlocked = localStorage.getItem('phase2Unlocked') === 'true';
  const phase2Bar = document.getElementById('phase2-unlock-progress');
  const phase2Label = document.getElementById('phase2-xp-label');
  const phase2Section = document.getElementById('phase2-unlock-section');

  if (phase2Unlocked) {
    if (phase2Section) phase2Section.style.display = 'none';
  } else {
    if (phase2Section) phase2Section.style.display = 'flex';
    const progress = Math.min((xp / 100) * 100, 100);
    if (phase2Bar) phase2Bar.style.width = progress + '%';
    if (phase2Label) phase2Label.textContent = `${xp} / 100 XP to unlock`;
  }

  // Update phase 3 unlock bar
  const phase3Unlocked = localStorage.getItem('phase3Unlocked') === 'true';
  const phase3Bar = document.getElementById('phase3-unlock-progress');
  const phase3Label = document.getElementById('phase3-xp-label');
  const phase3Section = document.getElementById('phase3-unlock-section');

  if (phase3Unlocked) {
    if (phase3Section) phase3Section.style.display = 'none';
  } else {
    if (phase3Section) phase3Section.style.display = 'flex';
    const progress = Math.min((xp / 5000) * 100, 100);
    if (phase3Bar) phase3Bar.style.width = progress + '%';
    if (phase3Label) phase3Label.textContent = `${xp} / 5000 XP to unlock`;
  }
}

function updatePhaseLocks() {
  // Dev mode: add ?dev=1 to URL to unlock all phases for testing
  const devMode = new URLSearchParams(window.location.search).get('dev') === '1';
  const phase2Unlocked = devMode || localStorage.getItem('phase2Unlocked') === 'true';
  const phase3Unlocked = devMode || localStorage.getItem('phase3Unlocked') === 'true';

  // Phase 2 lock
  const phase2Lock = document.getElementById('phase2-lock');
  const phase2Card = document.getElementById('phase2-card');
  if (phase2Unlocked) {
    if (phase2Lock) phase2Lock.style.display = 'none';
    if (phase2Card) phase2Card.classList.remove('locked');
    document.querySelectorAll('.phase2-nav').forEach(el => el.classList.remove('phase-locked'));
    document.querySelectorAll('.phase2-step').forEach(el => {
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });
  } else {
    if (phase2Lock) phase2Lock.style.display = 'inline';
    if (phase2Card) phase2Card.classList.add('locked');
    document.querySelectorAll('.phase2-nav').forEach(el => el.classList.add('phase-locked'));
    document.querySelectorAll('.phase2-step').forEach(el => {
      el.style.opacity = '0.5';
      el.style.pointerEvents = 'none';
    });
  }

  // Phase 3 lock
  const phase3Lock = document.getElementById('phase3-lock');
  const phase3Card = document.getElementById('phase3-card');
  if (phase3Unlocked) {
    if (phase3Lock) phase3Lock.style.display = 'none';
    if (phase3Card) phase3Card.classList.remove('locked');
    document.querySelectorAll('.phase3-nav').forEach(el => el.classList.remove('phase-locked'));
    document.querySelectorAll('.step-card-locked').forEach(el => {
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.pointerEvents = 'auto';
      el.onclick = null;
    });
  } else {
    if (phase3Lock) phase3Lock.style.display = 'inline';
    if (phase3Card) phase3Card.classList.add('locked');
    document.querySelectorAll('.phase3-nav').forEach(el => el.classList.add('phase-locked'));
    document.querySelectorAll('.step-card-locked').forEach(el => {
      el.style.opacity = '0.6';
      el.style.filter = 'blur(1px)';
    });
  }
}

// XP award helpers - only award once per day per tracker
function awardDailyXP(trackerKey) {
  const todayKey = getTodayKey();
  const xpAwardedKey = `xpAwarded_${trackerKey}_${todayKey}`;

  if (localStorage.getItem(xpAwardedKey)) return; // Already awarded today

  localStorage.setItem(xpAwardedKey, 'true');
  addXP(10, 'Daily habit logged');
}

function awardStreakXP(streakDays, trackerKey) {
  if (streakDays > 0 && streakDays % 7 === 0) {
    const streakXPKey = `streakXP_${trackerKey}_${streakDays}`;
    if (!localStorage.getItem(streakXPKey)) {
      localStorage.setItem(streakXPKey, 'true');
      addXP(25, `${streakDays}-day streak!`);
    }
  }

}

// ============================================================================
// STEP 7: PRODUCTIVITY POWER PLAN
// ============================================================================

const timeBlockLabels = [
  'Deep Work/Focus #1',
  'Deep Work/Focus #2',
  'Shallow Work/Admin',
  'Breaks',
  'Recovery (walk, stretch, etc)'
];

const environmentChecklist = [
  'Phone out of room',
  'Browser tabs closed',
  'Notifications off',
  'Workspace clear and ready',
  'Ritual check (water, posture, focus ready)'
];

const reflectionQuestions = [
  { key: 'mits', q: 'Did I complete my MITs (most important tasks)?' },
  { key: 'deepWork', q: 'Did I protect at least one deep work block?' },
  { key: 'distractions', q: 'Did I avoid distractions?' },
  { key: 'improve', q: 'What will I improve tomorrow?' }
];

function loadProductivityDataForDate(dateKey) {
  const saved = localStorage.getItem('productivityDataByDate');
  if (!saved) return {};
  try { return JSON.parse(saved)[dateKey] || {}; } catch (e) { return {}; }
}

function saveProductivityDataForDate(dateKey, data, immediate) {
  let allData = {};
  const saved = localStorage.getItem('productivityDataByDate');
  if (saved) { try { allData = JSON.parse(saved); } catch (e) { allData = {}; } }
  allData[dateKey] = data;
  if (immediate) {
    localStorage.setItem('productivityDataByDate', JSON.stringify(allData));
  } else {
    autoSave('productivityDataByDate', JSON.stringify(allData));
  }
}

function getAllProductivityData() {
  const saved = localStorage.getItem('productivityDataByDate');
  if (!saved) return {};
  try { return JSON.parse(saved); } catch (e) { return {}; }
}

function initProductivityTracker() {
  renderTodayProductivityTracker();
  calculateProductivityStats();
  setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100);
}

function renderTodayProductivityTracker() {
  const today = new Date();
  const dateStr = `${daysOfWeek[today.getDay() === 0 ? 6 : today.getDay() - 1]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  const todayDateEl = document.getElementById('today-productivity-date');
  if (todayDateEl) todayDateEl.textContent = dateStr;

  const todayKey = getTodayKey();
  const data = loadProductivityDataForDate(todayKey);

  renderProductivityMatrix(data);
  renderProductivityTimeBlocks(data);
  renderProductivityEnvironment(data);
  renderProductivityReflection(data);
}

const matrixXP = {
  'urgent-important': 15,
  'not-urgent-important': 10,
  'urgent-not-important': 5,
  'not-urgent-not-important': 3
};

function renderProductivityMatrix(data) {
  const container = document.getElementById('productivity-matrix');
  if (!container) return;

  const matrix = data.matrix || {
    'urgent-important': [],
    'not-urgent-important': [],
    'urgent-not-important': [],
    'not-urgent-not-important': []
  };

  const quadrants = [
    { key: 'urgent-important', title: 'Important & Urgent', xp: 15 },
    { key: 'not-urgent-important', title: 'Important, Not Urgent', xp: 10 },
    { key: 'urgent-not-important', title: 'Not Important, Urgent', xp: 5 },
    { key: 'not-urgent-not-important', title: 'Not Important & Not Urgent', xp: 3 }
  ];

  container.innerHTML = `
    <div class="matrix-grid">
      ${quadrants.map(q => `
        <div class="matrix-quadrant">
          <div class="matrix-quadrant-title">${q.title} <span class="matrix-xp-badge">+${q.xp} XP</span></div>
          <div class="matrix-tasks" id="matrix-tasks-${q.key}">
            ${(matrix[q.key] || []).map((task, i) => {
              const text = typeof task === 'string' ? task : task.text;
              const done = typeof task === 'string' ? false : task.done;
              return `
              <div class="matrix-task ${done ? 'matrix-task-done' : ''}">
                <input type="checkbox" ${done ? 'checked' : ''} onchange="toggleMatrixTask('${q.key}', ${i})" class="matrix-task-check">
                <span>${text}</span>
                <button class="matrix-task-remove" onclick="removeMatrixTask('${q.key}', ${i})">&times;</button>
              </div>`;
            }).join('')}
          </div>
          <div class="matrix-add-row">
            <input type="text" id="matrix-input-${q.key}" placeholder="Add task..." onkeydown="if(event.key==='Enter')addMatrixTask('${q.key}')">
            <button onclick="addMatrixTask('${q.key}')">Add</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addMatrixTask(quadrant) {
  const input = document.getElementById(`matrix-input-${quadrant}`);
  if (!input || !input.value.trim()) return;

  const todayKey = getTodayKey();
  const data = loadProductivityDataForDate(todayKey);
  if (!data.matrix) data.matrix = { 'urgent-important': [], 'not-urgent-important': [], 'urgent-not-important': [], 'not-urgent-not-important': [] };
  data.matrix[quadrant].push({ text: input.value.trim(), done: false });
  saveProductivityDataForDate(todayKey, data, true);
  renderProductivityMatrix(data);
  calculateProductivityStats();
}

function removeMatrixTask(quadrant, index) {
  const todayKey = getTodayKey();
  const data = loadProductivityDataForDate(todayKey);
  if (data.matrix && data.matrix[quadrant]) {
    data.matrix[quadrant].splice(index, 1);
    saveProductivityDataForDate(todayKey, data, true);
    renderProductivityMatrix(data);
    calculateProductivityStats();
  }
}

function toggleMatrixTask(quadrant, index) {
  const todayKey = getTodayKey();
  const data = loadProductivityDataForDate(todayKey);
  if (!data.matrix || !data.matrix[quadrant]) return;

  let task = data.matrix[quadrant][index];
  // Migrate plain strings to object format
  if (typeof task === 'string') {
    task = { text: task, done: false };
    data.matrix[quadrant][index] = task;
  }

  const wasCompleted = task.done;
  task.done = !wasCompleted;
  saveProductivityDataForDate(todayKey, data, true);
  renderProductivityMatrix(data);

  // Award XP when checking off (not when unchecking)
  if (!wasCompleted) {
    const xpKey = `matrixTask_${todayKey}_${quadrant}_${index}`;
    if (!localStorage.getItem(xpKey)) {
      localStorage.setItem(xpKey, 'true');
      addXP(matrixXP[quadrant], 'Task completed!');
    }
  }

  calculateProductivityStats();
}

function renderProductivityTimeBlocks(data) {
  const container = document.getElementById('productivity-timeblocks');
  if (!container) return;

  const timeBlocks = data.timeBlocks || timeBlockLabels.map(() => ({ planned: '', completed: false }));

  container.innerHTML = `
    <table class="time-block-table">
      <thead>
        <tr>
          <th>Block</th>
          <th>Planned Time</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        ${timeBlockLabels.map((label, i) => `
          <tr>
            <td>${label}</td>
            <td><input type="time" id="timeblock-time-${i}" value="${timeBlocks[i]?.planned || ''}" onchange="updateTodayProductivityTracker()"></td>
            <td><input type="checkbox" id="timeblock-done-${i}" ${timeBlocks[i]?.completed ? 'checked' : ''} onchange="updateTodayProductivityTracker()"></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderProductivityEnvironment(data) {
  const container = document.getElementById('productivity-environment');
  if (!container) return;

  const env = data.environment || environmentChecklist.map(() => false);

  container.innerHTML = `
    <div class="checklist">
      ${environmentChecklist.map((item, i) => `
        <div class="checklist-item">
          <input type="checkbox" id="env-check-${i}" ${env[i] ? 'checked' : ''} onchange="updateTodayProductivityTracker()">
          <label for="env-check-${i}">${item}</label>
        </div>
      `).join('')}
    </div>
  `;
}

function renderProductivityReflection(data) {
  const container = document.getElementById('productivity-reflection');
  if (!container) return;

  const reflection = data.reflection || {};

  container.innerHTML = `
    <div class="input-grid">
      ${reflectionQuestions.map(rq => `
        <div class="input-field full-width">
          <label for="reflect-${rq.key}" style="font-weight: 600;">${rq.q}</label>
          <textarea id="reflect-${rq.key}" placeholder="Reflect on your day..." oninput="updateTodayProductivityTracker()">${reflection[rq.key] || ''}</textarea>
        </div>
      `).join('')}
    </div>
  `;
}

function updateTodayProductivityTracker() {
  const todayKey = getTodayKey();
  const data = loadProductivityDataForDate(todayKey);

  const timeBlocks = timeBlockLabels.map((_, i) => ({
    planned: document.getElementById(`timeblock-time-${i}`)?.value || '',
    completed: document.getElementById(`timeblock-done-${i}`)?.checked || false
  }));
  data.timeBlocks = timeBlocks;

  data.environment = environmentChecklist.map((_, i) =>
    document.getElementById(`env-check-${i}`)?.checked || false
  );

  data.reflection = {};
  reflectionQuestions.forEach(rq => {
    data.reflection[rq.key] = document.getElementById(`reflect-${rq.key}`)?.value || '';
  });

  saveProductivityDataForDate(todayKey, data);

  const totalMatrixTasks = data.matrix ? Object.values(data.matrix).reduce((sum, arr) => sum + arr.length, 0) : 0;
  const envChecked = (data.environment || []).filter(c => c).length;
  if (totalMatrixTasks > 0 && envChecked >= 3) {
    awardDailyXP('productivity');
    awardStreakXP(calculateProductivityStreak(), 'productivity');
  }

  const hasReflection = reflectionQuestions.every(rq => (data.reflection[rq.key] || '').trim().length > 0);
  if (hasReflection) {
    awardPhase3BonusXP('productivity-reflection-' + todayKey, 100);
  }

  calculateProductivityStats();
}

function calculateProductivityStreak() {
  const allData = getAllProductivityData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = allData[dates[i]];
    const tasks = d.matrix ? Object.values(d.matrix).reduce((s, a) => s + a.length, 0) : 0;
    if (tasks > 0) { streak++; } else { break; }
  }
  return streak;
}

function calculateProductivityStats() {
  const allData = getAllProductivityData();
  const dates = Object.keys(allData);

  let totalTasks = 0;
  let completedTasks = 0;
  let deepWorkBlocks = 0;
  dates.forEach(date => {
    const d = allData[date];
    if (d.matrix) {
      Object.values(d.matrix).forEach(arr => {
        arr.forEach(task => {
          totalTasks++;
          if (typeof task === 'object' && task.done) completedTasks++;
        });
      });
    }
    if (d.timeBlocks) deepWorkBlocks += d.timeBlocks.filter((tb, i) => i < 2 && tb.completed).length;
  });

  const streakEl = document.getElementById('productivity-streak');
  const tasksEl = document.getElementById('productivity-tasks-total');
  const deepEl = document.getElementById('productivity-deep-work');
  const daysEl = document.getElementById('productivity-days');

  if (streakEl) streakEl.textContent = calculateProductivityStreak();
  if (tasksEl) tasksEl.textContent = completedTasks + ' / ' + totalTasks;
  if (deepEl) deepEl.textContent = deepWorkBlocks;
  if (daysEl) daysEl.textContent = dates.length;
}

// ============================================================================
// STEP 8: BOUNDARY & BALANCE
// ============================================================================

const intentionPrompts = [
  { key: 'shutdown', q: 'When will I officially shut down each day to signal the end of work?', example: 'Example: \u201c8:30 PM \u2014 turn off laptop, plan tomorrow, stretch for 5 min.\u201d' },
  { key: 'techBoundary', q: 'What technology or time boundary will help me stay focused or present this week?', example: 'Example: \u201cNo phone during meals or deep work 9\u201311 AM.\u201d' },
  { key: 'ritual', q: 'What calming ritual will help me unwind and recharge daily?', example: 'Example: \u201cRead before bed or light a candle and journal.\u201d' }
];

function loadBoundaryData() {
  const saved = localStorage.getItem('boundaryData');
  if (!saved) return { intentions: {}, weeks: {} };
  try { return JSON.parse(saved); } catch (e) { return { intentions: {}, weeks: {} }; }
}

function saveBoundaryData(data) {
  autoSave('boundaryData', JSON.stringify(data));
}

function initBoundaryTracker() {
  renderBoundaryIntentions();
  renderBoundaryWeekTracker(1);
  calculateBoundaryStats();
  setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100);
}

function renderBoundaryIntentions() {
  const container = document.getElementById('boundary-intentions');
  if (!container) return;

  const data = loadBoundaryData();
  const intentions = data.intentions || {};

  container.innerHTML = `
    <div class="input-grid">
      ${intentionPrompts.map(p => `
        <div class="input-field full-width">
          <label for="intention-${p.key}" style="font-weight: 600;">${p.q}</label>
          <p style="font-size: 0.85em; color: var(--text-light); margin-bottom: 8px;">${p.example}</p>
          <textarea id="intention-${p.key}" placeholder="Write your intention..." oninput="updateBoundaryIntentions()">${intentions[p.key] || ''}</textarea>
        </div>
      `).join('')}
    </div>
  `;
}

function updateBoundaryIntentions() {
  const data = loadBoundaryData();
  data.intentions = {};
  intentionPrompts.forEach(p => {
    data.intentions[p.key] = document.getElementById(`intention-${p.key}`)?.value || '';
  });
  saveBoundaryData(data);
}

let currentBoundaryWeek = 1;

function renderBoundaryWeekTracker(weekNum) {
  const container = document.getElementById('boundary-tracker');
  if (!container) return;
  currentBoundaryWeek = weekNum;

  const data = loadBoundaryData();
  const weekData = (data.weeks && data.weeks[weekNum]) || {
    boundaries: ['', '', ''],
    checks: [
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false]
    ]
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  container.innerHTML = `
    <div class="boundary-week-nav">
      ${[1,2,3,4,5,6].map(w => `
        <button class="boundary-week-btn ${w === weekNum ? 'active' : ''}" onclick="renderBoundaryWeekTracker(${w})">Week ${w}</button>
      `).join('')}
    </div>

    <div class="boundary-grid">
      <div></div>
      ${days.map(d => `<div class="day-label">${d}</div>`).join('')}

      ${[0,1,2].map(row => `
        <input type="text" id="boundary-name-${row}" value="${weekData.boundaries[row] || ''}" placeholder="Boundary ${row + 1}..." oninput="updateBoundaryTracker()">
        ${[0,1,2,3,4,5,6].map(col => `
          <input type="checkbox" id="boundary-check-${row}-${col}" ${weekData.checks[row]?.[col] ? 'checked' : ''} onchange="updateBoundaryTracker()">
        `).join('')}
      `).join('')}
    </div>

    <div class="boundary-tips">
      <p>Tips:</p>
      <ul>
        <li>Notice which boundaries create calm and which cause stress \u2014 adjust weekly.</li>
        <li>Review your wins. Keep the boundaries that helped you feel grounded and confident.</li>
      </ul>
    </div>
  `;
}

function updateBoundaryTracker() {
  const data = loadBoundaryData();
  if (!data.weeks) data.weeks = {};

  const weekData = {
    boundaries: [0,1,2].map(row => document.getElementById(`boundary-name-${row}`)?.value || ''),
    checks: [0,1,2].map(row =>
      [0,1,2,3,4,5,6].map(col => document.getElementById(`boundary-check-${row}-${col}`)?.checked || false)
    )
  };

  data.weeks[currentBoundaryWeek] = weekData;
  saveBoundaryData(data);

  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const anyCheckedToday = [0,1,2].some(row => weekData.checks[row]?.[todayDayIndex]);
  if (anyCheckedToday) {
    awardDailyXP('boundary');
    awardStreakXP(calculateBoundaryStreak(), 'boundary');
  }

  const allCheckedForWeek = [0,1,2].every(row =>
    weekData.boundaries[row].trim().length > 0 &&
    weekData.checks[row].every(c => c)
  );
  if (allCheckedForWeek) {
    awardPhase3BonusXP(`boundary-week-${currentBoundaryWeek}`, 100);
  }

  calculateBoundaryStats();
}

function calculateBoundaryStreak() {
  const data = loadBoundaryData();
  if (!data.weeks) return 0;

  let streak = 0;
  const today = new Date();
  for (let d = 0; d < 42; d++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - d);
    const dayIndex = (checkDate.getDay() + 6) % 7;

    let found = false;
    for (let w = 1; w <= 6; w++) {
      const wk = data.weeks[w];
      if (wk && [0,1,2].some(row => wk.checks[row]?.[dayIndex])) {
        found = true;
        break;
      }
    }
    if (found) { streak++; } else if (d > 0) { break; }
  }
  return streak;
}

function calculateBoundaryStats() {
  const data = loadBoundaryData();
  let weeksCompleted = 0;
  let totalBoundaries = 0;
  let totalChecks = 0;
  let totalPossible = 0;

  if (data.weeks) {
    for (let w = 1; w <= 6; w++) {
      const wk = data.weeks[w];
      if (!wk) continue;
      const activeBoundaries = wk.boundaries.filter(b => b.trim().length > 0).length;
      totalBoundaries += activeBoundaries;

      let weekComplete = activeBoundaries === 3;
      for (let row = 0; row < 3; row++) {
        if (wk.boundaries[row]?.trim().length > 0) {
          totalPossible += 7;
          const rowChecks = (wk.checks[row] || []).filter(c => c).length;
          totalChecks += rowChecks;
          if (rowChecks < 7) weekComplete = false;
        }
      }
      if (weekComplete && activeBoundaries === 3) weeksCompleted++;
    }
  }

  const consistency = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0;

  const streakEl = document.getElementById('boundary-streak');
  const weeksEl = document.getElementById('boundary-weeks');
  const totalEl = document.getElementById('boundary-total');
  const consistEl = document.getElementById('boundary-consistency');

  if (streakEl) streakEl.textContent = calculateBoundaryStreak();
  if (weeksEl) weeksEl.textContent = weeksCompleted;
  if (totalEl) totalEl.textContent = totalBoundaries;
  if (consistEl) consistEl.textContent = consistency + '%';
}

// ============================================================================
// STEP 9: PURPOSE & RESILIENCE
// ============================================================================

const purposeParts = [
  {
    key: 'part1',
    title: 'Part 1: Reconnect',
    intro: 'Before you can refine your purpose, you must first reconnect with the experiences, people, and passions that shaped who you are today. This section will help you rediscover your \u201cwhy\u201d \u2014 the spark that ignited your path in the first place.',
    prompts: [
      'Think back to a time when you felt fully alive and engaged in what you were doing. What were you doing? Who were you with? Why did it feel meaningful?',
      'Who or what has had the biggest influence on your life\u2019s direction so far? How have those people or experiences shaped your beliefs and values?',
      'What moments or accomplishments from your past are you most proud of \u2014 and why?',
      'What challenges have taught you the most about yourself? How did you grow or adapt as a result?',
      'If you could reconnect with your younger self \u2014 the version of you who dreamed boldly \u2014 what advice would they give you about what really matters?'
    ]
  },
  {
    key: 'part2',
    title: 'Part 2: Refine Your Purpose',
    intro: 'Purpose becomes clear when your values, strengths, and actions align. This section helps you define what truly matters and ensure that your current path supports the life you want to build.',
    prompts: [
      'What values feel non-negotiable in your life right now? How do they show up (or not) in your daily habits and decisions?',
      'Which activities give you energy and fulfillment \u2014 and which ones drain you?',
      'What strengths do others often recognize in you that you may take for granted?',
      'What would your ideal day look like if your life were fully aligned with your purpose?',
      'What goals, roles, or habits no longer serve who you\u2019re becoming?'
    ],
    hasPriorities: true
  },
  {
    key: 'part3',
    title: 'Part 3: Growth & Apprenticeship',
    intro: 'This section invites you to move from reflection to growth. It\u2019s time to put purpose into motion through action, learning, and mentorship. The goal isn\u2019t perfection \u2014 but progress and mastery.',
    prompts: [
      'What skill, craft, or area of growth are you most excited to master right now?',
      'Who could serve as a mentor, coach, or guide on this next leg of your journey?',
      'What\u2019s one challenge or stretch goal that would help you grow faster?',
      'How can you create accountability that allows you to measure your progress and stay consistent?',
      'Imagine yourself one year from now. What will you be proud to say you\u2019ve learned or built?'
    ],
    hasApprenticeship: true
  }
];

function loadPurposeData() {
  const saved = localStorage.getItem('purposeData');
  if (!saved) return {};
  try { return JSON.parse(saved); } catch (e) { return {}; }
}

function savePurposeData(data) {
  autoSave('purposeData', JSON.stringify(data));
}

function loadGrowthDataForDate(dateKey) {
  const saved = localStorage.getItem('growthDataByDate');
  if (!saved) return {};
  try { return JSON.parse(saved)[dateKey] || {}; } catch (e) { return {}; }
}

function saveGrowthDataForDate(dateKey, data) {
  let allData = {};
  const saved = localStorage.getItem('growthDataByDate');
  if (saved) { try { allData = JSON.parse(saved); } catch (e) { allData = {}; } }
  allData[dateKey] = data;
  autoSave('growthDataByDate', JSON.stringify(allData));
}

function getAllGrowthData() {
  const saved = localStorage.getItem('growthDataByDate');
  if (!saved) return {};
  try { return JSON.parse(saved); } catch (e) { return {}; }
}

function initPurposeTracker() {
  renderPurposeJournal();
  renderGrowthTracker();
  calculatePurposeStats();
  setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100);
}

let currentJournalPart = 'part1';

function renderPurposeJournal() {
  const container = document.getElementById('purpose-journal');
  if (!container) return;

  const data = loadPurposeData();

  container.innerHTML = `
    <div class="journal-tabs">
      ${purposeParts.map(p => `
        <button class="journal-tab ${p.key === currentJournalPart ? 'active' : ''}" onclick="switchJournalPart('${p.key}')">${p.title}</button>
      `).join('')}
    </div>

    ${purposeParts.map(part => {
      const partData = data[part.key] || {};
      return `
        <div class="journal-part ${part.key === currentJournalPart ? 'active' : ''}" id="journal-${part.key}">
          <p class="journal-intro">${part.intro}</p>

          ${part.prompts.map((prompt, i) => `
            <div class="journal-prompt">
              <div class="journal-prompt-number">Prompt ${i + 1}</div>
              <div class="journal-prompt-text">${prompt}</div>
              <textarea
                id="purpose-${part.key}-q${i + 1}"
                placeholder="Take your time\u2026 write from the heart."
                oninput="updatePurposeJournal('${part.key}')"
              >${partData['q' + (i + 1)] || ''}</textarea>
            </div>
          `).join('')}

          ${part.hasPriorities ? `
            <div class="journal-priorities">
              <h4>List your top 3 priorities for the next 6 months that align with your purpose.</h4>
              ${[1,2,3].map(n => `
                <div class="input-field">
                  <label for="purpose-priority-${n}">Priority ${n}</label>
                  <input type="text" id="purpose-priority-${n}" value="${partData['priority' + n] || ''}" placeholder="Enter priority ${n}..." oninput="updatePurposeJournal('${part.key}')">
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${part.hasApprenticeship ? `
            <div class="journal-priorities">
              <h4>Commit to Apprenticeship</h4>
              <div class="input-field">
                <label for="purpose-growth-area" style="font-weight: 600;">Choose one growth area to focus on for the next 30 days.</label>
                <input type="text" id="purpose-growth-area" value="${partData.growthArea || ''}" placeholder="e.g., Public speaking, coding, meditation..." oninput="updatePurposeJournal('${part.key}')">
              </div>
              <div class="input-field" style="margin-top: 12px;">
                <label for="purpose-concrete-action" style="font-weight: 600;">Define one concrete action you'll take this week to begin.</label>
                <input type="text" id="purpose-concrete-action" value="${partData.concreteAction || ''}" placeholder="e.g., Sign up for a class, practice 15 min daily..." oninput="updatePurposeJournal('${part.key}')">
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}
  `;
}

function switchJournalPart(partKey) {
  currentJournalPart = partKey;
  document.querySelectorAll('.journal-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.journal-part').forEach(part => part.classList.remove('active'));

  const activeTab = document.querySelector(`.journal-tab[onclick="switchJournalPart('${partKey}')"]`);
  const activePart = document.getElementById(`journal-${partKey}`);
  if (activeTab) activeTab.classList.add('active');
  if (activePart) activePart.classList.add('active');
}

function updatePurposeJournal(partKey) {
  const data = loadPurposeData();
  const part = purposeParts.find(p => p.key === partKey);
  if (!part) return;

  const partData = {};
  part.prompts.forEach((_, i) => {
    partData['q' + (i + 1)] = document.getElementById(`purpose-${partKey}-q${i + 1}`)?.value || '';
  });

  if (part.hasPriorities) {
    [1,2,3].forEach(n => {
      partData['priority' + n] = document.getElementById(`purpose-priority-${n}`)?.value || '';
    });
  }

  if (part.hasApprenticeship) {
    partData.growthArea = document.getElementById('purpose-growth-area')?.value || '';
    partData.concreteAction = document.getElementById('purpose-concrete-action')?.value || '';
  }

  data[partKey] = partData;
  savePurposeData(data);

  const allAnswered = part.prompts.every((_, i) => (partData['q' + (i + 1)] || '').trim().length > 5);
  if (allAnswered) {
    awardPhase3BonusXP(`purpose-journal-${partKey}`, 100);
  }

  calculatePurposeStats();
  checkStep9Completion();
}

function renderGrowthTracker() {
  const container = document.getElementById('purpose-growth-tracker');
  if (!container) return;

  const allGrowth = getAllGrowthData();
  const purposeData = loadPurposeData();
  const growthArea = purposeData.part3?.growthArea || 'your growth area';
  const todayKey = getTodayKey();
  const todayData = allGrowth[todayKey] || {};

  const allDates = Object.keys(allGrowth).sort();
  const startDate = allDates.length > 0 ? new Date(allDates[0] + 'T00:00:00') : new Date();

  let gridHTML = '<div class="growth-grid">';
  for (let day = 1; day <= 30; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day - 1);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayData = allGrowth[dateKey];
    const isCompleted = dayData?.completed;
    const isToday = dateKey === todayKey;

    gridHTML += `
      <div class="growth-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}">
        <div class="growth-day-num">${day}</div>
        <div class="growth-day-check">${isCompleted ? '\u2713' : ''}</div>
      </div>
    `;
  }
  gridHTML += '</div>';

  container.innerHTML = `
    <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 0.9em;">
      Track your daily practice for: <strong>${growthArea}</strong>
    </p>
    ${gridHTML}
    <div class="growth-today-input">
      <input type="checkbox" id="growth-today-check" ${todayData.completed ? 'checked' : ''} onchange="updateGrowthTracker()">
      <input type="text" id="growth-today-note" value="${todayData.note || ''}" placeholder="What did you practice today?" oninput="updateGrowthTracker()">
    </div>
  `;
}

function updateGrowthTracker() {
  const todayKey = getTodayKey();
  const completed = document.getElementById('growth-today-check')?.checked || false;
  const note = document.getElementById('growth-today-note')?.value || '';

  saveGrowthDataForDate(todayKey, { completed, note });

  if (completed) {
    awardDailyXP('purpose');
    awardStreakXP(calculatePurposeStreak(), 'purpose');
  }

  renderGrowthTracker();
  calculatePurposeStats();
  checkStep9Completion();
}

function calculatePurposeStreak() {
  const allData = getAllGrowthData();
  const dates = Object.keys(allData).sort();
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    if (allData[dates[i]]?.completed) { streak++; } else { break; }
  }
  return streak;
}

function calculatePurposeStats() {
  const purposeData = loadPurposeData();
  const allGrowth = getAllGrowthData();

  let journalEntries = 0;
  purposeParts.forEach(part => {
    const pd = purposeData[part.key];
    if (pd) {
      const answered = part.prompts.filter((_, i) => (pd['q' + (i + 1)] || '').trim().length > 5).length;
      if (answered >= 3) journalEntries++;
    }
  });

  const growthDates = Object.keys(allGrowth);
  const growthDays = growthDates.filter(d => allGrowth[d]?.completed).length;

  const p2 = purposeData.part2 || {};
  const prioritiesSet = [p2.priority1, p2.priority2, p2.priority3].filter(p => p && p.trim().length > 0).length;

  const entriesEl = document.getElementById('purpose-entries');
  const streakEl = document.getElementById('purpose-streak');
  const daysEl = document.getElementById('purpose-days');
  const prioritiesEl = document.getElementById('purpose-priorities');

  if (entriesEl) entriesEl.textContent = journalEntries;
  if (streakEl) streakEl.textContent = calculatePurposeStreak();
  if (daysEl) daysEl.textContent = growthDays;
  if (prioritiesEl) prioritiesEl.textContent = prioritiesSet;
}

function checkStep9Completion() {
  if (localStorage.getItem('step9CelebrationShown') === 'true') return;

  const purposeData = loadPurposeData();
  const allGrowth = getAllGrowthData();

  const allPartsComplete = purposeParts.every(part => {
    const pd = purposeData[part.key];
    if (!pd) return false;
    return part.prompts.every((_, i) => (pd['q' + (i + 1)] || '').trim().length > 5);
  });

  const hasGrowth = Object.values(allGrowth).some(d => d?.completed);

  if (allPartsComplete && hasGrowth) {
    localStorage.setItem('step9CelebrationShown', 'true');
    triggerStep9Confetti();
  }
}

function triggerStep9Confetti() {
  if (typeof confetti === 'function') {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8c9d7b', '#9bb087', '#D4AF37', '#1A1A1A']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8c9d7b', '#9bb087', '#D4AF37', '#1A1A1A']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  showCelebration(
    'Journey Complete!',
    'You\'ve completed all 9 steps of the Burnout Rescue Roadmap. Your purpose is clear, your habits are strong, and your resilience is unshakable. This is just the beginning!'
  );
}

// ============================================================================
// PHASE 3 XP HELPER
// ============================================================================

function awardPhase3BonusXP(uniqueKey, amount) {
  const storageKey = `phase3Bonus_${uniqueKey}`;
  if (localStorage.getItem(storageKey)) return;
  localStorage.setItem(storageKey, 'true');
  addXP(amount, 'Milestone completed!');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('load', () => {
  // Check if onboarding is complete
  const onboardingComplete = localStorage.getItem('onboardingComplete');
  if (onboardingComplete !== 'true') {
    window.location.href = 'onboarding.html';
    return;
  }

  // Initialize XP defaults if not set
  if (!localStorage.getItem('userXP')) {
    localStorage.setItem('userXP', '0');
  }

  // Initialize all trackers
  initSleepTracker();
  initStressTracker();
  initEnergyTracker();
  initMindsetTracker();
  initMovementTracker();
  initNutritionTracker();
  initProductivityTracker();
  initBoundaryTracker();
  initPurposeTracker();

  // Update dashboard
  updateDashboard();

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
