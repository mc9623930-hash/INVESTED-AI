import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPToastProps {
  amount: number;
  message?: string;
}

export function XPToast({ amount, message }: XPToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.8 }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl brand-gradient text-white shadow-lg"
    >
      <Zap className="w-5 h-5 text-amber-300 fill-amber-300 flex-shrink-0" />
      <div>
        <div className="font-bold text-base">+{amount} XP</div>
        {message && <div className="text-xs opacity-80">{message}</div>}
      </div>
    </motion.div>
  );
}
