import { Link, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap, ChevronRight, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

const MODULE_DATA: Record<string, {
  title: string;
  description: string;
  icon: string;
  xp: number;
  lessons: { id: string; title: string; duration: number; desc: string }[];
  bridgeRound?: string;
  simulatorUnlock?: string;
}> = {
  CF1: {
    title: 'Money & You',
    description: 'Understand pocket money, saving habits, compound interest, and the time value of money.',
    icon: '💰',
    xp: 200,
    lessons: [
      { id: 'CF1-L1', title: 'Why Your Pocket Money Matters', duration: 5, desc: 'Understanding money as a tool, not just a means to spend' },
      { id: 'CF1-L2', title: 'The Magic of Saving Early', duration: 6, desc: 'Why starting at 16 beats starting at 26 — with real math' },
      { id: 'CF1-L3', title: 'Compound Interest — The 8th Wonder', duration: 8, desc: 'How Einstein\'s favourite concept works in your favour' },
      { id: 'CF1-L4', title: 'Time Value of Money', duration: 5, desc: '₹1,000 today vs ₹1,000 in 10 years — which is worth more?' },
      { id: 'CF1-L5', title: 'Building Your First Budget', duration: 4, desc: 'Simple 50-30-20 rule adapted for Indian teens' },
    ],
    bridgeRound: 'No bridge round — straight to CF2',
  },
  CF2: {
    title: 'What is Investing?',
    description: 'Learn why inflation erodes your savings and how different asset classes can beat it.',
    icon: '📈',
    xp: 250,
    lessons: [
      { id: 'CF2-L1', title: 'Inflation — The Silent Thief', duration: 5, desc: 'Why ₹100 today won\'t buy the same things in 10 years' },
      { id: 'CF2-L2', title: 'Why FD Alone Isn\'t Enough', duration: 6, desc: 'Real returns after inflation: the math that changes everything' },
      { id: 'CF2-L3', title: 'Asset Classes Overview', duration: 7, desc: 'Equities, debt, gold, real estate — what they are and how they work' },
      { id: 'CF2-L4', title: 'Risk & Time — The Trade-off', duration: 6, desc: 'Why longer time horizons reduce risk dramatically' },
    ],
    bridgeRound: 'SR001: The COVID Crash — unlocks Simulator',
    simulatorUnlock: 'Basic Portfolio View',
  },
  CF3: {
    title: 'Stocks Explained',
    description: 'Understand how shares work, what BSE/NSE are, and how stock prices move.',
    icon: '📊',
    xp: 300,
    lessons: [
      { id: 'CF3-L1', title: 'What is a Share?', duration: 5, desc: 'Owning a piece of Reliance — what that actually means' },
      { id: 'CF3-L2', title: 'BSE, NSE & SEBI', duration: 6, desc: 'India\'s stock exchanges and their regulator explained simply' },
      { id: 'CF3-L3', title: 'How Stock Prices Move', duration: 7, desc: 'Supply, demand, earnings, and sentiment — the four forces' },
      { id: 'CF3-L4', title: 'Bulls, Bears & Market Cycles', duration: 5, desc: 'Understanding market phases and how to use them' },
      { id: 'CF3-L5', title: 'Market Cap & Categories', duration: 4, desc: 'Large-cap vs mid-cap vs small-cap — size matters' },
    ],
    bridgeRound: 'No bridge round — straight to CF4',
  },
  CF4: {
    title: 'Mutual Funds & SIPs',
    description: 'Master NAV, fund categories, SIP mechanics, and what SEBI actually regulates.',
    icon: '🏦',
    xp: 300,
    lessons: [
      { id: 'CF4-L1', title: 'What is a Mutual Fund?', duration: 5, desc: 'Pooled money, professional management, and diversification' },
      { id: 'CF4-L2', title: 'Understanding NAV & Units', duration: 5, desc: 'How your investment grows — the units-based math' },
      { id: 'CF4-L3', title: 'Types of Mutual Funds', duration: 7, desc: 'Large-cap, mid-cap, ELSS, debt, index — which is for whom' },
      { id: 'CF4-L4', title: 'SIP — Rupee Cost Averaging', duration: 8, desc: 'Why investing ₹500/month beats investing ₹6,000 once a year' },
      { id: 'CF4-L5', title: 'AMCs, SEBI & Expense Ratio', duration: 5, desc: 'Who manages your money and what they charge' },
    ],
    bridgeRound: 'SR004: SIP in a Bear Market — unlocks SIP Simulator',
    simulatorUnlock: 'SIP Simulator',
  },
  CF5: {
    title: 'Risk & Returns',
    description: 'Understand the risk-return tradeoff and why diversification is your best friend.',
    icon: '⚡',
    xp: 250,
    lessons: [
      { id: 'CF5-L1', title: 'The Risk-Return Tradeoff', duration: 6, desc: 'Higher return always comes with higher risk — always' },
      { id: 'CF5-L2', title: 'Types of Risk', duration: 5, desc: 'Market risk, credit risk, liquidity risk — knowing what you face' },
      { id: 'CF5-L3', title: 'Diversification — Don\'t Put All Eggs...', duration: 7, desc: 'How spreading investments reduces total portfolio risk' },
      { id: 'CF5-L4', title: 'Beta, Volatility & Sharpe Ratio', duration: 6, desc: 'Numbers that tell you how risky an investment really is' },
    ],
    bridgeRound: 'SR002: RBI Rate Hike Shock — unlocks advanced trading',
    simulatorUnlock: 'Limit & Stop-Loss Orders',
  },
  CF6: {
    title: 'How to Research',
    description: 'Learn to read financial statements, P/E ratios, and fund fact sheets like a pro.',
    icon: '🔍',
    xp: 300,
    lessons: [
      { id: 'CF6-L1', title: 'Reading Annual Reports', duration: 7, desc: 'P&L, balance sheet, cash flow — the three documents that matter' },
      { id: 'CF6-L2', title: 'Key Ratios Decoded', duration: 8, desc: 'P/E, P/B, ROE, ROCE — what they actually tell you' },
      { id: 'CF6-L3', title: 'Revenue & Profit Growth', duration: 5, desc: 'Why growing revenue with shrinking profit is a red flag' },
      { id: 'CF6-L4', title: 'Reading a Mutual Fund Fact Sheet', duration: 6, desc: 'Returns, portfolio, expense ratio, AUM — the complete guide' },
    ],
    bridgeRound: 'SR009: Auditor Resignation Alert — unlocks Research Lab',
    simulatorUnlock: 'Full Research Lab',
  },
};

export default function ModuleView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const mod = moduleId ? MODULE_DATA[moduleId] : null;

  if (!mod) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h2 className="text-2xl font-bold mb-2">Module Not Found</h2>
        <Link href="/academy"><button className="text-secondary hover:underline">Back to Academy</button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/academy">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Academy
        </button>
      </Link>

      {/* Module header */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="text-4xl mb-3">{mod.icon}</div>
        <div className="text-xs font-bold text-muted-foreground mb-1">{moduleId}</div>
        <h1 className="text-2xl font-black text-foreground mb-2">{mod.title}</h1>
        <p className="text-muted-foreground text-sm mb-4">{mod.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{mod.lessons.reduce((a, l) => a + l.duration, 0)} min total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-amber-600 font-semibold">+{mod.xp} XP on completion</span>
          </div>
        </div>
      </div>

      {/* Bridge round callout */}
      {mod.simulatorUnlock && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-amber-800 text-sm">Situation Round Required</div>
            <div className="text-amber-700 text-xs mt-0.5">Complete this module → Face a Situation Round → Unlock <strong>{mod.simulatorUnlock}</strong></div>
            <div className="text-amber-600 text-xs mt-1 font-medium">{mod.bridgeRound}</div>
          </div>
        </div>
      )}

      {/* Lessons */}
      <div className="space-y-2">
        <h2 className="font-bold text-foreground mb-3">Lessons</h2>
        {mod.lessons.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/academy/${moduleId}/lesson/${lesson.id}`}>
              <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{lesson.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{lesson.desc}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{lesson.duration}m</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Module quiz */}
      <div className="mt-4">
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 opacity-60">
          <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Module Quiz</div>
            <div className="text-xs text-muted-foreground">Complete all lessons to unlock</div>
          </div>
          <span className="text-xs text-amber-600 font-medium">+{Math.round(mod.xp * 0.5)} XP</span>
        </div>
      </div>
    </div>
  );
}
