// ============================================================
// search.js — Search & Filter System
// ============================================================

const SearchManager = (() => {
  let allNews = [];
  let allVocab = [];
  let activeCategory = 'All';
  let searchQuery = '';
  let searchTimeout = null;

  function init(news, vocab) {
    allNews = news;
    allVocab = vocab;
    setupSearchUI();
    setupCategoryFilters();
  }

  function setupSearchUI() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFilters();
      }, 300); // Debounce
    });

    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        searchQuery = '';
        applyFilters();
      });
    }
  }

  function setupCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    const categories = ['All', ...new Set(allNews.map(n => n.category))];
    container.innerHTML = categories.map(cat => `
      <button class="filter-chip ${cat === 'All' ? 'active' : ''}" data-cat="${cat}">
        ${getCategoryIcon(cat)} ${cat}
      </button>
    `).join('');

    container.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        applyFilters();
      });
    });
  }

  function getCategoryIcon(cat) {
    const icons = { All: '🌐', Defence: '⚔️', Geopolitics: '🌍', Technology: '🔬', 'Foreign Policy': '🤝' };
    return icons[cat] || '📌';
  }

  function applyFilters() {
    let results = allNews;

    // Category filter
    if (activeCategory !== 'All') {
      results = results.filter(n => n.category === activeCategory);
    }

    // Search query filter
    if (searchQuery) {
      results = results.filter(n =>
        n.title.toLowerCase().includes(searchQuery) ||
        n.summary.toLowerCase().includes(searchQuery) ||
        n.content.toLowerCase().includes(searchQuery) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(searchQuery)))
      );
    }

    renderFilteredNews(results);
    updateResultCount(results.length);
  }

  function renderFilteredNews(results) {
    const container = document.getElementById('news-container');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No Results Found</h3>
          <p>Try a different keyword or category.</p>
        </div>`;
      return;
    }

    // Use main.js renderer if available
    if (typeof App !== 'undefined' && App.renderNewsCards) {
      App.renderNewsCards(results, container);
    }
  }

  function updateResultCount(count) {
    const el = document.getElementById('result-count');
    if (el) el.textContent = `${count} article${count !== 1 ? 's' : ''} found`;
  }

  function searchVocab(query) {
    if (!query) return allVocab;
    const q = query.toLowerCase();
    return allVocab.filter(v =>
      v.word.toLowerCase().includes(q) ||
      v.definition.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  }

  return { init, applyFilters, searchVocab };
})();
