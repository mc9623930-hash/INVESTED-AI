import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Flame, Crown, RefreshCw } from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

interface LeaderEntry {
  uid: string;
  rank: number;
  username: string;
  displayName: string;
  avatarId: string;
  level: number;
  xp: number;
  portfolioReturn: number;
  streak: number;
}

type TabKey = 'Global' | 'This Week' | 'Portfolio' | 'XP';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'Global', label: 'Global' },
  { key: 'This Week', label: 'This Week' },
  { key: 'Portfolio', label: 'Portfolio Returns' },
  { key: 'XP', label: 'XP' },
];

const DEMO_LEADERS: LeaderEntry[] = [
  { uid: '1', rank: 1, username: 'aarav_invests', displayName: 'Aarav Sharma', avatarId: '🦁', level: 6, xp: 2450, portfolioReturn: 18.4, streak: 12 },
  { uid: '2', rank: 2, username: 'priya_crypto', displayName: 'Priya Patel', avatarId: '🦊', level: 5, xp: 1980, portfolioReturn: 14.2, streak: 8 },
  { uid: '3', rank: 3, username: 'rahul_trader', displayName: 'Rahul Verma', avatarId: '⚡', level: 5, xp: 1720, portfolioReturn: 11.8, streak: 5 },
  { uid: '4', rank: 4, username: 'ananya_stocks', displayName: 'Ananya Gupta', avatarId: '🚀', level: 4, xp: 1410, portfolioReturn: 9.5, streak: 4 },
  { uid: '5', rank: 5, username: 'vihaan_nifty', displayName: 'Vihaan Reddy', avatarId: '💎', level: 4, xp: 1150, portfolioReturn: 7.2, streak: 3 },
];

function rankBadge(rank: number) {
  if (rank === 1) return '🏆';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-muted rounded" />
        <div className="h-2 w-24 bg-muted rounded" />
      </div>
      <div className="w-12 h-4 bg-muted rounded" />
    </div>
  );
}

