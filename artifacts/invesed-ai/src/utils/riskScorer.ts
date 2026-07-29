export interface RiskQuizResult {
  score: number;
  type: 'conservative' | 'moderate' | 'aggressive';
  label: 'Wealth Builder' | 'Balanced Investor' | 'Growth Seeker';
  characteristics: string[];
  recommendedPath: string;
}

const QUESTION_WEIGHTS = [
  // Q1-Q4: Spending habits (weight: 1.0 each)
  { category: 'spending', weight: 1.0 },
  { category: 'spending', weight: 1.0 },
  { category: 'spending', weight: 1.0 },
  { category: 'spending', weight: 1.0 },
  // Q5-Q8: Risk tolerance (weight: 1.5 each)
  { category: 'risk', weight: 1.5 },
  { category: 'risk', weight: 1.5 },
  { category: 'risk', weight: 1.5 },
  { category: 'risk', weight: 1.5 },
  // Q9-Q10: Financial goals (weight: 1.2 each)
  { category: 'goals', weight: 1.2 },
  { category: 'goals', weight: 1.2 },
  // Q11-Q12: Knowledge baseline (weight: 0.8 each)
  { category: 'knowledge', weight: 0.8 },
  { category: 'knowledge', weight: 0.8 },
];

const OPTION_SCORES: number[][] = [
  // Q1: Pocket money
  [8, 6, 3, 1],
  // Q2: Sale game
  [1, 5, 9, 6],
  // Q3: Zomato split
  [2, 9, 7, 4],
  // Q4: ₹10,000 spending
  [1, 3, 7, 10],
  // Q5: Investment drops
  [1, 4, 8, 10],
  // Q6: Investment type
  [3, 6, 9, 1],
  // Q7: Coin flip
  [8, 2, 7, 5],
  // Q8: Investment down 25%
  [7, 10, 3, 2],
  // Q9: Why invest
  [5, 10, 7, 3],
  // Q10: Time horizon
  [2, 5, 8, 10],
  // Q11: Mutual fund knowledge
  [2, 10, 2, 4],
  // Q12: SIP knowledge
  [2, 10, 2, 4],
];

export function calculateRiskScore(answers: number[]): RiskQuizResult {
  if (answers.length !== 12) {
    return {
      score: 50,
      type: 'moderate',
      label: 'Balanced Investor',
      characteristics: [],
      recommendedPath: 'Start with CF1 — Money & You',
    };
  }

  let totalScore = 0;
  let totalWeight = 0;

  answers.forEach((answer, index) => {
    const rawScore = OPTION_SCORES[index][answer] || 5;
    const weight = QUESTION_WEIGHTS[index].weight;
    totalScore += rawScore * weight;
    totalWeight += 10 * weight;
  });

  const normalizedScore = Math.round((totalScore / totalWeight) * 100);

  if (normalizedScore <= 40) {
    return {
      score: normalizedScore,
      type: 'conservative',
      label: 'Wealth Builder',
      characteristics: [
        'You prefer stability and predictable returns',
        'Safety of capital matters more than high growth',
        'FDs and debt funds are your comfort zone',
      ],
      recommendedPath: 'Start with CF1 — Money & You',
    };
  } else if (normalizedScore <= 70) {
    return {
      score: normalizedScore,
      type: 'moderate',
      label: 'Balanced Investor',
      characteristics: [
        'You balance growth with manageable risk',
        'Mutual funds and index funds are your sweet spot',
        'You can hold through short-term volatility',
      ],
      recommendedPath: 'Start with CF1 — Money & You',
    };
  } else {
    return {
      score: normalizedScore,
      type: 'aggressive',
      label: 'Growth Seeker',
      characteristics: [
        'You chase high returns and accept higher risk',
        'Direct stocks and sectoral funds excite you',
        'Long-term wealth creation is your goal',
      ],
      recommendedPath: 'Start with CF1 — Money & You',
    };
  }
}
