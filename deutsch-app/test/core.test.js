// Tests für Antwortprüfung und Lektionen. Starten: node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTyped, checkSpoken, tokens, numberToGerman } from '../web/js/util.js';
import { buildLesson, buildReview, LESSONS, allItems } from '../web/js/lessons.js';
import { COURSE, trialCourse } from '../functions/content/course.js';

test('getippte Antworten', () => {
  assert.equal(checkTyped('der Apfel', 'der Apfel').ok, true);
  assert.equal(checkTyped('  Der  apfel ', 'der Apfel').ok, true);
  assert.deepEqual(checkTyped('Apfel', 'der Apfel'), { ok: true, note: 'article' });
  assert.deepEqual(checkTyped('die Apfel', 'der Apfel'), { ok: false, note: 'wrongArticle' });
  assert.deepEqual(checkTyped('die Kaese', 'der Käse'), { ok: false, note: 'wrongArticle' });
  assert.deepEqual(checkTyped('der Kaese', 'der Käse'), { ok: true, note: 'umlaut' });
  assert.deepEqual(checkTyped('der Kase', 'der Käse'), { ok: true, note: 'typo' });
  assert.deepEqual(checkTyped('der Schlüsel', 'der Schlüssel'), { ok: true, note: 'typo' });
  assert.equal(checkTyped('der Tisch', 'der Fisch').ok, true); // 1 Buchstabe Unterschied gilt als Tippfehler
  assert.equal(checkTyped('die Hose', 'der Fisch').ok, false);
  assert.equal(checkTyped('', 'eins').ok, false);
  assert.equal(checkTyped('zwei', 'drei').ok, false); // kurze Wörter: kein Tippfehler-Bonus
  assert.equal(checkTyped('Wie heißt du?', 'Wie heisst du?').ok, true);
  assert.equal(checkTyped('T-Shirt', 'das T-Shirt').ok, true);
});

test('gesprochene Antworten', () => {
  assert.equal(checkSpoken(['Es ist 8 Uhr'], 'Es ist acht Uhr.').ok, true);
  assert.equal(checkSpoken(['es ist 8:00 Uhr'], 'Es ist acht Uhr.').ok, true);
  assert.equal(checkSpoken(['Apfel'], 'der Apfel').ok, true);
  assert.equal(checkSpoken(['ich heiße Anna'], 'Ich heisse Anna.').ok, true);
  assert.equal(checkSpoken(['Bananen'], 'der Apfel').ok, false);
  assert.equal(checkSpoken(['20'], 'zwanzig').ok, true);
  assert.equal(checkSpoken([], 'zwanzig').ok, false);
  assert.equal(numberToGerman(21), 'einundzwanzig');
});

function checkExercise(ex, lang) {
  switch (ex.type) {
    case 'choose':
    case 'listenChoose':
      assert.ok(ex.options.includes(ex.answer), `${ex.type}: Antwort fehlt`);
      assert.equal(new Set(ex.options).size, ex.options.length, `${ex.type}: doppelte Optionen ${ex.options}`);
      assert.ok(ex.options.length >= 2);
      break;
    case 'gap':
      assert.ok(ex.options.includes(ex.answer));
      assert.equal(tokens(ex.item.de)[ex.gapIndex], ex.answer);
      assert.equal(new Set(ex.options.map((o) => o.toLowerCase())).size, ex.options.length, `gap doppelt ${ex.options}`);
      break;
    case 'build':
    case 'listenBuild': {
      const pool = ex.tiles.slice();
      for (const w of tokens(ex.item.de)) {
        const i = pool.indexOf(w);
        assert.ok(i >= 0, `Kachel fehlt: ${w}`);
        pool.splice(i, 1);
      }
      // Ablenker dürfen nicht wie ein Wort der Lösung aussehen
      const own = tokens(ex.item.de).map((x) => x.toLowerCase());
      for (const d of pool) assert.ok(!own.includes(d.toLowerCase()), `Ablenker gleich Lösungswort: ${d}`);
      break;
    }
    case 'picType':
      assert.ok(ex.item.e && ex.item.p);
      break;
    case 'match':
      assert.ok(ex.items.length >= 3 && ex.items.length <= 6);
      assert.equal(new Set(ex.items.map((i) => i[lang])).size, ex.items.length, 'match: doppelte Übersetzung');
      break;
    default:
      assert.ok(ex.item);
  }
}

