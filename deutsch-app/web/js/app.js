// Hauptprogramm: Anmeldung, Lernpfad, Bezahlseite, Profil.

import { CONFIG } from './config.js';
import { t, setLang, getLang, detectLang } from './i18n.js';
import { backend } from './backend.js';
import { store } from './store.js';
import { LESSONS, buildLesson, buildReview, allItems } from './lessons.js';
import { runLesson, runSprint } from './player.js';
import { setSound, sfx } from './fx.js';
import { hasGermanVoice } from './speech.js';
import { esc, richText, shuffle } from './util.js';

const app = document.getElementById('app');
const $ = (sel, el = document) => el.querySelector(sel);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

let user = null;
let data = null; // { course, premium, whatsapp }

setLang(detectLang());

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
      data = await backend.getCourse();
      home();
    } catch (e) {
      console.error(e);
      app.innerHTML = `<div class="center-msg"><p>${t('offline')}</p><button class="btn primary" onclick="location.reload()">↻</button></div>`;
    }
  });
}

function splash() {
  app.innerHTML = `<div class="center-msg"><div class="logo-big">🇩🇪</div><p>${t('loading')}</p></div>`;
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
        <div class="hero-emoji">🇩🇪</div>
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
  return prevDone || unlockAll ? 'open' : 'locked';
}

function home() {
  const s = store.get();
  const lang = getLang();
  app.innerHTML = '';
  const el = h(`
    <div class="home">
      <header class="topbar">
        <div class="brand">🇩🇪 <span>${esc(CONFIG.appName)}</span></div>
        <div class="chips">
          <span class="chip streak" title="${t('streak')}">🔥 ${store.currentStreak()}</span>
          <span class="chip xp">⭐ ${s.xp}</span>
          <button class="chip avatar" aria-label="${t('profile')}">👤</button>
        </div>
      </header>
      ${backend.demo ? `<div class="demo-banner">${t('demoBanner')}</div>` : ''}
      <main class="path"></main>
    </div>`);
  app.append(el);
  $('.avatar', el).onclick = profile;
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

  setTimeout(() => $('.node.current', el)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
}

function practiceCards() {
  const nMistakes = Object.keys(store.get().mistakes).length;
  const el = h(`
    <section class="practice">
      <h3>${t('practice')}</h3>
      <div class="practice-row">
        <button class="pcard review"><span class="pe">🔁</span><b>${t('review')}</b><small>${t('reviewSub')}</small>${nMistakes ? `<i class="count">${nMistakes}</i>` : ''}</button>
        <button class="pcard sprint"><span class="pe">⚡</span><b>${t('sprint')}</b><small>${t('sprintSub')}</small></button>
      </div>
    </section>`);
  $('.review', el).onclick = startReview;
  $('.sprint', el).onclick = startSprint;
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
    debug: backend.demo,
    hooks: playerHooks(),
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
    debug: backend.demo,
    hooks: playerHooks(),
    xpFor: (acc) => 8 + (acc === 100 ? 4 : 0),
    onDone: ({ xp }) => store.addXp(xp),
    onExit: home,
  });
}

function startSprint() {
  const map = availableItems();
  const words = Object.keys(store.get().learned).map((k) => map.get(k)).filter((i) => i && i.kind === 'w');
  if (words.length < 5) return toast(t('sprintEmpty'));
  runSprint(app, words, { lang: getLang(), onDone: ({ xp }) => xp && store.addXp(xp), onExit: home });
}

// ---------- Bezahlseite

function paywall() {
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

// ---------- Profil

function profile() {
  const s = store.get();
  const lessons = Object.keys(s.done).length;
  const words = Object.keys(s.learned).filter((k) => k.includes(':w')).length;
  app.innerHTML = '';
  const el = h(`
    <div class="profile">
      <header class="topbar"><button class="icon-btn back" aria-label="${t('back')}">←</button><div class="brand">${t('profile')}</div><span></span></header>
      <div class="card who">
        <div class="avatar-big">👤</div>
        <div><b>${esc(user?.email || '')}</b><br><span class="plan ${data.premium ? 'pro' : ''}">${data.premium ? `💎 ${t('premium')}` : t('free')}</span></div>
      </div>
      <div class="stat-grid">
        <div class="stat"><b>🔥 ${store.currentStreak()}</b><span>${t('streak')}</span></div>
        <div class="stat"><b>⭐ ${s.xp}</b><span>${t('xp')}</span></div>
        <div class="stat"><b>${lessons}</b><span>${t('lessonsDone')}</span></div>
        <div class="stat"><b>${words}</b><span>${t('wordsLearned')}</span></div>
      </div>
      ${data.premium && data.whatsapp ? `<a class="btn whatsapp" target="_blank" rel="noopener" href="https://wa.me/${esc(data.whatsapp)}?text=${encodeURIComponent(t('whatsappText'))}">💬 ${t('whatsapp')}</a>` : ''}
      <div class="card settings">
        <h3>${t('settings')}</h3>
        <div class="row"><span>${t('uiLang')}</span>${langSwitch()}</div>
        <label class="row"><span>${t('sound')}</span><input type="checkbox" class="toggle" data-set="sound" ${s.settings.sound !== false ? 'checked' : ''}></label>
        <label class="row"><span>${t('speaking')}</span><input type="checkbox" class="toggle" data-set="speak" ${s.settings.speak !== false ? 'checked' : ''}></label>
      </div>
      ${!backend.demo ? (data.premium
        ? `<button class="btn outline portal">${t('manageSub')}</button>`
        : `<button class="btn primary upgrade">💎 ${t('subscribe')} – ${esc(CONFIG.priceLabel)} ${t('perWeek')}</button>`) : ''}
      ${!backend.demo ? `<button class="btn ghost-red logout">${t('logout')}</button>` : ''}
    </div>`);
  app.append(el);
  $('.back', el).onclick = home;
  wireLang(el, profile);
  el.querySelectorAll('[data-set]').forEach((c) => (c.onchange = () => {
    store.setSetting(c.dataset.set, c.checked);
    if (c.dataset.set === 'sound') setSound(c.checked);
    if (c.dataset.set === 'speak' && c.checked) store.get().speakOffUntil = 0;
  }));
  $('.portal', el)?.addEventListener('click', () => backend.openPortal().catch(() => toast(t('payError'))));
  $('.upgrade', el)?.addEventListener('click', paywall);
  $('.logout', el)?.addEventListener('click', async () => { store.reset(); await backend.signOut(); });
}

boot();
