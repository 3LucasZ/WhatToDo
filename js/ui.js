import {
  workspaces, activeWs, wsCurrentIndex, tasks,
  activeTasks, currentTaskIndex, setCurrentTaskIndex,
  showingList, setShowingList, isAnimating, setIsAnimating,
  saveData, getCurrentTask,
} from './data.js';
import { getNextTheme, applyTheme } from './themes.js';

// ========== DOM REFS ==========
export const focusLayer = document.getElementById('focus-layer');
export const focusTrack = document.getElementById('focus-track');
export const listLayer = document.getElementById('list-layer');
export const taskListEl = document.getElementById('task-list');
export const listCount = document.getElementById('list-count');
export const newTaskInput = document.getElementById('new-task-input');
export const keyboardHint = document.getElementById('keyboard-hint');
export const checkBurst = document.getElementById('check-burst');
export const wsDots = document.getElementById('ws-dots');
export const wsTabs = document.getElementById('ws-tabs');
export const carousel = document.getElementById('focus-carousel');

// ========== RENDER ==========

export function renderCarousel() {
  focusTrack.innerHTML = '';
  workspaces.forEach((ws, wi) => {
    const slide = document.createElement('div');
    slide.className = 'focus-slide';
    slide.dataset.ws = wi;

    const inner = document.createElement('div');
    inner.id = 'focus-task';

    const label = document.createElement('div');
    label.className = 'ws-label';
    label.textContent = ws.name;
    inner.appendChild(label);

    const hint = document.createElement('div');
    hint.className = 'index-hint';
    inner.appendChild(hint);

    const text = document.createElement('div');
    text.className = 'text';
    inner.appendChild(text);

    slide.appendChild(inner);
    focusTrack.appendChild(slide);
  });

  focusTrack.addEventListener('click', (e) => {
    const slide = e.target.closest('.focus-slide');
    if (!slide) return;
    const wi = parseInt(slide.dataset.ws);
    if (wi !== activeWs) return;
    completeCurrent();
  });

  snapTrack(false);
  updateSlideContent(false);
}

export function getCurrentSlideEl() {
  return focusTrack.children[activeWs];
}

export function snapTrack(animate = true) {
  if (animate) {
    focusTrack.classList.remove('dragging');
  } else {
    focusTrack.classList.add('dragging');
  }
  focusTrack.style.transform = `translateX(-${activeWs * 100}%)`;
  if (!animate) {
    void focusTrack.offsetWidth;
    focusTrack.classList.remove('dragging');
  }
}

export function updateSlideContent() {
  workspaces.forEach((ws, wi) => {
    const slide = focusTrack.children[wi];
    if (!slide) return;
    const wsLabel = slide.querySelector('.ws-label');
    const hint = slide.querySelector('.index-hint');
    const text = slide.querySelector('.text');

    wsLabel.textContent = ws.name;

    const active = ws.tasks.filter(t => !t.done);
    const idx = wsCurrentIndex[ws.id] ?? 0;
    const task = active[idx] ?? null;

    if (!task || !active.length) {
      hint.textContent = '';
      text.className = 'text empty-message';
      text.textContent = 'All done ✦';
    } else {
      hint.textContent = ws.id === workspaces[activeWs].id
        ? `${idx + 1} of ${active.length} remaining`
        : `${active.length} remaining`;
      text.textContent = task.text;
      text.className = 'text';
    }
  });

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

export function renderList() {
  taskListEl.innerHTML = '';
  const ts = tasks();
  ts.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.dataset.id = t.id;

    const handle = document.createElement('div');
    handle.className = 'drag-handle';
    li.appendChild(handle);

    const idx = document.createElement('span');
    idx.className = 'idx';
    idx.textContent = `${i + 1}`;
    li.appendChild(idx);

    const ring = document.createElement('div');
    ring.className = 'check-ring' + (t.done ? ' filled' : '');
    ring.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="5,13 9,17 19,7"/></svg>';
    li.appendChild(ring);

    const label = document.createElement('span');
    label.className = 'label' + (t.done ? ' done' : '');
    label.textContent = t.text;
    li.appendChild(label);

    li.addEventListener('click', (e) => {
      if (e.target.closest('.drag-handle')) return;
      if (isAnimating) return;
      t.done = !t.done;
      saveData();
      renderList();
      syncAfterListChange();
    });

    let pressTimer = null;
    li.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.drag-handle')) return;
      pressTimer = setTimeout(() => {
        pressTimer = null;
        if (t.done) return;
        const active = activeTasks();
        const idx = active.indexOf(t);
        if (idx >= 0) {
          setCurrentTaskIndex(idx);
          showFocus();
        }
      }, 400);
    });
    li.addEventListener('pointerup', () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
    li.addEventListener('pointercancel', () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
    li.addEventListener('pointerleave', () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });

    taskListEl.appendChild(li);
  });

  const done = ts.filter(t => t.done).length;
  listCount.textContent = `${done}/${ts.length} done`;
  updateListHeader();
}

