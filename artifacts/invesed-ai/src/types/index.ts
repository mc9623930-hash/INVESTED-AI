export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarId: string;
  dob: string;
  parentConsentGiven: boolean;
  createdAt: number;
  tier: 'free' | 'pro';
  proExpiresAt?: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastLoginDate: string;
  badges: string[];
  pinnedBadges: string[];
  riskProfile: RiskProfile;
  academyProgress: AcademyProgress;
  quizHistory: QuizAttempt[];
  situationRoundsCompleted: string[];
  portfolios: string[];
  activePortfolioId: string;
  watchlist: string[];
  researchHistory: ResearchEntry[];
  researchIntelligenceScore: number;
  certificatesEarned: Certificate[];
}

export type RiskProfile = {
  type: 'conservative' | 'moderate' | 'aggressive';
  label: 'Wealth Builder' | 'Balanced Investor' | 'Growth Seeker';
  score: number;
  completedAt: number;
  estimatedCapital: number;
  investmentGoal: 'short-term' | 'long-term' | 'both';
  knowledgeLevel: 'none' | 'basic' | 'intermediate';
};

export interface AcademyProgress {
  currentModuleId: string;
  completedModules: string[];
  completedLessons: string[];
  moduleScores: Record<string, number>;
  bridgeRoundsCompleted: string[];
  totalStudyTimeMinutes: number;
}

