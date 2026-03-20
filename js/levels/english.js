/* ============================================================
   LEVELS/ENGLISH.JS — Inglés level
   London theme: girl climbs Big Ben tower.
   To add a new level, copy this file and adapt it.
============================================================ */

'use strict';

const EnglishLevel = {

  /* ---------- METADATA ---------- */
  id:          'english',
  name:        '🇬🇧 Inglés',
  nextLevelId: 'flags',
  answerClass: 'ans-btn eng',

  winTitle:   '🎉 ¡Llegaste al Big Ben! 🏰',
  loseTitle:  '¡Casi llegas! 🇬🇧<br>¡Practica un poco más!',
  winMessage: '¡Eres un campeón del inglés! Well done! 🌟',
  levelIntroMessage: '¡Ahora viaja por el mundo a aprender las banderas! 🌍',

  /* ---------- MOUNT: inject level CSS once ---------- */
  mount() {
    const s = document.createElement('style');
    s.textContent = `
      /* ---- English level: London theme ---- */
      @keyframes eng-fog-drift  { 0%,100%{transform:translateX(0);opacity:.7} 50%{transform:translateX(16px);opacity:.95} }
      @keyframes eng-girl-bob   { 0%,100%{transform:translateX(-50%) translateY(50%)} 50%{transform:translateX(-50%) translateY(calc(50% - 6px))} }
      @keyframes eng-bb-arrive  { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
      @keyframes eng-bell-swing { 0%,100%{transform:rotate(0)} 20%{transform:rotate(10deg)} 40%{transform:rotate(-10deg)} 60%{transform:rotate(5deg)} 80%{transform:rotate(-5deg)} }
      @keyframes eng-uk-fall    { 0%{transform:translateY(-30px) rotate(0);opacity:1} 100%{transform:translateY(110vh) translateX(var(--drift,30px)) rotate(540deg);opacity:0} }

      /* Backgrounds */
      #screen-game.eng-bg    { background: linear-gradient(180deg,#0d1520 0%,#182435 40%,#1e2f42 70%,#253444 100%); }
      #screen-midpoint.eng-bg{ background: linear-gradient(180deg,#0d1520 0%,#182435 40%,#1e2f42 100%); gap:18px; padding:24px; }
      #screen-result.eng-bg  { background: linear-gradient(180deg,#0d1520 0%,#182435 40%,#1e2f42 100%); overflow:hidden; padding:20px; }

      /* London cityscape injected into game screen */
      .eng-city-bg { position:absolute; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
      .eng-fog     { position:absolute; bottom:100px; left:-10px; right:-10px; height:55px;
                     background:linear-gradient(180deg,transparent,rgba(160,200,220,.12) 55%,transparent);
                     animation:eng-fog-drift 9s ease-in-out infinite; }

      /* Big Ben sidebar */
      .eng-sidebar { display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;width:60px; }
      .eng-sb-lbl  { font-size:1.25rem;line-height:1;filter:drop-shadow(0 0 5px rgba(255,215,0,.55)); }

      .bigben-tower { flex:1;min-height:180px;position:relative;display:flex;flex-direction:column;align-items:center; }
      .bb-spire   { width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:24px solid #d4a843;flex-shrink:0;z-index:3; }
      .bb-belfry  { width:28px;height:12px;background:linear-gradient(180deg,#d4a843,#b8902e);border-radius:2px 2px 0 0;flex-shrink:0;z-index:3; }
      .bb-clock-sec { width:38px;height:38px;flex-shrink:0;z-index:3;background:#c9a43e;display:flex;align-items:center;justify-content:center; }
      .bb-clock-face {
        width:28px;height:28px;background:#0a1e35;border-radius:50%;
        border:3px solid #eedd90;position:relative;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 9px rgba(238,221,144,.45);
      }
      .bb-clock-face::before,.bb-clock-face::after {
        content:'';position:absolute;background:#eedd90;border-radius:1px;
        bottom:50%;left:50%;transform-origin:bottom center;
      }
      .bb-clock-face::before { width:2px;height:7px;margin-left:-1px;transform:rotate(-45deg); }
      .bb-clock-face::after  { width:1.5px;height:9px;margin-left:-.75px;transform:rotate(110deg); }
      .bb-clock-sec.ringing  { animation:eng-bell-swing .45s ease-in-out 4; }

      .bb-shaft {
        flex:1;width:34px;min-height:60px;
        background:linear-gradient(90deg,#b8902e 0%,#d4a843 35%,#c9a43e 65%,#b8902e 100%);
        border-left:3px solid #956f1e;border-right:3px solid #956f1e;
        position:relative;z-index:3;overflow:hidden;
      }
      .bb-shaft::before,.bb-shaft::after {
        content:'';position:absolute;left:50%;transform:translateX(-50%);
        width:9px;height:15px;background:rgba(8,22,50,.78);
        border-radius:4px 4px 0 0;border:1px solid rgba(238,221,144,.22);
      }
      .bb-shaft::before { top:12%; } .bb-shaft::after { top:54%; }

      .bb-prog-fill {
        position:absolute;bottom:0;left:0;right:0;
        background:linear-gradient(0deg,rgba(255,100,30,.55),rgba(255,190,40,.3) 60%,transparent);
        transition:height .65s cubic-bezier(.34,1.56,.64,1);
      }
      .bb-base   { width:40px;height:12px;background:linear-gradient(180deg,#956f1e,#6e510f);flex-shrink:0;z-index:3; }
      .bb-plinth { width:52px;height:8px;background:#50390a;border-radius:1px;flex-shrink:0;z-index:3; }

      .girl-char {
        position:absolute;left:50%;transform:translateX(-50%) translateY(50%);
        font-size:1.5rem;z-index:10;
        filter:drop-shadow(0 2px 5px rgba(0,0,0,.7));
        animation:eng-girl-bob 1.3s ease-in-out infinite;
        transition:bottom .65s cubic-bezier(.34,1.56,.64,1);
      }
      .bb-dot { position:absolute;right:-14px;width:9px;height:9px;background:rgba(255,255,255,.18);border-radius:50%;border:1.5px solid rgba(212,168,67,.4);transition:background .4s,box-shadow .4s; }
      .bb-dot.lit { background:#ffd700;box-shadow:0 0 7px #ffd700; }

      /* Question card content */
      .eng-card-label  { font-size:.8rem;font-weight:700;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px; }
      .eng-card-word   { font-size:clamp(1.55rem,5.5vw,2.5rem);font-weight:900;color:#ffd700;text-shadow:0 2px 10px rgba(0,0,0,.4);line-height:1.25; }
      .eng-card-arrow  { font-size:1.5rem;color:rgba(255,255,255,.45);margin:2px 0; }
      .eng-card-emoji  { font-size:1.4rem; }

      /* Result Big Ben decoration */
      .eng-res-bb {
        position:fixed;bottom:-10px;right:16px;z-index:3;
        opacity:0;transform:translateY(50px);
        display:flex;flex-direction:column;align-items:center; scale:.75;
      }
      .eng-res-bb.arrive { animation:eng-bb-arrive .9s ease-out 1s forwards; }
      .eng-uk-confetti { position:fixed;pointer-events:none;z-index:6; animation:eng-uk-fall var(--dur,3s) linear var(--del,0s) forwards; }
    `;
    document.head.appendChild(s);
  },

  /* ---------- THEME ---------- */
  applyTheme() {
    Engine.el('screen-game').className     = 'screen eng-bg';
    Engine.el('screen-midpoint').className = 'screen hidden eng-bg';
    Engine.el('screen-result').className   = 'screen hidden eng-bg';

    // Inject London cityscape + Big Ben sidebar
    Engine.el('game-sidebar').innerHTML = `
      <div class="eng-city-bg">
        <svg style="position:absolute;bottom:0;left:0;width:100%;height:200px" viewBox="0 0 800 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
          <path fill="#0a1420" d="
            M0,200 L0,150 L30,150 L30,130 L50,130 L50,110 L70,110 L70,95
            L90,95 L90,130 L110,130 L110,115 L130,115 L130,90 L150,90 L150,125
            L170,125 L170,105 L190,105 L190,90 L210,90 L210,115 L230,115
            L230,100 L250,100 L250,80 L270,80 L270,105 L290,105 L290,120
            L310,120 L310,95 L330,95 L330,75 L350,75 L350,100 L370,100
            L370,115 L390,115 L390,88 L410,88 L410,68 L430,68 L430,92
            L450,92 L450,108 L470,108 L470,85 L490,85 L490,72 L510,72
            L510,95 L530,95 L530,82 L550,82 L550,100 L570,100 L570,115
            L590,115 L590,98 L610,98 L610,78 L630,78 L630,100 L650,100
            L650,118 L670,118 L670,102 L690,102 L690,115 L710,115 L710,128
            L730,128 L730,110 L750,110 L750,90 L770,90 L770,125 L790,125
            L790,140 L800,140 L800,200 Z"/>
          <path fill="#0c1928" d="M80,200 L80,140 L88,140 L88,118 L92,118 L92,100 L96,100 L96,118 L100,118 L100,140 L148,140 L148,118 L152,118 L152,100 L156,100 L156,118 L160,118 L160,140 L168,140 L168,200 Z"/>
          <rect fill="#0c1928" x="88" y="130" width="72" height="4"/>
          <rect fill="rgba(10,30,65,.85)" x="0" y="170" width="800" height="30"/>
          <path fill="rgba(20,60,120,.3)" d="M0,175 Q200,170 400,175 Q600,180 800,175 L800,180 L0,180 Z"/>
        </svg>
        <div class="eng-fog"></div>
      </div>
      <div class="eng-sidebar">
        <span class="eng-sb-lbl">🌟</span>
        <div class="bigben-tower" id="bb-tower">
          <div class="bb-spire"></div>
          <div class="bb-belfry"></div>
          <div class="bb-clock-sec" id="bb-clock">
            <div class="bb-clock-face"></div>
          </div>
          <div class="bb-shaft" id="bb-shaft">
            <div class="bb-prog-fill" id="bb-fill"   style="height:0%"></div>
            <div class="girl-char"    id="girl-char"  style="bottom:0%">👧</div>
          </div>
          <div class="bb-base"></div>
          <div class="bb-plinth"></div>
        </div>
        <span class="eng-sb-lbl">🏙️</span>
      </div>`;
  },

  /* ---------- PROGRESS DOTS ---------- */
  buildDots() {
    const shaft = Engine.el('bb-shaft');
    if(!shaft) return;
    shaft.querySelectorAll('.bb-dot').forEach(d => d.remove());
    for(let i=1; i<=Engine.TOTAL_Q; i++) {
      const d = document.createElement('div');
      d.className = 'bb-dot'; d.id = `bbdot-${i}`;
      d.style.bottom = (i / Engine.TOTAL_Q * 100) + '%';
      shaft.appendChild(d);
    }
  },

  setProgress(qNum) {
    const pct = (qNum / Engine.TOTAL_Q) * 100;
    const f = Engine.el('bb-fill'),  g = Engine.el('girl-char');
    if(f) f.style.height = pct + '%';
    if(g) g.style.bottom = pct + '%';
    for(let i=1; i<=Engine.TOTAL_Q; i++) {
      const d = Engine.el(`bbdot-${i}`);
      if(d) d.classList.toggle('lit', i <= qNum);
    }
  },

  /* ---------- QUESTION BANK ---------- */
  _bank: {
    words: [
      { es:'ventana',  correct:'window',  distractors:['door','table','chair','wall'] },
      { es:'puerta',   correct:'door',    distractors:['window','wall','floor','chair'] },
      { es:'lápiz',    correct:'pencil',  distractors:['pen','book','ruler','eraser'] },
      { es:'libro',    correct:'book',    distractors:['pen','paper','notebook','ruler'] },
      { es:'gato',     correct:'cat',     distractors:['dog','fish','bird','rabbit'] },
      { es:'perro',    correct:'dog',     distractors:['cat','fish','bird','horse'] },
      { es:'mesa',     correct:'table',   distractors:['chair','door','window','desk'] },
      { es:'silla',    correct:'chair',   distractors:['table','sofa','floor','bench'] },
      { es:'agua',     correct:'water',   distractors:['milk','juice','tea','coffee'] },
      { es:'casa',     correct:'house',   distractors:['flat','school','shop','park'] },
    ],
    phrases: [
      { es:'mi coche es verde',     correct:'my car is green',    distractors:['my house is green','the car is blue','my car is red'] },
      { es:'el gato es grande',     correct:'the cat is big',     distractors:['the dog is big','the cat is small','a cat is big'] },
      { es:'me gusta el chocolate', correct:'I like chocolate',   distractors:['she likes chocolate','I eat chocolate','I love chocolate'] },
      { es:'ella tiene un libro',   correct:'she has a book',     distractors:['he has a book','she has a pen','they have a book'] },
      { es:'el cielo es azul',      correct:'the sky is blue',    distractors:['the sea is blue','the sky is grey','the sky is clear'] },
      { es:'mi casa es grande',     correct:'my house is big',    distractors:['my house is small','her house is big','the house is big'] },
    ],
    sentences: [
      { es:'voy a la escuela',           correct:'I go to school',     distractors:['I go to the park','she goes to school','we go to school'] },
      { es:'ella come una manzana',      correct:'she eats an apple',  distractors:['she eats a pear','he eats an apple','they eat an apple'] },
      { es:'jugamos al fútbol',          correct:'we play football',   distractors:['they play football','we play tennis','I play football'] },
      { es:'mi madre cocina bien',       correct:'my mum cooks well',  distractors:['my dad cooks well','my mum eats well','her mum cooks well'] },
      { es:'tengo un perro marrón',      correct:'I have a brown dog', distractors:['I have a black dog','she has a brown dog','I have a brown cat'] },
    ],
  },

  _tiers: [
    { key:'words',     count:4, label:'Traduce la palabra',  emoji:['🪟','🚪','✏️','📚','🐱','🐶','🪑','💺','💧','🏠'] },
    { key:'phrases',   count:3, label:'Traduce la frase',    emoji:['🚗','🐱','🍫','📖','☁️','🏡'] },
    { key:'sentences', count:3, label:'Traduce la oración',  emoji:['🏫','🍎','⚽','👩‍🍳','🐕'] },
  ],

  /* ---------- QUESTION GENERATION ---------- */
  generateQuestions() {
    const {shuffle} = Engine;
    const all = [];
    this._tiers.forEach(tier => {
      const pool = shuffle([...this._bank[tier.key]]).slice(0, tier.count);
      pool.forEach(q => {
        const wrong = shuffle([...q.distractors]).slice(0, 3);
        all.push({ es: q.es, correct: q.correct, options: shuffle([q.correct, ...wrong]), _tier: tier });
      });
    });
    return all;
  },

  /* ---------- RENDER QUESTION CARD ---------- */
  renderCard(q, idx) {
    const tier  = q._tier;
    const emoji = tier.emoji[idx % tier.emoji.length];
    Engine.el('q-content').innerHTML = `
      <div class="eng-card-label">${tier.label}</div>
      <div class="eng-card-word">${q.es}</div>
      <div class="eng-card-arrow">↓</div>
      <div class="eng-card-emoji">${emoji} 🇬🇧</div>`;
  },

  /* ---------- RESULT ANIMATION ---------- */
  onResult(won) {
    const extra = Engine.el('result-level-extra');

    if(won) {
      extra.innerHTML = `
        <div class="eng-res-bb arrive" id="eng-res-bb">
          <div class="bb-spire" style="border-bottom-width:36px;border-left-width:9px;border-right-width:9px"></div>
          <div class="bb-belfry" style="width:40px;height:18px"></div>
          <div class="bb-clock-sec" id="eng-res-clock" style="width:52px;height:52px">
            <div class="bb-clock-face" style="width:40px;height:40px"></div>
          </div>
          <div class="bb-shaft" style="width:48px;height:100px"></div>
          <div class="bb-base" style="width:56px"></div>
          <div class="bb-plinth" style="width:68px"></div>
        </div>`;
      this._createUKConfetti();
      setTimeout(() => {
        const c = Engine.el('eng-res-clock');
        if(c) c.classList.add('ringing');
        Engine.playStars();
      }, 2000);
      Engine.playLaunch();
    } else {
      extra.innerHTML = '';
      setTimeout(() => Engine.playStars(), 500);
    }
  },

  _createUKConfetti() {
    const {rnd, pick} = Engine;
    const items = ['🇬🇧','⭐','🌟','✨','🏆','💫','🎊'];
    for(let i=0; i<50; i++) {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'eng-uk-confetti';
        d.textContent = pick(items);
        const dur = rnd(2,5).toFixed(1);
        d.style.cssText = `left:${rnd(0,100)}%;top:-30px;font-size:${rnd(1,2.4).toFixed(1)}rem;--dur:${dur}s;--del:0s;--drift:${rnd(-60,60).toFixed(0)}px`;
        document.body.appendChild(d);
        setTimeout(() => d.remove(), (+dur+.5)*1000);
      }, i * 85);
    }
  },
};
