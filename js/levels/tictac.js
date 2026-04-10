'use strict';

const TicTacLevel = (() => {

  /* ── Constants ──────────────────────────────────────────── */
  const WINS_NEEDED = 3;
  const LINES = [
    [0,1,2],[3,4,5],[6,7,8],   // rows
    [0,3,6],[1,4,7],[2,5,8],   // cols
    [0,4,8],[2,4,6],           // diags
  ];

  /* ── State ──────────────────────────────────────────────── */
  let _board      = Array(9).fill(null);
  let _userWins   = 0;
  let _cpuWins    = 0;
  let _draws      = 0;
  let _userTurn   = true;   // is it currently user's turn?
  let _userFirst  = true;   // does user go first in this game?
  let _gameActive = false;
  let _lastMove   = -1;     // index of last mark placed (for animation)
  let _resizeObs  = null;

  /* ── CSS ────────────────────────────────────────────────── */
  function mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* Screen backgrounds */
      #screen-game.ttt-theme,
      #screen-result.ttt-theme {
        background: linear-gradient(160deg, #0a1628 0%, #1a2040 50%, #0d1a3a 100%);
      }

      /* Hide engine chrome we don't use */
      .ttt-theme .timer-wrap,
      .ttt-theme .game-score { visibility: hidden; }
      .ttt-theme .answers-grid,
      .ttt-theme #feedback { display: none !important; }

      .ttt-theme #q-counter {
        font-size: clamp(.75rem, 2vw, .95rem);
        font-weight: 800; color: rgba(255,255,255,.7);
      }

      /* q-card fills available space */
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
        gap: 14px; width: 100%;
      }
      .ttt-theme .game-main { align-items: stretch; }

      /* Status label */
      .ttt-status {
        font-size: clamp(.9rem, 3vw, 1.2rem);
        font-weight: 800; color: rgba(255,255,255,.85);
        text-align: center; min-height: 1.7em;
        transition: color .25s;
      }
      .ttt-status.user-turn { color: #ff6b6b; }
      .ttt-status.cpu-turn  { color: #4ecdc4; }
      .ttt-status.game-end  { color: #ffd700; }

      /* Board */
      .ttt-board {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: clamp(6px, 1.5vw, 10px);
      }
      .ttt-cell {
        background: rgba(255,255,255,.07);
        border: 2px solid rgba(255,255,255,.14);
        border-radius: clamp(10px, 2vw, 16px);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background .18s, border-color .18s, transform .1s;
        user-select: none;
        container-type: size;
      }
      .ttt-cell:hover:not(.taken) {
        background: rgba(255,255,255,.13);
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

      /* Marks */
      .ttt-mark {
        font-size: 55cqmin;
        font-weight: 900; line-height: 1;
      }
      .ttt-mark-x { color: #ff6b6b; text-shadow: 0 0 14px rgba(255,107,107,.55); }
      .ttt-mark-o { color: #4ecdc4; text-shadow: 0 0 14px rgba(78,205,196,.55);  }
      .ttt-mark.is-new { animation: ttt-mark-pop .28s cubic-bezier(.34,1.56,.64,1); }

      @keyframes ttt-mark-pop {
        0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
        65%  { transform: scale(1.3) rotate(6deg); }
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
        font-size: clamp(1rem, 3.5vw, 1.5rem);
        font-weight: 800; color: #ffd700; text-align: center;
        animation: bounce-in .4s ease-out;
      }

      /* Sidebar */
      .ttt-sidebar {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 12px;
        padding: 12px 4px; height: 100%;
      }
      .ttt-sb-label {
        font-size: .62rem; font-weight: 800; text-transform: uppercase;
        letter-spacing: .5px; color: rgba(255,255,255,.4); text-align: center;
      }
      .ttt-sb-players {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
      }
      .ttt-sb-player {
        display: flex; flex-direction: column; align-items: center; gap: 1px;
      }
      .ttt-sb-icon { font-size: 1.45rem; line-height: 1; }
      .ttt-sb-num  {
        font-size: 2rem; font-weight: 900; line-height: 1;
      }
      .ttt-sb-num.bump { animation: ttt-num-bump .4s ease; }
      @keyframes ttt-num-bump {
        0%,100% { transform: scale(1);   }
        50%     { transform: scale(1.6); }
      }
      .ttt-sb-sep {
        font-size: .9rem; color: rgba(255,255,255,.28); font-weight: 900;
      }
      .ttt-sb-divider {
        width: 34px; height: 1px; background: rgba(255,255,255,.14);
      }
      .ttt-sb-draws {
        font-size: .65rem; font-weight: 800;
        color: rgba(255,255,255,.32); text-align: center;
      }
      .ttt-num-x { color: #ff6b6b; }
      .ttt-num-o { color: #4ecdc4; }

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
    Engine.el('game-sidebar').innerHTML = `
      <div class="ttt-sidebar">
        <div class="ttt-sb-label">3 en Raya</div>
        <div class="ttt-sb-players">
          <div class="ttt-sb-player">
            <span class="ttt-sb-icon">❌</span>
            <span class="ttt-sb-num ttt-num-x" id="ttt-uw">${_userWins}</span>
            <span class="ttt-sb-label">Tú</span>
          </div>
          <div class="ttt-sb-sep">—</div>
          <div class="ttt-sb-player">
            <span class="ttt-sb-icon">⭕</span>
            <span class="ttt-sb-num ttt-num-o" id="ttt-cw">${_cpuWins}</span>
            <span class="ttt-sb-label">CPU</span>
          </div>
        </div>
        <div class="ttt-sb-divider"></div>
        <div class="ttt-sb-draws">Empates: ${_draws}</div>
        <div class="ttt-sb-label">Primero en ${WINS_NEEDED}</div>
      </div>
    `;
  }

  function buildDots()  {}
  function setProgress(){}

  /* ── Questions (single dummy to prevent engine Q-flow) ──── */
  function generateQuestions() {
    return [{ correct: '_', options: [] }];
  }

  /* ── Entry point ────────────────────────────────────────── */
  function renderCard(q, idx) {
    if (idx !== 0) return;

    // Stop engine timer/answer handling
    Engine.state.answered = true;

    // Reset level state
    _userWins = 0; _cpuWins = 0; _draws = 0; _lastMove = -1;
    _userFirst = Math.random() < 0.5; // coin flip result

    Engine.el('answers-grid').innerHTML = '';
    Engine.el('feedback').textContent   = '';
    _updateCounter();
    _updateSidebar();
    _showCoinFlip();
  }

  /* ── Coin flip animation ────────────────────────────────── */
  function _showCoinFlip() {
    Engine.el('q-card').innerHTML = `
      <div class="ttt-coinflip">
        <div class="ttt-coin">🪙</div>
        <p class="ttt-cf-msg" id="ttt-cf-msg">Lanzando moneda…</p>
      </div>`;

    setTimeout(() => {
      const msg = Engine.el('ttt-cf-msg');
      if (msg) msg.textContent = _userFirst
        ? '¡Empiezas tú! ❌'
        : '¡Empieza el ordenador! ⭕';
    }, 1200);

    setTimeout(_startGame, 2500);
  }

  /* ── Game start ─────────────────────────────────────────── */
  function _startGame() {
    _board      = Array(9).fill(null);
    _gameActive = true;
    _userTurn   = _userFirst;
    _lastMove   = -1;

    _buildBoard();
    _updateCounter();

    if (!_userTurn) {
      _setStatus('El ordenador piensa… ⭕', 'cpu-turn');
      setTimeout(_cpuMove, 750);
    } else {
      _setStatus('Tu turno ❌', 'user-turn');
    }
  }

  /* ── Board rendering ────────────────────────────────────── */
  function _buildBoard() {
    const qCard = Engine.el('q-card');

    // Create board structure (only once per game)
    qCard.innerHTML = `
      <div class="ttt-status" id="ttt-status"></div>
      <div class="ttt-board"  id="ttt-board"></div>
    `;

    _renderCells();

    // Fit board as a square inside q-card
    function _fit() {
      const { width, height } = qCard.getBoundingClientRect();
      const size = Math.floor(Math.min(width * 0.9, height * 0.74, 340));
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
        cell.innerHTML = `<span class="ttt-mark ttt-mark-${val.toLowerCase()}${isNew ? ' is-new' : ''}">${val === 'X' ? '✕' : '○'}</span>`;
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
    _setStatus('El ordenador piensa… ⭕', 'cpu-turn');
    setTimeout(_cpuMove, 580);
  }

  function _cpuMove() {
    if (!_gameActive) return;

    const idx  = _getBestMove();
    _board[idx] = 'O';
    _lastMove   = idx;
    _renderCells();

    const result = _checkResult();
    if (result) { _handleGameEnd(result); return; }

    _userTurn = true;
    _setStatus('Tu turno ❌', 'user-turn');
  }

  /* ── AI ─────────────────────────────────────────────────── */
  function _getBestMove() {
    const empty = _board.reduce((a, v, i) => v === null ? [...a, i] : a, []);

    // 1. Win if possible
    const win = _findWinMove('O');
    if (win !== -1) return win;

    // 2. Block player's winning move
    const block = _findWinMove('X');
    if (block !== -1) return block;

    // 3. 35% random → gives kids a real chance to win
    if (Math.random() < 0.35) return Engine.pick(empty);

    // 4. Strategic preference: center > corners > edges
    if (_board[4] === null) return 4;
    const corners = [0, 2, 6, 8].filter(i => _board[i] === null);
    if (corners.length) return Engine.pick(corners);
    const edges   = [1, 3, 5, 7].filter(i => _board[i] === null);
    if (edges.length)   return Engine.pick(edges);

    return empty[0];
  }

  function _findWinMove(mark) {
    for (const [a, b, c] of LINES) {
      const vals  = [_board[a], _board[b], _board[c]];
      const marks = vals.filter(v => v === mark).length;
      const empty = vals.filter(v => v === null).length;
      if (marks === 2 && empty === 1) {
        return [a, b, c].find(i => _board[i] === null);
      }
    }
    return -1;
  }

  function _checkResult() {
    for (const line of LINES) {
      const [a, b, c] = line;
      if (_board[a] && _board[a] === _board[b] && _board[b] === _board[c]) {
        return { winner: _board[a], line };
      }
    }
    if (_board.every(v => v !== null)) return { winner: 'draw', line: null };
    return null;
  }

  /* ── Game end ───────────────────────────────────────────── */
  function _handleGameEnd(result) {
    _gameActive = false;

    // Highlight winning cells
    if (result.line) {
      const cells = Engine.el('ttt-board').children;
      result.line.forEach(i => cells[i].classList.add('win-cell'));
    }

    if (result.winner === 'X') {
      _userWins++;
      _setStatus('¡Ganaste esta partida! 🎉', 'game-end');
      Engine.playCorrect();
    } else if (result.winner === 'O') {
      _cpuWins++;
      _setStatus('El ordenador ganó esta partida 🤖', 'game-end');
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

    const delay = result.winner === 'draw' ? 1400 : 2000;

    if (_userWins === WINS_NEEDED || _cpuWins === WINS_NEEDED) {
      setTimeout(_finishLevel, delay);
    } else {
      _userFirst = !_userFirst; // alternate who goes first each game
      setTimeout(_startGame, delay + 300);
    }
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function _setStatus(text, cls = '') {
    const el = Engine.el('ttt-status');
    if (!el) return;
    el.textContent = text;
    el.className   = 'ttt-status' + (cls ? ' ' + cls : '');
  }

  function _updateCounter() {
    Engine.el('q-counter').textContent =
      `❌ ${_userWins}  —  ${_cpuWins} ⭕  ·  Primero en llegar a ${WINS_NEEDED} victorias`;
  }

  /* ── Level finish ───────────────────────────────────────── */
  function _finishLevel() {
    const won   = _userWins === WINS_NEEDED;
    const score = won
      ? [1000, 900, 800][_cpuWins] ?? 800    // 3-0:1000  3-1:900  3-2:800
      : [200, 400, 600][_userWins] ?? 200;   // 0-3:200  1-3:400  2-3:600

    // Populate result screen
    Engine.el('res-title').innerHTML = won
      ? `<span style="color:#ffd700">🎉 ¡Ganaste al ordenador!</span>`
      : `<span style="color:#ff6b6b">🤖 ¡El ordenador ganó esta vez!</span>`;

    const pfx = Engine.state.playerName ? `¡${Engine.state.playerName}! ` : '';
    Engine.el('res-motivator').textContent = won
      ? pfx + '¡Eres todo un estratega! 🧠'
      : pfx + '¡Sigue practicando, casi lo consigues! 💪';

    Engine.el('res-detail').textContent =
      `${score}/1000 puntos  ·  ❌ ${_userWins} — ${_cpuWins} ⭕  ·  ${_draws} empate${_draws !== 1 ? 's' : ''}`;

    Engine.animateCount(score, 'res-score-big');

    const stars = score >= 900 ? 3 : score >= 800 ? 2 : score >= 400 ? 1 : 0;
    [1, 2, 3].forEach(i => {
      const s = Engine.el(`star-${i}`);
      s.style.opacity = '0'; s.classList.remove('pop');
    });
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => Engine.el(`star-${i}`).classList.add('pop'), (i - 1) * 320);
    }

    // Navigation button
    const st   = Engine.state;
    const ni   = st.playlistIdx + 1;
    const nextId = (st.playlist.length && ni < st.playlist.length) ? st.playlist[ni] : null;
    Engine.el('res-btns').innerHTML = nextId
      ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(${score},'${nextId}')">${Engine.getLevelName(nextId)} →</button>`
      : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`;

    // Sync engine state for grandTotal calculation
    st.totalScore  = score;
    st.correctAns  = _userWins;
    st.totalStars += (won ? _userWins : 0);
    Engine.el('badge-count').textContent = st.totalStars;

    // Result decoration + audio
    Engine.el('result-level-extra').innerHTML = won
      ? `<div class="ttt-res-anim">❌⭕❌</div>`
      : `<div class="ttt-res-anim">⭕❌⭕</div>`;

    if (won) {
      Engine.createConfetti(['❌', '⭕', '⭐', '🎉', '🏆', '✨']);
      Engine.playLaunch();
      setTimeout(() => Engine.playStars(), 500);
    } else {
      Engine.playWrong();
    }

    Engine.showScreen('screen-result');
  }

  function onResult() { /* result populated inside _finishLevel */ }

  /* ── Public interface ───────────────────────────────────── */
  return {
    id:               'tictac',
    name:             '❌ 3 en Raya',
    nextLevelId:      null,
    answerClass:      'ans-btn',
    winTitle:         '<span style="color:#ffd700">🎉 ¡Ganaste al ordenador!</span>',
    loseTitle:        '<span style="color:#ff6b6b">🤖 ¡El ordenador ganó esta vez!</span>',
    winMessage:       '¡Eres todo un estratega! 🧠',
    levelIntroMessage:'¡Ahora a jugar al 3 en Raya! ❌⭕',
    mount, applyTheme, buildDots, setProgress,
    renderCard, generateQuestions, onResult,
  };

})();
