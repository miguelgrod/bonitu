/* ============================================================
   LEVELS/MATH.JS — Matemáticas level
   Space theme: rocket climbs to the Moon.
   To add a new level, copy this file and adapt it.
============================================================ */

'use strict';

const MathLevel = {

  /* ---------- METADATA ---------- */
  id:          'math',
  name:        '🚀 Matemáticas',
  nextLevelId: 'english',
  answerClass: 'ans-btn',

  winTitle:   '🎉 ¡LLEGASTE A LA LUNA! 🌙',
  loseTitle:  '¡Casi llegas! 🚀<br>¡Practica un poco más!',
  winMessage: '¡Eres un genio de las matemáticas! 🌟',
  levelIntroMessage: '¡Ahora viaja a Londres a aprender inglés! 🇬🇧',

  /* ---------- MOUNT: inject level CSS once ---------- */
  mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* ---- Math level: space theme ---- */
      @keyframes math-prog-pulse {
        0%,100% { box-shadow: 0 0 8px rgba(78,205,196,.5), inset 0 0 6px rgba(255,255,255,.1); }
        50%     { box-shadow: 0 0 18px rgba(78,205,196,.9), inset 0 0 10px rgba(255,255,255,.2); }
      }
      @keyframes math-rocket-bob {
        0%,100% { transform: translateX(-50%) translateY(50%) scale(1); }
        50%     { transform: translateX(-50%) translateY(calc(50% - 4px)) scale(1.12); }
      }
      @keyframes math-rocket-launch {
        0%   { transform: translateX(-50%) translateY(0); }
        100% { transform: translateX(-50%) translateY(-130vh); }
      }
      @keyframes math-rocket-fail {
        0%   { transform: translateX(-50%) translateY(0) rotate(0deg); }
        30%  { transform: translateX(-50%) translateY(-80px) rotate(-5deg); }
        60%  { transform: translateX(-50%) translateY(-40px) rotate(10deg); }
        100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
      }
      @keyframes math-moon-approach {
        from { transform: translateX(-50%) scale(1); top: -70px; }
        to   { transform: translateX(-50%) scale(1.4); top: -20px; }
      }

      /* Sidebar */
      .math-sidebar {
        display: flex; flex-direction: column; align-items: center;
        gap: 6px; flex-shrink: 0; width: 62px;
      }
      .math-sb-lbl { font-size: 1.4rem; line-height: 1; filter: drop-shadow(0 0 6px rgba(255,215,0,.6)); }
      .math-track {
        flex: 1; width: 28px; min-height: 180px;
        background: rgba(255,255,255,.08); border-radius: 14px;
        border: 2px solid rgba(255,255,255,.15); position: relative; overflow: visible;
        animation: math-prog-pulse 2.5s ease-in-out infinite;
      }
      .math-track::before {
        content: ''; position: absolute; inset: 0;
        background: repeating-linear-gradient(to top,
          transparent 0px, transparent calc(10% - 1px),
          rgba(255,255,255,.12) calc(10% - 1px), rgba(255,255,255,.12) 10%);
        border-radius: 12px; pointer-events: none;
      }
      .math-fill {
        position: absolute; bottom: 0; left: 0; width: 100%;
        background: linear-gradient(0deg, #ff9f1c 0%, #4ecdc4 40%, #74d9ff 75%, #fff 100%);
        border-radius: 12px;
        transition: height .65s cubic-bezier(.34,1.56,.64,1);
        box-shadow: 0 0 12px rgba(78,205,196,.7);
      }
      .math-fill::after {
        content: ''; position: absolute; top: 0; left: 3px;
        width: 6px; height: 100%; background: rgba(255,255,255,.35); border-radius: 3px;
      }
      .math-prog-rocket {
        position: absolute; left: 50%; transform: translateX(-50%) translateY(50%);
        font-size: 1.6rem; filter: drop-shadow(0 0 8px rgba(255,215,0,.9));
        animation: math-rocket-bob 1.4s ease-in-out infinite;
        transition: bottom .65s cubic-bezier(.34,1.56,.64,1); z-index: 2;
      }
      .math-dot {
        position: absolute; right: -10px; width: 10px; height: 10px;
        background: rgba(255,255,255,.25); border-radius: 50%;
        border: 1.5px solid rgba(255,255,255,.35); transform: translateX(50%);
        transition: background .4s, box-shadow .4s;
      }
      .math-dot.lit { background: #ffd700; box-shadow: 0 0 7px #ffd700; }

      /* Backgrounds */
      #screen-game.math-bg    { background: linear-gradient(175deg,#050a1a 0%,#0d1940 40%,#1a2b5e 100%); }
      #screen-midpoint.math-bg{ background: linear-gradient(175deg,#050a1a 0%,#0d1940 40%,#1a2b5e 100%); gap:18px; padding:24px; }
      #screen-result.math-bg  { background: linear-gradient(175deg,#050a1a 0%,#0d1940 40%,#1a2b5e 100%); }

      /* Result extras */
      .math-res-moon {
        position: fixed; top: -70px; left: 50%; transform: translateX(-50%);
        width: 140px; height: 140px;
        background: radial-gradient(circle at 35% 35%, #fffde7, #ffd700);
        border-radius: 50%;
        box-shadow: 0 0 40px #ffd700, 0 0 80px rgba(255,215,0,.5); z-index: 3;
      }
      .math-res-moon.approach { animation: math-moon-approach 2.5s ease-out 2s forwards; }
      .math-launch-wrap { position: fixed; bottom: -160px; left: 50%; transform: translateX(-50%); z-index: 10; }
      .math-launch-wrap.go   { animation: math-rocket-launch 3s ease-in forwards; }
      .math-launch-wrap.fail { animation: math-rocket-fail 2s ease-in-out forwards; }
    `;
    document.head.appendChild(s);
  },

  /* ---------- THEME ---------- */
  applyTheme() {
    Engine.el('screen-game').className      = 'screen math-bg';
    Engine.el('screen-midpoint').className  = 'screen hidden math-bg';
    Engine.el('screen-result').className    = 'screen hidden math-bg';

    // Inject sidebar HTML
    Engine.el('game-sidebar').innerHTML = `
      <div class="math-sidebar">
        <span class="math-sb-lbl">🌙</span>
        <div class="math-track" id="math-track">
          <div class="math-fill"        id="math-fill"   style="height:0%"></div>
          <div class="math-prog-rocket" id="math-rocket" style="bottom:0%">🚀</div>
        </div>
        <span class="math-sb-lbl">🌍</span>
      </div>`;
  },

  /* ---------- PROGRESS DOTS ---------- */
  buildDots() {
    const track = Engine.el('math-track');
    if(!track) return;
    track.querySelectorAll('.math-dot').forEach(d => d.remove());
    for(let i=1; i<=Engine.TOTAL_Q; i++) {
      const d = document.createElement('div');
      d.className = 'math-dot'; d.id = `mdot-${i}`;
      d.style.bottom = (i / Engine.TOTAL_Q * 100) + '%';
      track.appendChild(d);
    }
  },

  setProgress(qNum) {
    const pct = (qNum / Engine.TOTAL_Q) * 100;
    const f = Engine.el('math-fill'),   r = Engine.el('math-rocket');
    if(f) f.style.height  = pct + '%';
    if(r) r.style.bottom  = pct + '%';
    for(let i=1; i<=Engine.TOTAL_Q; i++) {
      const d = Engine.el(`mdot-${i}`);
      if(d) d.classList.toggle('lit', i <= qNum);
    }
  },

  /* ---------- QUESTION GENERATION ---------- */
  generateQuestions() {
    const {ri, shuffle} = Engine;
    const qs = [];
    // q1-3: result ≤ 9
    for(let i=0;i<3;i++) { const a=ri(1,5), b=ri(1,Math.min(4,9-a));   qs.push(_mk(a,b)); }
    // q4-6: result ≤ 17
    for(let i=0;i<3;i++) { const a=ri(3,9), b=ri(5,Math.min(8,17-a));  qs.push(_mk(a,b)); }
    // q7-9: result ≤ 25
    for(let i=0;i<3;i++) { const a=ri(10,16),b=ri(3,Math.min(9,25-a)); qs.push(_mk(a,b)); }
    // q10: result ≤ 30
    const a=ri(13,17), b=ri(7,Math.min(13,30-a)); qs.push(_mk(a,b));
    return qs;

    function _mk(a, b) {
      const correct = a + b;
      const opts = new Set([correct]);
      shuffle([-3,-2,-1,1,2,3]).forEach(d => {
        if(opts.size < 4) { const c=correct+d; if(c>0 && !opts.has(c)) opts.add(c); }
      });
      let e = correct + 4;
      while(opts.size < 4) { if(!opts.has(e)) opts.add(e); e++; }
      return { a, b, correct, options: shuffle([...opts]) };
    }
  },

  /* ---------- RENDER QUESTION CARD ---------- */
  renderCard(q) {
    const EMOJIS = ['🍎','⭐','🌙','🚀','🎈','🌟','🍕','🐣','🦋','🌈'];
    const emoji  = EMOJIS[(q.a + q.b) % EMOJIS.length];
    Engine.el('q-content').innerHTML = `
      <div style="font-size:1.35rem;letter-spacing:3px;min-height:34px;margin-bottom:6px">
        ${emoji.repeat(Math.min(q.a + q.b, 8))}
      </div>
      <div style="font-size:clamp(2.6rem,8vw,4.2rem);font-weight:900;color:#fff;text-shadow:2px 2px 0 rgba(0,0,0,.25)">
        ${q.a} + ${q.b} = ?
      </div>`;
  },

  /* ---------- RESULT ANIMATION ---------- */
  onResult(won) {
    const extra = Engine.el('result-level-extra');

    if(won) {
      extra.innerHTML = `
        <div class="math-res-moon approach"></div>
        <div class="math-launch-wrap" id="math-launch">
          <div class="rocket-body-wrap">
            <div class="r-nose"></div>
            <div class="r-body"><div class="r-eye"></div><div class="r-eye"></div></div>
            <div class="r-fins"><div class="r-fin r-fin-l"></div><div class="r-fin r-fin-r"></div></div>
          </div>
          <div class="r-flames">
            <div class="r-flame r-flame-s"></div>
            <div class="r-flame r-flame-m"></div>
            <div class="r-flame r-flame-s2"></div>
          </div>
        </div>`;
      Engine.createConfetti();
      setTimeout(() => { Engine.el('math-launch').classList.add('go'); Engine.playLaunch(); }, 600);
      setTimeout(() => Engine.playStars(), 3200);
    } else {
      extra.innerHTML = `
        <div class="math-launch-wrap" id="math-launch">
          <div class="rocket-body-wrap">
            <div class="r-nose"></div>
            <div class="r-body"><div class="r-eye"></div><div class="r-eye"></div></div>
            <div class="r-fins"><div class="r-fin r-fin-l"></div><div class="r-fin r-fin-r"></div></div>
          </div>
          <div class="r-flames">
            <div class="r-flame r-flame-s"></div>
            <div class="r-flame r-flame-m"></div>
            <div class="r-flame r-flame-s2"></div>
          </div>
        </div>`;
      setTimeout(() => { Engine.el('math-launch').classList.add('fail'); Engine.playWrong(); }, 400);
      setTimeout(() => Engine.playStars(), 600);
    }
  },
};
