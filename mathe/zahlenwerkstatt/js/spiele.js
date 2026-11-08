// Die sieben Spiele. Jedes Spiel bekommt ein Objekt g mit:
// g.k (Klasse), g.s (Stufe), g.buehne (Element), g.fortschritt(anteil), g.ende({sterne, titel, text, fehler}), g.beimVerlassen(fn)
(function () {
  const ZW = window.ZW;
  const { h, fmt } = ZW;

  const svg = (inner) => `<svg viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

  const feedback = () => h('div', { class: 'feedback', 'aria-live': 'polite' });
  const setFb = (el, text, gut) => { el.textContent = text; el.className = 'feedback ' + (gut ? 'good' : 'bad'); };

  // ------------------------------------------------------------------ Kopfrechnen-Rallye
  const rallye = {
    id: 'rallye', name: 'Kopfrechnen-Rallye', thema: 'Rechnen',
    kurz: 'Löse in 90 Sekunden so viele Rechnungen wie möglich.',
    lp: 'MA.1.A.3', was: 'Addieren, subtrahieren, multiplizieren, dividieren im Kopf; Ergänzen; ab Stufe 2 der 5. Klasse Dezimalzahlen und Bruchteile.',
    bild: svg('<rect x="6" y="10" width="44" height="44" rx="22"/><path d="M28 20v12l8 6"/><path d="M64 26h14M71 19v14M88 26h14M64 46h14M88 42l12 8M100 42l-12 8"/>'),
    start(g) {
      const DAUER = 90;
      const grenzen = { 1: [5, 10, 15], 2: [4, 8, 12], 3: [3, 6, 10] }[g.s];
      let rest = DAUER, richtig = 0, aufgabe = null, timer = null, gesperrt = false;
      const fehler = [];
      const timerEl = h('span', { class: 'timer' }, `${DAUER} s`);
      const text = h('span', { class: 'aufgabe-text' });
      const zaehler = h('span', { class: 'chip' }, 'Richtig: 0');
      const fb = feedback();
      const inp = new ZW.NumInput({ decimal: g.k === 5 && g.s >= 2, onOk: (v) => pruefen(v) });

      const neu = () => {
        aufgabe = ZW.rechenAufgabe(g.k, g.s);
        if (aufgabe.html) text.innerHTML = aufgabe.html + ' ='; else text.textContent = aufgabe.text.includes('?') ? aufgabe.text.replace('?', '') : aufgabe.text + ' =';
        if (aufgabe.text.includes('?')) {
          // Ergänzen: Eingabe steht an der Stelle des Fragezeichens
          const [vor, nach] = aufgabe.text.split('?');
          text.textContent = vor;
          zeile.replaceChildren(text, inp.display, h('span', { class: 'aufgabe-text' }, nach));
        } else if (aufgabe.text.startsWith('Das') || aufgabe.text.startsWith('Die')) {
          text.textContent = aufgabe.text + ':';
          zeile.replaceChildren(text, inp.display);
        } else {
          zeile.replaceChildren(text, inp.display);
        }
        inp.clear();
      };
      const pruefen = (v) => {
        if (gesperrt || rest <= 0) return;
        if (ZW.eq(v, aufgabe.answer)) {
          richtig++;
          zaehler.textContent = 'Richtig: ' + richtig;
          setFb(fb, 'Richtig!', true);
          ZW.sound.play('ok');
          neu();
        } else {
          gesperrt = true; inp.locked = true;
          inp.display.classList.add('falsch');
          setFb(fb, `Nicht ganz. ${aufgabe.text.replace('?', fmt(aufgabe.answer))}${aufgabe.text.includes('=') ? '' : ' = ' + fmt(aufgabe.answer)}`, false);
          fehler.push(`${aufgabe.text.replace('?', '…')}: richtig ist ${fmt(aufgabe.answer)}, du hast ${fmt(v)} geschrieben.`);
          ZW.sound.play('bad');
          setTimeout(() => { gesperrt = false; inp.locked = false; if (rest > 0) neu(); }, 1600);
        }
      };
      const zeile = h('div', { class: 'eingabe-zeile' });

      const intro = h('div', { class: 'buehne papier' },
        h('p', { class: 'auftrag' }, `Du hast ${DAUER} Sekunden Zeit. Rechne so viele Aufgaben wie möglich.`),
        h('p', { class: 'hinweis' }, 'Tippe die Zahlen auf dem Tastenfeld oder auf der Tastatur. Drücke dann OK.'),
        h('p', { class: 'hinweis' }, `Sterne: ${grenzen[0]} richtig = 1 Stern, ${grenzen[1]} richtig = 2 Sterne, ${grenzen[2]} richtig = 3 Sterne.`),
        h('div', { class: 'aktionen' }, h('button', { class: 'btn gross', type: 'button', onclick: los }, 'Los geht’s')));
      g.buehne.append(intro);

      function los() {
        intro.remove();
        g.buehne.append(h('div', { class: 'buehne papier' },
          h('div', { class: 'aktionen' }, timerEl, zaehler),
          h('div', { class: 'rallye' }, h('div', { style: 'display:grid;gap:14px;min-width:0' }, zeile, fb), inp.pad)));
        inp.activate();
        neu();
        timer = setInterval(() => {
          rest--;
          timerEl.textContent = rest + ' s';
          timerEl.classList.toggle('knapp', rest <= 10);
          g.fortschritt((DAUER - rest) / DAUER);
          if (rest <= 0) {
            clearInterval(timer);
            const sterne = richtig >= grenzen[2] ? 3 : richtig >= grenzen[1] ? 2 : richtig >= grenzen[0] ? 1 : 0;
            g.ende({ sterne, text: `Du hast ${richtig} Aufgaben richtig gelöst.`, fehler });
          }
        }, 1000);
      }
      g.beimVerlassen(() => clearInterval(timer));
    },
  };

  // ------------------------------------------------------------------ Zahlenstrahl
  const strahl = {
    id: 'strahl', name: 'Zahlenstrahl', thema: 'Zahlen ordnen',
    kurz: 'Finde die Stelle, wo eine Zahl auf dem Zahlenstrahl liegt.',
    lp: 'MA.1.A.2', was: 'Zahlen am Zahlenstrahl einordnen, Grösse von Zahlen abschätzen; in der 5. Klasse auch Dezimalzahlen.',
    bild: svg('<path d="M6 40h104M104 34l8 6-8 6"/><path d="M14 32v16M38 34v12M62 32v16M86 34v12"/><path d="M50 8v22M44 22l6 8 6-8" stroke-width="5"/>'),
    start(g) {
      const RUNDEN = 8;
      let runde = 0, punkte = 0;
      const fehler = [];
      const box = h('div', { class: 'buehne papier' });
      g.buehne.append(box);

      const naechste = () => {
        if (runde >= RUNDEN) {
          return g.ende({ sterne: ZW.sterneAus(punkte / (RUNDEN * 3)), text: `Du hast ${punkte} von ${RUNDEN * 3} Punkten.`, fehler });
        }
        g.fortschritt(runde / RUNDEN);
        const c = ZW.strahlConfig(g.k, g.s);
        const ziel = ZW.strahlZiel(c);
        let wahl = null, fertig = false;
        const pct = (v) => ((v - c.min) / (c.max - c.min)) * 100;

        const linie = h('div', { class: 'strahl' });
        const anzahlGross = (c.max - c.min) / c.gross;
        for (let v = c.min; v <= c.max; v += c.klein) {
          const istGross = (v - c.min) % c.gross === 0;
          linie.append(h('div', { class: 'tick' + (istGross ? '' : ' klein'), style: `left:${pct(v)}%` }));
          const i = (v - c.min) / c.gross;
          const zeigen = istGross && (c.labels === 'alle' || v === c.min || v === c.max || i === anzahlGross / 2);
          if (zeigen) {
            const lab = h('div', { class: 'tick-label', style: `left:${pct(v)}%` }, ZW.strahlText(c, v));
            const lang = ZW.strahlText(c, c.max).length > 5;
            const randOderMitte = v === c.min || v === c.max || i === anzahlGross / 2;
            if (c.labels === 'alle' && !randOderMitte && (lang || i % 2 === 1)) lab.classList.add('ungerade');
            if (v === c.min) lab.classList.add('links');
            if (v === c.max) lab.classList.add('rechts');
            linie.append(lab);
          }
        }
        const marker = h('div', { class: 'marker', hidden: true }, h('b', {}, 'Hier?'), h('i'));
        linie.append(marker);
        const wrap = h('div', { class: 'strahl-wrap', tabindex: '0', role: 'slider', 'aria-label': 'Zahlenstrahl. Mit den Pfeiltasten verschieben.', 'aria-valuemin': c.min, 'aria-valuemax': c.max }, linie);

        const setze = (v) => {
          if (fertig) return;
          wahl = Math.max(c.min, Math.min(c.max, v));
          marker.hidden = false;
          marker.style.left = pct(wahl) + '%';
          wrap.setAttribute('aria-valuenow', wahl);
          knopf.disabled = false;
        };
        const ausZeiger = (ev) => {
          const r = linie.getBoundingClientRect();
          const f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
          setze(c.min + Math.round((f * (c.max - c.min)) / c.schritt) * c.schritt);
        };
        let zieht = false;
        wrap.addEventListener('pointerdown', (ev) => { zieht = true; wrap.setPointerCapture(ev.pointerId); ausZeiger(ev); });
        wrap.addEventListener('pointermove', (ev) => { if (zieht) ausZeiger(ev); });
        wrap.addEventListener('pointerup', () => { zieht = false; });
        wrap.addEventListener('keydown', (ev) => {
          const d = ev.shiftKey ? c.klein : c.schritt;
          if (ev.key === 'ArrowRight') { ev.preventDefault(); setze((wahl ?? c.min) + d); }
          if (ev.key === 'ArrowLeft') { ev.preventDefault(); setze((wahl ?? c.min) - d); }
          if (ev.key === 'Enter' && wahl != null) { ev.preventDefault(); knopf.click(); }
        });

        const fb = feedback();
        const knopf = h('button', { class: 'btn', type: 'button', disabled: true, onclick: () => {
          if (fertig) { runde++; return naechste(); }
          fertig = true;
          const fehlerAnteil = Math.abs(wahl - ziel) / (c.max - c.min);
          const p = fehlerAnteil <= 0.015 ? 3 : fehlerAnteil <= 0.04 ? 2 : fehlerAnteil <= 0.08 ? 1 : 0;
          punkte += p;
          linie.append(h('div', { class: 'marker ziel', style: `left:${pct(ziel)}%` }, h('i'), h('b', {}, ZW.strahlText(c, ziel))));
          marker.querySelector('b').textContent = ZW.strahlText(c, wahl);
          const msg = ['Zu weit weg. Schau, wo der grüne Strich ist.', 'Nah dran! 1 Punkt.', 'Sehr nah! 2 Punkte.', 'Genau! 3 Punkte.'][p];
          setFb(fb, msg, p >= 2);
          ZW.sound.play(p >= 2 ? 'ok' : 'bad');
          if (p < 2) fehler.push(`${ZW.strahlText(c, ziel)}: du hast bei ${ZW.strahlText(c, wahl)} getippt.`);
          knopf.textContent = runde + 1 >= RUNDEN ? 'Auswertung' : 'Nächste Zahl';
          knopf.focus();
        } }, 'Prüfen');

        box.replaceChildren(
          h('p', { class: 'auftrag' }, 'Wo liegt diese Zahl? Tippe auf den Zahlenstrahl.', h('span', { class: 'gross' }, ZW.strahlText(c, ziel))),
          h('p', { class: 'hinweis' }, `Von einem langen Strich zum nächsten sind es ${ZW.strahlText(c, c.gross)}. Du kannst den blauen Strich verschieben, bevor du prüfst.`),
          wrap, fb, h('div', { class: 'aktionen' }, knopf, h('span', { class: 'chip' }, `Zahl ${runde + 1} von ${RUNDEN}`)));
        ZW.keyHandler = null;
      };
      naechste();
    },
  };

  // ------------------------------------------------------------------ Stellenwert-Werkstatt
  const stellen = {
    id: 'stellen', name: 'Stellenwert-Werkstatt', thema: 'Stellenwerte',
    kurz: 'Lege Zahlen mit Plättchen in die Stellenwerttafel.',
    lp: 'MA.1.A.1', was: 'Zahlen lesen und schreiben, Stellenwerte von E bis HM (Hundertmillionen), Zahlwörter, Bündeln und Entbündeln.',
    bild: svg('<rect x="6" y="8" width="108" height="48" rx="6"/><path d="M42 8v48M78 8v48M6 22h108"/><circle cx="24" cy="38" r="5"/><circle cx="60" cy="34" r="5"/><circle cx="60" cy="46" r="5"/><circle cx="96" cy="40" r="5"/>'),
    start(g) {
      const RUNDEN = 6;
      const n = ZW.stellenAnzahl(g.k, g.s);
      let runde = 0, punkte = 0;
      const fehler = [];
      const box = h('div', { class: 'buehne papier' });
      g.buehne.append(box);
      ZW.keyHandler = null;

      const naechste = () => {
        if (runde >= RUNDEN) return g.ende({ sterne: ZW.sterneAus(punkte / RUNDEN), text: `Du hast ${punkte} von ${RUNDEN} Zahlen richtig gelegt.`, fehler });
        g.fortschritt(runde / RUNDEN);
        const a = ZW.stellenAufgabe(g.k, g.s);
        const anz = Array(n).fill(0);
        let fertig = false;
        const tafel = h('div', { class: 'tafel' + (n >= 5 ? ' eng' : ''), style: `--cols:${n}` });
        const spalten = [];
        for (let i = n - 1; i >= 0; i--) {
          const st = ZW.STELLEN[i];
          const stapel = h('div', { class: 'stapel', 'aria-hidden': 'true' });
          const ziffer = h('div', { class: 'ziffer' }, '0');
          const aendern = (d) => {
            if (fertig) return;
            const neu = anz[i] + d;
            if (neu < 0 || neu > 9) { setFb(fb, neu > 9 ? 'Mehr als 9 geht nicht. Bündle 10 Plättchen zu 1 Plättchen der nächsten Stelle.' : '', false); return; }
            anz[i] = neu;
            fb.textContent = '';
            ziffer.textContent = neu;
            stapel.replaceChildren(...Array.from({ length: neu }, () => h('span', { class: 'plaettchen p-' + st.k })));
            ZW.sound.play('tap');
          };
          spalten.push(h('div', { class: 'spalte' },
            h('div', { class: 'kopf' }, st.k, h('small', {}, st.name)),
            stapel, ziffer,
            h('div', { class: 'pm' },
              h('button', { type: 'button', 'aria-label': `${st.name} weniger`, onclick: () => aendern(-1) }, '−'),
              h('button', { type: 'button', 'aria-label': `${st.name} mehr`, onclick: () => aendern(1) }, '+'))));
        }
        tafel.append(...spalten);
        const fb = feedback();
        const knopf = h('button', { class: 'btn', type: 'button', onclick: () => {
          if (fertig) { runde++; return naechste(); }
          fertig = true;
          const wert = anz.reduce((s, z, i) => s + z * ZW.STELLEN[i].w, 0);
          const teile = [];
          for (let i = n - 1; i >= 0; i--) teile.push(`${Math.floor(a.zahl / ZW.STELLEN[i].w) % 10} ${ZW.STELLEN[i].k}`);
          if (wert === a.zahl) { punkte++; setFb(fb, `Richtig! ${fmt(a.zahl)} = ${teile.join(', ')}`, true); ZW.sound.play('ok'); }
          else {
            setFb(fb, `Du hast ${fmt(wert)} gelegt. Richtig ist ${fmt(a.zahl)} = ${teile.join(', ')}.`, false);
            fehler.push(`${a.text}: richtig ist ${fmt(a.zahl)}, du hast ${fmt(wert)} gelegt.`);
            ZW.sound.play('bad');
          }
          knopf.textContent = runde + 1 >= RUNDEN ? 'Auswertung' : 'Nächste Zahl';
        } }, 'Prüfen');

        const auftrag = {
          zahl: ['Lege diese Zahl in die Stellenwerttafel.', ''],
          wort: ['Lies das Zahlwort. Lege die Zahl in die Stellenwerttafel.', ''],
          buendeln: ['Lege diese Zahl. Bündle zuerst: 10 Plättchen einer Stelle sind 1 Plättchen der nächsten Stelle.', 'Beispiel: 14 H sind 1 T und 4 H.'],
        }[a.art];
        box.replaceChildren(...[
          h('p', { class: 'auftrag' }, auftrag[0], h('span', { class: 'gross' }, a.text)),
          auftrag[1] ? h('p', { class: 'hinweis' }, auftrag[1]) : null,
          h('p', { class: 'hinweis' }, 'Drücke + und −. In jeder Spalte liegen höchstens 9 Plättchen.'),
          h('div', { class: 'tafel-wrap' }, tafel), fb, h('div', { class: 'aktionen' }, knopf, h('span', { class: 'chip' }, `Zahl ${runde + 1} von ${RUNDEN}`))].filter(Boolean));
      };
      naechste();
    },
  };

  // ------------------------------------------------------------------ Zahlenmauer
  const mauer = {
    id: 'mauer', name: 'Zahlenmauern', thema: 'Rechnen',
    kurz: 'Jeder Stein ist die Summe der zwei Steine darunter. Fülle die Lücken.',
    lp: 'MA.1.B.1', was: 'Zahlbeziehungen erforschen; Addition und Subtraktion als Umkehrung; in Stufe 3 von oben nach unten rechnen.',
    bild: svg('<rect x="40" y="6" width="40" height="16" rx="2"/><rect x="20" y="24" width="40" height="16" rx="2"/><rect x="60" y="24" width="40" height="16" rx="2"/><rect x="0" y="42" width="40" height="16" rx="2"/><rect x="40" y="42" width="40" height="16" rx="2"/><rect x="80" y="42" width="40" height="16" rx="2"/>'),
    start(g) {
      const RUNDEN = 4;
      let runde = 0, punkte = 0, max = 0;
      const fehler = [];
      const box = h('div', { class: 'buehne papier' });
      g.buehne.append(box);

      const naechste = () => {
        if (runde >= RUNDEN) return g.ende({ sterne: ZW.sterneAus(punkte / max), text: `Du hast ${punkte} von ${max} Steinen richtig ausgerechnet.`, fehler });
        g.fortschritt(runde / RUNDEN);
        const { rows, versteckt } = ZW.mauerAufgabe(g.k, g.s);
        const eingaben = {};
        let aktiv = null, fertig = false;
        const laenge = fmt(rows[rows.length - 1][0]).length;
        const sw = Math.max(58, laenge * 12 + 18);
        const n = rows[0].length;
        const steine = {};
        const reihenfolge = [];
        const m = h('div', { class: 'mauer', style: `--sw:${sw}px;--n:${n};--sf:${laenge > 6 ? '1.05rem' : '1.25rem'};--sfk:${(140 / (n * Math.max(laenge, 3))).toFixed(2)}cqw` });
        for (let r = rows.length - 1; r >= 0; r--) {
          const reihe = h('div', { class: 'reihe' });
          rows[r].forEach((v, i) => {
            const key = r + ',' + i;
            if (versteckt.has(key)) {
              const b = h('button', { type: 'button', class: 'stein leer', 'aria-label': `Leerer Stein, Reihe ${rows.length - r}, Platz ${i + 1}`, onclick: () => waehle(key) }, '?');
              steine[key] = b; reihenfolge.push(key);
              reihe.append(b);
            } else reihe.append(h('div', { class: 'stein' }, fmt(v)));
          });
          m.append(reihe);
        }
        const inp = new ZW.NumInput({
          maxLen: 10,
          onChange: (t) => { if (!aktiv) return; eingaben[aktiv] = t; steine[aktiv].textContent = t === '' ? '?' : fmt(ZW.parseNum(t)); },
          onOk: () => { const naechsterLeer = reihenfolge.find((k) => k !== aktiv && !eingaben[k]); if (naechsterLeer) waehle(naechsterLeer); else knopf.focus(); },
        });
        inp.activate();
        function waehle(key) {
          if (fertig) return;
          if (aktiv) steine[aktiv].classList.remove('aktiv');
          aktiv = key;
          steine[key].classList.add('aktiv');
          inp.set(eingaben[key] || '');
        }
        const fb = feedback();
        const knopf = h('button', { class: 'btn', type: 'button', onclick: () => {
          if (fertig) { runde++; return naechste(); }
          fertig = true; inp.locked = true;
          if (aktiv) steine[aktiv].classList.remove('aktiv');
          let ok = 0;
          for (const key of reihenfolge) {
            const [r, i] = key.split(',').map(Number);
            const soll = rows[r][i];
            const ist = ZW.parseNum(eingaben[key] || '');
            const b = steine[key];
            if (ist === soll) { ok++; b.classList.add('ok'); b.classList.remove('leer'); }
            else {
              b.classList.add('falsch'); b.classList.remove('leer');
              b.innerHTML = `<span>${isNaN(ist) ? '–' : fmt(ist)}<small>${fmt(soll)}</small></span>`;
              fehler.push(`Mauer ${runde + 1}: richtig ist ${fmt(soll)}${isNaN(ist) ? '' : ', du hast ' + fmt(ist) + ' geschrieben'}.`);
            }
          }
          punkte += ok; max += reihenfolge.length;
          setFb(fb, ok === reihenfolge.length ? 'Alle Steine stimmen!' : `${ok} von ${reihenfolge.length} Steinen stimmen. Die richtige Zahl steht klein und grün im Stein.`, ok === reihenfolge.length);
          ZW.sound.play(ok === reihenfolge.length ? 'ok' : 'bad');
          knopf.textContent = runde + 1 >= RUNDEN ? 'Auswertung' : 'Nächste Mauer';
        } }, 'Prüfen');

        box.replaceChildren(
          h('p', { class: 'auftrag' }, 'Rechne die fehlenden Steine aus.'),
          h('p', { class: 'hinweis' }, 'Jeder Stein ist die Summe der zwei Steine direkt darunter. Tippe auf einen Stein mit „?“ und gib die Zahl ein.'),
          h('div', { class: 'mauer-spiel' }, h('div', { style: 'display:grid;gap:14px;min-width:0' }, m, fb, h('div', { class: 'aktionen' }, knopf, h('span', { class: 'chip' }, `Mauer ${runde + 1} von ${RUNDEN}`))), inp.pad));
        waehle(reihenfolge[0]);
      };
      naechste();
    },
  };

  // ------------------------------------------------------------------ Zahlenjagd
  const jagd = {
    id: 'jagd', name: 'Zahlenjagd', thema: 'Zahleigenschaften',
    kurz: 'Finde alle Zahlen, die zur Regel passen: gerade, gerundet, teilbar …',
    lp: 'MA.1.A.2 / MA.1.B.1', was: 'Zahlen vergleichen und runden, Einmaleins-Reihen, Stellenwerte; in der 5. Klasse Teilbarkeitsregeln (3, 4, 9, 25) und Dezimalzahlen.',
    bild: svg('<circle cx="52" cy="28" r="20"/><path d="M66 42l18 18"/><path d="M44 28h16M52 20v16"/><path d="M92 10h22M92 22h22M92 34h14"/>'),
    start(g) {
      const RUNDEN = 5;
      let runde = 0, punkte = 0, max = 0;
      const fehler = [];
      const box = h('div', { class: 'buehne papier' });
      g.buehne.append(box);
      ZW.keyHandler = null;

      const naechste = () => {
        if (runde >= RUNDEN) return g.ende({ sterne: ZW.sterneAus(punkte / max), text: `Du hast ${punkte} von ${max} Punkten.`, fehler });
        g.fortschritt(runde / RUNDEN);
        const r = ZW.jagdRunde(g.k, g.s);
        const zeige = (v) => fmt(v / r.div);
        const gewaehlt = new Set();
        let fertig = false;
        const felder = r.zahlen.map((v) => {
          const b = h('button', { type: 'button', class: 'feld', 'aria-pressed': 'false', onclick: () => {
            if (fertig) return;
            if (gewaehlt.has(v)) gewaehlt.delete(v); else gewaehlt.add(v);
            b.setAttribute('aria-pressed', gewaehlt.has(v) ? 'true' : 'false');
            ZW.sound.play('tap');
          } }, zeige(v));
          b.dataset.v = v;
          return b;
        });
        const fb = feedback();
        const knopf = h('button', { class: 'btn', type: 'button', onclick: () => {
          if (fertig) { runde++; return naechste(); }
          fertig = true;
          let treffer = 0, falsch = 0;
          const vergessen = [];
          felder.forEach((b) => {
            const v = Number(b.dataset.v);
            b.disabled = true;
            if (gewaehlt.has(v) && r.richtig.has(v)) { treffer++; b.classList.add('treffer'); }
            else if (gewaehlt.has(v)) { falsch++; b.classList.add('fehler'); }
            else if (r.richtig.has(v)) { vergessen.push(zeige(v)); b.classList.add('vergessen'); }
          });
          const p = Math.max(0, treffer - falsch);
          punkte += p; max += r.richtig.size;
          const alles = treffer === r.richtig.size && falsch === 0;
          setFb(fb, alles ? `Super! Du hast alle ${treffer} Zahlen gefunden.`
            : `${treffer} von ${r.richtig.size} gefunden${falsch ? `, ${falsch} falsch angetippt (rot)` : ''}.${vergessen.length ? ' Gestrichelt: diese hast du vergessen.' : ''}`, alles);
          if (!alles) fehler.push(`${r.text} Richtig wären: ${[...r.richtig].sort((x, y) => x - y).map(zeige).join(', ')}.`);
          ZW.sound.play(alles ? 'ok' : 'bad');
          knopf.textContent = runde + 1 >= RUNDEN ? 'Auswertung' : 'Nächste Regel';
        } }, 'Fertig');
        box.replaceChildren(
          h('p', { class: 'auftrag' }, r.text),
          h('p', { class: 'hinweis' }, `Es passen ${r.richtig.size} Zahlen. Tippe nochmals, um eine Zahl abzuwählen. Drücke dann „Fertig“.`),
          h('div', { class: 'jagd' }, felder), fb,
          h('div', { class: 'aktionen' }, knopf, h('span', { class: 'chip' }, `Regel ${runde + 1} von ${RUNDEN}`)));
      };
      naechste();
    },
  };

  // ------------------------------------------------------------------ Dorfladen (Geld)
  const laden = {
    id: 'laden', name: 'Im Dorfladen', thema: 'Geld',
    kurz: 'Bezahle mit Franken und Rappen und rechne das Rückgeld aus.',
    lp: 'MA.3.A.1', was: 'Geldbeträge in Fr. und Rp. legen, zusammenzählen, Rückgeld berechnen; in Stufe 3 mit möglichst wenig Münzen und Noten bezahlen.',
    bild: svg('<circle cx="26" cy="36" r="18"/><circle cx="26" cy="36" r="10"/><rect x="56" y="14" width="58" height="34" rx="4"/><circle cx="85" cy="31" r="8"/>'),
    start(g) {
      const RUNDEN = 6;
      let runde = 0, punkte = 0, max = 0;
      const fehler = [];
      const box = h('div', { class: 'buehne papier' });
      g.buehne.append(box);
      ZW.keyHandler = null;

      const geldKnopf = (geld, onclick) => geld.t === 'muenze'
        ? h('button', { type: 'button', class: 'muenze' + (geld.messing ? ' messing' : ''), style: `--d:${Math.round(geld.d * 2.5)}px`, 'aria-label': geld.l.replace('½ Fr.', '50 Rappen'), onclick }, geld.l)
        : h('button', { type: 'button', class: 'note', style: `--nc:${geld.c}`, 'aria-label': `${geld.l}-Franken-Note`, onclick }, geld.l);

      const naechste = () => {
        if (runde >= RUNDEN) return g.ende({ sterne: ZW.sterneAus(punkte / max), text: `Du hast ${punkte} von ${max} Punkten.`, fehler });
        g.fortschritt(runde / RUNDEN);
        ZW.keyHandler = null;
        const r = ZW.ladenRunde(g.k, g.s, runde);
        let fertig = false;
        const fb = feedback();
        const regal = h('div', { class: 'regal' }, r.waren.map((w) =>
          h('div', { class: 'ware' }, h('span', { class: 'em', 'aria-hidden': 'true' }, w.em), h('div', {}, h('b', {}, w.name), h('span', { class: 'preis' }, ZW.fr(w.preis))))));
        const namen = r.waren.map((w) => w.akk).join(' und ');
        let inhalt;

        if (r.modus === 'rueckgeld') {
          const notenText = r.notenAnzahl === 1 ? `einer ${fmt(r.note / 100)}-Franken-Note` : `${r.notenAnzahl} Noten zu ${fmt(r.note / 100)} Franken`;
          const inp = new ZW.NumInput({ decimal: true, prefix: 'Fr. ', onOk: (v) => pruefe(v) });
          inp.activate();
          const pruefe = (v) => {
            if (fertig) return;
            fertig = true; inp.locked = true;
            max++;
            if (Math.round(v * 100) === Math.round(r.answer * 100)) {
              punkte++; inp.display.classList.add('ok');
              setFb(fb, `Richtig! ${ZW.fr(r.bezahlt)} − ${ZW.fr(r.summe)} = ${ZW.fr(r.bezahlt - r.summe)}`, true); ZW.sound.play('ok');
            } else {
              inp.display.classList.add('falsch');
              setFb(fb, `Nicht ganz. ${ZW.fr(r.bezahlt)} − ${ZW.fr(r.summe)} = ${ZW.fr(r.bezahlt - r.summe)}`, false); ZW.sound.play('bad');
              fehler.push(`Rückgeld für ${namen}: richtig ist ${ZW.fr(r.bezahlt - r.summe)}.`);
            }
            weiter.hidden = false; weiter.focus();
          };
          inhalt = [
            h('p', { class: 'auftrag' }, `Du kaufst ${namen}.`),
            regal,
            h('p', { class: 'auftrag' }, `Du bezahlst mit ${notenText} (${ZW.fr(r.bezahlt)}). Wie viel Rückgeld bekommst du?`),
            h('p', { class: 'hinweis' }, 'Schreibe den Betrag mit Punkt, zum Beispiel 3.40 für Fr. 3.40.'),
            h('div', { class: 'rallye' }, h('div', { class: 'eingabe-zeile' }, h('span', { class: 'aufgabe-text', style: 'font-size:1.4rem' }, 'Rückgeld:'), inp.display), inp.pad),
          ];
        } else {
          const kasse = h('div', { class: 'kasse', 'aria-live': 'polite' });
          const gelegt = [];
          const summeEl = h('span', { class: 'preis' });
          const update = () => {
            const s = gelegt.reduce((a, x) => a + x.w, 0);
            summeEl.textContent = r.zeigeSumme ? `Hingelegt: ${ZW.fr(s)}` : `${gelegt.length} Stück hingelegt`;
            kasse.replaceChildren(...gelegt.map((x, i) => geldKnopf(x, () => { if (fertig) return; gelegt.splice(i, 1); update(); })));
          };
          update();
          const geldReihe = h('div', { class: 'geld' }, r.geld.map((x) => geldKnopf(x, () => { if (fertig) return; gelegt.push(x); gelegt.sort((a, b) => b.w - a.w); ZW.sound.play('tap'); update(); })));
          const bezahlen = h('button', { class: 'btn', type: 'button', onclick: () => {
            if (fertig) return;
            const s = gelegt.reduce((a, x) => a + x.w, 0);
            fertig = true;
            const wert = r.modus === 'wenig' ? 2 : 1;
            max += wert;
            if (s !== r.summe) {
              setFb(fb, `Du hast ${ZW.fr(s)} hingelegt. Gesucht war ${ZW.fr(r.summe)}.`, false); ZW.sound.play('bad');
              fehler.push(`${namen}: gesucht war ${ZW.fr(r.summe)}, du hast ${ZW.fr(s)} hingelegt.`);
            } else if (r.modus === 'wenig' && gelegt.length > r.minimal) {
              punkte += 1;
              setFb(fb, `Der Betrag stimmt (${ZW.fr(s)}). Es geht aber mit ${r.minimal} statt ${gelegt.length} Stück. 1 von 2 Punkten.`, false); ZW.sound.play('bad');
              fehler.push(`${namen}: ${ZW.fr(r.summe)} geht mit ${r.minimal} Münzen und Noten.`);
            } else {
              punkte += wert;
              setFb(fb, r.waren.length > 1 ? `Richtig! ${r.waren.map((w) => ZW.fr(w.preis)).join(' + ')} = ${ZW.fr(r.summe)}` : `Richtig! Genau ${ZW.fr(r.summe)}.`, true); ZW.sound.play('ok');
            }
            bezahlen.hidden = true; zurueck.hidden = true; weiter.hidden = false; weiter.focus();
          } }, 'Bezahlen');
          const zurueck = h('button', { class: 'btn ghost', type: 'button', onclick: () => { if (!fertig) { gelegt.length = 0; update(); } } }, 'Alles zurücknehmen');
          const auftrag = r.modus === 'wenig'
            ? `Du kaufst ${namen}. Bezahle genau den Betrag. Verwende so wenige Münzen und Noten wie möglich.`
            : r.waren.length > 1 ? `Du kaufst ${namen}. Rechne zusammen. Bezahle dann genau den Betrag.` : `Du kaufst ${namen}. Bezahle genau ${ZW.fr(r.summe)}.`;
          inhalt = [
            h('p', { class: 'auftrag' }, auftrag), regal,
            h('div', { class: 'kasse-titel' }, h('span', {}, 'Deine Kasse (tippe auf Geld, um es wegzunehmen)'), summeEl),
            kasse,
            h('p', { class: 'hinweis' }, 'Tippe auf Münzen und Noten:'), geldReihe,
            h('div', { class: 'aktionen' }, bezahlen, zurueck),
          ];
        }
        const weiter = h('button', { class: 'btn', type: 'button', hidden: true, onclick: () => { runde++; naechste(); } }, runde + 1 >= RUNDEN ? 'Auswertung' : 'Nächster Einkauf');
        box.replaceChildren(...inhalt, fb, h('div', { class: 'aktionen' }, weiter, h('span', { class: 'chip' }, `Einkauf ${runde + 1} von ${RUNDEN}`)));
      };
      naechste();
    },
  };

  // ------------------------------------------------------------------ Memory
  const memory = {
    id: 'memory', name: 'Rechen-Memory', thema: 'Rechnen',
    kurz: 'Finde Paare: Rechnung und Ergebnis gehören zusammen.',
    lp: 'MA.1.A.3', was: 'Einmaleins und Umkehraufgaben automatisieren, Zehner- und Hunderter-Einmaleins; Zahlwort und Zahl bei grossen Zahlen; Dezimalzahlen und Brüche gleichsetzen.',
    bild: svg('<rect x="8" y="10" width="34" height="44" rx="5"/><rect x="48" y="10" width="34" height="44" rx="5"/><path d="M18 32h14M65 26v12M59 32h12"/><rect x="88" y="10" width="26" height="44" rx="5" stroke-dasharray="4 5"/>'),
    start(g) {
      ZW.keyHandler = null;
      const paare = ZW.memoryPaare(g.k, g.s);
      const karten = ZW.shuffle(paare.flatMap((p, i) => [{ paar: i, text: p.a, html: p.aHtml }, { paar: i, text: p.b, html: p.bHtml }]));
      let offen = [], gefunden = 0, zuege = 0, sperre = false;
      const zugEl = h('span', { class: 'chip' }, 'Züge: 0');
      const fb = feedback();
      const knoepfe = karten.map((k, idx) => {
        const b = h('button', { type: 'button', class: 'karte' + (k.text.length > 14 ? ' lang' : ''), 'aria-label': 'Verdeckte Karte ' + (idx + 1), onclick: () => klick(idx) }, h('span', { class: 'rueck', 'aria-hidden': 'true' }, '?'));
        return b;
      });
      const zeige = (idx) => {
        const b = knoepfe[idx], k = karten[idx];
        b.classList.add('offen');
        if (k.html) b.innerHTML = k.html; else b.textContent = k.text;
        b.setAttribute('aria-label', k.text);
      };
      const verdecke = (idx) => {
        const b = knoepfe[idx];
        b.classList.remove('offen');
        b.replaceChildren(h('span', { class: 'rueck', 'aria-hidden': 'true' }, '?'));
        b.setAttribute('aria-label', 'Verdeckte Karte ' + (idx + 1));
      };
      function klick(idx) {
        if (sperre || offen.includes(idx) || knoepfe[idx].classList.contains('paar')) return;
        zeige(idx); offen.push(idx);
        ZW.sound.play('tap');
        if (offen.length < 2) return;
        zuege++; zugEl.textContent = 'Züge: ' + zuege;
        const [a, b] = offen;
        if (karten[a].paar === karten[b].paar) {
          knoepfe[a].classList.add('paar'); knoepfe[b].classList.add('paar');
          gefunden++; offen = [];
          setFb(fb, 'Ein Paar!', true); ZW.sound.play('ok');
          g.fortschritt(gefunden / paare.length);
          if (gefunden === paare.length) {
            const n = paare.length;
            const sterne = zuege <= n + 4 ? 3 : zuege <= 2 * n + 2 ? 2 : 1;
            setTimeout(() => g.ende({ sterne, text: `Du hast alle ${n} Paare in ${zuege} Zügen gefunden.`, fehler: [] }), 700);
          }
        } else {
          sperre = true;
          setTimeout(() => { verdecke(a); verdecke(b); offen = []; sperre = false; fb.textContent = ''; }, 1100);
        }
      }
      const n = paare.length;
      const auftrag = 'Finde die Paare: Eine Rechnung und ihr Ergebnis gehören zusammen. Oder: Zwei Karten zeigen dieselbe Zahl, zum Beispiel als Wort und als Zahl.';
      g.buehne.append(h('div', { class: 'buehne papier' },
        h('p', { class: 'auftrag' }, auftrag),
        h('p', { class: 'hinweis' }, `Decke immer zwei Karten auf. Es gibt ${n} Paare. Mit höchstens ${n + 4} Zügen bekommst du 3 Sterne.`),
        h('div', { class: 'memory' }, knoepfe), fb, h('div', { class: 'aktionen' }, zugEl)));
    },
  };

  ZW.SPIELE = [rallye, strahl, stellen, mauer, jagd, laden, memory];
})();
