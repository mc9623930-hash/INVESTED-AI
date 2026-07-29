import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebase';

export interface Holding {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
  sector: string;
  type: 'stock' | 'fund';
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  ticker: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

export interface PortfolioSnapshot {
  date: string;
  value: number;
}

interface SimulatorState {
  cash: number;
  holdings: Holding[];
  transactions: Transaction[];
  history: PortfolioSnapshot[];
}

interface SimulatorContextType {
  cash: number;
  holdings: Holding[];
  transactions: Transaction[];
  history: PortfolioSnapshot[];
  buy: (item: { ticker: string; name: string; price: number; sector: string; type: 'stock' | 'fund' }, quantity: number) => string | null;
  sell: (ticker: string, quantity: number, currentPrice: number) => string | null;
  getTotalValue: (prices: Record<string, number>) => number;
  isLoaded: boolean;
}

const SimulatorContext = createContext<SimulatorContextType | null>(null);

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider');
  return ctx;
}

const STARTING_CASH = 100000;
const COLLECTION = 'simulatorData';

function makeInitialState(): SimulatorState {
  return { cash: STARTING_CASH, holdings: [], transactions: [], history: [] };
}

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulatorState>(makeInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const uidRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        uidRef.current = user.uid;
        try {
          const snap = await getDoc(doc(db, COLLECTION, user.uid));
          if (snap.exists()) {
            const d = snap.data();
            setState({
              cash: d.cash ?? STARTING_CASH,
              holdings: d.holdings ?? [],
              transactions: d.transactions ?? [],
              history: d.history ?? [],
            });
          } else {
            setState(makeInitialState());
          }
        } catch {
          setState(makeInitialState());
        }
        setIsLoaded(true);
      } else {
        uidRef.current = null;
        setState(makeInitialState());
        setIsLoaded(true);
      }
    });
    return unsub;
  }, []);

  const persist = useCallback((s: SimulatorState) => {
    const uid = uidRef.current;
    if (!uid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, COLLECTION, uid), {
          ...s,
          updatedAt: serverTimestamp(),
        }, { merge: false });
      } catch (e) {
        console.error('Simulator save failed', e);
      }
    }, 800);
  }, []);

  const addSnapshot = useCallback((newState: SimulatorState, prices: Record<string, number>): SimulatorState => {
    const today = new Date().toISOString().split('T')[0];
    const holdingValue = newState.holdings.reduce((sum, h) => {
      const price = prices[h.ticker] ?? h.avgPrice;
      return sum + h.quantity * price;
    }, 0);
    const totalValue = newState.cash + holdingValue;
    const last = newState.history[newState.history.length - 1];
    if (last?.date === today) {
      const hist = [...newState.history];
      hist[hist.length - 1] = { date: today, value: totalValue };
      return { ...newState, history: hist };
    }
    return { ...newState, history: [...newState.history, { date: today, value: totalValue }] };
  }, []);

  const buy = useCallback((
    item: { ticker: string; name: string; price: number; sector: string; type: 'stock' | 'fund' },
    quantity: number
  ): string | null => {
    let error: string | null = null;
    setState(prev => {
      const total = item.price * quantity;
      if (total > prev.cash) {
        error = `Insufficient cash. You have ₹${prev.cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })} available.`;
        return prev;
      }
      if (quantity <= 0) {
        error = 'Quantity must be at least 1.';
        return prev;
      }

      const newCash = prev.cash - total;
      const existing = prev.holdings.find(h => h.ticker === item.ticker);
      let newHoldings: Holding[];
      if (existing) {
        const totalQty = existing.quantity + quantity;
        const newAvg = (existing.avgPrice * existing.quantity + item.price * quantity) / totalQty;
        newHoldings = prev.holdings.map(h =>
          h.ticker === item.ticker ? { ...h, quantity: totalQty, avgPrice: newAvg } : h
        );
      } else {
        newHoldings = [...prev.holdings, {
          ticker: item.ticker,
          name: item.name,
          quantity,
          avgPrice: item.price,
          sector: item.sector,
          type: item.type,
        }];
      }

      const tx: Transaction = {
        id: `${Date.now()}-buy`,
        type: 'BUY',
        ticker: item.ticker,
        name: item.name,
        quantity,
        price: item.price,
        total,
        date: new Date().toISOString(),
      };

      const prices = { [item.ticker]: item.price };
      const next = addSnapshot({ ...prev, cash: newCash, holdings: newHoldings, transactions: [tx, ...prev.transactions] }, prices);
      persist(next);
      return next;
    });
    return error;
  }, [addSnapshot, persist]);

  const sell = useCallback((ticker: string, quantity: number, currentPrice: number): string | null => {
    let error: string | null = null;
    setState(prev => {
      const holding = prev.holdings.find(h => h.ticker === ticker);
      if (!holding) { error = 'You don\'t own this stock.'; return prev; }
      if (quantity > holding.quantity) { error = `You only have ${holding.quantity} units to sell.`; return prev; }
      if (quantity <= 0) { error = 'Quantity must be at least 1.'; return prev; }

      const proceeds = currentPrice * quantity;
      const newCash = prev.cash + proceeds;
      const newQty = holding.quantity - quantity;
      const newHoldings = newQty === 0
        ? prev.holdings.filter(h => h.ticker !== ticker)
        : prev.holdings.map(h => h.ticker === ticker ? { ...h, quantity: newQty } : h);

      const tx: Transaction = {
        id: `${Date.now()}-sell`,
        type: 'SELL',
        ticker,
        name: holding.name,
        quantity,
        price: currentPrice,
        total: proceeds,
        date: new Date().toISOString(),
      };

      const prices = { [ticker]: currentPrice };
      const next = addSnapshot({ ...prev, cash: newCash, holdings: newHoldings, transactions: [tx, ...prev.transactions] }, prices);
      persist(next);
      return next;
    });
    return error;
  }, [addSnapshot, persist]);

  const getTotalValue = useCallback((prices: Record<string, number>) => {
    const holdingValue = state.holdings.reduce((sum, h) => sum + h.quantity * (prices[h.ticker] ?? h.avgPrice), 0);
    return state.cash + holdingValue;
  }, [state]);

  return (
    <SimulatorContext.Provider value={{ cash: state.cash, holdings: state.holdings, transactions: state.transactions, history: state.history, buy, sell, getTotalValue, isLoaded }}>
      {children}
    </SimulatorContext.Provider>
  );
}
