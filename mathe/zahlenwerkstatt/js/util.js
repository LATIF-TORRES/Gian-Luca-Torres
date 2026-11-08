// Grundfunktionen: Zufall, Schweizer Zahlenformat, Zahlwörter, Speicher, Ton, Tastenfeld.
(function () {
  const ZW = (window.ZW = window.ZW || {});

  ZW.rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  ZW.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  ZW.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  ZW.clean = (n) => Math.round(n * 1e6) / 1e6;
  ZW.eq = (a, b) => Math.abs(a - b) < 1e-9;

  // Schweizer Zahlenformat: 30'400, 2.75, Minus als Rechenzeichen
  ZW.fmt = (n, decimals) => {
    const neg = n < 0;
    n = Math.abs(n);
    const s = decimals != null ? n.toFixed(decimals) : String(ZW.clean(n));
    let [i, f] = s.split('.');
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return (neg ? '−' : '') + i + (f ? '.' + f : '');
  };
  // Geld in Rappen -> "Fr. 13.40"
  ZW.fr = (rp) => 'Fr. ' + ZW.fmt(rp / 100, 2);

  // Eingabe lesen: Apostrophe und Leerzeichen erlaubt, Komma wie Punkt
  ZW.parseNum = (s) => {
    s = String(s).replace(/['’\s]/g, '').replace(',', '.');
    if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  };

  // Zahlwörter (Schweizer Schreibweise mit ss)
  const EIN = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf',
    'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const ZEHN = ['', '', 'zwanzig', 'dreissig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  const u100 = (n) => (n < 20 ? EIN[n] : (n % 10 ? EIN[n % 10] + 'und' : '') + ZEHN[Math.floor(n / 10)]);
  const u1000 = (n) => (n >= 100 ? EIN[Math.floor(n / 100)] + 'hundert' : '') + u100(n % 100);
  const unterMillion = (n) => {
    const t = Math.floor(n / 1000), r = n % 1000;
    return (t ? u1000(t) + 'tausend' : '') + u1000(r);
  };
  // Anzahl vor „Million(en)“ / „Milliarde(n)“: eine, zwei, einhunderteine …
  const anzahlWort = (n) => (n === 1 ? 'eine' : n % 100 === 1 ? unterMillion(n) + 'e' : unterMillion(n));
  ZW.zahlwort = (n) => {
    if (n === 0) return 'null';
    const mia = Math.floor(n / 1e9), mio = Math.floor(n / 1e6) % 1000, rest = n % 1e6;
    const teile = [];
    if (mia) teile.push(anzahlWort(mia) + (mia === 1 ? ' Milliarde' : ' Milliarden'));
    if (mio) teile.push(anzahlWort(mio) + (mio === 1 ? ' Million' : ' Millionen'));
    if (rest) teile.push(unterMillion(rest) + (rest % 100 === 1 ? 's' : ''));
    return teile.join(' ');
  };

  // Speicher im Browser (kann fehlen, dann läuft alles ohne Speichern)
  ZW.store = {
    get(k, d) {
      try { const v = localStorage.getItem('zahlenwerkstatt:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem('zahlenwerkstatt:' + k, JSON.stringify(v)); } catch (e) { /* ohne Speicher weiter */ }
    },
  };

  // Kurze Töne
  ZW.sound = {
    on: ZW.store.get('ton', true),
    ctx: null,
    play(kind) {
      if (!this.on) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        const notes = { ok: [660, 880], bad: [260, 200], win: [523, 659, 784, 1046], tap: [520] }[kind] || [440];
        notes.forEach((f, i) => {
          const o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = f;
          const t = this.ctx.currentTime + i * 0.1;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(kind === 'tap' ? 0.05 : 0.14, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
          o.connect(g).connect(this.ctx.destination);
          o.start(t);
          o.stop(t + 0.22);
        });
      } catch (e) { /* kein Ton möglich */ }
    },
  };

  // Element-Helfer
  ZW.h = (tag, attrs, ...children) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style') e.setAttribute('style', v);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return e;
  };

  // Bruch als HTML
  ZW.bruchHtml = (z, n) => `<span class="bruch" aria-label="${z} ${n === 2 ? 'halb' : 'von ' + n}"><span>${z}</span><span>${n}</span></span>`;

  // Tastatur der Geräte an das aktive Tastenfeld weiterleiten
  ZW.keyHandler = null;
  document.addEventListener('keydown', (ev) => {
    if (!ZW.keyHandler) return;
    if (ev.target && /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
    let k = null;
    if (/^[0-9]$/.test(ev.key)) k = ev.key;
    else if (ev.key === '.' || ev.key === ',') k = '.';
    else if (ev.key === 'Backspace') k = 'del';
    else if (ev.key === 'Enter') k = 'ok';
    if (k) { ev.preventDefault(); ZW.keyHandler(k); }
  });

  // Zahleneingabe mit Tastenfeld.
  // opts: { decimal: bool, maxLen, onOk(value, text), prefix }
  ZW.NumInput = class {
    constructor(opts) {
      this.opts = Object.assign({ decimal: false, maxLen: 10 }, opts);
      this.text = '';
      this.display = ZW.h('span', { class: 'anzeige leer', 'aria-live': 'polite' });
      this.pad = this.buildPad();
      this.locked = false;
    }
    buildPad() {
      const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', this.opts.decimal ? '.' : '', '0', 'del'];
      const pad = ZW.h('div', { class: 'keypad', role: 'group', 'aria-label': 'Zahlen-Tasten' });
      for (const k of keys) {
        if (k === '') { pad.append(ZW.h('span', { class: 'leer' })); continue; }
        pad.append(ZW.h('button', {
          type: 'button', 'aria-label': k === 'del' ? 'Löschen' : k === '.' ? 'Punkt' : k,
          onclick: () => this.key(k),
        }, k === 'del' ? '⌫' : k));
      }
      pad.append(ZW.h('button', { type: 'button', class: 'ok', onclick: () => this.key('ok') }, this.opts.okText || 'OK'));
      return pad;
    }
    activate() { ZW.keyHandler = (k) => this.key(k); }
    key(k) {
      if (this.locked) return;
      if (k === 'ok') {
        if (this.text === '' || this.text === '.') return;
        this.opts.onOk && this.opts.onOk(ZW.parseNum(this.text), this.text);
        return;
      }
      if (k === 'del') this.text = this.text.slice(0, -1);
      else if (k === '.') {
        if (!this.opts.decimal || this.text.includes('.')) return;
        this.text = (this.text || '0') + '.';
      } else {
        if (this.text.replace('.', '').length >= this.opts.maxLen) return;
        if (this.text === '0') this.text = '';
        this.text += k;
      }
      this.opts.onChange && this.opts.onChange(this.text);
      this.render();
    }
    set(text) { this.text = text; this.render(); }
    clear() { this.text = ''; this.display.classList.remove('ok', 'falsch'); this.render(); }
    render() {
      const [i, f] = this.text.split('.');
      const shown = this.text === '' ? '' : (i ? i.replace(/\B(?=(\d{3})+(?!\d))/g, "'") : '0') + (this.text.includes('.') ? '.' + (f || '') : '');
      this.display.textContent = (this.opts.prefix && shown ? this.opts.prefix : '') + shown;
      this.display.classList.toggle('leer', shown === '');
    }
  };

  // Sterne aus Anteil
  ZW.sterneAus = (ratio) => (ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0);
  ZW.sterneHtml = (n) => [0, 1, 2].map((i) => `<span class="${i < n ? 'an' : ''}">★</span>`).join('');
})();
