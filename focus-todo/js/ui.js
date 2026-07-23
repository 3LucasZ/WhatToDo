import {
  workspaces, activeWs, wsCurrentIndex, activeTasks,
  isAnimating, setIsAnimating, saveData, getCurrentTask,
  currentTaskIndex, setCurrentTaskIndex, setActiveWs,
} from './data.js';
import { getNextTheme, applyTheme, findThemeById, THEMES } from './themes.js';

// ========== DOM REFS ==========
export const focusTrack = document.getElementById('focus-track');
export const checkBurst = document.getElementById('check-burst');
export const wsDots = document.getElementById('ws-dots');
export const keyboardHint = document.getElementById('keyboard-hint');
export const carousel = document.getElementById('focus-carousel');

const settingsLayer = document.getElementById('settings-layer');
const settingsSheet = settingsLayer.querySelector('.settings-sheet');

const GEAR_SVG = `<svg class="ws-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

// ========== BUILD SLIDES ==========

export function renderCarousel() {
  focusTrack.innerHTML = '';
  workspaces.forEach((ws, wi) => {
    const slide = document.createElement('div');
    slide.className = 'focus-slide';
    slide.dataset.ws = wi;

    // --- Focused task area ---
    const focusedArea = document.createElement('div');
    focusedArea.className = 'focused-area';

    const label = document.createElement('div');
    label.className = 'ws-label';
    label.innerHTML = `${ws.name} ${GEAR_SVG}`;

    label.querySelector('.ws-gear').addEventListener('click', (e) => {
      e.stopPropagation();
      openSettings(wi);
    });

    focusedArea.appendChild(label);

    const focusedText = document.createElement('div');
    focusedText.className = 'focused-text';
    focusedArea.appendChild(focusedText);

    focusedArea.addEventListener('click', (e) => {
      if (e.target.closest('.ws-gear')) return;
      if (wi === activeWs) completeCurrent();
    });

    slide.appendChild(focusedArea);

    // --- Divider ---
    const divider = document.createElement('div');
    divider.className = 'slide-divider';
    const divLabel = document.createElement('span');
    divLabel.className = 'slide-divider-label';
    divLabel.textContent = 'Tasks';
    divider.appendChild(divLabel);
    slide.appendChild(divider);

    // --- Task cards ---
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'slide-tasks';
    slide.appendChild(tasksContainer);

    // --- Add input ---
    const addArea = document.createElement('div');
    addArea.className = 'slide-add-area';
    const addInput = document.createElement('input');
    addInput.className = 'slide-add-input';
    addInput.type = 'text';
    addInput.placeholder = 'Add a task...';
    addInput.autocomplete = 'off';
    addInput.dataset.ws = wi;
    addArea.appendChild(addInput);
    slide.appendChild(addArea);

    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && addInput.value.trim()) {
        const text = addInput.value.trim();
        workspaces[wi].tasks.push({ id: String(Date.now()), text, done: false });
        addInput.value = '';
        saveData();
        renderSlideContent(wi);
        if (wi === activeWs) renderDots();
      }
    });

    focusTrack.appendChild(slide);
  });

  snapTrack(false);
  renderAllSlides();
}

// ========== SETTINGS SHEET ==========

function openSettings(wi) {
  const ws = workspaces[wi];
  if (!ws) return;

  settingsSheet.innerHTML = `
    <div class="settings-header">
      <h3>Settings</h3>
      <button class="settings-close">×</button>
    </div>
    <div class="settings-section">
      <label class="settings-label">Name</label>
      <input class="settings-name-input" type="text" value="${escapeHtml(ws.name)}" autocomplete="off">
    </div>
    <div class="settings-section">
      <label class="settings-label">Theme</label>
      <div class="settings-themes">
        ${THEMES.map(t => `<div class="theme-swatch${ws.theme?.id === t.id ? ' selected' : ''}" style="background:${t.accent}" data-theme-id="${t.id}"></div>`).join('')}
      </div>
    </div>
    <div class="settings-section">
      <button class="settings-delete">Delete workspace</button>
    </div>`;

  // Close button
  settingsSheet.querySelector('.settings-close').addEventListener('click', closeSettings);

  // Rename on blur / enter
  const nameInput = settingsSheet.querySelector('.settings-name-input');
  nameInput.focus();
  nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
  nameInput.addEventListener('blur', () => renameWs(wi, nameInput.value));
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') nameInput.blur();
    if (e.key === 'Escape') closeSettings();
  });

  // Theme swatches
  settingsSheet.querySelectorAll('.settings-themes .theme-swatch').forEach(el => {
    el.addEventListener('click', () => {
      const themeId = el.dataset.themeId;
      ws.theme = { ...findThemeById(themeId) };
      saveData();
      if (wi === activeWs) applyTheme(ws.theme);
      settingsSheet.querySelectorAll('.settings-themes .theme-swatch')
        .forEach(s => s.classList.remove('selected'));
      el.classList.add('selected');
      // Update label
      const slide = focusTrack.children[wi];
      if (slide) slide.querySelector('.ws-label').childNodes[0].textContent = ws.name + ' ';
    });
  });

  // Delete
  settingsSheet.querySelector('.settings-delete').addEventListener('click', () => {
    if (workspaces.length <= 1) return;
    if (!confirm(`Delete "${ws.name}" and all its tasks?`)) return;
    const removedIdx = wi;
    workspaces.splice(removedIdx, 1);
    let newActive = activeWs;
    if (activeWs >= workspaces.length) newActive = workspaces.length - 1;
    else if (activeWs === removedIdx) newActive = Math.min(removedIdx, workspaces.length - 1);
    setActiveWs(newActive);
    if (workspaces.length > 0) applyTheme(workspaces[newActive].theme);
    saveData();
    closeSettings();
    renderCarousel();
    renderDots();
  });

  settingsLayer.classList.add('open');
}

function renameWs(wi, name) {
  const n = name.trim();
  if (!n) return;
  workspaces[wi].name = n;
  saveData();
  // Update slide label
  const slide = focusTrack.children[wi];
  if (slide) {
    const label = slide.querySelector('.ws-label');
    const gear = label.querySelector('.ws-gear');
    label.innerHTML = `${n} ${GEAR_SVG}`;
    label.querySelector('.ws-gear').addEventListener('click', (e) => {
      e.stopPropagation();
      openSettings(wi);
    });
  }
  // Update settings header
  const h3 = settingsSheet.querySelector('.settings-header h3');
  if (h3) h3.textContent = 'Settings';
}

function closeSettings() {
  settingsLayer.classList.remove('open');
}

// Close on backdrop click
settingsLayer.addEventListener('click', (e) => {
  if (e.target === settingsLayer) closeSettings();
});

// Escape to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && settingsLayer.classList.contains('open')) {
    closeSettings();
  }
});

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ========== RENDER SLIDE CONTENT ==========

function renderSlideContent(wi) {
  const ws = workspaces[wi];
  if (!ws) return;
  const slide = focusTrack.children[wi];
  if (!slide) return;

  // Focused text
  const focusedText = slide.querySelector('.focused-text');
  const active = ws.tasks.filter(t => !t.done);
  const idx = wsCurrentIndex[ws.id] ?? 0;
  const task = active[idx] ?? null;

  if (!task || !active.length) {
    focusedText.className = 'focused-text focused-empty';
    focusedText.textContent = 'All done ✦';
  } else {
    focusedText.textContent = task.text;
    focusedText.className = 'focused-text';
  }

  // Task cards
  const tasksContainer = slide.querySelector('.slide-tasks');
  tasksContainer.innerHTML = '';
  ws.tasks.forEach(t => {
    const card = document.createElement('div');
    card.className = 'slide-task';
    card.dataset.taskId = t.id;

    const ring = document.createElement('div');
    ring.className = 'slide-task-ring' + (t.done ? ' done' : '');
    ring.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="5,13 9,17 19,7"/></svg>';
    card.appendChild(ring);

    const text = document.createElement('span');
    text.className = 'slide-task-text' + (t.done ? ' done' : '');
    text.textContent = t.text;
    card.appendChild(text);

    ring.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAnimating) return;
      t.done = !t.done;
      saveData();
      renderSlideContent(wi);
      renderDots();
    });

    card.addEventListener('click', () => {
      if (t.done) return;
      if (isAnimating) return;
      const wsActive = ws.tasks.filter(tt => !tt.done);
      const targetIdx = wsActive.indexOf(t);
      if (targetIdx >= 0) {
        wsCurrentIndex[ws.id] = targetIdx;
        saveData();
        renderAllSlides();
        if (wi === activeWs) renderDots();
      }
    });

    tasksContainer.appendChild(card);
  });
}

export function renderAllSlides() {
  workspaces.forEach((_, wi) => renderSlideContent(wi));
  renderDots();
}

export function renderDots() {
  wsDots.innerHTML = '';
  workspaces.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'ws-dot' + (i === activeWs ? ' active' : '');
    wsDots.appendChild(dot);
  });
}

// ========== ADD WORKSPACE ==========

document.getElementById('ws-add').addEventListener('click', () => {
  let name = 'New';
  let i = 1;
  while (workspaces.some(ws => ws.name === name)) {
    i++;
    name = `New ${i}`;
  }
  workspaces.push({
    id: 'ws' + Date.now(),
    name,
    tasks: [{ id: String(Date.now()), text: 'Configure this workspace', done: false }],
    theme: { ...getNextTheme() },
  });
  renderCarousel();
  switchToWorkspace(workspaces.length - 1);
});

// ========== CAROUSEL ==========

export function getCurrentSlideEl() {
  return focusTrack.children[activeWs];
}

export function snapTrack(animate = true) {
  if (animate) focusTrack.classList.remove('dragging');
  else focusTrack.classList.add('dragging');
  focusTrack.style.transform = `translateX(-${activeWs * 100}%)`;
  if (!animate) {
    void focusTrack.offsetWidth;
    focusTrack.classList.remove('dragging');
  }
}

export function switchToWorkspace(i) {
  if (i < 0 || i >= workspaces.length) return;
  closeSettings();
  setActiveWs(i);
  saveData();
  snapTrack();
  applyTheme(workspaces[i].theme);
  renderDots();
}

// ========== COMPLETE ==========
export function completeCurrent() {
  if (isAnimating) return;
  const task = getCurrentTask();
  if (!task) return;

  setIsAnimating(true);

  checkBurst.classList.remove('animate');
  void checkBurst.offsetWidth;
  checkBurst.classList.add('animate');

  const slide = getCurrentSlideEl();
  const text = slide.querySelector('.focused-text');
  if (text) text.className = 'focused-text done-exit';

  setTimeout(() => {
    task.done = true;
    saveData();
    renderAllSlides();

    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  }, 300);
}
