import { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  BookOpen, BarChart2, TrendingUp, Brain, Trophy, Zap,
  ArrowRight, Play, CheckCircle2, Award
} from 'lucide-react';

const letters = 'InvesEd AI'.split('');

const stats = [
  { value: '50+', label: 'NSE Stocks' },
  { value: '20', label: 'Mutual Funds' },
  { value: '20+', label: 'Crisis Scenarios' },
];

const features = [
  {
    icon: BookOpen,
    title: 'Academy & Certification',
    desc: '6 course modules with Coursera co-branding',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: BarChart2,
    title: 'Virtual Simulator',
    desc: '₹1,00,000 virtual capital. Real NSE/BSE prices.',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: TrendingUp,
    title: 'SIP Simulator',
    desc: 'Set up virtual SIPs and watch compounding happen',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Zap,
    title: 'Crisis Rounds',
    desc: 'Political fallout, recession, war — test your thinking',
    color: 'bg-red-100 text-red-700',
  },
  {
    icon: Brain,
    title: 'AI Coach',
    desc: 'Powered by Claude. Watches every trade and flags mistakes',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    desc: 'Rank by portfolio, learning depth, and decision quality',
    color: 'bg-cyan-100 text-cyan-700',
  },
];

const steps = [
  { num: '01', title: 'Complete the Academy', desc: 'Learn through 6 structured modules with quizzes & calculators' },
  { num: '02', title: 'Unlock the Simulator', desc: 'Trade virtual ₹1,00,000 across stocks, MFs, and SIPs' },
  { num: '03', title: 'Learn from AI Coach', desc: 'Get personalised feedback on every trade decision you make' },
];

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>;
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptNiAwaDZ2LTZoLTZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          {/* Animated logo text */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center"
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex">
                {letters.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className={`text-4xl sm:text-5xl font-black text-white ${letter === ' ' ? 'mr-2' : ''}`}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white/90 text-sm font-medium mb-4"
          >
            InvestSim for Teens
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl font-medium text-white/90 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            India's first AI-powered investment learning platform for teens. <br className="hidden sm:block" />
            <span className="text-white font-semibold">Virtual money. Real markets. Real knowledge.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center gap-2 justify-center"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <button
              className="px-8 py-4 bg-white/15 text-white font-semibold rounded-xl text-lg border border-white/30 hover:bg-white/20 transition-colors flex items-center gap-2 justify-center"
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Demo
            </button>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl sm:text-4xl font-black text-gradient">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-3">Everything You Need to Invest Smart</h2>
          <p className="text-muted-foreground text-lg">6 powerful features built for Indian teens learning to invest</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">From zero to investor in three steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[-calc(50%-40px)] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-lg">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate showcase */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">InvesEd x Coursera Certificate</h2>
            <p className="text-white/80 text-lg mb-6 max-w-xl mx-auto">
              Complete all 6 modules and earn a verifiable certificate. Shareable. LinkedIn-ready. Proof you know investing.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['Shareable', 'Verifiable', 'LinkedIn-ready'].map((tag) => (
                <div key={tag} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {tag}
                </div>
              ))}
            </div>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl text-lg shadow-lg"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md brand-gradient flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-foreground">InvesEd AI</span>
        </div>
        <p>India's first AI-powered investment learning platform for teens</p>
        <p className="mt-1 text-xs opacity-70">100% virtual. No real money. Educational purpose only.</p>
      </footer>
    </div>
  );
}
