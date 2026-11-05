// Hauptprogramm: Anmeldung, Lernpfad, Bezahlseite, Profil.

import { CONFIG } from './config.js';
import { logoMark } from './logo.js';
import { t, setLang, getLang, detectLang } from './i18n.js';
import { backend } from './backend.js';
import { store } from './store.js';
import { LESSONS, buildLesson, buildReview, allItems } from './lessons.js';
import { runLesson } from './player.js';
import { setSound, sfx } from './fx.js';
import { hasGermanVoice } from './speech.js';
import { esc, richText, shuffle } from './util.js';
import { catSvg, catSays, catLine } from './cat.js';
import { GAMES, LEVELS, makePool, gameAvailable, startGame } from './games.js';
import { unitItems } from './lessons.js';

const app = document.getElementById('app');
const $ = (sel, el = document) => el.querySelector(sel);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

let user = null;
let data = null; // { course, premium, whatsapp }
let daysAway = null; // Tage seit dem letzten Besuch (für Pashas Begrüssung)
let greeting = null; // Begrüssung bleibt während des Besuchs gleich

setLang(detectLang());
// Im Vorschau-Link ist das Mikrofon gesperrt: keine Sprechübungen.
if (backend.preview) store.noMic = true;

// ---------- Start

function boot() {
  splash();
  backend.onUser(async (u) => {
    user = u;
    if (!u) return authScreen();
    splash();
    try {
      store.bindUser(u.uid);
      const remote = await backend.loadProgress(u.uid);
      store.merge(remote);
      store.onChange((s) => backend.saveProgress(u.uid, s));
      setSound(store.get().settings.sound !== false);
      await handleCheckoutReturn();
      const linkUnlock = await unlockFromLink();
      data = await backend.getCourse();
      daysAway = store.visit();
      home();
      if (linkUnlock?.ok) toast(`${t('codeOk')} ${prettyName(linkUnlock.name)}! 🎉`, 5000);
      if (linkUnlock && !linkUnlock.ok) toast(t('codeWrong'), 6000);
    } catch (e) {
      console.error(e);
      app.innerHTML = `<div class="center-msg"><p>${t('offline')}</p><button class="btn primary" onclick="location.reload()">↻</button></div>`;
    }
  });
}

// Persönlicher Link: …/artifact/…#ANNA-MULLER-XXXX schaltet den Kurs direkt frei.
async function unlockFromLink() {
  if (!backend.preview) return null;
  let code = '';
  try { code = decodeURIComponent(location.hash.slice(1)); } catch {}
  if (!/^[A-Za-z0-9-]{12,}$/.test(code)) return null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  const r = await backend.unlock(code);
  return r ? { ok: true, name: r.unlockedFor } : { ok: false };
}

function splash() {
  app.innerHTML = `<div class="center-msg"><div class="logo-big">${logoMark(96)}</div><p>${t('loading')}</p></div>`;
}

// Zurück von Stripe: ?checkout=success / cancel
async function handleCheckoutReturn() {
  const p = new URLSearchParams(location.search);
  const status = p.get('checkout');
  if (!status) return;
  history.replaceState(null, '', location.pathname);
  if (status === 'cancel') return toast(t('payCancelled'));
  app.innerHTML = `<div class="center-msg"><div class="logo-big">💳</div><p>${t('payProcessing')}</p></div>`;
  // Der Webhook von Stripe braucht ein paar Sekunden.
  for (let i = 0; i < 12; i++) {
    const d = await backend.getCourse();
    if (d.premium) { toast(t('payDone')); return; }
    await new Promise((r) => setTimeout(r, 2500));
  }
  toast(t('payPending'), 8000);
}

function toast(msg, ms = 4000) {
  const el = h(`<div class="toast">${esc(msg)}</div>`);
  document.body.append(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms);
}

// ---------- Anmeldung

