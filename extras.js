// ============================================================
// extras.js — Badges, Popup Facts, Reading Bar, Motivational Popup
// ============================================================

// ---- BADGE MANAGER ----
const BadgeManager = (() => {
  const KEY = 'ssb_badges';

  const BADGE_DEFS = {
    first_read:     { icon: '📰', name: 'First Article', desc: 'Read your first article' },
    news_10:        { icon: '📚', name: 'News Veteran', desc: 'Read 10 articles' },
    news_25:        { icon: '🗞️', name: 'News Addict', desc: 'Read 25 articles' },
    streak_3:       { icon: '🔥', name: '3-Day Streak', desc: 'Visited 3 days in a row' },
    streak_7:       { icon: '🔥🔥', name: 'Week Warrior', desc: 'Visited 7 days in a row' },
    streak_30:      { icon: '💎', name: 'Iron Discipline', desc: '30-day streak achieved' },
    first_quiz:     { icon: '🧠', name: 'First Quiz', desc: 'Completed your first quiz question' },
    quiz_10:        { icon: '🎯', name: 'Quiz Ace', desc: 'Attempted 10 quiz questions' },
    quiz_score_5:   { icon: '⭐', name: 'Sharp Mind', desc: 'Got 5 correct answers' },
    bookmarks_5:    { icon: '🔖', name: 'Curator', desc: 'Saved 5 articles' },
    study_1hr:      { icon: '⏰', name: 'Dedicated', desc: 'Studied for 1 hour total' },
    all_sections:   { icon: '🏅', name: 'Explorer', desc: 'Visited all sections' },
    night_owl:      { icon: '🦉', name: 'Night Owl', desc: 'Studied after midnight' },
  };

  function getUnlocked() {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  }

  function unlock(badgeId) {
    if (!BADGE_DEFS[badgeId]) return;
    const unlocked = getUnlocked();
    if (unlocked.find(b => b.id === badgeId)) return; // Already have it

    const badge = { id: badgeId, ...BADGE_DEFS[badgeId], unlockedAt: new Date().toISOString() };
    unlocked.push(badge);
    localStorage.setItem(KEY, JSON.stringify(unlocked));

    showBadgePopup(badge);
    renderBadges();
  }

  function showBadgePopup(badge) {
    const el = document.createElement('div');
    el.className = 'badge-unlock-popup';
    el.innerHTML = `
      <div class="badge-unlock-inner">
        <div class="badge-unlock-icon">${badge.icon}</div>
        <div>
          <div class="badge-unlock-title">🏆 Badge Unlocked!</div>
          <div class="badge-unlock-name">${badge.name}</div>
          <div class="badge-unlock-desc">${badge.desc}</div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('badge-popup-show'), 50);
    setTimeout(() => { el.classList.remove('badge-popup-show'); setTimeout(() => el.remove(), 600); }, 4000);
  }

  function renderBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;

    const unlocked = getUnlocked();
    const all = Object.entries(BADGE_DEFS);

    container.innerHTML = all.map(([id, badge]) => {
      const have = unlocked.find(b => b.id === id);
      return `
        <div class="badge-item ${have ? 'badge-earned' : 'badge-locked'}" title="${badge.desc}">
          <div class="badge-icon">${have ? badge.icon : '🔒'}</div>
          <div class="badge-name">${badge.name}</div>
          ${have ? `<div class="badge-date">${new Date(have.unlockedAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</div>` : ''}
        </div>
      `;
    }).join('');

    // Update badge count
    const countEl = document.getElementById('badge-count');
    if (countEl) countEl.textContent = `${unlocked.length}/${all.length}`;
  }

  // Night owl check
  function checkNightOwl() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) unlock('night_owl');
  }

  return { unlock, getUnlocked, renderBadges, checkNightOwl, BADGE_DEFS };
})();

// ---- READING PROGRESS BAR ----
const ReadingProgressBar = (() => {
  function init() {
    const bar = document.getElementById('reading-progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      bar.style.width = `${pct}%`;
    });
  }
  return { init };
})();

// ---- POPUP FACTS (Defence/Geopolitics/SSB) ----
const PopupFacts = (() => {
  const facts = [
    { icon: '⚔️', text: 'India has the world\'s 2nd largest standing army with over 1.4 million active personnel.' },
    { icon: '🚀', text: 'BrahMos is the world\'s fastest operational supersonic cruise missile, capable of Mach 2.8.' },
    { icon: '🛡️', text: 'India\'s nuclear doctrine follows "No First Use" — it will not use nuclear weapons unless attacked first.' },
    { icon: '🚢', text: 'INS Vikrant is India\'s first indigenously built aircraft carrier, named after the hero of 1971.' },
    { icon: '🧠', text: 'SSB assesses 15 Officer Like Qualities across Psychological, Social, and Planning dimensions.' },
    { icon: '🌍', text: 'India is the founding member of the Non-Aligned Movement, established in 1961 in Belgrade.' },
    { icon: '✈️', text: 'The Indian Air Force is the world\'s 4th largest, with over 1,700 aircraft in its fleet.' },
    { icon: '🎖️', text: 'Param Vir Chakra, India\'s highest wartime gallantry award, has been awarded 21 times.' },
    { icon: '📡', text: 'India launched NavIC, its own regional navigation satellite system, reducing GPS dependence.' },
    { icon: '🔬', text: 'DRDO has over 52 laboratories working on everything from missiles to materials science.' },
    { icon: '🤝', text: 'India is the largest contributor to UN Peacekeeping missions with over 6,000 troops deployed.' },
    { icon: '🏔️', text: 'Siachen Glacier at 6,000m is the world\'s highest battlefield where Indian troops are posted.' },
    { icon: '⚡', text: 'Operation Vijay (1999) saw India\'s successful eviction of Pakistani forces from Kargil heights.' },
    { icon: '🎯', text: 'PPDT in SSB tests leadership, communication, and initiative in group discussion settings.' },
    { icon: '🌊', text: 'India\'s Exclusive Economic Zone spans 2.37 million sq km — the 16th largest in the world.' },
    { icon: '🛸', text: 'India successfully tested an anti-satellite (ASAT) weapon in 2019 under Mission Shakti.' },
    { icon: '📊', text: 'India aims to achieve 25% of its defence needs through domestic production under Aatmanirbhar Bharat.' },
    { icon: '🦅', text: 'The motto of the Indian Army is "Service Before Self" — a principle every officer must embody.' }
  ];

  let shownFacts = [];
  let popupTimeout = null;

  function init() {
    // Show first fact after 45 seconds, then randomly every 3-7 minutes
    scheduleNextFact(45000);
  }

  function scheduleNextFact(delay) {
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
      showFact();
      const nextDelay = (Math.random() * 4 + 3) * 60000; // 3-7 min
      scheduleNextFact(nextDelay);
    }, delay);
  }

  function showFact() {
    // Don't show if modal is open or user is actively interacting
    if (document.querySelector('.modal-open')) return;

    let available = facts.filter((_, i) => !shownFacts.includes(i));
    if (!available.length) { shownFacts = []; available = facts; }

    const idx = Math.floor(Math.random() * available.length);
    const fact = available[idx];
    shownFacts.push(facts.indexOf(fact));

    const el = document.createElement('div');
    el.className = 'fact-popup';
    el.innerHTML = `
      <div class="fact-popup-header">
        <span class="fact-label">💡 Did You Know?</span>
        <button class="fact-close" onclick="this.closest('.fact-popup').remove()">✕</button>
      </div>
      <div class="fact-content">
        <span class="fact-icon">${fact.icon}</span>
        <p>${fact.text}</p>
      </div>
    `;

    document.body.appendChild(el);
    setTimeout(() => el.classList.add('fact-popup-show'), 50);
    setTimeout(() => {
      el.classList.remove('fact-popup-show');
      setTimeout(() => el.remove(), 600);
    }, 8000);
  }

  return { init, showFact };
})();

// ---- MOTIVATIONAL POPUP ----
const MotivationalManager = (() => {
  const quotes = [
    { quote: "The more you sweat in peace, the less you bleed in war.", author: "Norman Schwarzkopf" },
    { quote: "It is not the strength of the body that counts, but the strength of the spirit.", author: "J.R.R. Tolkien" },
    { quote: "Discipline is the soul of an army.", author: "George Washington" },
    { quote: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
    { quote: "A true soldier fights not because he hates what is in front of him, but because he loves what is behind him.", author: "G.K. Chesterton" },
    { quote: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek" },
    { quote: "Hard training, easy war. Easy training, hard war.", author: "Field Marshal Suvorov" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  ];

  function show() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const el = document.createElement('div');
    el.className = 'motivational-popup';
    el.innerHTML = `
      <div class="motivational-content">
        <div class="motivational-icon">🎖️</div>
        <blockquote class="motivational-quote">"${q.quote}"</blockquote>
        <cite class="motivational-author">— ${q.author}</cite>
        <button class="btn-sm btn-primary" onclick="this.closest('.motivational-popup').remove()">
          💪 Stay Focused
        </button>
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('motivational-show'), 50);
  }

  function scheduleDaily() {
    const today = new Date().toISOString().split('T')[0];
    const lastShown = localStorage.getItem('ssb_last_motivational');
    if (lastShown !== today) {
      setTimeout(() => { show(); localStorage.setItem('ssb_last_motivational', today); }, 8000);
    }
  }

  return { show, scheduleDaily };
})();

// ---- CONTINUE READING ----
const ContinueReading = (() => {
  function render(allNews) {
    const container = document.getElementById('continue-reading-banner');
    if (!container) return;

    const lastId = parseInt(localStorage.getItem('ssb_last_viewed'));
    if (!lastId) { container.style.display = 'none'; return; }

    const article = allNews.find(n => n.id === lastId);
    if (!article) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="continue-inner">
        <span class="continue-label">↩️ Continue Reading</span>
        <span class="continue-title">${article.image} ${article.title}</span>
        <button class="btn-sm btn-primary" onclick="App.openArticle(${article.id})">Read →</button>
      </div>
    `;
  }
  return { render };
})();
