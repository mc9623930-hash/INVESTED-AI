import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Brain } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import type { RiskProfile } from '../../types';

interface QuizResult {
  score: number;
  type: 'conservative' | 'moderate' | 'aggressive';
  label: 'Wealth Builder' | 'Balanced Investor' | 'Growth Seeker';
  characteristics: string[];
  recommendedPath: string;
  answers: number[];
}

const PROFILE_CONFIG = {
  conservative: {
    emoji: '🛡️',
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    description: 'You value capital safety over high growth. Perfect for starting with FDs, bonds, and large-cap mutual funds.',
  },
  moderate: {
    emoji: '⚖️',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    description: 'You balance growth with manageable risk. Mutual funds, index funds, and selective blue-chip stocks are your path.',
  },
  aggressive: {
    emoji: '🚀',
    color: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    description: 'You embrace risk for higher returns. Direct stocks, sectoral funds, and IPOs will fuel your growth journey.',
  },
};

export default function OnboardingResult() {
  const [, navigate] = useLocation();
  const { setRiskProfile } = useUser();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [estimatedCapital, setEstimatedCapital] = useState('');
  const [goal, setGoal] = useState('long-term');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('riskQuizResult');
    if (stored) {
      setResult(JSON.parse(stored));
      setTimeout(() => setShown(true), 400);
    } else {
      navigate('/onboarding/quiz');
    }
  }, [navigate]);

  if (!result) return null;

  const config = PROFILE_CONFIG[result.type];

  const handleStart = () => {
    const profile: RiskProfile = {
      type: result.type,
      label: result.label,
      score: result.score,
      completedAt: Date.now(),
      estimatedCapital: parseInt(estimatedCapital) || 0,
      investmentGoal: goal as 'short-term' | 'long-term' | 'both',
      knowledgeLevel: 'none',
    };
    setRiskProfile(profile);
    toast.success(`You're a ${result.label}! Let's start learning.`);
    navigate('/academy');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-primary">InvesEd AI</span>
        </div>

        {/* Profile reveal */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={shown ? { y: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className={`text-center mb-6 p-8 rounded-3xl bg-gradient-to-br ${config.color} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
            <div className="relative">
              <div className="text-5xl mb-3">{config.emoji}</div>
              <div className="text-sm font-medium opacity-80 mb-1">Your Investor Profile</div>
              <div className="text-3xl font-black mb-2">{result.label}</div>
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                Risk Score: {result.score}/100
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shown ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-border p-5 mb-4"
        >
          <p className="text-foreground text-sm leading-relaxed mb-4">{config.description}</p>

          <div className="space-y-2">
            {result.characteristics.map((char, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${config.text.replace('text-', 'bg-')}`} />
                <span className="text-foreground/80">{char}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Starting capital callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shown ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-border p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-muted-foreground">Starting Virtual Capital</span>
          </div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-3xl font-black text-gradient"
          >
            ₹1,00,000
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1">Free tier — Upgrade to Pro for ₹10,00,000</div>
        </motion.div>

        {/* Optional extra inputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shown ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-border p-5 mb-6"
        >
          <h3 className="text-sm font-semibold mb-3">Optional — helps personalise your experience</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Monthly pocket money / savings (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₹</span>
                <input
                  type="number"
                  value={estimatedCapital}
                  onChange={(e) => setEstimatedCapital(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full pl-8 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Primary Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="short-term">Save for something specific (short-term)</option>
                <option value="long-term">Build long-term wealth</option>
                <option value="both">Both short and long-term</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Recommended path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shown ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <div className={`flex items-center gap-3 p-4 rounded-xl ${config.bg} ${config.border} border mb-4`}>
            <Brain className={`w-5 h-5 ${config.text} flex-shrink-0`} />
            <div>
              <div className="text-xs font-medium text-muted-foreground">Recommended first step</div>
              <div className={`text-sm font-semibold ${config.text}`}>{result.recommendedPath}</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full py-4 brand-gradient text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            Start Learning
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
