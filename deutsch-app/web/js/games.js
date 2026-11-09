// Spiele-Bereich: zwölf verschiedene Spiele, jedes in drei Stufen (leicht, mittel, schwer).
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
  { id: 'blocks', icon: '🧱', need: 'nouns', min: 5, color: '#F59E0B' },
  { id: 'snake', icon: '🐍', need: 'single', min: 3, color: '#65A30D' },
  { id: 'mice', icon: '🐭', need: 'words', min: 4, color: '#8B5CF6' },
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
        <button class="icon-btn quit" aria-label="${t('quitYes')}">✕</button>
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
  // In Spielen erscheint Pasha ganz unten, unter den Tasten (siehe .in-game in styles.css)
  document.body.classList.add('in-game');
  const cleanups = [() => document.body.classList.remove('in-game')];
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
    // Für schnelle Spiele: Pasha freut sich bei 5 und 10 richtigen in Folge
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
        <button class="speaker" data-say aria-label="${t('tapToListen')}">🔊</button>
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
        <button class="speaker" data-say aria-label="${t('tapToListen')}">🔊</button>
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
      <div class="listen-box"><button class="speaker big" data-say aria-label="${t('tapToListen')}">🔊</button></div>
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
        <button class="speaker" data-say aria-label="${t('tapToListen')}">🔊</button>
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
      <button class="speaker" type="button" data-say aria-label="${t('tapToListen')}">🔊</button>
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

// ---------- 10. Artikel-Blöcke (Blöcke fallen und stapeln sich)
// Ein Wort-Block fällt. Man schiebt ihn in die Spalte mit dem richtigen Artikel.
// Richtig: Der Block verschwindet. Falsch: Er bleibt liegen und der Stapel wächst.
// Erreicht ein Stapel den Rand, ist das Spiel vorbei.

