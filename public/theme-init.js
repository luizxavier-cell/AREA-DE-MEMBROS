// Applies the saved theme (or the OS preference) before first paint, so a
// dark-mode visitor never sees a flash of the light theme. Loaded as a
// blocking <script> from src/Document.tsx. The storage key must match
// THEME_STORAGE_KEY in src/lib/theme.ts.
(function () {
  try {
    var saved = localStorage.getItem('membros-theme');
    var dark =
      saved === 'dark' ||
      (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    // Storage blocked: keep the light theme.
  }
})();
