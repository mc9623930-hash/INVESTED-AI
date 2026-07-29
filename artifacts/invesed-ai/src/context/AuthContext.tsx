import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../services/firebase';

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
  signInAsGuest: () => void;
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

const LOCAL_STORAGE_KEY = 'invesed_local_user';

function getLocalUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

async function ensureUserDoc(user: FirebaseUser) {
  try {
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
  } catch {
    /* non-fatal */
  }
}

async function ensureProgressDoc(uid: string) {
  try {
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
  } catch {
    /* non-fatal */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getLocalUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            await Promise.all([ensureUserDoc(user), ensureProgressDoc(user.uid)]);
          } catch {
            /* non-fatal */
          }
          const authUser = toAuthUser(user);
          setCurrentUser(authUser);
          setLocalUser(authUser);
        } else {
          // If no Firebase user, check if we have a local fallback user
          const local = getLocalUser();
          setCurrentUser(local);
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const createLocalFallbackUser = (email: string, displayName?: string): AuthUser => {
    const user: AuthUser = {
      uid: 'user-' + Math.random().toString(36).substring(2, 9),
      email: email,
      displayName: displayName || email.split('@')[0],
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(email),
    };
    setCurrentUser(user);
    setLocalUser(user);
    return user;
  };

  const signInAsGuest = () => {
    const guestUser: AuthUser = {
      uid: 'guest-investor-' + Math.random().toString(36).substring(2, 7),
      email: 'guest@invesed.ai',
      displayName: 'Guest Investor 🚀',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=GuestInvestor',
    };
    setCurrentUser(guestUser);
    setLocalUser(guestUser);
  };

  const signUp = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      createLocalFallbackUser(email);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      console.warn('Firebase signup failed, using local fallback auth:', err);
      createLocalFallbackUser(email);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      createLocalFallbackUser(email);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      console.warn('Firebase signin failed, using local fallback auth:', err);
      createLocalFallbackUser(email);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      createLocalFallbackUser('teen.investor@invesed.ai', 'Teen Investor');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      console.warn('Google sign-in popup error:', code, err);
      if (code === 'auth/popup-blocked') {
        try {
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          createLocalFallbackUser('teen.investor@invesed.ai', 'Teen Investor');
        }
      } else {
        createLocalFallbackUser('teen.investor@invesed.ai', 'Teen Investor');
      }
    }
  };

  const logout = async () => {
    setLocalUser(null);
    setCurrentUser(null);
    try {
      await firebaseSignOut(auth);
    } catch {
      /* ignore */
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) return;
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch {
      /* ignore */
    }
  };

  const updateUserProfile = async (profile: {
    displayName?: string;
    username?: string;
    avatarId?: string;
    dob?: string;
  }) => {
    const user = auth.currentUser;
    if (user && isFirebaseConfigured) {
      if (profile.displayName) {
        await firebaseUpdateProfile(user, { displayName: profile.displayName });
      }
      try {
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
      } catch {
        /* ignore */
      }
    }
    setCurrentUser((prev) => {
      const updated = prev ? { ...prev, displayName: profile.displayName || prev.displayName } : prev;
      if (updated) setLocalUser(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInAsGuest,
        logout,
        resetPassword,
        updateUserProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
