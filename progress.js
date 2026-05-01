// ============================================================
// progress.js — Progress Tracker & Study Time
// ============================================================

const ProgressManager = (() => {
  const KEY_PROGRESS = 'ssb_user_progress';
  const KEY_STUDY_TIME = 'ssb_study_time';
  const KEY_NEWS_READ = 'ssb_news_read';

  let sessionStart = Date.now();
  let studyTimerInterval = null;

  function getProgress() {
    return JSON.parse(localStorage.getItem(KEY_PROGRESS)) || {
      daysVisited: 0,
      newsRead: 0,
      questionsAttempted: 0,
      correctAnswers: 0,
      totalStudyMinutes: 0
    };
  }

  function saveProgress(p) {
    localStorage.setItem(KEY_PROGRESS, JSON.stringify(p));
  }

  function incrementDaysVisited() {
    const today = new Date().toISOString().split('T')[0];
    const lastDay = localStorage.getItem('ssb_last_progress_day');
    if (lastDay !== today) {
      localStorage.setItem('ssb_last_progress_day', today);
      const p = getProgress();
      p.daysVisited++;
      saveProgress(p);
    }
  }

  function recordNewsRead(id) {
    const readIds = JSON.parse(localStorage.getItem(KEY_NEWS_READ)) || [];
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(KEY_NEWS_READ, JSON.stringify(readIds));

      const p = getProgress();
      p.newsRead = readIds.length;
      saveProgress(p);

      // Save last viewed for "Continue Reading"
      localStorage.setItem('ssb_last_viewed', id);

      // Badge checks
      if (typeof BadgeManager !== 'undefined') {
        if (readIds.length >= 1) BadgeManager.unlock('first_read');
        if (readIds.length >= 10) BadgeManager.unlock('news_10');
        if (readIds.length >= 25) BadgeManager.unlock('news_25');
      }

      renderDashboard();
    }
  }

  function recordQuizAttempt(correct) {
    const p = getProgress();
    p.questionsAttempted++;
    if (correct) p.correctAnswers++;
    saveProgress(p);
    renderDashboard();
  }

  // ---- Study Time Tracker ----
  function startStudyTimer() {
    sessionStart = Date.now();

    // Update display every minute
    studyTimerInterval = setInterval(() => {
      updateStudyTimeDisplay();
    }, 60000);

    // Save time on page hide/unload
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveSessionTime();
      else sessionStart = Date.now(); // Resume timer
    });

    window.addEventListener('beforeunload', saveSessionTime);
    updateStudyTimeDisplay();
  }

  function saveSessionTime() {
    const minutesNow = Math.floor((Date.now() - sessionStart) / 60000);
    if (minutesNow <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    const timeData = JSON.parse(localStorage.getItem(KEY_STUDY_TIME)) || {};
    timeData[today] = (timeData[today] || 0) + minutesNow;
    localStorage.setItem(KEY_STUDY_TIME, JSON.stringify(timeData));

    const p = getProgress();
    p.totalStudyMinutes = Object.values(timeData).reduce((a, b) => a + b, 0);
    saveProgress(p);

    sessionStart = Date.now(); // Reset session to avoid double counting

    // Badge
    if (typeof BadgeManager !== 'undefined' && p.totalStudyMinutes >= 60) {
      BadgeManager.unlock('study_1hr');
    }
  }

  function getTodayStudyMinutes() {
    const today = new Date().toISOString().split('T')[0];
    const timeData = JSON.parse(localStorage.getItem(KEY_STUDY_TIME)) || {};
    const sessionMinutes = Math.floor((Date.now() - sessionStart) / 60000);
    return (timeData[today] || 0) + sessionMinutes;
  }

  function updateStudyTimeDisplay() {
    const el = document.getElementById('study-time-display');
    if (!el) return;
    const mins = getTodayStudyMinutes();
    if (mins < 1) {
      el.textContent = 'Just started studying today';
    } else {
      const hrs = Math.floor(mins / 60);
      const m = mins % 60;
      el.textContent = hrs > 0
        ? `You studied for ${hrs}h ${m}m today`
        : `You studied for ${mins} minute${mins !== 1 ? 's' : ''} today`;
    }
  }

  function renderDashboard() {
    const p = getProgress();
    const streak = typeof StreakManager !== 'undefined' ? StreakManager.getStreak() : 0;
    const quizStats = typeof QuizManager !== 'undefined' ? QuizManager.getStats() : { attempted: 0, score: 0 };
    const accuracy = quizStats.attempted > 0 ? Math.round((p.correctAnswers / p.questionsAttempted) * 100) : 0;

    const cards = [
      { icon: '🔥', label: 'Day Streak', value: streak, color: 'orange' },
      { icon: '📰', label: 'News Read', value: p.newsRead, color: 'blue' },
      { icon: '🧠', label: 'Questions Done', value: p.questionsAttempted, color: 'purple' },
      { icon: '✅', label: 'Accuracy', value: `${accuracy}%`, color: 'green' },
      { icon: '⏱️', label: 'Days Active', value: p.daysVisited, color: 'teal' },
      { icon: '🏆', label: 'Total Study', value: `${Math.floor(p.totalStudyMinutes / 60)}h ${p.totalStudyMinutes % 60}m`, color: 'gold' }
    ];

    const container = document.getElementById('progress-dashboard');
    if (!container) return;

    container.innerHTML = cards.map(card => `
      <div class="stat-card stat-${card.color}">
        <div class="stat-icon">${card.icon}</div>
        <div class="stat-value">${card.value}</div>
        <div class="stat-label">${card.label}</div>
      </div>
    `).join('');

    updateStudyTimeDisplay();
  }

  function getContinueReading(allNews) {
    const lastId = parseInt(localStorage.getItem('ssb_last_viewed'));
    if (!lastId || !allNews) return null;
    return allNews.find(n => n.id === lastId) || null;
  }

  return {
    init: () => {
      incrementDaysVisited();
      startStudyTimer();
    },
    recordNewsRead,
    recordQuizAttempt,
    renderDashboard,
    getContinueReading,
    getTodayStudyMinutes,
    updateStudyTimeDisplay,
    saveSessionTime
  };
})();
