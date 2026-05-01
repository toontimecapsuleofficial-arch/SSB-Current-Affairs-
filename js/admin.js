// ============================================================
// admin.js — Admin Panel (Passcode Protected)
// ============================================================

const AdminManager = (() => {
  const PASSCODE = 'ssb2024'; // Change this
  const KEY_CUSTOM_NEWS = 'ssb_admin_news';
  const KEY_CUSTOM_VOCAB = 'ssb_admin_vocab';
  const KEY_AUTH = 'ssb_admin_auth';
  let isAuthenticated = false;

  function init() {
    isAuthenticated = sessionStorage.getItem(KEY_AUTH) === 'true';
    setupAdminButton();
  }

  function setupAdminButton() {
    const btn = document.getElementById('admin-btn');
    if (btn) btn.addEventListener('click', openAdminPanel);
  }

  function openAdminPanel() {
    if (!isAuthenticated) {
      showLoginPrompt();
      return;
    }
    renderAdminPanel();
  }

  function showLoginPrompt() {
    const modal = createModal('admin-modal', `
      <div class="modal-header">
        <h3>🔐 Admin Access</h3>
        <button class="modal-close" onclick="document.getElementById('admin-modal').remove()">✕</button>
      </div>
      <div class="admin-login">
        <p>Enter admin passcode to continue:</p>
        <input type="password" id="admin-passcode" class="admin-input" placeholder="Enter passcode..." autocomplete="off">
        <button class="btn-primary" onclick="AdminManager.verifyPasscode()">🔓 Unlock</button>
        <p class="admin-hint">Hint: Default is ssb2024</p>
      </div>
    `);

    document.getElementById('admin-passcode').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') AdminManager.verifyPasscode();
    });
    setTimeout(() => document.getElementById('admin-passcode').focus(), 100);
  }

  function verifyPasscode() {
    const input = document.getElementById('admin-passcode');
    if (!input) return;

    if (input.value === PASSCODE) {
      isAuthenticated = true;
      sessionStorage.setItem(KEY_AUTH, 'true');
      const modal = document.getElementById('admin-modal');
      if (modal) modal.remove();
      renderAdminPanel();
    } else {
      input.classList.add('shake');
      input.value = '';
      input.placeholder = 'Wrong passcode. Try again.';
      setTimeout(() => { input.classList.remove('shake'); input.placeholder = 'Enter passcode...'; }, 1000);
    }
  }

  function renderAdminPanel() {
    const customNews = getCustomNews();
    const suggestions = getSuggestions();
    const unreviewed = suggestions.filter(s => !s.reviewed).length;

    const modal = createModal('admin-modal', `
      <div class="modal-header">
        <h3>⚙️ Admin Panel</h3>
        <button class="modal-close" onclick="document.getElementById('admin-modal').remove()">✕</button>
      </div>
      <div class="admin-tabs">
        <button class="admin-tab active" onclick="AdminManager.switchTab('news', this)">📰 News (${customNews.length})</button>
        <button class="admin-tab" onclick="AdminManager.switchTab('suggestions', this)">💬 Suggestions ${unreviewed > 0 ? `<span class="badge-count">${unreviewed}</span>` : ''}</button>
        <button class="admin-tab" onclick="AdminManager.switchTab('add', this)">➕ Add Content</button>
      </div>
      <div id="admin-tab-content">
        ${renderNewsTab(customNews)}
      </div>
    `, true);
  }

  function switchTab(tab, btn) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const content = document.getElementById('admin-tab-content');
    if (!content) return;

    if (tab === 'news') content.innerHTML = renderNewsTab(getCustomNews());
    else if (tab === 'suggestions') content.innerHTML = renderSuggestionsTab();
    else if (tab === 'add') content.innerHTML = renderAddTab();
  }

  function renderNewsTab(news) {
    if (!news.length) return '<p class="admin-empty">No custom news added yet. Use the Add tab to add content.</p>';
    return `<div class="admin-list">
      ${news.map(n => `
        <div class="admin-item" id="admin-news-${n.id}">
          <div class="admin-item-info">
            <strong>${n.title}</strong>
            <span class="admin-item-meta">${n.category} • ${n.date}</span>
          </div>
          <div class="admin-item-actions">
            <button class="btn-sm btn-danger" onclick="AdminManager.deleteNews(${n.id})">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  function renderAddTab() {
    return `
      <div class="admin-form">
        <h4>Add News Article</h4>
        <input class="admin-input" id="a-title" placeholder="Title *" />
        <input class="admin-input" id="a-category" placeholder="Category (Defence, Geopolitics...)" />
        <input class="admin-input" id="a-date" type="date" />
        <textarea class="admin-input" id="a-summary" placeholder="Summary *" rows="2"></textarea>
        <textarea class="admin-input" id="a-content" placeholder="Full content *" rows="4"></textarea>
        <input class="admin-input" id="a-tags" placeholder="Tags (comma separated)" />
        <button class="btn-primary" onclick="AdminManager.addNews()">➕ Add Article</button>
      </div>
    `;
  }

  function renderSuggestionsTab() {
    const suggestions = getSuggestions();
    if (!suggestions.length) return '<p class="admin-empty">No suggestions yet.</p>';
    return `<div class="admin-list">
      ${suggestions.map(s => `
        <div class="admin-item ${s.reviewed ? 'reviewed' : ''}">
          <div class="admin-item-info">
            <span class="admin-suggestion-type">${s.type}</span>
            <p>${s.text}</p>
            <span class="admin-item-meta">${s.date}</span>
          </div>
          <div class="admin-item-actions">
            ${!s.reviewed ? `<button class="btn-sm btn-success" onclick="AdminManager.markReviewed(${s.id})">✅</button>` : '<span class="reviewed-label">✅ Done</span>'}
            <button class="btn-sm btn-danger" onclick="AdminManager.deleteSuggestion(${s.id})">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  function addNews() {
    const title = document.getElementById('a-title')?.value.trim();
    const summary = document.getElementById('a-summary')?.value.trim();
    const content = document.getElementById('a-content')?.value.trim();
    if (!title || !summary) { alert('Title and Summary are required.'); return; }

    const news = getCustomNews();
    const newItem = {
      id: Date.now(),
      title,
      summary,
      content: content || summary,
      category: document.getElementById('a-category')?.value.trim() || 'General',
      date: document.getElementById('a-date')?.value || new Date().toISOString().split('T')[0],
      tags: (document.getElementById('a-tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
      image: '📄',
      isCustom: true
    };

    news.unshift(newItem);
    localStorage.setItem(KEY_CUSTOM_NEWS, JSON.stringify(news));
    showToast('Article added!', '✅');

    // Refresh news display
    if (typeof App !== 'undefined') App.refreshNews();
    switchTab('news', document.querySelector('.admin-tab'));
  }

  function deleteNews(id) {
    if (!confirm('Delete this article?')) return;
    const news = getCustomNews().filter(n => n.id !== id);
    localStorage.setItem(KEY_CUSTOM_NEWS, JSON.stringify(news));
    if (typeof App !== 'undefined') App.refreshNews();
    renderAdminPanel();
  }

  function getSuggestions() {
    return JSON.parse(localStorage.getItem('ssb_suggestions')) || [];
  }

  function markReviewed(id) {
    const suggestions = getSuggestions().map(s => s.id === id ? { ...s, reviewed: true } : s);
    localStorage.setItem('ssb_suggestions', JSON.stringify(suggestions));
    switchTab('suggestions', document.querySelector('.admin-tab.active'));
  }

  function deleteSuggestion(id) {
    const suggestions = getSuggestions().filter(s => s.id !== id);
    localStorage.setItem('ssb_suggestions', JSON.stringify(suggestions));
    switchTab('suggestions', document.querySelector('.admin-tab.active'));
  }

  function getCustomNews() {
    return JSON.parse(localStorage.getItem(KEY_CUSTOM_NEWS)) || [];
  }

  function createModal(id, content, wide = false) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal-content ${wide ? 'modal-wide' : ''}">${content}</div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('modal-open'), 10);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    return modal;
  }

  function showToast(msg, icon) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `${icon} ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 400); }, 2500);
  }

  return { init, openAdminPanel, verifyPasscode, switchTab, addNews, deleteNews, markReviewed, deleteSuggestion, getCustomNews };
})();