export function updateListHeader() {
  const remaining = tasks().filter(t => !t.done).length;
  const h2 = document.querySelector('#list-header h2');
  h2.textContent = remaining ? `${remaining} task${remaining !== 1 ? 's' : ''} remaining` : 'All done';
}

export function renderWsTabs() {
  wsTabs.innerHTML = '';
  workspaces.forEach((ws, i) => {
    const btn = document.createElement('button');
    btn.className = 'ws-tab' + (i === activeWs ? ' active' : '');
    btn.textContent = ws.name;
    btn.addEventListener('click', () => {
      if (i === activeWs) return;
      switchToWorkspace(i);
      renderList();
      renderWsTabs();
    });
    wsTabs.appendChild(btn);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'ws-tab-add';
  addBtn.textContent = '+';
  addBtn.addEventListener('click', () => {
    const name = prompt('Workspace name:');
    if (name && name.trim()) {
      workspaces.push({
        id: 'ws' + Date.now(),
        name: name.trim(),
        tasks: [],
        theme: { ...getNextTheme() },
      });
      switchToWorkspace(workspaces.length - 1);
      renderCarousel();
      renderWsTabs();
      renderList();
      saveData();
    }
  });
  wsTabs.appendChild(addBtn);
}

export function switchToWorkspace(i) {
  if (i < 0 || i >= workspaces.length) return;
  activeWs = i;
  saveData();
  snapTrack();
  applyTheme(workspaces[i].theme);
  updateSlideContent();
}

function syncAfterListChange() {
  const active = activeTasks();
  const idx = currentTaskIndex();
  if (active.length === 0) { setCurrentTaskIndex(0); }
  else if (idx >= active.length) { setCurrentTaskIndex(active.length - 1); }
  updateSlideContent();
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
  const text = slide.querySelector('.text');
  if (text) text.className = 'text done-exit';

  setTimeout(() => {
    task.done = true;
    saveData();
    renderList();
    syncAfterListChange();

    const active = activeTasks();
    if (active.length > 0 && currentTaskIndex() < active.length) {
      const slide2 = getCurrentSlideEl();
      const text2 = slide2.querySelector('.text');
      if (text2) {
        text2.className = 'text done-enter';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            updateSlideContent();
          });
        });
      }
    } else {
      updateSlideContent();
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  }, 300);
}

// ========== LIST SHOW/HIDE ==========
export function showList() {
  if (showingList) return;
  setShowingList(true);
  focusLayer.classList.add('obscured');
  listLayer.classList.add('active');
  keyboardHint.classList.add('hidden');
  renderList();
  renderWsTabs();
  newTaskInput.focus();
}

export function showFocus() {
  if (!showingList) return;
  setShowingList(false);
  focusLayer.classList.remove('obscured');
  listLayer.classList.remove('active');
  updateSlideContent();
  keyboardHint.classList.remove('hidden');
  newTaskInput.blur();
}
