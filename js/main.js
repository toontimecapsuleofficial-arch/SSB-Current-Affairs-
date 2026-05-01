// ============================================================
// main.js — Application Orchestrator (Lucide icons)
// ============================================================

const App = (() => {
  let allNews      = [];
  let allVocab     = [];
  let allQuestions = [];
  let activeSection = 'home';

  // ---- DATA LOADING ----
  async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed: ${path}`);
      return await res.json();
    } catch (e) { console.error(e); return []; }
  }

  async function loadAllData() {
    const [news, vocab, questions] = await Promise.all([
      loadJSON('data/news.json'),
      loadJSON('data/vocab.json'),
      loadJSON('data/questions.json')
    ]);
    const customNews = typeof AdminManager !== 'undefined' ? AdminManager.getCustomNews() : [];
    allNews      = [...customNews, ...news];
    allVocab     = vocab;
    allQuestions = questions;
    return { news: allNews, vocab: allVocab, questions: allQuestions };
  }

  // ---- BOOT ----
  async function init() {
    showLoadingScreen();
    const data = await loadAllData();

    ThemeManager.init();
    StreakManager.init();
    ProgressManager.init();
    SearchManager.init(data.news, data.vocab);
    QuizManager.init(data.questions);
    AdminManager.init();
    ReadingProgressBar.init();
    BadgeManager.renderBadges();
    BadgeManager.checkNightOwl();
    PopupFacts.init();
    MotivationalManager.scheduleDaily();

    renderNewsCards(allNews, document.getElementById('news-container'));
    renderVocabCards(allVocab);
    ProgressManager.renderDashboard();
    ContinueReading.render(allNews);

    // Home preview — top 3 news
    renderHomePreview();

    // Update hero counts
    const hn = document.getElementById('hero-news-count');
    const hv = document.getElementById('hero-vocab-count');
    const hq = document.getElementById('hero-quiz-count');
    if (hn) hn.textContent = allNews.length;
    if (hv) hv.textContent = allVocab.length;
    if (hq) hq.textContent = allQuestions.length;

    setupNavigation();
    setupArticleModal();

    // Final Lucide pass after all dynamic content rendered
    if (typeof lucide !== 'undefined') lucide.createIcons();

    hideLoadingScreen();
  }

  function renderHomePreview() {
    const preview = document.getElementById('home-news-preview');
    if (!preview) return;
    renderNewsCards(allNews.slice(0, 3), preview);
  }

  // ---- ICON HELPER ----
  // Returns a Lucide SVG string for use in innerHTML
  function icon(name, size = 16, extra = '') {
    return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;${extra}vertical-align:middle;flex-shrink:0;"></i>`;
  }

  // ---- RENDER NEWS CARDS ----
  function renderNewsCards(news, container) {
    if (!container) return;
    if (!news.length) {
      container.innerHTML = `
        <div class="empty-state">
          ${icon('inbox', 48, 'color:var(--text-muted);stroke-width:1.4;display:block;margin:0 auto 1rem;')}
          <h3>No articles found</h3>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    container.innerHTML = news.map(item => `
      <article class="news-card" data-id="${item.id}" onclick="App.openArticle(${item.id})">
        <div class="card-badge-row">
          <span class="card-category cat-${(item.category||'').toLowerCase().replace(/\s/g,'-')}">${item.category||'General'}</span>
          ${item.isCustom ? '<span class="custom-badge">Admin</span>' : ''}
        </div>
        <div class="card-icon-large">${getCategoryIcon(item.category)}</div>
        <div class="card-body">
          <h3 class="card-title">${item.title}</h3>
          <p class="card-summary">${item.summary}</p>
          <div class="card-tags">
            ${(item.tags||[]).slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="card-footer">
            <span class="card-meta">
              ${icon('calendar', 13, 'color:var(--text-muted);margin-right:3px;')}
              ${formatDate(item.date)} &nbsp;·&nbsp;
              ${icon('clock', 13, 'color:var(--text-muted);margin-right:3px;')}
              ${item.readTime||5} min
            </span>
            <div class="card-actions" onclick="event.stopPropagation()">
              <button class="action-btn bookmark-btn ${BookmarkManager.isBookmarked(item.id)?'bookmarked':''}"
                data-bookmark="${item.id}"
                onclick="BookmarkManager.toggle(${item.id}, ${JSON.stringify(item).replace(/"/g,'&quot;')})"
                title="Save article">
                ${icon('bookmark', 14)}
              </button>
              <button class="action-btn share-btn"
                onclick="ShareManager.shareNews(${JSON.stringify(item).replace(/"/g,'&quot;')})"
                title="Share">
                ${icon('share-2', 14)}
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join('');

    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = `${news.length} article${news.length!==1?'s':''}`;

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Category → Lucide icon name map
  function getCategoryIcon(cat) {
    const map = {
      'Defence':       'shield',
      'Geopolitics':   'globe',
      'Technology':    'cpu',
      'Foreign Policy':'handshake',
    };
    const name = map[cat] || 'file-text';
    return `<i data-lucide="${name}" style="width:32px;height:32px;color:var(--accent-gold);stroke-width:1.6;"></i>`;
  }

  // ---- RENDER VOCAB CARDS ----
  function renderVocabCards(vocab) {
    const container = document.getElementById('vocab-container');
    if (!container) return;

    const categories = ['All', ...new Set(vocab.map(v => v.category))];
    const filtersEl  = document.getElementById('vocab-filters');
    if (filtersEl) {
      filtersEl.innerHTML = categories.map(c =>
        `<button class="filter-chip ${c==='All'?'active':''}" onclick="App.filterVocab('${c}',this)">${c}</button>`
      ).join('');
    }
    displayVocab(vocab);
  }

  function displayVocab(vocab) {
    const container = document.getElementById('vocab-container');
    if (!container) return;

    container.innerHTML = vocab.map(v => `
      <div class="vocab-card difficulty-${(v.difficulty||'medium').toLowerCase()}">
        <div class="vocab-header">
          <span class="vocab-word">${v.word}</span>
          <span class="vocab-difficulty diff-${(v.difficulty||'Medium').toLowerCase()}">${v.difficulty||'Medium'}</span>
        </div>
        <p class="vocab-definition">${v.definition}</p>
        <div class="vocab-usage">
          <span class="usage-label">${icon('map-pin', 13, 'color:var(--text-secondary);margin-right:4px;')} Usage:</span>
          <em>${v.usage}</em>
        </div>
        <div class="vocab-footer">
          <span class="vocab-category">${v.category}</span>
          <button class="btn-sm" onclick="SuggestionManager.renderSuggestionForm('Vocabulary:${v.word}',${v.id},'vs-${v.id}')" title="Suggest">
            ${icon('message-square', 13)}
          </button>
        </div>
        <div id="vs-${v.id}"></div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function filterVocab(category, btn) {
    document.querySelectorAll('#vocab-filters .filter-chip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    displayVocab(category==='All' ? allVocab : allVocab.filter(v=>v.category===category));
  }

  // ---- ARTICLE MODAL ----
  function setupArticleModal() {
    const modal = document.getElementById('article-modal');
    if (!modal) return;
    modal.addEventListener('click', e => { if (e.target===modal) closeArticle(); });
    document.addEventListener('keydown', e => { if (e.key==='Escape') closeArticle(); });
  }

  function openArticle(id) {
    const article = allNews.find(n => n.id===id);
    if (!article) return;
    ProgressManager.recordNewsRead(id);

    const modal   = document.getElementById('article-modal');
    const content = document.getElementById('article-modal-content');
    if (!modal||!content) return;

    content.innerHTML = `
      <div class="article-modal-header">
        <button class="modal-back-btn" onclick="App.closeArticle()">
          ${icon('arrow-left', 15, 'margin-right:4px;')} Back
        </button>
        <div class="article-modal-actions">
          <button class="action-btn bookmark-btn ${BookmarkManager.isBookmarked(id)?'bookmarked':''}"
            data-bookmark="${id}"
            onclick="BookmarkManager.toggle(${id},${JSON.stringify(article).replace(/"/g,'&quot;')})"
            title="Save">
            ${icon('bookmark', 15)}
          </button>
          <button class="action-btn"
            onclick="ShareManager.shareNews(${JSON.stringify(article).replace(/"/g,'&quot;')})"
            title="Share">
            ${icon('share-2', 15)}
          </button>
        </div>
      </div>
      <div class="article-content">
        <div class="article-cat-icon">${getCategoryIcon(article.category)}</div>
        <span class="card-category cat-${(article.category||'').toLowerCase().replace(/\s/g,'-')}">${article.category}</span>
        <h1 class="article-title">${article.title}</h1>
        <div class="article-meta">
          ${icon('calendar', 13, 'margin-right:4px;')}${formatDate(article.date)}
          &nbsp;·&nbsp;
          ${icon('clock', 13, 'margin-right:4px;')}${article.readTime||5} min read
        </div>
        <div class="article-tags">${(article.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="article-divider"></div>
        <p class="article-summary">${article.summary}</p>
        <p class="article-body">${article.content}</p>
        <div class="article-suggestion-section">
          <h4>${icon('message-square', 15, 'margin-right:6px;color:var(--text-secondary);')} Have a correction or suggestion?</h4>
          <div id="art-sug-${id}"></div>
          <script>SuggestionManager.renderSuggestionForm('News:${article.title.replace(/'/g,"\\'")}',${id},'art-sug-${id}')<\/script>
        </div>
      </div>
    `;

    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function closeArticle() {
    const modal = document.getElementById('article-modal');
    if (modal) modal.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  // ---- NAVIGATION ----
  function setupNavigation() {
    document.querySelectorAll('[data-section]').forEach(btn => {
      btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });
  }

  function switchSection(section) {
    activeSection = section;
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => {
      l.classList.toggle('active',
        l.dataset.section===section ||
        l.getAttribute('href')==='#'+section
      );
    });

    if (section==='bookmarks') BookmarkManager.renderSavedSection();
    if (section==='progress')  { ProgressManager.renderDashboard(); BadgeManager.renderBadges(); }
    if (section==='quiz')      QuizManager.startQuiz();

    // Track sections for badge
    const visited = JSON.parse(localStorage.getItem('ssb_sections_visited')||'[]');
    if (!visited.includes(section)) visited.push(section);
    localStorage.setItem('ssb_sections_visited', JSON.stringify(visited));
    if (['home','news','vocab','quiz','progress','bookmarks'].every(s=>visited.includes(s))) {
      BadgeManager.unlock('all_sections');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function refreshNews() {
    const custom = AdminManager.getCustomNews();
    allNews = [...custom, ...allNews.filter(n=>!n.isCustom)];
    renderNewsCards(allNews, document.getElementById('news-container'));
    SearchManager.init(allNews, allVocab);
    renderHomePreview();
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  }

  function showLoadingScreen() {
    const l = document.getElementById('loading-screen');
    if (l) { l.style.display='flex'; if (typeof lucide!=='undefined') lucide.createIcons(); }
  }

  function hideLoadingScreen() {
    const l = document.getElementById('loading-screen');
    if (l) { l.style.opacity='0'; setTimeout(()=>l.style.display='none',500); }
  }

  return { init, renderNewsCards, renderVocabCards, displayVocab, filterVocab, openArticle, closeArticle, switchSection, refreshNews };
})();

document.addEventListener('DOMContentLoaded', App.init);
