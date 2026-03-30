/* ============================================================
   ENGINE.JS — Core game engine
   Handles: state, audio, timer, screen routing, scoring, UI.
   Levels register themselves via Engine.registerLevel(levelDef).

   Level interface (what each levels/*.js must export):
   {
     id:         String,          // unique id, e.g. 'math'
     name:       String,          // display name, e.g. '🚀 Matemáticas'
     nextLevelId: String|null,    // id of next level, or null
     winTitle:   String,          // HTML for result title on win
     loseTitle:  String,          // HTML for result title on loss
     winMessage: String,          // motivator text on win
     levelIntroMessage: String,   // shown on level-complete transition screen
     answerClass: String,         // CSS class for answer buttons (default 'ans-btn')

     mount():       void,   // called once on register — inject CSS (via <style> tag)
     applyTheme():  void,   // set bg on #screen-game / #screen-midpoint / #screen-result
                            // AND populate #game-sidebar with progress widget HTML
     buildDots():   void,   // add step-dot elements to the sidebar
     setProgress(qNum, total): void,  // update progress widget
     renderCard(q, idx): void,        // fill #q-content with question HTML
     onResult(won, score): void,      // inject win/lose animation into #result-level-extra
   }
============================================================ */

'use strict';

const Engine = (() => {

  /* ---------- CONSTANTS ---------- */
  const TOTAL_Q  = 10;
  const MAX_TIME = 30;
  const CIRCUM   = 2 * Math.PI * 24.5; // ≈153.94

  const CORRECT_FB = ['¡Genial! 🌟','¡Excelente! ⭐','¡Perfecto! 🎉','¡Increíble! 🚀','¡Muy bien! ✨'];
  const WRONG_FB   = ['¡Casi! 😅','¡Inténtalo! 💪','¡Tú puedes! 🌈'];
  const MOTIVATORS = [
    '¡Cada intento te hace más inteligente! 🧠',
    '¡Los campeones no se rinden! 💪',
    '¡Practica un poco más y lo lograrás! 🌈',
    '¡Eres increíble, sigue intentándolo! 🚀',
    '¡Los errores nos enseñan! ¡Vuelve a intentarlo! ⭐',
  ];

  /* ---------- STATE ---------- */
  const state = {
    currentQ:   0,
    questions:  [],
    totalScore: 0,
    correctAns: 0,
    timerID:    null,
    timeLeft:   MAX_TIME,
    answered:   false,
    totalStars:   0,
    level:        null,   // active Level object
    playerName:   '',
    playlist:       [],   // shuffled level id array for current run
    playlistIdx:    0,    // current position in playlist
    grandTotalScore: 0,   // accumulated score across all levels in current run
  };

  /* ---------- LEVEL REGISTRY ---------- */
  const _levels = {};

  function registerLevel(lvDef) {
    _levels[lvDef.id] = lvDef;
    lvDef.mount(); // inject CSS once
  }

  /* ---------- BACKGROUND MUSIC ---------- */
  const _bgMusic = new Audio('src/bg-music.mp3');
  _bgMusic.loop   = true;
  _bgMusic.volume = 0.18;
  let _bgStarted  = false;

  function _startBgMusic() {
    if (_bgStarted) return;
    _bgStarted = true;
    _bgMusic.play().catch(() => {});
  }

  // Trigger on first user interaction to satisfy browser autoplay policy
  ['click','keydown','touchstart'].forEach(ev =>
    document.addEventListener(ev, _startBgMusic, { once: true, passive: true })
  );

  /* ---------- WEB AUDIO ---------- */
  let _actx = null;
  const actx = () => _actx || (_actx = new (window.AudioContext || window.webkitAudioContext)());

  function _tone(freq, type, t, dur, vol = .28) {
    try {
      const c = actx(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.start(t); o.stop(t + dur);
    } catch(e) {}
  }

  function playCorrect() {
    const t = actx().currentTime;
    [[523.25,0],[659.25,.14],[783.99,.28]].forEach(([f,d]) => _tone(f,'sine',t+d,.3));
  }
  function playWrong() {
    const t=actx().currentTime, c=actx(), o=c.createOscillator(), g=c.createGain();
    o.connect(g); g.connect(c.destination); o.type='sawtooth';
    o.frequency.setValueAtTime(210,t); o.frequency.exponentialRampToValueAtTime(90,t+.35);
    g.gain.setValueAtTime(.22,t); g.gain.exponentialRampToValueAtTime(.001,t+.4);
    o.start(t); o.stop(t+.4);
  }
  function playLaunch() {
    const t=actx().currentTime, c=actx(), o=c.createOscillator(), g=c.createGain();
    o.connect(g); g.connect(c.destination); o.type='sawtooth';
    o.frequency.setValueAtTime(80,t); o.frequency.linearRampToValueAtTime(450,t+2.5);
    g.gain.setValueAtTime(.25,t); g.gain.exponentialRampToValueAtTime(.001,t+2.5);
    o.start(t); o.stop(t+2.5);
  }
  function playStars() {
    const t = actx().currentTime;
    [[1046.5,0],[1318.5,.28],[1567.98,.56]].forEach(([f,d]) => _tone(f,'sine',t+d,.35,.2));
  }

  /* ---------- UTILS (exposed so levels can use them) ---------- */
  const el   = id  => document.getElementById(id);
  const rnd  = (a,b) => Math.random()*(b-a)+a;
  const ri   = (a,b) => Math.floor(rnd(a, b+1));
  const pick = arr   => arr[Math.floor(Math.random()*arr.length)];
  function shuffle(arr) {
    for(let i=arr.length-1; i>0; i--) {
      const j=ri(0,i); [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  /* ---------- SCREEN MANAGEMENT ---------- */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    el(id).classList.remove('hidden');
  }
  function showModal() { el('modal').classList.remove('hidden'); }
  function hideModal() { el('modal').classList.add('hidden');    }
  function goHome() {
    _stopTimer();
    showScreen('screen-home');
    if(state.playerName && typeof _revealHome === 'function') _revealHome();
  }

  /* ---------- STAR BACKGROUND ---------- */
  function buildStars() {
    const bg = el('stars-bg');
    bg.innerHTML = '';
    for(let i=0; i<80; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const sz = rnd(.7, 3.5);
      s.style.cssText = `width:${sz}px;height:${sz}px;top:${rnd(0,100)}%;left:${rnd(0,100)}%;--dur:${rnd(2,6).toFixed(1)}s;--del:${rnd(0,5).toFixed(1)}s`;
      bg.appendChild(s);
    }
  }

  /* ---------- TIMER ---------- */
  function _startTimer() {
    _stopTimer();
    state.timeLeft = MAX_TIME;
    _updateTimerUI(MAX_TIME);
    state.timerID = setInterval(() => {
      state.timeLeft--;
      _updateTimerUI(state.timeLeft);
      if(state.timeLeft <= 0) { _stopTimer(); _handleTimeout(); }
    }, 1000);
  }
  function _stopTimer() { clearInterval(state.timerID); }
  function _updateTimerUI(t) {
    el('timer-num').textContent = t;
    const ring = el('t-ring');
    ring.style.strokeDashoffset = CIRCUM * (1 - t / MAX_TIME);
    ring.style.stroke = t>15 ? '#4ecdc4' : t>8 ? '#ffd700' : '#ff6b6b';
  }

  /* ---------- GAME FLOW ---------- */
  function startLevel(levelId) {
    const lv = _levels[levelId];
    if(!lv) return console.error('[Engine] Unknown level:', levelId);

    // Clean up any level-specific theme classes from previous level
    el('screen-game').classList.remove('mem-theme');

    state.level      = lv;
    state.currentQ   = 0;
    state.questions  = lv.generateQuestions();
    state.totalScore = 0;
    state.correctAns = 0;
    state.answered   = false;

    // Sync playlist position (handles retry and debug startLevel calls)
    const _pi = state.playlist.indexOf(levelId);
    if(_pi !== -1) state.playlistIdx = _pi;

    lv.applyTheme();           // sets bg + injects sidebar HTML
    lv.buildDots();            // adds progress step dots
    lv.setProgress(0, TOTAL_Q);
    el('score-display').textContent = '0';

    showScreen('screen-game');
    _showQuestion(0);
  }

  function _showQuestion(idx) {
    const q = state.questions[idx];
    state.answered = false;

    el('q-counter').textContent = `Pregunta ${idx+1}/${TOTAL_Q}`;
    el('feedback').textContent  = '';

    // Bounce card animation
    const card = el('q-card');
    card.style.animation = 'none'; void card.offsetHeight;
    card.style.animation = 'bounce-in .4s ease-out';

    // Let the level render the card content
    state.level.renderCard(q, idx);

    // Build answer buttons
    const grid = el('answers-grid');
    grid.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className   = state.level.answerClass || 'ans-btn';
      btn.textContent = opt;
      btn.onclick     = () => _handleAnswer(btn, opt, q.correct);
      grid.appendChild(btn);
    });

    _startTimer();
  }

  function _handleAnswer(btn, selected, correct) {
    if(state.answered) return;
    state.answered = true;
    _stopTimer();

    const btns = document.querySelectorAll('.ans-btn');
    btns.forEach(b => b.disabled = true);

    if(selected == correct) {  // == handles string/number coercion
      btn.classList.add('correct');
      state.correctAns++;
      const pts = _calcScore(state.timeLeft);
      state.totalScore += pts;
      el('score-display').textContent = state.totalScore;
      el('feedback').textContent      = pick(CORRECT_FB);
      showFloatingScore(pts, btn);
      state.level.setProgress(state.currentQ + 1, TOTAL_Q);
      playCorrect();
    } else {
      btn.classList.add('wrong');
      btns.forEach(b => { if(b.textContent.trim() == correct) b.classList.add('correct'); });
      el('feedback').textContent = pick(WRONG_FB);
      playWrong();
    }

    setTimeout(_nextQ, 1850);
  }

  function _handleTimeout() {
    if(state.answered) return;
    state.answered = true;
    const correct = state.questions[state.currentQ].correct;
    document.querySelectorAll('.ans-btn').forEach(b => {
      b.disabled = true;
      if(b.textContent.trim() == correct) b.classList.add('correct');
    });
    el('feedback').textContent = '⏱️ ¡Se acabó el tiempo!';
    playWrong();
    setTimeout(_nextQ, 1600);
  }

  function _nextQ() {
    state.currentQ++;
    if(state.currentQ === 5) {
      el('mid-score').textContent = state.totalScore;
      el('mid-title').textContent = state.playerName
        ? `¡Vas genial, ${state.playerName}!`
        : '¡Vas genial!';
      showScreen('screen-midpoint');
      return;
    }
    if(state.currentQ >= TOTAL_Q) { _showResult(); return; }
    _showQuestion(state.currentQ);
  }

  function continuePlaying() {
    showScreen('screen-game');
    _showQuestion(state.currentQ);
  }

  function _showResult() {
    _stopTimer();
    const score = state.totalScore;
    const pct   = Math.round((score / 1000) * 100);
    const won   = pct >= 80;

    state.totalStars += state.correctAns;
    el('badge-count').textContent = state.totalStars;

    // Generic result content
    el('res-title').innerHTML       = won ? state.level.winTitle   : state.level.loseTitle;
    const pfx = state.playerName ? `¡${state.playerName}! ` : '';
    el('res-motivator').textContent = won
      ? pfx + state.level.winMessage
      : pfx + pick(MOTIVATORS);
    el('res-detail').textContent    = `${score}/1000 puntos • ${pct}% • ${state.correctAns}/${TOTAL_Q} correctas`;

    animateCount(score, 'res-score-big');

    // Stars
    const starCount = won ? 3 : state.correctAns>=7 ? 2 : state.correctAns>=4 ? 1 : 0;
    [1,2,3].forEach(i => { const s=el(`star-${i}`); s.style.opacity='0'; s.classList.remove('pop'); });
    for(let i=1; i<=starCount; i++) {
      setTimeout(() => el(`star-${i}`).classList.add('pop'), (i-1)*320);
    }

    // Next level button (playlist-based)
    const _ni   = state.playlistIdx + 1;
    const nextId = (state.playlist.length && _ni < state.playlist.length)
      ? state.playlist[_ni] : null;
    const nextLv = nextId ? _levels[nextId] : null;
    const nextBtn = nextLv
      ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(${score},'${nextId}')">${nextLv.name} →</button>`
      : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`;
    el('res-btns').innerHTML = [
      `<button class="btn-retry" onclick="Engine.startLevel('${state.level.id}')">¡Jugar de nuevo!</button>`,
      nextBtn,
    ].join('');

    // Let the level add its win/lose animation
    el('result-level-extra').innerHTML = '';
    state.level.onResult(won, score);

    showScreen('screen-result');
  }

  function showAllComplete() {
    const grandTotal = state.grandTotalScore + state.totalScore;
    _lastGrandTotal  = grandTotal;
    const name = state.playerName;
    el('ac-title').textContent = name
      ? `¡Lo lograste, ${name}! 🏆`
      : '¡Lo lograste! 🏆';
    el('ac-stars-val').textContent = state.totalStars;
    animateCount(grandTotal, 'ac-score');
    createConfetti(['🏆','⭐','🌟','🎉','✨','🎊']);
    playLaunch();

    // Reset save section and pre-fill name
    const section = el('ac-save-section');
    if(section) {
      section.innerHTML = `
        <p class="ac-save-label">¿Quieres guardar tu puntuación? 🏅</p>
        <div class="ac-save-row">
          <input class="ac-save-input" id="ac-save-name" type="text"
                 placeholder="Tu nombre..." maxlength="20" autocomplete="off"
                 onkeydown="if(event.key==='Enter')Engine.submitScore()" value="${_escHtml(name)}">
          <button class="ac-save-btn" onclick="Engine.submitScore()">Guardar</button>
        </div>
      `;
    }

    showScreen('screen-all-complete');
  }

  function showLevelComplete(score, nextLevelId) {
    state.grandTotalScore += score;
    const nextLv = _levels[nextLevelId];
    el('lc-score-val').textContent = score;
    el('lc-title').textContent     = state.playerName
      ? `¡Fantástico, ${state.playerName}!`
      : '¡Nivel completado!';
    el('lc-sub').textContent       = `¡Siguiente aventura: ${nextLv.name}! 🌟`;
    el('lc-btn-next').textContent  = nextLv.name + ' →';
    el('lc-btn-next').onclick      = () => startLevel(nextLevelId);
    showScreen('screen-level-complete');
  }

  /* ---------- SHARED HELPERS ---------- */
  function _calcScore(timeLeft) {
    return Math.max(10, 100 - (MAX_TIME - timeLeft) * 2);
  }

  function showFloatingScore(pts, btn) {
    const r = btn.getBoundingClientRect();
    const d = document.createElement('div');
    d.className   = 'float-score';
    d.textContent = `+${pts} pts`;
    d.style.left  = (r.left + r.width/2 - 45) + 'px';
    d.style.top   = (r.top - 14) + 'px';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  function animateCount(target, elId = 'res-score-big') {
    const e = el(elId); let cur = 0;
    const step = Math.max(1, Math.ceil(target/60));
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      e.textContent = cur;
      if(cur >= target) clearInterval(id);
    }, 25);
  }

  function createConfetti(items = ['⭐','🌟','✨','💫','🎉']) {
    for(let i=0; i<50; i++) {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className   = 'confetti';
        d.textContent = pick(items);
        const dur = rnd(2,5).toFixed(1);
        d.style.cssText = `left:${rnd(0,100)}%;top:-36px;font-size:${rnd(1,2.5).toFixed(1)}rem;--dur:${dur}s;--del:0s;--drift:${rnd(-60,60).toFixed(0)}px`;
        document.body.appendChild(d);
        setTimeout(() => d.remove(), (+dur + .5) * 1000);
      }, i * 90);
    }
  }

  /* ---------- SCORES (Supabase) ---------- */
  const _SB_URL = 'https://hhhitgcolifdlbrnfthz.supabase.co';
  const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaGl0Z2NvbGlmZGxicm5mdGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNDMzNjIsImV4cCI6MjA4OTYxOTM2Mn0.LZh0gTPVCpsOSf5liy42z-Qv_AKssBjF-7V3z-KCGFQ';
  const _SB_HDR = { 'apikey': _SB_KEY, 'Authorization': `Bearer ${_SB_KEY}`, 'Content-Type': 'application/json' };
  let _lastGrandTotal = 0;

  async function _fetchScores() {
    const r = await fetch(`${_SB_URL}/rest/v1/scores?order=score.desc&limit=100`, { headers: _SB_HDR });
    if(!r.ok) throw new Error('fetch failed');
    return r.json();
  }

  async function _persistScore(name, score, stars) {
    const r = await fetch(`${_SB_URL}/rest/v1/scores`, {
      method:  'POST',
      headers: { ..._SB_HDR, 'Prefer': 'return=minimal' },
      body:    JSON.stringify({ name, score, stars }),
    });
    if(!r.ok) throw new Error('insert failed');
  }

  function _escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  async function submitScore() {
    const input = el('ac-save-name');
    const name  = input ? input.value.trim() : '';
    if(!name) {
      if(input) { input.style.animation='none'; void input.offsetHeight; input.style.animation='shake .4s ease'; }
      return;
    }
    const section = el('ac-save-section');
    if(section) section.innerHTML = '<div class="ac-saved">⏳ Guardando...</div>';
    try {
      await _persistScore(name, _lastGrandTotal, state.totalStars);
      if(section) section.innerHTML = '<div class="ac-saved">✅ ¡Puntuación guardada!</div>';
      setTimeout(() => showLeaderboard(), 1000);
    } catch(e) {
      if(section) section.innerHTML = '<div class="ac-saved" style="color:#ff6b6b">❌ Error al guardar. Inténtalo de nuevo.</div>';
    }
  }

  async function showLeaderboard() {
    const list = el('lb-list');
    if(!list) return;
    showScreen('screen-leaderboard');
    list.innerHTML = '<div class="lb-empty">⏳ Cargando clasificación...</div>';
    try {
      const scores = await _fetchScores();
      if(scores.length === 0) {
        list.innerHTML = '<div class="lb-empty">¡Sé el primero en aparecer aquí! 🌟</div>';
      } else {
        const medals = ['🥇','🥈','🥉'];
        list.innerHTML = scores.map((s, i) => `
          <div class="lb-row ${i<3?'lb-top':''}">
            <div class="lb-rank">${medals[i] || `#${i+1}`}</div>
            <div class="lb-name">${_escHtml(s.name)}</div>
            <div class="lb-score">${Number(s.score).toLocaleString('es-ES')} pts</div>
            <div class="lb-stars">⭐ ${s.stars}</div>
          </div>
        `).join('');
      }
    } catch(e) {
      list.innerHTML = '<div class="lb-empty" style="color:#ff6b6b">❌ No se pudo cargar la clasificación.</div>';
    }
  }

  /* ---------- INIT ---------- */
  function init(levels = []) {
    buildStars();
    levels.forEach(registerLevel);
    showScreen('screen-home');
  }

  /* ---------- PUBLIC API ---------- */
  return {
    // Lifecycle
    init, registerLevel, startLevel,
    continuePlaying, showLevelComplete, showAllComplete,
    // Navigation
    showScreen, goHome, showModal, hideModal,
    // Audio
    playCorrect, playWrong, playLaunch, playStars,
    // Helpers (exposed for levels)
    el, rnd, ri, pick, shuffle,
    animateCount, showFloatingScore, createConfetti,
    // Read-only state access
    get state()     { return state;   },
    get TOTAL_Q()   { return TOTAL_Q; },
    get MOTIVATORS(){ return MOTIVATORS; },
    // Player name
    setPlayerName(n) { state.playerName = n.trim(); },
    get playerName()  { return state.playerName; },
    // Level info
    getLevelName(id) { return _levels[id] ? _levels[id].name : id; },
    // Leaderboard & scores
    showLeaderboard, submitScore,
    // Start game with random level order
    startGame() {
      state.playlist         = ['math', 'english', 'flags', 'memory'];
      state.playlistIdx      = 0;
      state.grandTotalScore  = 0;
      state.totalStars       = 0;
      el('badge-count').textContent = '0';
      startLevel(state.playlist[0]);
    },
    // Debug helper
    skipToResult(win = true) {
      if(!state.level) return;
      _stopTimer();
      state.answered   = true;
      state.correctAns = win ? TOTAL_Q : 3;
      state.totalScore = win ? 1000 : 200;
      _showResult();
    },
  };

})();
