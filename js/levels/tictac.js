'use strict';

const TicTacLevel = (() => {

  /* ── Constants ──────────────────────────────────────────── */
  const WINS_NEEDED = 3;
  const MAX_GAMES   = 5;
  const LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  const DIFF_LABELS = ['MUY FÁCIL','FÁCIL','NORMAL','DIFÍCIL','¡IMPOSIBLE!'];
  const DIFF_STARS  = ['⭐','⭐⭐','⭐⭐⭐','⭐⭐⭐⭐','⭐⭐⭐⭐⭐'];

  /* ── State ──────────────────────────────────────────────── */
  let _board      = Array(9).fill(null);
  let _userWins   = 0;
  let _cpuWins    = 0;
  let _draws      = 0;
  let _userTurn   = true;
  let _userFirst  = true;
  let _gameActive = false;
  let _lastMove   = -1;
  let _gameNum    = 1;
  let _resizeObs  = null;

  /* ── mount: inject CSS + font once ─────────────────────── */
  function mount() {
    // Press Start 2P — pixel font
    const fontLink = document.createElement('link');
    fontLink.rel  = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    document.head.appendChild(fontLink);

    const s = document.createElement('style');
    s.textContent = `
      /* =====================================================
         MARIO WORLD — SCREEN BACKGROUNDS
      ===================================================== */
      #screen-game.ttt-theme {
        background: linear-gradient(180deg,#5c94fc 0%,#7ab4fc 55%,#a8d4f5 100%);
        overflow: hidden;
      }
      #screen-result.ttt-theme {
        background: linear-gradient(160deg,#1a0a3a 0%,#2e1060 50%,#160830 100%);
      }

      /* Scenery layer (injected in applyTheme) */
      #ttt-scenery {
        position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
      }
      /* CSS clouds */
      .ttt-cloud {
        position: absolute;
        background: #fff;
        border-radius: 100px;
        height: calc(var(--w) * .38);
        width: var(--w);
        filter: drop-shadow(0 3px 6px rgba(0,0,0,.12));
        animation: ttt-cloud-drift var(--spd, 8s) ease-in-out infinite;
      }
      .ttt-cloud::before {
        content: ''; position: absolute; background: #fff; border-radius: 50%;
        width: 48%; height: 180%; top: -90%; left: 17%;
      }
      .ttt-cloud::after {
        content: ''; position: absolute; background: #fff; border-radius: 50%;
        width: 36%; height: 140%; top: -60%; right: 16%;
      }
      @keyframes ttt-cloud-drift {
        0%,100% { transform: translateX(0); }
        50%     { transform: translateX(var(--drift, 18px)); }
      }
      /* Hills + ground */
      .ttt-hills {
        position: absolute; bottom: 0; left: 0; right: 0; height: 110px;
        background:
          radial-gradient(ellipse 220px 110px at 12%  100%, #4caf34 49%, transparent 50%),
          radial-gradient(ellipse 270px 130px at 50%  100%, #4caf34 49%, transparent 50%),
          radial-gradient(ellipse 200px  95px at 84%  100%, #4caf34 49%, transparent 50%),
          linear-gradient(to top, #3a9228 0, #3a9228 44px, transparent 44px);
      }
      .ttt-hills::after {
        content: ''; position: absolute;
        bottom: 44px; left: 0; right: 0; height: 6px;
        background: repeating-linear-gradient(90deg,
          #2e7a1e 0,#2e7a1e 40px,#52c234 40px,#52c234 80px);
      }
      /* Decorative floating blocks */
      .ttt-deco-block {
        position: absolute;
        width: 36px; height: 36px;
        background: linear-gradient(145deg,#ffd700,#e89000);
        border: 3px solid #7a4000;
        border-radius: 5px;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; color: #7a4000;
        font-family: 'Press Start 2P', monospace;
        box-shadow: inset 3px 3px 0 rgba(255,255,255,.45),
                    inset -2px -2px 0 rgba(0,0,0,.2),
                    0 3px 0 #4a2000;
        animation: ttt-block-bob var(--bob, 2.5s) ease-in-out infinite;
      }
      @keyframes ttt-block-bob {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-6px); }
      }
      /* Pipe */
      .ttt-pipe {
        position: absolute; bottom: 44px; display: flex; flex-direction: column; align-items: center;
      }
      .ttt-pipe-head {
        width: 44px; height: 14px;
        background: linear-gradient(90deg,#52c234,#3a9228);
        border: 3px solid #2e7a1e; border-radius: 4px 4px 0 0;
        box-shadow: inset 3px 0 0 rgba(255,255,255,.25);
      }
      .ttt-pipe-body {
        width: 34px; height: 52px;
        background: linear-gradient(90deg,#52c234,#3a9228);
        border: 3px solid #2e7a1e; border-top: none;
        box-shadow: inset 3px 0 0 rgba(255,255,255,.2);
      }
      /* Castle silhouette */
      .ttt-castle {
        position: absolute; bottom: 44px; display: flex; flex-direction: column; align-items: center;
        opacity: .7;
      }
      .ttt-castle-turrets {
        display: flex; gap: 4px; align-items: flex-end;
      }
      .ttt-turret-small {
        width: 14px; height: 22px;
        background: #e8c87a; border: 2px solid #a07030; border-radius: 2px 2px 0 0;
      }
      .ttt-turret-main {
        width: 22px; height: 34px;
        background: #f0d490; border: 2px solid #a07030; border-radius: 2px 2px 0 0;
      }
      .ttt-castle-body {
        width: 60px; height: 40px;
        background: #e8c870; border: 2px solid #a07030;
        display: flex; align-items: center; justify-content: center;
      }
      .ttt-castle-door {
        width: 18px; height: 26px; background: #5a3010; border-radius: 9px 9px 0 0;
      }

      /* =====================================================
         GAME UI LAYER  (z-index above scenery)
      ===================================================== */
      .ttt-theme .top-bar {
        background: rgba(0,0,0,.78);
        border-bottom: 3px solid rgba(255,215,0,.35);
        position: relative; z-index: 2;
      }
      .ttt-theme #q-counter {
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(.42rem, 1.1vw, .62rem);
        color: #ffd700; letter-spacing: .5px;
      }
      .ttt-theme .btn-home {
        font-family: 'Press Start 2P', monospace;
        font-size: .5rem; color: #fff;
      }
      .ttt-theme .timer-wrap,
      .ttt-theme .game-score { visibility: hidden; }
      .ttt-theme .answers-grid,
      .ttt-theme #feedback { display: none !important; }
      .ttt-theme #game-sidebar,
      .ttt-theme .game-main  { position: relative; z-index: 1; }

      /* q-area + q-card transparent */
      .ttt-theme .q-area {
        padding: 4px 8px; justify-content: center;
        align-items: center; min-height: 0; overflow: hidden;
      }
      .ttt-theme #q-card {
        flex: 1; min-height: 0;
        background: transparent !important;
        backdrop-filter: none !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        animation: none !important;
        display: flex !important; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 10px; width: 100%;
      }
      .ttt-theme .game-main { align-items: stretch; }

      /* =====================================================
         GOAL LABEL
      ===================================================== */
      .ttt-goal {
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(.38rem, 1.1vw, .6rem);
        color: #ffd700;
        text-align: center;
        letter-spacing: .4px;
        line-height: 1.5;
        text-shadow: 0 2px 6px rgba(0,0,0,.6);
      }

      /* =====================================================
         STATUS BAR (Mario text box style)
      ===================================================== */
      .ttt-status {
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(.45rem, 1.4vw, .72rem);
        background: rgba(0,0,0,.82);
        color: #fff; letter-spacing: .5px;
        border: 3px solid rgba(255,215,0,.6);
        border-radius: 6px;
        padding: 6px 14px;
        text-align: center; min-height: 2em; min-width: 180px;
        box-shadow: 0 4px 0 rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.1);
        transition: border-color .25s, color .25s;
      }
      .ttt-status.user-turn { color: #ff9090; border-color: #ff6060; }
      .ttt-status.cpu-turn  { color: #90e890; border-color: #52c234; }
      .ttt-status.game-end  { color: #ffd700; border-color: #ffd700; }

      /* =====================================================
         BOARD — Mario ? blocks
      ===================================================== */
      .ttt-board {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        grid-template-rows:    repeat(3,1fr);
        gap: clamp(5px,1.2vw,8px);
        filter: drop-shadow(0 8px 18px rgba(0,0,0,.45));
      }
      .ttt-cell {
        background: linear-gradient(155deg,#ffd700,#e89000);
        border: 3px solid #7a4000;
        border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; user-select: none;
        container-type: size;
        box-shadow:
          inset 4px  4px 0 rgba(255,255,255,.45),
          inset -3px -3px 0 rgba(0,0,0,.22),
          0 5px 0 #4a2000;
        transition: transform .1s, filter .1s;
      }
      .ttt-cell:not(.taken)::before {
        content: '?';
        font-family: 'Press Start 2P', monospace;
        font-size: 34cqmin; color: #7a4000;
        display: flex; align-items: center; justify-content: center;
      }
      .ttt-cell:hover:not(.taken) {
        transform: translateY(-3px);
        filter: brightness(1.12);
      }
      .ttt-cell:active:not(.taken) {
        transform: translateY(2px);
        box-shadow:
          inset 4px 4px 0 rgba(255,255,255,.45),
          inset -3px -3px 0 rgba(0,0,0,.22),
          0 2px 0 #4a2000;
      }
      .ttt-cell.taken { cursor: default; }
      .ttt-cell.win-cell {
        background: linear-gradient(155deg,#fff176,#ffd700) !important;
        border-color: #ffd700 !important;
        animation: ttt-win-pulse .55s ease-in-out 3;
        box-shadow: 0 0 22px rgba(255,215,0,.8), 0 5px 0 #c8a000 !important;
      }
      @keyframes ttt-win-pulse {
        0%,100% { transform: scale(1) translateY(0); }
        50%     { transform: scale(1.12) translateY(-4px); }
      }

      /* =====================================================
         CHARACTER IMAGES  (Mario / Bowser PNGs)
      ===================================================== */
      .ttt-cell.taken {
        background: rgba(0,0,0,.18) !important;
        border-color: rgba(255,255,255,.18) !important;
        box-shadow: inset 0 0 12px rgba(0,0,0,.3), 0 3px 0 rgba(0,0,0,.3) !important;
      }
      .ttt-char {
        width: 88cqmin; height: 88cqmin;
        object-fit: contain; pointer-events: none;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,.55));
      }
      .ttt-char.mario-char {
        filter: drop-shadow(0 4px 10px rgba(0,0,0,.55))
                drop-shadow(0 0 8px rgba(255,80,80,.4));
      }
      .ttt-char.bowser-char {
        filter: drop-shadow(0 4px 10px rgba(0,0,0,.55))
                drop-shadow(0 0 8px rgba(255,165,0,.45));
      }
      .ttt-char.is-new {
        animation: ttt-mark-pop .32s cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes ttt-mark-pop {
        0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
        65%  { transform: scale(1.25) rotate(4deg); }
        100% { transform: scale(1) rotate(0); opacity: 1; }
      }

      /* =====================================================
         COIN FLIP  (? block bouncing)
      ===================================================== */
      .ttt-coinflip {
        display: flex; flex-direction: column; align-items: center; gap: 20px;
      }
      .ttt-flip-block {
        width: 80px; height: 80px;
        background: linear-gradient(145deg,#ffd700,#e89000);
        border: 4px solid #7a4000; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Press Start 2P', monospace;
        font-size: 2rem; color: #7a4000;
        box-shadow: inset 5px 5px 0 rgba(255,255,255,.45),
                    inset -4px -4px 0 rgba(0,0,0,.22),
                    0 6px 0 #4a2000;
        animation: ttt-flip-anim 1.1s cubic-bezier(.4,0,.2,1) forwards;
      }
      @keyframes ttt-flip-anim {
        0%   { transform: scale(1)   translateY(0)   rotateY(0); }
        25%  { transform: scale(1.3) translateY(-28px) rotateY(180deg); }
        55%  { transform: scale(1.1) translateY(-10px) rotateY(540deg); }
        100% { transform: scale(1)   translateY(0)   rotateY(720deg); }
      }
      .ttt-cf-msg {
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(.55rem,2vw,.85rem);
        color: #ffd700; text-align: center; letter-spacing: .5px;
        background: rgba(0,0,0,.75); border: 2px solid rgba(255,215,0,.5);
        border-radius: 6px; padding: 8px 16px;
        box-shadow: 0 3px 0 rgba(0,0,0,.4);
        animation: bounce-in .4s ease-out;
      }

      /* =====================================================
         MARIO HUD  SIDEBAR
      ===================================================== */
      .ttt-hud {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 6px;
        padding: 8px 4px; height: 100%;
        font-family: 'Press Start 2P', monospace;
      }
      .ttt-hud-player {
        display: flex; flex-direction: column; align-items: center; gap: 3px;
        background: rgba(0,0,0,.7); border-radius: 6px;
        padding: 6px 8px; width: 100%;
        border: 2px solid rgba(255,255,255,.12);
      }
      .ttt-hud-name {
        font-size: .48rem; letter-spacing: .5px; line-height: 1.3;
      }
      .ttt-hud-char {
        width: 52px; height: 52px; object-fit: contain;
        filter: drop-shadow(0 2px 5px rgba(0,0,0,.5));
      }
      .ttt-hud-score {
        font-size: 1.75rem; line-height: 1; font-weight: 400;
      }
      .ttt-hud-score.bump { animation: ttt-num-bump .4s ease; }
      @keyframes ttt-num-bump { 0%,100%{transform:scale(1)} 50%{transform:scale(1.7)} }
      .ttt-hud-mario  .ttt-hud-name  { color: #ff9090; }
      .ttt-hud-mario  .ttt-hud-score { color: #ff6060; }
      .ttt-hud-bowser .ttt-hud-name  { color: #90ee90; }
      .ttt-hud-bowser .ttt-hud-score { color: #52c234; }
      .ttt-hud-sep { font-size: .55rem; color: rgba(255,255,255,.3); }
      .ttt-hud-info {
        background: rgba(0,0,0,.7); border-radius: 6px;
        padding: 5px 6px; width: 100%; text-align: center;
        border: 2px solid rgba(255,215,0,.25);
      }
      .ttt-hud-world {
        font-size: .55rem; color: #ffd700; letter-spacing: .5px;
      }
      .ttt-hud-diff  {
        font-size: .38rem; color: rgba(255,255,200,.6);
        margin-top: 3px; line-height: 1.5;
      }
      .ttt-hud-draws {
        font-size: .38rem; color: rgba(255,255,255,.35); margin-top: 2px;
      }

      /* Result extras */
      .ttt-res-anim {
        position: absolute; top: 20%; left: 50%; transform: translateX(-50%);
        font-size: 3rem; z-index: 3; white-space: nowrap;
        animation: bounce-in .55s ease-out;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── applyTheme ─────────────────────────────────────────── */
  function applyTheme() {
    Engine.el('screen-game').className   = 'screen ttt-theme';
    Engine.el('screen-result').className = 'screen hidden ttt-theme';

    // Inject Mario world scenery (only once per game start)
    const gameScreen = Engine.el('screen-game');
    let scenery = document.getElementById('ttt-scenery');
    if (!scenery) {
      scenery = document.createElement('div');
      scenery.id = 'ttt-scenery';
      scenery.innerHTML = `
        <!-- Clouds -->
        <div class="ttt-cloud" style="--w:110px;--spd:9s;--drift:20px;top:7%;left:4%"></div>
        <div class="ttt-cloud" style="--w:140px;--spd:13s;--drift:14px;top:4%;left:54%"></div>
        <div class="ttt-cloud" style="--w:80px;--spd:7s;--drift:22px;top:17%;left:28%"></div>
        <div class="ttt-cloud" style="--w:90px;--spd:11s;--drift:16px;top:10%;left:75%"></div>
        <!-- Floating decorative ? blocks -->
        <div class="ttt-deco-block" style="--bob:2.2s;top:30%;left:3%">?</div>
        <div class="ttt-deco-block" style="--bob:3.1s;top:36%;right:4%">?</div>
        <!-- Pipe -->
        <div class="ttt-pipe" style="left:4%">
          <div class="ttt-pipe-head"></div>
          <div class="ttt-pipe-body"></div>
        </div>
        <!-- Castle -->
        <div class="ttt-castle" style="right:6%">
          <div class="ttt-castle-turrets">
            <div class="ttt-turret-small"></div>
            <div class="ttt-turret-main"></div>
            <div class="ttt-turret-small"></div>
          </div>
          <div class="ttt-castle-body">
            <div class="ttt-castle-door"></div>
          </div>
        </div>
        <!-- Hills + ground -->
        <div class="ttt-hills"></div>
      `;
      gameScreen.insertBefore(scenery, gameScreen.firstChild);
    }

    _updateSidebar();
  }

  /* ── Sidebar HUD ────────────────────────────────────────── */
  function _updateSidebar() {
    const diff = DIFF_LABELS[Math.min(_gameNum - 1, DIFF_LABELS.length - 1)];
    const stars = DIFF_STARS[Math.min(_gameNum - 1, DIFF_STARS.length - 1)];
    Engine.el('game-sidebar').innerHTML = `
      <div class="ttt-hud">
        <div class="ttt-hud-player ttt-hud-mario">
          <img src="src/mario.webp" class="ttt-hud-char" alt="Mario">
          <div class="ttt-hud-name">MARIO</div>
          <div class="ttt-hud-score" id="ttt-uw">${_userWins}</div>
        </div>
        <div class="ttt-hud-sep">VS</div>
        <div class="ttt-hud-player ttt-hud-bowser">
          <img src="src/bowser.webp" class="ttt-hud-char" alt="Bowser">
          <div class="ttt-hud-name">BOWSER</div>
          <div class="ttt-hud-score" id="ttt-cw">${_cpuWins}</div>
        </div>
        <div class="ttt-hud-info">
          <div class="ttt-hud-world">MUNDO 1-${_gameNum}</div>
          <div class="ttt-hud-diff">${stars}<br>${diff}</div>
          <div class="ttt-hud-draws">EMPATES ${_draws}</div>
        </div>
      </div>
    `;
  }

  function buildDots()  {}
  function setProgress(){}

  /* ── Questions (single dummy) ───────────────────────────── */
  function generateQuestions() {
    return [{ correct: '_', options: [] }];
  }

  /* ── Entry point ────────────────────────────────────────── */
  function renderCard(_q, idx) {
    if (idx !== 0) return;

    Engine.state.answered = true;
    _userWins = 0; _cpuWins = 0; _draws = 0; _lastMove = -1; _gameNum = 1;
    _userFirst = Math.random() < 0.5;

    Engine.el('answers-grid').innerHTML = '';
    Engine.el('feedback').textContent   = '';
    _updateCounter();
    _updateSidebar();
    _showCoinFlip();
  }

  /* ── Coin flip ──────────────────────────────────────────── */
  function _showCoinFlip() {
    Engine.el('q-card').innerHTML = `
      <div class="ttt-coinflip">
        <div class="ttt-flip-block">?</div>
        <p class="ttt-cf-msg" id="ttt-cf-msg">SORTEANDO...</p>
      </div>`;

    setTimeout(() => {
      const msg = Engine.el('ttt-cf-msg');
      if (msg) msg.textContent = _userFirst
        ? '¡EMPIEZA MARIO! 🍄'
        : '¡EMPIEZA BOWSER! 👾';
    }, 1200);

    setTimeout(_startGame, 2500);
  }

  /* ── Game start ─────────────────────────────────────────── */
  function _startGame() {
    _gameNum    = _userWins + _cpuWins + _draws + 1;
    _board      = Array(9).fill(null);
    _gameActive = true;
    _userTurn   = _userFirst;
    _lastMove   = -1;

    _buildBoard();
    _updateCounter();
    _updateSidebar();

    if (!_userTurn) {
      _setStatus('BOWSER PIENSA... 👾', 'cpu-turn');
      setTimeout(_cpuMove, 800);
    } else {
      _setStatus('¡TU TURNO, MARIO! 🍄', 'user-turn');
    }
  }

  /* ── Board ──────────────────────────────────────────────── */
  function _buildBoard() {
    const qCard = Engine.el('q-card');
    qCard.innerHTML = `
      <div class="ttt-goal">Gana el primero que llegue a 3 victorias</div>
      <div class="ttt-status" id="ttt-status"></div>
      <div class="ttt-board"  id="ttt-board"></div>
    `;
    _renderCells();

    function _fit() {
      const { width, height } = qCard.getBoundingClientRect();
      const size  = Math.floor(Math.min(width * .88, height * .72, 330));
      const board = Engine.el('ttt-board');
      if (board && size > 0) { board.style.width = size + 'px'; board.style.height = size + 'px'; }
    }
    _fit();
    if (_resizeObs) _resizeObs.disconnect();
    _resizeObs = new ResizeObserver(_fit);
    _resizeObs.observe(qCard);
  }

  function _renderCells() {
    const boardEl = Engine.el('ttt-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    _board.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell' + (val ? ' taken' : '');
      if (val) {
        const isNew = (i === _lastMove);
        const src   = val === 'X' ? 'src/mario.webp'  : 'src/bowser.webp';
        const alt   = val === 'X' ? 'Mario'           : 'Bowser';
        const cls   = val === 'X' ? 'mario-char'      : 'bowser-char';
        cell.innerHTML =
          `<img src="${src}" alt="${alt}" class="ttt-char ${cls}${isNew ? ' is-new' : ''}">`;
      }
      cell.addEventListener('click', () => _handleClick(i));
      boardEl.appendChild(cell);
    });
  }

  /* ── Move handling ──────────────────────────────────────── */
  function _handleClick(idx) {
    if (!_gameActive || !_userTurn || _board[idx]) return;
    _board[idx] = 'X'; _lastMove = idx;
    _renderCells();
    const result = _checkResult();
    if (result) { _handleGameEnd(result); return; }
    _userTurn = false;
    _setStatus('BOWSER PIENSA... 👾', 'cpu-turn');
    setTimeout(_cpuMove, 580);
  }

  function _cpuMove() {
    if (!_gameActive) return;
    const idx    = _getBestMove();
    _board[idx]  = 'O'; _lastMove = idx;
    _renderCells();
    const result = _checkResult();
    if (result) { _handleGameEnd(result); return; }
    _userTurn = true;
    _setStatus('¡TU TURNO, MARIO! 🍄', 'user-turn');
  }

  /* ── AI ─────────────────────────────────────────────────── */
  function _getBestMove() {
    const empty = _board.reduce((a, v, i) => v === null ? [...a, i] : a, []);

    if (_gameNum >= 5) return _minimaxMove();
    if (_gameNum === 1) return Engine.pick(empty);

    const win = _findWinMove('O');
    if (win !== -1) return win;

    if (_gameNum === 2) {
      if (Math.random() < .60) return Engine.pick(empty);
      if (_board[4] === null) return 4;
      const c = [0,2,6,8].filter(i => _board[i] === null);
      return c.length ? Engine.pick(c) : Engine.pick(empty);
    }

    const block = _findWinMove('X');
    if (block !== -1) return block;

    const rnd = _gameNum === 3 ? .35 : .10;
    if (Math.random() < rnd) return Engine.pick(empty);

    if (_board[4] === null) return 4;
    const corners = [0,2,6,8].filter(i => _board[i] === null);
    if (corners.length) return Engine.pick(corners);
    const edges   = [1,3,5,7].filter(i => _board[i] === null);
    if (edges.length) return Engine.pick(edges);
    return empty[0];
  }

  function _minimaxMove() {
    let bestScore = -Infinity, bestMove = -1;
    _board.forEach((v, i) => {
      if (v !== null) return;
      _board[i] = 'O';
      const score = _mm(false, 0);
      _board[i] = null;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    });
    return bestMove;
  }

  function _mm(isMax, depth) {
    for (const [a,b,c] of LINES) {
      if (_board[a] && _board[a] === _board[b] && _board[b] === _board[c])
        return _board[a] === 'O' ? 10 - depth : depth - 10;
    }
    if (_board.every(v => v !== null)) return 0;
    const empty = _board.reduce((a, v, i) => v === null ? [...a, i] : a, []);
    if (isMax) {
      let best = -Infinity;
      for (const i of empty) { _board[i]='O'; best=Math.max(best,_mm(false,depth+1)); _board[i]=null; }
      return best;
    } else {
      let best = Infinity;
      for (const i of empty) { _board[i]='X'; best=Math.min(best,_mm(true,depth+1)); _board[i]=null; }
      return best;
    }
  }

  function _findWinMove(mark) {
    for (const [a,b,c] of LINES) {
      const vals = [_board[a],_board[b],_board[c]];
      if (vals.filter(v=>v===mark).length===2 && vals.filter(v=>v===null).length===1)
        return [a,b,c].find(i=>_board[i]===null);
    }
    return -1;
  }

  function _checkResult() {
    for (const line of LINES) {
      const [a,b,c] = line;
      if (_board[a] && _board[a]===_board[b] && _board[b]===_board[c])
        return { winner: _board[a], line };
    }
    if (_board.every(v=>v!==null)) return { winner:'draw', line:null };
    return null;
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function _setStatus(text, cls='') {
    const el = Engine.el('ttt-status');
    if (!el) return;
    el.textContent = text;
    el.className   = 'ttt-status' + (cls ? ' '+cls : '');
  }

  function _updateCounter() {
    const gNum = Math.min(_userWins + _cpuWins + _draws + 1, MAX_GAMES);
    const diff = DIFF_LABELS[Math.min(gNum-1, DIFF_LABELS.length-1)];
    Engine.el('q-counter').textContent = `MUNDO 1-${gNum}  ${diff}`;
  }

  /* ── Game end ───────────────────────────────────────────── */
  function _handleGameEnd(result) {
    _gameActive = false;

    if (result.line) {
      const cells = Engine.el('ttt-board').children;
      result.line.forEach(i => cells[i].classList.add('win-cell'));
    }

    if (result.winner === 'X') {
      _userWins++;
      _setStatus('¡MARIO GANA! 🎉', 'game-end');
      Engine.playCorrect();
    } else if (result.winner === 'O') {
      _cpuWins++;
      _setStatus('¡BOWSER GANA! 👾', 'game-end');
      Engine.playWrong();
    } else {
      _draws++;
      _setStatus('¡EMPATE! 🤝', 'game-end');
    }

    _updateSidebar();
    _updateCounter();

    setTimeout(() => {
      const id = result.winner==='X' ? 'ttt-uw' : result.winner==='O' ? 'ttt-cw' : null;
      if (id) {
        const el = Engine.el(id);
        if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
      }
    }, 150);

    const totalGames = _userWins + _cpuWins + _draws;
    const levelOver  = _userWins===WINS_NEEDED || _cpuWins===WINS_NEEDED || totalGames>=MAX_GAMES;
    const delay      = result.winner==='draw' ? 1400 : 2000;

    if (levelOver) {
      setTimeout(_finishLevel, delay);
    } else {
      _userFirst = !_userFirst;
      setTimeout(_startGame, delay + 300);
    }
  }

  /* ── Level finish ───────────────────────────────────────── */
  function _finishLevel() {
    const totalGames  = _userWins + _cpuWins + _draws;
    const wonByTarget = _userWins === WINS_NEEDED;
    const byMaxGames  = totalGames >= MAX_GAMES && !wonByTarget && _cpuWins < WINS_NEEDED;

    let won, score;
    if (byMaxGames) {
      won   = _userWins > _cpuWins;
      score = _userWins > _cpuWins ? 650 : _cpuWins > _userWins ? 350 : 500;
    } else {
      won   = wonByTarget;
      score = won
        ? ([1000,900,800][_cpuWins]  ?? 800)
        : ([200,400,600][_userWins] ?? 200);
    }

    const isTie = byMaxGames && _userWins===_cpuWins;

    Engine.el('res-title').innerHTML =
      isTie ? `<span style="color:#ffd700">🤝 ¡EMPATE TOTAL!</span>`
      : won  ? `<span style="color:#ffd700">🎉 ¡MARIO GANA!</span>`
             : `<span style="color:#ff6060">👾 ¡BOWSER GANA!</span>`;

    const pfx = Engine.state.playerName ? `¡${Engine.state.playerName}! ` : '';
    Engine.el('res-motivator').textContent = pfx + (
      isTie ? '¡Nadie se rindió! Rematch 🔥'
      : won  ? '¡Eres todo un estratega! 🍄🧠'
             : '¡Sigue practicando, Mario! 💪🍄'
    );
    Engine.el('res-detail').textContent =
      `${score}/1000 pts  ·  🍄 ${_userWins}—${_cpuWins} 👾  ·  ${_draws} empate${_draws!==1?'s':''}`;

    Engine.animateCount(score, 'res-score-big');

    const stars = score>=900?3:score>=700?2:score>=400?1:0;
    [1,2,3].forEach(i=>{const s=Engine.el(`star-${i}`);s.style.opacity='0';s.classList.remove('pop');});
    for(let i=1;i<=stars;i++) setTimeout(()=>Engine.el(`star-${i}`).classList.add('pop'),(i-1)*320);

    const st=Engine.state, ni=st.playlistIdx+1;
    const nextId=(st.playlist.length&&ni<st.playlist.length)?st.playlist[ni]:null;
    Engine.el('res-btns').innerHTML = nextId
      ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(${score},'${nextId}')">${Engine.getLevelName(nextId)} →</button>`
      : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`;

    st.totalScore=score; st.correctAns=_userWins;
    st.totalStars+=(won?_userWins:0);
    Engine.el('badge-count').textContent=st.totalStars;

    Engine.el('result-level-extra').innerHTML = won
      ? `<div class="ttt-res-anim">🍄🏆🍄</div>`
      : isTie ? `<div class="ttt-res-anim">🍄🤝👾</div>`
              : `<div class="ttt-res-anim">👾💥👾</div>`;

    if (won) {
      Engine.createConfetti(['🍄','⭐','🎉','🏆','✨','🌟','🪙']);
      Engine.playLaunch();
      setTimeout(()=>Engine.playStars(),500);
    } else if (isTie) {
      Engine.createConfetti(['🍄','👾','🤝','⭐','🪙']);
      Engine.playStars();
    } else {
      Engine.playWrong();
    }

    Engine.showScreen('screen-result');
  }

  function onResult() {}

  /* ── Public interface ───────────────────────────────────── */
  return {
    id:               'tictac',
    name:             '❌ 3 en Raya',
    nextLevelId:      null,
    answerClass:      'ans-btn',
    winTitle:         '<span style="color:#ffd700">🎉 ¡MARIO GANA!</span>',
    loseTitle:        '<span style="color:#ff6060">👾 ¡BOWSER GANA!</span>',
    winMessage:       '¡Eres todo un estratega! 🍄🧠',
    levelIntroMessage:'¡Mario vs Bowser — 3 en Raya! 🍄',
    mount, applyTheme, buildDots, setProgress,
    renderCard, generateQuestions, onResult,
  };

})();