function blocks(api, P, level, lang) {
  const ARTS = ['der', 'die', 'das'];
  const fall = { easy: 8000, medium: 5500, hard: 3800 }[level];
  const maxH = { easy: 5, medium: 4, hard: 3 }[level];
  const total = 20;
  const queue = Array.from({ length: total }, () => pick(P.nouns));
  const stacks = { der: 0, die: 0, das: 0 };
  let n = 0, score = 0, cur = null;
  api.setLives(maxH, maxH, '🧱');
  api.area.innerHTML = `
    <p class="g-help">${t('blocksHelp')}</p>
    <div class="bl-board">
      ${ARTS.map((a) => `<div class="bl-col ${a}"><span class="bl-label">${a}</span><div class="bl-stack" data-stack="${a}"></div></div>`).join('')}
    </div>
    <div class="art-btns">${ARTS.map((a) => `<button class="art-btn ${a}" data-a="${a}">${a}</button>`).join('')}</div>`;
  const board = $('.bl-board', api.area);
  const label = (w) => `${level !== 'hard' && hasPic(w) ? `<span class="d-pic">${esc(w.e)}</span>` : ''}<b>${esc(bare(w))}</b>${level === 'easy' ? `<small>${esc(w[lang])}</small>` : ''}`;
  function spawn() {
    if (api.over) return;
    if (n >= total) return api.end(score, starsFor(score / total));
    const w = queue[n++];
    const el = h(`<div class="bl-block">${label(w)}</div>`);
    board.append(el);
    cur = { w, el, col: 1, t0: performance.now() };
    place();
  }
  function place() { if (cur) cur.el.style.left = `calc(${cur.col} * (100% / 3) + 6px)`; }
  function land() {
    if (!cur || api.over) return;
    const { w, el, col } = cur;
    cur = null;
    const a = ARTS[col];
    if (article(w) === a) {
      score++; api.setScore(score); api.hit(true); sfx.correct(); speak(w.de);
      el.classList.add('bl-ok'); setTimeout(() => el.remove(), 400);
    } else {
      api.hit(false); sfx.wrong(); el.remove();
      stacks[a]++;
      $(`[data-stack="${a}"]`, api.area).append(h(`<div class="bl-slab">${esc(w.de)}</div>`));
      const worst = Math.max(...Object.values(stacks));
      api.setLives(maxH - worst, maxH, '🧱');
      if (stacks[a] >= maxH) return api.end(score, starsFor(score / total));
    }
    api.timeout(spawn, 380);
  }
  const move = (d) => { if (cur) { cur.col = Math.max(0, Math.min(2, cur.col + d)); place(); sfx.tap(); } };
  const drop = (a) => { if (cur) { cur.col = ARTS.indexOf(a); place(); land(); } };
  api.area.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => drop(b.dataset.a)));
  const onKey = (e) => {
    const m = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (m) { e.preventDefault(); move(m); }
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); if (cur) land(); }
    const a = { 1: 'der', 2: 'die', 3: 'das' }[e.key];
    if (a) drop(a);
  };
  document.addEventListener('keydown', onKey);
  api.later(() => document.removeEventListener('keydown', onKey));
  let raf;
  const tick = (now) => {
    if (api.over) return;
    if (cur) {
      const slab = 34;
      const H = board.clientHeight - 40 - stacks[ARTS[cur.col]] * slab - cur.el.offsetHeight;
      const p = (now - cur.t0) / fall;
      cur.el.style.top = `${Math.min(1, p) * Math.max(0, H)}px`;
      if (p >= 1) land();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  api.later(() => cancelAnimationFrame(raf));
  spawn();
}

// ---------- 11. Wort-Schlange (Buchstaben in der richtigen Reihenfolge fressen)

function snake(api, P, level, lang) {
  const N = 9;
  const stepMs = { easy: 330, medium: 250, hard: 180 }[level];
  const decoyCount = { easy: 1, medium: 3, hard: 5 }[level];
  let src = P.single.filter((w) => /^[A-Za-zÄÖÜäöü]{3,7}$/.test(bare(w)));
  if (src.length < 3) src = P.single;
  const words = sample(src, Math.min(5, src.length));
  let wi = 0, score = 0, lives = 3, k = 0, word = '', w = null;
  let body = [], dir = { x: 1, y: 0 }, nextDir = dir, items = [];
  api.setLives(lives, 3);
  api.area.innerHTML = `
    <p class="g-help">${t('snakeHelp')}</p>
    <div class="hint-box sn-prompt"></div>
    <div class="sn-word" aria-live="polite"></div>
    <div class="sn-grid" style="--n:${N}"></div>
    <div class="sn-pad">
      <button class="key" data-d="0,-1" aria-label="↑">▲</button>
      <button class="key" data-d="-1,0" aria-label="←">◀</button>
      <button class="key" data-d="0,1" aria-label="↓">▼</button>
      <button class="key" data-d="1,0" aria-label="→">▶</button>
    </div>`;
  const grid = $('.sn-grid', api.area);
  const cells = Array.from({ length: N * N }, () => { const c = document.createElement('div'); c.className = 'sn-cell'; grid.append(c); return c; });
  const at = (x, y) => cells[y * N + x];
  const free = () => {
    const taken = new Set([...body, ...items].map((p) => `${p.x},${p.y}`));
    const head = body[0];
    const opts = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (taken.has(`${x},${y}`)) continue;
      if (head && Math.abs(head.x - x) + Math.abs(head.y - y) < 3) continue;
      opts.push({ x, y });
    }
    return pick(opts);
  };
  function newWord() {
    if (wi >= words.length) return api.end(score, starsFor(score / (words.length * 13)));
    w = words[wi++];
    word = bare(w).toUpperCase();
    k = 0;
    grid.dataset.word = word;
    body = [{ x: 1, y: 4 }];
    dir = nextDir = { x: 1, y: 0 };
    items = [];
    const letters = new Set(word);
    for (const ch of word) items.push({ ...free(), ch });
    const ABC = 'ABCDEFGHIJKLMNOPRSTUVWZ'.split('').filter((c) => !letters.has(c));
    for (let i = 0; i < decoyCount; i++) items.push({ ...free(), ch: pick(ABC), decoy: true });
    $('.sn-prompt', api.area).innerHTML = `
      ${level === 'easy' && hasPic(w) ? `<div class="pic small">${esc(w.e)}</div>` : ''}
      ${level !== 'hard' ? `<div class="native-big">${esc(w[lang])}</div>` : ''}
      <button class="speaker" data-say aria-label="${t('tapToListen')}">🔊</button>`;
    $('[data-say]', api.area).onclick = () => say(w);
    if (level === 'hard') say(w);
    draw();
  }
  function draw() {
    cells.forEach((c) => { c.className = 'sn-cell'; c.textContent = ''; });
    items.forEach((it) => { const c = at(it.x, it.y); c.className = 'sn-cell sn-letter'; c.textContent = it.ch; });
    body.forEach((p, i) => { at(p.x, p.y).className = `sn-cell ${i === 0 ? 'sn-head' : 'sn-body'}`; });
    grid.dataset.k = k;
    $('.sn-word', api.area).innerHTML = [...word].map((ch, i) => `<span class="${i < k ? 'got' : ''}">${i < k ? ch : '_'}</span>`).join('');
  }
  function loseLife() {
    lives--; api.setLives(lives, 3); api.hit(false); sfx.wrong(); shake(grid);
    if (lives <= 0) { api.end(score, starsFor(score / (words.length * 13))); return true; }
    return false;
  }
  function step() {
    if (api.over || !w) return;
    if (!(nextDir.x === -dir.x && nextDir.y === -dir.y)) dir = nextDir;
    const head = { x: (body[0].x + dir.x + N) % N, y: (body[0].y + dir.y + N) % N };
    if (body.some((p) => p.x === head.x && p.y === head.y)) { if (loseLife()) return; body = [body[0]]; draw(); return; }
    body.unshift(head);
    const hit = items.findIndex((it) => it.x === head.x && it.y === head.y);
    if (hit >= 0) {
      const it = items[hit];
      items.splice(hit, 1);
      if (!it.decoy && it.ch === word[k]) {
        k++; sfx.tap();
        if (k === word.length) {
          score += 10 + lives; api.setScore(score); api.hit(true); sfx.correct(); say(w);
          draw(); api.timeout(newWord, 700); w = null; return;
        }
      } else {
        body.pop();
        if (!it.decoy) items.push({ ...free(), ch: it.ch }); // richtiger Buchstabe, aber zu früh: kommt woanders wieder
        if (loseLife()) return;
      }
    } else body.pop();
    draw();
  }
  const turn = (x, y) => { nextDir = { x, y }; };
  api.area.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { const [x, y] = b.dataset.d.split(',').map(Number); turn(x, y); }));
  const onKey = (e) => {
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
    if (d) { e.preventDefault(); turn(...d); }
  };
  document.addEventListener('keydown', onKey);
  api.later(() => document.removeEventListener('keydown', onKey));
  // Wischen auf dem Spielfeld
  let sx = 0, sy = 0;
  grid.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  grid.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy));
  });
  newWord();
  api.interval(step, stepMs);
}

