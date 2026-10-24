export const THEME_STORAGE_KEY = 'viba-color-theme';

export function normalizeTheme(theme) {
  return theme === 'light' ? 'light' : 'dark';
}

export function readThemePreference(storage) {
  try {
    return normalizeTheme(storage?.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'dark';
  }
}

export function writeThemePreference(storage, theme) {
  const normalized = normalizeTheme(theme);
  try {
    storage?.setItem(THEME_STORAGE_KEY, normalized);
  } catch {
    // Theme switching still works for this page when storage is unavailable.
  }
  return normalized;
}
