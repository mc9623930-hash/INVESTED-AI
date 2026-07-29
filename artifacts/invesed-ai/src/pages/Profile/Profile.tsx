import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Award, Zap, Flame, BookOpen, BarChart2, Trophy, Settings, LogOut, Crown } from 'lucide-react';
import { XPBar } from '../../components/gamification/XPBar';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';

const BADGES = [
  { id: 'first_lesson', label: 'First Lesson', icon: '📖', desc: 'Completed your first lesson' },
  { id: 'risk_profiled', label: 'Risk Profiled', icon: '🎯', desc: 'Completed the Risk Quiz' },
  { id: 'situation_survivor', label: 'Situation Survivor', icon: '⚡', desc: 'Completed your first Situation Round' },
  { id: 'module_master', label: 'Module Master', icon: '🏆', desc: 'Completed a full module' },
  { id: 'portfolio_builder', label: 'Portfolio Builder', icon: '📊', desc: 'Made your first investment' },
  { id: 'streak_7', label: '7-Day Streak', icon: '🔥', desc: '7 consecutive learning days' },
];

export default function Profile() {
  const { userProfile } = useUser();
  const { currentUser, logout } = useAuth();

  if (!userProfile && !currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-xl font-bold mb-2">No Profile Found</h2>
        <p className="text-muted-foreground text-sm mb-4">Complete onboarding to see your profile</p>
        <Link href="/onboarding/quiz">
          <button className="px-6 py-3 brand-gradient text-white font-semibold rounded-xl">Start Onboarding</button>
        </Link>
      </div>
    );
  }

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Student';
  const username = userProfile?.username || currentUser?.email?.split('@')[0] || 'investor';
  const xp = userProfile?.xp || 0;
  const level = userProfile?.level || 1;
  const streak = userProfile?.streak || 0;
  const badges = userProfile?.badges || [];
  const tier = userProfile?.tier || 'free';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl brand-gradient flex items-center justify-center text-4xl flex-shrink-0">
            {userProfile?.avatarId || '🎯'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black text-foreground">{displayName}</h1>
              {tier === 'pro' && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-xs font-bold text-amber-700">
                  <Crown className="w-3 h-3" /> Pro
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground mb-3">@{username}</div>
            <XPBar xp={xp} level={level} />
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-border">
          {[
            { label: 'Level', value: level, icon: <Crown className="w-4 h-4 text-amber-500" /> },
            { label: 'XP', value: xp.toLocaleString('en-IN'), icon: <Zap className="w-4 h-4 text-amber-500" /> },
            { label: 'Streak', value: `${streak}d`, icon: <Flame className="w-4 h-4 text-orange-500" /> },
            { label: 'Badges', value: badges.length, icon: <Award className="w-4 h-4 text-blue-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk profile */}
      {userProfile?.riskProfile && (
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <h2 className="font-bold mb-3">Investor Profile</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center text-2xl">
              {userProfile.riskProfile.type === 'conservative' ? '🛡️'
                : userProfile.riskProfile.type === 'moderate' ? '⚖️'
                : '🚀'}
            </div>
            <div>
              <div className="font-bold">{userProfile.riskProfile.label}</div>
              <div className="text-xs text-muted-foreground">Risk Score: {userProfile.riskProfile.score}/100</div>
            </div>
            <Link href="/onboarding/quiz">
              <button className="ml-auto text-xs text-secondary hover:underline flex-shrink-0">Retake quiz</button>
            </Link>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="font-bold mb-4">Badges & Achievements</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BADGES.map((badge) => {
            const earned = badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                title={badge.desc}
                className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all ${earned ? 'bg-amber-50 border-amber-200' : 'bg-muted border-border opacity-40'}`}
              >
                <div className={`text-2xl mb-1 ${!earned && 'grayscale'}`}>{badge.icon}</div>
                <div className="text-xs font-medium leading-tight">{badge.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/academy', label: 'Academy', icon: <BookOpen className="w-5 h-5" /> },
          { href: '/portfolio', label: 'Portfolio', icon: <BarChart2 className="w-5 h-5" /> },
          { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
          { href: '/rounds', label: 'Rounds', icon: <Zap className="w-5 h-5" /> },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href}>
            <div className="bg-white rounded-xl border border-border p-4 text-center hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex justify-center text-primary mb-2">{icon}</div>
              <div className="text-sm font-semibold">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Upgrade CTA for free tier */}
      {tier !== 'pro' && (
        <div className="mt-6 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-800">Upgrade to Pro</span>
          </div>
          <p className="text-sm text-amber-700 mb-3">Unlock ₹10,00,000 virtual capital, advanced modules (AE1–AE4), and priority AI coaching.</p>
          <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors">
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}
