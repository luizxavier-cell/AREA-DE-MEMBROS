// Light/dark theme. The class on <html> is the single source of truth:
// public/theme-init.js sets it before first paint, and the
// toggles below flip it and remember the choice. Components never hold a
// theme signal — icons and labels switch with `dark:` variants in CSS, so
// server HTML and the hydrated page always agree.

// Also read by public/theme-init.js — keep the two in sync.
export const THEME_STORAGE_KEY = 'membros-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage blocked (private mode, sandbox): fall through to the OS.
  }
  return 'system';
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Not persisted, still applied for this page view.
  }
  const dark = preference === 'dark' || (preference === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
}

export function toggleTheme() {
  const dark = document.documentElement.classList.contains('dark');
  setThemePreference(dark ? 'light' : 'dark');
}
