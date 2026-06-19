// State variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let laps = [];

// DOM Elements
const display = document.getElementById('timerDisplay');
const startStopBtn = document.getElementById('startStopBtn');
const playIcon = document.getElementById('playIcon');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapList = document.getElementById('lapList');
const circle = document.getElementById('timerCircle');
const emptyState = document.getElementById('emptyState');
const lapCountLabel = document.getElementById('lapCount');
const totalDisplay = document.getElementById('totalDisplay');
const buttonShadow = document.getElementById('buttonShadow');
const statusLabel = document.getElementById('statusLabel');
const statusText = document.getElementById('statusText');

// Theme Toggle DOM Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

// Initialize Dynamic SVG Path Circumference
let circumference = 0;
if (circle) {
  circumference = circle.getTotalLength();
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;
}

/**
 * Format milliseconds into MM:SS.CC (Minutes:Seconds.Centiseconds)
 * @param {number} ms - Total milliseconds to format
 * @returns {string}
 */
function formatTime(ms) {
  if (ms < 0) ms = 0;
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  
  const displayMins = minutes.toString().padStart(2, '0');
  const displaySecs = seconds.toString().padStart(2, '0');
  const displayCents = centiseconds.toString().padStart(2, '0');
  
  return `${displayMins}:${displaySecs}.${displayCents}`;
}

/**
 * Update timer views and circular progress ring offset
 */
function update() {
  display.textContent = formatTime(elapsedTime);
  totalDisplay.textContent = formatTime(elapsedTime);
  
  if (circle && circumference > 0) {
    // Update circular indicator: wraps every 60 seconds (60000ms)
    const currentIntervalMs = elapsedTime % 60000;
    const progressRatio = currentIntervalMs / 60000;
    
    // strokeDashoffset is circumference for empty, 0 for fully filled
    const offset = circumference - (circumference * progressRatio);
    circle.style.strokeDashoffset = offset;
  }
}

/**
 * Start the stopwatch timer interval
 */
function startTimer() {
  if (isRunning) return;
  
  startTime = Date.now() - elapsedTime;
  
  // High-frequency refresh for centiseconds accuracy (~10ms)
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    update();
  }, 10);
  
  isRunning = true;
  
  // UI States & Animations
  playIcon.setAttribute('icon', 'lucide:pause');
  buttonShadow.classList.add('pulse-ring');
  
  statusLabel.classList.remove('opacity-50');
  statusText.textContent = 'Blooming...';
  
  // Hide empty state if timer is running and list is empty
  if (laps.length === 0) {
    emptyState.classList.add('hidden');
  }
}

/**
 * Pause the active stopwatch timer interval
 */
function pauseTimer() {
  if (!isRunning) return;
  
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  
  // UI States & Animations
  playIcon.setAttribute('icon', 'lucide:play');
  buttonShadow.classList.remove('pulse-ring');
  
  statusLabel.classList.add('opacity-50');
  statusText.textContent = 'Paused';
}

/**
 * Toggle between start and pause states
 */
startStopBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

/**
 * Reset stopwatch to clean zero state
 */
resetBtn.addEventListener('click', () => {
  // Clear running instances
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  
  // Reset states
  elapsedTime = 0;
  laps = [];
  
  // Reset Displays
  update();
  if (circle) {
    circle.style.strokeDashoffset = circumference;
  }
  
  // Restore Play button state
  playIcon.setAttribute('icon', 'lucide:play');
  buttonShadow.classList.remove('pulse-ring');
  
  // Restore idle status
  statusLabel.classList.add('opacity-50');
  statusText.textContent = 'Paused';
  
  // Reset lap lists
  lapList.innerHTML = '';
  lapList.appendChild(emptyState);
  emptyState.classList.remove('hidden');
  lapCountLabel.textContent = '0 Laps';
});

/**
 * Record a lap entry
 */
lapBtn.addEventListener('click', () => {
  // Prevent recording laps at zero time
  if (elapsedTime === 0) return;
  
  const lapTime = elapsedTime;
  
  // Calculate lap split difference
  const prevLapTime = laps.length > 0 ? laps[0] : 0;
  const splitTime = lapTime - prevLapTime;
  
  // Prepend current lap to state array
  laps.unshift(lapTime);
  
  // If this is the first lap, clean empty state
  if (emptyState && !emptyState.classList.contains('hidden')) {
    emptyState.classList.add('hidden');
  }
  
  // Build Lap Item Component supporting both dark and light modes
  const lapDiv = document.createElement('div');
  lapDiv.className = 'flex items-center justify-between p-6 bg-white dark:bg-[#1E1E24] rounded-3xl border border-orange-50 dark:border-gray-800 hover:border-orange-200 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md lap-item-anim';
  
  // Iconify flowers to represent garden progress
  const flowerIcons = ['lucide:sprout', 'lucide:flower', 'lucide:flower-2', 'lucide:leaf'];
  const randomIcon = flowerIcons[laps.length % flowerIcons.length];
  
  lapDiv.innerHTML = `
    <div class="flex items-center gap-4">
      <div class="w-10 h-10 rounded-full bg-[#FFD93D]/20 dark:bg-[#FFD93D]/15 flex items-center justify-center text-[#FFD93D] font-bold">
        <iconify-icon icon="${randomIcon}"></iconify-icon>
      </div>
      <div>
        <div class="timer-display text-xl font-bold text-[#4A4E69] dark:text-gray-200">${formatTime(lapTime)}</div>
        <div class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Cumulative</div>
      </div>
    </div>
    <div class="text-right">
      <div class="timer-display text-md font-bold text-[#FF8066]">+${formatTime(splitTime)}</div>
      <div class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Split (Lap #${laps.length})</div>
    </div>
  `;
  
  lapList.prepend(lapDiv);
  
  // Scroll to the top of the lap list
  lapList.scrollTop = 0;
  
  // Update lap count badge
  lapCountLabel.textContent = `${laps.length} Laps`;
});

/* ==========================================================================
   THEME SWITCHER LOGIC
   ========================================================================== */

/**
 * Apply the theme class to the document root and body
 * @param {string} theme - 'dark' or 'light'
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    themeIcon.setAttribute('icon', 'lucide:sun');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    themeIcon.setAttribute('icon', 'lucide:moon');
  }
}

// Initial theme check
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
applyTheme(initialTheme);

// Theme Toggle Event Listener
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
});
