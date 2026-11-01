// Spielt eine Lektion ab: zeigt Übung für Übung, prüft Antworten, gibt Feedback.

import { t } from './i18n.js';
import { speak, listen, canListen, stopListening } from './speech.js';
import { sfx, confetti } from './fx.js';
import { checkTyped, checkSpoken, tokens, shuffle, esc, pick } from './util.js';

const $ = (sel, el = document) => el.querySelector(sel);

function h(html) {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild;
}

const speakerBtn = (big = false) =>
  `<button class="speaker${big ? ' big' : ''}" data-say aria-label="${t('tapToListen')}">🔊</button>`;
const slowBtn = () => `<button class="speaker slow" data-slow aria-label="${t('slow')}">🐢</button>`;

function wireAudio(el, text) {
  el.querySelectorAll('[data-say]').forEach((b) => (b.onclick = () => { pulse(b); speak(text); }));
  el.querySelectorAll('[data-slow]').forEach((b) => (b.onclick = () => { pulse(b); speak(text, { slow: true }); }));
}

function pulse(el) {
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

const isNoun = (de) => /^(der|die|das) /.test(de);

// ---------- Übungsarten
// Jede Art bekommt (body, ex, api) und gibt { check() } zurück.
// api.ready(bool) schaltet den Prüfen-Knopf frei, api.finish(result) beendet die Übung sofort.

const R = {
  intro(body, ex, api, lang) {
    const it = ex.item;
    const isSentence = it.kind === 's';
    body.append(h(`
      <div class="ex intro">
        <span class="badge">✨ ${t(isSentence ? 'newSentence' : 'newWord')}</span>
        ${it.e ? `<div class="pic">${esc(it.e)}</div>` : ''}
        <div class="say-row">${speakerBtn()}<div class="de-big">${esc(it.de)}</div>${slowBtn()}</div>
        <div class="native">${esc(it[lang])}</div>
      </div>`));
    wireAudio(body, it.de);
    speak(it.de);
    api.ready(true, t('continue'));
    return { check: () => ({ skipFeedback: true, ungraded: true }) };
  },

  choose(body, ex, api, lang) {
    const it = ex.item;
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qChoose')}</h2>
        <div class="prompt">
          ${it.p && it.e ? `<div class="pic small">${esc(it.e)}</div>` : ''}
          <div class="say-row">${speakerBtn()}<div class="de-big">${esc(it.de)}</div></div>
        </div>
        <div class="options"></div>
      </div>`));
    wireAudio(body, it.de);
    speak(it.de);
    const sel = optionList($('.options', body), ex.options, api);
    return { check: () => ({ ok: sel() === ex.answer, solution: ex.answer }) };
  },

  listenChoose(body, ex, api, lang) {
    const it = ex.item;
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qListenChoose')}</h2>
        <div class="listen-box">${speakerBtn(true)}${slowBtn()}</div>
        <div class="options"></div>
      </div>`));
    wireAudio(body, it.de);
    setTimeout(() => speak(it.de), 250);
    const sel = optionList($('.options', body), ex.options, api, (o) => speak(o));
    return { check: () => ({ ok: sel() === ex.answer, solution: ex.answer, meaning: it[lang] }) };
  },

  picType(body, ex, api, lang) {
    const it = ex.item;
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qPicType')}</h2>
        ${isNoun(it.de) ? `<p class="hint">${t('qPicTypeNoun')}</p>` : ''}
        <div class="pic">${esc(it.e)}</div>
        ${typeBox()}
      </div>`));
    const get = wireType(body, api);
    return { check: () => typedResult(get(), it, lang) };
  },

  translateType(body, ex, api, lang) {
    const it = ex.item;
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qTranslateType')}</h2>
        <div class="prompt"><div class="native-big">${esc(it[lang])}</div></div>
        ${isNoun(it.de) ? `<p class="hint">${t('qPicTypeNoun')}</p>` : ''}
        ${typeBox()}
      </div>`));
    const get = wireType(body, api);
    return { check: () => typedResult(get(), it, lang) };
  },

  listenType(body, ex, api, lang) {
    const it = ex.item;
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qListenType')}</h2>
        <div class="listen-box">${speakerBtn(true)}${slowBtn()}</div>
        ${typeBox()}
      </div>`));
    wireAudio(body, it.de);
    setTimeout(() => speak(it.de), 250);
    const get = wireType(body, api);
    return { check: () => typedResult(get(), it, lang) };
  },

  speak(body, ex, api, lang, hooks) {
    const it = ex.item;
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qSpeak')}</h2>
        <div class="prompt">
          <div class="say-row">${speakerBtn()}<div class="de-big">${esc(it.de)}</div>${slowBtn()}</div>
          <div class="native">${esc(it[lang])}</div>
        </div>
        <button class="mic" aria-label="${t('tapMic')}"><span>🎤</span></button>
        <p class="mic-status">${canListen() ? t('tapMic') : t('noSpeech')}</p>
        <button class="link-btn cant">${t('cantSpeak')}</button>
      </div>`));
    wireAudio(body, it.de);
    const mic = $('.mic', body);
    const status = $('.mic-status', body);
    let tries = 0;
    let lastHeard = '';
    api.ready(false, t('skip'), true);
    mic.disabled = !canListen();
    mic.onclick = async () => {
      mic.classList.add('on');
      status.textContent = t('listening');
      try {
        const alts = await listen();
        mic.classList.remove('on');
        if (!alts.length) { status.textContent = t('tryAgain'); return; }
        const r = checkSpoken(alts, it.de);
        lastHeard = r.heard;
        tries++;
        if (r.ok) return api.finish({ ok: true, solution: it.de, heard: r.heard });
        status.innerHTML = `${t('heard')} <b>„${esc(r.heard)}“</b> – ${t('tryAgain')}`;
        sfx.wrong();
        if (tries >= 3) api.finish({ ok: false, solution: it.de, heard: lastHeard });
      } catch (e) {
        mic.classList.remove('on');
        status.textContent = /not-allowed|service-not-allowed/.test(e.message) ? t('micDenied') : t('tryAgain');
      }
    };
    $('.cant', body).onclick = () => { hooks.pauseSpeaking(); api.finish({ skipped: true, skipFeedback: true, ungraded: true }); };
    // Ohne Mikrofon: „Überspringen“ zählt nicht als Fehler.
    return { check: () => ({ skipped: true, skipFeedback: true, ungraded: true }), cleanup: stopListening };
  },

  match(body, ex, api, lang) {
    const items = ex.items;
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qMatch')}</h2>
        <div class="match"><div class="col left"></div><div class="col right"></div></div>
      </div>`));
    const left = $('.left', body), right = $('.right', body);
    let selL = null, selR = null, left2 = items.length, errors = 0;
    const mk = (it, side) => {
      const b = h(`<button class="tile">${esc(side === 'l' ? it.de : it[lang])}</button>`);
      b.dataset.key = it.key;
      b.onclick = () => {
        if (b.disabled) return;
        if (side === 'l') { selL?.classList.remove('sel'); selL = b; speak(it.de); } else { selR?.classList.remove('sel'); selR = b; }
        b.classList.add('sel');
        sfx.tap();
        if (selL && selR) {
          const a = selL, c = selR;
          selL = selR = null;
          if (a.dataset.key === c.dataset.key) {
            [a, c].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; });
            if (--left2 === 0) { sfx.correct(); setTimeout(() => api.finish({ ok: true, skipFeedback: true, matchErrors: errors }), 450); }
          } else {
            errors++;
            sfx.wrong();
            [a, c].forEach((x) => { x.classList.remove('sel'); x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 450); });
          }
        }
      };
      return b;
    };
    shuffle(items).forEach((it) => left.append(mk(it, 'l')));
    shuffle(items).forEach((it) => right.append(mk(it, 'r')));
    api.hide();
    return { check: () => null };
  },

  build(body, ex, api, lang) { return buildEx(body, ex, api, lang, false); },
  listenBuild(body, ex, api, lang) { return buildEx(body, ex, api, lang, true); },

  gap(body, ex, api, lang) {
    const it = ex.item;
    const tk = tokens(it.de);
    const end = it.de.trim().slice(-1);
    const parts = tk.map((w, i) => (i === ex.gapIndex ? '<span class="gap">&nbsp;</span>' : esc(w)));
    body.append(h(`
      <div class="ex">
        <h2 class="q">${t('qGap')}</h2>
        <div class="prompt">
          <div class="say-row"><div class="de-big sentence">${parts.join(' ')}${/[.!?]/.test(end) ? end : ''}</div></div>
          <div class="native">${esc(it[lang])}</div>
        </div>
        <div class="options"></div>
      </div>`));
    const gapEl = $('.gap', body);
    const sel = optionList($('.options', body), ex.options, api, (o) => { gapEl.textContent = o; gapEl.classList.add('filled'); });
    return { check: () => ({ ok: sel() === ex.answer, solution: it.de, meaning: it[lang] }) };
  },
};

function buildEx(body, ex, api, lang, listenMode) {
  const it = ex.item;
  body.append(h(`
    <div class="ex">
      <h2 class="q">${t(listenMode ? 'qListenBuild' : 'qBuild')}</h2>
      ${listenMode
        ? `<div class="listen-box">${speakerBtn(true)}${slowBtn()}</div>`
        : `<div class="prompt"><div class="native-big">${esc(it[lang])}</div></div>`}
      <div class="answer-line"></div>
      <div class="bank"></div>
    </div>`));
  if (listenMode) { wireAudio(body, it.de); setTimeout(() => speak(it.de), 250); }
  const line = $('.answer-line', body), bank = $('.bank', body);
  const chosen = [];
  ex.tiles.forEach((w, i) => {
    const b = h(`<button class="tile">${esc(w)}</button>`);
    b.onclick = () => {
      sfx.tap();
      const idx = chosen.indexOf(i);
      if (idx >= 0) { chosen.splice(idx, 1); bank.append(b); } else { chosen.push(i); line.append(b); }
      // Reihenfolge in der Bank stabil halten
      [...bank.children].sort((a, c) => a._i - c._i).forEach((x) => bank.append(x));
      api.ready(chosen.length > 0);
    };
    b._i = i;
    bank.append(b);
  });
  return {
    check: () => {
      const said = chosen.map((i) => ex.tiles[i]).join(' ').toLowerCase();
      const ok = said === tokens(it.de).join(' ').toLowerCase();
      return { ok, solution: it.de, meaning: listenMode ? it[lang] : null };
    },
  };
}

function optionList(el, options, api, onPick) {
  let selected = null;
  options.forEach((o, i) => {
    const b = h(`<button class="option"><span class="num">${i + 1}</span><span>${esc(o)}</span></button>`);
    b.onclick = () => {
      el.querySelectorAll('.option').forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel');
      selected = o;
      sfx.tap();
      onPick?.(o);
      api.ready(true);
    };
    el.append(b);
  });
  return () => selected;
}

function typeBox() {
  return `
    <div class="type-box">
      <input class="answer" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="${t('typeHere')}">
      <div class="umlauts">${['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü'].map((c) => `<button class="key" data-c="${c}">${c}</button>`).join('')}</div>
    </div>`;
}

function wireType(body, api) {
  const input = $('.answer', body);
  input.oninput = () => api.ready(input.value.trim().length > 0);
  body.querySelectorAll('.key').forEach((k) => {
    k.onmousedown = (e) => e.preventDefault();
    k.onclick = () => {
      const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
      input.value = input.value.slice(0, s) + k.dataset.c + input.value.slice(e);
      input.setSelectionRange(s + 1, s + 1);
      input.focus();
      input.oninput();
    };
  });
  setTimeout(() => input.focus({ preventScroll: true }), 60);
  return () => input.value;
}

function typedResult(value, it, lang) {
  // Auch gleichwertige Antworten gelten (z. B. „Hallo“ für „Bonjour“)
  const r = [it.de, ...(it.alt || [])].map((x) => checkTyped(value, x)).find((x) => x.ok && !x.note)
    || [it.de, ...(it.alt || [])].map((x) => checkTyped(value, x)).find((x) => x.ok)
    || checkTyped(value, it.de);
  return { ok: r.ok, note: r.note, solution: it.de, meaning: it[lang], typed: value };
}

// ---------- Ablauf einer Lektion

export function runLesson(root, exercises, opts) {
  const { lang, onExit, onDone, hooks = {} } = opts;
  const queue = exercises.map((e) => ({ ...e }));
  let pos = 0;
  let graded = 0, correctFirst = 0, combo = 0;
  let current = null;
  let mode = 'check'; // 'check' | 'continue'
  let lastResult = null;

  root.innerHTML = '';
  const el = h(`
    <div class="player">
      <header class="p-top">
        <button class="icon-btn quit" aria-label="Quit">✕</button>
        <div class="bar"><i></i></div>
        <span class="combo"></span>
      </header>
      <main class="p-body"></main>
      <footer class="p-foot">
        <div class="feedback"></div>
        <button class="btn primary main-btn" disabled>${t('check')}</button>
      </footer>
    </div>`);
  root.append(el);
  const body = $('.p-body', el), foot = $('.p-foot', el), fbEl = $('.feedback', el), btn = $('.main-btn', el);
  const bar = $('.bar i', el), comboEl = $('.combo', el);

  const api = {
    ready(on, label, alwaysOn) {
      if (mode !== 'check') return;
      btn.disabled = alwaysOn ? false : !on;
      btn.textContent = label || t('check');
      btn.classList.toggle('ghost', !!alwaysOn && !on);
    },
    hide() { foot.classList.add('hidden'); },
    finish(result) { finish(result); },
  };

  $('.quit', el).onclick = () => confirmQuit();

  function confirmQuit() {
    const m = h(`
      <div class="modal-bg"><div class="modal">
        <h3>${t('quitTitle')}</h3><p>${t('quitText')}</p>
        <button class="btn primary stay">${t('quitNo')}</button>
        <button class="btn ghost-red leave">${t('quitYes')}</button>
      </div></div>`);
    $('.stay', m).onclick = () => m.remove();
    $('.leave', m).onclick = () => { m.remove(); cleanup(); onExit(); };
    document.body.append(m);
  }

  const keyHandler = (e) => {
    if (e.key === 'Enter' && !btn.disabled && !foot.classList.contains('hidden')) { e.preventDefault(); btn.click(); }
    if (mode === 'check' && /^[1-4]$/.test(e.key) && document.activeElement?.tagName !== 'INPUT') {
      const opt = body.querySelectorAll('.option')[Number(e.key) - 1];
      opt?.click();
    }
  };
  document.addEventListener('keydown', keyHandler);

  function cleanup() {
    document.removeEventListener('keydown', keyHandler);
    current?.cleanup?.();
    stopListening();
  }

  function progress() {
    bar.style.width = `${Math.round((pos / queue.length) * 100)}%`;
    comboEl.textContent = combo >= 3 ? `🔥 ${combo}` : '';
  }

  function show() {
    progress();
    if (pos >= queue.length) return results();
    const ex = queue[pos];
    mode = 'check';
    body.innerHTML = '';
    fbEl.innerHTML = '';
    foot.className = 'p-foot';
    btn.disabled = true;
    btn.textContent = t('check');
    btn.classList.remove('ghost');
    body.scrollTop = 0;
    if (opts.debug) window.__ex = ex;
    current = R[ex.type](body, ex, api, lang, hooks);
  }

  btn.onclick = () => {
    if (mode === 'check') {
      const r = current.check();
      if (r) finish(r);
    } else {
      pos++;
      show();
    }
  };

  function finish(r) {
    if (mode !== 'check') return;
    current?.cleanup?.();
    const ex = queue[pos];
    lastResult = r;
    if (!r.ungraded) {
      if (!ex._retry) graded++;
      if (r.ok) {
        if (!ex._retry) correctFirst++;
        combo++;
        hooks.correct?.(ex);
      } else {
        combo = 0;
        hooks.mistake?.(ex);
        if ((ex._retry || 0) < 2) queue.push({ ...ex, _retry: (ex._retry || 0) + 1 });
      }
    }
    if (r.skipFeedback) { pos++; return show(); }

    mode = 'continue';
    r.ok ? sfx.correct() : sfx.wrong();
    foot.className = `p-foot ${r.ok ? 'good' : 'bad'}`;
    const notes = {
      umlaut: `${t('noteUmlaut')} <b>${esc(r.solution)}</b>`,
      typo: `${t('noteTypo')} <b>${esc(r.solution)}</b>`,
      article: `${t('noteArticle')} <b>${esc(r.solution)}</b>`,
      wrongArticle: `${t('noteWrongArticle')} <b>${esc(r.solution)}</b>`,
    };
    const lines = [];
    if (!r.ok) lines.push(`<div class="fb-line">${t('solution')} <b>${esc(r.solution)}</b> <button class="speaker mini" data-say>🔊</button></div>`);
    if (r.note && notes[r.note] && (r.ok || r.note === 'wrongArticle')) lines.push(`<div class="fb-line">${notes[r.note]}</div>`);
    if (r.heard && !r.ok) lines.push(`<div class="fb-line">${t('heard')} „${esc(r.heard)}“</div>`);
    if (r.meaning) lines.push(`<div class="fb-line muted">${t('meaning')} ${esc(r.meaning)}</div>`);
    fbEl.innerHTML = `
      <div class="fb-title">${r.ok ? `✅ ${esc(pick(t('great')))}` : `❌ ${t('wrong')}`}</div>
      ${lines.join('')}`;
    const sayText = ex.item?.de;
    fbEl.querySelectorAll('[data-say]').forEach((b) => (b.onclick = () => speak(sayText)));
    if (sayText && ex.type !== 'speak') speak(sayText);
    btn.disabled = false;
    btn.classList.remove('ghost');
    btn.textContent = t('continue');
    btn.focus({ preventScroll: true });
    progress();
  }

  function results() {
    cleanup();
    const acc = graded ? Math.round((correctFirst / graded) * 100) : 100;
    const xp = opts.xpFor ? opts.xpFor(acc) : 10 + (acc === 100 ? 5 : 0);
    onDone?.({ acc, xp });
    sfx.done();
    confetti();
    body.innerHTML = '';
    foot.className = 'p-foot';
    fbEl.innerHTML = '';
    body.append(h(`
      <div class="ex results">
        <div class="trophy">🏆</div>
        <h2>${t('lessonDone')}</h2>
        <div class="stats">
          <div class="stat xp"><b>+${xp}</b><span>${t('earned')}</span></div>
          <div class="stat acc"><b>${acc}%</b><span>${t('accuracy')}</span></div>
        </div>
      </div>`));
    btn.disabled = false;
    btn.textContent = t('continue');
    btn.onclick = () => onExit();
    bar.style.width = '100%';
  }

  show();
}

// ---------- Schnell-Spiel: 60 Sekunden Paare finden

export function runSprint(root, words, { lang, onExit, onDone }) {
  root.innerHTML = '';
  const el = h(`
    <div class="player">
      <header class="p-top">
        <button class="icon-btn quit" aria-label="Quit">✕</button>
        <div class="bar timer"><i style="width:100%"></i></div>
        <span class="combo sprint-score">0</span>
      </header>
      <main class="p-body"><div class="ex">
        <h2 class="q">${t('sprintSub')}</h2>
        <div class="match"><div class="col left"></div><div class="col right"></div></div>
      </div></main>
      <footer class="p-foot hidden"><button class="btn primary main-btn">${t('continue')}</button></footer>
    </div>`);
  root.append(el);
  const left = $('.left', el), right = $('.right', el), bar = $('.bar i', el), scoreEl = $('.sprint-score', el);
  let deck = shuffle(words);
  let score = 0, selL = null, selR = null, over = false;
  const START = Date.now(), DUR = 60000;

  const nextWord = () => { if (!deck.length) deck = shuffle(words); return deck.pop(); };
  const active = new Set();

  function tile(it, side) {
    const b = h(`<button class="tile">${esc(side === 'l' ? it.de : it[lang])}</button>`);
    b.dataset.key = it.key;
    b.onclick = () => {
      if (over || b.disabled) return;
      if (side === 'l') { selL?.classList.remove('sel'); selL = b; } else { selR?.classList.remove('sel'); selR = b; }
      b.classList.add('sel');
      if (!selL || !selR) return;
      const a = selL, c = selR;
      selL = selR = null;
      if (a.dataset.key === c.dataset.key) {
        score++;
        scoreEl.textContent = `⚡ ${score}`;
        sfx.correct();
        active.delete(a.dataset.key);
        [a, c].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; });
        setTimeout(() => replace(a, c), 300);
      } else {
        sfx.wrong();
        [a, c].forEach((x) => { x.classList.remove('sel'); x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 400); });
      }
    };
    return b;
  }

  function replace(a, c) {
    let it = nextWord();
    for (let i = 0; i < 20 && active.has(it.key); i++) it = nextWord();
    active.add(it.key);
    a.replaceWith(tile(it, 'l'));
    // Neue rechte Kachel an zufälliger Stelle, damit man nicht einfach die gleiche Position tippt
    c.remove();
    const kids = right.children;
    const pos = Math.floor(Math.random() * (kids.length + 1));
    right.insertBefore(tile(it, 'r'), kids[pos] || null);
  }

  const first = [];
  while (first.length < Math.min(5, words.length)) {
    const it = nextWord();
    if (!active.has(it.key)) { active.add(it.key); first.push(it); }
  }
  first.forEach((it) => left.append(tile(it, 'l')));
  shuffle(first).forEach((it) => right.append(tile(it, 'r')));

  const timer = setInterval(() => {
    const leftMs = DUR - (Date.now() - START);
    bar.style.width = `${Math.max(0, (leftMs / DUR) * 100)}%`;
    if (leftMs <= 0) end();
  }, 100);

  function end() {
    if (over) return;
    over = true;
    clearInterval(timer);
    const xp = Math.min(30, score);
    onDone?.({ score, xp });
    sfx.done();
    if (score > 0) confetti();
    $('.p-body', el).innerHTML = `
      <div class="ex results">
        <div class="trophy">⚡</div>
        <h2>${t('sprintDone')}</h2>
        <div class="stats">
          <div class="stat acc"><b>${score}</b><span>${t('sprintScore')}</span></div>
          <div class="stat xp"><b>+${xp}</b><span>${t('earned')}</span></div>
        </div>
      </div>`;
    const foot = $('.p-foot', el);
    foot.classList.remove('hidden');
    $('.main-btn', el).onclick = onExit;
  }

  $('.quit', el).onclick = () => { over = true; clearInterval(timer); onExit(); };
}
