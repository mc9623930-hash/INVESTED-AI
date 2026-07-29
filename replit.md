# InvesEd AI — Project Documentation

## Overview
**InvesEd AI** is India's first AI-powered investment learning platform for teens. Built as a React + TypeScript + TailwindCSS + Vite single-page application with Firebase authentication.

## Architecture
- **Monorepo**: pnpm workspace at `/home/runner/workspace`
- **Web App**: `artifacts/invesed-ai/` — React + Vite, previewPath `/`
- **API Server**: `artifacts/api-server/` — Express backend

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS v4, Vite
- **Auth**: Firebase Auth (Google OAuth + email/password)
- **Animation**: Framer Motion
- **Charts**: Recharts (AreaChart, PieChart, RadarChart)
- **Forms**: react-hook-form
- **Toasts**: react-hot-toast
- **Routing**: wouter
- **State**: React Context (AuthContext + UserContext)

## Brand Design
- **Primary**: #1E3A5F (deep navy)
- **Accent**: #2E86AB (ocean blue)
- **Success**: #1B6B3A (forest green)
- **Font**: Inter
- **Border radius**: 0.625rem

## Key Features
1. **Landing Page** — Animated logo, hero, stats, 6-feature grid, how-it-works, Coursera CTA
2. **Auth** — 3-step signup (email → profile → avatar), Google OAuth, login page
3. **Risk Quiz Onboarding** — 12-question animated quiz with risk scoring algorithm
4. **Academy** — 6 core modules (CF1–CF6 free) + 4 advanced (AE1–AE4 Pro), lesson content, SIP calculator widget, XP rewards
5. **Portfolio Simulator** — Virtual ₹1,00,000 capital, area chart, pie chart allocation, holdings table, AI behavioural coach
6. **Research Lab** — Stocks (10 NSE) + Mutual Funds (5) list, stock detail with price chart, fundamentals, risk radar, analyst view, news
7. **Situation Rounds** — 8 crisis scenarios (COVID crash, rate hike, auditor resignation, etc.) with decision trees and consequence reveal
8. **Leaderboard** — Podium + full rankings by XP and portfolio return
9. **Profile** — XP bar, level, badges, risk profile, quick nav, Pro upgrade CTA

## Data
All data is **mock** (no backend required):
- **10 NSE Stocks**: RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, WIPRO, ZOMATO, TATAMOTORS, BAJFINANCE, HINDUNILVR
- **5 Mutual Funds**: SBI Nifty 50 Index, Parag Parikh Flexi Cap, Mirae Emerging Bluechip, Axis Small Cap, HDFC ELSS

## File Structure
```
artifacts/invesed-ai/src/
├── App.tsx                         — Router + Provider wiring
├── index.css                       — Brand theme (TailwindCSS v4)
├── types/index.ts                  — Full TypeScript schema
├── context/
│   ├── AuthContext.tsx             — Firebase auth context
│   └── UserContext.tsx             — User profile, XP, badges
├── services/firebase.ts            — Firebase init
├── data/marketData.ts              — 10 stocks + 5 MF mock data
├── utils/
│   ├── formatters.ts               — ₹ INR formatters
│   └── riskScorer.ts               — 12-Q weighted risk algorithm
├── components/
│   ├── layout/Navbar.tsx           — Responsive navbar with XP display
│   └── gamification/
│       ├── XPBar.tsx               — Animated XP progress bar
│       └── XPToast.tsx             — XP earned popup
└── pages/
    ├── Landing.tsx
    ├── Auth/Login.tsx
    ├── Auth/SignUp.tsx
    ├── Onboarding/RiskQuiz.tsx
    ├── Onboarding/OnboardingResult.tsx
    ├── Academy/AcademyHome.tsx
    ├── Academy/ModuleView.tsx
    ├── Academy/LessonView.tsx
    ├── Simulator/Portfolio.tsx
    ├── Research/ResearchHome.tsx
    ├── Research/StockDetail.tsx
    ├── SituationRounds/RoundsHome.tsx
    ├── SituationRounds/RoundPlay.tsx
    ├── Leaderboard/Leaderboard.tsx
    └── Profile/Profile.tsx
```

## XP / Leveling System
Levels: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000] XP thresholds
- Lesson complete: +30–45 XP
- Module complete: +200–450 XP
- Situation Round: +75–300 XP (quality multiplier)

## Firebase Config
Firebase credentials come from environment variables (VITE_FIREBASE_*). Falls back to demo values for local dev. Set real values for production.

## Deployment
Ready to deploy. Run `suggest_deploy` when ready.
