// ============================================================
// bookmark.js — News Bookmark System
// ============================================================

const BookmarkManager = (() => {
  const KEY = 'ssb_bookmarks';

  function getAll() {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  }

  function isBookmarked(id) {
    return getAll().includes(id);
  }

  function toggle(id, newsItem) {
    let bookmarks = getAll();
    let savedItems = getSavedItems();

    if (bookmarks.includes(id)) {
      bookmarks = bookmarks.filter(b => b !== id);
      savedItems = savedItems.filter(item => item.id !== id);
      showToast('Bookmark removed', '🗑️');
    } else {
      bookmarks.push(id);
      savedItems.push(newsItem);
      showToast('Article saved!', '🔖');

      // Badge check
      if (typeof BadgeManager !== 'undefined' && bookmarks.length >= 5) {
        BadgeManager.unlock('bookmarks_5');
      }
    }

    localStorage.setItem(KEY, JSON.stringify(bookmarks));
    localStorage.setItem('ssb_saved_items', JSON.stringify(savedItems));

    // Update all bookmark buttons for this ID
    document.querySelectorAll(`[data-bookmark="${id}"]`).forEach(btn => {
      btn.classList.toggle('bookmarked', bookmarks.includes(id));
      btn.title = bookmarks.includes(id) ? 'Remove bookmark' : 'Save article';
    });
  }

  function getSavedItems() {
    return JSON.parse(localStorage.getItem('ssb_saved_items')) || [];
  }

  function renderSavedSection() {
    const container = document.getElementById('bookmarks-container');
    if (!container) return;

    const items = getSavedItems();
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔖</div>
          <h3>No Saved Articles</h3>
          <p>Click the bookmark icon on any article to save it here.</p>
        </div>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="news-card saved-card" data-id="${item.id}">
        <div class="card-emoji">${item.image || '📰'}</div>
        <div class="card-body">
          <span class="card-category">${item.category}</span>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-summary">${item.summary}</p>
          <div class="card-footer">
            <span class="card-date">📅 ${formatDate(item.date)}</span>
            <button class="btn-remove-bookmark" onclick="BookmarkManager.toggle(${item.id}, ${JSON.stringify(item).replace(/"/g, '&quot;')}); BookmarkManager.renderSavedSection();">
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function showToast(message, icon) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>${icon}</span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  return { toggle, isBookmarked, getAll, getSavedItems, renderSavedSection };
})();
