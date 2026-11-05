// Spiele-Bereich: neun verschiedene Spiele, jedes in drei Stufen (leicht, mittel, schwer).
// Alle Spiele nutzen nur Wörter und Sätze aus den Einheiten, die die Person schon begonnen hat.

import { t } from './i18n.js';
import { speak } from './speech.js';
import { sfx, confetti } from './fx.js';
import { store } from './store.js';
import { catSvg, catLine, catPop } from './cat.js';
import { checkTyped, shuffle, sample, pick, tokens, esc } from './util.js';

const $ = (sel, el = document) => el.querySelector(sel);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

export const LEVELS = ['easy', 'medium', 'hard'];
const LEVEL_KEY = { easy: 'levelEasy', medium: 'levelMedium', hard: 'levelHard' };

// need: welche Daten das Spiel braucht, min: wie viele davon mindestens
export const GAMES = [
  { id: 'memory', icon: '🃏', need: 'words', min: 4, color: '#6366F1' },
  { id: 'pretzel', icon: '🥨', need: 'words', min: 3, color: '#F97316' },
  { id: 'sprint', icon: '⚡', need: 'words', min: 5, color: '#EAB308' },
  { id: 'anagram', icon: '🔤', need: 'single', min: 4, color: '#0EA5E9' },
  { id: 'rain', icon: '☔', need: 'nouns', min: 5, color: '#3B82F6' },
  { id: 'listen', icon: '🎧', need: 'words', min: 4, color: '#A855F7' },
  { id: 'truefalse', icon: '✅', need: 'words', min: 4, color: '#22C55E' },
  { id: 'sentence', icon: '🏁', need: 'sentences', min: 4, color: '#EC4899' },
  { id: 'typing', icon: '⌨️', need: 'words', min: 4, color: '#14B8A6' },
];

const ART = /^(der|die|das) (.+)$/;
const article = (w) => (ART.exec(w.de) || [])[1] || null;
const bare = (w) => (ART.exec(w.de) || [])[2] || w.de;
const hasPic = (w) => w.p && w.e;

// Daten für die Spiele aus den Wörtern und Sätzen bauen
export function makePool(words, sentences) {
  return {
    words,
    pics: words.filter(hasPic),
    nouns: words.filter((w) => article(w)),
    single: words.filter((w) => !/\s/.test(bare(w)) && bare(w).length >= 3),
    sentences,
  };
}

export function gameAvailable(g, pool) {
  return (pool[g.need] || []).length >= g.min;
}

const starsFor = (ratio) => (ratio >= 0.75 ? 3 : ratio >= 0.45 ? 2 : ratio > 0 ? 1 : 0);

// ---------- Rahmen eines Spiels: Kopfzeile, Punkte, Zeit, Leben, Ergebnis

