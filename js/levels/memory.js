'use strict';

const MemoryLevel = (() => {

  /* ── The 3 pairs the player must find ─────────────── */
  const PAIRS = [
    { id: 'rainbow', emoji: '🌈' },
    { id: 'unicorn', emoji: '🦄' },
    { id: 'cow',     emoji: '🐄' },
  ];

  /* ── 10 unique distractors to fill the 4×4 grid ──── */
  const DISTRACTOR_POOL = [
    '🐶','🐱','🐸','🦊','🐼',
    '🦋','🌸','🍎','🍕','🎸',
  ];

  /* ── Internal game state ─────────────────────────── */
  let _cards   = [];   // all 16 card objects
  let _flipped = [];   // up to 2 {el, card} currently face-up
  let _matched = [];   // pairIds that have been matched
  let _fails   = 0;    // count of non-matching flip pairs
  let _lock    = false;

  /* ── Helpers ─────────────────────────────────────── */
  function _sh(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function _buildDeck() {
    const deck = [];
    PAIRS.forEach(p => {
      deck.push({ pairId: p.id, emoji: p.emoji, isPair: true });
      deck.push({ pairId: p.id, emoji: p.emoji, isPair: true });
    });
    _sh(DISTRACTOR_POOL).forEach((emoji, i) => {
      deck.push({ pairId: `u${i}`, emoji, isPair: false });
    });
    return _sh(deck).map((c, i) => ({ ...c, idx: i, faceUp: false, matched: false }));
  }

  function _score() {
    return Math.max(400, 1000 - _fails * 50);
  }

  /* ── Card interaction ───────────────────────────── */
  function _flip(cardEl, card) {
    if (_lock || card.faceUp || card.matched || _flipped.length >= 2) return;

    card.faceUp = true;
    cardEl.classList.add('mem-flipped');
    _flipped.push({ el: cardEl, card });

    if (_flipped.length < 2) return;

    _lock = true;
    const [a, b] = _flipped;

    if (a.card.pairId === b.card.pairId && a.card.isPair) {
      // ✅ Match found
      Engine.playCorrect();
      a.card.matched = b.card.matched = true;
      a.el.classList.add('mem-matched');
      b.el.classList.add('mem-matched');
      _matched.push(a.card.pairId);
      _flipped = [];
      _lock = false;
      _refreshSidebar();
      if (_matched.length === PAIRS.length) setTimeout(_winGame, 700);
    } else {
      // ❌ No match
      _fails++;
      Engine.playWrong();
      setTimeout(() => {
        a.card.faceUp = b.card.faceUp = false;
        a.el.classList.remove('mem-flipped');
        b.el.classList.remove('mem-flipped');
        _flipped = [];
        _lock = false;
      }, 1000);
    }
  }

  /* ── Sidebar progress ───────────────────────────── */
  function _refreshSidebar() {
    const sidebar = Engine.el('mem-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = `
      <div class="mems-label">Parejas</div>
      <div class="mems-count">${_matched.length}<span>/${PAIRS.length}</span></div>
      <div class="mems-icons">
        ${PAIRS.map(p =>
          `<div class="mems-icon${_matched.includes(p.id) ? ' mems-found' : ''}">${p.emoji}</div>`
        ).join('')}
      </div>
    `;
  }

  /* ── Win sequence ───────────────────────────────── */
  function _winGame() {
    const score = _score();
    const st    = Engine.state;

    // Update Engine state so progression & grandTotal work correctly
    st.totalScore  = score;
    st.correctAns  = PAIRS.length;
    st.totalStars += PAIRS.length;
    Engine.el('badge-count').textContent = st.totalStars;

    // Populate result screen
    Engine.el('res-title').innerHTML    = `<span style="color:#ffd700">🎉 ¡Encontraste las 3 parejas!</span>`;
    const pfx = st.playerName ? `¡${st.playerName}! ` : '';
    Engine.el('res-motivator').textContent =
      pfx + '¡Qué memoria tan increíble! 🧠✨';
    Engine.el('res-detail').textContent =
      `${score}/1000 puntos · ${_fails} fallo${_fails !== 1 ? 's' : ''} · 3/3 parejas`;
    Engine.animateCount(score, 'res-score-big');

    // Stars
    const stars = score >= 1000 ? 3 : score >= 800 ? 2 : 1;
    [1,2,3].forEach(i => {
      const s = Engine.el(`star-${i}`);
      s.style.opacity = '0';
      s.classList.remove('pop');
    });
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => Engine.el(`star-${i}`).classList.add('pop'), (i-1) * 320);
    }

    // Navigation buttons
    const ni     = st.playlistIdx + 1;
    const nextId = (st.playlist.length && ni < st.playlist.length) ? st.playlist[ni] : null;
    Engine.el('res-btns').innerHTML = [
      `<button class="btn-retry" onclick="Engine.startLevel('memory')">¡Jugar de nuevo!</button>`,
      nextId
        ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(${score},'${nextId}')">${Engine.getLevelName(nextId)} →</button>`
        : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`,
    ].join('');

    // Win animation
    Engine.el('result-level-extra').innerHTML =
      `<div class="mem-win-anim">🌈&nbsp;🦄&nbsp;🐄</div>`;
    Engine.createConfetti(['🌈','🦄','🐄','⭐','🎉','✨']);
    Engine.playLaunch();
    setTimeout(() => Engine.playStars(), 400);
    Engine.showScreen('screen-result');
  }

  /* ============================================================
     LEVEL INTERFACE
  ============================================================ */
  function mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* Screen background */
      #screen-game.mem-theme {
        background: linear-gradient(160deg,#160430 0%,#2e0d5c 50%,#1a1560 100%);
      }

      /* Hide Q&A chrome we don't need */
      .mem-theme .timer-wrap,
      .mem-theme .game-score { visibility: hidden; }
      .mem-theme #feedback,
      .mem-theme .answers-grid { display: none !important; }

      /* q-counter repurposed as instruction label */
      .mem-theme #q-counter {
        font-size: clamp(.72rem,1.8vw,.9rem);
        font-weight: 800; color: rgba(255,255,255,.75);
      }

      /* q-card expands to fill the available flex space */
      .mem-theme .q-area {
        padding: 0 4px; overflow: visible; justify-content: stretch;
      }
      .mem-theme #q-card {
        flex: 1; flex-shrink: 1; min-height: 0;
        background: transparent !important;
        backdrop-filter: none !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        animation: none !important;
        border-radius: 0 !important;
        display: flex; align-items: stretch; justify-content: stretch;
        overflow: visible;
      }
      .mem-theme .game-main { align-items: stretch; }

      /* Sidebar */
      .mem-sidebar-wrap {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 10px; height: 100%; padding: 12px 6px;
      }
      .mems-label {
        font-size: .7rem; font-weight: 800; text-align: center;
        color: rgba(255,255,255,.55); text-transform: uppercase; letter-spacing: .5px;
      }
      .mems-count {
        font-size: 2.5rem; font-weight: 900; color: #ffd700;
        line-height: 1; text-align: center;
      }
      .mems-count span { font-size: 1.25rem; color: rgba(255,215,0,.4); }
      .mems-icons {
        display: flex; flex-direction: column; gap: 8px; align-items: center;
      }
      .mems-icon {
        font-size: 1.85rem; opacity: .25; filter: grayscale(1);
        transition: opacity .4s, filter .4s, transform .4s;
      }
      .mems-found { opacity: 1; filter: none; transform: scale(1.2); }

      /* 4×4 memory grid */
      .mem-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: clamp(4px, 1vw, 7px);
        width: 100%;
        height: 100%;
      }

      /* Individual card */
      .mem-card {
        aspect-ratio: 1 / 1; position: relative;
        cursor: pointer; perspective: 500px; user-select: none;
        container-type: size;
      }
      .mem-card-inner {
        position: absolute; inset: 0;
        transform-style: preserve-3d;
        transition: transform .4s cubic-bezier(.4,0,.2,1);
        border-radius: clamp(6px,1.5vw,10px);
      }
      .mem-card.mem-flipped .mem-card-inner,
      .mem-card.mem-matched .mem-card-inner { transform: rotateY(180deg); }

      .mem-card-back, .mem-card-front {
        position: absolute; inset: 0; border-radius: inherit;
        display: flex; align-items: center; justify-content: center;
        backface-visibility: hidden; -webkit-backface-visibility: hidden;
      }
      .mem-card-back {
        background: linear-gradient(135deg,#6c3aad,#a855f7);
        border: 1.5px solid rgba(255,255,255,.3);
        box-shadow: 0 3px 8px rgba(0,0,0,.4);
        flex-direction: column; gap: 1px;
      }
      .mem-back-icons { font-size: clamp(.8rem,2.2vw,1.25rem); line-height: 1; }
      .mem-back-text {
        font-size: clamp(.28rem,.78vw,.5rem); font-weight: 900;
        letter-spacing: 1px; color: rgba(255,255,255,.72); text-transform: uppercase;
      }
      .mem-card-front {
        background: linear-gradient(135deg,#1e1a3a,#2d2060);
        border: 1.5px solid rgba(255,255,255,.18);
        transform: rotateY(180deg);
        font-size: 50cqmin;
        box-shadow: 0 3px 8px rgba(0,0,0,.3);
      }
      .mem-card.mem-matched .mem-card-front {
        background: linear-gradient(135deg,#0d3320,#1a8a4a);
        border-color: rgba(46,204,113,.7);
        animation: memMatchGlow .5s ease-out;
      }
      .mem-card:not(.mem-matched):not(.mem-flipped):hover .mem-card-inner {
        transform: scale(1.07) translateY(-2px);
      }
      @keyframes memMatchGlow {
        0%  { box-shadow: 0 0 0 rgba(46,204,113,0); }
        50% { box-shadow: 0 0 18px rgba(46,204,113,.85); }
        100%{ box-shadow: 0 0 7px rgba(46,204,113,.4); }
      }

      /* Win decoration on result screen */
      .mem-win-anim {
        position: absolute; top: 26%; left: 50%; transform: translateX(-50%);
        font-size: 3.2rem; z-index: 3; white-space: nowrap;
        animation: bounce-in .6s ease-out;
      }
    `;
    document.head.appendChild(s);
  }

  function applyTheme() {
    Engine.el('screen-game').classList.add('mem-theme');
    Engine.el('game-sidebar').innerHTML = `
      <div class="mem-sidebar-wrap">
        <div id="mem-sidebar"></div>
      </div>
    `;
    _refreshSidebar();
  }

  function buildDots() { /* sidebar shows progress instead */ }
  function setProgress() { /* handled by _refreshSidebar */ }

  function renderCard(q, idx) {
    if (idx !== 0) return;

    // Prevent Engine's timer/timeout from interfering
    Engine.state.answered = true;

    // Reset game state
    _cards   = _buildDeck();
    _flipped = [];
    _matched = [];
    _fails   = 0;
    _lock    = false;
    _refreshSidebar();

    // Build the 4×4 grid inside #q-card
    const qCard = Engine.el('q-card');
    qCard.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'mem-grid';

    _cards.forEach(card => {
      const el = document.createElement('div');
      el.className = 'mem-card';
      el.innerHTML = `
        <div class="mem-card-inner">
          <div class="mem-card-back">
            <span class="mem-back-icons">🦄🌈</span>
            <span class="mem-back-text">bonitu</span>
          </div>
          <div class="mem-card-front">${card.emoji}</div>
        </div>`;
      el.addEventListener('click', () => _flip(el, card));
      grid.appendChild(el);
    });

    qCard.appendChild(grid);

    // Clear Q&A elements (answers-grid already hidden via CSS)
    Engine.el('answers-grid').innerHTML = '';
    Engine.el('feedback').textContent   = '';
    Engine.el('q-counter').textContent  = '🎴 ¡Encuentra las 3 parejas!';
  }

  function generateQuestions() {
    // Single dummy question — renderCard takes over the display
    return [{ correct: '_', options: [] }];
  }

  function onResult(won, score) { /* result populated inside _winGame */ }

  return {
    id:               'memory',
    name:             '🎴 Memoria',
    nextLevelId:      null,
    answerClass:      'ans-btn',
    winTitle:         '<span style="color:#ffd700">🎉 ¡Encontraste las 3 parejas!</span>',
    loseTitle:        '',
    winMessage:       '¡Qué memoria tan increíble! 🧠✨',
    levelIntroMessage:'¡Ahora a poner a prueba tu memoria! 🎴',
    mount, applyTheme, buildDots, setProgress, renderCard, generateQuestions, onResult,
  };

})();
