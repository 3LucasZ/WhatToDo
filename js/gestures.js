import { workspaces, activeWs, isAnimating } from './data.js';
import { snapTrack, switchToWorkspace, carousel, focusTrack } from './ui.js';
import { config } from './config.js';

let gestureStartX = 0;
let gestureStartY = 0;
let gestureLockH = false;
let gestureLockV = false;
let activePointerId = null;

const SWIPE_THRESHOLD = 80;

export function initGestures() {
  carousel.addEventListener('pointerdown', onPointerDown);
  carousel.addEventListener('pointermove', onPointerMove);
  carousel.addEventListener('pointerup', onPointerUp);
  carousel.addEventListener('pointercancel', onPointerCancel);
}

function isTouchPointer(e) {
  return e.pointerType === 'touch';
}

function onPointerDown(e) {
  if (!isTouchPointer(e)) return;
  if (e.isPrimary === false) return;
  if (isAnimating) return;

  activePointerId = e.pointerId;
  gestureStartX = e.clientX;
  gestureStartY = e.clientY;
  gestureLockH = false;
  gestureLockV = false;
  carousel.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!isTouchPointer(e)) return;
  if (e.pointerId !== activePointerId) return;
  if (isAnimating) return;

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
    return; // ignore vertical swipes in the new all-tasks scroll
  }

  if (!gestureLockH) return;
  e.preventDefault();

  let dragPercent = (dx / carousel.clientWidth) * 100;

  focusTrack.classList.add('dragging');
  focusTrack.style.transform = `translateX(${-activeWs * 100 + dragPercent}%)`;
}

function onPointerUp(e) {
  if (!isTouchPointer(e)) return;
  if (e.pointerId !== activePointerId) return;

  activePointerId = null;

  if (isAnimating) return;
  if (!gestureLockH && !gestureLockV) return;
  if (gestureLockV) return;

  const dx = e.clientX - gestureStartX;

  if (Math.abs(dx) >= SWIPE_THRESHOLD) {
    const dir = dx > 0 ? -1 : 1;
    const target = config.circularWorkspaces
      ? (activeWs + dir + workspaces.length) % workspaces.length
      : Math.max(0, Math.min(workspaces.length - 1, activeWs + dir));
    switchToWorkspace(target);
  } else {
    snapTrack();
  }
}

function onPointerCancel(e) {
  if (e.pointerId === activePointerId) {
    activePointerId = null;
  }
}
