// ============================================================
// quiz.js — Quiz & Random Question System
// ============================================================

const QuizManager = (() => {
  const KEY_PROGRESS = 'ssb_quiz_progress';
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let answered = [];
  let quizActive = false;
  let randomQuestionPool = [];

  function init(qs) {
    questions = qs;
    randomQuestionPool = [...qs];
    loadProgress();
    setupRandomQuestion();
  }

  function loadProgress() {
    const saved = JSON.parse(localStorage.getItem(KEY_PROGRESS)) || {};
    answered = saved.answered || [];
    score = saved.score || 0;
  }

  function saveProgress() {
    localStorage.setItem(KEY_PROGRESS, JSON.stringify({ answered, score }));
  }

  function startQuiz() {
    const unanswered = questions.filter(q => !answered.includes(q.id));
    if (unanswered.length === 0) {
      // All done — offer reset
      showQuizComplete();
      return;
    }

    quizActive = true;
    currentIndex = 0;
    renderQuestion(unanswered, currentIndex);
  }

  function renderQuestion(pool, idx) {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    if (idx >= pool.length) {
      showQuizComplete();
      return;
    }

    const q = pool[idx];
    const total = pool.length;
    const progress = Math.round((idx / total) * 100);

    container.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-progress-text">Question ${idx + 1} of ${total}</span>
        <span class="quiz-score">✅ ${score} correct</span>
      </div>
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="quiz-card">
        <div class="quiz-category-badge">${q.category}</div>
        <h3 class="quiz-question">${q.question}</h3>
        <div class="quiz-hints">
          <button class="btn-hint" onclick="QuizManager.toggleHints(this)">💡 Show Hints</button>
          <ul class="hint-list hidden">
            ${q.hints.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
        <div class="quiz-answer hidden" id="quiz-answer-box">
          <h4>📋 Sample Answer:</h4>
          <p>${q.sampleAnswer}</p>
        </div>
        <div class="quiz-actions">
          <button class="btn-show-answer" onclick="QuizManager.showAnswer()">👁️ Show Answer</button>
          <div class="quiz-verdict hidden" id="quiz-verdict">
            <p>How did you do?</p>
            <div class="verdict-buttons">
              <button class="btn-correct" onclick="QuizManager.recordAnswer(${q.id}, true, this)">✅ Got it right</button>
              <button class="btn-incorrect" onclick="QuizManager.recordAnswer(${q.id}, false, this)">❌ Need more practice</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Store current pool for navigation
    container.dataset.pool = JSON.stringify(pool);
    container.dataset.idx = idx;
  }

  function showAnswer() {
    const answerBox = document.getElementById('quiz-answer-box');
    const verdict = document.getElementById('quiz-verdict');
    const showBtn = document.querySelector('.btn-show-answer');
    if (answerBox) answerBox.classList.remove('hidden');
    if (verdict) verdict.classList.remove('hidden');
    if (showBtn) showBtn.style.display = 'none';
  }

  function toggleHints(btn) {
    const list = btn.nextElementSibling;
    if (list) {
      list.classList.toggle('hidden');
      btn.textContent = list.classList.contains('hidden') ? '💡 Show Hints' : '🙈 Hide Hints';
    }
  }

  function recordAnswer(id, correct, btn) {
    if (!answered.includes(id)) {
      answered.push(id);
      if (correct) score++;
      saveProgress();

      // Progress tracking
      if (typeof ProgressManager !== 'undefined') {
        ProgressManager.recordQuizAttempt(correct);
      }

      // Badge checks
      if (typeof BadgeManager !== 'undefined') {
        if (answered.length === 1) BadgeManager.unlock('first_quiz');
        if (answered.length >= 10) BadgeManager.unlock('quiz_10');
        if (score >= 5) BadgeManager.unlock('quiz_score_5');
      }
    }

    // Move to next
    const container = document.getElementById('quiz-container');
    const pool = JSON.parse(container.dataset.pool || '[]');
    const idx = parseInt(container.dataset.idx || 0);
    const nextUnanswered = pool.filter(q => !answered.includes(q.id));

    setTimeout(() => renderQuestion(nextUnanswered, 0), 500);
  }

  function showQuizComplete() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const total = questions.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    container.innerHTML = `
      <div class="quiz-complete">
        <div class="quiz-complete-icon">${pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '📚'}</div>
        <h2>Quiz Complete!</h2>
        <p class="quiz-score-final">You scored <strong>${score}/${total}</strong> (${pct}%)</p>
        <p>${pct >= 80 ? 'Outstanding! You\'re SSB ready!' : pct >= 50 ? 'Good effort! Keep practising.' : 'Keep going, consistency is key!'}</p>
        <button class="btn-primary" onclick="QuizManager.resetQuiz()">🔄 Restart Quiz</button>
      </div>
    `;
  }

  function resetQuiz() {
    answered = [];
    score = 0;
    saveProgress();
    startQuiz();
  }

  // ---- Random Question Generator ----
  function setupRandomQuestion() {
    const btn = document.getElementById('random-question-btn');
    if (btn) btn.addEventListener('click', showRandomQuestion);
  }

  function showRandomQuestion() {
    if (!questions.length) return;
    const q = questions[Math.floor(Math.random() * questions.length)];
    const container = document.getElementById('random-question-display');
    if (!container) return;

    container.innerHTML = `
      <div class="random-question-card">
        <div class="rq-category">${q.category}</div>
        <h3>${q.question}</h3>
        <div class="rq-hints hidden" id="rq-hints">
          <strong>Hints:</strong>
          <ul>${q.hints.map(h => `<li>${h}</li>`).join('')}</ul>
        </div>
        <div class="rq-answer hidden" id="rq-answer">
          <strong>Sample Answer:</strong>
          <p>${q.sampleAnswer}</p>
        </div>
        <div class="rq-actions">
          <button class="btn-sm" onclick="document.getElementById('rq-hints').classList.toggle('hidden')">💡 Hints</button>
          <button class="btn-sm btn-primary" onclick="document.getElementById('rq-answer').classList.toggle('hidden')">📖 Answer</button>
        </div>
      </div>
    `;
    container.classList.add('pop-in');
    setTimeout(() => container.classList.remove('pop-in'), 400);
  }

  function getStats() {
    return { total: questions.length, attempted: answered.length, score };
  }

  return { init, startQuiz, showAnswer, toggleHints, recordAnswer, resetQuiz, showRandomQuestion, getStats };
})();