function shell(root, g, level, { onExit, onDone, onAgain }) {
  root.innerHTML = '';
  const el = h(`
    <div class="player game" style="--gc:${g.color}">
      <header class="p-top">
        <button class="icon-btn quit" aria-label="✕">✕</button>
        <div class="g-title"><span>${g.icon}</span><b>${t('g_' + g.id)}</b><small>${t(LEVEL_KEY[level])}</small></div>
        <span class="g-score" aria-live="polite">0</span>
      </header>
      <div class="g-hud">
        <div class="bar timer" hidden><i style="width:100%"></i></div>
        <div class="g-lives" hidden></div>
      </div>
      <main class="p-body g-area"></main>
    </div>`);
  root.append(el);
  const cleanups = [];
  let over = false, streak = 0;
  const api = {
    el,
    area: $('.g-area', el),
    get over() { return over; },
    later(fn) { cleanups.push(fn); },
    interval(fn, ms) { const id = setInterval(fn, ms); cleanups.push(() => clearInterval(id)); return id; },
    timeout(fn, ms) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; },
    setScore(n) { $('.g-score', el).textContent = `⭐ ${n}`; },
    setTimer(frac) { const b = $('.timer', el); b.hidden = false; $('i', b).style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`; },
    setLives(left, max, icon = '❤️') {
      const l = $('.g-lives', el); l.hidden = false;
      l.innerHTML = Array.from({ length: max }, (_, i) => `<span class="life${i >= left ? ' lost' : ''}">${icon}</span>`).join('');
    },
    // Für schnelle Spiele: Flocke freut sich bei 5 und 10 richtigen in Folge
    hit(ok) {
      if (!ok) { streak = 0; return; }
      streak++;
      if (streak === 5) catPop('happy', catLine('catStreak5'));
      if (streak === 10) catPop('cheer', catLine('catStreak10'));
    },
    end(score, stars) {
      if (over) return;
      over = true;
      cleanups.forEach((f) => f());
      const record = store.saveGame(g.id, level, score);
      const xp = [2, 5, 10, 15][stars];
      onDone?.({ xp });
      sfx.done();
      if (stars >= 2) confetti();
      const mood = stars >= 3 ? 'cheer' : stars === 2 ? 'happy' : 'love';
      const line = catLine(stars >= 3 ? 'catGameGood' : stars === 2 ? 'catGameOk' : 'catGameLow');
      api.area.innerHTML = '';
      api.area.append(h(`
        <div class="ex results g-results">
          ${catSvg(mood, 150)}
          <div class="cat-quote">„${esc(line)}“</div>
          <div class="stars" aria-label="${stars}/3">${[1, 2, 3].map((i) => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
          ${record && score > 0 ? `<div class="record">🏆 ${t('newRecord')}</div>` : ''}
          <div class="stats">
            <div class="stat acc"><b>${score}</b><span>${t('score')}</span></div>
            <div class="stat xp"><b>+${xp}</b><span>${t('earned')}</span></div>
          </div>
          <div class="g-end-btns">
            <button class="btn primary again">↻ ${t('playAgain')}</button>
            <button class="btn outline back">🎮 ${t('otherGames')}</button>
          </div>
        </div>`));
      $('.again', api.area).onclick = onAgain;
      $('.back', api.area).onclick = onExit;
    },
  };
  $('.quit', el).onclick = () => { over = true; cleanups.forEach((f) => f()); onExit(); };
  api.setScore(0);
  return api;
}

const say = (w) => speak(w.de);
const shake = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

// ---------- 1. Memory

function memory(api, P, level, lang) {
  const n = { easy: 4, medium: 6, hard: 8 }[level];
  const src = level === 'easy' && P.pics.length >= n ? P.pics : P.words;
  const ws = sample(src, Math.min(n, src.length));
  const cards = shuffle(ws.flatMap((w) => [
    { k: w.key, html: level !== 'hard' && hasPic(w) ? `<span class="m-pic">${esc(w.e)}</span>` : `<span class="m-txt native">${esc(w[lang])}</span>`, w },
    { k: w.key, html: `<span class="m-txt de">${esc(w.de)}</span>`, w, de: true },
  ]));
  api.area.innerHTML = `<p class="g-help">${t('tapToFlip')}</p><div class="memory cols-${ws.length > 4 ? 4 : 4}"></div><p class="g-sub">${t('moves')}: <b class="mv">0</b></p>`;
  const grid = $('.memory', api.area);
  let first = null, lock = false, moves = 0, found = 0;
  cards.forEach((c) => {
    const b = h(`<button class="m-card" aria-label="?"><span class="m-back">?</span><span class="m-front">${c.html}</span></button>`);
    b.onclick = () => {
      if (lock || b.classList.contains('open') || api.over) return;
      b.classList.add('open');
      sfx.tap();
      if (c.de) say(c.w);
      if (!first) { first = { b, c }; return; }
      moves++;
      $('.mv', api.area).textContent = moves;
      if (first.c.k === c.k) {
        [first.b, b].forEach((x) => x.classList.add('ok'));
        first = null;
        found++;
        sfx.correct();
        api.setScore(found * 10);
        if (found === ws.length) {
          const score = Math.max(10, 100 - (moves - ws.length) * 6);
          api.timeout(() => api.end(score, moves <= ws.length + 2 ? 3 : moves <= ws.length * 2 ? 2 : 1), 600);
        }
      } else {
        lock = true;
        const a = first.b;
        first = null;
        api.timeout(() => { a.classList.remove('open'); b.classList.remove('open'); lock = false; }, 850);
      }
    };
    grid.append(b);
  });
}

// ---------- 2. Brezel-Rätsel (Buchstaben raten)

function pretzel(api, P, level, lang) {
  const rounds = 5;
  const maxLives = { easy: 8, medium: 6, hard: 5 }[level];
  const list = sample(P.words, Math.min(rounds, P.words.length));
  let r = 0, score = 0;
  const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');

  function round() {
    if (r >= list.length) return api.end(score, starsFor(score / (list.length * (10 + maxLives * 2))));
    const w = list[r];
    const target = bare(w);
    const up = target.toUpperCase();
    const guessed = new Set();
    if (level === 'easy') guessed.add(up[0]);
    let lives = maxLives;
    api.setLives(lives, maxLives, '🥨');
    api.area.innerHTML = `
      <p class="g-help">${t('guessLetters')} · ${t('round')} ${r + 1}/${list.length}</p>
      <div class="hint-box">
        ${level === 'easy' && hasPic(w) ? `<div class="pic small">${esc(w.e)}</div>` : ''}
        ${level !== 'hard' ? `<div class="native-big">${esc(w[lang])}</div>` : ''}
        <button class="speaker" data-say aria-label="🔊">🔊</button>
      </div>
      <div class="word-slots">${article(w) ? `<span class="art">${article(w)}</span>` : ''}<span class="slots"></span></div>
      <div class="keyboard"></div>`;
    $('[data-say]', api.area).onclick = () => say(w);
    if (level === 'hard') say(w);
    const slots = $('.slots', api.area);
    const draw = () => {
      slots.innerHTML = [...target].map((ch) => {
        const U = ch.toUpperCase();
        if (!/[A-ZÄÖÜ]/i.test(ch)) return `<span class="slot gap">${esc(ch)}</span>`;
        return `<span class="slot${guessed.has(U) ? ' got' : ''}">${guessed.has(U) ? esc(ch) : ''}</span>`;
      }).join('');
    };
    draw();
    const kb = $('.keyboard', api.area);
    KEYS.forEach((k) => {
      const b = h(`<button class="key">${k}</button>`);
      b.onclick = () => {
        if (b.disabled || api.over) return;
        b.disabled = true;
        if (up.includes(k)) {
          guessed.add(k); b.classList.add('ok'); sfx.tap(); draw();
          const done = [...up].every((ch) => !/[A-ZÄÖÜ]/.test(ch) || guessed.has(ch));
          if (done) {
            score += 10 + lives * 2; api.setScore(score); sfx.correct(); say(w);
            slots.classList.add('win');
            kb.querySelectorAll('button').forEach((x) => (x.disabled = true));
            r++; api.timeout(round, 1200);
          }
        } else {
          b.classList.add('bad'); lives--; sfx.wrong(); api.setLives(lives, maxLives, '🥨');
          if (lives <= 0) {
            [...up].forEach((ch) => guessed.add(ch)); draw(); slots.classList.add('lose');
            kb.querySelectorAll('button').forEach((x) => (x.disabled = true));
            catPop('comfort', catLine('catWrong'));
            say(w);
            r++; api.timeout(round, 2200);
          }
        }
      };
      kb.append(b);
    });
  }
  round();
}

// ---------- 3. Blitz-Paare (Paare finden gegen die Zeit)

function sprint(api, P, level, lang) {
  const dur = { easy: 90, medium: 60, hard: 40 }[level] * 1000;
  const shown = Math.min({ easy: 4, medium: 5, hard: 6 }[level], P.words.length);
  api.area.innerHTML = `<p class="g-help">${t('g_sprint_d')}</p><div class="match"><div class="col left"></div><div class="col right"></div></div>`;
  const left = $('.left', api.area), right = $('.right', api.area);
  let deck = shuffle(P.words), score = 0, selL = null, selR = null;
  const active = new Set();
  const next = () => { if (!deck.length) deck = shuffle(P.words); return deck.pop(); };
  const fresh = () => { let it = next(); for (let i = 0; i < 30 && active.has(it.key); i++) it = next(); active.add(it.key); return it; };
  function tile(it, side) {
    const b = h(`<button class="tile">${esc(side === 'l' ? it.de : it[lang])}</button>`);
    b.dataset.key = it.key;
    b.onclick = () => {
      if (api.over || b.disabled) return;
      if (side === 'l') { selL?.classList.remove('sel'); selL = b; } else { selR?.classList.remove('sel'); selR = b; }
      b.classList.add('sel');
      if (!selL || !selR) return;
      const a = selL, c = selR; selL = selR = null;
      if (a.dataset.key === c.dataset.key) {
        score++; api.setScore(score); sfx.correct(); api.hit(true);
        active.delete(a.dataset.key);
        [a, c].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; });
        api.timeout(() => {
          const it = fresh();
          a.replaceWith(tile(it, 'l'));
          c.remove();
          const kids = right.children;
          right.insertBefore(tile(it, 'r'), kids[Math.floor(Math.random() * (kids.length + 1))] || null);
        }, 260);
      } else {
        sfx.wrong(); api.hit(false);
        [a, c].forEach((x) => { x.classList.remove('sel'); x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 400); });
      }
    };
    return b;
  }
  const first = Array.from({ length: shown }, fresh);
  first.forEach((it) => left.append(tile(it, 'l')));
  shuffle(first).forEach((it) => right.append(tile(it, 'r')));
  const start = Date.now();
  const target = { easy: 12, medium: 14, hard: 12 }[level];
  api.interval(() => {
    const leftMs = dur - (Date.now() - start);
    api.setTimer(leftMs / dur);
    if (leftMs <= 0) api.end(score, starsFor(score / target));
  }, 100);
}

// ---------- 4. Buchstabensalat

function anagram(api, P, level, lang) {
  const rounds = 6;
  let src = P.single;
  if (level === 'easy') src = src.filter((w) => bare(w).length <= 6);
  if (level === 'hard') src = src.filter((w) => bare(w).length >= 6);
  if (src.length < 3) src = P.single;
  const list = sample(src, Math.min(rounds, src.length));
  let r = 0, score = 0;
  function round() {
    if (r >= list.length) return api.end(score, starsFor(score / (list.length * 15)));
    const w = list[r];
    const word = bare(w);
    let letters = shuffle([...word]);
    for (let i = 0; i < 5 && letters.join('') === word; i++) letters = shuffle([...word]);
    let hintUsed = false;
    api.area.innerHTML = `
      <p class="g-help">${t('putLetters')} · ${t('round')} ${r + 1}/${list.length}</p>
      <div class="hint-box">
        ${level === 'easy' && hasPic(w) ? `<div class="pic small">${esc(w.e)}</div>` : ''}
        ${level !== 'hard' ? `<div class="native-big">${esc(w[lang])}</div>` : ''}
        <button class="speaker" data-say aria-label="🔊">🔊</button>
      </div>
      ${article(w) && level !== 'hard' ? `<p class="g-sub">${article(w)} …</p>` : ''}
      <div class="answer-line ana-line"></div>
      <div class="bank"></div>
      <div class="g-row">
        ${level !== 'easy' ? `<button class="btn outline hint">💡 ${t('hint')}</button>` : ''}
        <button class="btn outline skip">${t('skip')}</button>
      </div>`;
    $('[data-say]', api.area).onclick = () => say(w);
    if (level === 'hard') say(w);
    const line = $('.ana-line', api.area), bank = $('.bank', api.area);
    const chosen = [];
    let solved = false;
    const tiles = letters.map((ch, i) => {
      const b = h(`<button class="tile letter">${esc(ch)}</button>`);
      b._i = i;
      b.onclick = () => {
        if (api.over || solved) return;
        sfx.tap();
        const at = chosen.indexOf(b);
        if (at >= 0) { chosen.splice(at, 1); bank.append(b); [...bank.children].sort((a, c) => a._i - c._i).forEach((x) => bank.append(x)); }
        else { chosen.push(b); line.append(b); }
        if (chosen.length === word.length) check();
      };
      bank.append(b);
      return b;
    });
    function check() {
      if (chosen.map((b) => b.textContent).join('') === word) {
        solved = true;
        score += hintUsed ? 7 : 15; api.setScore(score); sfx.correct(); say(w);
        line.classList.add('win'); r++; api.timeout(round, 900);
      } else {
        sfx.wrong(); shake(line);
        api.timeout(() => { chosen.splice(0).forEach((b) => bank.append(b)); [...bank.children].sort((a, c) => a._i - c._i).forEach((x) => bank.append(x)); }, 450);
      }
    }
    $('.hint', api.area)?.addEventListener('click', () => {
      // Nächsten richtigen Buchstaben einsetzen
      if (solved) return;
      hintUsed = true;
      let k = 0;
      while (k < chosen.length && chosen[k].textContent === word[k]) k++;
      chosen.splice(0).forEach((b) => bank.append(b));
      [...bank.children].sort((a, c) => a._i - c._i).forEach((x) => bank.append(x));
      for (let i = 0; i <= Math.min(k, word.length - 1); i++) {
        const b = tiles.find((x) => x.textContent === word[i] && !chosen.includes(x));
        b?.click();
      }
    });
    $('.skip', api.area).onclick = () => {
      if (solved) return;
      solved = true;
      line.innerHTML = `<span class="reveal">${t('solutionWas')} <b>${esc(w.de)}</b></span>`;
      bank.innerHTML = '';
      say(w); r++; api.timeout(round, 1500);
    };
  }
  round();
}

// ---------- 5. Der-die-das-Regen

function rain(api, P, level, lang) {
  const total = 15;
  const fall = { easy: 9000, medium: 6500, hard: 4500 }[level];
  const every = { easy: fall + 400, medium: 3200, hard: 2000 }[level];
  const maxLives = 3;
  let lives = maxLives, score = 0, spawned = 0, lastSpawn = 0;
  const queue = shuffle(P.nouns.length >= total ? sample(P.nouns, total) : Array.from({ length: total }, () => pick(P.nouns)));
  const items = [];
  api.setLives(lives, maxLives);
  api.area.innerHTML = `
    <p class="g-help">${t('whichArticle')}</p>
    <div class="rain-sky"><div class="ground"></div></div>
    <div class="art-btns">
      <button class="art-btn der" data-a="der">der</button>
      <button class="art-btn die" data-a="die">die</button>
      <button class="art-btn das" data-a="das">das</button>
    </div>`;
  const sky = $('.rain-sky', api.area);
  function spawn() {
    const w = queue[spawned++];
    const el = h(`<div class="drop">${level !== 'hard' && hasPic(w) ? `<span class="d-pic">${esc(w.e)}</span>` : ''}<b>${esc(bare(w))}</b>${level === 'easy' ? `<small>${esc(w[lang])}</small>` : ''}</div>`);
    el.style.left = `${8 + Math.random() * 56}%`;
    sky.append(el);
    items.push({ w, el, t0: performance.now() });
  }
  function lose(it, msg) {
    lives--; api.setLives(lives, maxLives); api.hit(false); sfx.wrong();
    it.el.classList.add('miss');
    it.el.innerHTML = `<b>${esc(it.w.de)}</b>`;
    setTimeout(() => it.el.remove(), 900);
    if (lives <= 0) finish();
  }
  function finish() { api.end(score, starsFor(score / total)); }
  function answer(a) {
    if (api.over || !items.length) return;
    // Das tiefste Wort zuerst
    items.sort((x, y) => x.t0 - y.t0);
    const it = items.shift();
    if (article(it.w) === a) {
      score++; api.setScore(score); api.hit(true); sfx.correct();
      it.el.classList.add('caught', a);
      it.el.innerHTML = `<b>${esc(it.w.de)}</b>`;
      speak(it.w.de);
      setTimeout(() => it.el.remove(), 600);
    } else lose(it);
  }
  api.area.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => answer(b.dataset.a)));
  const onKey = (e) => { const a = { 1: 'der', 2: 'die', 3: 'das', ArrowLeft: 'der', ArrowDown: 'die', ArrowRight: 'das' }[e.key]; if (a) { e.preventDefault(); answer(a); } };
  document.addEventListener('keydown', onKey);
  api.later(() => document.removeEventListener('keydown', onKey));
  let raf;
  const tick = (now) => {
    if (api.over) return;
    if (spawned < total && (now - lastSpawn > every || !items.length)) { spawn(); lastSpawn = now; }
    const H = sky.clientHeight - 64;
    for (const it of [...items]) {
      const p = (now - it.t0) / fall;
      it.el.style.transform = `translateY(${p * H}px)`;
      if (p >= 1) { items.splice(items.indexOf(it), 1); lose(it); if (api.over) return; }
    }
    if (spawned >= total && !items.length) return finish();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  api.later(() => cancelAnimationFrame(raf));
}

// ---------- 6. Hör-Blitz

function listen(api, P, level, lang) {
  const rounds = 10;
  const secs = { easy: 10, medium: 7, hard: 4.5 }[level];
  const list = Array.from({ length: rounds }, () => pick(P.words));
  let r = 0, score = 0, timer = null;
  function round() {
    clearInterval(timer);
    if (r >= rounds) return api.end(score, starsFor(score / (rounds * 14)));
    const w = list[r];
    // Ablenker: schwer = aus derselben Einheit, sonst gemischt
    const unit = w.key.split(':')[0];
    let pool = P.words.filter((x) => x.key !== w.key);
    if (level === 'hard') { const same = pool.filter((x) => x.key.startsWith(unit)); if (same.length >= 3) pool = same; }
    const opts = shuffle([w, ...sample(pool, 3)]);
    const label = (x) => level === 'easy'
      ? `${hasPic(x) ? `<span class="o-pic">${esc(x.e)}</span>` : ''}<span>${esc(x[lang])}</span>`
      : `<span>${esc(x.de)}</span>`;
    api.area.innerHTML = `
      <p class="g-help">${t('whatHeard')} · ${t('round')} ${r + 1}/${rounds}</p>
      <div class="listen-box"><button class="speaker big" data-say aria-label="🔊">🔊</button></div>
      <div class="options ${level === 'easy' ? 'grid2' : ''}"></div>`;
    $('[data-say]', api.area).onclick = () => say(w);
    say(w);
    const box = $('.options', api.area);
    const t0 = Date.now();
    let done = false;
    const finish = (ok, btn) => {
      if (done) return;
      done = true;
      clearInterval(timer);
      box.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b._k === w.key) b.classList.add('right'); });
      if (ok) { score += 10 + Math.max(0, Math.round(secs - (Date.now() - t0) / 1000)); api.setScore(score); sfx.correct(); }
      else { btn?.classList.add('wrongpick'); sfx.wrong(); }
      api.hit(ok);
      r++; api.timeout(round, ok ? 700 : 1500);
    };
    opts.forEach((x) => {
      const b = h(`<button class="option">${label(x)}</button>`);
      b._k = x.key;
      b.onclick = () => finish(x.key === w.key, b);
      box.append(b);
    });
    timer = setInterval(() => {
      const left = secs * 1000 - (Date.now() - t0);
      api.setTimer(left / (secs * 1000));
      if (left <= 0) finish(false);
    }, 80);
    api.later(() => clearInterval(timer));
  }
  round();
}

// ---------- 7. Stimmt's? (richtig oder falsch)

function truefalse(api, P, level, lang) {
  const dur = { easy: 45, medium: 40, hard: 35 }[level] * 1000;
  const target = { easy: 14, medium: 16, hard: 16 }[level];
  let score = 0, cur = null;
  const ARTS = ['der', 'die', 'das'];
  function nextCard() {
    const src = level === 'easy' && P.pics.length >= 4 ? P.pics : P.words;
    const w = pick(src);
    let shown = w.de, ok = Math.random() < 0.5;
    if (!ok) {
      if (level === 'hard' && article(w) && Math.random() < 0.6) shown = `${pick(ARTS.filter((a) => a !== article(w)))} ${bare(w)}`;
      else shown = pick(src.filter((x) => x.key !== w.key && !(w.alt || []).includes(x.de))).de;
    }
    cur = { w, ok };
    const promptHtml = level === 'medium' || !hasPic(w)
      ? `<div class="native-big">${esc(w[lang])}</div>`
      : `<div class="pic">${esc(w.e)}</div>`;
    $('.tf-card', api.area).innerHTML = `${promptHtml}<div class="tf-eq">=</div><div class="de-big">${esc(shown)}</div>`;
    pulseEl($('.tf-card', api.area));
  }
  api.area.innerHTML = `
    <p class="g-help">${t('isItRight')}</p>
    <div class="tf-card"></div>
    <div class="tf-btns">
      <button class="tf no" aria-label="${t('no')}">✗<small>${t('no')}</small></button>
      <button class="tf yes" aria-label="${t('yes')}">✓<small>${t('yes')}</small></button>
    </div>`;
  const answer = (yes) => {
    if (api.over || !cur) return;
    const right = yes === cur.ok;
    if (right) { score++; api.setScore(score); sfx.correct(); }
    else { sfx.wrong(); shake($('.tf-card', api.area)); }
    api.hit(right);
    if (!right && !cur.ok) speak(cur.w.de);
    nextCard();
  };
  $('.yes', api.area).onclick = () => answer(true);
  $('.no', api.area).onclick = () => answer(false);
  const onKey = (e) => { if (e.key === 'ArrowRight') answer(true); if (e.key === 'ArrowLeft') answer(false); };
  document.addEventListener('keydown', onKey);
  api.later(() => document.removeEventListener('keydown', onKey));
  nextCard();
  const start = Date.now();
  api.interval(() => {
    const left = dur - (Date.now() - start);
    api.setTimer(left / dur);
    if (left <= 0) api.end(score, starsFor(score / target));
  }, 100);
}

function pulseEl(el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

// ---------- 8. Satz-Rennen

function sentence(api, P, level, lang) {
  const rounds = 5;
  const dur = { easy: 150, medium: 120, hard: 90 }[level] * 1000;
  const extra = { easy: 0, medium: 2, hard: 3 }[level];
  const list = sample(P.sentences, Math.min(rounds, P.sentences.length));
  let r = 0, score = 0;
  const start = Date.now();
  api.interval(() => {
    const left = dur - (Date.now() - start);
    api.setTimer(left / dur);
    if (left <= 0) api.end(score, starsFor(score / (list.length * 20)));
  }, 100);
  function round() {
    if (r >= list.length) {
      const bonus = Math.round(Math.max(0, dur - (Date.now() - start)) / 1000 / 3);
      score += bonus; api.setScore(score);
      return api.end(score, starsFor(score / (list.length * 20)));
    }
    const s = list[r];
    const own = tokens(s.de);
    const lower = new Set(own.map((x) => x.toLowerCase()));
    const others = shuffle(P.sentences.filter((x) => x !== s).flatMap((x) => tokens(x.de))).filter((x) => !lower.has(x.toLowerCase()));
    const distract = [...new Set(others)].slice(0, extra);
    const tilesArr = shuffle([...own, ...distract]);
    api.area.innerHTML = `
      <p class="g-help">${t('buildFast')} · ${t('round')} ${r + 1}/${list.length}</p>
      <div class="hint-box">
        ${level !== 'hard' ? `<div class="native-big">${esc(s[lang])}</div>` : ''}
        <button class="speaker" data-say aria-label="🔊">🔊</button>
      </div>
      <div class="answer-line"></div>
      <div class="bank"></div>`;
    $('[data-say]', api.area).onclick = () => speak(s.de);
    if (level === 'hard') speak(s.de);
    const line = $('.answer-line', api.area), bank = $('.bank', api.area);
    const chosen = [];
    let solved = false;
    tilesArr.forEach((w, i) => {
      const b = h(`<button class="tile">${esc(w)}</button>`);
      b._i = i;
      b.onclick = () => {
        if (api.over || solved) return;
        sfx.tap();
        const at = chosen.indexOf(b);
        if (at >= 0) { chosen.splice(at, 1); bank.append(b); [...bank.children].sort((a, c) => a._i - c._i).forEach((x) => bank.append(x)); }
        else { chosen.push(b); line.append(b); }
        if (chosen.length === own.length) {
          if (chosen.map((x) => x.textContent).join(' ').toLowerCase() === own.join(' ').toLowerCase()) {
            solved = true;
            score += 20; api.setScore(score); sfx.correct(); speak(s.de); line.classList.add('win'); r++; api.timeout(round, 900);
          } else {
            sfx.wrong(); shake(line);
            api.timeout(() => { chosen.splice(0).forEach((x) => bank.append(x)); [...bank.children].sort((a, c) => a._i - c._i).forEach((x) => bank.append(x)); }, 450);
          }
        }
      };
      bank.append(b);
    });
  }
  round();
}

// ---------- 9. Tipp-Turbo

function typing(api, P, level, lang) {
  const dur = { easy: 75, medium: 60, hard: 45 }[level] * 1000;
  const target = { easy: 8, medium: 9, hard: 8 }[level];
  let score = 0, w = null;
  api.area.innerHTML = `
    <p class="g-help">${t('typeFast')}</p>
    <div class="hint-box tt-prompt"></div>
    <form class="type-box tt-form">
      <input class="answer" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="${t('typeHere')}">
      <div class="umlauts">${['ä', 'ö', 'ü'].map((c) => `<button type="button" class="key" data-c="${c}">${c}</button>`).join('')}</div>
      <div class="g-row"><button class="btn primary" type="submit">OK</button><button class="btn outline skip" type="button">${t('skip')}</button></div>
      <p class="tt-msg" aria-live="polite"></p>
    </form>`;
  const input = $('.answer', api.area), msg = $('.tt-msg', api.area), form = $('.tt-form', api.area);
  function next() {
    w = pick(P.words);
    const pr = $('.tt-prompt', api.area);
    pr.innerHTML = `
      ${level === 'easy' && hasPic(w) ? `<div class="pic small">${esc(w.e)}</div>` : ''}
      ${level !== 'hard' ? `<div class="native-big">${esc(w[lang])}</div>` : ''}
      <button class="speaker" type="button" data-say aria-label="🔊">🔊</button>
      ${level === 'easy' ? `<div class="g-sub">${esc(w.de.slice(0, article(w) ? article(w).length + 2 : 1))}…</div>` : ''}`;
    $('[data-say]', pr).onclick = () => say(w);
    if (level === 'hard') say(w);
    input.value = '';
    input.focus({ preventScroll: true });
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    if (api.over || !input.value.trim()) return;
    const r = [w.de, ...(w.alt || [])].map((x) => checkTyped(input.value, x)).find((x) => x.ok) || { ok: false };
    if (r.ok) { score += 10; api.setScore(score); sfx.correct(); msg.textContent = `✓ ${w.de}`; msg.className = 'tt-msg good'; say(w); api.hit(true); next(); }
    else { sfx.wrong(); shake(input); msg.textContent = `${t('solutionWas')} ${w.de}`; msg.className = 'tt-msg bad'; api.hit(false); say(w); next(); }
  };
  $('.skip', api.area).onclick = () => { msg.textContent = `${t('solutionWas')} ${w.de}`; msg.className = 'tt-msg'; next(); };
  api.area.querySelectorAll('.key').forEach((k) => {
    k.onmousedown = (e) => e.preventDefault();
    k.onclick = () => {
      const s = input.selectionStart ?? input.value.length;
      input.value = input.value.slice(0, s) + k.dataset.c + input.value.slice(input.selectionEnd ?? s);
      input.setSelectionRange(s + 1, s + 1);
      input.focus();
    };
  });
  next();
  const start = Date.now();
  api.interval(() => {
    const left = dur - (Date.now() - start);
    api.setTimer(left / dur);
    if (left <= 0) api.end(score, starsFor(score / (target * 10)));
  }, 100);
}

const RUN = { memory, pretzel, sprint, anagram, rain, listen, truefalse, sentence, typing };

export function startGame(root, id, level, { pool, lang, onExit, onDone }) {
  const g = GAMES.find((x) => x.id === id);
  const go = () => {
    const api = shell(root, g, level, { onExit, onDone, onAgain: go });
    RUN[id](api, pool, level, lang);
  };
  go();
}
