/* ============================================================
   LEVELS/FLAGS.JS — Banderas del Mundo level
   Sky journey: girl on a biplane flies from home up through clouds.
============================================================ */

'use strict';

const FlagsLevel = {

  /* ---------- METADATA ---------- */
  id:          'flags',
  name:        '🌍 Banderas',
  nextLevelId: null,
  answerClass: 'ans-btn',

  winTitle:   '🎉 ¡Vuelta al mundo completada! ✈️',
  loseTitle:  '¡Casi completas la vuelta! 🌍<br>¡Practica un poco más!',
  winMessage: '¡Eres un experto en geografía mundial! 🌟',
  levelIntroMessage: '',

  /* ---------- MOUNT: inject level CSS once ---------- */
  mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* ─── Flags: sky journey theme ─────────────────────────── */

      @keyframes flg-avioneta-bob {
        0%,100% { transform: translateX(-50%) translateY(50%) rotate(3deg); }
        50%     { transform: translateX(-50%) translateY(calc(50% - 6px)) rotate(-3deg); }
      }
      @keyframes flg-prop-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes flg-cloud-drift-r {
        0%,100% { transform: translateX(-50%); }
        50%     { transform: translateX(calc(-50% + 5px)); }
      }
      @keyframes flg-cloud-drift-l {
        0%,100% { transform: translateX(-50%); }
        50%     { transform: translateX(calc(-50% - 5px)); }
      }
      @keyframes flg-atmos-shimmer {
        0%,100% { opacity: .5; }
        50%     { opacity: .85; }
      }
      @keyframes flg-plane-fly {
        0%   { transform: translateX(-50%) translateY(0) rotate(-5deg); }
        100% { transform: translateX(-50%) translateY(-140vh) rotate(-8deg); }
      }
      @keyframes flg-plane-fail {
        0%   { transform: translateX(-50%) translateY(0) rotate(-3deg); }
        25%  { transform: translateX(-50%) translateY(-50px) rotate(18deg); }
        55%  { transform: translateX(-50%) translateY(-18px) rotate(-22deg); }
        100% { transform: translateX(-50%) translateY(0) rotate(-3deg); }
      }
      @keyframes flg-globe-arrive {
        from { transform: translateX(-50%) scale(.5); opacity: 0; }
        to   { transform: translateX(-50%) scale(1);  opacity: 1; }
      }
      @keyframes flg-globe-pulse {
        0%,100% { filter: drop-shadow(0 0 12px rgba(78,205,196,.5)); }
        50%     { filter: drop-shadow(0 0 30px rgba(78,205,196,.9)); }
      }
      @keyframes flg-confetti-fall {
        0%   { transform: translateY(-30px) rotate(0); opacity: 1; }
        100% { transform: translateY(110vh) translateX(var(--drift,30px)) rotate(540deg); opacity: 0; }
      }

      /* Backgrounds */
      #screen-game.flg-bg     { background: linear-gradient(175deg, #06101c 0%, #0c1f3a 45%, #102845 100%); }
      #screen-midpoint.flg-bg { background: linear-gradient(175deg, #06101c 0%, #0c1f3a 45%, #102845 100%); gap:18px; padding:24px; }
      #screen-result.flg-bg   { background: linear-gradient(175deg, #06101c 0%, #0c1f3a 45%, #102845 100%); overflow:hidden; padding:20px; }

      /* Atmospheric background blobs */
      .flg-atmos { position:absolute; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
      .flg-atmos-blob {
        position: absolute;
        background: rgba(160,200,255,.055);
        border-radius: 50%;
        animation: flg-atmos-shimmer 9s ease-in-out infinite;
      }
      .flg-atmos-blob-1 { width:220px; height:90px;  top:12%; left:-50px;  animation-delay:0s; }
      .flg-atmos-blob-2 { width:190px; height:75px;  top:42%; right:-40px; animation-delay:-4s; }
      .flg-atmos-blob-3 { width:170px; height:65px;  top:70%; left:15%;    animation-delay:-7s; }

      /* ─── Sidebar ────────────────────────────────────────────── */
      .flg-sidebar {
        display: flex; flex-direction: column; align-items: center;
        gap: 4px; flex-shrink: 0; width: 64px; z-index: 1;
      }
      .flg-sb-lbl-top {
        font-size: 1.5rem; line-height: 1;
        filter: drop-shadow(0 0 8px rgba(200,230,255,.75));
      }
      .flg-sb-lbl-bot {
        font-size: 1.5rem; line-height: 1;
        filter: drop-shadow(0 0 6px rgba(255,180,80,.6));
      }

      /* Sky track */
      .flg-track {
        flex: 1; width: 30px; min-height: 180px;
        background: linear-gradient(0deg,
          rgba(255,155,55,.13)  0%,
          rgba(70,145,240,.17)  50%,
          rgba(180,218,255,.13) 100%);
        border-radius: 15px;
        border: 2px solid rgba(175,212,255,.22);
        position: relative; overflow: visible;
        box-shadow: 0 0 20px rgba(140,195,255,.1), inset 0 0 8px rgba(255,255,255,.03);
      }

      /* Altitude fill */
      .flg-fill {
        position: absolute; bottom: 0; left: 0; width: 100%;
        background: linear-gradient(0deg,
          rgba(255,138,50,.48) 0%,
          rgba(70,155,255,.52) 50%,
          rgba(200,232,255,.38) 100%);
        border-radius: 13px;
        transition: height .65s cubic-bezier(.34,1.56,.64,1);
        box-shadow: 0 0 14px rgba(140,200,255,.5);
      }

      /* Progress dots */
      .flg-dot {
        position: absolute; right: -11px;
        width: 10px; height: 10px;
        background: rgba(175,212,255,.2); border-radius: 50%;
        border: 1.5px solid rgba(175,212,255,.38);
        transform: translateX(50%);
        transition: background .4s, box-shadow .4s;
      }
      .flg-dot.lit { background: #88ccff; box-shadow: 0 0 8px #88ccff; }

      /* ─── CSS clouds on track ───────────────────────────────── */
      .flg-cloud {
        position: absolute; left: 50%;
        transform: translateX(-50%);
        pointer-events: none; z-index: 6;
        /* body */
        width: 56px; height: 15px;
        background: rgba(212,230,255,.62);
        border-radius: 0 0 10px 10px;
      }
      /* top bumps via ::before */
      .flg-cloud::before {
        content: '';
        position: absolute;
        bottom: 8px; left: 6px;
        width: 22px; height: 22px;
        background: rgba(212,230,255,.62);
        border-radius: 50%;
        box-shadow: 22px 0 0 0 rgba(212,230,255,.62);
      }
      .flg-cloud.flg-drift-r { animation: flg-cloud-drift-r 6s   ease-in-out infinite; }
      .flg-cloud.flg-drift-l { animation: flg-cloud-drift-l 7.5s ease-in-out infinite; }

      /* ─── BIPLANE CHARACTER ─────────────────────────────────── */
      .flg-avioneta {
        position: absolute; left: 50%;
        /* base transform overridden by animation keyframes */
        transform: translateX(-50%) translateY(50%);
        display: flex; flex-direction: column; align-items: center;
        gap: 1px;
        animation: flg-avioneta-bob 1.9s ease-in-out infinite;
        transition: bottom .65s cubic-bezier(.34,1.56,.64,1);
        z-index: 4;
        filter: drop-shadow(0 3px 9px rgba(0,0,0,.7));
      }

      /* Spinning propeller (cross shape) */
      .flg-bp-prop {
        width: 22px; height: 3px;
        background: rgba(255,255,255,.85);
        border-radius: 2px;
        animation: flg-prop-spin .16s linear infinite;
        transform-origin: center;
        position: relative;
        margin-bottom: 1px;
      }
      .flg-bp-prop::before {
        content: '';
        position: absolute; top: 50%; left: 50%;
        width: 3px; height: 22px;
        transform: translate(-50%, -50%);
        background: rgba(255,255,255,.85);
        border-radius: 2px;
      }

      /* Nose cone */
      .flg-bp-nose {
        width: 0; height: 0;
        border-left:  6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 10px solid #f5a623;
      }

      /* Upper wing */
      .flg-bp-wing-t {
        width: 50px; height: 7px;
        background: linear-gradient(90deg, #9a6008 0%, #f5c535 30%, #ffe878 50%, #f5c535 70%, #9a6008 100%);
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,.45);
      }

      /* Cockpit with girl emoji */
      .flg-bp-cockpit {
        width: 20px; height: 20px;
        background: linear-gradient(180deg, #5ba5f0 0%, #2864c0 100%);
        border-radius: 8px 8px 3px 3px;
        display: flex; align-items: center; justify-content: center;
        font-size: .86rem; line-height: 1;
        border: 1.5px solid rgba(255,255,255,.3);
        overflow: hidden;
      }

      /* Lower wing */
      .flg-bp-wing-b {
        width: 42px; height: 6px;
        background: linear-gradient(90deg, #9a6008 0%, #f5c535 30%, #ffe878 50%, #f5c535 70%, #9a6008 100%);
        border-radius: 3px;
        box-shadow: 0 1px 3px rgba(0,0,0,.38);
      }

      /* Fuselage body */
      .flg-bp-fuselage {
        width: 12px; height: 14px;
        background: linear-gradient(180deg, #2864c0 0%, #1a4898 100%);
        border-left:  1px solid rgba(255,255,255,.15);
        border-right: 1px solid rgba(255,255,255,.15);
      }

      /* Tail fin */
      .flg-bp-tail {
        width: 0; height: 0;
        border-left:  7px solid transparent;
        border-right: 7px solid transparent;
        border-top:   9px solid #1a4898;
      }

      /* ─── Result extras ──────────────────────────────────────── */
      .flg-res-globe {
        position: fixed; bottom: -20px; left: 50%;
        transform: translateX(-50%);
        font-size: 9rem; z-index: 3; opacity: 0;
      }
      .flg-res-globe.arrive {
        animation:
          flg-globe-arrive 1s ease-out .5s forwards,
          flg-globe-pulse  2s ease-in-out 1.6s infinite;
      }
      .flg-launch-plane {
        position: fixed; bottom: -90px; left: 50%;
        transform: translateX(-50%) rotate(-5deg);
        font-size: 3.2rem; z-index: 10;
        filter: drop-shadow(0 0 12px rgba(255,255,255,.9));
      }
      .flg-launch-plane.go   { animation: flg-plane-fly  3s ease-in     forwards; }
      .flg-launch-plane.fail { animation: flg-plane-fail 2s ease-in-out forwards; }
      .flg-confetti {
        position: fixed; pointer-events: none; z-index: 6;
        animation: flg-confetti-fall var(--dur,3s) linear var(--del,0s) forwards;
      }
    `;
    document.head.appendChild(s);
  },

  /* ---------- THEME ---------- */
  applyTheme() {
    Engine.el('screen-game').className     = 'screen flg-bg';
    Engine.el('screen-midpoint').className = 'screen hidden flg-bg';
    Engine.el('screen-result').className   = 'screen hidden flg-bg';

    Engine.el('game-sidebar').innerHTML = `
      <div class="flg-atmos">
        <div class="flg-atmos-blob flg-atmos-blob-1"></div>
        <div class="flg-atmos-blob flg-atmos-blob-2"></div>
        <div class="flg-atmos-blob flg-atmos-blob-3"></div>
      </div>
      <div class="flg-sidebar">
        <span class="flg-sb-lbl-top">⛅</span>
        <div class="flg-track" id="flg-track">
          <div class="flg-fill" id="flg-fill" style="height:0%"></div>
          <div class="flg-avioneta" id="flg-avioneta" style="bottom:0%">
            <div class="flg-bp-prop"></div>
            <div class="flg-bp-nose"></div>
            <div class="flg-bp-wing-t"></div>
            <div class="flg-bp-cockpit">👧</div>
            <div class="flg-bp-wing-b"></div>
            <div class="flg-bp-fuselage"></div>
            <div class="flg-bp-tail"></div>
          </div>
        </div>
        <span class="flg-sb-lbl-bot">🏠</span>
      </div>`;
  },

  /* ---------- PROGRESS DOTS + DECORATIVE CLOUDS ---------- */
  buildDots() {
    const track = Engine.el('flg-track');
    if(!track) return;
    track.querySelectorAll('.flg-dot, .flg-cloud').forEach(d => d.remove());

    // Step dots (right side of track)
    for(let i = 1; i <= Engine.TOTAL_Q; i++) {
      const d = document.createElement('div');
      d.className = 'flg-dot'; d.id = `fdot-${i}`;
      d.style.bottom = (i / Engine.TOTAL_Q * 100) + '%';
      track.appendChild(d);
    }

    // Decorative clouds at 5 irregular heights
    [10, 27, 45, 63, 82].forEach((h, i) => {
      const c = document.createElement('div');
      c.className = 'flg-cloud ' + (i % 2 === 0 ? 'flg-drift-r' : 'flg-drift-l');
      c.style.cssText = `bottom:${h}%;animation-delay:-${(i * 1.5).toFixed(1)}s`;
      track.appendChild(c);
    });
  },

  setProgress(qNum) {
    const pct = (qNum / Engine.TOTAL_Q) * 100;
    const f = Engine.el('flg-fill'), a = Engine.el('flg-avioneta');
    if(f) f.style.height = pct + '%';
    if(a) a.style.bottom = pct + '%';
    for(let i = 1; i <= Engine.TOTAL_Q; i++) {
      const d = Engine.el(`fdot-${i}`);
      if(d) d.classList.toggle('lit', i <= qNum);
    }
  },

  /* ---------- FLAG BANK ---------- */
  _bank: [
    // ── Tier 1: muy conocidas ────────────────────────────────────
    { flag:'🇪🇸', correct:'España',         tier:1, distractors:['Portugal','Francia','Italia','México'] },
    { flag:'🇫🇷', correct:'Francia',         tier:1, distractors:['Bélgica','España','Italia','Suiza'] },
    { flag:'🇩🇪', correct:'Alemania',        tier:1, distractors:['Austria','Países Bajos','Polonia','Suiza'] },
    { flag:'🇮🇹', correct:'Italia',          tier:1, distractors:['España','Francia','Grecia','Portugal'] },
    { flag:'🇬🇧', correct:'Reino Unido',     tier:1, distractors:['Irlanda','Australia','Canadá','Nueva Zelanda'] },
    { flag:'🇺🇸', correct:'Estados Unidos',  tier:1, distractors:['Canadá','Australia','México','Liberia'] },
    { flag:'🇧🇷', correct:'Brasil',          tier:1, distractors:['Argentina','Colombia','Bolivia','Venezuela'] },
    { flag:'🇲🇽', correct:'México',          tier:1, distractors:['Italia','Hungría','Bolivia','Venezuela'] },
    { flag:'🇯🇵', correct:'Japón',           tier:1, distractors:['China','Corea del Sur','Bangladesh','Georgia'] },
    { flag:'🇨🇳', correct:'China',           tier:1, distractors:['Vietnam','Corea del Norte','Singapur','Turquía'] },
    { flag:'🇦🇷', correct:'Argentina',       tier:1, distractors:['Uruguay','Honduras','Guatemala','El Salvador'] },
    { flag:'🇵🇹', correct:'Portugal',        tier:1, distractors:['España','Brasil','Italia','Argelia'] },
    // ── Tier 2: nivel medio ──────────────────────────────────────
    { flag:'🇦🇺', correct:'Australia',       tier:2, distractors:['Nueva Zelanda','Fiji','Tuvalu','Papúa Nueva Guinea'] },
    { flag:'🇨🇦', correct:'Canadá',          tier:2, distractors:['Estados Unidos','Perú','Georgia','Dinamarca'] },
    { flag:'🇷🇺', correct:'Rusia',           tier:2, distractors:['Eslovaquia','Serbia','Eslovenia','Croacia'] },
    { flag:'🇮🇳', correct:'India',           tier:2, distractors:['Irán','Níger','Costa de Marfil','Irlanda'] },
    { flag:'🇰🇷', correct:'Corea del Sur',   tier:2, distractors:['Japón','China','Mongolia','Vietnam'] },
    { flag:'🇳🇱', correct:'Países Bajos',    tier:2, distractors:['Luxemburgo','Croacia','Rusia','Francia'] },
    { flag:'🇨🇴', correct:'Colombia',        tier:2, distractors:['Venezuela','Ecuador','Bolivia','Perú'] },
    { flag:'🇿🇦', correct:'Sudáfrica',       tier:2, distractors:['Nigeria','Kenia','Zimbabwe','Ghana'] },
    { flag:'🇸🇪', correct:'Suecia',          tier:2, distractors:['Noruega','Dinamarca','Finlandia','Islandia'] },
    // ── Tier 3: difíciles ────────────────────────────────────────
    { flag:'🇨🇭', correct:'Suiza',           tier:3, distractors:['Austria','Liechtenstein','Georgia','Tonga'] },
    { flag:'🇹🇷', correct:'Turquía',         tier:3, distractors:['Túnez','Azerbaiyán','Pakistán','Argelia'] },
    { flag:'🇳🇴', correct:'Noruega',         tier:3, distractors:['Suecia','Dinamarca','Finlandia','Islandia'] },
    { flag:'🇬🇷', correct:'Grecia',          tier:3, distractors:['Chipre','Uruguay','Honduras','El Salvador'] },
    { flag:'🇵🇱', correct:'Polonia',         tier:3, distractors:['Indonesia','Mónaco','Austria','Singapur'] },
    { flag:'🇧🇪', correct:'Bélgica',         tier:3, distractors:['Alemania','Francia','Países Bajos','Camerún'] },
    { flag:'🇺🇦', correct:'Ucrania',         tier:3, distractors:['Suecia','Finlandia','Estonia','Kazajistán'] },
    { flag:'🇳🇬', correct:'Nigeria',         tier:3, distractors:['Kenia','Costa de Marfil','Irlanda','Jamaica'] },
  ],

  /* ---------- QUESTION GENERATION ---------- */
  generateQuestions() {
    const { shuffle } = Engine;
    const t1 = shuffle(this._bank.filter(f => f.tier === 1));
    const t2 = shuffle(this._bank.filter(f => f.tier === 2));
    const t3 = shuffle(this._bank.filter(f => f.tier === 3));
    // 4 fáciles + 3 medias + 3 difíciles
    const pool = [...t1.slice(0, 4), ...t2.slice(0, 3), ...t3.slice(0, 3)];
    return pool.map(q => {
      const wrong = shuffle([...q.distractors]).slice(0, 3);
      return { flag: q.flag, correct: q.correct, options: shuffle([q.correct, ...wrong]) };
    });
  },

  /* ---------- RENDER QUESTION CARD ---------- */
  renderCard(q) {
    Engine.el('q-content').innerHTML = `
      <div style="font-size:.8rem;font-weight:700;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px">
        ¿De qué país es esta bandera?
      </div>
      <div style="font-size:clamp(4rem,18vw,6.5rem);line-height:1.15;filter:drop-shadow(0 4px 14px rgba(0,0,0,.55));margin:2px 0 6px">
        ${q.flag}
      </div>
      <div style="font-size:.72rem;color:rgba(255,255,255,.33);font-style:italic">
        Elige el país correcto
      </div>`;
  },

  /* ---------- RESULT ANIMATION ---------- */
  onResult(won) {
    const extra = Engine.el('result-level-extra');
    if(won) {
      extra.innerHTML = `
        <div class="flg-res-globe arrive">🌍</div>
        <div class="flg-launch-plane" id="flg-launch-plane">🛩️</div>`;
      this._createFlagConfetti();
      setTimeout(() => {
        const p = Engine.el('flg-launch-plane');
        if(p) p.classList.add('go');
        Engine.playLaunch();
      }, 600);
      setTimeout(() => Engine.playStars(), 3200);
    } else {
      extra.innerHTML = `<div class="flg-launch-plane" id="flg-launch-plane">🛩️</div>`;
      setTimeout(() => {
        const p = Engine.el('flg-launch-plane');
        if(p) p.classList.add('fail');
        Engine.playWrong();
      }, 400);
      setTimeout(() => Engine.playStars(), 600);
    }
  },

  _createFlagConfetti() {
    const { rnd, pick } = Engine;
    const items = ['🌍','🌎','🌏','✈️','🗺️','⭐','🌟','🎊','🏆','💫','🎉'];
    for(let i = 0; i < 50; i++) {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'flg-confetti';
        d.textContent = pick(items);
        const dur = rnd(2, 5).toFixed(1);
        d.style.cssText = `left:${rnd(0,100)}%;top:-30px;font-size:${rnd(1,2.4).toFixed(1)}rem;--dur:${dur}s;--del:0s;--drift:${rnd(-60,60).toFixed(0)}px`;
        document.body.appendChild(d);
        setTimeout(() => d.remove(), (+dur + .5) * 1000);
      }, i * 85);
    }
  },
};