function langSwitch() {
  return `<div class="lang-switch">
    <button data-lang="en" class="${getLang() === 'en' ? 'on' : ''}">🇬🇧 English</button>
    <button data-lang="fr" class="${getLang() === 'fr' ? 'on' : ''}">🇫🇷 Français</button>
  </div>`;
}

function wireLang(el, rerender) {
  el.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => { setLang(b.dataset.lang); rerender(); }));
}

function authScreen(mode = 'signup') {
  app.innerHTML = '';
  const el = h(`
    <div class="auth">
      ${langSwitch()}
      <div class="hero">
        <div class="hero-emoji">${logoMark(120)}</div>
        <h1>${esc(CONFIG.appName)}</h1>
        <p>${t('tagline')}</p>
        <div class="hero-badges"><span>🎧</span><span>🎤</span><span>🖼️</span><span>🎮</span></div>
      </div>
      <form class="card form">
        <h2>${t(mode === 'signup' ? 'signup' : 'login')}</h2>
        <label>${t('email')}<input name="email" type="email" autocomplete="email" required></label>
        <label>${t('password')}<input name="password" type="password" minlength="6" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" required placeholder="${t('passwordHint')}"></label>
        <p class="error" hidden></p>
        <button class="btn primary" type="submit">${t(mode === 'signup' ? 'signup' : 'login')}</button>
        <div class="or"><span>${t('or')}</span></div>
        <button class="btn outline google" type="button">G&nbsp; ${t('google')}</button>
        ${mode === 'login' ? `<button class="link-btn forgot" type="button">${t('forgot')}</button>` : ''}
        <button class="link-btn switch" type="button">${t(mode === 'signup' ? 'haveAccount' : 'noAccount')}</button>
      </form>
    </div>`);
  app.append(el);
  wireLang(el, () => authScreen(mode));
  const form = $('form', el), err = $('.error', el);
  const fail = (e) => { console.warn(e); err.hidden = false; err.textContent = t('authError'); };
  form.onsubmit = async (e) => {
    e.preventDefault();
    err.hidden = true;
    const { email, password } = Object.fromEntries(new FormData(form));
    try {
      if (mode === 'signup') await backend.signUp(email, password);
      else await backend.signIn(email, password);
    } catch (e2) { fail(e2); }
  };
  $('.google', el).onclick = () => backend.google().catch(fail);
  $('.switch', el).onclick = () => authScreen(mode === 'signup' ? 'login' : 'signup');
  $('.forgot', el)?.addEventListener('click', async () => {
    const email = form.email.value;
    if (!email) return form.email.focus();
    try { await backend.resetPassword(email); toast(t('resetSent')); } catch (e2) { fail(e2); }
  });
}

// ---------- Untere Leiste: Lernen · Spiele · Profil

function tabbar(active) {
  const tab = (id, icon, key) => `<button data-tab="${id}" class="${active === id ? 'on' : ''}" ${active === id ? 'aria-current="page"' : ''}><span>${icon}</span>${t(key)}</button>`;
  return `<nav class="tabbar">${tab('learn', '📚', 'navLearn')}${tab('games', '🎮', 'navGames')}${tab('profile', '👤', 'navProfile')}</nav>`;
}

function wireTabs(el) {
  el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => {
    sfx.tap();
    ({ learn: home, games: gamesScreen, profile })[b.dataset.tab]();
    window.scrollTo(0, 0);
  }));
}

// ---------- Pasha auf der Startseite

function greetingCard() {
  const s = store.get();
  const total = data.course.units.length * LESSONS.length;
  if (!greeting) {
    if (!s.catIntro) { greeting = { mood: 'wave', text: catLine('catGreetFirst'), special: true }; store.setFlag('catIntro', true); }
    else if (data.premium && Object.keys(s.done).length >= total) greeting = { mood: 'cheer', text: catLine('catAllDone') };
    else if (daysAway !== null && daysAway >= 2) greeting = { mood: 'love', text: catLine('catGreetBack'), special: true };
    else greeting = { mood: pickMood(), text: catLine('catGreetDay') };
  }
  const askReminder = Object.keys(s.done).length >= 1 && !s.reminderAsked;
  const extra = askReminder
    ? `<span class="cat-rem">${esc(t('catReminder'))}</span>${reminderLink('btn-mini')}<button class="link-btn rem-later">${t('later')}</button>`
    : '';
  return `<section class="cat-card">${catSays(greeting.mood, greeting.text, 96, extra)}</section>`;
}

