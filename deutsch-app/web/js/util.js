// Kleine Helfer: Text vergleichen, Zufall, Zahlen als Wörter.

export const ARTICLES = ['der', 'die', 'das'];

export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[’`´]/g, "'")
    .replace(/[.,!?;:¡¿"«»()]/g, ' ')
    .replace(/[-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function foldUmlauts(s) {
  return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
}

// Umlaute ohne Ersatz (a statt ä), für sehr tolerante Vergleiche.
export function stripUmlauts(s) {
  return s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
}

export function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export function similarity(a, b) {
  const len = Math.max(a.length, b.length) || 1;
  return 1 - lev(a, b) / len;
}

function splitArticle(n) {
  const parts = n.split(' ');
  if (parts.length > 1 && ARTICLES.includes(parts[0])) return { art: parts[0], rest: parts.slice(1).join(' ') };
  return { art: null, rest: n };
}

// Prüft eine getippte Antwort.
// Ergebnis: { ok, note }  note: null | 'umlaut' | 'typo' | 'article' | 'wrongArticle'
export function checkTyped(input, expected) {
  const n = normalize(input);
  const e = normalize(expected);
  if (!n) return { ok: false, note: null };
  if (n === e) return { ok: true, note: null };
  if (foldUmlauts(n) === foldUmlauts(e)) return { ok: true, note: 'umlaut' };

  const ex = splitArticle(e);
  const inp = splitArticle(n);
  if (ex.art) {
    if (inp.art && inp.art !== ex.art && closeEnough(inp.rest, ex.rest)) return { ok: false, note: 'wrongArticle' };
    if (!inp.art && closeEnough(n, ex.rest)) return { ok: true, note: 'article' };
  }
  if (closeEnough(n, e)) return { ok: true, note: 'typo' };
  return { ok: false, note: null };
}

function closeEnough(a, b) {
  if (a === b || foldUmlauts(a) === foldUmlauts(b) || stripUmlauts(a) === stripUmlauts(b)) return true;
  const d = lev(foldUmlauts(a), foldUmlauts(b));
  if (b.length >= 10) return d <= 2;
  if (b.length >= 4) return d <= 1;
  return false;
}

// ---- Zahlen als deutsche Wörter (für die Spracherkennung, die oft „8“ statt „acht“ liefert)
const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
  'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const TENS = ['', '', 'zwanzig', 'dreissig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

export function numberToGerman(n) {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10), o = n % 10;
    if (!o) return TENS[t];
    return (o === 1 ? 'ein' : ONES[o]) + 'und' + TENS[t];
  }
  if (n === 100) return 'hundert';
  return String(n);
}

export function spokenToText(s) {
  return normalize(
    String(s || '')
      .replace(/(\d+)[:.]00/g, '$1')
      .replace(/\b\d{1,3}\b/g, (d) => numberToGerman(Number(d)))
  );
}

// Vergleicht, was die Spracherkennung gehört hat, mit dem Ziel.
// alternatives: Liste von erkannten Texten.
export function checkSpoken(alternatives, expected) {
  const e = foldUmlauts(normalize(expected));
  const eNoArt = foldUmlauts(splitArticle(normalize(expected)).rest);
  let best = { score: 0, heard: alternatives[0] || '' };
  for (const alt of alternatives) {
    const h = foldUmlauts(spokenToText(alt));
    const score = Math.max(similarity(h, e), similarity(h, eNoArt) - 0.05, wordOverlap(h, e));
    if (score > best.score) best = { score, heard: alt };
  }
  return { ok: best.score >= 0.72, score: best.score, heard: best.heard };
}

function wordOverlap(a, b) {
  const aw = a.split(' '), bw = b.split(' ');
  if (bw.length < 3) return 0;
  let hit = 0;
  for (const w of bw) if (aw.some((x) => x === w || (w.length > 4 && lev(x, w) <= 1))) hit++;
  return (hit / bw.length) * (aw.length <= bw.length + 2 ? 1 : 0.8);
}

// ---- Zufall
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function tokens(sentence) {
  return sentence.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// **fett** und Zeilenumbrüche für Tipps
export function richText(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}
