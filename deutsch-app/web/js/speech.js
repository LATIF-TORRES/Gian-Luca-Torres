// Vorlesen (Text-to-Speech) und Spracherkennung – beides direkt im Browser, ohne Kosten.

let voice = null;
let voicesReady = false;

function chooseVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('de'));
  if (!voices.length) return;
  voicesReady = true;
  const score = (v) => {
    const n = v.name.toLowerCase();
    let s = 0;
    if (v.lang === 'de-DE') s += 3;
    if (/natural|neural|premium|enhanced|online/.test(n)) s += 5;
    if (/google/.test(n)) s += 4;
    if (/anna|helena|petra|markus|katja|conrad|vicki/.test(n)) s += 2;
    return s;
  };
  voice = voices.sort((a, b) => score(b) - score(a))[0];
}

if ('speechSynthesis' in window) {
  chooseVoice();
  speechSynthesis.addEventListener?.('voiceschanged', chooseVoice);
}

export function hasGermanVoice() {
  chooseVoice();
  return voicesReady;
}

export function speak(text, { slow = false } = {}) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      if (voice) u.voice = voice;
      u.rate = slow ? 0.6 : 0.92;
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
      setTimeout(resolve, 8000);
    } catch {
      resolve();
    }
  });
}

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function canListen() {
  return !!Recognition;
}

let active = null;

// Hört einmal zu und liefert eine Liste möglicher Texte.
export function listen() {
  return new Promise((resolve, reject) => {
    if (!Recognition) return reject(new Error('unsupported'));
    if (active) try { active.abort(); } catch {}
    try { speechSynthesis.cancel(); } catch {}
    const rec = new Recognition();
    active = rec;
    rec.lang = 'de-DE';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let done = false;
    const finish = (fn, v) => { if (!done) { done = true; active = null; fn(v); } };
    rec.onresult = (e) => {
      const alts = [];
      for (const res of e.results) for (const a of res) alts.push(a.transcript);
      finish(resolve, alts);
    };
    rec.onerror = (e) => finish(reject, new Error(e.error || 'error'));
    rec.onend = () => finish(resolve, []);
    try { rec.start(); } catch (err) { finish(reject, err); }
    setTimeout(() => { try { rec.stop(); } catch {} }, 7000);
  });
}

export function stopListening() {
  if (active) try { active.abort(); } catch {}
  active = null;
}