export interface Module {
  id: string;
  track: 'core' | 'advanced';
  title: string;
  description: string;
  requiredTier: 'free' | 'pro';
  lessons: Lesson[];
  finalQuizId: string;
  bridgeRoundId?: string;
  simulatorFeatureUnlocked?: string;
  xpReward: number;
  prerequisites: string[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  durationMinutes: number;
  videoUrl?: string;
  content: LessonContent[];
  keyTakeaway: string;
  quizId: string;
  xpReward: number;
}

export type LessonContent =
  | { type: 'text'; body: string }
  | { type: 'highlight'; body: string; variant: 'info' | 'warning' | 'tip' }
  | { type: 'example'; scenario: string; outcome: string }
  | { type: 'comparison'; leftLabel: string; rightLabel: string; rows: [string, string][] }
  | { type: 'calculator'; calcType: 'sip' | 'compound' | 'cagr' };

export interface QuizQuestion {
  id: string;
  moduleId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface QuizAttempt {
  quizId: string;
  moduleId: string;
  attemptedAt: number;
  score: number;
  timeTakenSeconds: number;
  answers: number[];
  passed: boolean;
  xpEarned: number;
}

export interface SituationRound {
  id: string;
  category: 'market' | 'geopolitical' | 'corruption' | 'depression' | 'sectoral';
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isBridgeRound: boolean;
  triggeredAfterModule?: string;
  unlocksSimulatorFeature?: string;
  context: string;
  marketCondition: {
    niftyChange: number;
    description: string;
    historicalDate?: string;
  };
  portfolioSnapshot?: PortfolioSnapshot;
  choices: SituationChoice[];
  allowOpenReasoning: boolean;
  outcomes: Record<string, SituationOutcome>;
  historicalContext: string;
  aiAnalysisPrompt: string;
  keyLearnings: string[];
  scoring: {
    decisionWeight: number;
    reasoningWeight: number;
    speedWeight: number;
    timeLimitSeconds: number;
  };
  xpReward: { min: number; max: number };
}

export interface SituationChoice {
  id: string;
  label: string;
  description: string;
  isOptimal: boolean;
  partialCredit?: number;
}

export interface SituationOutcome {
  immediateEffect: string;
  sixMonthOutcome: string;
  oneYearOutcome: string;
  keyLesson: string;
  portfolioImpact: number;
}

export interface SituationAttempt {
  roundId: string;
  userId: string;
  attemptedAt: number;
  choiceId: string;
  openReasoning?: string;
  aiScore: {
    decisionScore: number;
    reasoningScore: number;
    speedScore: number;
    totalScore: number;
    aiFeedback: string;
  };
  xpEarned: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  startingCapital: number;
  currentCash: number;
  holdings: Holding[];
  sips: SIPSetup[];
  trades: Trade[];
  snapshots: PortfolioSnapshot[];
  behaviouralFlags: BehaviouralFlag[];
  stats: PortfolioStats;
}

export interface Holding {
  ticker: string;
  type: 'stock' | 'mutualfund' | 'pms_virtual' | 'sif_virtual' | 'aif_virtual';
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  absoluteReturn: number;
  percentReturn: number;
  dayChange: number;
  sector?: string;
}

export interface SIPSetup {
  id: string;
  fundCode: string;
  fundName: string;
  monthlyAmount: number;
  startDate: string;
  frequency: 'monthly' | 'weekly';
  status: 'active' | 'paused' | 'stopped';
  installmentsCompleted: number;
  totalInvested: number;
  currentValue: number;
  xirr: number;
  nextDueDate: string;
}

export interface Trade {
  id: string;
  portfolioId: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  orderType: 'market' | 'limit' | 'stoploss';
  quantity: number;
  price: number;
  totalAmount: number;
  executedAt: number;
  userAnnotation?: string;
  aiFlag?: BehaviouralFlag;
}

export interface BehaviouralFlag {
  type: 'panic_sell' | 'chasing_returns' | 'over_concentration' | 'fomo' | 'sip_lapse' | 'great_trade';
  triggeredAt: number;
  ticker?: string;
  message: string;
  historicalContext: string;
  acknowledged: boolean;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  cash: number;
  investedValue: number;
  dayReturn: number;
  totalReturn: number;
  cagr: number;
}

export interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  cagr: number;
  bestTrade: string;
  worstTrade: string;
  panicSellCount: number;
  tradeCount: number;
  winRate: number;
  niftyBenchmark: number;
  vsNifty: number;
}

export interface StockData {
  ticker: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  industry: string;
  marketCap: number;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  week52High: number;
  week52Low: number;
  volume: number;
  fundamentals: {
    pe: number;
    pb: number;
    eps: number;
    revenueGrowth3Y: number;
    netProfitGrowth3Y: number;
    debtToEquity: number;
    dividendYield: number;
    roe: number;
    roce: number;
  };
  riskProfile: {
    compositeScore: number;
    volatilityRisk: number;
    businessRisk: number;
    financialRisk: number;
    regulatoryRisk: number;
    sentimentScore: number;
    beta: number;
    industryPeMedian: number;
  };
  priceHistory: PricePoint[];
  analystRatings: {
    buy: number;
    hold: number;
    sell: number;
    targetLow: number;
    targetMedian: number;
    targetHigh: number;
  };
  news: NewsItem[];
  promoterHolding: number;
  fiiHolding: number;
  diiHolding: number;
  promoterPledged: number;
}

export interface MutualFundData {
  code: string;
  name: string;
  amcName: string;
  category: 'large_cap' | 'mid_cap' | 'small_cap' | 'flexi_cap' | 'elss' | 'debt' | 'hybrid' | 'index';
  subCategory: string;
  aum: number;
  nav: number;
  expenseRatio: number;
  exitLoad: string;
  minSipAmount: number;
  riskRating: 'Low' | 'Moderate' | 'Moderately High' | 'High' | 'Very High';
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    sinceInception: number;
  };
  sipReturns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  riskMetrics: {
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    standardDeviation: number;
    beta: number;
    alpha: number;
  };
  topHoldings: { name: string; percent: number }[];
  sectorAllocation: { sector: string; percent: number }[];
  navHistory: PricePoint[];
  aiSuitabilityTag: string;
  aiSummary: string;
}

export interface ResearchEntry {
  ticker: string;
  type: 'stock' | 'fund';
  viewedAt: number;
  tabsViewed: string[];
  timeSpentSeconds: number;
  addedToWatchlist: boolean;
  subsequentlyInvested: boolean;
}

export interface PricePoint {
  date: string;
  price: number;
  volume?: number;
}

export interface NewsItem {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  summary: string;
}

export interface AdvancedVehicle {
  id: string;
  type: 'pms' | 'sif' | 'aif';
  name: string;
  provider: string;
  strategy: string;
  minimumInvestment: number;
  managementFee: number;
  performanceFee?: number;
  hurdleRate?: number;
  lockInPeriod?: string;
}

export interface Certificate {
  id: string;
  type: 'foundations' | 'expert';
  issuedAt: string;
  courseraVerifyUrl?: string;
  linkedInBadgeUrl?: string;
}

export type RiskQuizAnswer = {
  questionIndex: number;
  selectedOption: number;
  score: number;
};
