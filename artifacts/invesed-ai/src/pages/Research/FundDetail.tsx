import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, Star, Plus, Minus, X, Wallet, ShieldCheck, Info } from 'lucide-react';
import { getFundByCode } from '../../data/marketData';
import { useSimulator } from '../../context/SimulatorContext';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#1E3A5F', '#2E86AB', '#1B6B3A', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const RISK_COLOR: Record<string, string> = {
  Low: 'text-green-600 bg-green-50',
  Moderate: 'text-blue-600 bg-blue-50',
  'Moderately High': 'text-amber-600 bg-amber-50',
  High: 'text-orange-600 bg-orange-50',
  'Very High': 'text-red-600 bg-red-50',
};

const CATEGORY_LABEL: Record<string, string> = {
  large_cap: 'Large Cap', mid_cap: 'Mid Cap', small_cap: 'Small Cap',
  flexi_cap: 'Flexi Cap', elss: 'ELSS / Tax Saver', debt: 'Debt',
  hybrid: 'Hybrid', index: 'Index Fund',
};

function BuyModal({ fund, onClose }: { fund: { code: string; name: string; nav: number; amcName: string }; onClose: () => void }) {
  const { cash, buy, holdings } = useSimulator();
  const existing = holdings.find(h => h.ticker === fund.code);
  const [units, setUnits] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const total = units * fund.nav;
  const canAfford = total <= cash;
  const maxUnits = Math.floor(cash / fund.nav);

  const handleBuy = () => {
    setSubmitting(true);
    const err = buy({ ticker: fund.code, name: fund.name, price: fund.nav, sector: 'Mutual Fund', type: 'fund' }, units);
    setSubmitting(false);
    if (err) { toast.error(err); }
    else {
      toast.success(`Invested in ${units} unit${units > 1 ? 's' : ''} of ${fund.name.slice(0, 30)}…`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-lg">Invest in Fund</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{fund.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-muted-foreground">NAV (per unit)</span><span className="font-bold">₹{fund.nav.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Wallet className="w-3 h-3" />Cash available</span><span className="font-medium">₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>
          {existing && <div className="flex justify-between text-xs border-t border-border/50 pt-1.5"><span className="text-muted-foreground">Already own</span><span className="text-primary font-medium">{existing.quantity} units</span></div>}
        </div>

        {maxUnits === 0 ? (
          <div className="text-center py-4">
            <p className="text-red-600 font-semibold text-sm mb-1">Insufficient cash</p>
            <p className="text-muted-foreground text-xs">You need at least ₹{fund.nav.toFixed(2)} to buy 1 unit.</p>
          </div>
        ) : (
          <>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Units to buy</label>
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => setUnits(u => Math.max(1, u - 1))} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted">
                <Minus className="w-4 h-4" />
              </button>
              <input type="number" min={1} max={maxUnits} value={units}
                onChange={e => setUnits(Math.min(maxUnits, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 text-center text-xl font-black border border-border rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={() => setUnits(u => Math.min(maxUnits, u + 1))} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              {[1, 10, 50].filter(n => n <= maxUnits).map(n => (
                <button key={n} onClick={() => setUnits(n)} className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${units === n ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{n}</button>
              ))}
              <button onClick={() => setUnits(maxUnits)} className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${units === maxUnits ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>Max</button>
            </div>
            <div className={`rounded-xl p-3 mb-4 text-sm space-y-1 ${canAfford ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between font-bold text-base">
                <span>Total investment</span>
                <span className={canAfford ? 'text-green-700' : 'text-red-600'}>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              {canAfford && <div className="flex justify-between text-xs text-muted-foreground"><span>Cash after</span><span>₹{(cash - total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></div>}
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleBuy} disabled={!canAfford || submitting}
              className="w-full py-3 brand-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? 'Processing…' : `Confirm · ${units} unit${units !== 1 ? 's' : ''}`}
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
}

const TABS = ['Overview', 'Portfolio', 'Holdings', 'Details'];

export default function FundDetail() {
  const { fundCode } = useParams<{ fundCode: string }>();
  const [activeTab, setActiveTab] = useState('Overview');
  const [chartPeriod, setChartPeriod] = useState('1Y');
  const [showBuy, setShowBuy] = useState(false);
  const { cash, holdings } = useSimulator();
  const { addToWatchlist, removeFromWatchlist, userProfile } = useUser();

  const fund = fundCode ? getFundByCode(fundCode) : null;

  if (!fund) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-2">Fund Not Found</h2>
      <Link href="/research"><button className="text-secondary hover:underline">Back to Research</button></Link>
    </div>
  );

  const owned = holdings.find(h => h.ticker === fund.code);
  const inWatchlist = userProfile?.watchlist?.includes(fund.code);
  const navData = {
    '1W': fund.navHistory.slice(-7), '1M': fund.navHistory.slice(-30),
    '6M': fund.navHistory.slice(-180), '1Y': fund.navHistory,
  }[chartPeriod] || fund.navHistory;

  const latestNav = fund.navHistory[fund.navHistory.length - 1]?.price ?? fund.nav;
  const prevNav = fund.navHistory[fund.navHistory.length - 2]?.price ?? fund.nav;
  const navChange = latestNav - prevNav;
  const navChangePct = (navChange / prevNav) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/research">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Research
        </button>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${RISK_COLOR[fund.riskRating] || 'text-muted-foreground bg-muted'}`}>{fund.riskRating}</div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">{CATEGORY_LABEL[fund.category]}</span>
              {owned && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ Invested ({owned.quantity} units)</span>}
            </div>
            <h1 className="text-xl font-black leading-tight mb-0.5">{fund.name}</h1>
            <p className="text-sm text-muted-foreground">{fund.amcName} · {fund.subCategory}</p>
            <div className="flex items-center gap-3 mt-3">
              <div>
                <div className="text-xs text-muted-foreground">NAV</div>
                <div className="text-2xl font-black">₹{fund.nav.toFixed(2)}</div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${navChangePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                {navChangePct >= 0 ? '+' : ''}{navChangePct.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => inWatchlist ? removeFromWatchlist(fund.code) : addToWatchlist(fund.code)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${inWatchlist ? 'bg-amber-50 border-amber-300 text-amber-500' : 'border-border hover:bg-muted text-muted-foreground'}`}>
              <Star className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400' : ''}`} />
            </button>
            <button onClick={() => setShowBuy(true)} disabled={cash <= 0}
              className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              <Plus className="w-4 h-4" />Invest
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-border text-sm">
          <div><div className="text-xs text-muted-foreground">AUM</div><div className="font-bold text-xs">{(fund.aum / 10000000).toFixed(0)}Cr</div></div>
          <div><div className="text-xs text-muted-foreground">Expense Ratio</div><div className="font-bold text-xs">{fund.expenseRatio}%</div></div>
          <div><div className="text-xs text-muted-foreground">Min SIP</div><div className="font-bold text-xs">₹{fund.minSipAmount}</div></div>
          <div className="hidden sm:block"><div className="text-xs text-muted-foreground">Exit Load</div><div className="font-bold text-xs">{fund.exitLoad}</div></div>
          <div className="hidden sm:block"><div className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="w-3 h-3" />Cash Avail.</div><div className="font-bold text-xs">₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div></div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-blue-700 mb-1">AI SUITABILITY GUIDE</div>
          <div className="text-xs font-semibold text-blue-700 mb-1">{fund.aiSuitabilityTag}</div>
          <p className="text-xs text-blue-700/80 leading-relaxed">{fund.aiSummary}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4 bg-white rounded-xl border border-border p-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview - NAV chart */}
      {activeTab === 'Overview' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex gap-2 mb-4">
            {['1W', '1M', '6M', '1Y'].map(p => (
              <button key={p} onClick={() => setChartPeriod(p)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${chartPeriod === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>{p}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={navData}>
              <defs>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B6B3A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1B6B3A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toFixed(0)}`} domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => [`₹${v.toFixed(4)}`, 'NAV']} />
              <Area type="monotone" dataKey="price" stroke="#1B6B3A" fill="url(#fundGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tab: Portfolio - Returns table */}
      {activeTab === 'Portfolio' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-4">Historical Returns</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left py-2 font-medium">Period</th>
                  <th className="text-right py-2 font-medium">Lump Sum</th>
                  <th className="text-right py-2 font-medium">SIP Returns</th>
                </tr></thead>
                <tbody className="divide-y divide-border/50">
                  {[
                    ['1 Year', fund.returns.oneYear, fund.sipReturns.oneYear],
                    ['3 Years', fund.returns.threeYear, fund.sipReturns.threeYear],
                    ['5 Years', fund.returns.fiveYear, fund.sipReturns.fiveYear],
                    ['Since Inception', fund.returns.sinceInception, null],
                  ].map(([period, lump, sip]) => (
                    <tr key={String(period)}>
                      <td className="py-2.5 font-medium">{String(period)}</td>
                      <td className="text-right py-2.5 font-bold text-green-600">+{lump}%</td>
                      <td className="text-right py-2.5 text-green-600 font-medium">{sip !== null ? `+${sip}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-4">Risk Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Sharpe Ratio', value: fund.riskMetrics.sharpeRatio.toFixed(2), good: fund.riskMetrics.sharpeRatio > 1 },
                { label: 'Sortino Ratio', value: fund.riskMetrics.sortinoRatio.toFixed(2), good: fund.riskMetrics.sortinoRatio > 1 },
                { label: 'Max Drawdown', value: `${fund.riskMetrics.maxDrawdown}%`, good: false },
                { label: 'Std. Deviation', value: `${fund.riskMetrics.standardDeviation}%` },
                { label: 'Beta', value: fund.riskMetrics.beta.toFixed(2) },
                { label: 'Alpha', value: `${fund.riskMetrics.alpha > 0 ? '+' : ''}${fund.riskMetrics.alpha}%`, good: fund.riskMetrics.alpha > 0 },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                  <div className={`font-bold text-sm ${m.good === true ? 'text-green-600' : m.good === false && m.label !== 'Max Drawdown' ? 'text-red-600' : 'text-foreground'}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Holdings */}
      {activeTab === 'Holdings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-4">Top Holdings</h3>
            <div className="space-y-2">
              {fund.topHoldings.map((h, i) => (
                <div key={h.name} className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-4">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{h.name}</div>
                    <div className="h-1.5 rounded-full bg-muted mt-1">
                      <div className="h-1.5 rounded-full brand-gradient" style={{ width: `${Math.min(h.percent * 8, 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-right w-12">{h.percent}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-3">Sector Allocation</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={fund.sectorAllocation.map(s => ({ name: s.sector, value: s.percent }))} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                  {fund.sectorAllocation.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {fund.sectorAllocation.slice(0, 5).map((s, i) => (
                <div key={s.sector} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground truncate max-w-[130px]">{s.sector}</span>
                  </div>
                  <span className="font-medium">{s.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Details */}
      {activeTab === 'Details' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">Fund Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'AMC', value: fund.amcName },
              { label: 'Category', value: CATEGORY_LABEL[fund.category] },
              { label: 'Sub-Category', value: fund.subCategory },
              { label: 'AUM', value: `₹${(fund.aum / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr` },
              { label: 'Expense Ratio', value: `${fund.expenseRatio}% p.a.` },
              { label: 'Min SIP Amount', value: `₹${fund.minSipAmount}` },
              { label: 'Exit Load', value: fund.exitLoad },
              { label: 'Risk Rating', value: fund.riskRating },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className="font-bold text-sm">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>Mutual fund investments are subject to market risks. Past performance does not guarantee future results. This is a simulated portfolio for educational purposes only.</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showBuy && <BuyModal fund={{ code: fund.code, name: fund.name, nav: fund.nav, amcName: fund.amcName }} onClose={() => setShowBuy(false)} />}
      </AnimatePresence>
    </div>
  );
}
