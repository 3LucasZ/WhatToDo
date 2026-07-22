export const THEMES = [
  {
    id: 'coral',
    accent: '#e87a5d',
    bg: '#fdf6f0',
    fg: '#3d2c2a',
    muted: '#b2958a',
    faint: 'rgba(180, 120, 100, 0.15)',
    gradients: [
      'rgba(255, 200, 140, 0.35)',
      'rgba(255, 160, 130, 0.25)',
      'rgba(200, 220, 255, 0.30)',
      'rgba(255, 230, 160, 0.20)',
    ],
  },
  {
    id: 'ocean',
    accent: '#4f8ff7',
    bg: '#f2f7fc',
    fg: '#1e2a3a',
    muted: '#8899b0',
    faint: 'rgba(79, 143, 247, 0.12)',
    gradients: [
      'rgba(150, 200, 255, 0.30)',
      'rgba(100, 150, 255, 0.18)',
      'rgba(200, 230, 255, 0.35)',
      'rgba(130, 180, 255, 0.15)',
    ],
  },
  {
    id: 'forest',
    accent: '#4cb682',
    bg: '#f2faf5',
    fg: '#1a2e24',
    muted: '#7fa891',
    faint: 'rgba(76, 182, 130, 0.12)',
    gradients: [
      'rgba(160, 230, 190, 0.30)',
      'rgba(120, 210, 160, 0.20)',
      'rgba(200, 245, 220, 0.30)',
      'rgba(180, 220, 160, 0.18)',
    ],
  },
  {
    id: 'sunset',
    accent: '#d4709e',
    bg: '#fdf2f5',
    fg: '#2e1e26',
    muted: '#b28a98',
    faint: 'rgba(212, 112, 158, 0.12)',
    gradients: [
      'rgba(255, 180, 190, 0.28)',
      'rgba(230, 140, 190, 0.22)',
      'rgba(255, 210, 180, 0.25)',
      'rgba(200, 180, 255, 0.20)',
    ],
  },
  {
    id: 'amber',
    accent: '#da8c3a',
    bg: '#fcf7ef',
    fg: '#2e2618',
    muted: '#b09a78',
    faint: 'rgba(218, 140, 58, 0.12)',
    gradients: [
      'rgba(255, 210, 140, 0.30)',
      'rgba(255, 180, 100, 0.22)',
      'rgba(255, 230, 180, 0.30)',
      'rgba(220, 200, 150, 0.18)',
    ],
  },
  {
    id: 'lavender',
    accent: '#8b7dd8',
    bg: '#f6f4fd',
    fg: '#1e1a30',
    muted: '#958ab8',
    faint: 'rgba(139, 125, 216, 0.12)',
    gradients: [
      'rgba(200, 180, 255, 0.28)',
      'rgba(160, 140, 240, 0.18)',
      'rgba(220, 210, 255, 0.30)',
      'rgba(180, 200, 255, 0.18)',
    ],
  },
];

let _themeIndex = 0;

export function getNextTheme() {
  const t = THEMES[_themeIndex % THEMES.length];
  _themeIndex++;
  return { ...t };
}

export function getThemeIndex() { return _themeIndex; }
export function setThemeIndex(i) { _themeIndex = i; }

export function findThemeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

export function applyTheme(theme) {
  const r = document.documentElement;
  r.style.setProperty('--bg', theme.bg);
  r.style.setProperty('--fg', theme.fg);
  r.style.setProperty('--muted', theme.muted);
  r.style.setProperty('--faint', theme.faint);
  r.style.setProperty('--accent', theme.accent);

  const g = document.getElementById('bg-gradients');
  g.style.background = `
    radial-gradient(ellipse 80% 60% at 10% 15%, ${theme.gradients[0]}, transparent),
    radial-gradient(ellipse 70% 50% at 90% 20%, ${theme.gradients[1]}, transparent),
    radial-gradient(ellipse 60% 50% at 50% 85%, ${theme.gradients[2]}, transparent),
    radial-gradient(ellipse 50% 40% at 20% 60%, ${theme.gradients[3]}, transparent)
  `;
  g.style.opacity = '0.92';
  requestAnimationFrame(() => { g.style.opacity = '1'; });
}
