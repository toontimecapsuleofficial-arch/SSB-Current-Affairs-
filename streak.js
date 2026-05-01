// ============================================================
// streak.js — Daily Visit Streak Tracker (Lucide icons)
// ============================================================

const StreakManager = (() => {
  const KEY_LAST_VISIT = 'ssb_last_visit';
  const KEY_STREAK     = 'ssb_streak';
  const KEY_MAX_STREAK = 'ssb_max_streak';

  function getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }
  function getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  function init() {
    const today     = getTodayStr();
    const lastVisit = localStorage.getItem(KEY_LAST_VISIT);
    let streak      = parseInt(localStorage.getItem(KEY_STREAK))     || 0;
    let maxStreak   = parseInt(localStorage.getItem(KEY_MAX_STREAK)) || 0;

    if (!lastVisit)                        { streak = 1; }
    else if (lastVisit === today)          { /* no change */ }
    else if (lastVisit === getYesterdayStr()) { streak += 1; }
    else                                   { streak = 1; }

    if (streak > maxStreak) maxStreak = streak;

    localStorage.setItem(KEY_LAST_VISIT,  today);
    localStorage.setItem(KEY_STREAK,      streak);
    localStorage.setItem(KEY_MAX_STREAK,  maxStreak);

    render(streak, maxStreak);
    return streak;
  }

  function getStreak()    { return parseInt(localStorage.getItem(KEY_STREAK))     || 0; }
  function getMaxStreak() { return parseInt(localStorage.getItem(KEY_MAX_STREAK)) || 0; }

  function render(streak, maxStreak) {
    const el = document.getElementById('streak-display');
    if (!el) return;

    // Color icon based on streak level
    const iconColor = streak >= 7 ? '#f97316' : streak >= 3 ? 'var(--accent-gold)' : 'var(--text-muted)';

    el.innerHTML = `
      <i data-lucide="flame" style="width:16px;height:16px;color:${iconColor};stroke-width:2;flex-shrink:0;"></i>
      <span class="streak-count">${streak}</span>
      <span class="streak-label">Day Streak</span>
    `;
    el.title = `Best: ${maxStreak} days`;

    if (streak >= 3) el.classList.add('streak-glow');
    else             el.classList.remove('streak-glow');

    // Re-render Lucide icons inside the element
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Badge checks
    if (typeof BadgeManager !== 'undefined') {
      if (streak >= 3)  BadgeManager.unlock('streak_3');
      if (streak >= 7)  BadgeManager.unlock('streak_7');
      if (streak >= 30) BadgeManager.unlock('streak_30');
    }
  }

  return { init, getStreak, getMaxStreak };
})();