test('alle Lektionen aller Einheiten sind gültig', () => {
  for (const lang of ['en', 'fr']) {
    for (const speakOn of [true, false]) {
      for (let r = 0; r < 15; r++) {
        COURSE.units.forEach((u, ui) => {
          LESSONS.forEach((_, li) => {
            const list = buildLesson(COURSE, ui, li, { lang, speakOn });
            assert.ok(list.length >= 10, `${u.id}-${li} zu kurz`);
            if (!speakOn) assert.ok(!list.some((e) => e.type === 'speak'));
            list.forEach((e) => checkExercise(e, lang));
          });
        });
      }
    }
  }
});

test('Gratis-Lektion funktioniert mit dem Probe-Kurs', () => {
  const trial = trialCourse();
  const list = buildLesson(trial, 0, 0, { lang: 'fr', speakOn: true });
  assert.ok(list.length >= 10);
  list.forEach((e) => checkExercise(e, 'fr'));
  assert.equal(trial.units[1].words.length, 0);
  // Gratis-Lektion lehrt dieselben 6 Wörter wie Lektion 1 im vollen Kurs
  const keys = (l) => [...new Set(l.filter((e) => e.type === 'intro').map((e) => e.item.key))].sort();
  assert.deepEqual(keys(list), keys(buildLesson(COURSE, 0, 0, { lang: 'fr', speakOn: true })));
  assert.equal(keys(list).length, 6);
});

test('Wiederholung', () => {
  const items = [...allItems(COURSE).values()].slice(0, 10);
  const list = buildReview(COURSE, items, { lang: 'en', speakOn: true });
  list.forEach((e) => checkExercise(e, 'en'));
});

test('Inhalt: Übersetzungen eindeutig und Schweizer Schreibweise', () => {
  for (const u of COURSE.units) {
    for (const lang of ['en', 'fr']) {
      const t = u.words.map((w) => w[lang]);
      assert.equal(new Set(t).size, t.length, `${u.id} ${lang} doppelt`);
    }
    for (const x of [...u.words, ...u.sentences]) {
      assert.ok(!x.de.includes('ß'), `ß in ${x.de}`);
      assert.ok(x.en && x.fr, `Übersetzung fehlt: ${x.de}`);
    }
    assert.ok(u.tip.en && u.tip.fr);
  }
});

test('Freischalt-Codes', async () => {
  const { makeCode, encryptCourse, openCourse, normName } = await import('../web/js/unlock.js');
  const key = crypto.getRandomValues(new Uint8Array(16));
  const locked = await encryptCourse(COURSE, key);
  const code = await makeCode('Zoé Müller', key);
  assert.match(code, /^ZOE-MULLER-[A-Z2-7]{26}$/);
  const r = await openCourse(code, locked);
  assert.equal(r.name, 'ZOE-MULLER');
  assert.equal(r.course.units.length, 12);
  // klein geschrieben und mit Leerzeichen geht auch
  assert.ok(await openCourse(' ' + code.toLowerCase() + ' ', locked));
  // anderer Name mit demselben Teil: ungültig
  assert.equal(await openCourse(code.replace('ZOE-MULLER', 'ANNA'), locked), null);
  // ein Zeichen falsch: ungültig
  const bad = code.slice(0, -1) + (code.endsWith('A') ? 'B' : 'A');
  assert.equal(await openCourse(bad, locked), null);
  assert.equal(await openCourse('Quatsch', locked), null);
  // anderer Schlüssel: ungültig
  const other = await makeCode('Zoé Müller', crypto.getRandomValues(new Uint8Array(16)));
  assert.equal(await openCourse(other, locked), null);
  assert.equal(normName('  jean-luc  '), 'JEAN-LUC');
});
