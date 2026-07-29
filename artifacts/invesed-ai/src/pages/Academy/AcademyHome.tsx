import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle2, ChevronRight, Zap, Award, Clock } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const CORE_MODULES = [
  { id: 'CF1', title: 'Money & You', desc: 'Pocket money, saving, compound interest, time value of money', lessons: 5, xp: 200, icon: '💰', free: true },
  { id: 'CF2', title: 'What is Investing?', desc: 'Inflation, why FD alone fails, asset classes overview', lessons: 4, xp: 250, icon: '📈', free: true, prereq: 'CF1' },
  { id: 'CF3', title: 'Stocks Explained', desc: 'Shares, BSE/NSE, bulls & bears, market cap, stock mechanics', lessons: 5, xp: 300, icon: '📊', free: true, prereq: 'CF2' },
  { id: 'CF4', title: 'Mutual Funds & SIPs', desc: 'NAV, units, fund types, SIP, AMCs, SEBI, expense ratio', lessons: 5, xp: 300, icon: '🏦', free: true, prereq: 'CF3' },
  { id: 'CF5', title: 'Risk & Returns', desc: 'Risk-return tradeoff, diversification, correlation', lessons: 4, xp: 250, icon: '⚡', free: true, prereq: 'CF4' },
  { id: 'CF6', title: 'How to Research', desc: 'Balance sheet basics, P/E, revenue growth, fund fact sheets', lessons: 4, xp: 300, icon: '🔍', free: true, prereq: 'CF5' },
];

const ADVANCED_MODULES = [
  { id: 'AE1', title: 'Technical Analysis', desc: 'Candlesticks, moving averages, support & resistance levels', lessons: 5, xp: 400, icon: '📉', prereq: 'CF6' },
  { id: 'AE2', title: 'Fundamental Analysis', desc: 'DCF simplified, moat concept, reading quarterly results', lessons: 6, xp: 450, icon: '🔬', prereq: 'AE1' },
  { id: 'AE3', title: 'Portfolio Construction', desc: 'Asset allocation, rebalancing, tax efficiency (ELSS, LTCG)', lessons: 5, xp: 400, icon: '🗂️', prereq: 'AE2' },
  { id: 'AE4', title: 'Behavioural Finance', desc: 'Loss aversion, FOMO, herd mentality, AI-detected patterns', lessons: 4, xp: 350, icon: '🧠', prereq: 'AE3' },
];

interface ModuleCardProps {
  module: typeof CORE_MODULES[0] & { prereq?: string; free?: boolean };
  completed: boolean;
  locked: boolean;
  isPro?: boolean;
}

function ModuleCard({ module, completed, locked, isPro }: ModuleCardProps) {
  const content = (
    <motion.div
      whileHover={!locked ? { y: -2 } : {}}
      className={`bg-white rounded-2xl border border-border p-5 relative overflow-hidden transition-shadow ${!locked ? 'hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
    >
      {isPro && !completed && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
          Pro
        </div>
      )}
      {completed && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
        </div>
      )}
      {locked && !isPro && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      <div className="text-3xl mb-3">{module.icon}</div>
      <div className="text-xs font-bold text-muted-foreground mb-1">{module.id}</div>
      <h3 className="font-bold text-foreground mb-1">{module.title}</h3>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{module.desc}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{module.lessons} lessons</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="text-amber-600 font-medium">+{module.xp} XP</span>
        </div>
      </div>

      {!locked && !completed && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-secondary">
          Start module <ChevronRight className="w-3 h-3" />
        </div>
      )}
      {completed && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-600">
          Completed <ChevronRight className="w-3 h-3" />
        </div>
      )}
      {locked && !isPro && (
        <div className="mt-3 text-xs text-muted-foreground">Complete {module.prereq} first</div>
      )}
    </motion.div>
  );

  if (locked) return content;
  return <Link href={`/academy/${module.id}`}>{content}</Link>;
}

export default function AcademyHome() {
  const { completedModules } = useUser();

  const totalModules = CORE_MODULES.length + ADVANCED_MODULES.length;
  const completedCount = completedModules.length;
  const progressPercent = (completedCount / totalModules) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary mb-2 flex items-center gap-2">
          <BookOpen className="w-7 h-7" />
          InvesEd Academy
        </h1>
        <p className="text-muted-foreground">Learn investing the right way — structured, interactive, and built for Indian teens</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-foreground">Certification Progress</div>
            <div className="text-sm text-muted-foreground">{completedCount} of {totalModules} modules completed</div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8 }}
            className="h-full brand-gradient rounded-full"
          />
        </div>
      </div>

      {/* Coursera banner */}
      <div className="bg-gradient-to-r from-primary/8 to-secondary/8 border border-primary/20 rounded-2xl p-4 mb-8 flex items-center gap-4">
        <Award className="w-10 h-10 text-primary flex-shrink-0" />
        <div className="flex-1">
          <div className="font-bold text-primary text-sm">Earn a Coursera-verified certificate on completion</div>
          <div className="text-xs text-muted-foreground">Official Content Partner — Verifiable on LinkedIn</div>
        </div>
        <div className="px-3 py-1.5 rounded-full border border-primary/30 text-xs font-semibold text-primary">
          Free + Coursera
        </div>
      </div>

      {/* Core Track */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">Core Track</div>
          <div className="text-sm text-muted-foreground">Free · CF1–CF6</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_MODULES.map((mod, i) => {
            const completed = completedModules.includes(mod.id);
            const prereqDone = !mod.prereq || completedModules.includes(mod.prereq);
            const locked = !prereqDone && !completed;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ModuleCard module={mod} completed={completed} locked={locked} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Advanced Track */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold">Advanced Track</div>
          <div className="text-sm text-muted-foreground">Pro · AE1–AE4</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADVANCED_MODULES.map((mod, i) => {
            const completed = completedModules.includes(mod.id);
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ModuleCard module={mod} completed={completed} locked={true} isPro />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
