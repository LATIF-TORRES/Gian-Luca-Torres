// Baut aus den Wörtern und Sätzen einer Einheit die Übungen einer Lektion.
// Jede Einheit hat 4 Lektionen: Wörter 1, Wörter 2, Sätze, Hören & Sprechen.

import { shuffle, sample, pick, tokens, ARTICLES } from './util.js';

export const LESSONS = [
  { kind: 'words', part: 0, title: 'lessonWords1', icon: '🆕' },
  { kind: 'words', part: 1, title: 'lessonWords2', icon: '📚' },
  { kind: 'sentences', title: 'lessonSentences', icon: '💬' },
  { kind: 'mix', title: 'lessonMix', icon: '🎤' },
];

export function unitItems(unit) {
  const words = unit.words.map((w, i) => ({ ...w, key: `${unit.id}:w${i}`, kind: 'w' }));
  const sentences = unit.sentences.map((s, i) => ({ ...s, key: `${unit.id}:s${i}`, kind: 's' }));
  return { words, sentences };
}

export function allItems(course) {
  const map = new Map();
  for (const u of course.units) {
    const { words, sentences } = unitItems(u);
    for (const it of [...words, ...sentences]) map.set(it.key, it);
  }
  return map;
}

// Lektion 1 = Wörter 1–6, Lektion 2 = Wörter 7–12.
// Feste Grenze, damit die Gratis-Lektion (nur 6 Wörter geladen) dieselben Wörter hat wie im vollen Kurs.
export const WORDS_PER_LESSON = 6;

function wordsPart(words, part) {
  const half = WORDS_PER_LESSON;
  return part === 0 ? words.slice(0, half) : words.slice(half);
}

// ---- einzelne Übungen

function optionsFor(item, pool, field, n = 4) {
  const seen = new Set([item[field]]);
  const others = [];
  for (const p of shuffle(pool)) {
    if (p.key === item.key || seen.has(p[field])) continue;
    seen.add(p[field]);
    others.push(p[field]);
    if (others.length >= n - 1) break;
  }
  return shuffle([item[field], ...others]);
}

const ex = {
  intro: (item) => ({ type: 'intro', item }),
  choose: (item, pool, lang) => ({ type: 'choose', item, options: optionsFor(item, pool, lang), answer: item[lang] }),
  listenChoose: (item, pool) => ({ type: 'listenChoose', item, options: optionsFor(item, pool, 'de'), answer: item.de }),
  type: (item) => ({ type: item.p && item.e ? 'picType' : 'translateType', item }),
  listenType: (item) => ({ type: 'listenType', item }),
  speak: (item) => ({ type: 'speak', item }),
  match: (items) => ({ type: 'match', items: items.slice(0, 6) }),
  build: (item, pool) => ({ type: 'build', item, tiles: buildTiles(item, pool) }),
  listenBuild: (item, pool) => ({ type: 'listenBuild', item, tiles: buildTiles(item, pool) }),
  gap: (item, pool) => gapExercise(item, pool),
};

function buildTiles(item, pool) {
  const own = tokens(item.de);
  const lower = new Set(own.map((x) => x.toLowerCase()));
  const extra = [];
  for (const p of shuffle(pool)) {
    if (p.key === item.key) continue;
    for (const tk of shuffle(tokens(p.de))) {
      if (!lower.has(tk.toLowerCase()) && !extra.some((e) => e.toLowerCase() === tk.toLowerCase())) {
        extra.push(tk);
        break;
      }
    }
    if (extra.length >= (own.length > 4 ? 3 : 2)) break;
  }
  return shuffle([...own, ...extra]);
}

function gapExercise(item, pool) {
  const tk = tokens(item.de);
  const candidates = tk.map((w, i) => ({ w, i })).filter(({ w }) => w.length >= 3 && !ARTICLES.includes(w.toLowerCase()));
  const { w, i } = pick(candidates.length ? candidates : tk.map((w, i) => ({ w, i })));
  const opts = [w];
  const seen = new Set([w.toLowerCase()]);
  for (const p of shuffle(pool)) {
    for (const x of shuffle(tokens(p.de))) {
      const lx = x.toLowerCase();
      if (x.length >= 3 && !seen.has(lx) && !ARTICLES.includes(lx)) {
        seen.add(lx);
        opts.push(x);
        break;
      }
    }
    if (opts.length >= 3) break;
  }
  return { type: 'gap', item, gapIndex: i, answer: w, options: shuffle(opts) };
}

