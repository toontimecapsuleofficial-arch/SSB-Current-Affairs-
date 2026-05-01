// ============================================================
// theme.js — Dark / Light Mode Toggle (Lucide icons)
// ============================================================

const ThemeManager = (() => {
  const KEY = 'ssb_theme';

  function init() {
    const saved = localStorage.getItem(KEY) || 'dark';
    applyTheme(saved);
    setupToggle();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      // Swap Lucide icon
      btn.innerHTML = theme === 'dark'
        ? '<i data-lucide="sun" style="width:17px;height:17px;"></i>'
        : '<i data-lucide="moon" style="width:17px;height:17px;"></i>';
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  function toggle() {
    const current = localStorage.getItem(KEY) || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function setupToggle() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  function getCurrent() {
    return localStorage.getItem(KEY) || 'dark';
  }

  return { init, toggle, getCurrent };
})();
