import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import {
  type Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';

// Web counterpart to firebase.ts. On web, Metro resolves 'firebase/auth' via the
// "browser" export condition, which doesn't include getReactNativePersistence (that only
// exists in the React Native build) - calling it there throws "is not a function" at
// runtime. Plain getAuth() is the standard web approach and already persists sessions to
// the browser's indexedDB/localStorage automatically.
//
// Firestore's default WebChannel/streaming transport gets blocked on some networks
// (surfaced as "Failed to get document because the client is offline"). Auto-detecting
// long-polling didn't clear it up for this project, so we force long-polling outright
// (skips the failing detection probe) and add a persistent IndexedDB cache so reads that
// *have* been fetched before still work while genuinely offline.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
  });
}

export { app, auth, db };
