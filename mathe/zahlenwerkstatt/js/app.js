// Bildschirme: Start (Name und Klasse), Übersicht (Stufe und Spiel), Spiel, Auswertung.
(function () {
  const ZW = window.ZW;
  const { h } = ZW;
  const app = document.getElementById('app');

  const state = {
    name: ZW.store.get('name', ''),
    k: ZW.store.get('klasse', null),
    s: ZW.store.get('stufe', 1),
  };
  let fortschritt = ZW.store.get('fortschritt', {});
  const schluessel = (k, s, id) => `${k}-${s}-${id}`;
  const sterne = (k, s, id) => fortschritt[schluessel(k, s, id)] || 0;
  const summeStufe = (k, s) => ZW.SPIELE.reduce((a, sp) => a + sterne(k, s, sp.id), 0);
  const summeKlasse = (k) => [1, 2, 3].reduce((a, s) => a + summeStufe(k, s), 0);
  const total = () => Object.values(fortschritt).reduce((a, b) => a + b, 0);
  const maxStufe = () => ZW.SPIELE.length * 3;

  let aufraeumen = [];
  const verlassen = () => { aufraeumen.forEach((f) => f()); aufraeumen = []; ZW.keyHandler = null; };

  const updateTop = () => {
    document.getElementById('sterne-total').innerHTML = `<span class="star" aria-hidden="true">★</span> ${total()} <span class="sr">Sterne</span>`;
  };
  const tonKnopf = document.getElementById('ton');
  const updateTon = () => { tonKnopf.textContent = ZW.sound.on ? 'Ton: an' : 'Ton: aus'; tonKnopf.setAttribute('aria-pressed', ZW.sound.on ? 'true' : 'false'); };
  tonKnopf.addEventListener('click', () => { ZW.sound.on = !ZW.sound.on; ZW.store.set('ton', ZW.sound.on); updateTon(); ZW.sound.play('tap'); });
  document.getElementById('home').addEventListener('click', () => (state.k ? zeigeUebersicht() : zeigeStart()));

  const zeige = (...kinder) => {
    verlassen();
    app.replaceChildren(...kinder);
    app.style.setProperty('--kc', state.k ? ZW.KLASSEN[state.k].farbe : 'var(--tinte)');
    window.scrollTo(0, 0);
    updateTop();
  };

  // ------------------------------------------------------------ Start
  function zeigeStart() {
    const name = h('input', { id: 'name', type: 'text', maxlength: '20', autocomplete: 'off', placeholder: 'Dein Vorname', value: state.name });
    const karten = [3, 4, 5].map((k) => {
      const K = ZW.KLASSEN[k];
      return h('button', { type: 'button', class: 'klasse-card papier', style: `--kc:${K.farbe}`, onclick: () => {
        state.name = name.value.trim(); ZW.store.set('name', state.name);
        state.k = k; ZW.store.set('klasse', k);
        zeigeUebersicht();
      } },
      h('span', { class: 'nr' }, `${k}.`, h('small', {}, 'Klasse')),
      h('span', { class: 'raum' }, K.raum),
      h('ul', {}, K.themen.map((t) => h('li', {}, t))),
      h('span', { class: 'fort' }, `★ ${summeKlasse(k)} von ${maxStufe() * 3} Sternen`));
    });
    zeige(h('div', { class: 'wrap' },
      h('section', { class: 'hero' },
        h('p', { class: 'eyebrow' }, 'Mathematik · Lehrplan 21 · 3. bis 5. Klasse'),
        h('h1', { html: 'Mit Zahlen <em>spielen</em>, rechnen und knobeln.' }),
        h('p', { class: 'lead' }, 'Sieben Spiele zu Zahlen, Rechnen und Geld. Jedes Spiel gibt es in drei Stufen: Einstieg, Sicher und Königsdisziplin. Für jedes Spiel bekommst du bis zu 3 Sterne.')),
      h('div', { class: 'name-row' }, h('label', { for: 'name' }, 'Wie heisst du?'), name),
      h('section', { 'aria-label': 'Klasse wählen', style: 'display:grid;gap:12px' },
        h('h2', { style: 'font-size:1.3rem' }, 'Wähle deine Klasse.'),
        h('div', { class: 'klassen' }, karten))));
  }

  // ------------------------------------------------------------ Übersicht
  function zeigeUebersicht() {
    const k = state.k, s = state.s, K = ZW.KLASSEN[k];
    const klassenWahl = h('div', { class: 'seg', role: 'group', 'aria-label': 'Klasse' }, [3, 4, 5].map((kk) =>
      h('button', { type: 'button', 'aria-pressed': kk === k ? 'true' : 'false', onclick: () => { state.k = kk; ZW.store.set('klasse', kk); zeigeUebersicht(); } }, `${kk}. Klasse`)));
    const stufen = h('div', { class: 'stufen', role: 'group', 'aria-label': 'Stufe' }, [1, 2, 3].map((ss) => {
      const S = ZW.STUFEN[ss];
      return h('button', { type: 'button', class: 'stufe', 'aria-pressed': ss === s ? 'true' : 'false', onclick: () => { state.s = ss; ZW.store.set('stufe', ss); zeigeUebersicht(); } },
        h('b', {}, `${S.name}: ${S.titel}`), h('span', {}, S.text), h('span', { class: 'st' }, `★ ${summeStufe(k, ss)} von ${maxStufe()}`));
    }));
    const spiele = h('div', { class: 'spiele' }, ZW.SPIELE.map((sp) =>
      h('button', { type: 'button', class: 'spiel-card papier', onclick: () => starteSpiel(sp.id) },
        h('span', { class: 'bild', html: sp.bild }),
        h('h3', {}, sp.name),
        h('p', {}, sp.kurz),
        h('span', { class: 'unten' }, h('span', { class: 'thema' }, sp.thema),
          h('span', { class: 'sterne', 'aria-label': `${sterne(k, s, sp.id)} von 3 Sternen`, html: ZW.sterneHtml(sterne(k, s, sp.id)) })))));

    const abz = [1, 2, 3].map((ss) => ({
      kurz: String(ss), name: `${ZW.STUFEN[ss].titel} gemeistert`,
      hat: ZW.SPIELE.every((sp) => sterne(k, ss, sp.id) >= 2),
      wie: `In Stufe ${ss} jedes Spiel mit mindestens 2 Sternen`,
    }));
    abz.push({ kurz: '★', name: 'Werkstatt-Profi', hat: summeKlasse(k) === maxStufe() * 3, wie: 'Alle Spiele in allen Stufen mit 3 Sternen' });
    const abzeichen = h('div', { class: 'abzeichen' }, abz.map((a) =>
      h('span', { class: 'badge' + (a.hat ? ' hat' : ''), title: a.wie }, h('i', { 'aria-hidden': 'true' }, a.kurz), h('span', {}, a.name, h('span', { class: 'sr' }, a.hat ? ' (erreicht)' : ` (noch nicht erreicht: ${a.wie})`)))));

    const resetZone = h('div', { class: 'reset-row' });
    const resetKnopf = () => resetZone.replaceChildren(h('button', { type: 'button', class: 'btn ghost', onclick: frage }, 'Alle Sterne löschen'));
    const frage = () => resetZone.replaceChildren(h('div', { class: 'confirm' },
      h('span', {}, 'Wirklich alle Sterne aller Klassen löschen?'),
      h('button', { type: 'button', class: 'btn warn', onclick: () => { fortschritt = {}; ZW.store.set('fortschritt', fortschritt); zeigeUebersicht(); } }, 'Ja, löschen'),
      h('button', { type: 'button', class: 'btn ghost', onclick: resetKnopf }, 'Abbrechen')));
    resetKnopf();

    const info = h('details', { class: 'info papier' },
      h('summary', {}, 'Für Lehrpersonen und Eltern'),
      h('div', { class: 'inhalt' },
        h('p', {}, "Die Zahlenwerkstatt passt zum Lehrplan 21, Mathematik, Zyklus 2. Die Zahlenräume: 3. Klasse bis 1'000, 4. Klasse bis 100'000, 5. Klasse bis 1'000'000 sowie erste Dezimalzahlen und Brüche."),
        h('p', {}, 'Stufe 1 festigt die Grundlagen. Stufe 2 entspricht dem Stoff der Klasse. Stufe 3 ist für Kinder, die mehr wollen. Alle Stufen sind immer offen, damit Lehrpersonen frei zuteilen können.'),
        h('div', { class: 'tabelle-wrap' }, h('table', {},
          h('thead', {}, h('tr', {}, h('th', {}, 'Spiel'), h('th', {}, 'Was geübt wird'), h('th', {}, 'Lehrplan 21'))),
          h('tbody', {}, ZW.SPIELE.map((sp) => h('tr', {}, h('td', {}, h('b', {}, sp.name)), h('td', {}, sp.was), h('td', {}, sp.lp)))))),
        h('p', { class: 'hinweis' }, 'MA.1.A.1 Zahlen lesen und schreiben · MA.1.A.2 Zählen, ordnen, überschlagen · MA.1.A.3 Rechnen · MA.1.B.1 Zahlbeziehungen erforschen · MA.3.A.1 Grössen, hier Geld.'),
        h('p', {}, 'Alle Aufgaben werden zufällig erzeugt. Das Programm rechnet jede Lösung aus denselben Zahlen aus, aus denen die Aufgabe entsteht. Geldbeträge sind immer auf 5 Rappen gerundet, wie an der Kasse.'),
        h('p', {}, 'Die Sterne werden nur in diesem Browser auf diesem Gerät gespeichert. Es werden keine Daten verschickt.'),
        resetZone));

    zeige(h('div', { class: 'wrap' },
      h('section', { class: 'hub-head' },
        h('div', { class: 'hub-title' },
          h('h1', {}, state.name ? `Hallo ${state.name}!` : `${K.name}`),
          h('span', { class: 'eyebrow' }, `${K.name} · ${K.raum}`),
          h('button', { type: 'button', class: 'btn-plain', onclick: zeigeStart }, 'Name ändern')),
        klassenWahl,
        h('h2', { style: 'font-size:1.2rem' }, 'Wähle eine Stufe.'),
        stufen),
      h('section', { style: 'display:grid;gap:12px' }, h('h2', { style: 'font-size:1.2rem' }, `Wähle ein Spiel. Du bist in ${ZW.STUFEN[s].name}: ${ZW.STUFEN[s].titel}.`), spiele),
      h('section', { style: 'display:grid;gap:12px' }, h('h2', { style: 'font-size:1.2rem' }, `Deine Abzeichen in der ${K.name}`), abzeichen),
      info));
  }

  // ------------------------------------------------------------ Spiel
  function starteSpiel(id) {
    const sp = ZW.SPIELE.find((x) => x.id === id);
    const k = state.k, s = state.s;
    const balken = h('i', { style: 'width:0%' });
    const buehne = h('div', { class: 'game' });
    zeige(h('div', { class: 'wrap' },
      h('div', { class: 'game' },
        h('div', { class: 'game-head' },
          h('button', { type: 'button', class: 'zurueck', onclick: zeigeUebersicht }, '← Übersicht'),
          h('h1', {}, sp.name),
          h('span', { class: 'meta' }, `${k}. Klasse · ${ZW.STUFEN[s].name}: ${ZW.STUFEN[s].titel}`)),
        h('div', { class: 'fortschritt', role: 'progressbar', 'aria-label': 'Fortschritt' }, balken),
        buehne)));
    const g = {
      k, s, buehne,
      fortschritt: (f) => { balken.style.width = Math.round(Math.min(1, f) * 100) + '%'; },
      beimVerlassen: (fn) => aufraeumen.push(fn),
      ende: (r) => zeigeEnde(sp, k, s, r, balken, buehne),
    };
    sp.start(g);
  }

  function zeigeEnde(sp, k, s, r, balken, buehne) {
    verlassen();
    balken.style.width = '100%';
    const vorher = sterne(k, s, sp.id);
    const rekord = r.sterne > vorher;
    if (rekord) { fortschritt[schluessel(k, s, sp.id)] = r.sterne; ZW.store.set('fortschritt', fortschritt); }
    updateTop();
    ZW.sound.play(r.sterne >= 2 ? 'win' : 'ok');
    const titel = ['Weiter üben! Versuch es nochmals.', 'Ein guter Anfang!', 'Gut gemacht!', 'Ausgezeichnet!'][r.sterne];
    const fehler = (r.fehler || []).slice(0, 8);
    buehne.replaceChildren(h('div', { class: 'buehne papier ende' },
      h('div', { class: 'gross-sterne', 'aria-label': `${r.sterne} von 3 Sternen`, html: ZW.sterneHtml(r.sterne) }),
      h('h2', { style: 'font-size:clamp(1.6rem,5vw,2.2rem)' }, titel),
      h('p', { style: 'font-size:1.1rem' }, r.text),
      rekord && vorher > 0 ? h('p', { class: 'chip' }, 'Neuer Rekord!') : null,
      fehler.length ? h('div', { class: 'liste-fehler' }, h('b', {}, 'Das kannst du noch üben:'), h('ul', {}, fehler.map((f) => h('li', {}, f)))) : null,
      h('div', { class: 'aktionen' },
        h('button', { type: 'button', class: 'btn', onclick: () => starteSpiel(sp.id) }, 'Nochmals spielen'),
        s < 3 ? h('button', { type: 'button', class: 'btn ghost', onclick: () => { state.s = s + 1; ZW.store.set('stufe', state.s); starteSpiel(sp.id); } }, `Weiter mit Stufe ${s + 1}`) : null,
        h('button', { type: 'button', class: 'btn ghost', onclick: zeigeUebersicht }, 'Zur Übersicht'))));
  }

  updateTon();
  if (state.k) zeigeUebersicht(); else zeigeStart();
})();
