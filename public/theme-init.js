// Applies the saved theme (or the device's) before first paint, so a
// dark-mode visitor never sees a flash of the light theme. Loaded as a
// blocking <script> from src/Document.tsx. The storage key must match
// THEME_STORAGE_KEY in src/lib/theme.ts.
//
// With nothing saved the page follows the device, live: switching the OS to
// dark (or an automatic sunset switch) re-themes open tabs too.
(function () {
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function saved() {
    try {
      return localStorage.getItem('membros-theme');
    } catch (e) {
      return null; // Storage blocked: follow the device.
    }
  }
  function apply() {
    var choice = saved();
    var dark = choice === 'dark' || (choice !== 'light' && media.matches);
    document.documentElement.classList.toggle('dark', dark);
  }
  apply();
  media.addEventListener('change', apply);
})();
