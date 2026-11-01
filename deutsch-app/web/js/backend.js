// Verbindung zu Firebase (Login, Fortschritt, Kurs, Zahlung).
// Ohne Firebase-Konfiguration: Demo-Modus mit lokalem Kurs.

import { CONFIG } from './config.js';

const SDK = 'https://www.gstatic.com/firebasejs/12.19.0';
export const PREVIEW = !!CONFIG.preview;
export const DEMO = PREVIEW || !CONFIG.firebase.apiKey;

const contactWa = () => String(CONFIG.contactWhatsapp || '').replace(/\D/g, '');

let fb = null; // { auth, db, fns, mods }

async function init() {
  if (fb || DEMO) return fb;
  const [appM, authM, dbM, fnM] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
    import(`${SDK}/firebase-functions.js`),
  ]);
  const app = appM.initializeApp(CONFIG.firebase);
  fb = {
    auth: authM.getAuth(app),
    db: dbM.getFirestore(app),
    fns: fnM.getFunctions(app, CONFIG.functionsRegion),
    authM, dbM, fnM,
  };
  return fb;
}

export const backend = {
  demo: DEMO,
  preview: PREVIEW,

  // Ruft cb(user | null) auf, sobald klar ist, ob jemand angemeldet ist.
  async onUser(cb) {
    if (DEMO) return cb({ uid: 'demo', email: 'demo@local' });
    const f = await init();
    f.authM.onAuthStateChanged(f.auth, cb);
  },

  async signUp(email, password) {
    const f = await init();
    return f.authM.createUserWithEmailAndPassword(f.auth, email, password);
  },

  async signIn(email, password) {
    const f = await init();
    return f.authM.signInWithEmailAndPassword(f.auth, email, password);
  },

  async google() {
    const f = await init();
    return f.authM.signInWithPopup(f.auth, new f.authM.GoogleAuthProvider());
  },

  async resetPassword(email) {
    const f = await init();
    return f.authM.sendPasswordResetEmail(f.auth, email);
  },

  async signOut() {
    if (DEMO) return;
    const f = await init();
    return f.authM.signOut(f.auth);
  },

  // Kurs laden. Zahlende bekommen alles, alle anderen nur die Gratis-Lektion.
  async getCourse() {
    if (PREVIEW) {
      // Mit gespeichertem Freischalt-Code: ganzer Kurs (entschlüsselt). Sonst nur die Gratis-Lektion.
      let code = null;
      try { code = localStorage.getItem('hd-code'); } catch {}
      if (code) {
        const r = await this.unlock(code, false);
        if (r) return r;
      }
      const { PREVIEW_COURSE } = await import('./course-preview.js');
      return { course: PREVIEW_COURSE, premium: false, whatsapp: contactWa() };
    }
    if (DEMO) {
      const { COURSE } = await import('../../functions/content/course.js');
      return { course: COURSE, premium: true, whatsapp: '' };
    }
    const f = await init();
    const res = await f.fnM.httpsCallable(f.fns, 'getCourse')();
    return res.data;
  },

  // Prüft einen Freischalt-Code. Gibt { course, premium, unlockedFor } zurück oder null.
  async unlock(code, save = true) {
    const [{ openCourse }, { LOCKED_COURSE }] = await Promise.all([import('./unlock.js'), import('./course-locked.js')]);
    const r = await openCourse(code, LOCKED_COURSE);
    if (!r) return null;
    if (save) try { localStorage.setItem('hd-code', code.trim()); } catch {}
    return { course: r.course, premium: true, whatsapp: contactWa(), unlockedFor: r.name };
  },

  async startCheckout() {
    const f = await init();
    const res = await f.fnM.httpsCallable(f.fns, 'createCheckout')({ origin: location.origin + location.pathname });
    location.href = res.data.url;
  },

  async openPortal() {
    const f = await init();
    const res = await f.fnM.httpsCallable(f.fns, 'createPortal')({ origin: location.origin + location.pathname });
    location.href = res.data.url;
  },

  async loadProgress(uid) {
    if (DEMO) return null;
    const f = await init();
    const snap = await f.dbM.getDoc(f.dbM.doc(f.db, 'users', uid));
    return snap.exists() ? snap.data().progress || null : null;
  },

  _timer: null,
  saveProgress(uid, progress) {
    if (DEMO || !uid) return;
    clearTimeout(this._timer);
    this._timer = setTimeout(async () => {
      try {
        const f = await init();
        await f.dbM.setDoc(f.dbM.doc(f.db, 'users', uid), { progress }, { merge: true });
      } catch (e) {
        console.warn('Fortschritt nicht gespeichert', e);
      }
    }, 1500);
  },
};
