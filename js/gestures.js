import { workspaces, activeWs, showingList, isAnimating } from './data.js';
import { snapTrack, switchToWorkspace, showList, carousel, focusTrack } from './ui.js';

let gestureStartX = 0;
let gestureStartY = 0;
let gestureLockH = false;
let gestureLockV = false;

const SWIPE_THRESHOLD = 80;

export function initGestures() {
  carousel.addEventListener('pointerdown', onPointerDown);
  carousel.addEventListener('pointermove', onPointerMove);
  carousel.addEventListener('pointerup', onPointerUp);

  // Touch swipe-down for list (fallback for non-carousel areas)
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    if (showingList) return;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (showingList) return;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (dy > 50) showList();
  }, { passive: true });
}

function onPointerDown(e) {
  if (showingList || isAnimating) return;
  gestureStartX = e.clientX;
  gestureStartY = e.clientY;
  gestureLockH = false;
  gestureLockV = false;
  carousel.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (showingList || isAnimating) return;

  const dx = e.clientX - gestureStartX;
  const dy = e.clientY - gestureStartY;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  if (!gestureLockH && !gestureLockV) {
    if (adx > 10 || ady > 10) {
      if (adx > ady) gestureLockH = true;
      else gestureLockV = true;
    }
  }

  if (gestureLockV) {
    if (dy > 30) {
      carousel.releasePointerCapture(e.pointerId);
      showList();
    }
    return;
  }

  if (!gestureLockH) return;
  e.preventDefault();

  const totalW = workspaces.length;
  const canGoLeft = activeWs < totalW - 1;
  const canGoRight = activeWs > 0;
  let dragPercent = (dx / carousel.clientWidth) * 100;

  if (!canGoLeft && dragPercent < 0) dragPercent *= 0.3;
  if (!canGoRight && dragPercent > 0) dragPercent *= 0.3;

  focusTrack.classList.add('dragging');
  focusTrack.style.transform = `translateX(${-activeWs * 100 + dragPercent}%)`;
}

function onPointerUp(e) {
  if (showingList || isAnimating) return;
  if (!gestureLockH && !gestureLockV) return;
  if (gestureLockV) return;

  const dx = e.clientX - gestureStartX;

  if (Math.abs(dx) >= SWIPE_THRESHOLD) {
    const dir = dx > 0 ? -1 : 1;
    const target = activeWs + dir;
    if (target >= 0 && target < workspaces.length) {
      switchToWorkspace(target);
    } else {
      snapTrack();
    }
  } else {
    snapTrack();
  }
}
