import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import { calculateRiskScore } from '../../utils/riskScorer';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'You get ₹2,000 pocket money. What do you usually do?',
    options: ['Save all of it', 'Save some, spend the rest', 'Spend most of it', 'Spend all of it'],
  },
  {
    id: 'q2',
    text: 'You see a new game for ₹800 on sale for today only. You have ₹1,000 saved.',
    options: ['Buy immediately — it\'s a deal!', 'Think about it for 2 days', 'Skip it and save the money', 'Ask parents first'],
  },
  {
    id: 'q3',
    text: 'Your friend asks you to split a ₹500 Zomato order. You have ₹400 left this month.',
    options: ['Pay it, figure it out later', 'Politely decline', 'Ask to split ₹250 each', 'Charge it to next month'],
  },
  {
    id: 'q4',
    text: 'If you had ₹10,000, how long would it take you to spend it?',
    options: ['Same week', 'Same month', '3–6 months', 'Would invest it'],
  },
  {
    id: 'q5',
    text: 'You invested ₹5,000 virtually. It drops to ₹4,000 in a week. What do you do?',
    options: ['Sell everything immediately', 'Sell half to be safe', 'Hold and wait it out', 'Buy more at this lower price'],
  },
  {
    id: 'q6',
    text: 'Which investment sounds most exciting to you?',
    options: ['Safe FD at 7% guaranteed', 'Mutual fund — might give 0% to 25%', 'Stock — might give -30% to 100%', 'Not interested in any'],
  },
  {
    id: 'q7',
    text: 'You flip a coin. Heads = win ₹1,000. Tails = lose ₹500. Do you play?',
    options: ['Yes, great odds!', 'No, too risky', 'Only if I can afford to lose ₹500', 'Depends on my mood'],
  },
  {
    id: 'q8',
    text: 'Your investment is down 25% after 3 months. What do you tell yourself?',
    options: ['I knew this was risky from the start', 'Markets fluctuate — this will recover', 'I should have kept it in FD', 'I need to rethink everything'],
  },
  {
    id: 'q9',
    text: 'Why do you want to learn investing?',
    options: ['Save for something specific', 'Build long-term wealth', 'Understand how money works', 'Beat friends on a leaderboard'],
  },
  {
    id: 'q10',
    text: "What's your investment time horizon?",
    options: ['Less than 1 year', '1–3 years', '3–7 years', '10+ years'],
  },
  {
    id: 'q11',
    text: 'What is a mutual fund?',
    options: ['A type of savings account', 'A pool of money invested in stocks/bonds', 'A type of bank loan', "I don't know"],
  },
  {
    id: 'q12',
    text: 'What is a SIP?',
    options: ['A loan repayment method', 'Investing a fixed amount every month', 'A type of insurance plan', "I don't know"],
  },
];

const CATEGORY_LABELS = ['Spending Habits', 'Spending Habits', 'Spending Habits', 'Spending Habits', 'Risk Tolerance', 'Risk Tolerance', 'Risk Tolerance', 'Risk Tolerance', 'Financial Goals', 'Financial Goals', 'Knowledge', 'Knowledge'];

export default function RiskQuiz() {
  const [, navigate] = useLocation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const progress = ((current) / QUESTIONS.length) * 100;
  const question = QUESTIONS[current];

  const handleSelect = (idx: number) => {
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];

    if (current === QUESTIONS.length - 1) {
      // Complete
      const result = calculateRiskScore(newAnswers);
      sessionStorage.setItem('riskQuizResult', JSON.stringify({ ...result, answers: newAnswers }));
      navigate('/onboarding/result');
    } else {
      setAnswers(newAnswers);
      setSelected(null);
      setCurrent(current + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="glass border-b border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-primary text-sm">InvesEd AI</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Question <span className="text-foreground font-bold">{current + 1}</span> of {QUESTIONS.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full brand-gradient"
        />
      </div>

      {/* Category label */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-6">
        <div className="flex items-center gap-2 mb-2">
          {['Spending Habits', 'Risk Tolerance', 'Financial Goals', 'Knowledge'].map((cat, i) => {
            const active = CATEGORY_LABELS[current] === cat;
            return (
              <div
                key={cat}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${active ? 'brand-gradient text-white' : 'bg-muted text-muted-foreground'}`}
              >
                {cat}
              </div>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-8 leading-snug">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    selected === idx
                      ? 'border-primary bg-primary/8 shadow-md'
                      : 'border-border bg-white hover:border-primary/50 hover:bg-primary/4'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                    selected === idx ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {selected === idx && <CheckCircle2 className="w-4 h-4 text-white fill-white" />}
                  </div>
                  <span className={`font-medium text-sm sm:text-base ${selected === idx ? 'text-primary' : 'text-foreground'}`}>
                    {option}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <div className="mt-8">
          <motion.button
            whileHover={selected !== null ? { scale: 1.02 } : {}}
            whileTap={selected !== null ? { scale: 0.98 } : {}}
            onClick={handleNext}
            disabled={selected === null}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              selected !== null
                ? 'brand-gradient text-white shadow-lg cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {current === QUESTIONS.length - 1 ? 'See My Profile' : 'Next Question'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {current > 0 && (
            <button
              onClick={() => { setCurrent(current - 1); setSelected(answers[current - 1] ?? null); setAnswers(answers.slice(0, -1)); }}
              className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
