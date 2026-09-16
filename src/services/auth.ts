import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile } from '../types';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_DOMAIN = 'players.padelarena.app';

function assertConfigured() {
  if (!auth || !db) {
    throw new Error(
      'Firebase ist noch nicht konfiguriert. Bitte lege ein Firebase-Projekt an und trage die Zugangsdaten in die .env-Datei ein (siehe .env.example).'
    );
  }
}

function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@${EMAIL_DOMAIN}`;
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_REGEX.test(username)) {
    return 'Benutzername muss 3-20 Zeichen lang sein (Buchstaben, Zahlen, _).';
  }
  return null;
}

export function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Dieser Benutzername ist bereits vergeben.';
    case 'auth/invalid-email':
      return 'Ungültiger Benutzername.';
    case 'auth/weak-password':
      return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Benutzername oder Passwort ist falsch.';
    case 'auth/too-many-requests':
      return 'Zu viele Versuche. Bitte warte kurz und versuche es erneut.';
    default:
      return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';
  }
}

const AVATAR_COLORS = ['#FF6A3D', '#3DDC97', '#C6F135', '#FFD54A', '#5AC8FA', '#FF5470'];

export async function registerWithUsername(username: string, password: string): Promise<User> {
  assertConfigured();
  const usernameLower = username.toLowerCase();
  const usernameRef = doc(db!, 'usernames', usernameLower);
  const existing = await getDoc(usernameRef);
  if (existing.exists()) {
    throw new Error('Dieser Benutzername ist bereits vergeben.');
  }

  const credential = await createUserWithEmailAndPassword(auth!, usernameToEmail(username), password);
  await updateProfile(credential.user, { displayName: username });

  const profile: UserProfile = {
    uid: credential.user.uid,
    username,
    usernameLower,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    avatarUrl: null,
    createdAt: Date.now(),
    stats: { tournamentsPlayed: 0, tournamentsWon: 0, matchesWon: 0, matchesLost: 0 },
  };

  await setDoc(usernameRef, { uid: credential.user.uid });
  await setDoc(doc(db!, 'users', credential.user.uid), profile);

  return credential.user;
}

export async function loginWithUsername(username: string, password: string): Promise<User> {
  assertConfigured();
  const credential = await signInWithEmailAndPassword(auth!, usernameToEmail(username), password);
  return credential.user;
}

export async function signOut(): Promise<void> {
  assertConfigured();
  await firebaseSignOut(auth!);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  assertConfigured();
  const snap = await getDoc(doc(db!, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateAvatarUrl(uid: string, avatarUrl: string): Promise<void> {
  assertConfigured();
  await setDoc(doc(db!, 'users', uid), { avatarUrl }, { merge: true });
}
