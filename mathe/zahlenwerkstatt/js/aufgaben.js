// Aufgaben-Generatoren für die 3., 4. und 5. Klasse (Lehrplan 21, Zyklus 2).
// Jede Lösung wird aus denselben Zahlen berechnet, aus denen die Aufgabe entsteht.
(function () {
  const ZW = window.ZW;
  const { rnd, pick, fmt } = ZW;

  ZW.KLASSEN = {
    3: { name: '3. Klasse', raum: "Zahlenraum bis 1'000'000", farbe: 'var(--k3)',
      stufen: ["Zahlen bis 1'000", "Zahlen bis 100'000", "Zahlen bis 1'000'000"],
      themen: ["Zahlen bis 1'000'000 lesen und legen", 'Zahlenstrahl und Runden', 'Plus und minus, auch mit runden grossen Zahlen', 'Einmaleins und Geld'] },
    4: { name: '4. Klasse', raum: "Zahlenraum bis 1'000'000", farbe: 'var(--k4)',
      stufen: ["Zahlen bis 100'000", "Zahlen bis 1'000'000", "Zahlen bis 1'000'000, schwer"],
      themen: ["Zahlen bis 1'000'000", 'Runden auf Tausender und Zehntausender', 'Mal und geteilt mit grossen Zehnerzahlen', 'Geld und Rückgeld'] },
    5: { name: '5. Klasse', raum: "Zahlenraum bis 1'000'000'000", farbe: 'var(--k5)',
      stufen: ["Zahlen bis 1'000'000", "Zahlen bis 1 Milliarde", "Bis 1 Milliarde, Dezimalzahlen und Brüche"],
      themen: ['Millionen und Milliarden', 'Dezimalzahlen und Brüche', 'Teilbarkeit', 'Grosse Geldbeträge'] },
  };
  // Grösste Zahl, die in einer Klasse und Stufe vorkommen darf (für die Prüfung)
  ZW.GRENZE = { 3: [1000, 100000, 1000000], 4: [100000, 1000000, 1000000], 5: [1000000, 1000000000, 1000000000] };
  ZW.STUFEN = {
    1: { name: 'Stufe 1', titel: 'Einstieg', text: 'Sicher starten mit einfachen Zahlen.' },
    2: { name: 'Stufe 2', titel: 'Sicher', text: 'Grössere Zahlen und gemischte Aufgaben.' },
    3: { name: 'Stufe 3', titel: 'Königsdisziplin', text: 'Für alle, die es genau wissen wollen.' },
  };

  // ---------- Kopfrechnen ----------
  const T = (a, op, b, answer, extra) => Object.assign({ text: `${fmt(a)} ${op} ${fmt(b)}`, answer }, extra || {});
  const add = (a, b) => T(a, '+', b, a + b);
  const sub = (a, b) => T(a, '−', b, a - b);
  const mul = (a, b) => (Math.random() < 0.5 ? T(a, '×', b, a * b) : T(b, '×', a, a * b));
  const div = (teiler, quotient) => T(teiler * quotient, ':', teiler, quotient);
  const ergaenze = (a, ziel) => ({ text: `${fmt(a)} + ? = ${fmt(ziel)}`, answer: ziel - a });
  // Dezimalzahlen in Hundertsteln rechnen, damit keine Rundungsfehler entstehen
  const dez = (h) => fmt(h / 100);
  const decAdd = (ah, bh) => ({ text: `${dez(ah)} + ${dez(bh)}`, answer: (ah + bh) / 100, decimal: true });
  const decSub = (ah, bh) => ({ text: `${dez(ah)} − ${dez(bh)}`, answer: (ah - bh) / 100, decimal: true });

  const doppelt = (n) => ({ text: `Das Doppelte von ${fmt(n)}`, answer: 2 * n });
  const haelfte = (n) => ({ text: `Die Hälfte von ${fmt(n)}`, answer: n / 2 });
  const M = 1000000;

  const RECHNEN = {
    3: {
      // bis 1'000
      1: [
        () => { const a = rnd(10, 80) * 10; return add(a, rnd(5, 100 - a / 10) * 10); },
        () => { const a = rnd(20, 100) * 10; return sub(a, rnd(1, a / 10 - 1) * 10); },
        () => { const a = rnd(101, 700); return add(a, rnd(101, 999 - a)); },
        () => mul(rnd(2, 10), rnd(2, 10)),
        () => div(rnd(2, 10), rnd(2, 10)),
        () => ergaenze(rnd(11, 99) * 10, 1000),
      ],
      // bis 100'000, runde Zahlen
      2: [
        () => { const a = rnd(10, 80) * 1000; return add(a, rnd(1, 100 - a / 1000) * 1000); },
        () => { const a = rnd(20, 100) * 1000; return sub(a, rnd(1, a / 1000 - 1) * 1000); },
        () => ergaenze(rnd(1, 99) * 1000, 100000),
        () => mul(rnd(2, 10), rnd(2, 10)),
        () => div(rnd(2, 10), rnd(2, 10)),
        () => mul(rnd(2, 9), rnd(2, 9) * 10),
      ],
      // bis 1'000'000, runde Zahlen und Schritte bis 1 Million
      3: [
        () => { const a = rnd(10, 90) * 10000; return add(a, rnd(1, 100 - a / 10000) * 10000); },
        () => { const a = rnd(2, 100) * 10000; return sub(a, rnd(1, a / 10000 - 1) * 10000); },
        () => add(pick([999, 9999, 99999, 999999, 19999, 49999, 299999, 509999]), 1),
        () => { const x = rnd(1, 9) * 100000 + rnd(1, 9) * 10000; return ergaenze(x, Math.ceil(x / 100000) * 100000); },
        () => ergaenze(rnd(1, 99) * 10000, M),
        () => mul(rnd(2, 10), rnd(2, 10)),
        () => div(rnd(2, 9), rnd(2, 9) * 10),
      ],
    },
    4: {
      // bis 100'000
      1: [
        () => { const a = rnd(100, 800) * 10; return add(a, rnd(10, 999 - a / 10) * 10); },
        () => add(rnd(10, 60) * 1000 + rnd(1, 9) * 100, rnd(5, 30) * 1000 + rnd(1, 9) * 100),
        () => sub(100000, rnd(10, 190) * 500),
        () => mul(rnd(2, 9), rnd(2, 9) * 100),
        () => div(rnd(2, 9), rnd(2, 9) * 100),
        () => mul(rnd(12, 25), rnd(3, 9)),
      ],
      // bis 1'000'000
      2: [
        () => add(rnd(100, 600) * 1000 + rnd(1, 9) * 100, rnd(100, 390) * 1000 + rnd(1, 9) * 100),
        () => { const a = rnd(300, 999) * 1000 + rnd(1, 9) * 100; return sub(a, rnd(100, Math.floor(a / 1000) - 50) * 1000); },
        () => mul(rnd(2, 9), rnd(2, 9) * 10000),
        () => div(rnd(2, 9), rnd(2, 9) * 10000),
        () => mul(rnd(11, 15), rnd(11, 20)),
        () => haelfte(rnd(51, 499) * 2000),
      ],
      // bis 1'000'000, schwer
      3: [
        () => sub(M, rnd(2, 1998) * 500),
        () => div(rnd(2, 9) * 10, rnd(2, 9) * 1000),
        () => mul(pick([15, 25, 12]), rnd(12, 48)),
        () => ergaenze(rnd(101, 998) * 1000 + rnd(1, 9) * 100, M),
        () => add(rnd(1000, 5000) * 100, rnd(1000, 4000) * 100),
        () => doppelt(rnd(1001, 4999) * 100),
      ],
    },
    5: {
      // bis 1'000'000
      1: [
        () => add(rnd(10, 500) * 1000, rnd(10, 400) * 1000),
        () => { const k = pick([10, 100, 1000]); return mul(rnd(3, 999), k); },
        () => { const k = pick([10, 100]); return div(k, rnd(3, 999)); },
        () => mul(rnd(2, 9), rnd(2, 9) * pick([100, 1000, 10000])),
        () => sub(M, rnd(1, 99) * 10000 + pick([0, 5000])),
      ],
      // bis 1 Milliarde
      2: [
        () => add(rnd(10, 99) * 100000, rnd(10, 99) * 100000),
        () => add(rnd(100, 600) * M, rnd(100, 390) * M),
        () => sub(1000 * M, rnd(1, 99) * 10 * M),
        () => mul(rnd(2, 999), M),
        () => mul(rnd(2, 9), rnd(2, 9) * 10 * M),
        () => div(rnd(2, 9), rnd(2, 9) * M),
        () => mul(pick([11, 12, 15, 20, 25]), rnd(11, 40)),
      ],
      // bis 1 Milliarde, dazu Dezimalzahlen und Brüche
      3: [
        () => {
          const n = pick([2, 3, 4, 5, 10]), z = rnd(1, n - 1), basis = n * rnd(3, 60) * pick([1, 10]);
          return { text: `${z}/${n} von ${fmt(basis)}`, html: `${ZW.bruchHtml(z, n)} von ${fmt(basis)}`, answer: (basis / n) * z };
        },
        () => decAdd(rnd(101, 999), rnd(1, 99) * 10),
        () => { const a = rnd(20, 99); return decSub(a * 10, rnd(1, a - 1) * 10); },
        () => { const a = pick([25, 50, 75, 150, 250, 120]), b = rnd(2, 9); return { text: `${dez(a)} × ${b}`, answer: (a * b) / 100, decimal: true }; },
        () => sub(1000 * M, rnd(1, 3999) * 250000),
        () => mul(rnd(2, 9) * 10, rnd(2, 9) * M),
        () => div(rnd(2, 9), rnd(2, 9) * 10 * M + rnd(1, 9) * M),
        () => div(rnd(2, 9) * 10, rnd(12, 99) * 10),
      ],
    },
  };
  ZW.rechenAufgabe = (k, s) => {
    const t = pick(RECHNEN[k][s])();
    t.answer = ZW.clean(t.answer);
    t.decimal = t.decimal || !Number.isInteger(t.answer);
    return t;
  };

  // ---------- Zahlenstrahl ----------
  // Werte sind ganze Zahlen; angezeigt wird Wert / div.
  ZW.strahlConfig = (k, s) => {
    const voll = (max, labels) => ({ min: 0, max, gross: max / 10, klein: max / 20, schritt: max / 100, labels });
    const fenster = (breite, schritt) => { const m = rnd(0, 9) * breite; return { min: m, max: m + breite, gross: breite / 10, klein: breite / 20, schritt, labels: 'rand' }; };
    const c = {
      3: { 1: () => voll(1000, 'alle'), 2: () => voll(100000, 'alle'), 3: () => voll(M, 'alle') },
      4: { 1: () => voll(100000, 'rand'), 2: () => voll(M, 'rand'), 3: () => fenster(100000, 1000) },
      5: {
        1: () => fenster(100000, 1000),
        2: () => voll(1000 * M, 'rand'),
        3: () => (Math.random() < 0.5
          ? fenster(100 * M, M)
          : (() => { const m = rnd(0, 9) * 100; return { min: m, max: m + 100, gross: 10, klein: 5, schritt: 5, labels: 'rand', div: 100 }; })()),
      },
    }[k][s]();
    c.div = c.div || 1;
    return c;
  };
  ZW.strahlZiel = (c) => {
    const n = (c.max - c.min) / c.schritt;
    let v;
    // nicht genau auf einen beschrifteten Strich legen
    do { v = c.min + rnd(1, n - 1) * c.schritt; } while (c.labels === 'alle' && v % c.gross === 0);
    return v;
  };
  ZW.strahlText = (c, v) => {
    const x = v / c.div;
    if (c.div === 1) return fmt(x);
    return fmt(x, x * 10 === Math.round(x * 10) ? 1 : 2);
  };

  // ---------- Stellenwerte ----------
  ZW.STELLEN = [
    { k: 'E', name: 'Einer', w: 1 }, { k: 'Z', name: 'Zehner', w: 10 }, { k: 'H', name: 'Hunderter', w: 100 },
    { k: 'T', name: 'Tausender', w: 1000 }, { k: 'ZT', name: 'Zehntausender', w: 10000 }, { k: 'HT', name: 'Hunderttausender', w: 100000 },
    { k: 'M', name: 'Millionen', w: 1000000 }, { k: 'ZM', name: 'Zehnmillionen', w: 10000000 }, { k: 'HM', name: 'Hundertmillionen', w: 100000000 },
  ];
  // spalten: Anzahl Spalten der Tafel; stellen: wie viele Stellen die Zahl hat;
  // millionMoeglich: manchmal ist die Zahl genau 1'000'000 (Spalte M)
  ZW.stellenConfig = (k, s) => ({
    3: { 1: { spalten: 3, stellen: 3, art: 'zahl' }, 2: { spalten: 5, stellen: 5, art: 'wort' }, 3: { spalten: 7, stellen: 6, art: 'gemischt', millionMoeglich: true } },
    4: { 1: { spalten: 5, stellen: 5, art: 'zahl' }, 2: { spalten: 6, stellen: 6, art: 'wort' }, 3: { spalten: 6, stellen: 6, art: 'buendeln' } },
    5: { 1: { spalten: 7, stellen: 6, art: 'zahl', millionMoeglich: true }, 2: { spalten: 9, stellen: 9, art: 'wort' }, 3: { spalten: 9, stellen: 9, art: 'buendeln' } },
  }[k][s]);
  ZW.stellenAnzahl = (k, s) => ZW.stellenConfig(k, s).spalten;
  ZW.stellenAufgabe = (k, s) => {
    const c = ZW.stellenConfig(k, s);
    let art = c.art === 'gemischt' ? pick(['zahl', 'wort']) : c.art;
    if (c.millionMoeglich && Math.random() < 0.15) {
      return { zahl: M, text: art === 'wort' ? ZW.zahlwort(M) : fmt(M), art };
    }
    const n = c.stellen;
    // Ziffern von Einer bis höchste Stelle; manchmal Nullen
    const d = [];
    for (let i = 0; i < n; i++) d.push(i === n - 1 ? rnd(1, 9) : Math.random() < 0.2 ? 0 : rnd(1, 9));
    const zahl = d.reduce((sum, z, i) => sum + z * ZW.STELLEN[i].w, 0);
    if (art === 'zahl') return { zahl, text: fmt(zahl), art };
    if (art === 'wort') return { zahl, text: ZW.zahlwort(zahl), art };
    // nicht gebündelte Darstellung, z. B. 3 T + 14 H + 7 E
    const t = d.slice();
    let umgebaut = 0;
    for (let i = 0; i < n - 1 && umgebaut < 2; i++) {
      const j = ZW.rnd(0, n - 2);
      if (t[j + 1] >= 1 && t[j] < 10) { t[j + 1] -= 1; t[j] += 10; umgebaut++; }
    }
    if (umgebaut === 0) { t[0] += 10; t[1] -= 1; if (t[1] < 0) { return ZW.stellenAufgabe(k, s); } }
    const teile = [];
    for (let i = n - 1; i >= 0; i--) if (t[i]) teile.push(`${t[i]} ${ZW.STELLEN[i].k}`);
    return { zahl, text: teile.join(' + '), art: 'buendeln', teile: t };
  };

  // ---------- Zahlenmauer ----------
  // rows[r][i]: r = 0 ist die unterste Reihe
  ZW.mauerConfig = (k, s) => ({
    3: { 1: { reihen: 3, basis: () => rnd(20, 250), modus: 'oben' },
      2: { reihen: 3, basis: () => rnd(1, 25) * 1000, modus: 'gemischt' },
      3: { reihen: 4, basis: () => rnd(1, 12) * 10000, modus: 'unten' } },
    4: { 1: { reihen: 3, basis: () => rnd(10, 250) * 100, modus: 'gemischt' },
      2: { reihen: 4, basis: () => rnd(10, 120) * 1000, modus: 'gemischt' },
      3: { reihen: 4, basis: () => rnd(10000, 120000), modus: 'unten' } },
    5: { 1: { reihen: 4, basis: () => rnd(1000, 12000) * 10, modus: 'gemischt' },
      2: { reihen: 3, basis: () => rnd(1, 25) * 10 * M, modus: 'gemischt' },
      3: { reihen: 3, basis: () => rnd(10, 250) * M, modus: 'unten' } },
  }[k][s]);

  ZW.mauerLoesbar = (rows, versteckt) => {
    const bekannt = rows.map((r, ri) => r.map((_, i) => !versteckt.has(ri + ',' + i)));
    let neu = true;
    while (neu) {
      neu = false;
      for (let r = 1; r < rows.length; r++) {
        for (let i = 0; i < rows[r].length; i++) {
          const tri = [bekannt[r][i], bekannt[r - 1][i], bekannt[r - 1][i + 1]];
          if (tri.filter((x) => !x).length === 1) {
            bekannt[r][i] = bekannt[r - 1][i] = bekannt[r - 1][i + 1] = true;
            neu = true;
          }
        }
      }
    }
    return bekannt.every((r) => r.every(Boolean));
  };

  ZW.mauerAufgabe = (k, s) => {
    const c = ZW.mauerConfig(k, s);
    const basis = Array.from({ length: c.reihen }, c.basis);
    const rows = [basis];
    for (let r = 1; r < c.reihen; r++) {
      const unten = rows[r - 1];
      rows.push(unten.slice(0, -1).map((v, i) => v + unten[i + 1]));
    }
    const alle = [];
    rows.forEach((r, ri) => r.forEach((_, i) => alle.push([ri, i])));
    const anzahl = c.reihen === 3 ? 3 : c.modus === 'unten' ? 6 : 5;
    for (let versuch = 0; versuch < 500; versuch++) {
      let kandidaten;
      if (c.modus === 'oben') kandidaten = alle.filter(([r]) => r > 0);
      else kandidaten = alle;
      const wahl = ZW.shuffle(kandidaten).slice(0, anzahl);
      const unten = wahl.filter(([r]) => r === 0).length;
      if (c.modus === 'gemischt' && unten < 1) continue;
      if (c.modus === 'unten' && unten < Math.min(3, c.reihen - 1)) continue;
      const versteckt = new Set(wahl.map(([r, i]) => r + ',' + i));
      if (ZW.mauerLoesbar(rows, versteckt)) return { rows, versteckt };
    }
    // Rückfall: obere Steine verstecken (immer lösbar)
    const versteckt = new Set(alle.filter(([r]) => r > 0).slice(-anzahl).map(([r, i]) => r + ',' + i));
    return { rows, versteckt };
  };

  // ---------- Zahlenjagd ----------
  // Eine Regel: { text, test(v), dom: [min, max, schritt], div }
  const reihe = (r) => ({ text: `Tippe alle Zahlen aus der ${r}er-Reihe an (${r}, ${2 * r}, ${3 * r} …).`, test: (v) => v % r === 0, dom: [1, 10 * r, 1] });
  const gerade = (lo, hi) => ({ text: 'Tippe alle geraden Zahlen an. Gerade Zahlen enden auf 0, 2, 4, 6 oder 8.', test: (v) => v % 2 === 0, dom: [lo, hi, 1] });
  const groesser = (x, weite, schritt) => ({ text: `Tippe alle Zahlen an, die grösser als ${fmt(x)} sind.`, test: (v) => v > x, dom: [x - weite, x + weite, schritt] });
  const zwischen = (a, b, schritt) => ({ text: `Tippe alle Zahlen an, die zwischen ${fmt(a)} und ${fmt(b)} liegen.`, test: (v) => v > a && v < b, dom: [a - (b - a), b + (b - a), schritt] });
  const runden = (stelle, wert, schritt) => {
    const name = { 10: 'Zehner', 100: 'Hunderter', 1000: 'Tausender', 10000: 'Zehntausender', 100000: 'Hunderttausender', 1000000: 'Millionen' }[stelle];
    return { text: `Tippe alle Zahlen an, die auf ${name} gerundet ${fmt(wert)} ergeben.`, test: (v) => Math.round(v / stelle) * stelle === wert, dom: [wert - 2 * stelle, wert + 2 * stelle, schritt] };
  };
  const ziffer = (stelleIdx, z, lo, hi) => {
    const st = ZW.STELLEN[stelleIdx];
    return { text: `Tippe alle Zahlen an, die an der ${st.name}stelle eine ${z} haben.`, test: (v) => Math.floor(v / st.w) % 10 === z, dom: [lo, hi, 1] };
  };
  const teilbar = (t, lo, hi, regel) => ({ text: `Tippe alle Zahlen an, die durch ${t} teilbar sind.${regel ? ' ' + regel : ''}`, test: (v) => v % t === 0, dom: [lo, hi, 1] });
  const dezGroesser = (xh) => ({ text: `Tippe alle Zahlen an, die grösser als ${fmt(xh / 100)} sind.`, test: (v) => v > xh, dom: [xh - 90, xh + 90, 1], div: 100 });

  const JAGD = {
    3: {
      1: [() => reihe(pick([3, 4, 6, 7, 8, 9])), () => runden(10, rnd(12, 98) * 10, 1), () => runden(100, rnd(2, 9) * 100, 5), () => ziffer(1, rnd(1, 9), 100, 999), () => { const a = rnd(20, 80) * 10; return zwischen(a, a + rnd(5, 10) * 10, 1); }],
      2: [() => groesser(rnd(2, 8) * 10000, 15000, 1000), () => ziffer(3, rnd(1, 9), 10000, 99999), () => { const a = rnd(2, 6) * 10000; return zwischen(a, a + rnd(1, 3) * 10000, 1000); }, () => runden(1000, rnd(2, 98) * 1000, 100)],
      3: [() => groesser(rnd(2, 8) * 100000, 150000, 10000), () => ziffer(5, rnd(1, 9), 100000, 999999), () => { const a = rnd(1, 7) * 100000; return zwischen(a, a + rnd(1, 2) * 100000, 10000); }, () => runden(100000, rnd(2, 8) * 100000, 10000)],
    },
    4: {
      1: [() => runden(100, rnd(11, 99) * 100, 10), () => runden(1000, rnd(11, 99) * 1000, 100), () => ziffer(3, rnd(1, 9), 10000, 99999), () => { const a = rnd(20, 90) * 1000; return zwischen(a, a + rnd(3, 9) * 1000, 100); }],
      2: [() => groesser(rnd(2, 8) * 100000, 150000, 1000), () => ziffer(4, rnd(1, 9), 100000, 999999), () => runden(10000, rnd(11, 99) * 10000, 1000)],
      3: [() => runden(1000, rnd(101, 998) * 1000, 100), () => teilbar(25, 100, 1000, 'Sie enden auf 00, 25, 50 oder 75.'), () => runden(100000, rnd(2, 8) * 100000, 5000)],
    },
    5: {
      1: [() => groesser(rnd(2, 8) * 100000, 150000, 1000), () => ziffer(4, rnd(1, 9), 100000, 999999), () => runden(1000, rnd(11, 99) * 1000, 100)],
      2: [() => teilbar(3, 100, 999, 'Tipp: Die Quersumme ist durch 3 teilbar.'), () => groesser(rnd(2, 8) * 100 * M, 150 * M, M), () => runden(M, rnd(2, 98) * M, 100000), () => ziffer(6, rnd(1, 9), 10 * M, 99 * M)],
      3: [() => teilbar(9, 100, 9999, 'Tipp: Die Quersumme ist durch 9 teilbar.'), () => teilbar(4, 100, 999, 'Tipp: Schau auf die letzten zwei Ziffern.'), () => runden(M, rnd(11, 98) * M, 50000), () => dezGroesser(rnd(2, 8) * 100 + pick([0, 50]))],
    },
  };
  ZW.jagdRunde = (k, s) => {
    for (let versuch = 0; versuch < 50; versuch++) {
      const regel = pick(JAGD[k][s])();
      const [lo, hi, st] = regel.dom;
      const grenze = ZW.GRENZE[k][s - 1] * (regel.div || 1);
      const ja = new Set(), nein = new Set();
      const ziel = rnd(4, 7);
      for (let i = 0; i < 3000 && (ja.size < ziel || nein.size < 16 - ziel); i++) {
        const v = lo + rnd(0, Math.floor((hi - lo) / st)) * st;
        if (v <= 0 || v > grenze) continue;
        if (regel.test(v)) { if (ja.size < ziel) ja.add(v); } else if (nein.size < 16 - ziel) nein.add(v);
      }
      if (ja.size === ziel && nein.size === 16 - ziel) {
        const zahlen = ZW.shuffle([...ja, ...nein]);
        return { text: regel.text, zahlen, div: regel.div || 1, richtig: new Set(ja) };
      }
    }
    throw new Error('Zahlenjagd: keine Runde gefunden');
  };

  // ---------- Laden (Geld) ----------
  // Beträge in Rappen. Kleinste Münze: 5 Rappen.
  ZW.GELD = [
    { w: 5, t: 'muenze', l: '5 Rp.', d: 17, messing: true }, { w: 10, t: 'muenze', l: '10 Rp.', d: 19 },
    { w: 20, t: 'muenze', l: '20 Rp.', d: 21 }, { w: 50, t: 'muenze', l: '½ Fr.', d: 18 },
    { w: 100, t: 'muenze', l: '1 Fr.', d: 23 }, { w: 200, t: 'muenze', l: '2 Fr.', d: 27 },
    { w: 500, t: 'muenze', l: '5 Fr.', d: 31 },
    { w: 1000, t: 'note', l: '10', c: '#f2c94c' }, { w: 2000, t: 'note', l: '20', c: '#e8746a' },
    { w: 5000, t: 'note', l: '50', c: '#6fcf8e' }, { w: 10000, t: 'note', l: '100', c: '#6fa8e8' },
    { w: 20000, t: 'note', l: '200', c: '#c99a6b' }, { w: 100000, t: 'note', l: '1000', c: '#b493e0' },
  ];
  ZW.geldFuer = (k) => ZW.GELD.filter((g) => g.w <= { 3: 5000, 4: 20000, 5: 100000 }[k]);

  const WAREN = {
    3: [['Gipfeli', '🥐', 120, 250, 'ein Gipfeli'], ['Apfel', '🍎', 60, 120, 'einen Apfel'], ['Brot', '🍞', 240, 480, 'ein Brot'], ['Banane', '🍌', 40, 90, 'eine Banane'],
      ['Bleistift', '✏️', 80, 250, 'einen Bleistift'], ['Glace', '🍦', 200, 450, 'eine Glace'], ['Apfelsaft', '🧃', 150, 320, 'einen Apfelsaft'], ['Comic', '📚', 500, 1400, 'ein Comic'],
      ['Ball', '⚽', 900, 1990, 'einen Ball'], ['Rüebli', '🥕', 50, 150, 'ein Rüebli'], ['Schoggi', '🍫', 120, 350, 'eine Schoggi'], ['Farbstifte', '🖍️', 450, 1250, 'eine Schachtel Farbstifte']],
    4: [['Rucksack', '🎒', 2990, 7900, 'einen Rucksack'], ['Fussball', '⚽', 2490, 4900, 'einen Fussball'], ['Kopfhörer', '🎧', 1990, 8900, 'einen Kopfhörer'], ['Skateboard', '🛹', 5900, 14900, 'ein Skateboard'],
      ['Brettspiel', '🎲', 2990, 5900, 'ein Brettspiel'], ['Pizza', '🍕', 1450, 2200, 'eine Pizza'], ['Turnschuhe', '👟', 4990, 12900, 'ein Paar Turnschuhe'], ['Buch', '📕', 1290, 2890, 'ein Buch']],
    5: [['Velo', '🚲', 29900, 89900, 'ein Velo'], ['Laptop', '💻', 49900, 129900, 'einen Laptop'], ['Ski', '⛷️', 24900, 59900, 'ein Paar Ski'], ['Zelt', '⛺', 8900, 34900, 'ein Zelt'],
      ['Schlitten', '🛷', 4900, 18900, 'einen Schlitten'], ['Uhr', '⌚', 7900, 25900, 'eine Uhr'], ['Gitarre', '🎸', 14900, 49900, 'eine Gitarre'], ['Trottinett', '🛴', 8900, 21900, 'ein Trottinett']],
  };
  const ware = (k) => {
    const [name, em, lo, hi, akk] = pick(WAREN[k]);
    let p = rnd(lo / 5, hi / 5) * 5;
    if (Math.random() < 0.3) p = Math.round(p / 100) * 100 - 10; // Preise wie 29.90
    if (p < lo) p = lo;
    return { name, em, akk, preis: p };
  };
  const zweiWaren = (k) => {
    const a = ware(k);
    let b = ware(k);
    while (b.name === a.name) b = ware(k);
    return [a, b];
  };
  ZW.minimalStueck = (betrag, geld) => {
    let rest = betrag, n = 0;
    for (const g of geld.slice().sort((x, y) => y.w - x.w)) { n += Math.floor(rest / g.w); rest %= g.w; }
    return n;
  };
  ZW.ladenRunde = (k, s, nr) => {
    const geld = ZW.geldFuer(k);
    const noten = [1000, 2000, 5000, 10000, 20000, 100000].filter((w) => geld.some((g) => g.w === w));
    let modus, waren;
    if (s === 1) { modus = 'genau'; waren = [ware(k)]; }
    else if (s === 2) { modus = nr % 2 ? 'rueckgeld' : 'genau'; waren = nr % 2 ? [ware(k)] : zweiWaren(k); }
    else { modus = nr % 2 ? 'rueckgeld' : 'wenig'; waren = zweiWaren(k); }
    const summe = waren.reduce((s2, w) => s2 + w.preis, 0);
    const r = { modus, waren, summe, geld, zeigeSumme: s < 3 };
    if (modus === 'rueckgeld') {
      const passend = noten.find((n) => n > summe);
      r.note = passend || noten[noten.length - 1];
      r.notenAnzahl = passend ? 1 : Math.floor(summe / r.note) + 1;
      r.bezahlt = r.note * r.notenAnzahl;
      r.answer = (r.bezahlt - summe) / 100;
    }
    if (modus === 'wenig') r.minimal = ZW.minimalStueck(summe, geld);
    return r;
  };

  // ---------- Memory ----------
  const paarMul = (a, b) => ({ a: `${fmt(a)} × ${fmt(b)}`, b: fmt(a * b) });
  const paarDiv = (t, q) => ({ a: `${fmt(t * q)} : ${fmt(t)}`, b: fmt(q) });
  const DEZ_BRUCH = [[50, 1, 2], [25, 1, 4], [75, 3, 4], [10, 1, 10], [20, 1, 5], [40, 2, 5], [60, 3, 5], [80, 4, 5], [30, 3, 10], [70, 7, 10], [90, 9, 10]];
  const wortPaar = (n) => ({ a: ZW.zahlwort(n), b: fmt(n) });
  const MEMORY = {
    3: {
      1: () => paarMul(rnd(3, 9), rnd(3, 10)),
      2: () => (Math.random() < 0.5 ? paarDiv(rnd(3, 9), rnd(3, 9)) : paarMul(rnd(2, 9), rnd(2, 9) * 10)),
      3: () => {
        if (Math.random() < 0.5) return wortPaar(rnd(1, 99) * 10000);
        const a = rnd(1, 8) * 100000, b = rnd(1, 10 - a / 100000) * 100000;
        return { a: `${fmt(a)} + ${fmt(b)}`, b: fmt(a + b) };
      },
    },
    4: {
      1: () => (Math.random() < 0.5 ? paarMul(rnd(2, 9), rnd(2, 9) * 100) : paarDiv(rnd(2, 9), rnd(2, 9) * 100)),
      2: () => paarMul(rnd(11, 15), rnd(11, 25)),
      3: () => (Math.random() < 0.5 ? paarMul(rnd(2, 9), rnd(2, 9) * 10000) : paarDiv(rnd(2, 9), rnd(2, 9) * 10000)),
    },
    5: {
      1: () => paarMul(rnd(3, 999), pick([10, 100, 1000])),
      2: () => (Math.random() < 0.5 ? wortPaar(rnd(2, 999) * M) : paarMul(rnd(2, 999), M)),
      3: () => {
        if (Math.random() < 0.5) { const [d, z, n] = pick(DEZ_BRUCH); return { a: fmt(d / 100), b: `${z}/${n}`, bHtml: ZW.bruchHtml(z, n) }; }
        const n = pick([2, 4, 5, 10]), z = rnd(1, n - 1), basis = n * rnd(2, 30) * 10;
        return { a: `${z}/${n} von ${fmt(basis)}`, aHtml: `${ZW.bruchHtml(z, n)} von ${fmt(basis)}`, b: fmt((basis / n) * z) };
      },
    },
  };
  ZW.memoryPaare = (k, s) => {
    const anzahl = s === 3 ? 8 : 6;
    const paare = [], seen = new Set();
    for (let i = 0; i < 2000 && paare.length < anzahl; i++) {
      const p = MEMORY[k][s]();
      if (seen.has(p.a) || seen.has(p.b) || p.a === p.b) continue;
      seen.add(p.a); seen.add(p.b);
      paare.push(p);
    }
    return paare;
  };
})();
