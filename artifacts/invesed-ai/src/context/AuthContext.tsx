import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (profile: {
    displayName?: string;
    username?: string;
    avatarId?: string;
    dob?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function toAuthUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

async function ensureUserDoc(user: FirebaseUser) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      username: '',
      avatarId: '🦁',
      dob: '',
    });
  }
}

async function ensureProgressDoc(uid: string) {
  const ref = doc(db, 'userProgress', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      badges: [],
      riskProfile: null,
      academyProgress: {
        currentModuleId: '',
        completedModules: [],
        completedLessons: [],
        moduleScores: {},
        bridgeRoundsCompleted: [],
        totalStudyTimeMinutes: 0,
      },
      completedModules: [],
      watchlist: [],
      portfolioValue: 100000,
      portfolioReturn: 0,
      updatedAt: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure Firestore docs exist on every sign-in (covers Google popup flow too)
        try {
          await Promise.all([ensureUserDoc(user), ensureProgressDoc(user.uid)]);
        } catch {
          // non-fatal
        }
        setCurrentUser(toAuthUser(user));
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will create the Firestore docs
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will ensure docs exist
  };

  /**
   * Opens /auth/google-popup as a real popup window (works even inside iframes).
   * The popup posts a message back when sign-in completes, then closes itself.
   */
  const signInWithGoogle = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const w = 500;
      const h = 600;
      const left = Math.max(0, (screen.width - w) / 2);
      const top = Math.max(0, (screen.height - h) / 2);
      const popup = window.open(
        `${window.location.origin}/auth/google-popup`,
        'google-signin',
        `popup,width=${w},height=${h},left=${left},top=${top}`,
      );

      if (!popup) {
        // Popup was blocked — fall back to direct signInWithPopup
        signInWithPopup(auth, googleProvider).then(() => resolve()).catch(reject);
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'GOOGLE_SIGNIN_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          clearInterval(timer);
          // Use the credential from the popup to sign in the parent window directly.
          // This avoids relying on cross-window localStorage sync (which can fail in iframes).
          const { idToken, accessToken } = event.data.credential ?? {};
          if (idToken || accessToken) {
            const cred = GoogleAuthProvider.credential(idToken, accessToken);
            signInWithCredential(auth, cred).then(() => resolve()).catch(reject);
          } else {
            resolve(); // fallback: rely on onAuthStateChanged
          }
        } else if (event.data?.type === 'GOOGLE_SIGNIN_ERROR') {
          window.removeEventListener('message', handleMessage);
          clearInterval(timer);
          const err = new Error(event.data.message || 'sign-in failed') as Error & { code: string };
          err.code = event.data.code || '';
          reject(err);
        }
      };
      window.addEventListener('message', handleMessage);

      // Fallback: if popup closes without postMessage (e.g. user dismissed it),
      // resolve so the caller can check currentUser via onAuthStateChanged.
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          resolve();
        }
      }, 400);
    });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (profile: {
    displayName?: string;
    username?: string;
    avatarId?: string;
    dob?: string;
  }) => {
    const user = auth.currentUser;
    if (!user) return;
    if (profile.displayName) {
      await firebaseUpdateProfile(user, { displayName: profile.displayName });
    }
    await setDoc(
      doc(db, 'users', user.uid),
      {
        ...(profile.displayName !== undefined && { displayName: profile.displayName }),
        ...(profile.username !== undefined && { username: profile.username }),
        ...(profile.avatarId !== undefined && { avatarId: profile.avatarId }),
        ...(profile.dob !== undefined && { dob: profile.dob }),
      },
      { merge: true },
    );
    setCurrentUser((prev) =>
      prev ? { ...prev, displayName: profile.displayName || prev.displayName } : prev,
    );
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, signUp, signIn, signInWithGoogle, logout, resetPassword, updateUserProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
