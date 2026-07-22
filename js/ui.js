import {
  workspaces, activeWs, wsCurrentIndex, activeTasks,
  isAnimating, setIsAnimating, saveData, getCurrentTask,
  currentTaskIndex, setCurrentTaskIndex, setActiveWs,
} from './data.js';
import { applyTheme, findThemeById, THEMES } from './themes.js';

// ========== DOM REFS ==========
export const focusTrack = document.getElementById('focus-track');
export const checkBurst = document.getElementById('check-burst');
export const wsDots = document.getElementById('ws-dots');
export const keyboardHint = document.getElementById('keyboard-hint');
export const carousel = document.getElementById('focus-carousel');

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
    label.textContent = ws.name;

    // Theme picker
    const picker = document.createElement('div');
    picker.id = 'theme-picker';
    THEMES.forEach(t => {
      const s = document.createElement('div');
      s.className = 'theme-swatch' + (ws.theme?.id === t.id ? ' selected' : '');
      s.style.background = t.accent;
      s.dataset.themeId = t.id;
      picker.appendChild(s);
    });
    focusedArea.appendChild(label);
    focusedArea.appendChild(picker);

    label.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('#theme-picker.open').forEach(p => {
        if (p !== picker) p.classList.remove('open');
      });
      picker.classList.toggle('open');
    });

    picker.addEventListener('click', (e) => {
      const s = e.target.closest('.theme-swatch');
      if (!s) return;
      e.stopPropagation();
      const themeId = s.dataset.themeId;
      workspaces[wi].theme = { ...findThemeById(themeId) };
      saveData();
      if (wi === activeWs) applyTheme(workspaces[wi].theme);
      picker.querySelectorAll('.theme-swatch').forEach(el => el.classList.remove('selected'));
      s.classList.add('selected');
      picker.classList.remove('open');
    });

    const focusedText = document.createElement('div');
    focusedText.className = 'focused-text';
    focusedArea.appendChild(focusedText);

    focusedArea.addEventListener('click', () => {
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
  ws.tasks.forEach((t, ti) => {
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

    // Check toggle
    ring.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAnimating) return;
      t.done = !t.done;
      saveData();
      renderSlideContent(wi);
      renderDots();
    });

    // Focus this task (only for active tasks)
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

    const active = activeTasks();
    if (active.length > 0 && currentTaskIndex() < active.length) {
      // Text will update in place (no animation if same index)
      renderAllSlides();
    } else {
      renderAllSlides();
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  }, 300);
}
