// ============================================================
// quiz.js — Topic-wise MCQ Quiz System (NDA/CDS/AFCAT/CAPF)
// ============================================================

const QuizManager = (() => {
  const KEY_PROGRESS = 'ssb_quiz_progress';
  const KEY_HISTORY  = 'ssb_quiz_history';

  let allQuestions   = [];
  let activeSubject  = 'All';
  let activeExam     = 'All';
  let sessionPool    = [];
  let currentIdx     = 0;
  let sessionScore   = 0;
  let sessionTotal   = 0;
  let answered       = {};   // { questionId: selectedOptionIndex }
  let quizStarted    = false;

  const SUBJECTS = ['All','History','Geography','Polity','General Science',
                    'Mathematics','English','General Knowledge','Economics',
                    'Physics','Chemistry','Biology'];
  const EXAMS    = ['All','NDA','CDS','AFCAT','CAPF'];

  // ─── INIT ───────────────────────────────────────────────
  function init(qs) {
    allQuestions = qs;
    loadHistory();
    renderSubjectSelector();
    renderRandomQuestion();   // show one card immediately
  }

  function loadHistory() {
    answered = JSON.parse(localStorage.getItem(KEY_HISTORY)) || {};
  }
  function saveHistory() {
    localStorage.setItem(KEY_HISTORY, JSON.stringify(answered));
  }

  // ─── SUBJECT / EXAM SELECTOR ────────────────────────────
  function renderSubjectSelector() {
    const wrap = document.getElementById('quiz-filter-bar');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="quiz-filter-group">
        <label class="quiz-filter-label">
          <i data-lucide="layers" style="width:13px;height:13px;"></i> Subject
        </label>
        <div class="quiz-chips" id="subject-chips">
          ${SUBJECTS.map(s => `
            <button class="filter-chip ${s==='All'?'active':''}"
              onclick="QuizManager.setSubject('${s}',this)">${s}</button>
          `).join('')}
        </div>
      </div>
      <div class="quiz-filter-group" style="margin-top:0.75rem;">
        <label class="quiz-filter-label">
          <i data-lucide="award" style="width:13px;height:13px;"></i> Exam
        </label>
        <div class="quiz-chips" id="exam-chips">
          ${EXAMS.map(e => `
            <button class="filter-chip ${e==='All'?'active':''}"
              onclick="QuizManager.setExam('${e}',this)">${e}</button>
          `).join('')}
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function setSubject(s, btn) {
    activeSubject = s;
    document.querySelectorAll('#subject-chips .filter-chip')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function setExam(e, btn) {
    activeExam = e;
    document.querySelectorAll('#exam-chips .filter-chip')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // ─── FILTER POOL ────────────────────────────────────────
  function getFilteredPool() {
    return allQuestions.filter(q => {
      const subjOk = activeSubject === 'All' || q.subject === activeSubject;
      const examOk = activeExam   === 'All' || (q.exam && q.exam.includes(activeExam));
      return subjOk && examOk;
    });
  }

  // ─── START QUIZ ─────────────────────────────────────────
  function startQuiz() {
    sessionPool  = shuffle(getFilteredPool());
    currentIdx   = 0;
    sessionScore = 0;
    sessionTotal = 0;
    quizStarted  = true;

    if (!sessionPool.length) {
      const c = document.getElementById('quiz-container');
      if (c) c.innerHTML = `
        <div class="empty-state">
          <i data-lucide="search-x" class="empty-icon-svg"></i>
          <h3>No Questions Found</h3>
          <p>Try selecting a different subject or exam filter.</p>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }
    renderQuestion();
  }

  // ─── RENDER SINGLE MCQ QUESTION ─────────────────────────
  function renderQuestion() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    if (currentIdx >= sessionPool.length) { showSessionSummary(); return; }

    const q        = sessionPool[currentIdx];
    const total    = sessionPool.length;
    const pct      = Math.round((currentIdx / total) * 100);
    const prevAns  = answered[q.id];
    const isDone   = prevAns !== undefined;

    container.innerHTML = `
      <div class="mcq-header">
        <div class="mcq-meta">
          <span class="mcq-subject-badge">${q.subject}</span>
          <span class="mcq-topic">${q.topic}</span>
          <span class="mcq-exam-tags">${(q.exam||[]).map(e=>`<span class="exam-tag">${e}</span>`).join('')}</span>
        </div>
        <div class="mcq-counter">
          <span class="mcq-num">${currentIdx+1}<span style="color:var(--text-muted)">/${total}</span></span>
          <span class="mcq-score-live">
            <i data-lucide="check-circle" style="width:13px;height:13px;color:var(--accent-olive-bright);"></i>
            ${sessionScore}/${sessionTotal}
          </span>
        </div>
      </div>

      <div class="mcq-progress-bar">
        <div class="mcq-progress-fill" style="width:${pct}%"></div>
      </div>

      <div class="mcq-card">
        <div class="mcq-difficulty diff-${(q.difficulty||'Medium').toLowerCase()}">
          <i data-lucide="signal" style="width:12px;height:12px;"></i>
          ${q.difficulty||'Medium'}
        </div>
        <h3 class="mcq-question">${currentIdx+1}. ${q.question}</h3>

        <div class="mcq-options" id="mcq-options">
          ${q.options.map((opt, i) => `
            <button
              class="mcq-option ${isDone ? getOptionClass(i, q.correct, prevAns) : ''}"
              onclick="QuizManager.selectOption(${i})"
              ${isDone ? 'disabled' : ''}>
              <span class="option-letter">${['A','B','C','D'][i]}</span>
              <span class="option-text">${opt}</span>
              ${isDone && i === q.correct
                ? '<i data-lucide="check" class="option-icon correct-icon"></i>'
                : isDone && i === prevAns && prevAns !== q.correct
                  ? '<i data-lucide="x" class="option-icon wrong-icon"></i>'
                  : ''}
            </button>
          `).join('')}
        </div>

        <div class="mcq-explanation ${isDone?'':'hidden'}" id="mcq-explanation">
          <div class="explanation-header">
            <i data-lucide="info" style="width:15px;height:15px;color:var(--accent-blue-light);"></i>
            <strong>Explanation</strong>
          </div>
          <p>${q.explanation}</p>
        </div>
      </div>

      <div class="mcq-nav">
        <button class="btn-sm btn-outline" onclick="QuizManager.prevQuestion()"
          ${currentIdx===0?'disabled':''}>
          <i data-lucide="arrow-left" class="btn-icon"></i> Previous
        </button>
        ${isDone
          ? `<button class="btn-primary" onclick="QuizManager.nextQuestion()">
               Next <i data-lucide="arrow-right" class="btn-icon"></i>
             </button>`
          : `<button class="btn-sm btn-outline" onclick="QuizManager.skipQuestion()">
               Skip <i data-lucide="skip-forward" class="btn-icon"></i>
             </button>`
        }
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function getOptionClass(idx, correct, selected) {
    if (idx === correct)               return 'correct';
    if (idx === selected && idx !== correct) return 'wrong';
    return 'faded';
  }

  // ─── SELECT OPTION ──────────────────────────────────────
  function selectOption(idx) {
    const q = sessionPool[currentIdx];
    if (answered[q.id] !== undefined) return;   // already answered

    answered[q.id] = idx;
    sessionTotal++;
    const isCorrect = idx === q.correct;
    if (isCorrect) sessionScore++;
    saveHistory();

    // Progress tracking
    if (typeof ProgressManager !== 'undefined') ProgressManager.recordQuizAttempt(isCorrect);

    // Badge checks
    if (typeof BadgeManager !== 'undefined') {
      if (Object.keys(answered).length === 1) BadgeManager.unlock('first_quiz');
      if (Object.keys(answered).length >= 10) BadgeManager.unlock('quiz_10');
      if (sessionScore >= 5)                  BadgeManager.unlock('quiz_score_5');
    }

    // Re-render to show result
    renderQuestion();
  }

  function nextQuestion() {
    if (currentIdx < sessionPool.length - 1) { currentIdx++; renderQuestion(); }
    else showSessionSummary();
  }

  function prevQuestion() {
    if (currentIdx > 0) { currentIdx--; renderQuestion(); }
  }

  function skipQuestion() {
    if (currentIdx < sessionPool.length - 1) { currentIdx++; renderQuestion(); }
    else showSessionSummary();
  }

  // ─── SESSION SUMMARY ────────────────────────────────────
  function showSessionSummary() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const pct   = sessionTotal > 0 ? Math.round((sessionScore/sessionTotal)*100) : 0;
    const grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '🎯 Good effort' : '📚 Keep practising';
    const clr   = pct >= 80 ? 'var(--accent-olive-bright)' : pct >= 60 ? 'var(--accent-gold)' : '#e74c3c';

    container.innerHTML = `
      <div class="quiz-summary">
        <div class="summary-circle" style="border-color:${clr}">
          <span class="summary-pct" style="color:${clr}">${pct}%</span>
          <span class="summary-label">Score</span>
        </div>
        <h2 class="summary-grade">${grade}</h2>
        <div class="summary-stats">
          <div class="summary-stat">
            <i data-lucide="check-circle" style="width:18px;height:18px;color:var(--accent-olive-bright);"></i>
            <span>${sessionScore} Correct</span>
          </div>
          <div class="summary-stat">
            <i data-lucide="x-circle" style="width:18px;height:18px;color:#e74c3c;"></i>
            <span>${sessionTotal-sessionScore} Wrong</span>
          </div>
          <div class="summary-stat">
            <i data-lucide="skip-forward" style="width:18px;height:18px;color:var(--text-muted);"></i>
            <span>${sessionPool.length-sessionTotal} Skipped</span>
          </div>
        </div>
        <div class="summary-actions">
          <button class="btn-primary" onclick="QuizManager.startQuiz()">
            <i data-lucide="refresh-cw" class="btn-icon"></i> Retry Same Filters
          </button>
          <button class="btn-sm btn-outline" onclick="QuizManager.resetHistory()">
            <i data-lucide="trash-2" class="btn-icon"></i> Reset All Progress
          </button>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function resetHistory() {
    if (!confirm('Reset all quiz progress? This cannot be undone.')) return;
    answered = {};
    saveHistory();
    sessionScore = 0;
    sessionTotal = 0;
    startQuiz();
  }

  // ─── RANDOM QUESTION ────────────────────────────────────
  function renderRandomQuestion() {
    const btn = document.getElementById('random-question-btn');
    if (btn) btn.addEventListener('click', showRandomQuestion);
  }

  function showRandomQuestion() {
    if (!allQuestions.length) return;
    const pool = getFilteredPool();
    const q = pool[Math.floor(Math.random() * pool.length)];
    const container = document.getElementById('random-question-display');
    if (!container || !q) return;

    container.innerHTML = `
      <div class="rq-card">
        <div class="rq-meta">
          <span class="mcq-subject-badge">${q.subject}</span>
          <span class="mcq-topic">${q.topic}</span>
          <span class="mcq-difficulty diff-${(q.difficulty||'Medium').toLowerCase()}">
            ${q.difficulty}
          </span>
        </div>
        <h3 class="rq-question">${q.question}</h3>
        <div class="rq-options" id="rq-opts">
          ${q.options.map((o,i) => `
            <button class="mcq-option" onclick="QuizManager.selectRQOption(this,${i},${q.correct},'rq-opts','rq-exp')">
              <span class="option-letter">${['A','B','C','D'][i]}</span>
              <span class="option-text">${o}</span>
            </button>
          `).join('')}
        </div>
        <div class="mcq-explanation hidden" id="rq-exp">
          <div class="explanation-header">
            <i data-lucide="info" style="width:15px;height:15px;color:var(--accent-blue-light);"></i>
            <strong>Explanation</strong>
          </div>
          <p>${q.explanation}</p>
        </div>
        <div class="rq-footer">
          ${(q.exam||[]).map(e=>`<span class="exam-tag">${e}</span>`).join('')}
        </div>
      </div>
    `;
    container.classList.add('pop-in');
    setTimeout(() => container.classList.remove('pop-in'), 400);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function selectRQOption(btn, idx, correct, optsId, expId) {
    const opts = document.getElementById(optsId);
    const exp  = document.getElementById(expId);
    if (!opts || opts.dataset.answered) return;
    opts.dataset.answered = '1';

    opts.querySelectorAll('.mcq-option').forEach((b, i) => {
      b.disabled = true;
      if (i === correct)                    b.classList.add('correct');
      else if (i === idx && idx !== correct) b.classList.add('wrong');
      else                                  b.classList.add('faded');
    });
    if (exp) exp.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── HELPERS ────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  function getStats() {
    return {
      total: allQuestions.length,
      attempted: Object.keys(answered).length,
      score: Object.values(answered).length   // approximate
    };
  }

  return {
    init, startQuiz, renderRandomQuestion, showRandomQuestion,
    setSubject, setExam, selectOption, nextQuestion, prevQuestion,
    skipQuestion, resetHistory, selectRQOption, getStats
  };
})();

