import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebase';
import type { RiskProfile, AcademyProgress } from '../types';

interface UserProfile {
  username: string;
  displayName: string;
  avatarId: string;
  dob: string;
  tier: 'free' | 'pro';
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  badges: string[];
  riskProfile: RiskProfile | null;
  academyProgress: AcademyProgress;
  watchlist: string[];
  portfolioValue: number;
  portfolioReturn: number;
}

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  addXP: (amount: number) => void;
  awardBadge: (badgeId: string) => void;
  setRiskProfile: (profile: RiskProfile) => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  completedModules: string[];
  markModuleComplete: (moduleId: string) => void;
  isSaving: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

const XP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000];

function calculateLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1;
  }
  return 1;
}

const DEFAULT_ACADEMY_PROGRESS: AcademyProgress = {
  currentModuleId: '',
  completedModules: [],
  completedLessons: [],
  moduleScores: {},
  bridgeRoundsCompleted: [],
  totalStudyTimeMinutes: 0,
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUidRef.current = user.uid;
        try {
          const [userSnap, progressSnap] = await Promise.all([
            getDoc(doc(db, 'users', user.uid)),
            getDoc(doc(db, 'userProgress', user.uid)),
          ]);

          const userData = userSnap.data();
          const progress = progressSnap.data();

          setUserProfileState({
            username: userData?.username || '',
            displayName: userData?.displayName || user.displayName || '',
            avatarId: userData?.avatarId || '🦁',
            dob: userData?.dob || '',
            tier: 'free',
            xp: progress?.xp ?? 0,
            level: progress?.level ?? 1,
            streak: progress?.streak ?? 0,
            longestStreak: progress?.longestStreak ?? 0,
            badges: progress?.badges ?? [],
            riskProfile: (progress?.riskProfile as RiskProfile) ?? null,
            academyProgress: (progress?.academyProgress as AcademyProgress) ?? DEFAULT_ACADEMY_PROGRESS,
            watchlist: progress?.watchlist ?? [],
            portfolioValue: progress?.portfolioValue ?? 100000,
            portfolioReturn: progress?.portfolioReturn ?? 0,
          });
          setCompletedModules(progress?.completedModules ?? []);
        } catch {
          // silent — user starts fresh
        }
      } else {
        currentUidRef.current = null;
        setUserProfileState(null);
        setCompletedModules([]);
      }
    });
    return unsubscribe;
  }, []);

  const persistProgress = useCallback((profile: UserProfile, modules: string[]) => {
    if (!currentUidRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const uid = currentUidRef.current;
      if (!uid) return;
      setIsSaving(true);
      try {
        await setDoc(doc(db, 'userProgress', uid), {
          xp: profile.xp,
          level: profile.level,
          streak: profile.streak,
          longestStreak: profile.longestStreak,
          badges: profile.badges,
          riskProfile: profile.riskProfile,
          academyProgress: profile.academyProgress,
          completedModules: modules,
          watchlist: profile.watchlist,
          portfolioValue: profile.portfolioValue,
          portfolioReturn: profile.portfolioReturn,
          // Denormalized user fields for leaderboard queries (one-collection read)
          username: profile.username,
          displayName: profile.displayName,
          avatarId: profile.avatarId,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch {
        // silent save failure
      } finally {
        setIsSaving(false);
      }
    }, 1500);
  }, []);

  const setUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) persistProgress(profile, completedModules);
  }, [completedModules, persistProgress]);

  const addXP = useCallback((amount: number) => {
    setUserProfileState(prev => {
      if (!prev) return prev;
      const newXP = prev.xp + amount;
      const updated = { ...prev, xp: newXP, level: calculateLevel(newXP) };
      persistProgress(updated, completedModules);
      return updated;
    });
  }, [completedModules, persistProgress]);

  const awardBadge = useCallback((badgeId: string) => {
    setUserProfileState(prev => {
      if (!prev || prev.badges.includes(badgeId)) return prev;
      const updated = { ...prev, badges: [...prev.badges, badgeId] };
      persistProgress(updated, completedModules);
      return updated;
    });
  }, [completedModules, persistProgress]);

  const setRiskProfile = useCallback((profile: RiskProfile) => {
    setUserProfileState(prev => {
      if (!prev) return prev;
      const updated = { ...prev, riskProfile: profile };
      persistProgress(updated, completedModules);
      return updated;
    });
  }, [completedModules, persistProgress]);

  const addToWatchlist = useCallback((ticker: string) => {
    setUserProfileState(prev => {
      if (!prev || prev.watchlist.includes(ticker)) return prev;
      const updated = { ...prev, watchlist: [...prev.watchlist, ticker] };
      persistProgress(updated, completedModules);
      return updated;
    });
  }, [completedModules, persistProgress]);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setUserProfileState(prev => {
      if (!prev) return prev;
      const updated = { ...prev, watchlist: prev.watchlist.filter(t => t !== ticker) };
      persistProgress(updated, completedModules);
      return updated;
    });
  }, [completedModules, persistProgress]);

  const markModuleComplete = useCallback((moduleId: string) => {
    setCompletedModules(prev => {
      if (prev.includes(moduleId)) return prev;
      const updated = [...prev, moduleId];
      if (userProfile) persistProgress(userProfile, updated);
      return updated;
    });
  }, [userProfile, persistProgress]);

  return (
    <UserContext.Provider value={{
      userProfile,
      setUserProfile,
      addXP,
      awardBadge,
      setRiskProfile,
      addToWatchlist,
      removeFromWatchlist,
      completedModules,
      markModuleComplete,
      isSaving,
    }}>
      {children}
    </UserContext.Provider>
  );
}