async function fetchLeaders(tab: TabKey): Promise<LeaderEntry[]> {
  if (!isFirebaseConfigured) {
    return DEMO_LEADERS;
  }
  const col = collection(db, 'userProgress');
  let q;

  if (tab === 'This Week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    q = query(
      col,
      where('updatedAt', '>=', Timestamp.fromDate(weekAgo)),
      orderBy('updatedAt', 'desc'),
      orderBy('xp', 'desc'),
      limit(50),
    );
  } else if (tab === 'Portfolio') {
    q = query(col, orderBy('portfolioReturn', 'desc'), limit(50));
  } else {
    // Global & XP — both sorted by XP
    q = query(col, orderBy('xp', 'desc'), limit(50));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d, i) => {
    const data = d.data();
    return {
      uid: d.id,
      rank: i + 1,
      username: data.username || 'anonymous',
      displayName: data.displayName || 'Investor',
      avatarId: data.avatarId || '🦁',
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      portfolioReturn: data.portfolioReturn ?? 0,
      streak: data.streak ?? 0,
    };
  });
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('Global');
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { userProfile } = useUser();

  const loadLeaders = async (tab: TabKey) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaders(tab);
      setLeaders(data);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || '';
      if (msg.includes('index')) {
        // Firestore composite index not built yet — fallback to XP only
        try {
          const fallback = await getDocs(
            query(collection(db, 'userProgress'), orderBy('xp', 'desc'), limit(50)),
          );
          setLeaders(
            fallback.docs.map((d, i) => {
              const data = d.data();
              return {
                uid: d.id,
                rank: i + 1,
                username: data.username || 'anonymous',
                displayName: data.displayName || 'Investor',
                avatarId: data.avatarId || '🦁',
                level: data.level ?? 1,
                xp: data.xp ?? 0,
                portfolioReturn: data.portfolioReturn ?? 0,
                streak: data.streak ?? 0,
              };
            }),
          );
        } catch {
          setError('Could not load leaderboard. Please try again.');
        }
      } else {
        setError('Could not load leaderboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaders(activeTab);
  }, [activeTab]);

  const myRank = currentUser ? leaders.findIndex((l) => l.uid === currentUser.uid) + 1 : 0;
  const top3 = leaders.slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-primary mb-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Real rankings from all InvesEd AI learners
          </p>
        </div>
        <button
          onClick={() => loadLeaders(activeTab)}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        {loading ? (
          <div className="flex items-end justify-center gap-3">
            {[1, 0, 2].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="w-20 h-3 bg-muted rounded" />
                <div className={`w-full rounded-t-xl bg-muted ${i === 0 ? 'h-24' : i === 1 ? 'h-16' : 'h-12'}`} />
              </div>
            ))}
          </div>
        ) : top3.length >= 3 ? (
          <div className="flex items-end justify-center gap-3">
            {/* Rank 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-center"
            >
              <div className="text-3xl mb-2">{top3[1].avatarId}</div>
              <div className="font-bold text-sm mb-0.5 truncate">{top3[1].displayName}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {top3[1].xp.toLocaleString('en-IN')} XP
              </div>
              <div className="h-16 bg-secondary/20 rounded-t-xl flex items-center justify-center text-2xl font-black text-secondary">
                2
              </div>
            </motion.div>
            {/* Rank 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 text-center"
            >
              <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <div className="text-4xl mb-2">{top3[0].avatarId}</div>
              <div className="font-bold mb-0.5 truncate">{top3[0].displayName}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {top3[0].xp.toLocaleString('en-IN')} XP
              </div>
              <div className="h-24 brand-gradient rounded-t-xl flex items-center justify-center text-2xl font-black text-white">
                1
              </div>
            </motion.div>
            {/* Rank 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-center"
            >
              <div className="text-3xl mb-2">{top3[2].avatarId}</div>
              <div className="font-bold text-sm mb-0.5 truncate">{top3[2].displayName}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {top3[2].xp.toLocaleString('en-IN')} XP
              </div>
              <div className="h-12 bg-amber-100 rounded-t-xl flex items-center justify-center text-2xl font-black text-amber-600">
                3
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Trophy className="w-10 h-10 text-amber-200 mx-auto mb-2" />
            Not enough players yet — be the first on the podium!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-border rounded-xl p-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          : leaders.map((leader, i) => {
              const isMe = leader.uid === currentUser?.uid;
              const badge = rankBadge(leader.rank);
              return (
                <motion.div
                  key={leader.uid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`rounded-xl border p-4 flex items-center gap-3 ${
                    isMe
                      ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                      : 'bg-white border-border'
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      leader.rank === 1
                        ? 'brand-gradient text-white'
                        : leader.rank === 2
                        ? 'bg-secondary/20 text-secondary'
                        : leader.rank === 3
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {badge ?? leader.rank}
                  </div>

                  {/* Avatar */}
                  <div className="text-2xl flex-shrink-0">{leader.avatarId}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">
                      {leader.displayName}
                      {isMe && (
                        <span className="ml-1 text-xs text-primary font-medium">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      @{leader.username} · Level {leader.level}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    {activeTab === 'Portfolio' ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Return</div>
                        <div
                          className={`text-xs font-bold ${
                            leader.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {leader.portfolioReturn >= 0 ? '+' : ''}
                          {leader.portfolioReturn.toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <div className="hidden sm:block">
                        <div className="text-xs text-muted-foreground">Return</div>
                        <div
                          className={`text-xs font-bold ${
                            leader.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {leader.portfolioReturn >= 0 ? '+' : ''}
                          {leader.portfolioReturn.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {leader.xp.toLocaleString('en-IN')}
                      </div>
                      <div className="flex items-center gap-0.5 text-xs text-orange-500 justify-end">
                        <Flame className="w-3 h-3" />
                        {leader.streak}d
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

        {/* Current user if not in top 50 */}
        {!loading && currentUser && userProfile && myRank === 0 && (
          <div className="border-t border-border pt-2 mt-2">
            <div className="text-xs text-center text-muted-foreground mb-2">Your position</div>
            <div className="bg-primary/5 rounded-xl border border-primary/30 p-4 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-black text-muted-foreground flex-shrink-0">
                —
              </div>
              <div className="text-xl flex-shrink-0">{userProfile.avatarId || '🎯'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">
                  {userProfile.displayName}{' '}
                  <span className="text-xs text-primary font-medium">(you)</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  @{userProfile.username} · Level {userProfile.level}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                {userProfile.xp.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && leaders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 text-amber-200 mx-auto mb-3" />
            <p className="font-medium">No data yet</p>
            <p className="text-sm mt-1">Complete some modules to appear here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
