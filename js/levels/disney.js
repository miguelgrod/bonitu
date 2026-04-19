'use strict';

const DisneyLevel = (() => {

  /* ── Disney characters (16) ─────────────────────────── */
  const CHARACTERS = [
    { img: 'alegria.webp',  name: 'Alegría'  },
    { img: 'asno.webp',     name: 'Asno'     },
    { img: 'cazorla.webp',  name: 'Cazorla'  },
    { img: 'forky.webp',    name: 'Forky'    },
    { img: 'luigi.webp',    name: 'Luigi'    },
    { img: 'mario.webp',    name: 'Mario'    },
    { img: 'merida.webp',   name: 'Mérida'   },
    { img: 'minion.webp',   name: 'Minion'   },
    { img: 'olaf.webp',     name: 'Olaf'     },
    { img: 'rosita.webp',   name: 'Rosita'   },
    { img: 'rumi.webp',     name: 'Rumi'     },
    { img: 'shrek.webp',    name: 'Shrek'    },
    { img: 'stitch.webp',   name: 'Stitch'   },
    { img: 'tristeza.webp', name: 'Tristeza' },
    { img: 'vaiana.webp',   name: 'Vaiana'   },
    { img: 'woody.webp',    name: 'Woody'    },
  ];

  const IMG_BASE = 'src/personajes-memoria/';

  const ROUNDS        = 3;
  const REVEAL_SECS   = 10;
  const MAX_ATTEMPTS  = 5;

  /* ── Star positions for each correct-round count ───── */
  const STAR_POS = ['4%', '36%', '66%', '92%'];

  /* ── Round state ────────────────────────────────────── */
  let _round        = 0;
  let _correctRounds = 0;
  let _roundResults = [];    // 'win' | 'lose' per round
  let _cards        = [];
  let _targetIdx    = -1;
  let _attemptsLeft = MAX_ATTEMPTS;
  let _phase        = 'idle';  // 'reveal' | 'guess' | 'roundEnd'
  let _cdID         = null;
  let _resizeObs    = null;
  let _lock         = false;

  /* ── Helpers ─────────────────────────────────────────── */
  function _el(id) { return document.getElementById(id); }

  function _sh(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── Grid ────────────────────────────────────────────── */
  function _renderGrid() {
    _cards = _sh([...CHARACTERS]).map((c, i) => ({ ...c, idx: i }));

    const qCard = Engine.el('q-card');
    qCard.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'dis-grid';
    grid.id = 'dis-grid';

    _cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'dis-card';
      el.id = `dis-c-${i}`;
      el.innerHTML = `
        <div class="dis-card-inner">
          <div class="dis-card-back">
            <span class="dis-back-icons">🌟✨</span>
            <span class="dis-back-text">bonitu</span>
          </div>
          <div class="dis-card-front">
            <img src="${IMG_BASE}${card.img}" alt="${card.name}" class="dis-char-img" draggable="false">
          </div>
        </div>`;
      el.addEventListener('click', () => _handleCardClick(i));
      grid.appendChild(el);
    });

    qCard.appendChild(grid);

    function _fitGrid() {
      const { width, height } = qCard.getBoundingClientRect();
      const avail = Math.floor(Math.min(width, height));
      if (avail > 0) { grid.style.width = avail + 'px'; grid.style.height = avail + 'px'; }
    }
    _fitGrid();
    if (_resizeObs) _resizeObs.disconnect();
    _resizeObs = new ResizeObserver(_fitGrid);
    _resizeObs.observe(qCard);

    Engine.el('answers-grid').innerHTML = '';
    Engine.el('feedback').innerHTML     = '';
  }

  /* ── Round lifecycle ─────────────────────────────────── */
  function _startRound() {
    _round++;
    _phase        = 'reveal';
    _attemptsLeft = MAX_ATTEMPTS;
    _lock         = false;
    _renderGrid();
    _updateRoundDots();
    _updateCounterText(REVEAL_SECS);

    let t = REVEAL_SECS;
    if (_cdID) clearInterval(_cdID);
    _cdID = setInterval(() => {
      t--;
      _updateCounterText(t);
      if (t <= 0) {
        clearInterval(_cdID);
        _cdID = null;
        _flipAllDown();
      }
    }, 1000);
  }

  function _flipAllDown() {
    _phase      = 'guess';
    _targetIdx  = Math.floor(Math.random() * 16);

    // Cascade flip with small random delays
    _cards.forEach((_, i) => {
      const el = _el(`dis-c-${i}`);
      if (!el) return;
      el.style.transitionDelay = `${Math.floor(Math.random() * 300)}ms`;
      el.classList.add('dis-flipped');
    });
    setTimeout(() => {
      _cards.forEach((_, i) => {
        const el = _el(`dis-c-${i}`);
        if (el) el.style.transitionDelay = '';
      });
    }, 950);

    Engine.el('feedback').textContent = '';
    _updateCounterText();
    _updateAttemptsUI();
  }

  function _handleCardClick(i) {
    if (_phase !== 'guess' || _lock) return;
    const cardEl = _el(`dis-c-${i}`);
    if (!cardEl
      || cardEl.classList.contains('dis-correct')
      || cardEl.classList.contains('dis-reveal-correct')) return;

    if (i === _targetIdx) {
      /* ✅ Correct */
      _lock = true;
      Engine.playCorrect();
      cardEl.classList.remove('dis-flipped');
      cardEl.classList.add('dis-correct');
      _correctRounds++;
      _roundResults.push('win');
      _phase = 'roundEnd';
      _updateRoundDots();
      _moveStar(true);
      Engine.el('feedback').textContent = '✅ ¡Correcto! 🌟';
      setTimeout(_nextRound, 1800);
    } else {
      /* ❌ Wrong */
      _attemptsLeft--;
      Engine.playWrong();
      cardEl.classList.add('dis-wrong');
      setTimeout(() => cardEl.classList.remove('dis-wrong'), 600);
      _updateAttemptsUI();
      _updateCounterText();

      if (_attemptsLeft <= 0) {
        _lock = true;
        _phase = 'roundEnd';
        const correctEl = _el(`dis-c-${_targetIdx}`);
        if (correctEl) {
          correctEl.classList.remove('dis-flipped');
          correctEl.classList.add('dis-reveal-correct');
        }
        _roundResults.push('lose');
        _updateRoundDots();
        const t = _cards[_targetIdx];
        Engine.el('feedback').innerHTML = `Era <img src="${IMG_BASE}${t.img}" alt="${t.name}" class="dis-q-img"> ${t.name} 💪`;
        setTimeout(_nextRound, 2200);
      }
    }
  }

  function _nextRound() {
    if (_round >= ROUNDS) { _winGame(); } else { _startRound(); }
  }

  /* ── UI helpers ──────────────────────────────────────── */
  function _updateCounterText(countdown) {
    const el = Engine.el('q-counter');
    if (!el) return;
    if (_phase === 'reveal') {
      const s = countdown !== undefined ? countdown : REVEAL_SECS;
      el.innerHTML = `Memoriza dónde está cada uno, te voy a preguntar por uno de ellos en <strong>${s}s</strong> ⏰`;
    } else if (_phase === 'guess') {
      const t = _cards[_targetIdx];
      el.innerHTML = `¿Dónde estaba <img src="${IMG_BASE}${t.img}" alt="${t.name}" class="dis-q-img"><strong>${t.name}</strong>?`;
    }
  }

  function _updateAttemptsUI() {
    const fb = Engine.el('feedback');
    if (!fb || _phase !== 'guess') return;
    fb.textContent = '❤️'.repeat(_attemptsLeft) + '🖤'.repeat(MAX_ATTEMPTS - _attemptsLeft);
  }

  function _updateRoundDots() {
    for (let i = 0; i < ROUNDS; i++) {
      const d = _el(`dis-rd-${i}`);
      if (!d) continue;
      if (i < _roundResults.length) {
        d.textContent = _roundResults[i] === 'win' ? '✅' : '❌';
      } else if (i === _roundResults.length && (_phase === 'reveal' || _phase === 'guess')) {
        d.textContent = '🔵';
      } else {
        d.textContent = '○';
      }
    }
  }

  function _moveStar(animate) {
    const star = _el('dis-star');
    if (!star) return;
    if (!animate) {
      star.style.transition = 'none';
      star.style.bottom = STAR_POS[_correctRounds];
      requestAnimationFrame(() => { star.style.transition = ''; });
    } else {
      star.style.bottom = STAR_POS[_correctRounds];
      star.classList.remove('dis-star-glow');
      void star.offsetWidth;
      star.classList.add('dis-star-glow');
    }
  }

  /* ── Win sequence ────────────────────────────────────── */
  function _winGame() {
    const scoreMap = [200, 500, 750, 1000];
    const score    = scoreMap[_correctRounds];
    const won      = _correctRounds >= 2;

    const st      = Engine.state;
    st.totalScore = score;
    st.correctAns = _correctRounds;
    st.totalStars += _correctRounds;
    Engine.el('badge-count').textContent = st.totalStars;

    Engine.el('res-title').innerHTML = won
      ? `<span style="color:#ffd700">🏰 ¡Memoria de campeón!</span>`
      : `<span style="color:#4ecdc4">💪 ¡Buen intento!</span>`;

    const pfx = st.playerName ? `¡${st.playerName}! ` : '';
    Engine.el('res-motivator').textContent = won
      ? pfx + `¡Localizaste ${_correctRounds} de ${ROUNDS} personajes Disney! 🌟`
      : pfx + `Acertaste ${_correctRounds} de ${ROUNDS} rondas. ¡Sigue practicando! 💪`;

    Engine.el('res-detail').textContent =
      `${score}/1000 puntos · ${_correctRounds}/${ROUNDS} rondas correctas`;
    Engine.animateCount(score, 'res-score-big');

    const stars = Math.min(3, _correctRounds);
    [1,2,3].forEach(i => { const s = Engine.el(`star-${i}`); s.style.opacity='0'; s.classList.remove('pop'); });
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => Engine.el(`star-${i}`).classList.add('pop'), (i-1) * 320);
    }

    const ni     = st.playlistIdx + 1;
    const nextId = (st.playlist.length && ni < st.playlist.length) ? st.playlist[ni] : null;
    Engine.el('res-btns').innerHTML = nextId
      ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(${score},'${nextId}')">${Engine.getLevelName(nextId)} →</button>`
      : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`;

    const winChars = Engine.shuffle([...CHARACTERS]).slice(0, 3);
    Engine.el('result-level-extra').innerHTML =
      `<div class="dis-win-anim">${winChars.map(c =>
        `<img src="${IMG_BASE}${c.img}" alt="${c.name}" class="dis-win-img">`
      ).join('')}</div>`;

    if (won) {
      Engine.createConfetti(['🐭','🦁','⭐','🎉','✨','🏰']);
      Engine.playLaunch();
      setTimeout(() => Engine.playStars(), 400);
    }
    Engine.showScreen('screen-result');
  }

  /* ============================================================
     LEVEL INTERFACE
  ============================================================ */
  function mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* ── Screen background ───────────────────────────── */
      #screen-game.dis-theme {
        background: linear-gradient(175deg, #020818 0%, #0a1628 45%, #010810 100%);
      }

      /* ── Hide engine chrome we don't need ────────────── */
      .dis-theme .timer-wrap,
      .dis-theme .game-score  { visibility: hidden; }
      .dis-theme .answers-grid { display: none !important; }

      /* ── q-counter repurposed as round label ─────────── */
      .dis-theme #q-counter {
        font-size: clamp(.72rem, 1.8vw, .95rem);
        font-weight: 800;
        color: rgba(255,255,255,.85);
        text-align: center;
        line-height: 1.4;
      }
      .dis-theme #q-counter strong { color: #ffd700; }

      /* ── feedback repurposed for attempts/result ─────── */
      .dis-theme #feedback {
        font-size: clamp(1rem, 3.5vw, 1.4rem);
        text-align: center;
        min-height: 1.6em;
        color: rgba(255,255,255,.9);
      }

      /* ── q-area and q-card expand to fill space ──────── */
      .dis-theme .q-area {
        padding: 0 4px; overflow: hidden;
        justify-content: center; align-items: center; min-height: 0;
      }
      .dis-theme #q-card {
        flex: 1; flex-shrink: 1; min-height: 0;
        background: transparent !important;
        backdrop-filter: none !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        animation: none !important;
        border-radius: 0 !important;
        display: flex !important;
        align-items: center; justify-content: center;
        overflow: hidden; width: 100%;
      }
      .dis-theme .game-main { align-items: stretch; }

      /* ── 4×4 grid ────────────────────────────────────── */
      .dis-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: clamp(4px, 1vw, 7px);
        flex-shrink: 0;
      }

      /* ── Individual card ─────────────────────────────── */
      .dis-card {
        position: relative;
        cursor: pointer; perspective: 500px; user-select: none;
        container-type: size;
      }
      .dis-card-inner {
        position: absolute; inset: 0;
        transform-style: preserve-3d;
        transform: rotateY(180deg);          /* start showing front (emoji) */
        transition: transform .55s cubic-bezier(.4,0,.2,1);
        border-radius: clamp(6px, 1.5vw, 10px);
      }
      /* Flip to show back during guess phase */
      .dis-card.dis-flipped .dis-card-inner         { transform: rotateY(0deg);   }
      /* Force emoji visible on found / revealed cards */
      .dis-card.dis-correct .dis-card-inner,
      .dis-card.dis-reveal-correct .dis-card-inner  { transform: rotateY(180deg) !important; }

      .dis-card-back, .dis-card-front {
        position: absolute; inset: 0; border-radius: inherit;
        display: flex; align-items: center; justify-content: center;
        backface-visibility: hidden; -webkit-backface-visibility: hidden;
      }
      /* Back: same purple style as the memory level */
      .dis-card-back {
        background: linear-gradient(135deg, #6c3aad, #a855f7);
        border: 1.5px solid rgba(255,255,255,.3);
        box-shadow: 0 3px 8px rgba(0,0,0,.4);
        flex-direction: column; gap: 1px;
      }
      .dis-back-icons { font-size: clamp(.8rem, 2.2vw, 1.25rem); line-height: 1; }
      .dis-back-text  {
        font-size: clamp(.28rem, .78vw, .5rem); font-weight: 900;
        letter-spacing: 1px; color: rgba(255,255,255,.72); text-transform: uppercase;
      }
      /* Front: dark background, character image */
      .dis-card-front {
        transform: rotateY(180deg);          /* visible when inner is at 180deg */
        background: linear-gradient(135deg, #1e1a3a, #2d2060);
        border: 1.5px solid rgba(255,255,255,.18);
        box-shadow: 0 3px 8px rgba(0,0,0,.3);
        padding: 6%;
      }
      .dis-char-img {
        width: 100%; height: 100%;
        object-fit: contain;
        border-radius: clamp(3px, 1vw, 6px);
        user-select: none; pointer-events: none;
      }
      /* Hover only when cards are face-down (guess phase), not yet found */
      .dis-card.dis-flipped:not(.dis-correct):not(.dis-reveal-correct):hover .dis-card-inner {
        transform: rotateY(0deg) scale(1.06) translateY(-2px);
      }
      /* Correct: green */
      .dis-card.dis-correct .dis-card-front {
        background: linear-gradient(135deg, #0d3320, #1a8a4a);
        border-color: rgba(46,204,113,.7);
        animation: disMatchGlow .5s ease-out;
      }
      /* Revealed (timeout): gold */
      .dis-card.dis-reveal-correct .dis-card-front {
        background: linear-gradient(135deg, #3a2200, #8a5a00);
        border-color: rgba(255,215,0,.7);
        animation: disMatchGlow .5s ease-out;
      }
      /* Wrong click: shake + red tint */
      .dis-card.dis-wrong .dis-card-inner {
        animation: shake .35s ease;
        border-color: rgba(255,80,80,.6);
      }

      @keyframes disMatchGlow {
        0%  { box-shadow: 0 0 0  rgba(46,204,113,0); }
        50% { box-shadow: 0 0 18px rgba(46,204,113,.85); }
        100%{ box-shadow: 0 0 7px rgba(46,204,113,.4); }
      }

      /* ── SIDEBAR ─────────────────────────────────────── */
      .dis-sidebar-wrap {
        display: flex; flex-direction: column; align-items: center;
        justify-content: space-between;
        height: 100%; padding: 10px 6px; gap: 6px;
      }

      /* Space icon at top */
      .dis-sb-space { font-size: 1.4rem; line-height: 1; }

      /* Round result dots */
      .dis-round-dots {
        display: flex; flex-direction: column; align-items: center;
        gap: 4px;
      }
      .dis-rd-dot {
        font-size: clamp(.85rem, 2vw, 1.1rem);
        line-height: 1.2;
        transition: transform .3s;
      }
      .dis-rd-dot:last-child { }

      /* Vertical star track */
      .dis-track-area {
        flex: 1; position: relative;
        width: 36px; display: flex;
        align-items: center; justify-content: center;
        min-height: 0;
      }
      .dis-track-bar {
        position: absolute;
        width: 6px; top: 0; bottom: 0;
        border-radius: 3px;
        background: linear-gradient(to bottom,
          rgba(120,160,255,.55) 0%,
          rgba(50,120,50,.45) 100%);
      }
      /* Third marks on the bar */
      .dis-mark {
        position: absolute;
        width: 14px; height: 3px;
        background: rgba(255,255,255,.35);
        border-radius: 2px;
        left: 50%; transform: translateX(-50%);
      }
      /* Star element */
      .dis-star-el {
        position: absolute;
        font-size: clamp(1.2rem, 3vw, 1.65rem);
        bottom: 4%;
        left: 50%; transform: translateX(-50%);
        transition: bottom 1s cubic-bezier(.34,1.56,.64,1);
        filter: drop-shadow(0 0 6px rgba(255,215,0,.85));
        z-index: 2;
        line-height: 1;
      }
      .dis-star-el.dis-star-glow {
        animation: disStarPop .6s ease-out;
      }
      @keyframes disStarPop {
        0%  { filter: drop-shadow(0 0 6px rgba(255,215,0,.85));  transform: translateX(-50%) scale(1);   }
        40% { filter: drop-shadow(0 0 22px rgba(255,215,0,1));   transform: translateX(-50%) scale(1.45); }
        100%{ filter: drop-shadow(0 0 8px rgba(255,215,0,.85));  transform: translateX(-50%) scale(1);   }
      }

      /* Earth icon at bottom */
      .dis-sb-earth { font-size: 1.4rem; line-height: 1; }

      /* ── Question image (shown in q-counter during guess) ── */
      .dis-q-img {
        width: clamp(1.9rem, 4.5vw, 2.8rem);
        height: clamp(1.9rem, 4.5vw, 2.8rem);
        vertical-align: middle;
        object-fit: cover;
        border-radius: 6px;
        border: 2px solid rgba(255,215,0,.55);
        margin: 0 5px 0 3px;
      }

      /* ── Result screen decoration ─────────────────────── */
      .dis-win-anim {
        position: absolute; top: 24%; left: 50%; transform: translateX(-50%);
        display: flex; gap: 8px; z-index: 3;
        animation: bounce-in .6s ease-out;
      }
      .dis-win-img {
        width: clamp(2.5rem, 7vw, 3.8rem);
        height: clamp(2.5rem, 7vw, 3.8rem);
        border-radius: 50%;
        object-fit: cover;
        border: 2.5px solid rgba(255,215,0,.7);
        box-shadow: 0 0 12px rgba(255,215,0,.4);
      }

      /* ── Space scenery ───────────────────────────────── */
      #dis-scenery {
        position: absolute; inset: 0;
        pointer-events: none; overflow: hidden; z-index: 0;
      }
      /* Ensure game UI stays above scenery */
      .dis-theme .top-bar,
      .dis-theme .game-main { position: relative; z-index: 1; }

      /* Twinkling star dots */
      .dis-sdot {
        position: absolute; border-radius: 50%;
        background: rgba(255,255,255,.9);
        animation: dis-sdot-twinkle var(--dur,3s) var(--del,0s) ease-in-out infinite;
      }
      @keyframes dis-sdot-twinkle {
        0%,100% { opacity: .07; transform: scale(1);   }
        50%     { opacity: .80; transform: scale(1.7); }
      }

      /* Spaceships crossing horizontally */
      .dis-ship {
        position: absolute; will-change: transform;
        filter: drop-shadow(0 0 5px rgba(120,210,255,.55));
        opacity: .82;
      }
      .dis-ship-ltr { animation: dis-fly-ltr linear infinite; }
      .dis-ship-rtl { animation: dis-fly-rtl linear infinite; }
      @keyframes dis-fly-ltr {
        from { transform: translateX(-14vw); }
        to   { transform: translateX(114vw); }
      }
      @keyframes dis-fly-rtl {
        from { transform: translateX(114vw); }
        to   { transform: translateX(-14vw); }
      }

      /* Floating planets / celestial bodies */
      .dis-planet {
        position: absolute; pointer-events: none;
        animation: dis-planet-bob ease-in-out infinite;
        filter: drop-shadow(0 0 10px rgba(255,255,255,.15));
      }
      @keyframes dis-planet-bob {
        0%,100% { transform: translateY(0)     rotate(0deg);  }
        50%     { transform: translateY(-13px) rotate(5deg);  }
      }

      /* Shooting stars (comets) */
      .dis-comet {
        position: absolute;
        width: 2px; height: clamp(45px,9vh,85px);
        background: linear-gradient(to bottom,
          transparent 0%, rgba(255,255,255,.88) 45%, transparent 100%);
        border-radius: 2px;
        opacity: 0;
        animation: dis-comet-fly linear infinite;
      }
      @keyframes dis-comet-fly {
        0%  { transform: rotate(-42deg) translateY(-110px); opacity: 0; }
        7%  { opacity: 1; }
        33% { transform: rotate(-42deg) translateY(115vh);  opacity: 0; }
        100%{ transform: rotate(-42deg) translateY(115vh);  opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }

  function _buildScenery() {
    const r = (a, b) => (a + Math.random() * (b - a)).toFixed(1);

    // 20 random twinkling star dots
    const stars = Array.from({ length: 20 }, () => {
      const sz = r(1.2, 3.4);
      return `<div class="dis-sdot" style="top:${r(2,96)}%;left:${r(0,100)}%;width:${sz}px;height:${sz}px;--dur:${r(2,6)}s;--del:-${r(0,6)}s"></div>`;
    }).join('');

    return `
      ${stars}
      <!-- Spaceships -->
      <div class="dis-ship dis-ship-ltr" style="top:10%;font-size:clamp(.9rem,2.2vw,1.55rem);animation-duration:23s;animation-delay:-4s">🛸</div>
      <div class="dis-ship dis-ship-rtl" style="top:66%;font-size:clamp(.85rem,2vw,1.3rem);animation-duration:19s;animation-delay:-10s">🛸</div>
      <div class="dis-ship dis-ship-ltr" style="top:38%;font-size:clamp(.65rem,1.6vw,1rem);animation-duration:34s;animation-delay:-22s">🛰️</div>
      <div class="dis-ship dis-ship-rtl" style="top:82%;font-size:clamp(.7rem,1.7vw,1.1rem);animation-duration:27s;animation-delay:-15s">🚀</div>
      <!-- Planets -->
      <div class="dis-planet" style="top:7%;left:1.5%;animation-duration:10s;animation-delay:0s;font-size:clamp(1.8rem,4vw,3rem);opacity:.38">🪐</div>
      <div class="dis-planet" style="top:50%;right:1.5%;animation-duration:14s;animation-delay:-6s;font-size:clamp(1.3rem,3vw,2.2rem);opacity:.42">🌙</div>
      <div class="dis-planet" style="top:78%;left:3%;animation-duration:18s;animation-delay:-9s;font-size:clamp(.9rem,2vw,1.4rem);opacity:.3">🌍</div>
      <!-- Shooting stars -->
      <div class="dis-comet" style="top:4%;right:20%;animation-duration:12s;animation-delay:-1s"></div>
      <div class="dis-comet" style="top:20%;left:52%;animation-duration:19s;animation-delay:-8s"></div>
      <div class="dis-comet" style="top:9%;right:58%;animation-duration:15s;animation-delay:-13s"></div>
    `;
  }

  function applyTheme() {
    Engine.el('screen-game').classList.add('dis-theme');

    // Inject space scenery (only once — engine removes it on level change)
    if (!document.getElementById('dis-scenery')) {
      const scenery = document.createElement('div');
      scenery.id        = 'dis-scenery';
      scenery.innerHTML = _buildScenery();
      Engine.el('screen-game').insertBefore(scenery, Engine.el('screen-game').firstChild);
    }

    Engine.el('game-sidebar').innerHTML = `
      <div class="dis-sidebar-wrap">
        <div class="dis-sb-space">🌌</div>
        <div class="dis-round-dots">
          <div class="dis-rd-dot" id="dis-rd-0">○</div>
          <div class="dis-rd-dot" id="dis-rd-1">○</div>
          <div class="dis-rd-dot" id="dis-rd-2">○</div>
        </div>
        <div class="dis-track-area" id="dis-sidebar">
          <div class="dis-track-bar">
            <div class="dis-mark" style="bottom:33%"></div>
            <div class="dis-mark" style="bottom:66%"></div>
          </div>
          <div class="dis-star-el" id="dis-star">⭐</div>
        </div>
        <div class="dis-sb-earth">🌍</div>
      </div>
    `;
  }

  function buildDots()    { /* sidebar handles progress */ }
  function setProgress()  { /* handled by _updateRoundDots + _moveStar */ }

  function renderCard(q, idx) {
    if (idx !== 0) return;

    // Prevent engine timer/flow from interfering
    Engine.state.answered = true;

    // Clear any running countdown
    if (_cdID) { clearInterval(_cdID); _cdID = null; }

    // Reset state
    _round         = 0;
    _correctRounds = 0;
    _roundResults  = [];
    _lock          = false;
    _phase         = 'idle';

    Engine.el('q-counter').textContent = '🏰 Disney';
    Engine.el('feedback').textContent  = '';

    // Reset star to base position without animation
    const star = _el('dis-star');
    if (star) {
      star.style.transition = 'none';
      star.style.bottom     = STAR_POS[0];
      requestAnimationFrame(() => { star.style.transition = ''; });
    }

    _updateRoundDots();

    setTimeout(_startRound, 350);
  }

  function generateQuestions() {
    // Single dummy question — renderCard takes full control
    return [{ correct: '_', options: [] }];
  }

  function onResult() { /* result is populated inside _winGame */ }

  return {
    id:               'disney',
    name:             '🏰 Disney',
    nextLevelId:      'tictac',
    answerClass:      'ans-btn',
    winTitle:         '<span style="color:#ffd700">🏰 ¡Memoria de campeón!</span>',
    loseTitle:        '<span style="color:#4ecdc4">💪 ¡Buen intento!</span>',
    winMessage:       '¡Recuerdas los personajes Disney muy bien! 🌟',
    levelIntroMessage:'¡A poner a prueba tu memoria Disney! 🏰',
    mount, applyTheme, buildDots, setProgress, renderCard, generateQuestions, onResult,
  };

})();
