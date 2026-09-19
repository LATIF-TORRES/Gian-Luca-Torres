import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, initializeFirestore } from 'firebase/firestore';

// Web counterpart to firebase.ts. On web, Metro resolves 'firebase/auth' via the
// "browser" export condition, which doesn't include getReactNativePersistence (that only
// exists in the React Native build) - calling it there throws "is not a function" at
// runtime. Plain getAuth() is the standard web approach and already persists sessions to
// the browser's indexedDB/localStorage automatically.
//
// Firestore's default WebChannel/streaming transport gets silently blocked on some
// networks and carriers (surfaced as "Failed to get document because the client is
// offline", even with a working internet connection) - experimentalAutoDetectLongPolling
// makes the SDK detect that and fall back to plain long-polling, which is Firebase's own
// documented fix for this exact error.
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
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
}

export { app, auth, db };
