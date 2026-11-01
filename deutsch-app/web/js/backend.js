// Verbindung zu Firebase (Login, Fortschritt, Kurs, Zahlung).
// Ohne Firebase-Konfiguration: Demo-Modus mit lokalem Kurs.

import { CONFIG } from './config.js';

const SDK = 'https://www.gstatic.com/firebasejs/12.19.0';
export const DEMO = !CONFIG.firebase.apiKey;

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
    if (DEMO) {
      const { COURSE } = await import('../../functions/content/course.js');
      return { course: COURSE, premium: true, whatsapp: '' };
    }
    const f = await init();
    const res = await f.fnM.httpsCallable(f.fns, 'getCourse')();
    return res.data;
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
