import { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingDown, Clock, Zap, Trophy, AlertTriangle, BarChart2, ChevronRight } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { XPToast } from '../../components/gamification/XPToast';

const ROUNDS_DATA: Record<string, {
  title: string;
  niftyChange: number;
  scenario: string;
  breaking: string;
  portfolioImpact: string;
  decisions: { id: string; text: string; shortTerm: string; longTerm: string; quality: 'excellent' | 'good' | 'risky' | 'panic' }[];
}> = {
  SR001: {
    title: 'The COVID Crash',
    niftyChange: -35,
    breaking: '🔴 BREAKING: WHO Declares COVID-19 Global Pandemic. Nifty 50 down 35% in 3 weeks.',
    scenario: `It\'s March 23, 2020. The Nifty has crashed from 12,000 to under 7,600 — a 35% fall in just 3 weeks. 

Circuit breakers have been triggered twice this week. Global markets are in freefall. India has announced a 21-day nationwide lockdown. Business is at a standstill.

Your virtual portfolio (₹1,00,000) is now worth ₹68,000 on paper. You haven\'t actually lost anything yet — unless you sell.

What do you do?`,
    portfolioImpact: 'Your ₹1,00,000 is worth ₹68,000 on paper. Banks, IT, and consumer stocks hit hardest.',
    decisions: [
      { id: 'D1', text: 'Sell everything immediately. Preserve the remaining ₹68,000 in cash.', shortTerm: 'You stop further paper losses. Cash feels safe.', longTerm: 'Nifty recovered fully by Aug 2020 and hit 15,000+ by Dec 2020. You locked in a ₹32,000 permanent loss.', quality: 'panic' },
      { id: 'D2', text: 'Sell only the weaker/speculative holdings, hold blue-chips.', shortTerm: 'Partial protection. Reduces portfolio by ₹20K but keeps quality names.', longTerm: 'You recovered partially. Good quality stocks bounced back strongly. Decent outcome.', quality: 'good' },
      { id: 'D3', text: 'Hold everything. Don\'t react to the panic. Markets recover.', shortTerm: 'Stomach-churning. Down another 5% over the next week before recovery.', longTerm: 'By December 2020, your ₹1,00,000 portfolio is worth ₹1,28,000. This was the right call.', quality: 'excellent' },
      { id: 'D4', text: 'BUY MORE at these crisis prices. Invest all remaining cash.', shortTerm: 'High risk — markets could fall further (and did for 2 more days).', longTerm: 'If you had cash to deploy, this was the generational opportunity. Portfolio would be worth ₹1,65,000+ by Dec 2020.', quality: 'excellent' },
    ],
  },
  SR009: {
    title: 'Auditor Resignation Alert',
    niftyChange: -5,
    breaking: '🔴 ALERT: Statutory Auditor of XYZ Corp resigns citing "inability to obtain complete information". Stock circuit hits lower limit -20%.',
    scenario: `You own 50 shares of XYZ Corp. The CFO was arrested last month for unrelated tax issues.

Last night, XYZ Corp filed an exchange notification: their statutory auditor resigned, stating they couldn\'t obtain "sufficient audit evidence". The stock hits the 20% lower circuit in pre-market.

This is a red flag for accounting irregularities. But the company is fundamentally strong on other metrics.

What do you do with your 50 shares?`,
    portfolioImpact: '50 shares of XYZ Corp. Today\'s value has dropped 20%. Buyer may be hard to find.',
    decisions: [
      { id: 'D1', text: 'Sell at market open at whatever price available. Exit completely.', shortTerm: 'You exit with a 20% loss. Hard to find a buyer — execution may be at further discount.', longTerm: 'Smart. Auditor resignations citing information gaps have historically preceded major accounting frauds. You avoided further pain.', quality: 'excellent' },
      { id: 'D2', text: 'Wait for management clarification. Hold for now.', shortTerm: 'Stock may be locked in lower circuit for multiple days.', longTerm: 'Risky. If this is a fraud, delays mean deeper losses. Only justified if you have high conviction in management.', quality: 'risky' },
      { id: 'D3', text: 'Buy more — the fundamentals still look good, and this seems overreaction.', shortTerm: 'Potentially catching a falling knife.', longTerm: 'Very high risk. Without audited accounts, fundamentals cannot be trusted. Contrarian plays in fraud scenarios rarely work.', quality: 'panic' },
      { id: 'D4', text: 'Sell half, wait for more information.', shortTerm: 'Balanced approach. Reduces exposure while staying invested.', longTerm: 'Reasonable risk management. If fraud confirmed, you limited damage. If false alarm, you still participate in recovery.', quality: 'good' },
    ],
  },
};

