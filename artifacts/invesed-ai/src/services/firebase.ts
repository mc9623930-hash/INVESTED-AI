import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const rawProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(
  rawApiKey && rawApiKey.trim() !== '' && rawProjectId && rawProjectId.trim() !== ''
);

// Validly formatted dummy config to prevent Firebase SDK top-level crash when env vars are missing
const firebaseConfig = {
  apiKey: isFirebaseConfigured ? rawApiKey! : 'AIzaSyDummyKeyForUnconfiguredFirebaseEnv123',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'invesed-ai-demo.firebaseapp.com',
  projectId: isFirebaseConfigured ? rawProjectId! : 'invesed-ai-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'invesed-ai-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase initialization fallback triggered:', err);
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export const googleProvider = new GoogleAuthProvider();
try {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch {
  /* ignore */
}

export { app, auth, db };
export default app;
