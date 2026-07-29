import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const XP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000];

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
}

export function XPBar({ xp, level, compact = false }: XPBarProps) {
  const currentLevelXP = XP_PER_LEVEL[level - 1] || 0;
  const nextLevelXP = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  const progressXP = xp - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const percent = Math.min((progressXP / requiredXP) * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs font-medium">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{xp} XP</span>
          <span className="text-muted-foreground">· Lv{level}</span>
        </div>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full brand-gradient rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 font-semibold">
          <div className="w-6 h-6 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold">
            {level}
          </div>
          <span>Level {level}</span>
        </div>
        <div className="text-muted-foreground text-xs">
          {progressXP} / {requiredXP} XP to next level
        </div>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full brand-gradient rounded-full"
        />
      </div>
    </div>
  );
}