const pickMood = () => ['idle', 'happy', 'wave', 'love'][Math.floor(Math.random() * 4)];

// Kalender-Erinnerung alle 2 Tage (Google Kalender öffnet sich in einem neuen Tab).
// Echte Push-Nachrichten gehen auf claude.ai nicht, dafür braucht es einen eigenen Server.
function reminderLink(cls = '') {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(18, 0, 0, 0);
  const f = (x) => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, '0')}${String(x.getDate()).padStart(2, '0')}T${String(x.getHours()).padStart(2, '0')}${String(x.getMinutes()).padStart(2, '0')}00`;
  const end = new Date(d.getTime() + 15 * 60000);
  const url = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE',
    text: t('catReminderTitle'),
    details: `${t('catReminderText')} ${CONFIG.courseUrl || ''}`.trim(),
    dates: `${f(d)}/${f(end)}`,
    recur: 'RRULE:FREQ=DAILY;INTERVAL=2',
  });
  return `<a class="btn whatsapp cal ${cls}" target="_blank" rel="noopener" href="${esc(url)}">📅 ${t('catReminderBtn')}</a>`;
}

function wireReminder(el) {
  el.querySelectorAll('.cal').forEach((a) => a.addEventListener('click', () => store.setFlag('reminderAsked', true)));
  el.querySelector('.rem-later')?.addEventListener('click', () => { store.setFlag('reminderAsked', true); home(); });
}

// ---------- Lernpfad

const unlockAll = backend.demo && new URLSearchParams(location.search).has('unlock');

function lessonState(ui, li) {
  const u = data.course.units[ui];
  if (store.isDone(u.id, li)) return 'done';
  const paid = data.premium || (ui === 0 && li === 0);
  // Vorherige Lektion fertig?
  let prevDone = true;
  if (li > 0) prevDone = store.isDone(u.id, li - 1);
  else if (ui > 0) prevDone = store.isDone(data.course.units[ui - 1].id, LESSONS.length - 1);
  if (!paid) return prevDone ? 'pay' : 'locked';
  return prevDone || unlockAll || CONFIG.openAll ? 'open' : 'locked';
}

function home() {
  const s = store.get();
  const lang = getLang();
  app.innerHTML = '';
  const el = h(`
    <div class="home">
      <header class="topbar">
        <div class="brand">${logoMark(34)} <span>${esc(CONFIG.appName)}</span></div>
        <div class="chips">
          <span class="chip streak" title="${t('streak')}">🔥 ${store.currentStreak()}</span>
          <span class="chip xp">⭐ ${s.xp}</span>
        </div>
      </header>
      ${backend.demo && !backend.preview ? `<div class="demo-banner">${t('demoBanner')}</div>` : ''}
      ${backend.preview && data.whatsapp ? `
        <a class="wa-bar" target="_blank" rel="noopener" href="https://wa.me/${esc(data.whatsapp)}?text=${encodeURIComponent(t('whatsappHello'))}">
          <span class="wa-icon">💬</span>
          <span class="wa-text"><b>${t('waBarTitle')}</b><small>WhatsApp · +${esc(fmtPhone(data.whatsapp))}</small></span>
          <span class="wa-go">›</span>
        </a>` : ''}
      ${greetingCard()}
      <main class="path"></main>
      ${tabbar('learn')}
    </div>`);
  app.append(el);
  wireTabs(el);
  wireReminder(el);
  const path = $('.path', el);
  let currentFound = false;

  data.course.units.forEach((u, ui) => {
    const sec = h(`
      <section class="unit" style="--c:${u.color}">
        <div class="unit-head">
          <div>
            <small>${t('unit')} ${ui + 1} · A1</small>
            <h2>${esc(u.emoji)} ${esc(u.title[lang])}</h2>
            <p class="de-title">${esc(u.title.de)}</p>
          </div>
          ${u.tip ? `<button class="tip-btn" aria-label="${t('tip')}">💡</button>` : ''}
        </div>
        <div class="nodes"></div>
      </section>`);
    const nodes = $('.nodes', sec);
    LESSONS.forEach((L, li) => {
      const st = lessonState(ui, li);
      const isCurrent = !currentFound && (st === 'open' || st === 'pay');
      if (isCurrent) currentFound = true;
      const icon = st === 'done' ? '✓' : st === 'locked' ? '🔒' : st === 'pay' && !(ui === 0 && li === 0) ? '💎' : L.icon;
      const n = h(`
        <div class="node-wrap${isCurrent ? ' has-bubble' : ''}" style="--off:${[0, 1, 0, -1][li]}">
          ${isCurrent ? `<span class="bubble">${t('start')}</span>` : ''}
          <button class="node ${st}${isCurrent ? ' current' : ''}">${icon}</button>
          <span class="node-label">${t(L.title)}</span>
        </div>`);
      $('.node', n).onclick = () => openLesson(ui, li, st);
      nodes.append(n);
    });
    $('.tip-btn', sec)?.addEventListener('click', () => showTip(u));
    path.append(sec);
    if (ui === 0) path.append(practiceCards());
  });

  // Nach einer Pause oder beim ersten Besuch oben bleiben, damit man Pasha sieht. Danach zur aktuellen Lektion.
  if (greeting?.special && !greeting.seen) greeting.seen = true;
  else setTimeout(() => $('.node.current', el)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
}

function practiceCards() {
  const nMistakes = Object.keys(store.get().mistakes).length;
  const el = h(`
    <section class="practice">
      <h3>${t('practice')}</h3>
      <div class="practice-row">
        <button class="pcard review"><span class="pe">🔁</span><b>${t('review')}</b><small>${t('reviewSub')}</small>${nMistakes ? `<i class="count">${nMistakes}</i>` : ''}</button>
        <button class="pcard sprint"><span class="pe">🎮</span><b>${t('gamesTitle')}</b><small>${t('gamesSub')}</small></button>
      </div>
    </section>`);
  $('.review', el).onclick = startReview;
  $('.sprint', el).onclick = gamesScreen;
  return el;
}

function showTip(u) {
  const m = h(`
    <div class="modal-bg"><div class="modal tip" style="--c:${u.color}">
      <h3>💡 ${t('tip')} · ${esc(u.title[getLang()])}</h3>
      <div class="tip-text">${richText(u.tip[getLang()])}</div>
      <button class="btn primary">${t('continue')}</button>
    </div></div>`);
  $('.btn', m).onclick = () => m.remove();
  m.onclick = (e) => { if (e.target === m) m.remove(); };
  document.body.append(m);
}

function openLesson(ui, li, st) {
  sfx.tap();
  if (st === 'locked') return toast(t('locked'));
  if (st === 'pay' && !(ui === 0 && li === 0)) return paywall();
  const u = data.course.units[ui];
  const opts = { lang: getLang(), speakOn: store.speakEnabled() };
  const exercises = buildLesson(data.course, ui, li, opts);
  warnNoVoice();
  runLesson(app, exercises, {
    lang: getLang(),
    debug: backend.demo && !backend.preview,
    hooks: playerHooks(),
    afterResults: ({ acc }) => progressButton({ ui, li, acc }),
    onDone: ({ xp }) => {
      store.finishLesson(u.id, li, xp);
      const keys = exercises.flatMap((e) => (e.item ? [e.item.key] : (e.items || []).map((i) => i.key)));
      store.markLearned([...new Set(keys)]);
    },
    onExit: () => {
      // Nach der Gratis-Lektion direkt zur Bezahlseite
      if (!data.premium && ui === 0 && li === 0 && store.isDone(u.id, 0)) { home(); paywall(); } else home();
    },
  });
}

function playerHooks() {
  return {
    mistake: (ex) => ex.item && store.addMistake(ex.item.key),
    correct: (ex) => ex._review && ex.item && store.clearMistake(ex.item.key),
    pauseSpeaking: () => { store.pauseSpeaking(15); toast(t('speakOff')); },
  };
}

let voiceWarned = false;
function warnNoVoice() {
  if (voiceWarned) return;
  voiceWarned = true;
  setTimeout(() => { if (!hasGermanVoice()) toast(t('noVoice'), 6000); }, 1200);
}

const availableItems = () => allItems(data.course);

function startReview() {
  const map = availableItems();
  const s = store.get();
  let keys = Object.keys(s.mistakes).filter((k) => map.has(k));
  keys.sort((a, b) => s.mistakes[b] - s.mistakes[a]);
  keys = keys.slice(0, 10);
  // Zu wenige Fehler: mit gelernten Wörtern auffüllen
  if (keys.length < 6) {
    const learned = shuffle(Object.keys(s.learned).filter((k) => map.has(k) && !keys.includes(k)));
    keys.push(...learned.slice(0, 8 - keys.length));
  }
  if (!keys.length) return toast(t('reviewEmpty'));
  const items = shuffle(keys.map((k) => map.get(k)));
  const exercises = buildReview(data.course, items, { lang: getLang(), speakOn: store.speakEnabled() }).map((e) => ({ ...e, _review: true }));
  runLesson(app, exercises, {
    lang: getLang(),
    debug: backend.demo && !backend.preview,
    hooks: playerHooks(),
    xpFor: (acc) => 8 + (acc === 100 ? 4 : 0),
    onDone: ({ xp }) => store.addXp(xp),
    onExit: home,
  });
}

// ---------- Fortschritt per WhatsApp an die Lehrperson (nur im Link mit Freischalt-Code)

const LESSON_DE = ['Neue Wörter 1', 'Neue Wörter 2', 'Sätze', 'Hören und Sprechen'];

// Die Nachricht ist auf Deutsch, damit die Lehrperson sie lesen kann.
function progressMessage(last) {
  const s = store.get();
  const total = data.course.units.length * LESSONS.length;
  const done = Object.keys(s.done).length;
  const name = data.unlockedFor ? prettyName(data.unlockedFor) : CONFIG.openAll ? 'Offener Link (ohne Code)' : 'Gratis-Lektion (noch kein Code)';
  const lines = [
    '📊 Hallo Deutsch! – mein Fortschritt',
    `👤 ${name}`,
    `📚 Lektionen fertig: ${done} von ${total}`,
  ];
  if (last) {
    const u = data.course.units[last.ui];
    lines.push(`✅ Gerade fertig: Einheit ${last.ui + 1} „${u.title.de}“ – ${LESSON_DE[last.li]} (${last.acc} % richtig)`);
  }
  const streak = store.currentStreak();
  lines.push(`⭐ ${s.xp} XP · 🔥 ${streak} ${streak === 1 ? 'Tag' : 'Tage'} in Folge`);
  const nMistakes = Object.keys(s.mistakes).length;
  if (nMistakes) lines.push(`🔁 Wörter zum Wiederholen: ${nMistakes}`);
  lines.push(`🌐 Sprache: ${getLang() === 'fr' ? 'Französisch' : 'Englisch'}`);
  return lines.join('\n');
}

function progressButton(last) {
  if (!backend.preview || !data.whatsapp) return '';
  const href = `https://wa.me/${esc(data.whatsapp)}?text=${encodeURIComponent(progressMessage(last))}`;
  return `
    <div class="send-progress">
      <p>${t('sendProgressHint')}</p>
      <a class="btn whatsapp" target="_blank" rel="noopener" href="${href}">📊 ${t('sendProgress')}</a>
    </div>`;
}