// ---- Lektionen

export function buildLesson(course, unitIndex, lessonIndex, { lang, speakOn }) {
  const unit = course.units[unitIndex];
  const { words, sentences } = unitItems(unit);
  const { pool, sentPool } = pools(course);
  const L = LESSONS[lessonIndex];
  const speakOr = (item, fallback) => (speakOn ? ex.speak(item) : fallback);
  const list = [];

  if (L.kind === 'words') {
    const ws = wordsPart(words, L.part);
    for (let c = 0; c < ws.length; c += 3) {
      const chunk = ws.slice(c, c + 3);
      chunk.forEach((w) => list.push(ex.intro(w)));
      shuffle(chunk).forEach((w, k) => list.push(k % 2 ? ex.listenChoose(w, pool) : ex.choose(w, pool, lang)));
    }
    list.push(ex.match(shuffle(ws)));
    sample(ws, 4).forEach((w) => list.push(ex.type(w)));
    sample(ws, 2).forEach((w) => list.push(ex.listenType(w)));
    sample(ws, 2).forEach((w) => list.push(speakOr(w, ex.listenChoose(w, pool))));
  } else if (L.kind === 'sentences') {
    const ss = sentences;
    ss.forEach((s) => list.push(ex.build(s, sentPool)));
    sample(ss, 2).forEach((s) => list.push(ex.gap(s, sentPool)));
    sample(ss, 2).forEach((s) => list.push(ex.listenBuild(s, sentPool)));
    sample(ss, 3).forEach((s) => list.push(speakOr(s, ex.listenBuild(s, sentPool))));
    list.push(ex.choose(pick(ss), sentPool, lang));
  } else {
    const ws = sample(words, 6);
    const ss = sample(sentences, 3);
    ws.slice(0, 2).forEach((w) => list.push(ex.listenChoose(w, pool)));
    ws.slice(2, 4).forEach((w) => list.push(ex.listenType(w)));
    list.push(ex.match(shuffle(words).slice(0, 6)));
    ws.slice(4, 6).forEach((w) => list.push(ex.type(w)));
    ws.slice(0, 2).forEach((w) => list.push(speakOr(w, ex.listenType(w))));
    list.push(ex.listenBuild(ss[0], sentPool));
    list.push(ex.build(ss[1], sentPool));
    ss.slice(1, 3).forEach((s) => list.push(speakOr(s, ex.listenBuild(s, sentPool))));
  }
  return list;
}

// Wiederholung: Übungen zu einer Liste von Wörtern / Sätzen (z. B. Fehler).
export function buildReview(course, items, { lang, speakOn }) {
  const { pool, sentPool } = pools(course);
  const list = [];
  for (const it of items) {
    if (it.kind === 'w') {
      const kinds = ['choose', 'type', 'listenType', 'listenChoose'];
      if (speakOn) kinds.push('speak');
      const k = pick(kinds);
      list.push(k === 'choose' ? ex.choose(it, pool, lang) : k === 'listenChoose' ? ex.listenChoose(it, pool) : ex[k](it));
    } else {
      const kinds = ['build', 'listenBuild', 'gap'];
      if (speakOn) kinds.push('speak');
      const k = pick(kinds);
      list.push(k === 'speak' ? ex.speak(it) : ex[k](it, sentPool));
    }
  }
  const ws = items.filter((i) => i.kind === 'w');
  if (ws.length >= 4) list.splice(Math.floor(list.length / 2), 0, ex.match(shuffle(ws)));
  return list;
}

function pools(course) {
  const pool = [];
  const sentPool = [];
  for (const u of course.units) {
    const { words, sentences } = unitItems(u);
    pool.push(...words);
    sentPool.push(...sentences);
  }
  return { pool, sentPool: sentPool.length >= 4 ? sentPool : [...sentPool, ...pool] };
}
