// ============================================================
// suggestion.js — User Suggestion System
// ============================================================

const SuggestionManager = (() => {
  const KEY = 'ssb_suggestions';

  function save(type, text, refId) {
    if (!text || text.trim().length < 3) {
      showToast('Please enter a valid suggestion.', '⚠️');
      return false;
    }

    const suggestions = getAll();
    suggestions.push({
      id: Date.now(),
      type: type || 'General',
      text: text.trim(),
      refId: refId || null,
      date: new Date().toLocaleDateString('en-IN'),
      reviewed: false
    });

    localStorage.setItem(KEY, JSON.stringify(suggestions));
    showToast('Suggestion submitted! Thank you.', '💬');
    return true;
  }

  function getAll() {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  }

  function renderSuggestionForm(type, refId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="suggestion-form">
        <textarea id="suggestion-text-${refId}" class="suggestion-textarea"
          placeholder="Have a suggestion or correction? Share it here..."></textarea>
        <button class="btn-suggestion" onclick="SuggestionManager.submitFromForm('${type}', '${refId}')">
          📤 Submit Suggestion
        </button>
      </div>
    `;
  }

  function submitFromForm(type, refId) {
    const input = document.getElementById(`suggestion-text-${refId}`);
    if (!input) return;

    const success = save(type, input.value, refId);
    if (success) {
      input.value = '';
      input.placeholder = '✅ Suggestion submitted! Thank you.';
      setTimeout(() => { input.placeholder = 'Have a suggestion or correction? Share it here...'; }, 3000);
    }
  }

  function showToast(msg, icon) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `${icon} ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 400); }, 2500);
  }

  return { save, getAll, renderSuggestionForm, submitFromForm };
})();