// ---------- Spiele

// Wörter aus allen Einheiten bis zur aktuellen (die Person kennt sie schon oder lernt sie gerade)
function gamePool() {
  const units = data.course.units;
  let maxU = 0;
  units.forEach((u, ui) => { if (LESSONS.some((_, li) => store.isDone(u.id, li))) maxU = Math.max(maxU, ui); });
  if (CONFIG.openAll) maxU = units.length - 1; // Offener Link: alle Wörter
  const words = [], sentences = [];
  units.slice(0, maxU + 1).forEach((u) => { const it = unitItems(u); words.push(...it.words); sentences.push(...it.sentences); });
  return makePool(words, sentences);
}

function gamesScreen() {
  const pool = gamePool();
  app.innerHTML = '';
  const el = h(`
    <div class="games-page">
      <header class="topbar"><div class="brand">${logoMark(34)} <span>${t('gamesTitle')}</span></div>
        <div class="chips"><span class="chip xp">⭐ ${store.get().xp}</span></div></header>
      <section class="cat-card">${catSays('cheer', t('gamesSub'), 84)}</section>
      <main class="games-grid"></main>
      ${tabbar('games')}
    </div>`);
  app.append(el);
  wireTabs(el);
  const grid = $('.games-grid', el);
  GAMES.forEach((g) => {
    const ok = gameAvailable(g, pool);
    const card = h(`
      <article class="game-card${ok ? '' : ' locked'}" style="--gc:${g.color}">
        <div class="gc-head"><span class="gc-icon">${g.icon}</span><div><h3>${t('g_' + g.id)}</h3><p>${t('g_' + g.id + '_d')}</p></div></div>
        ${ok ? `<div class="gc-levels">${LEVELS.map((lv) => `
          <button class="lv" data-lv="${lv}"><b>${t({ easy: 'levelEasy', medium: 'levelMedium', hard: 'levelHard' }[lv])}</b><small>${store.bestGame(g.id, lv) ? `🏆 ${store.bestGame(g.id, lv)}` : '–'}</small></button>`).join('')}</div>`
        : `<button class="gc-lock">${data.premium ? '🔒' : '💎'} ${t(data.premium ? 'gameNeedWords' : 'gameLocked')}</button>`}
      </article>`);
    card.querySelectorAll('[data-lv]').forEach((b) => (b.onclick = () => {
      sfx.tap();
      warnNoVoice();
      startGame(app, g.id, b.dataset.lv, {
        pool, lang: getLang(),
        onDone: ({ xp }) => store.addXp(xp),
        onExit: gamesScreen,
      });
    }));
    card.querySelector('.gc-lock')?.addEventListener('click', () => (data.premium ? toast(t('gameNeedWords')) : paywall()));
    grid.append(card);
  });
}

