// ============================================================
// share.js — Social Sharing System
// ============================================================

const ShareManager = (() => {
  function share(title, text, url) {
    url = url || window.location.href;

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => showShareModal(title, text, url));
    } else {
      showShareModal(title, text, url);
    }
  }

  function shareNews(newsItem) {
    const title = `📰 ${newsItem.title}`;
    const text = `${newsItem.summary}\n\n[Via SSB Prep App]`;
    const url = window.location.href;
    share(title, text, url);
  }

  function showShareModal(title, text, url) {
    const existing = document.getElementById('share-modal');
    if (existing) existing.remove();

    const encoded = encodeURIComponent(`${title}\n\n${text}\n${url}`);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const modal = document.createElement('div');
    modal.id = 'share-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content share-modal-content">
        <div class="modal-header">
          <h3>📤 Share Article</h3>
          <button class="modal-close" onclick="document.getElementById('share-modal').remove()">✕</button>
        </div>
        <p class="share-title">${title}</p>
        <div class="share-options">
          <a href="https://wa.me/?text=${encoded}" target="_blank" class="share-btn share-whatsapp">
            <span class="share-icon">💬</span> WhatsApp
          </a>
          <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}" target="_blank" class="share-btn share-telegram">
            <span class="share-icon">✈️</span> Telegram
          </a>
          <a href="https://twitter.com/intent/tweet?text=${encoded}" target="_blank" class="share-btn share-twitter">
            <span class="share-icon">🐦</span> Twitter / X
          </a>
          <button class="share-btn share-copy" onclick="ShareManager.copyLink('${url}')">
            <span class="share-icon">🔗</span> Copy Link
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('modal-open'), 10);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  function copyLink(url) {
    url = url || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showCopyConfirm());
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showCopyConfirm();
    }
  }

  function showCopyConfirm() {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = '🔗 Link copied to clipboard!';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 400); }, 2500);

    const modal = document.getElementById('share-modal');
    if (modal) setTimeout(() => modal.remove(), 1000);
  }

  return { share, shareNews, copyLink, showShareModal };
})();