// ---------- 12. Mäusejagd (Mäuse schauen aus Löchern, man tippt die richtige an)

function mice(api, P, level, lang) {
  const dur = 45000;
  const up = { easy: 2400, medium: 1750, hard: 1250 }[level];
  const target = { easy: 10, medium: 12, hard: 12 }[level];
  let score = 0, w = null;
  api.area.innerHTML = `
    <p class="g-help">${t('miceHelp')}</p>
    <div class="hint-box mi-prompt"></div>
    <div class="mi-field">${Array.from({ length: 9 }, (_, i) => `<div class="mi-hole" data-i="${i}"></div>`).join('')}</div>`;
  const holes = [...api.area.querySelectorAll('.mi-hole')];
  function newTarget() {
    const prev = w;
    do { w = pick(P.words); } while (P.words.length > 1 && prev && w.key === prev.key);
    $('.mi-prompt', api.area).innerHTML = `
      ${level === 'easy' && hasPic(w) ? `<div class="pic small">${esc(w.e)}</div>` : ''}
      ${level !== 'hard' ? `<div class="native-big">${esc(w[lang])}</div>` : ''}
      <button class="speaker" data-say aria-label="${t('tapToListen')}">🔊</button>`;
    $('[data-say]', api.area).onclick = () => say(w);
    if (level === 'hard') say(w);
  }
  function popMouse() {
    if (api.over) return;
    const emptyHoles = holes.filter((x) => !x.firstChild);
    if (!emptyHoles.length) return;
    const hole = pick(emptyHoles);
    // Höchstens eine richtige Maus gleichzeitig, und auch dann nicht immer: man muss genau lesen
    const rightVisible = holes.some((x) => x.firstChild?._key === w.key);
    const right = !rightVisible && Math.random() < 0.45;
    const word = right ? w : pick(P.words.filter((x) => x.key !== w.key));
    const m = h(`<button class="mi-mouse"><span class="mi-face">🐭</span><b>${esc(word.de)}</b></button>`);
    m._key = word.key;
    m.onclick = () => {
      if (api.over || m.disabled) return;
      m.disabled = true;
      if (word.key === w.key) {
        score++; api.setScore(score); api.hit(true); sfx.correct(); speak(word.de);
        m.classList.add('mi-hit'); setTimeout(() => m.remove(), 300); newTarget();
      } else {
        score = Math.max(0, score - 1); api.setScore(score);
        api.hit(false); sfx.wrong(); m.classList.add('mi-miss'); setTimeout(() => m.remove(), 400);
      }
    };
    hole.append(m);
    setTimeout(() => { if (m.isConnected && !m.disabled) { m.classList.add('mi-down'); setTimeout(() => m.remove(), 250); } }, up);
  }
  newTarget();
  popMouse(); popMouse();
  api.interval(popMouse, Math.round(up * 0.4));
  const start = Date.now();
  api.interval(() => {
    const left = dur - (Date.now() - start);
    api.setTimer(left / dur);
    if (left <= 0) api.end(score, starsFor(score / target));
  }, 100);
}

const RUN = { memory, pretzel, sprint, anagram, rain, listen, truefalse, sentence, typing, blocks, snake, mice };

// beforeAgain: wird vor „Nochmal spielen“ aufgerufen. Gibt sie false zurück, startet kein neues Spiel
// (z. B. Gratis-Spiel schon verbraucht → Bezahlseite).
export function startGame(root, id, level, { pool, lang, onExit, onDone, beforeAgain }) {
  const g = GAMES.find((x) => x.id === id);
  const again = () => { if (beforeAgain && beforeAgain() === false) return; go(); };
  const go = () => {
    const api = shell(root, g, level, { onExit, onDone, onAgain: again });
    RUN[id](api, pool, level, lang);
  };
  go();
}
