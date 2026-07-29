import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Plus, X, Minus, AlertCircle, History, Wallet } from 'lucide-react';
import { formatINR, formatINRFull, formatPercent } from '../../utils/formatters';
import { useSimulator } from '../../context/SimulatorContext';
import { mockStocks, mockMutualFunds } from '../../data/marketData';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#1E3A5F', '#2E86AB', '#1B6B3A', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const STARTING_CASH = 100000;

function getCurrentPrice(ticker: string): number {
  const stock = mockStocks.find(s => s.ticker === ticker);
  if (stock) return stock.currentPrice;
  const fund = mockMutualFunds.find(f => f.code === ticker);
  if (fund) return fund.nav;
  return 0;
}

function SellModal({ ticker, onClose }: { ticker: string; onClose: () => void }) {
  const { holdings, sell } = useSimulator();
  const holding = holdings.find(h => h.ticker === ticker);
  const currentPrice = getCurrentPrice(ticker);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  if (!holding) return null;

  const proceeds = qty * currentPrice;
  const pnl = (currentPrice - holding.avgPrice) * qty;
  const pnlPct = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;

  const handleSell = () => {
    setSubmitting(true);
    const err = sell(ticker, qty, currentPrice);
    setSubmitting(false);
    if (err) {
      toast.error(err);
    } else {
      toast.success(`Sold ${qty} × ${holding.ticker} for ${formatINRFull(proceeds)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg">Sell {holding.ticker}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-muted-foreground">You own</span><span className="font-bold">{holding.quantity} units</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Avg buy price</span><span className="font-medium">₹{holding.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Current price</span><span className="font-medium">₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        </div>

        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Quantity to sell</label>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min={1}
            max={holding.quantity}
            value={qty}
            onChange={e => setQty(Math.min(holding.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
            className="flex-1 text-center text-xl font-black border border-border rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => setQty(q => Math.min(holding.quantity, q + 1))}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setQty(holding.quantity)}
          className="text-xs text-secondary hover:underline mb-4 block"
        >
          Sell all ({holding.quantity} units)
        </button>

        <div className="bg-muted/40 rounded-xl p-3 mb-4 space-y-1.5 text-sm">
          <div className="flex justify-between font-bold text-base">
            <span>You'll receive</span>
            <span className="text-green-600">{formatINRFull(proceeds)}</span>
          </div>
          <div className={`flex justify-between text-xs ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span>P&L on this sale</span>
            <span>{pnl >= 0 ? '+' : ''}{formatINR(pnl)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSell}
          disabled={submitting || qty < 1}
          className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Selling…' : `Confirm Sell · ${qty} unit${qty !== 1 ? 's' : ''}`}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function Portfolio() {
  const { cash, holdings, transactions, history, isLoaded } = useSimulator();
  const [period, setPeriod] = useState<'1W' | '1M' | '3M' | 'ALL'>('ALL');
  const [sellTicker, setSellTicker] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');

  const holdingsWithCalc = useMemo(() => holdings.map(h => {
    const currentPrice = getCurrentPrice(h.ticker);
    const investedAmount = h.quantity * h.avgPrice;
    const currentValue = h.quantity * currentPrice;
    const absoluteReturn = currentValue - investedAmount;
    const percentReturn = ((currentPrice - h.avgPrice) / h.avgPrice) * 100;
    return { ...h, currentPrice, investedAmount, currentValue, absoluteReturn, percentReturn };
  }), [holdings]);

  const totalCurrentValue = holdingsWithCalc.reduce((a, h) => a + h.currentValue, 0);
  const totalInvested = holdingsWithCalc.reduce((a, h) => a + h.investedAmount, 0);
  const portfolioValue = cash + totalCurrentValue;
  const totalReturn = portfolioValue - STARTING_CASH;
  const returnPercent = (totalReturn / STARTING_CASH) * 100;

  const pieData = [
    ...holdingsWithCalc.map(h => ({ name: h.ticker, value: h.currentValue })),
    { name: 'Cash', value: cash },
  ].filter(d => d.value > 0);

  const chartData = useMemo(() => {
    if (history.length === 0) {
      return [{ date: 'Start', value: STARTING_CASH }];
    }
    const now = [{ date: 'Today', value: portfolioValue }];
    const all = [...history, ...now];
    if (period === '1W') return all.slice(-7);
    if (period === '1M') return all.slice(-30);
    if (period === '3M') return all.slice(-90);
    return all;
  }, [history, period, portfolioValue]);

  const chartMin = Math.min(...chartData.map(d => d.value)) * 0.995;
  const chartMax = Math.max(...chartData.map(d => d.value)) * 1.005;

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading your portfolio…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-primary">My Portfolio</h1>
          <p className="text-sm text-muted-foreground">Virtual Simulator · ₹1,00,000 starting capital</p>
        </div>
        <Link href="/research">
          <button className="flex items-center gap-2 px-4 py-2 brand-gradient text-white text-sm font-semibold rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Buy Stock / Fund
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Portfolio Value', value: formatINRFull(portfolioValue), neutral: true },
          { label: 'Total Return', value: formatINR(totalReturn), positive: totalReturn >= 0, neg: totalReturn < 0 },
          { label: 'Return %', value: `${totalReturn >= 0 ? '+' : ''}${returnPercent.toFixed(2)}%`, positive: totalReturn >= 0, neg: totalReturn < 0 },
          { label: 'Cash Available', value: formatINRFull(cash), neutral: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
            <div className={`text-lg font-black ${stat.neutral ? 'text-foreground' : stat.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {holdings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border p-10 text-center mb-6"
        >
          <div className="text-5xl mb-3">📈</div>
          <h3 className="font-bold text-lg mb-1">Your portfolio is empty</h3>
          <p className="text-muted-foreground text-sm mb-4">You have ₹1,00,000 to invest. Head to Research to find stocks and mutual funds.</p>
          <Link href="/research">
            <button className="brand-gradient text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
              Explore Stocks & Funds
            </button>
          </Link>
        </motion.div>
      )}

      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Portfolio Performance</h2>
              <div className="flex gap-1">
                {(['1W', '1M', '3M', 'ALL'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E86AB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E86AB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} domain={[chartMin, chartMax]} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Value']} />
                <Area type="monotone" dataKey="value" stroke="#2E86AB" fill="url(#portfolioGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-bold mb-3">Allocation</h2>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-1">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-muted-foreground truncate max-w-[90px]">{item.name}</span>
                  </div>
                  <span className="font-medium">{((item.value / (totalCurrentValue + cash)) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(holdings.length > 0 || transactions.length > 0) && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'holdings' ? 'brand-gradient text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'}`}
          >
            <Wallet className="w-4 h-4" /> Holdings ({holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'history' ? 'brand-gradient text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'}`}
          >
            <History className="w-4 h-4" /> Transactions ({transactions.length})
          </button>
        </div>
      )}

      {/* Holdings table */}
      {activeTab === 'holdings' && holdings.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium">Stock / Fund</th>
                  <th className="text-right px-4 py-3 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 font-medium">Avg Price</th>
                  <th className="text-right px-4 py-3 font-medium">Current</th>
                  <th className="text-right px-4 py-3 font-medium">Value</th>
                  <th className="text-right px-4 py-3 font-medium">P&amp;L</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {holdingsWithCalc.map((h) => (
                  <tr key={h.ticker} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-sm">{h.ticker}</div>
                      <div className="text-xs text-muted-foreground">{h.name}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">{h.sector} · {h.type === 'fund' ? 'Fund' : 'Stock'}</div>
                    </td>
                    <td className="text-right px-4 py-3.5 text-sm font-medium">{h.quantity}</td>
                    <td className="text-right px-4 py-3.5 text-sm">₹{h.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="text-right px-4 py-3.5 text-sm">₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="text-right px-4 py-3.5 text-sm font-semibold">{formatINRFull(h.currentValue)}</td>
                    <td className={`text-right px-4 py-3.5 ${h.absoluteReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center justify-end gap-1 text-sm font-bold">
                        {h.absoluteReturn >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {h.percentReturn >= 0 ? '+' : ''}{h.percentReturn.toFixed(2)}%
                      </div>
                      <div className="text-xs font-medium">{formatINR(h.absoluteReturn)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSellTicker(h.ticker)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 border-t-2 border-border">
                  <td className="px-5 py-3 font-bold text-sm" colSpan={4}>Total Invested</td>
                  <td className="text-right px-4 py-3 font-bold text-sm">{formatINRFull(totalInvested)}</td>
                  <td className={`text-right px-4 py-3 font-bold text-sm ${totalCurrentValue - totalInvested >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatINR(totalCurrentValue - totalInvested)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Transaction history */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">No transactions yet. Buy your first stock!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Stock / Fund</th>
                    <th className="text-right px-4 py-3 font-medium">Qty</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="text-right px-5 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        <div>{new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tx.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-sm">{tx.ticker}</div>
                        <div className="text-xs text-muted-foreground">{tx.name}</div>
                      </td>
                      <td className="text-right px-4 py-3 text-sm">{tx.quantity}</td>
                      <td className="text-right px-4 py-3 text-sm">₹{tx.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={`text-right px-5 py-3 text-sm font-bold ${tx.type === 'BUY' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'BUY' ? '-' : '+'}{formatINRFull(tx.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cash info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-white rounded-xl border border-border px-4 py-3">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>This is a virtual portfolio for learning. All prices are simulated — not real market data.</span>
      </div>

      {/* Sell modal */}
      <AnimatePresence>
        {sellTicker && <SellModal ticker={sellTicker} onClose={() => setSellTicker(null)} />}
      </AnimatePresence>
    </div>
  );
}