const QUALITY_CONFIG = {
  excellent: { color: 'border-green-300 bg-green-50', badge: 'bg-green-500', label: 'Expert Decision', xpMultiplier: 1.0 },
  good: { color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-500', label: 'Sound Reasoning', xpMultiplier: 0.75 },
  risky: { color: 'border-amber-300 bg-amber-50', badge: 'bg-amber-500', label: 'High Risk', xpMultiplier: 0.5 },
  panic: { color: 'border-red-300 bg-red-50', badge: 'bg-red-500', label: 'Panic Decision', xpMultiplier: 0.25 },
};

export default function RoundPlay() {
  const { roundId } = useParams<{ roundId: string }>();
  const [, navigate] = useLocation();
  const { addXP } = useUser();
  const [phase, setPhase] = useState<'brief' | 'decide' | 'result'>('brief');
  const [chosenDecision, setChosenDecision] = useState<string | null>(null);

  const round = roundId ? ROUNDS_DATA[roundId] : null;

  if (!round) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Round Not Found</h2>
        <Link href="/rounds"><button className="text-secondary hover:underline">Back to Rounds</button></Link>
      </div>
    );
  }

  const chosen = chosenDecision ? round.decisions.find(d => d.id === chosenDecision) : null;
  const chosenQuality = chosen ? QUALITY_CONFIG[chosen.quality] : null;
  const baseXP = 300;
  const earnedXP = chosen ? Math.round(baseXP * (QUALITY_CONFIG[chosen.quality]?.xpMultiplier || 0.25)) : 0;

  const handleDecide = (decisionId: string) => {
    setChosenDecision(decisionId);
    setPhase('result');
    const dec = round.decisions.find(d => d.id === decisionId);
    if (dec) {
      const xp = Math.round(baseXP * QUALITY_CONFIG[dec.quality].xpMultiplier);
      addXP(xp);
      toast.custom(<XPToast amount={xp} message={`${QUALITY_CONFIG[dec.quality].label}!`} />);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/rounds">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Rounds
        </button>
      </Link>

      {/* Breaking news banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-600 text-white p-3 rounded-xl mb-4 text-sm font-medium flex items-start gap-2"
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{round.breaking}</span>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === 'brief' && (
          <motion.div key="brief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl border border-border p-6 mb-4">
              <h1 className="text-2xl font-black mb-3 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-red-500" />
                {round.title}
              </h1>
              <div className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed mb-4">{round.scenario}</div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <BarChart2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">{round.portfolioImpact}</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPhase('decide')}
              className="w-full py-4 brand-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-lg"
            >
              Make Your Decision
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {phase === 'decide' && (
          <motion.div key="decide" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-2xl border border-border p-5 mb-4">
              <h2 className="font-bold text-xl mb-1">Your Decision</h2>
              <p className="text-sm text-muted-foreground">Choose carefully — this is your money (virtually).</p>
            </div>
            <div className="space-y-3">
              {round.decisions.map((dec, i) => (
                <motion.button
                  key={dec.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDecide(dec.id)}
                  className="w-full text-left p-5 bg-white rounded-2xl border-2 border-border hover:border-primary/60 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="text-sm font-medium">{dec.text}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'result' && chosen && chosenQuality && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Result header */}
            <div className={`rounded-2xl border-2 p-5 mb-4 ${chosenQuality.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${chosenQuality.badge}`}>
                  {chosenQuality.label}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                  +{earnedXP} XP
                </div>
              </div>
              <div className="text-sm font-medium mb-2">Your choice: <em>{chosen.text}</em></div>
            </div>

            {/* Consequences */}
            <div className="space-y-3 mb-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="text-xs font-bold text-muted-foreground mb-1.5">SHORT-TERM IMPACT</div>
                <p className="text-sm text-foreground">{chosen.shortTerm}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <div className="text-xs font-bold text-primary mb-1.5">LONG-TERM OUTCOME</div>
                <p className="text-sm text-foreground">{chosen.longTerm}</p>
              </div>
            </div>

            {/* Other options reveal */}
            <div className="bg-white rounded-xl border border-border p-4 mb-4">
              <h3 className="font-bold text-sm mb-3">What were the other options?</h3>
              <div className="space-y-3">
                {round.decisions.filter(d => d.id !== chosen.id).map((dec) => (
                  <div key={dec.id} className={`p-3 rounded-lg border ${QUALITY_CONFIG[dec.quality].color} text-xs`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-2 h-2 rounded-full ${QUALITY_CONFIG[dec.quality].badge}`} />
                      <span className="font-bold">{QUALITY_CONFIG[dec.quality].label}</span>
                    </div>
                    <div className="font-medium mb-0.5">{dec.text}</div>
                    <div className="text-muted-foreground">{dec.longTerm}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/rounds">
                <button className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  More Rounds
                </button>
              </Link>
              <Link href="/portfolio">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  className="flex-1 py-3 brand-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  View Portfolio
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
