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
    { icon: '🦅', text: 'The motto of the Indian Army is "Service Before Self" — a principle every officer must embody.' },
    { icon: '🚢', text: 'INS Vikrant is India’s first indigenously designed and built aircraft carrier, making India one of the few nations with this capability.' },
    { icon: '🚀', text: 'India’s BrahMos missile is the world’s fastest supersonic cruise missile, developed as a joint venture with Russia.' },
    { icon: '🚁', text: 'The Prachand Light Combat Helicopter is the only attack helicopter in the world that can land and take off at an altitude of 5,000 meters.' },
    { icon: '🛰️', text: 'Mission Shakti made India the fourth nation in the world to possess Anti-Satellite (ASAT) missile capabilities.' },
    { icon: '🔫', text: 'India has indigenously developed the INSAS rifle and is now shifting toward the advanced AK-203 produced in Amethi.' },
    { icon: '🛡️', text: 'The "Negative Import List" now includes over 4,000 items that the Indian Armed Forces can only procure from domestic manufacturers.' },
    { icon: '🛩️', text: 'HAL Tejas is a 4.5-generation indigenous fighter jet, recognized as the smallest and lightest multi-role supersonic fighter in its class.' },
    { icon: '💰', text: 'India’s defence exports reached an all-time high of ₹21,083 crore in FY 2023-24, exporting to over 85 countries.' },
    { icon: '🏗️', text: 'The Tata Aircraft Complex in Vadodara is India’s first private-sector final assembly line for military aircraft (C-295).' },
    { icon: '💥', text: 'The Pinaka Multi-Barrel Rocket Launcher system, developed by DRDO, is highly sought after globally for its precision and firepower.' },
    { icon: '🐘', text: 'The Arjun MBT Mk-1A is India’s premier indigenous Main Battle Tank, featuring 72 new upgrades over its predecessor.' },
    { icon: '📡', text: 'India’s NAVIC (Navigation with Indian Constellation) provides independent positioning services for military and civilian use.' },
    { icon: '🌊', text: 'The Arihant-class submarines are India’s first indigenously built nuclear-powered ballistic missile submarines.' },
    { icon: '🎯', text: 'The Astra missile is India’s first indigenous Beyond Visual Range (BVR) air-to-air missile.' },
    { icon: '👢', text: 'In a boost for local manufacturing, "Made in Bihar" boots have been supplied to the Russian Army.' },
    { icon: '⚓', text: 'The Indian Navy’s motto is "Sham-no Varunah," which translates to "May the Lord of Oceans be auspicious unto us."' },
    { icon: '☁️', text: 'The Indian Air Force motto "Nabha Sparsham Deeptam" (Touch the Sky with Glory) is taken from the Bhagavad Gita.' },
    { icon: '🐆', text: 'The Garud Commando Force is the elite special forces unit of the Indian Air Force, specializing in airfield protection.' },
    { icon: '🐅', text: 'The motto of the Rajputana Rifles is "Veer Bhogya Vasundhara," meaning "The Brave shall inherit the Earth."' },
    { icon: '🦁', text: 'The Sikh Regiment’s motto "Nischay Kar Apni Jeet Karon" means "With determination, I will be triumphant."' },
    { icon: '⚔️', text: 'The motto of the Kumaon Regiment is "Parakramo Vijayate," which translates to "Valour Triumphs."' },
    { icon: '🏔️', text: 'The Indo-Tibetan Border Police (ITBP) motto is "Shaurya, Dridhta, Karm Nishtha" (Valour, Determination, Devotion to Duty).' },
    { icon: '🐕', text: 'The Indian Army’s Remount and Veterinary Corps (RVC) trains dogs and horses that have received gallantry awards for service.' },
    { icon: '🎺', text: 'The "Beating Retreat" ceremony at Vijay Chowk marks the end of Republic Day festivities with traditional military music.' },
    { icon: '🏔️', text: 'India maintains the world’s highest battlefield at Siachen Glacier, located at an altitude of approximately 20,000 feet.' },
    { icon: '🔝', text: 'India is the most populous democracy in the world and has the second-largest standing army.' },
    { icon: '📉', text: 'Despite being a major military power, India has never invaded any country in her last 10,000 years of history.' },
    { icon: '🗳️', text: 'India’s 2024 General Elections were the largest democratic exercise in human history with nearly 970 million voters.' },
    { icon: '🛰️', text: 'India was the first country to reach Mars on its maiden attempt with the Mangalyaan mission.' },
    { icon: '🌗', text: 'In 2023, India became the first country to land a spacecraft (Chandrayaan-3) near the lunar South Pole.' },
    { icon: '🛤️', text: 'The Indian Railways is one of the world’s largest employers, with over 1.2 million employees.' },
    { icon: '🥛', text: 'India is the world’s largest producer of milk, accounting for about 24% of global milk production.' },
    { icon: '🏤', text: 'India has the largest postal network in the world, including a floating post office in Dal Lake, Srinagar.' },
    { icon: '🧘', text: 'Yoga originated in ancient India over 5,000 years ago and is now celebrated globally on June 21st.' },
    { icon: '🔢', text: 'The concept of "Zero" and the decimal system were invented in India by mathematicians like Aryabhata.' },
    { icon: '🏢', text: 'iDEX (Innovations for Defence Excellence) was launched to fund startups developing cutting-edge tech for the military.' },
    { icon: '🧪', text: 'DRDO operates a network of 52 laboratories dedicated to developing electronic, land, and naval combat systems.' },
    { icon: '🗺️', text: 'The Andaman and Nicobar Command is India’s first and only "Tri-service" theater command.' },
    { icon: '⚡', text: 'The Nirbhay missile is India’s first indigenous long-range subsonic cruise missile, capable of carrying nuclear warheads.' },
    { icon: '🚜', text: 'The Border Roads Organization (BRO) built "Umling La," the highest motorable road in the world at 19,024 feet.' },
    { icon: '📡', text: 'India’s "Integrated Guided Missile Development Programme" (IGMDP) laid the foundation for Agni and Akash missiles.' },
    { icon: '🩺', text: 'The Army Medical Corps motto is "Sarve Santu Niramaya," meaning "May all be free from disease."' },
    { icon: '🕊️', text: 'India is one of the largest troop contributors to United Nations Peacekeeping missions worldwide.' },
    { icon: '🏗️', text: 'The Chenab Bridge in J&K is the world\'s highest railway bridge, built to withstand high-intensity seismic zones.' },
    { icon: '🛠️', text: 'Under the "Make-II" category, the government provides simplified procedures for industry-funded indigenous prototypes.' },
    { icon: '🧥', text: 'India has indigenized the production of Extreme Cold Weather Clothing Systems (ECWCS) for soldiers in high altitudes.' },
    { icon: '🌉', text: 'The Atal Tunnel is the longest single-tube highway tunnel in the world above 10,000 feet.' },
    { icon: '🐅', text: 'India is home to over 75% of the world’s wild tiger population, a result of successful conservation efforts.' },
    { icon: '🎓', text: 'The National Defence Academy (NDA) in Khadakwasla is the world’s first tri-service academy.' },
    { icon: '🚩', text: 'The Indian national flag is made of Khadi and must be manufactured according to Bureau of Indian Standards (BIS) specs.' }
]
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