// ---------- Bezahlseite

function paywall() {
  if (backend.preview) return previewEnd();
  const m = h(`
    <div class="modal-bg"><div class="modal paywall">
      <div class="pw-emoji">💎</div>
      <h3>${t('paywallTitle')}</h3>
      <p>${t('paywallText')}</p>
      <div class="price"><b>${esc(CONFIG.priceLabel)}</b> <span>${t('perWeek')}</span></div>
      <ul class="feats">
        <li>📚 ${t('feat1')}</li>
        <li>🎤 ${t('feat2')}</li>
        <li>💬 ${t('feat3')}</li>
        <li>✅ ${t('feat4')}</li>
      </ul>
      <button class="btn primary buy">${t('subscribe')}</button>
      <button class="link-btn later">${t('later')}</button>
    </div></div>`);
  $('.later', m).onclick = () => m.remove();
  $('.buy', m).onclick = async (e) => {
    e.target.disabled = true;
    e.target.textContent = t('loading');
    try { await backend.startCheckout(); } catch (err) {
      console.error(err);
      toast(t('payError'));
      e.target.disabled = false;
      e.target.textContent = t('subscribe');
    }
  };
  document.body.append(m);
}

// Link mit Freischalt-Code: Nach der Gratis-Lektion bezahlt man direkt bei dir
// und bekommt einen Code, der den ganzen Kurs öffnet.
function codeForm() {
  return `
    <form class="code-form">
      <label for="unlock-code">${t('codeLabel')}</label>
      <input id="unlock-code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ANNA-…">
      <p class="error" hidden>${t('codeWrong')}</p>
      <button class="btn primary" type="submit">🔓 ${t('codeButton')}</button>
    </form>`;
}

