import { getNextTheme, applyTheme } from './themes.js';
import { workspaces, wsCurrentIndex, showingList, currentWsIndex, wsCount, loadData, saveData } from './data.js';
import {
  renderCarousel, renderDots, renderList,
  showFocus, showList, completeCurrent,
  switchToWorkspace, newTaskInput, keyboardHint,
} from './ui.js';
import { initGestures } from './gestures.js';

// ========== KEYBOARD ==========
newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && newTaskInput.value.trim()) {
    const text = newTaskInput.value.trim();
    const ts = workspaces[currentWsIndex()]?.tasks ?? [];
    ts.push({ id: String(Date.now()), text, done: false });
    newTaskInput.value = '';
    saveData();
    renderList();
  }
  if (e.key === 'Escape') {
    showFocus();
  }
});

document.addEventListener('keydown', (e) => {
  try {
    if (document.activeElement === newTaskInput) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (showingList) showFocus();
      else completeCurrent();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      showList();
      return;
    }
    if (e.key === 'Escape' || e.key === 'ArrowUp') {
      e.preventDefault();
      showFocus();
      return;
    }
    if (e.key === 'ArrowLeft') {
      if (showingList) return;
      e.preventDefault();
      if (currentWsIndex() > 0) switchToWorkspace(currentWsIndex() - 1);
      return;
    }
    if (e.key === 'ArrowRight') {
      if (showingList) return;
      e.preventDefault();
      if (currentWsIndex() < wsCount() - 1) switchToWorkspace(currentWsIndex() + 1);
      return;
    }
  } catch (err) {
    console.error('keyboard handler error:', err);
  }
});

// ========== INIT ==========
loadData();
workspaces.forEach(ws => {
  if (!ws.theme) ws.theme = { ...getNextTheme() };
  if (!(ws.id in wsCurrentIndex)) wsCurrentIndex[ws.id] = 0;
});
renderCarousel();
renderDots();
renderList();
applyTheme(workspaces[currentWsIndex()].theme);
keyboardHint.classList.remove('hidden');
initGestures();

window.addEventListener('beforeunload', saveData);
