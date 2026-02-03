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
  alert('This step will unlock as you progress!');
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
  
  // Check actual completion status for TODAY
  const sleepData = loadSleepDataForDate(todayKey);
  const sleepComplete = (sleepData.checks?.filter(c => c).length || 0) >= 3;
  
  const stressData = loadStressDataForDate(todayKey);
  const stressComplete = stressData.completed || false;
  
  const energyData = loadEnergyDataForDate(todayKey);
  const energyComplete = (energyData.checks?.filter(c => c).length || 0) >= 2;
  
  const mindsetData = loadMindsetDataForDate(todayKey);
  const mindsetComplete = mindsetData.situation && mindsetData.situation.trim() !== '';
  
  const movementData = loadMovementDataForDate(todayKey);
  const movementComplete = movementData.type && movementData.type.trim() !== '';
  
  const nutritionData = loadNutritionDataForDate(todayKey);
  const nutritionComplete = nutritionHabits.length > 0 && 
    (nutritionData.checks?.filter(c => c).length || 0) >= nutritionHabits.length * 0.5;
  
  // Build suggestions for incomplete items - show specific habits due
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

  if (!mindsetComplete) {
    focusItems.push({
      step: 'Journal not yet logged',
      icon: 'brain',
      title: 'Log your mindset journal',
      link: 'mindset'
    });
  }

  if (!movementComplete) {
    focusItems.push({
      step: 'Session not yet logged',
      icon: 'activity',
      title: 'Log your movement session',
      link: 'movement'
    });
  }

  if (!nutritionComplete && nutritionHabits.length > 0) {
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

  if (xp >= 250 && !phase3Unlocked) {
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
}

function updatePhaseLocks() {
  const phase2Unlocked = localStorage.getItem('phase2Unlocked') === 'true';
  const phase3Unlocked = localStorage.getItem('phase3Unlocked') === 'true';

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
  document.querySelectorAll('.phase3-nav').forEach(el => {
    if (phase3Unlocked) {
      el.classList.remove('phase-locked');
    } else {
      el.classList.add('phase-locked');
    }
  });
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

  // Update dashboard
  updateDashboard();

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