function wireCodeForm(el, onDone) {
  const form = $('.code-form', el), err = $('.error', form), btn = $('button', form);
  form.onsubmit = async (e) => {
    e.preventDefault();
    err.hidden = true;
    btn.disabled = true;
    const r = await backend.unlock(form.code.value);
    btn.disabled = false;
    if (!r) { err.hidden = false; sfx.wrong(); return; }
    data = r;
    sfx.done();
    onDone();
    home();
    toast(`${t('codeOk')} ${prettyName(r.unlockedFor)}! 🎉`, 5000);
  };
}

const fmtPhone = (d) => d.replace(/^(\d{2})(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5 $6');

const prettyName = (n) => String(n || '').toLowerCase().replace(/(^|-)([a-z])/g, (m, a, b) => (a ? ' ' : '') + b.toUpperCase());

function previewEnd() {
  const m = h(`
    <div class="modal-bg"><div class="modal paywall">
      <div class="pw-emoji">🎉</div>
      <h3>${t('previewTitle')}</h3>
      <p>${t('previewText')}</p>
      ${CONFIG.offerText ? `<div class="offer">${esc(CONFIG.offerText)}</div>` : ''}
      <ul class="feats">
        <li>📚 ${t('feat1')}</li>
        <li>🎧 ${t('featPreview2')}</li>
        <li>💬 ${t('feat3')}</li>
        <li>✅ ${t('featOnce')}</li>
      </ul>
      ${data.whatsapp ? `
        <a class="btn whatsapp" target="_blank" rel="noopener" href="https://wa.me/${esc(data.whatsapp)}?text=${encodeURIComponent(t('whatsappBuy'))}">💬 ${t('whatsappWrite')}</a>
        <p class="wa-number">WhatsApp: <b>+${esc(fmtPhone(data.whatsapp))}</b></p>` : ''}
      <ol class="steps">
        <li>${t(data.whatsapp ? 'step1Wa' : 'step1')}</li>
        <li>${t('step2')}</li>
        <li>${t('step3')}</li>
      </ol>
      ${codeForm()}
      <button class="link-btn later">${t('later')}</button>
    </div></div>`);
  $('.later', m).onclick = () => m.remove();
  wireCodeForm(m, () => m.remove());
  document.body.append(m);
}

// ---------- Profil

function profile() {
  const s = store.get();
  const lessons = Object.keys(s.done).length;
  const words = Object.keys(s.learned).filter((k) => k.includes(':w')).length;
  app.innerHTML = '';
  const el = h(`
    <div class="profile">
      <header class="topbar"><div class="brand">${logoMark(34)} <span>${t('profile')}</span></div><span></span></header>
      <div class="card who">
        <div class="avatar-big">👤</div>
        <div><b>${esc(backend.preview ? (data.premium ? (data.unlockedFor ? prettyName(data.unlockedFor) : t('premium')) : t('free')) : user?.email || '')}</b><br><span class="plan ${data.premium ? 'pro' : ''}" ${backend.preview ? 'hidden' : ''}>${data.premium ? `💎 ${t('premium')}` : t('free')}</span></div>
      </div>
      <div class="stat-grid">
        <div class="stat"><b>🔥 ${store.currentStreak()}</b><span>${t('streak')}</span></div>
        <div class="stat"><b>⭐ ${s.xp}</b><span>${t('xp')}</span></div>
        <div class="stat"><b>${lessons}</b><span>${t('lessonsDone')}</span></div>
        <div class="stat"><b>${words}</b><span>${t('wordsLearned')}</span></div>
      </div>
      ${backend.preview && !CONFIG.openAll ? (data.premium
        ? `<div class="card unlocked">🔓 ${t('unlockedFor')} <b>${esc(prettyName(data.unlockedFor))}</b></div>`
        : `<div class="card">${codeForm()}</div>`) : ''}
      ${progressButton(null)}
      ${(data.premium || backend.preview) && data.whatsapp ? `<a class="btn whatsapp" target="_blank" rel="noopener" href="https://wa.me/${esc(data.whatsapp)}?text=${encodeURIComponent(t('whatsappText'))}">💬 ${t('whatsapp')}</a>` : ''}
      <div class="card cat-card rem-card">${catSays('sleepy', t('catReminder'), 84, `${reminderLink()}<small class="rem-note">${esc(t('catReminderNote'))}</small>`)}</div>
      <div class="card settings">
        <h3>${t('settings')}</h3>
        <div class="row"><span>${t('uiLang')}</span>${langSwitch()}</div>
        <label class="row"><span>${t('sound')}</span><input type="checkbox" class="toggle" data-set="sound" ${s.settings.sound !== false ? 'checked' : ''}></label>
        <label class="row" ${backend.preview ? 'hidden' : ''}><span>${t('speaking')}</span><input type="checkbox" class="toggle" data-set="speak" ${s.settings.speak !== false ? 'checked' : ''}></label>
      </div>
      ${!backend.demo ? (data.premium
        ? `<button class="btn outline portal">${t('manageSub')}</button>`
        : `<button class="btn primary upgrade">💎 ${t('subscribe')} – ${esc(CONFIG.priceLabel)} ${t('perWeek')}</button>`) : ''}
      ${!backend.demo ? `<button class="btn ghost-red logout">${t('logout')}</button>` : ''}
      ${backend.demo ? `<button class="btn ghost-red restart">↺ ${t('restart')}</button>` : ''}
      ${tabbar('profile')}
    </div>`);
  app.append(el);
  wireTabs(el);
  wireReminder(el);
  if ($('.code-form', el)) wireCodeForm(el, () => {});
  wireLang(el, profile);
  el.querySelectorAll('[data-set]').forEach((c) => (c.onchange = () => {
    store.setSetting(c.dataset.set, c.checked);
    if (c.dataset.set === 'sound') setSound(c.checked);
    if (c.dataset.set === 'speak' && c.checked) store.get().speakOffUntil = 0;
  }));
  $('.portal', el)?.addEventListener('click', () => backend.openPortal().catch(() => toast(t('payError'))));
  $('.upgrade', el)?.addEventListener('click', paywall);
  $('.logout', el)?.addEventListener('click', async () => { store.reset(); await backend.signOut(); });
  $('.restart', el)?.addEventListener('click', confirmRestart);
}

// Alles löschen und wie beim ersten Öffnen beginnen (Fortschritt, Fehler, Punkte, Code).
function confirmRestart() {
  const m = h(`
    <div class="modal-bg"><div class="modal">
      <h3>${t('restartTitle')}</h3><p>${t('restartText')}</p>
      <button class="btn primary stay">${t('quitNo')}</button>
      <button class="btn ghost-red go">${t('restartYes')}</button>
    </div></div>`);
  $('.stay', m).onclick = () => m.remove();
  $('.go', m).onclick = async () => {
    m.remove();
    store.reset();
    store.bindUser(user?.uid);
    greeting = null;
    daysAway = null;
    try { localStorage.removeItem('hd-code'); } catch {}
    data = await backend.getCourse();
    home();
    toast(t('restartDone'));
  };
  document.body.append(m);
}

boot();
