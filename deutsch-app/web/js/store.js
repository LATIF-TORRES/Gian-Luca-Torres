// Fortschritt: XP, Tage in Folge, erledigte Lektionen, Fehler, gelernte Wörter.
// Wird im Browser gespeichert und (falls angemeldet) mit Firestore synchronisiert.

import { today } from './util.js';

const KEY = 'hd-progress';

const empty = () => ({
  xp: 0,
  streak: 0,
  lastDay: null,
  done: {},       // "u01-0": Anzahl Durchgänge
  mistakes: {},   // "u01:w3": Anzahl
  learned: {},    // "u01:w3": true
  settings: { sound: true, speak: true },
  speakOffUntil: 0,
  updatedAt: 0,
});

let state = load();
let onChange = () => {};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {}
  return empty();
}

function save() {
  state.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  onChange(state);
}

export const store = {
  get: () => state,
  onChange(fn) { onChange = fn; },

  // Fortschritt vom Server übernehmen (der neuere gewinnt, erledigte Lektionen werden zusammengeführt).
  merge(remote) {
    if (!remote) return;
    const newer = (remote.updatedAt || 0) > (state.updatedAt || 0) ? remote : state;
    state = {
      ...empty(),
      ...newer,
      xp: Math.max(remote.xp || 0, state.xp || 0),
      done: { ...(remote.done || {}), ...state.done },
      learned: { ...(remote.learned || {}), ...state.learned },
      settings: { ...empty().settings, ...(newer.settings || {}) },
    };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  },

  // Anderer Benutzer auf demselben Gerät: lokalen Fortschritt nicht vermischen.
  bindUser(uid) {
    if (state.uid && state.uid !== uid) state = empty();
    state.uid = uid;
  },

  reset() {
    state = empty();
    try { localStorage.removeItem(KEY); } catch {}
  },

  isDone: (unitId, li) => !!state.done[`${unitId}-${li}`],

  finishLesson(unitId, li, xp) {
    const k = `${unitId}-${li}`;
    state.done[k] = (state.done[k] || 0) + 1;
    this.addXp(xp);
  },

  addXp(xp) {
    state.xp += xp;
    const d = today();
    if (state.lastDay !== d) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yd = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      state.streak = state.lastDay === yd ? state.streak + 1 : 1;
      state.lastDay = d;
    }
    save();
  },

  // Serie ist verloren, wenn gestern nichts gemacht wurde.
  currentStreak() {
    if (!state.lastDay) return 0;
    const diff = (new Date(today()) - new Date(state.lastDay)) / 86400000;
    return diff <= 1 ? state.streak : 0;
  },

  markLearned(keys) {
    keys.forEach((k) => (state.learned[k] = true));
    save();
  },

  addMistake(key) {
    state.mistakes[key] = (state.mistakes[key] || 0) + 1;
    save();
  },

  clearMistake(key) {
    if (state.mistakes[key]) {
      delete state.mistakes[key];
      save();
    }
  },

  setSetting(k, v) {
    state.settings[k] = v;
    save();
  },

  speakEnabled() {
    return state.settings.speak !== false && Date.now() > (state.speakOffUntil || 0);
  },

  pauseSpeaking(minutes = 15) {
    state.speakOffUntil = Date.now() + minutes * 60000;
    save();
  },
};
