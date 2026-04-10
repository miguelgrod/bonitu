'use strict';

const HangmanLevel = (() => {

  /* ── Word bank (A-Z only, no accents, 6-9 yr Spanish) ──── */
  const WORD_BANKS = [
    { theme: '🐾 Animales',   words: ['PERRO','GATO','TIGRE','ELEFANTE','JIRAFA','COCODRILO','MARIPOSA','DELFIN','TORTUGA','CABALLO','CONEJO','BALLENA','LEON','GORILA','CANGURO','FLAMENCO','HIPOPOTAMO','DINOSAURIO'] },
    { theme: '🍎 Frutas',     words: ['MANZANA','NARANJA','PLATANO','FRESA','SANDIA','MELON','PERA','CEREZA','LIMON','MANGO','KIWI','COCO','PAPAYA','ALBARICOQUE'] },
    { theme: '🎨 Colores',    words: ['ROJO','AZUL','VERDE','AMARILLO','MORADO','BLANCO','NEGRO','ROSA','LILA','NARANJA','GRIS','MARRON','CELESTE'] },
    { theme: '🌍 Paises',     words: ['ESPANA','FRANCIA','ITALIA','BRASIL','JAPON','CHINA','MEXICO','EGIPTO','CANADA','GRECIA','RUSIA','AUSTRALIA','NORUEGA','COLOMBIA'] },
    { theme: '🚀 Objetos',    words: ['PELOTA','COHETE','GLOBO','BARCO','AVION','BICICLETA','PIANO','ZAPATO','CASTILLO','GUITARRA','CAMION','ESPEJO','LINTERNA','PARAGUAS'] },
    { theme: '🍕 Comida',     words: ['PIZZA','HELADO','PASTEL','HAMBURGUESA','CHOCOLATE','GALLETA','TORTILLA','ESPAGUETI','PALOMITAS','SOPA'] },
    { theme: '🌟 Espacio',    words: ['LUNA','ESTRELLA','PLANETA','COMETA','SATURNO','GALAXIA','ASTEROIDE','TELESCOPIO','COHETE','COSMONAUTA'] },
    { theme: '🌿 Naturaleza', words: ['FLOR','ARBOL','MONTANA','VOLCAN','DESIERTO','SELVA','CASCADA','OCEANO','TORNADO','TERREMOTO'] },
    { theme: '⚽ Deportes',   words: ['FUTBOL','BALONCESTO','NATACION','TENIS','CICLISMO','ATLETISMO','GIMNASIA','BOXEO','KARATE','VOLEIBOL'] },
    { theme: '🏫 Colegio',    words: ['LAPIZ','CUADERNO','MOCHILA','BORRADOR','REGLA','TIJERAS','PEGAMENTO','PINTURA','COMPAS','BIBLIOTECA'] },
  ];

  const MAX_FAILS   = 6;
  // Points awarded by number of wrong guesses: index = fails count (0..5 = win, 6 = lose)
  const SCORE_TABLE = [1000, 950, 880, 780, 650, 500, 200];

  /* ── State ───────────────────────────────────────────────── */
  let _word    = '';
  let _theme   = '';
  let _guessed = new Set();
  let _fails   = 0;
  let _active  = false;

  /* ── Helpers ─────────────────────────────────────────────── */
  function _pick() {
    const bank = WORD_BANKS[Math.floor(Math.random() * WORD_BANKS.length)];
    const word = bank.words[Math.floor(Math.random() * bank.words.length)];
    return { theme: bank.theme, word };
  }

  function _score() { return SCORE_TABLE[Math.min(_fails, MAX_FAILS)]; }

  /* ── DOM refresh helpers ─────────────────────────────────── */
  function _renderWord() {
    const wrap = document.getElementById('hang-word');
    if (!wrap) return;
    wrap.innerHTML = _word.split('').map(l =>
      `<span class="hang-letter${_guessed.has(l) ? ' hang-revealed' : ''}">${_guessed.has(l) ? l : ''}</span>`
    ).join('');
  }

  function _renderTrack() {
    const wrap = document.getElementById('hang-track');
    if (!wrap) return;
    let html = '';
    for (let i = 0; i <= MAX_FAILS; i++) {
      const isLava   = i === MAX_FAILS;
      const hasMario = i === _fails;
      html += `<div class="hang-tile${isLava ? ' hang-lava-tile' : ''}${hasMario && !isLava ? ' hang-mario-tile' : ''}">`;
      if (isLava)   html += `<span class="hang-fire-icon">🔥</span>`;
      if (hasMario) html += `<img src="src/mario.webp" class="hang-mario-img" alt="Mario">`;
      html += `</div>`;
    }
    wrap.innerHTML = html;
  }

  function _renderKeyboard() {
    const wrap = document.getElementById('hang-keyboard');
    if (!wrap) return;
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => {
      const btn = wrap.querySelector(`[data-l="${l}"]`);
      if (!btn) return;
      const isWrong   = _guessed.has(l) && !_word.includes(l);
      const isCorrect = _guessed.has(l) &&  _word.includes(l);
      btn.disabled  = _guessed.has(l) || !_active;
      btn.className = `hang-key${isWrong ? ' hang-key-wrong' : isCorrect ? ' hang-key-right' : ''}`;
    });
  }

  function _refreshSidebar() {
    const el = document.getElementById('hang-sidebar');
    if (!el) return;
    el.innerHTML = `
      <div class="hangs-label">Fallos</div>
      <div class="hangs-count">${_fails}<span>/${MAX_FAILS}</span></div>
      <div class="hangs-pips">
        ${Array.from({ length: MAX_FAILS }, (_, i) =>
          `<span class="hangs-pip${i < _fails ? ' hangs-pip-on' : ''}"></span>`
        ).join('')}
      </div>
    `;
  }

  /* ── Letter guess ────────────────────────────────────────── */
  function _guess(letter) {
    if (!_active || _guessed.has(letter)) return;
    _guessed.add(letter);

    if (_word.includes(letter)) {
      Engine.playCorrect();
      _renderWord();
      _renderKeyboard();
      const solved = _word.split('').every(l => _guessed.has(l));
      if (solved) {
        _active = false;
        setTimeout(_win, 600);
      }
    } else {
      _fails++;
      Engine.playWrong();
      _renderTrack();
      _refreshSidebar();
      _renderKeyboard();
      if (_fails >= MAX_FAILS) {
        _active = false;
        setTimeout(_lose, 800);
      }
    }
  }

  /* ── Win sequence ────────────────────────────────────────── */
  function _win() {
    const score = _score();
    const st    = Engine.state;
    const stars = score >= 900 ? 3 : score >= 700 ? 2 : 1;

    st.totalScore  = score;
    st.correctAns  = 1;
    st.totalStars += stars;
    Engine.el('badge-count').textContent = st.totalStars;

    Engine.el('res-title').innerHTML = `<span style="color:#ffd700">🎉 ¡Adivinaste la palabra!</span>`;
    const pfx = st.playerName ? `¡${st.playerName}! ` : '';
    Engine.el('res-motivator').textContent = pfx + '¡Eres un maestro de las palabras! 🌟';
    Engine.el('res-detail').textContent =
      `${score}/1000 puntos · ${_fails} fallo${_fails !== 1 ? 's' : ''} · "${_word}"`;
    Engine.animateCount(score, 'res-score-big');

    [1, 2, 3].forEach(i => {
      const s = Engine.el(`star-${i}`);
      s.style.opacity = '0';
      s.classList.remove('pop');
    });
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => Engine.el(`star-${i}`).classList.add('pop'), (i - 1) * 320);
    }

    const ni     = st.playlistIdx + 1;
    const nextId = (st.playlist.length && ni < st.playlist.length) ? st.playlist[ni] : null;
    Engine.el('res-btns').innerHTML = nextId
      ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(${score},'${nextId}')">${Engine.getLevelName(nextId)} →</button>`
      : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`;

    Engine.el('result-level-extra').innerHTML =
      `<div class="hang-win-anim">✨&nbsp;${_word}&nbsp;✨</div>`;
    Engine.createConfetti(['⭐', '🌟', '🎉', '✨', '🔤', '🏆']);
    Engine.playLaunch();
    setTimeout(() => Engine.playStars(), 400);
    Engine.showScreen('screen-result');
  }

  /* ── Lose sequence ───────────────────────────────────────── */
  function _lose() {
    const st = Engine.state;
    st.totalScore = 200;
    st.correctAns = 0;
    Engine.el('badge-count').textContent = st.totalStars;

    Engine.el('res-title').innerHTML = `<span style="color:#ff6b6b">🔥 ¡Mario cayó en la lava!</span>`;
    const pfx = st.playerName ? `¡${st.playerName}! ` : '';
    Engine.el('res-motivator').textContent = pfx + `La palabra era: "${_word}". ¡Inténtalo de nuevo! 💪`;
    Engine.el('res-detail').textContent = `200/1000 puntos · 6 fallos`;
    Engine.animateCount(200, 'res-score-big');

    [1, 2, 3].forEach(i => {
      Engine.el(`star-${i}`).style.opacity = '0';
      Engine.el(`star-${i}`).classList.remove('pop');
    });

    const ni     = st.playlistIdx + 1;
    const nextId = (st.playlist.length && ni < st.playlist.length) ? st.playlist[ni] : null;
    Engine.el('res-btns').innerHTML = nextId
      ? `<button class="btn-next-level" onclick="Engine.showLevelComplete(200,'${nextId}')">${Engine.getLevelName(nextId)} →</button>`
      : `<button class="btn-next-level" onclick="Engine.showAllComplete()">🏆 ¡Ver resultados!</button>`;

    Engine.el('result-level-extra').innerHTML = `<div class="hang-lose-anim">🔥💀🔥</div>`;
    Engine.playLaunch();
    Engine.showScreen('screen-result');
  }

  /* ============================================================
     LEVEL INTERFACE
  ============================================================ */

  function mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* ── Screen background: underground cave / lava world ── */
      #screen-game.hang-theme {
        background: linear-gradient(180deg,
          #0a0000 0%, #180400 25%, #2d0800 50%,
          #3d1000 72%, #5a1600 88%, #7a2000 100%);
      }

      /* ── Scenery layer ─────────────────────────────────────── */
      #hang-scenery {
        position: absolute; inset: 0; z-index: 0;
        pointer-events: none; overflow: hidden;
      }
      /* Brick top edge */
      .hang-cave-border {
        position: absolute; top: 0; left: 0; right: 0; height: 10px;
        background: repeating-linear-gradient(
          90deg,
          #5a2a00 0 30px, #3d1a00 30px 32px
        );
      }
      /* Lava pool at bottom */
      .hang-lava-pool {
        position: absolute; bottom: 0; left: 0; right: 0; height: 18px;
        background: linear-gradient(180deg, rgba(255,80,0,.0) 0%, rgba(255,80,0,.7) 40%, #ff5500 100%);
        animation: hang-lava-pulse 2.5s ease-in-out infinite alternate;
      }
      @keyframes hang-lava-pulse {
        0%   { opacity: .75; transform: scaleY(1);   }
        100% { opacity: 1;   transform: scaleY(1.15);}
      }
      /* Stalactites hanging from top */
      .hang-stalactite {
        position: absolute; top: 0;
        width: 0; height: 0;
        border-left:  8px solid transparent;
        border-right: 8px solid transparent;
        border-top:   clamp(14px,2.5vh,22px) solid #3d1a00;
      }
      /* Decorative mushrooms / gems */
      .hang-deco {
        position: absolute; font-size: clamp(.9rem,2.2vw,1.3rem);
        opacity: .35; filter: saturate(.5) brightness(.7);
        pointer-events: none;
      }

      /* ── Sidebar / score area ───────────────────────────────── */
      .hang-theme #game-sidebar,
      .hang-theme .game-main { position: relative; z-index: 1; }

      .hangs-wrap {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 10px; height: 100%; padding: 12px 6px;
      }
      .hangs-label {
        font-size: .65rem; font-weight: 800; text-align: center;
        color: rgba(255,180,60,.7); text-transform: uppercase;
        letter-spacing: .5px; font-family: 'Press Start 2P', cursive;
      }
      .hangs-count {
        font-size: 2.2rem; font-weight: 900; color: #ff6b00;
        line-height: 1; text-align: center;
        font-family: 'Press Start 2P', cursive;
        text-shadow: 0 0 8px rgba(255,100,0,.6);
      }
      .hangs-count span { font-size: 1.1rem; color: rgba(255,107,0,.45); }
      .hangs-pips {
        display: flex; flex-direction: column; gap: 5px; align-items: center;
      }
      .hangs-pip {
        width: 14px; height: 14px; border-radius: 3px;
        background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.18);
        transition: background .3s, border-color .3s;
      }
      .hangs-pip-on {
        background: #ff4444; border-color: #ff8888;
        box-shadow: 0 0 6px rgba(255,60,60,.6);
      }

      /* ── Hide engine Q&A chrome ─────────────────────────────── */
      .hang-theme .timer-wrap,
      .hang-theme .game-score { visibility: hidden; }
      .hang-theme #feedback,
      .hang-theme .answers-grid { display: none !important; }
      .hang-theme #q-counter {
        font-size: clamp(.65rem,1.6vw,.82rem); font-weight: 800;
        color: rgba(255,200,100,.8);
        font-family: 'Press Start 2P', cursive;
      }
      .hang-theme .q-area {
        padding: 0 4px; overflow: hidden;
        justify-content: center; align-items: center; min-height: 0;
      }
      .hang-theme #q-card {
        flex: 1; flex-shrink: 1; min-height: 0;
        background: transparent !important;
        backdrop-filter: none !important;
        box-shadow: none !important;
        border: none !important;
        padding: 4px 2px !important;
        animation: none !important;
        border-radius: 0 !important;
        display: flex !important;
        align-items: stretch;
        justify-content: center;
        overflow: hidden; width: 100%;
      }
      .hang-theme .game-main { align-items: stretch; }

      /* ── Main game container ──────────────────────────────── */
      .hang-container {
        display: flex; flex-direction: column;
        align-items: center; justify-content: space-evenly;
        width: 100%; height: 100%;
        gap: clamp(4px, 1.2vh, 10px);
        padding: 2px 4px;
        box-sizing: border-box;
      }

      /* Theme badge */
      .hang-theme-badge {
        font-size: clamp(.65rem, 1.8vw, .9rem);
        font-family: 'Press Start 2P', cursive;
        color: #ffd700;
        background: rgba(0,0,0,.45);
        border: 1.5px solid rgba(255,215,0,.3);
        border-radius: 20px;
        padding: 4px 14px;
        text-align: center;
        text-shadow: 0 0 8px rgba(255,215,0,.5);
        white-space: nowrap;
        flex-shrink: 0;
      }

      /* Word display row */
      .hang-word-row {
        display: flex; flex-wrap: wrap;
        justify-content: center; align-items: flex-end;
        gap: clamp(3px, 1vw, 7px);
        flex-shrink: 0;
        min-height: clamp(34px, 7vh, 52px);
      }
      .hang-letter {
        display: inline-flex; align-items: center; justify-content: center;
        width: clamp(20px, 5vw, 32px);
        height: clamp(28px, 6vh, 42px);
        border-bottom: 2.5px solid rgba(255,200,80,.65);
        font-size: clamp(.7rem, 2.2vw, 1.1rem);
        font-weight: 900; color: #fff;
        font-family: 'Press Start 2P', cursive;
        text-transform: uppercase;
        transition: color .25s, text-shadow .25s;
      }
      .hang-letter.hang-revealed {
        color: #ffd700;
        text-shadow: 0 0 8px rgba(255,215,0,.7);
        border-bottom-color: rgba(255,215,0,.8);
        animation: hang-pop-letter .35s cubic-bezier(.4,0,.2,1);
      }
      @keyframes hang-pop-letter {
        0%   { transform: scale(1.4); }
        100% { transform: scale(1);   }
      }

      /* ── Mario walk track ──────────────────────────────────── */
      .hang-track {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: clamp(2px, .8vw, 5px);
        width: 100%;
        flex-shrink: 0;
      }
      .hang-tile {
        position: relative;
        flex: 1;
        max-width: clamp(34px, 11vw, 52px);
        aspect-ratio: 1 / 1.25;
        border-radius: 5px 5px 3px 3px;
        background: linear-gradient(180deg, #5a3a1a 0%, #3d2408 70%, #2a1600 100%);
        border: 1.5px solid rgba(255,160,40,.25);
        border-bottom: 3px solid #1a0c00;
        display: flex; align-items: center; justify-content: center;
        overflow: visible;
        transition: transform .15s;
      }
      /* Step number dots below each tile */
      .hang-tile::after {
        content: '';
        position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%);
        width: 5px; height: 5px; border-radius: 50%;
        background: rgba(255,120,40,.35);
      }
      .hang-lava-tile {
        background: linear-gradient(180deg, #ff5500 0%, #cc2200 50%, #990000 100%);
        border-color: rgba(255,80,0,.7);
        border-bottom-color: #660000;
        box-shadow: 0 0 12px rgba(255,80,0,.55),
                    0 0 24px rgba(255,40,0,.25);
        animation: hang-lava-tile-pulse 1.5s ease-in-out infinite alternate;
      }
      @keyframes hang-lava-tile-pulse {
        0%   { box-shadow: 0 0 8px  rgba(255,80,0,.5),  0 0 18px rgba(255,40,0,.2);  }
        100% { box-shadow: 0 0 16px rgba(255,100,0,.8), 0 0 30px rgba(255,60,0,.45); }
      }
      .hang-fire-icon {
        font-size: clamp(1rem, 3.5cqmin, 1.4rem);
        filter: drop-shadow(0 0 4px rgba(255,80,0,.8));
        animation: hang-fire-flicker .6s ease-in-out infinite alternate;
      }
      @keyframes hang-fire-flicker {
        0%   { transform: scale(1)    rotate(-3deg); }
        100% { transform: scale(1.15) rotate(3deg);  }
      }
      .hang-mario-img {
        position: absolute;
        bottom: 105%;
        left: 50%; transform: translateX(-50%);
        width: 200%;
        max-width: clamp(28px, 8vw, 48px);
        image-rendering: crisp-edges;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,.5));
        animation: hang-mario-bob .7s ease-in-out infinite alternate;
        z-index: 5;
      }
      @keyframes hang-mario-bob {
        0%   { transform: translateX(-50%) translateY(0);    }
        100% { transform: translateX(-50%) translateY(-3px); }
      }
      /* Flash tile red when Mario lands on it as a mistake */
      .hang-mario-tile:not(.hang-lava-tile) {
        background: linear-gradient(180deg, #7a4a2a 0%, #5a3010 70%, #3a1e06 100%);
        border-color: rgba(255,200,80,.4);
      }

      /* ── A-Z Keyboard ──────────────────────────────────────── */
      .hang-keyboard {
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        gap: clamp(3px, .9vw, 5px);
        width: 100%;
        flex-shrink: 0;
      }
      .hang-key {
        aspect-ratio: 1 / 1;
        border: none; border-radius: 5px;
        background: linear-gradient(180deg, #6b3acc 0%, #4a2299 100%);
        border-bottom: 3px solid #2a1266;
        color: #fff; font-weight: 900;
        font-size: clamp(.55rem, 2.2cqw, .85rem);
        font-family: 'Press Start 2P', cursive;
        cursor: pointer;
        touch-action: manipulation;
        transition: background .15s, transform .1s, opacity .15s;
      }
      .hang-key:hover:not(:disabled) {
        background: linear-gradient(180deg, #8855ee 0%, #6633bb 100%);
        transform: translateY(-1px);
      }
      .hang-key:active:not(:disabled) {
        transform: translateY(1px);
        border-bottom-width: 1px;
      }
      .hang-key:disabled { opacity: .35; cursor: default; }
      .hang-key-wrong {
        background: linear-gradient(180deg, #cc3333 0%, #882222 100%) !important;
        border-bottom-color: #550000 !important;
        color: rgba(255,255,255,.6) !important;
      }
      .hang-key-right {
        background: linear-gradient(180deg, #22aa55 0%, #116633 100%) !important;
        border-bottom-color: #084422 !important;
        color: #aaffcc !important;
      }

      /* ── Result screen extras ───────────────────────────────── */
      .hang-win-anim {
        position: absolute; top: 24%; left: 50%; transform: translateX(-50%);
        font-size: clamp(1.1rem, 4vw, 1.6rem);
        font-family: 'Press Start 2P', cursive;
        color: #ffd700;
        text-shadow: 0 0 12px rgba(255,215,0,.8);
        z-index: 3; white-space: nowrap;
        animation: bounce-in .6s ease-out;
      }
      .hang-lose-anim {
        position: absolute; top: 26%; left: 50%; transform: translateX(-50%);
        font-size: 2.8rem; z-index: 3; white-space: nowrap;
        animation: bounce-in .6s ease-out;
      }
    `;
    document.head.appendChild(s);
  }

  function applyTheme() {
    Engine.el('screen-game').classList.add('hang-theme');

    // Inject underground scenery decorations
    let scenery = document.getElementById('hang-scenery');
    if (!scenery) {
      scenery = document.createElement('div');
      scenery.id = 'hang-scenery';
      Engine.el('screen-game').appendChild(scenery);
    }
    scenery.innerHTML = `
      <div class="hang-cave-border"></div>
      <div class="hang-lava-pool"></div>
      <div class="hang-stalactite" style="left:8%;"></div>
      <div class="hang-stalactite" style="left:20%; border-top-width:18px;"></div>
      <div class="hang-stalactite" style="left:35%; border-top-width:12px;"></div>
      <div class="hang-stalactite" style="right:10%;"></div>
      <div class="hang-stalactite" style="right:25%; border-top-width:16px;"></div>
      <div class="hang-stalactite" style="right:40%; border-top-width:11px;"></div>
      <div class="hang-deco" style="left:3%;top:20%">🍄</div>
      <div class="hang-deco" style="right:4%;top:18%">🍄</div>
      <div class="hang-deco" style="left:5%;top:52%">💎</div>
      <div class="hang-deco" style="right:5%;top:50%">⭐</div>
      <div class="hang-deco" style="left:2%;top:72%">🟫</div>
      <div class="hang-deco" style="right:3%;top:70%">🟫</div>
    `;

    // Sidebar
    Engine.el('game-sidebar').innerHTML = `
      <div class="hangs-wrap">
        <div id="hang-sidebar"></div>
      </div>
    `;
    _refreshSidebar();
  }

  function buildDots()    { /* sidebar shows progress instead */ }
  function setProgress()  { /* handled by _refreshSidebar */ }

  function renderCard(_q, idx) {
    if (idx !== 0) return;

    // Bypass engine timer / Q-flow
    Engine.state.answered = true;

    // Pick word and reset state
    const picked = _pick();
    _word    = picked.word;
    _theme   = picked.theme;
    _guessed = new Set();
    _fails   = 0;
    _active  = true;
    _refreshSidebar();

    // Build game UI inside #q-card
    const qCard = Engine.el('q-card');
    qCard.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'hang-container';
    container.innerHTML = `
      <div class="hang-theme-badge">${_theme}</div>
      <div id="hang-word" class="hang-word-row"></div>
      <div id="hang-track" class="hang-track"></div>
      <div id="hang-keyboard" class="hang-keyboard">
        ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l =>
          `<button class="hang-key" data-l="${l}"
            onclick="HangmanLevel.guess('${l}')">${l}</button>`
        ).join('')}
      </div>
    `;
    qCard.appendChild(container);

    _renderWord();
    _renderTrack();
    _renderKeyboard();

    Engine.el('answers-grid').innerHTML = '';
    Engine.el('feedback').textContent   = '';
    Engine.el('q-counter').textContent  = '🔤 ¡Adivina la palabra!';
  }

  function generateQuestions() {
    // Single dummy question — renderCard takes over the display
    return [{ correct: '_', options: [] }];
  }

  function onResult() { /* populated inside _win / _lose */ }

  return {
    id:               'hangman',
    name:             '🔤 Ahorcado',
    nextLevelId:      null,
    answerClass:      'ans-btn',
    winTitle:         '<span style="color:#ffd700">🎉 ¡Adivinaste la palabra!</span>',
    loseTitle:        '<span style="color:#ff6b6b">🔥 ¡Mario cayó en la lava!</span>',
    winMessage:       '¡Eres un maestro de las palabras! 🌟',
    levelIntroMessage:'¡Adivina la palabra antes de que Mario llegue al fuego! 🔤',
    mount, applyTheme, buildDots, setProgress, renderCard, generateQuestions, onResult,
    guess: _guess,  // exposed for onclick handlers
  };

})();
