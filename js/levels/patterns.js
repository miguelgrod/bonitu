/* ============================================================
   LEVELS/PATTERNS.JS — Series y Patrones Numéricos
   Fondo marino: pingüino sube por la barra hacia la superficie.
============================================================ */

'use strict';

const PatternsLevel = {

  /* ---------- METADATA ---------- */
  id:          'patterns',
  name:        '🐧 Series',
  nextLevelId: 'memory',
  answerClass: 'ans-btn',

  winTitle:          '🐧 ¡Llegaste a la superficie! 🌊',
  loseTitle:         '🌊 ¡Casi llegas! Practica un poco más 💪',
  winMessage:        '¡Eres un experto en series numéricas!',
  levelIntroMessage: '¡Descubre el patrón y encuentra el número que falta!',

  /* ---------- QUESTION BANK ---------- */
  _bank: {
    tier1: [
      // Contar de 1 en 1
      { seq: [1,2,3,4], correct: 5,  options: [5,6,8,7]   },
      { seq: [3,4,5,6], correct: 7,  options: [7,8,9,6]   },
      // Contar de 2 en 2
      { seq: [2,4,6,8], correct: 10, options: [10,9,12,11] },
      { seq: [4,6,8,10], correct: 12, options: [12,11,14,13] },
      // Contar de 10 en 10
      { seq: [10,20,30,40], correct: 50, options: [50,45,60,55] },
      // Contar de 5 en 5
      { seq: [5,10,15,20], correct: 25, options: [25,30,22,28] },
    ],
    tier2: [
      // Contar de 3 en 3
      { seq: [3,6,9,12],  correct: 15, options: [15,14,18,16] },
      { seq: [6,9,12,15], correct: 18, options: [18,17,20,19] },
      // Números impares (de 2 en 2, empezando en impar)
      { seq: [1,3,5,7],   correct: 9,  options: [9,8,10,11]   },
      // Contar de 4 en 4
      { seq: [4,8,12,16], correct: 20, options: [20,18,24,22] },
    ],
    tier3: [
      // De 3 en 3, inicio distinto
      { seq: [2,5,8,11],  correct: 14, options: [14,13,15,12] },
      { seq: [1,4,7,10],  correct: 13, options: [13,12,14,15] },
      // Serie decreciente
      { seq: [10,8,6,4],  correct: 2,  options: [2,3,5,1]    },
      // De 5 en 5, inicio distinto
      { seq: [15,20,25,30], correct: 35, options: [35,33,40,38] },
    ],
  },

  /* ---------- MOUNT: inject CSS once ---------- */
  mount() {
    if (document.getElementById('pat-style')) return;
    const s = document.createElement('style');
    s.id = 'pat-style';
    s.textContent = `

      /* ─── Backgrounds ─────────────────────────────────────── */
      #screen-game.pat-bg,
      #screen-midpoint.pat-bg,
      #screen-result.pat-bg {
        background: radial-gradient(ellipse at top, #0b3d6b 0%, #062040 55%, #010d1f 100%);
      }

      /* ─── Floating bubbles ───────────────────────────────── */
      @keyframes pat-bubble-rise {
        0%   { transform: translateY(0) scale(1);   opacity: .55; }
        100% { transform: translateY(-105vh) scale(1.4); opacity: 0; }
      }
      .pat-bubble {
        position: fixed;
        border-radius: 50%;
        border: 2px solid rgba(130,210,255,.45);
        background: rgba(130,210,255,.08);
        pointer-events: none;
        animation: pat-bubble-rise linear infinite;
        z-index: 0;
      }

      /* ─── Swimming fish ─────────────────────────────────── */
      @keyframes pat-fish-l {
        0%   { transform: translateX( 110vw) scaleX(-1); }
        100% { transform: translateX(-20vw)  scaleX(-1); }
      }
      @keyframes pat-fish-r {
        0%   { transform: translateX(-20vw); }
        100% { transform: translateX( 110vw); }
      }
      .pat-fish {
        position: fixed;
        pointer-events: none;
        font-size: clamp(.9rem, 2.5vw, 1.8rem);
        animation: linear infinite;
        z-index: 0;
      }

      /* ─── Sidebar ───────────────────────────────────────── */
      #pat-sidebar {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        padding: .4rem 0;
        gap: .35rem;
        position: relative;
      }

      #pat-label {
        color: #7dd8f8;
        font-size: clamp(.42rem, 1.3vw, .72rem);
        font-weight: 700;
        text-align: center;
        text-shadow: 0 0 8px #3ab8ff;
        letter-spacing: .06em;
      }

      #pat-surface {
        font-size: clamp(.9rem, 2.2vw, 1.4rem);
        animation: pat-surface-bob 2.2s ease-in-out infinite;
      }
      @keyframes pat-surface-bob {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-4px); }
      }

      #pat-track-wrap {
        flex: 1;
        display: flex;
        align-items: stretch;
        gap: .35rem;
        min-height: 0;
      }

      #pat-track {
        position: relative;
        width: clamp(1.4rem, 2.8vw, 2.2rem);
        background: linear-gradient(to top,
          #010d1f 0%, #042040 35%, #0a3a6a 75%, #136096 100%);
        border-radius: .9rem;
        overflow: hidden;
        border: 2px solid rgba(80,170,255,.35);
        box-shadow:
          inset 0 0 12px rgba(0,80,180,.5),
          0 0 12px rgba(0,80,255,.18);
      }

      #pat-fill {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        background: linear-gradient(to top,
          rgba(0,80,180,.65), rgba(80,190,255,.28));
        transition: height .65s cubic-bezier(.4,0,.2,1);
        border-radius: 0 0 .9rem .9rem;
      }

      #pat-seaweed {
        position: absolute;
        bottom: 0; left: 50%;
        transform: translateX(-50%);
        font-size: clamp(.7rem, 1.8vw, 1.1rem);
        transform-origin: bottom center;
        animation: pat-sway 3.2s ease-in-out infinite;
        z-index: 1;
      }
      @keyframes pat-sway {
        0%,100% { transform: translateX(-50%) rotate(-9deg); }
        50%     { transform: translateX(-50%) rotate( 9deg); }
      }

      #pat-penguin {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-size: clamp(1.1rem, 2.4vw, 1.9rem);
        transition: bottom .65s cubic-bezier(.4,0,.2,1);
        filter: drop-shadow(0 0 7px rgba(80,200,255,.9));
        z-index: 2;
        animation: pat-penguin-swim 1.8s ease-in-out infinite;
      }
      @keyframes pat-penguin-swim {
        0%,100% { transform: translateX(-50%) rotate(-6deg); }
        50%     { transform: translateX(-50%) rotate( 6deg); }
      }

      /* fish inside sidebar track */
      #pat-track-fish {
        position: absolute;
        font-size: clamp(.5rem, 1.2vw, .85rem);
        animation: pat-sidefish 8s ease-in-out infinite;
        opacity: .7;
        z-index: 1;
      }
      @keyframes pat-sidefish {
        0%,100% { left: 15%; top: 30%; transform: scaleX(1);  }
        45%     { left: 65%; top: 55%; transform: scaleX(-1); }
        50%     { left: 65%; top: 55%; transform: scaleX(-1); }
        95%     { left: 15%; top: 30%; transform: scaleX(1);  }
      }

      /* ─── Dots column ───────────────────────────────────── */
      #pat-dots {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: .15rem 0;
      }
      .pat-dot {
        width:  clamp(.45rem, .9vw, .65rem);
        height: clamp(.45rem, .9vw, .65rem);
        border-radius: 50%;
        background: rgba(80,170,255,.25);
        border: 1.5px solid rgba(80,170,255,.4);
        transition: all .3s ease;
      }
      .pat-dot.lit {
        background: #3ab8ff;
        border-color: #a0e8ff;
        box-shadow: 0 0 6px #3ab8ff;
      }

      #pat-bottom { font-size: clamp(.65rem, 1.4vw, .95rem); }

      /* ─── Question card ─────────────────────────────────── */
      .pat-tier-label {
        color: #8de0ff;
        font-size: clamp(.75rem, 1.9vw, 1.05rem);
        font-weight: 700;
        text-align: center;
        text-shadow: 0 0 8px #3ab8ff;
        margin-bottom: .6rem;
      }

      .pat-sequence {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: clamp(.25rem, .9vw, .7rem);
        flex-wrap: wrap;
        margin: .5rem 0 1.1rem;
      }

      .pat-num {
        background: rgba(0,50,110,.8);
        border: 2px solid rgba(80,170,255,.55);
        border-radius: .75rem;
        color: #d8f4ff;
        font-size: clamp(1.4rem, 3.8vw, 2.4rem);
        font-weight: 900;
        min-width: clamp(2.4rem, 5.5vw, 3.8rem);
        height:    clamp(2.4rem, 5.5vw, 3.8rem);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0,90,180,.38),
                    inset 0 1px 0 rgba(255,255,255,.08);
        text-shadow: 0 0 10px rgba(120,220,255,.7);
      }

      .pat-arrow {
        color: rgba(80,170,255,.65);
        font-size: clamp(.9rem, 2.2vw, 1.4rem);
        font-weight: 700;
        user-select: none;
      }

      .pat-num.pat-unknown {
        background: rgba(0,90,170,.3);
        border: 3px solid #3ab8ff;
        color: #3ab8ff;
        font-size: clamp(1.8rem, 4.5vw, 2.9rem);
        animation: pat-unknown-pulse 1.3s ease-in-out infinite;
        box-shadow: 0 0 22px rgba(58,184,255,.5),
                    inset 0 0 16px rgba(58,184,255,.18);
      }
      @keyframes pat-unknown-pulse {
        0%,100% { box-shadow: 0 0 16px rgba(58,184,255,.45), inset 0 0 10px rgba(58,184,255,.15); }
        50%     { box-shadow: 0 0 32px rgba(58,184,255,.9),  inset 0 0 22px rgba(58,184,255,.38); }
      }

      /* ─── Result animations ─────────────────────────────── */
      .pat-win-penguin {
        font-size: clamp(3.5rem, 9vw, 6.5rem);
        display: inline-block;
        animation: pat-win-dance .75s ease-in-out 3;
      }
      @keyframes pat-win-dance {
        0%   { transform: translateY(0)    scale(1)    rotate(0deg);   }
        30%  { transform: translateY(-18px) scale(1.3) rotate( 12deg); }
        60%  { transform: translateY(-8px)  scale(1.2) rotate(-12deg); }
        100% { transform: translateY(0)    scale(1)    rotate(0deg);   }
      }

      .pat-lose-penguin {
        font-size: clamp(3.5rem, 9vw, 6.5rem);
        display: inline-block;
        animation: shake .5s ease-in-out 2;
      }

      .pat-result-msg {
        color: #8de0ff;
        font-size: clamp(.9rem, 2.3vw, 1.35rem);
        margin-top: .9rem;
        text-shadow: 0 0 8px #3ab8ff;
      }
    `;
    document.head.appendChild(s);
  },

  /* ---------- APPLY THEME ---------- */
  applyTheme() {
    Engine.el('screen-game').className      = 'screen pat-bg';
    Engine.el('screen-midpoint').className  = 'screen hidden pat-bg';
    Engine.el('screen-result').className    = 'screen hidden pat-bg';

    // Remove leftover ambient elements from previous runs
    document.querySelectorAll('.pat-bubble, .pat-fish').forEach(e => e.remove());

    // Floating bubbles
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('div');
      b.className = 'pat-bubble';
      const size = Engine.rnd(8, 26);
      b.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${Engine.rnd(0,100)}%`,
        `bottom:-${size}px`,
        `animation-duration:${Engine.rnd(7,16).toFixed(1)}s`,
        `animation-delay:-${Engine.rnd(0,14).toFixed(1)}s`,
      ].join(';');
      document.body.appendChild(b);
    }

    // Swimming fish
    const fishEmojis = ['🐟','🐠','🐡','🦐','🐙'];
    for (let i = 0; i < 5; i++) {
      const f  = document.createElement('div');
      f.className = 'pat-fish';
      const lr = Math.random() > .5;
      f.textContent = Engine.pick(fishEmojis);
      f.style.cssText = [
        `top:${Engine.rnd(8,78)}%`,
        `animation-name:${lr ? 'pat-fish-l' : 'pat-fish-r'}`,
        `animation-duration:${Engine.rnd(18,35).toFixed(1)}s`,
        `animation-delay:-${Engine.rnd(0,25).toFixed(1)}s`,
      ].join(';');
      document.body.appendChild(f);
    }

    // Sidebar HTML
    Engine.el('game-sidebar').innerHTML = `
      <div id="pat-sidebar">
        <div id="pat-label">SUPERFICIE</div>
        <div id="pat-surface">🧊</div>
        <div id="pat-track-wrap">
          <div id="pat-track">
            <div id="pat-fill"   style="height:0%"></div>
            <div id="pat-seaweed">🌿</div>
            <div id="pat-track-fish">🐠</div>
            <div id="pat-penguin" style="bottom:3%">🐧</div>
          </div>
          <div id="pat-dots"></div>
        </div>
        <div id="pat-bottom">🪸</div>
      </div>
    `;
  },

  /* ---------- DOTS ---------- */
  buildDots() {
    const col = document.getElementById('pat-dots');
    if (!col) return;
    col.innerHTML = '';
    for (let i = 0; i < Engine.TOTAL_Q; i++) {
      const d = document.createElement('div');
      d.className = 'pat-dot';
      d.id        = `pat-dot-${i}`;
      col.appendChild(d);
    }
  },

  /* ---------- PROGRESS ---------- */
  setProgress(qNum, total) {
    for (let i = 0; i < total; i++) {
      const d = document.getElementById(`pat-dot-${i}`);
      if (d) d.classList.toggle('lit', i < qNum);
    }
    // Penguin rises from 3 % to 88 %
    const pct     = qNum === 0 ? 3 : 3 + (qNum / total) * 85;
    const penguin = document.getElementById('pat-penguin');
    const fill    = document.getElementById('pat-fill');
    if (penguin) penguin.style.bottom = `${pct}%`;
    if (fill)    fill.style.height    = `${pct}%`;
  },

  /* ---------- QUESTIONS ---------- */
  generateQuestions() {
    const { tier1, tier2, tier3 } = this._bank;

    const pick4 = arr => Engine.shuffle([...arr]).slice(0, 4);
    const pick3 = arr => Engine.shuffle([...arr]).slice(0, 3);

    return [
      ...pick4(tier1),
      ...pick3(tier2),
      ...pick3(tier3),
    ].map(q => ({
      ...q,
      options: Engine.shuffle([...q.options]),
    }));
  },

  /* ---------- RENDER CARD ---------- */
  _tierInfo(idx) {
    if (idx < 4) return { label: '¿Qué número sigue?',       emoji: '🔢' };
    if (idx < 7) return { label: '¿Cuál es el siguiente?',   emoji: '🧮' };
    return              { label: '¡Completa la serie!',       emoji: '⭐' };
  },

  renderCard(q, idx) {
    const { label, emoji } = this._tierInfo(idx);

    const seqHtml = q.seq
      .map(n => `<div class="pat-num">${n}</div><div class="pat-arrow">→</div>`)
      .join('');

    Engine.el('q-content').innerHTML = `
      <div class="pat-tier-label">${emoji} ${label}</div>
      <div class="pat-sequence">
        ${seqHtml}
        <div class="pat-num pat-unknown">?</div>
      </div>
    `;
  },

  /* ---------- RESULT ---------- */
  onResult(won) {
    const extra = Engine.el('result-level-extra');
    if (won) {
      extra.innerHTML = `
        <div style="text-align:center">
          <div class="pat-win-penguin">🐧</div>
          <div class="pat-result-msg">🫧 ¡El pingüino llegó a la superficie! 🫧</div>
        </div>
      `;
    } else {
      extra.innerHTML = `
        <div style="text-align:center">
          <div class="pat-lose-penguin">🐧</div>
          <div class="pat-result-msg">🌊 ¡Sigue nadando, puedes lograrlo!</div>
        </div>
      `;
    }
  },

};
