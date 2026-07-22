import { getNextTheme, applyTheme } from './themes.js';
import { workspaces, wsCurrentIndex, currentWsIndex, wsCount, loadData, saveData } from './data.js';
import {
  renderCarousel, renderDots, renderAllSlides,
  completeCurrent, switchToWorkspace, keyboardHint,
} from './ui.js';
import { initGestures } from './gestures.js';
import { config } from './config.js';

document.addEventListener('keydown', (e) => {
  try {
    if (document.activeElement?.tagName === 'INPUT') return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      completeCurrent();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const idx = currentWsIndex();
      const target = config.circularWorkspaces
        ? (idx - 1 + wsCount()) % wsCount()
        : Math.max(0, idx - 1);
      if (target !== idx) switchToWorkspace(target);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = currentWsIndex();
      const target = config.circularWorkspaces
        ? (idx + 1) % wsCount()
        : Math.min(wsCount() - 1, idx + 1);
      if (target !== idx) switchToWorkspace(target);
      return;
    }
  } catch (err) {
    console.error('keyboard handler error:', err);
  }
});

// Close theme pickers on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#theme-picker') && !e.target.closest('.ws-label')) {
    document.querySelectorAll('#theme-picker.open').forEach(p => p.classList.remove('open'));
  }
}, true);

// ========== INIT ==========
loadData();
workspaces.forEach(ws => {
  if (!ws.theme) ws.theme = { ...getNextTheme() };
  if (!(ws.id in wsCurrentIndex)) wsCurrentIndex[ws.id] = 0;
});
renderCarousel();
renderDots();
applyTheme(workspaces[currentWsIndex()].theme);
requestAnimationFrame(() => keyboardHint.classList.add('show'));
initGestures();

window.addEventListener('beforeunload', saveData);
