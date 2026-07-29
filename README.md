# InvesEd AI — InvestSim for Teens
## Masters' Union AI Buildathon 2026

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen)](https://mc9623930-hash.github.io/INVESTED-AI/)
[![Repository](https://img.shields.io/badge/GitHub-INVESTED--AI-blue)](https://github.com/mc9623930-hash/INVESTED-AI)

**InvesEd AI** is India's first AI-powered investment learning platform designed specifically for teens. Built with virtual money, real Indian stock market context (NSE/BSE), crisis simulation rounds, and an interactive AI Coach.

---

## ⚡ Quick Links & Live Application

- 🌐 **Live Application**: [https://mc9623930-hash.github.io/INVESTED-AI/](https://mc9623930-hash.github.io/INVESTED-AI/)
- 🚀 **Instant Guest Access**: No signup or Firebase keys required — click **⚡ Instant Guest Access** to enter immediately with ₹1,00,000 virtual capital.
- 📦 **GitHub Repository**: [https://github.com/mc9623930-hash/INVESTED-AI](https://github.com/mc9623930-hash/INVESTED-AI)

---

## 📚 Project Documentation

1. **`attached_assets/TECH_STACK_1776506157262.md`** — Technical stack, project structure, conventions
2. **`attached_assets/DATA_SCHEMA_1776506157259.md`** — All TypeScript data schemas (User, Portfolio, Trade, Quiz, SituationRound)
3. **`attached_assets/PROTOTYPE_SPEC_1776506157261.md`** — Complete specification for all 7 modules
4. **`attached_assets/DEMO_FLOW_1776506157262.md`** — 5-minute judge demo walkthrough script
5. **`attached_assets/PRD_1776506157262.md`** — Product requirements document

---

## 🛠️ Features Included

- **Academy & Certification**: 6 structured modules covering stock fundamentals, mutual funds, SIPs, risk management, and market mechanics.
- **Virtual Investment Simulator**: Trade 10+ Indian stocks (Reliance, TCS, HDFC, Zomato, etc.) & Mutual Funds with ₹1,00,000 virtual capital.
- **Situation Crisis Rounds**: Test your psychology through simulated market crashes, war escalation, auditor resignations, and recession scenarios.
- **AI Coach**: Interactive AI guidance flagging risky trades and explaining financial concepts.
- **Gamification & Leaderboard**: Leveling system, XP points, badges, and national leaderboards.

---

## 🚀 Running Locally

### Prerequisites
- Node.js `20+`
- pnpm `9+` (or `npx pnpm`)

### Steps
```bash
# 1. Install workspace dependencies
npx pnpm install

# 2. Run the web application locally
npx pnpm --filter @workspace/invesed-ai run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🔑 Environment Variables (Optional)

Create a `.env` file in `artifacts/invesed-ai/.env` if you wish to connect your own live Firebase project:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=invest-ed-fa52e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=invest-ed-fa52e
VITE_FIREBASE_STORAGE_BUCKET=invest-ed-fa52e.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=717222508122
VITE_FIREBASE_APP_ID=1:717222508122:web:409ac35127ec3e88980a63
```

---

## 🎨 Key Conventions & Design Rules

- **Currency:** Always formatted as `₹X,XX,XXX` (Indian Rupee formatting).
- **Design:** Modern dark glassmorphism, responsive for mobile & desktop screens.
- **Navigation Base:** `/INVESTED-AI/` base route for GitHub Pages compatibility.
