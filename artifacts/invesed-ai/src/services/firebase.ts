import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZBW26EPYsNtP1ekiAP4mQKO1nz9iZvtk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invest-ed-fa52e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invest-ed-fa52e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invest-ed-fa52e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "717222508122",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:717222508122:web:409ac35127ec3e88980a63",
};

export const isFirebaseConfigured = true;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
