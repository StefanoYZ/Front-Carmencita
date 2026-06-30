/**
 * Preferencias de accesibilidad del sistema Carmencita Express.
 *
 * - Se persisten en localStorage.
 * - Se aplican mediante clases globales en <html>, una escala de fuente en la
 *   raiz y filtros visuales sobre el contenedor #root (los controles flotantes
 *   se renderizan via portal fuera de #root, por lo que no se ven afectados).
 */

export const STORAGE_KEY = 'carmencita:accessibility';

export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.6;
export const FONT_SCALE_STEP = 0.1;

export const SATURATION_CYCLE = ['normal', 'low', 'grayscale'];

export const DEFAULT_PREFERENCES = {
  contrast: false,
  highlightLinks: false,
  fontScale: 1,
  textSpacing: false,
  lineHeight: false,
  reduceMotion: false,
  hideImages: false,
  dyslexia: false,
  bigCursor: false,
  alignLeft: false,
  saturation: 'normal',
};

export function loadPreferences() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* almacenamiento no disponible: se ignora silenciosamente */
  }
}

function clampFontScale(value) {
  const next = Math.round(value * 100) / 100;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, next));
}

/** Aplica las preferencias al DOM (clases en <html>, escala y filtros). */
export function applyPreferences(prefs) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const toggle = (cls, on) => root.classList.toggle(cls, Boolean(on));
  toggle('a11y-contrast', prefs.contrast);
  toggle('a11y-highlight-links', prefs.highlightLinks);
  toggle('a11y-text-spacing', prefs.textSpacing);
  toggle('a11y-line-height', prefs.lineHeight);
  toggle('a11y-no-animations', prefs.reduceMotion);
  toggle('a11y-hide-images', prefs.hideImages);
  toggle('a11y-dyslexia', prefs.dyslexia);
  toggle('a11y-big-cursor', prefs.bigCursor);
  toggle('a11y-align-left', prefs.alignLeft);

  // Escala de texto (afecta unidades rem de Tailwind).
  const scale = clampFontScale(prefs.fontScale || 1);
  root.style.fontSize = scale === 1 ? '' : `${Math.round(scale * 100)}%`;

  // Filtros visuales sobre el contenedor de la app (no sobre los controles flotantes,
  // que se renderizan via portal fuera de #root).
  const appRoot = document.getElementById('root');
  if (appRoot) {
    const filters = [];
    if (prefs.contrast) filters.push('contrast(1.25)');
    if (prefs.saturation === 'low') filters.push('saturate(0.55)');
    if (prefs.saturation === 'grayscale') filters.push('grayscale(1)');
    appRoot.style.filter = filters.join(' ');
  }
}

export function nextSaturation(current) {
  const index = SATURATION_CYCLE.indexOf(current);
  return SATURATION_CYCLE[(index + 1) % SATURATION_CYCLE.length];
}

export function increaseFontScale(value) {
  return clampFontScale((value || 1) + FONT_SCALE_STEP);
}

export function decreaseFontScale(value) {
  return clampFontScale((value || 1) - FONT_SCALE_STEP);
}
