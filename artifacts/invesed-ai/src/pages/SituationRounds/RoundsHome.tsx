import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Zap, Lock, Clock, TrendingDown } from 'lucide-react';

const ROUNDS = [
  { id: 'SR001', title: 'The COVID Crash', category: 'market', difficulty: 'beginner', xpMin: 200, xpMax: 500, isBridge: true, unlocksAfter: 'CF2', description: 'March 2020. Nifty falls 35% in 3 weeks. Your portfolio is bleeding. What do you do?', historicalDate: 'March 2020', niftyChange: -35 },
  { id: 'SR002', title: 'RBI Rate Hike Shock', category: 'market', difficulty: 'intermediate', xpMin: 250, xpMax: 600, isBridge: true, unlocksAfter: 'CF5', description: 'RBI raises rates by 250bps in 8 months. Debt funds and rate-sensitive stocks crater.', niftyChange: -18 },
  { id: 'SR004', title: 'SIP in a Bear Market', category: 'market', difficulty: 'beginner', xpMin: 200, xpMax: 400, isBridge: true, unlocksAfter: 'CF4', description: 'Your Nifty 50 SIP is 22% in the red after 6 months. Should you stop or continue?', niftyChange: -22 },
  { id: 'SR005', title: 'India-Pakistan Border Escalation', category: 'geopolitical', difficulty: 'intermediate', xpMin: 300, xpMax: 650, isBridge: false, description: 'Surgical strikes and counter-retaliation. Markets gap down 8% at open. Defence stocks surge.', niftyChange: -8 },
  { id: 'SR006', title: 'Government Falls Mid-Term', category: 'geopolitical', difficulty: 'intermediate', xpMin: 280, xpMax: 600, isBridge: false, description: 'Ruling coalition loses majority vote. Snap elections announced. Markets price in uncertainty.', niftyChange: -12 },
  { id: 'SR009', title: 'Auditor Resignation Alert', category: 'corruption', difficulty: 'intermediate', xpMin: 300, xpMax: 700, isBridge: true, unlocksAfter: 'CF6', description: 'A company you hold just saw its auditor resign overnight citing "inability to obtain information".', niftyChange: -5 },
  { id: 'SR011', title: 'The Short-Seller Report', category: 'corruption', difficulty: 'advanced', xpMin: 400, xpMax: 900, isBridge: false, description: 'A US short-seller publishes a bombshell report alleging accounting fraud at India\'s 3rd largest group.', niftyChange: -20 },
  { id: 'SR013', title: 'India Enters Technical Recession', category: 'depression', difficulty: 'advanced', xpMin: 450, xpMax: 1000, isBridge: true, unlocksAfter: 'AE4', description: 'Two consecutive quarters of negative GDP growth. Unemployment spikes. Every sector is down.', niftyChange: -40 },
];

const CATEGORY_COLORS: Record<string, string> = {
  market: 'bg-blue-100 text-blue-700',
  geopolitical: 'bg-red-100 text-red-700',
  corruption: 'bg-orange-100 text-orange-700',
  depression: 'bg-purple-100 text-purple-700',
  sectoral: 'bg-green-100 text-green-700',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function RoundsHome() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'market', 'geopolitical', 'corruption', 'depression', 'sectoral'];
  const filteredRounds = activeCategory === 'all' ? ROUNDS : ROUNDS.filter(r => r.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-primary mb-1 flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
          Situation Rounds
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          These aren't quizzes. These are real market crises. Make your decision. Live with the outcome.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize flex-shrink-0 transition-colors ${
              activeCategory === cat ? 'brand-gradient text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rounds grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRounds.map((round, i) => (
          <motion.div
            key={round.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/rounds/${round.id}`}>
              <div className="bg-white rounded-2xl border border-border p-5 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${CATEGORY_COLORS[round.category]}`}>
                      {round.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${DIFFICULTY_COLORS[round.difficulty]}`}>
                      {round.difficulty}
                    </span>
                    {round.isBridge && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                        Bridge
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground flex-shrink-0">{round.id}</div>
                </div>

                <h3 className="font-bold text-foreground mb-2">{round.title}</h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Nifty {round.niftyChange}%
                  </div>
                  {round.historicalDate && (
                    <span className="text-xs text-muted-foreground">· {round.historicalDate}</span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{round.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                    <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {round.xpMin}–{round.xpMax} XP
                  </div>
                  {round.unlocksAfter && (
                    <div className="text-xs text-muted-foreground">
                      After {round.unlocksAfter}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
