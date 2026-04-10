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
  const DIFF_LABELS = [
    '⭐ Muy fácil',
    '⭐⭐ Fácil',
    '⭐⭐⭐ Normal',
    '⭐⭐⭐⭐ Difícil',
    '⭐⭐⭐⭐⭐ ¡Imposible!',
  ];

  /* ── State ──────────────────────────────────────────────── */
  let _board       = Array(9).fill(null);
  let _userWins    = 0;
  let _cpuWins     = 0;
  let _draws       = 0;
  let _userTurn    = true;
  let _userFirst   = true;
  let _gameActive  = false;
  let _lastMove    = -1;
  let _gameNum     = 1;   // 1-5, drives difficulty
  let _resizeObs   = null;

  /* ── CSS ────────────────────────────────────────────────── */
  function mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* Backgrounds */
      #screen-game.ttt-theme,
      #screen-result.ttt-theme {
        background: linear-gradient(160deg, #0a1628 0%, #1a2040 50%, #0d1a3a 100%);
      }

      /* Hide engine chrome */
      .ttt-theme .timer-wrap,
      .ttt-theme .game-score { visibility: hidden; }
      .ttt-theme .answers-grid,
      .ttt-theme #feedback { display: none !important; }

      .ttt-theme #q-counter {
        font-size: clamp(.7rem, 1.8vw, .9rem);
        font-weight: 800; color: rgba(255,255,255,.65);
      }

      /* q-card fills remaining space */
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
        gap: 12px; width: 100%;
      }
      .ttt-theme .game-main { align-items: stretch; }

      /* Status bar */
      .ttt-status {
        font-size: clamp(.88rem, 2.8vw, 1.15rem);
        font-weight: 800; color: rgba(255,255,255,.8);
        text-align: center; min-height: 1.6em;
        transition: color .25s;
      }
      .ttt-status.user-turn { color: #ff6060; }
      .ttt-status.cpu-turn  { color: #4ecdc4; }
      .ttt-status.game-end  { color: #ffd700; }

      /* Board */
      .ttt-board {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows:    repeat(3, 1fr);
        gap: clamp(6px, 1.5vw, 10px);
      }
      .ttt-cell {
        background: rgba(255,255,255,.07);
        border: 2px solid rgba(255,255,255,.13);
        border-radius: clamp(10px, 2vw, 16px);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background .18s, border-color .18s, transform .1s;
        user-select: none;
        container-type: size;
      }
      .ttt-cell:hover:not(.taken) {
        background: rgba(255,255,255,.14);
        border-color: rgba(255,255,255,.3);
        transform: scale(1.05);
      }
      .ttt-cell.taken { cursor: default; }
      .ttt-cell.win-cell {
        background: rgba(255,215,0,.18) !important;
        border-color: #ffd700 !important;
        box-shadow: 0 0 18px rgba(255,215,0,.45);
        animation: ttt-win-pulse .55s ease-in-out 3;
      }

      /* ── Mario mark (user / X) ── */
      .ttt-mark-x {
        width: 60cqmin; height: 60cqmin;
        border-radius: 50%;
        background: radial-gradient(circle at 38% 32%, #ff6060, #c80000);
        display: flex; align-items: center; justify-content: center;
        font-size: 30cqmin; font-weight: 900;
        color: white; font-style: italic; letter-spacing: -1px;
        box-shadow: 0 0 16px rgba(220,0,0,.6),
                    inset 0 3px 6px rgba(255,255,255,.25);
        border: 2px solid rgba(255,160,160,.25);
      }

      /* ── Bowser mark (CPU / O) ── */
      .ttt-mark-o {
        width: 60cqmin; height: 60cqmin;
        /* irregular spiky silhouette */
        border-radius: 28% 52% 28% 52% / 52% 28% 52% 28%;
        background: radial-gradient(circle at 38% 32%, #55cc44, #1a7a1a);
        display: flex; align-items: center; justify-content: center;
        font-size: 26cqmin; font-weight: 900; color: #ffd700;
        box-shadow: 0 0 16px rgba(30,130,30,.65),
                    inset 0 3px 6px rgba(255,255,255,.15);
        border: 2px solid rgba(100,220,100,.2);
      }

      /* Pop-in animation — only on newly placed mark */
      .ttt-mark-x.is-new,
      .ttt-mark-o.is-new {
        animation: ttt-mark-pop .3s cubic-bezier(.34, 1.56, .64, 1);
      }

      @keyframes ttt-mark-pop {
        0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
        65%  { transform: scale(1.3) rotate(5deg); }
        100% { transform: scale(1)  rotate(0deg); opacity: 1; }
      }
      @keyframes ttt-win-pulse {
        0%,100% { transform: scale(1);    }
        50%     { transform: scale(1.09); }
      }

      /* Coin flip */
      .ttt-coinflip {
        display: flex; flex-direction: column; align-items: center; gap: 18px;
      }
      .ttt-coin {
        font-size: 4.5rem;
        animation: ttt-spin 1.1s cubic-bezier(.4, 0, .2, 1) forwards;
      }
      @keyframes ttt-spin {
        0%   { transform: rotateY(0)       scale(1);   }
        40%  { transform: rotateY(720deg)  scale(1.4); }
        100% { transform: rotateY(1080deg) scale(1);   }
      }
      .ttt-cf-msg {
        font-size: clamp(.95rem, 3.5vw, 1.45rem);
        font-weight: 800; color: #ffd700; text-align: center;
        animation: bounce-in .4s ease-out;
      }

      /* Sidebar */
      .ttt-sidebar {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 10px;
        padding: 10px 4px; height: 100%;
      }
      .ttt-sb-label {
        font-size: .6rem; font-weight: 800; text-transform: uppercase;
        letter-spacing: .5px; color: rgba(255,255,255,.38); text-align: center;
      }
      .ttt-sb-players {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
      }
      .ttt-sb-player {
        display: flex; flex-direction: column; align-items: center; gap: 2px;
      }
      .ttt-sb-icon { font-size: 1.4rem; line-height: 1; }
      .ttt-sb-num  {
        font-size: 1.9rem; font-weight: 900; line-height: 1;
      }
      .ttt-sb-num.bump { animation: ttt-num-bump .4s ease; }
      @keyframes ttt-num-bump {
        0%,100% { transform: scale(1);   }
        50%     { transform: scale(1.6); }
      }
      .ttt-sb-sep {
        font-size: .85rem; color: rgba(255,255,255,.25); font-weight: 900;
      }
      .ttt-sb-divider {
        width: 32px; height: 1px; background: rgba(255,255,255,.13);
      }
      .ttt-sb-diff {
        font-size: .58rem; font-weight: 800; color: rgba(255,215,0,.6);
        text-align: center; line-height: 1.4;
      }
      .ttt-num-mario  { color: #ff6060; }
      .ttt-num-bowser { color: #55cc44; }

      /* Result decoration */
      .ttt-res-anim {
        position: absolute; top: 20%; left: 50%; transform: translateX(-50%);
        font-size: 3.2rem; z-index: 3; white-space: nowrap;
        animation: bounce-in .55s ease-out;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Theme ──────────────────────────────────────────────── */
  function applyTheme() {
    Engine.el('screen-game').className   = 'screen ttt-theme';
    Engine.el('screen-result').className = 'screen hidden ttt-theme';
    _updateSidebar();
  }

  function _updateSidebar() {
    const diff = DIFF_LABELS[Math.min(_gameNum - 1, DIFF_LABELS.length - 1)];
    Engine.el('game-sidebar').innerHTML = `
      <div class="ttt-sidebar">
        <div class="ttt-sb-label">3 en Raya</div>
        <div class="ttt-sb-players">
          <div class="ttt-sb-player">
            <span class="ttt-sb-icon">🍄</span>
            <span class="ttt-sb-num ttt-num-mario"  id="ttt-uw">${_userWins}</span>
            <span class="ttt-sb-label">Mario</span>
          </div>
          <div class="ttt-sb-sep">—</div>
          <div class="ttt-sb-player">
            <span class="ttt-sb-icon">👾</span>
            <span class="ttt-sb-num ttt-num-bowser" id="ttt-cw">${_cpuWins}</span>
            <span class="ttt-sb-label">Bowser</span>
          </div>
        </div>
        <div class="ttt-sb-divider"></div>
        <div class="ttt-sb-diff">${diff}</div>
        <div class="ttt-sb-label">Primero en ${WINS_NEEDED}</div>
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

    _userWins = 0; _cpuWins = 0; _draws = 0;
    _lastMove = -1; _gameNum = 1;
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
        <div class="ttt-coin">🪙</div>
        <p class="ttt-cf-msg" id="ttt-cf-msg">Lanzando moneda…</p>
      </div>`;

    setTimeout(() => {
      const msg = Engine.el('ttt-cf-msg');
      if (msg) msg.textContent = _userFirst
        ? '¡Empiezas tú, Mario! 🍄'
        : '¡Empieza Bowser! 👾';
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
      _setStatus('Bowser está pensando… 👾', 'cpu-turn');
      setTimeout(_cpuMove, 750);
    } else {
      _setStatus('¡Tu turno, Mario! 🍄', 'user-turn');
    }
  }

  /* ── Board rendering ────────────────────────────────────── */
  function _buildBoard() {
    const qCard = Engine.el('q-card');
    qCard.innerHTML = `
      <div class="ttt-status" id="ttt-status"></div>
      <div class="ttt-board"  id="ttt-board"></div>
    `;
    _renderCells();

    function _fit() {
      const { width, height } = qCard.getBoundingClientRect();
      const size  = Math.floor(Math.min(width * 0.9, height * 0.74, 340));
      const board = Engine.el('ttt-board');
      if (board && size > 0) {
        board.style.width  = size + 'px';
        board.style.height = size + 'px';
      }
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
        const cls   = val === 'X' ? 'ttt-mark-x' : 'ttt-mark-o';
        const lbl   = val === 'X' ? 'M' : 'B';
        cell.innerHTML =
          `<div class="${cls}${isNew ? ' is-new' : ''}">${lbl}</div>`;
      }
      cell.addEventListener('click', () => _handleClick(i));
      boardEl.appendChild(cell);
    });
  }

  /* ── Move handling ──────────────────────────────────────── */
  function _handleClick(idx) {
    if (!_gameActive || !_userTurn || _board[idx]) return;
    _board[idx] = 'X';
    _lastMove   = idx;
    _renderCells();

    const result = _checkResult();
    if (result) { _handleGameEnd(result); return; }

    _userTurn = false;
    _setStatus('Bowser está pensando… 👾', 'cpu-turn');
    setTimeout(_cpuMove, 580);
  }

  function _cpuMove() {
    if (!_gameActive) return;
    const idx   = _getBestMove();
    _board[idx] = 'O';
    _lastMove   = idx;
    _renderCells();

    const result = _checkResult();
    if (result) { _handleGameEnd(result); return; }

    _userTurn = true;
    _setStatus('¡Tu turno, Mario! 🍄', 'user-turn');
  }

  /* ── AI — difficulty scales with game number ────────────── */
  function _getBestMove() {
    const empty = _board.reduce((a, v, i) => v === null ? [...a, i] : a, []);

    // Game 5: full minimax (unbeatable)
    if (_gameNum >= 5) return _minimaxMove();

    // Game 1: completely random — Bowser barely tries
    if (_gameNum === 1) return Engine.pick(empty);

    // Games 2-4: always take the winning move
    const win = _findWinMove('O');
    if (win !== -1) return win;

    // Game 2: doesn't bother blocking — 60 % random
    if (_gameNum === 2) {
      if (Math.random() < 0.60) return Engine.pick(empty);
      if (_board[4] === null) return 4;
      const c = [0,2,6,8].filter(i => _board[i] === null);
      return c.length ? Engine.pick(c) : Engine.pick(empty);
    }

    // Games 3-4: block the player
    const block = _findWinMove('X');
    if (block !== -1) return block;

    // Game 3 — 35 % random; Game 4 — 10 % random
    const rnd = _gameNum === 3 ? 0.35 : 0.10;
    if (Math.random() < rnd) return Engine.pick(empty);

    // Strategic: center > corners > edges
    if (_board[4] === null) return 4;
    const corners = [0,2,6,8].filter(i => _board[i] === null);
    if (corners.length) return Engine.pick(corners);
    const edges   = [1,3,5,7].filter(i => _board[i] === null);
    if (edges.length) return Engine.pick(edges);

    return empty[0];
  }

  /* Minimax — perfect play for game 5 */
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
      if (_board[a] && _board[a] === _board[b] && _board[b] === _board[c]) {
        return _board[a] === 'O' ? 10 - depth : depth - 10;
      }
    }
    if (_board.every(v => v !== null)) return 0;
    const empty = _board.reduce((a, v, i) => v === null ? [...a, i] : a, []);
    if (isMax) {
      let best = -Infinity;
      for (const i of empty) {
        _board[i] = 'O';
        best = Math.max(best, _mm(false, depth + 1));
        _board[i] = null;
      }
      return best;
    } else {
      let best = Infinity;
      for (const i of empty) {
        _board[i] = 'X';
        best = Math.min(best, _mm(true, depth + 1));
        _board[i] = null;
      }
      return best;
    }
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function _findWinMove(mark) {
    for (const [a,b,c] of LINES) {
      const vals = [_board[a], _board[b], _board[c]];
      if (vals.filter(v => v === mark).length === 2 &&
          vals.filter(v => v === null).length  === 1) {
        return [a,b,c].find(i => _board[i] === null);
      }
    }
    return -1;
  }

  function _checkResult() {
    for (const line of LINES) {
      const [a,b,c] = line;
      if (_board[a] && _board[a] === _board[b] && _board[b] === _board[c]) {
        return { winner: _board[a], line };
      }
    }
    if (_board.every(v => v !== null)) return { winner: 'draw', line: null };
    return null;
  }

  function _setStatus(text, cls = '') {
    const el = Engine.el('ttt-status');
    if (!el) return;
    el.textContent = text;
    el.className   = 'ttt-status' + (cls ? ' ' + cls : '');
  }

  function _updateCounter() {
    const total = _userWins + _cpuWins + _draws;
    const gNum  = Math.min(total + 1, MAX_GAMES);
    const diff  = DIFF_LABELS[Math.min(gNum - 1, DIFF_LABELS.length - 1)];
    Engine.el('q-counter').textContent =
      `Partida ${gNum}/${MAX_GAMES}  ·  ${diff}`;
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
      _setStatus('¡Mario gana esta partida! 🎉', 'game-end');
      Engine.playCorrect();
    } else if (result.winner === 'O') {
      _cpuWins++;
      _setStatus('¡Bowser gana esta partida! 👾', 'game-end');
      Engine.playWrong();
    } else {
      _draws++;
      _setStatus('¡Empate! 🤝', 'game-end');
    }

    _updateSidebar();
    _updateCounter();

    // Bump animation on updated score
    setTimeout(() => {
      const id = result.winner === 'X' ? 'ttt-uw'
               : result.winner === 'O' ? 'ttt-cw' : null;
      if (id) {
        const el = Engine.el(id);
        if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
      }
    }, 150);

    const totalGames = _userWins + _cpuWins + _draws;
    const levelOver  = _userWins === WINS_NEEDED
                    || _cpuWins  === WINS_NEEDED
                    || totalGames >= MAX_GAMES;

    const delay = result.winner === 'draw' ? 1400 : 2000;

    if (levelOver) {
      setTimeout(_finishLevel, delay);
    } else {
      _userFirst = !_userFirst;
      setTimeout(_startGame, delay + 300);
    }
  }

  /* ── Level finish ───────────────────────────────────────── */
  function _finishLevel() {
    const totalGames   = _userWins + _cpuWins + _draws;
    const wonByTarget  = _userWins === WINS_NEEDED;
    const lostByTarget = _cpuWins  === WINS_NEEDED;
    const byMaxGames   = totalGames >= MAX_GAMES && !wonByTarget && !lostByTarget;

    let won, score;

    if (byMaxGames) {
      won = _userWins > _cpuWins;  // tiebreaker by game wins
      score = (_userWins > _cpuWins)  ? 650
            : (_cpuWins  > _userWins) ? 350
            : 500; // perfect draw
    } else {
      won   = wonByTarget;
      score = won
        ? [1000, 900, 800][_cpuWins]  ?? 800
        : [200,  400, 600][_userWins] ?? 200;
    }

    // Result screen content
    let title, motivator;
    if (byMaxGames && _userWins === _cpuWins) {
      title     = `<span style="color:#ffd700">🤝 ¡Empate total!</span>`;
      motivator = '¡Nadie se rindió! ¡Rematch! 🔥';
    } else if (won) {
      title     = `<span style="color:#ffd700">🎉 ¡Mario gana!</span>`;
      motivator = '¡Eres todo un estratega! 🍄🧠';
    } else {
      title     = `<span style="color:#ff6060">👾 ¡Bowser gana!</span>`;
      motivator = '¡Sigue practicando, Mario! 💪🍄';
    }

    Engine.el('res-title').innerHTML = title;
    const pfx = Engine.state.playerName ? `¡${Engine.state.playerName}! ` : '';
    Engine.el('res-motivator').textContent = pfx + motivator;
    Engine.el('res-detail').textContent =
      `${score}/1000 puntos  ·  🍄 ${_userWins} — ${_cpuWins} 👾  ·  ${_draws} empate${_draws !== 1 ? 's' : ''}`;

    Engine.animateCount(score, 'res-score-big');

    const stars = score >= 900 ? 3 : score >= 700 ? 2 : score >= 400 ? 1 : 0;
    [1,2,3].forEach(i => {
      const s = Engine.el(`star-${i}`);
      s.style.opacity = '0'; s.classList.remove('pop');
    });
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => Engine.el(`star-${i}`).classList.add('pop'), (i-1) * 320);
    }

    // Navigation
    const st   = Engine.state;
    const ni   = st.playlistIdx + 1;
    const nextId = (st.playlist.length && ni < st.playlist.length) ? st.playlist[ni] : null;
    Engine.el('res-btns').innerHTML = nextId
      ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(${score},'${nextId}')">${Engine.getLevelName(nextId)} →</button>`
      : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`;

    // Sync engine state
    st.totalScore  = score;
    st.correctAns  = _userWins;
    st.totalStars += (won ? _userWins : 0);
    Engine.el('badge-count').textContent = st.totalStars;

    // Decoration + audio
    Engine.el('result-level-extra').innerHTML = won
      ? `<div class="ttt-res-anim">🍄🏆🍄</div>`
      : byMaxGames && _userWins === _cpuWins
        ? `<div class="ttt-res-anim">🍄🤝👾</div>`
        : `<div class="ttt-res-anim">👾💥👾</div>`;

    if (won) {
      Engine.createConfetti(['🍄','⭐','🎉','🏆','✨','🌟']);
      Engine.playLaunch();
      setTimeout(() => Engine.playStars(), 500);
    } else if (byMaxGames && _userWins === _cpuWins) {
      Engine.createConfetti(['🍄','👾','🤝','⭐']);
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
    winTitle:         '<span style="color:#ffd700">🎉 ¡Mario gana!</span>',
    loseTitle:        '<span style="color:#ff6060">👾 ¡Bowser gana!</span>',
    winMessage:       '¡Eres todo un estratega! 🍄🧠',
    levelIntroMessage:'¡Ahora Mario vs Bowser! ¡3 en Raya! 🍄',
    mount, applyTheme, buildDots, setProgress,
    renderCard, generateQuestions, onResult,
  };

})();
