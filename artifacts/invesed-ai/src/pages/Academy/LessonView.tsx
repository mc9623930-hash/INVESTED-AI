import { useState } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { XPToast } from '../../components/gamification/XPToast';

const SIPCalculator = () => {
  const [monthly, setMonthly] = useState(1000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  const totalInvested = monthly * years * 12;
  const months = years * 12;
  const r = rate / 100 / 12;
  const futureValue = r > 0
    ? monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
    : monthly * months;
  const gains = futureValue - totalInvested;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
      <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
        <span>📊</span> SIP Calculator
      </h4>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium">Monthly SIP</span>
            <span className="font-bold text-primary">₹{monthly.toLocaleString('en-IN')}</span>
          </div>
          <input type="range" min={100} max={50000} step={100} value={monthly} onChange={e => setMonthly(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium">Duration</span>
            <span className="font-bold text-primary">{years} years</span>
          </div>
          <input type="range" min={1} max={30} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium">Expected Return</span>
            <span className="font-bold text-primary">{rate}% p.a.</span>
          </div>
          <input type="range" min={4} max={24} value={rate} onChange={e => setRate(+e.target.value)} className="w-full accent-primary" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Total Invested</div>
          <div className="font-bold text-sm">₹{(totalInvested / 100000).toFixed(1)}L</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="text-xs text-green-600 mb-1">Gains</div>
          <div className="font-bold text-sm text-green-700">₹{(gains / 100000).toFixed(1)}L</div>
        </div>
        <div className="text-center p-3 bg-primary/10 rounded-xl border border-primary/20">
          <div className="text-xs text-primary mb-1">Corpus</div>
          <div className="font-bold text-sm text-primary">₹{(futureValue / 100000).toFixed(1)}L</div>
        </div>
      </div>
    </div>
  );
};

const LESSON_CONTENT: Record<string, { title: string; duration: number; content: string; keyTakeaway: string; xp: number }> = {
  'CF1-L1': {
    title: 'Why Your Pocket Money Matters',
    duration: 5,
    xp: 30,
    keyTakeaway: 'Money is a tool — how you treat ₹100 today shapes how you handle ₹1,00,000 tomorrow.',
    content: `Money is more than just paper. Every rupee you receive is a decision waiting to be made.

Most teens see pocket money as "spending money." But every rupee you don't spend is a rupee working for you. The habits you build with ₹500 per month will determine how you handle your first salary.

Think about it this way: if you get ₹2,000 per month and save just 25% (₹500), that's ₹6,000 per year. Over 5 years, that's ₹30,000 before even counting returns. Now imagine that ₹30,000 invested at 12% per year.

The point isn't the amount. The point is the habit.`,
  },
  'CF1-L2': {
    title: 'The Magic of Saving Early',
    duration: 6,
    xp: 35,
    keyTakeaway: 'Starting 10 years early can give you 3× the wealth at retirement — this is the compound interest effect.',
    content: `Time is the most powerful financial force in the universe. Einstein called compound interest the "eighth wonder of the world" and said those who understand it earn it, those who don't pay it.

Let's compare two friends:
- Aditi starts investing ₹1,000/month at age 16 and stops at 26 (invests for 10 years only)
- Rohan starts investing ₹1,000/month at age 26 and continues until 60 (invests for 34 years)

Assuming 12% annual returns:
- Aditi's total investment: ₹1,20,000
- Aditi's corpus at 60: ₹1.27 Crore

- Rohan's total investment: ₹4,08,000
- Rohan's corpus at 60: ₹60 Lakh

Aditi invested 3.4× less money but ended up with more than twice as much — just by starting 10 years earlier.`,
  },
  'CF4-L4': {
    title: 'SIP — Rupee Cost Averaging',
    duration: 8,
    xp: 45,
    keyTakeaway: 'SIP automatically buys more units when prices fall and fewer when prices rise — making market dips work in your favour.',
    content: `A Systematic Investment Plan (SIP) is simply investing a fixed amount at fixed intervals — like ₹500 every month in a mutual fund.

The magic is called Rupee Cost Averaging (RCA).

When the market is high, your ₹500 buys fewer units.
When the market is low (which scares most people), your ₹500 buys MORE units.

Over time, your average cost per unit is lower than the average market price. This means even if you had terrible timing and started your SIP just before a market crash, you'd actually come out ahead of someone who tried to time the market perfectly.

Try the calculator below — see how ₹500/month for 10 years at 12% grows to over ₹11.5 lakhs from just ₹60,000 invested.`,
  },
};

export default function LessonView() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const [, navigate] = useLocation();
  const { addXP } = useUser();
  const [completed, setCompleted] = useState(false);

  const lesson = lessonId ? LESSON_CONTENT[lessonId] : null;

  const showSIPCalc = lessonId === 'CF4-L4' || lessonId === 'CF1-L2';

  const handleComplete = () => {
    if (completed) return;
    const xp = lesson?.xp || 30;
    addXP(xp);
    toast.custom(<XPToast amount={xp} message="Lesson Complete!" />);
    setCompleted(true);
  };

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href={`/academy/${moduleId}`}>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Module
          </button>
        </Link>
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Content Coming Soon</h2>
          <p className="text-muted-foreground text-sm mb-4">This lesson is being prepared. Check back soon!</p>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-secondary">
            <Zap className="w-4 h-4 text-amber-500" />
            +30 XP available when live
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href={`/academy/${moduleId}`}>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to {moduleId}
        </button>
      </Link>

      {/* Lesson header */}
      <div className="mb-6">
        <div className="text-xs font-bold text-muted-foreground mb-1">{moduleId} · {lessonId}</div>
        <h1 className="text-2xl font-black text-foreground mb-2">{lesson.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{lesson.duration} min read</span>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-600 font-medium">+{lesson.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="prose prose-sm max-w-none">
          {lesson.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-foreground/90 leading-relaxed mb-4 last:mb-0">{para}</p>
          ))}
        </div>

        {showSIPCalc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <SIPCalculator />
          </motion.div>
        )}
      </div>

      {/* Key takeaway */}
      <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-6">
        <div className="text-xs font-bold text-secondary mb-1">KEY TAKEAWAY</div>
        <p className="text-sm font-medium text-foreground">{lesson.keyTakeaway}</p>
      </div>

      {/* Complete button */}
      <motion.button
        whileHover={!completed ? { scale: 1.01 } : {}}
        whileTap={!completed ? { scale: 0.99 } : {}}
        onClick={handleComplete}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          completed
            ? 'bg-green-500 text-white cursor-default'
            : 'brand-gradient text-white shadow-lg cursor-pointer'
        }`}
      >
        {completed ? (
          <>Completed! +{lesson.xp} XP earned</>
        ) : (
          <>
            Mark Complete & Claim {lesson.xp} XP
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
          </>
        )}
      </motion.button>

      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <Link href={`/academy/${moduleId}`}>
            <button className="flex items-center gap-1.5 text-secondary font-semibold text-sm mx-auto hover:underline">
              Back to Module <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
