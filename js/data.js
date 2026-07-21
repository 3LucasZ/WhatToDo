import { getNextTheme, setThemeIndex, getThemeIndex } from './themes.js';

const STORAGE_KEY = 'whattodo_data_v2';

export let workspaces = [];
export let activeWs = 0;
export let wsCurrentIndex = {};
export let showingList = false;
export let isAnimating = false;

export function setShowingList(v) { showingList = v; }
export function setIsAnimating(v) { isAnimating = v; }
export function setActiveWs(i) { activeWs = i; }

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.workspaces) && parsed.workspaces.length) {
        workspaces = parsed.workspaces;
        if (typeof parsed.activeWs === 'number') activeWs = parsed.activeWs;
        if (parsed.wsCurrentIndex) wsCurrentIndex = parsed.wsCurrentIndex;
        if (typeof parsed.themeIndex === 'number') setThemeIndex(parsed.themeIndex);
        if (activeWs >= workspaces.length) activeWs = 0;
        return;
      }
    }
  } catch (_) {}

  // Try legacy v1 format
  try {
    const old = localStorage.getItem('whattodo_tasks');
    if (old) {
      const parsed = JSON.parse(old);
      if (Array.isArray(parsed) && parsed.length) {
        workspaces = [{
          id: 'ws1', name: 'Personal', tasks: parsed,
          theme: { ...getNextTheme() },
        }];
        return;
      }
    }
  } catch (_) {}

  // Default
  workspaces = [
    {
      id: 'ws1', name: 'Personal', tasks: [
        { id: '1', text: 'Write project proposal', done: false },
        { id: '2', text: 'Review team pull requests', done: false },
        { id: '3', text: 'Order new desk lamp', done: false },
        { id: '4', text: 'Update personal portfolio', done: false },
      ],
      theme: { ...getNextTheme() },
    },
    {
      id: 'ws2', name: 'Work', tasks: [
        { id: '5', text: 'Q3 planning doc', done: false },
        { id: '6', text: 'Design system audit', done: false },
        { id: '7', text: 'Schedule retro', done: false },
      ],
      theme: { ...getNextTheme() },
    },
    {
      id: 'ws3', name: 'Side', tasks: [
        { id: '8', text: 'Learn Rust basics', done: false },
        { id: '9', text: 'Fix garage shelf', done: false },
      ],
      theme: { ...getNextTheme() },
    },
  ];
}

export function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    workspaces,
    activeWs,
    wsCurrentIndex,
    themeIndex: getThemeIndex(),
  }));
}

export function tasks() { return workspaces[activeWs]?.tasks ?? []; }

export function activeTasks() { return tasks().filter(t => !t.done); }

export function getCurrentTask() {
  const active = activeTasks();
  if (active.length === 0) return null;
  const idx = wsCurrentIndex[workspaces[activeWs].id] ?? 0;
  if (idx >= active.length) {
    wsCurrentIndex[workspaces[activeWs].id] = active.length - 1;
  }
  return active[wsCurrentIndex[workspaces[activeWs].id] ?? 0] ?? null;
}

export function currentTaskIndex() {
  return wsCurrentIndex[workspaces[activeWs].id] ?? 0;
}

export function setCurrentTaskIndex(n) {
  wsCurrentIndex[workspaces[activeWs].id] = n;
}
