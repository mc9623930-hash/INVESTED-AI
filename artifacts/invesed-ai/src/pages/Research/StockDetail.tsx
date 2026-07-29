import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Star, Plus, Minus, X, Wallet } from 'lucide-react';
import { getStockByTicker } from '../../data/marketData';
import { formatINR, formatPercent } from '../../utils/formatters';
import { useSimulator } from '../../context/SimulatorContext';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Fundamentals', 'Risk Profile', 'Analyst View', 'News'];

function BuyModal({ stock, onClose }: {
  stock: { ticker: string; name: string; currentPrice: number; sector: string };
  onClose: () => void;
}) {
  const { cash, buy, holdings } = useSimulator();
  const existing = holdings.find(h => h.ticker === stock.ticker);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const total = qty * stock.currentPrice;
  const canAfford = total <= cash;
  const maxQty = Math.floor(cash / stock.currentPrice);

  const handleBuy = () => {
    setSubmitting(true);
    const err = buy(
      { ticker: stock.ticker, name: stock.name, price: stock.currentPrice, sector: stock.sector, type: 'stock' },
      qty
    );
    setSubmitting(false);
    if (err) {
      toast.error(err);
    } else {
      toast.success(`Bought ${qty} × ${stock.ticker} for ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
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
          <div>
            <h3 className="font-black text-lg">Buy {stock.ticker}</h3>
            <p className="text-xs text-muted-foreground">{stock.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current price */}
        <div className="bg-muted/40 rounded-xl p-3 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price per unit</span>
            <span className="font-bold">₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Wallet className="w-3 h-3" /> Cash available</span>
            <span className="font-medium">₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          {existing && (
            <div className="flex justify-between text-xs border-t border-border/50 pt-1.5">
              <span className="text-muted-foreground">Already own</span>
              <span className="text-primary font-medium">{existing.quantity} units</span>
            </div>
          )}
        </div>

        {maxQty === 0 ? (
          <div className="text-center py-4">
            <p className="text-red-600 font-semibold text-sm mb-1">Insufficient cash</p>
            <p className="text-muted-foreground text-xs">You need at least ₹{stock.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })} to buy 1 unit.</p>
            <Link href="/portfolio">
              <button onClick={onClose} className="mt-3 text-xs text-secondary hover:underline">View your portfolio →</button>
            </Link>
          </div>
        ) : (
          <>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Quantity</label>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={qty}
                onChange={e => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 text-center text-xl font-black border border-border rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              {[1, 5, 10].filter(n => n <= maxQty).map(n => (
                <button key={n} onClick={() => setQty(n)} className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${qty === n ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setQty(maxQty)} className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${qty === maxQty ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                Max
              </button>
            </div>

            <div className={`rounded-xl p-3 mb-4 text-sm space-y-1 ${canAfford ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between font-bold text-base">
                <span>Total cost</span>
                <span className={canAfford ? 'text-green-700' : 'text-red-600'}>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              {canAfford && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Cash after</span>
                  <span>₹{(cash - total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleBuy}
              disabled={!canAfford || submitting}
              className="w-full py-3 brand-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Processing…' : `Confirm Buy · ${qty} unit${qty !== 1 ? 's' : ''}`}
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const [activeTab, setActiveTab] = useState('Overview');
  const [chartPeriod, setChartPeriod] = useState('6M');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const { holdings, cash } = useSimulator();
  const { addToWatchlist, removeFromWatchlist, userProfile } = useUser();

  const stock = ticker ? getStockByTicker(ticker) : null;

  if (!stock) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Stock Not Found</h2>
        <Link href="/research"><button className="text-secondary hover:underline">Back to Research</button></Link>
      </div>
    );
  }

  const isPositive = stock.dayChangePercent >= 0;
  const owned = holdings.find(h => h.ticker === stock.ticker);
  const inWatchlist = userProfile?.watchlist?.includes(stock.ticker);

  const periodData = {
    '1W': stock.priceHistory.slice(-7),
    '1M': stock.priceHistory.slice(-30),
    '6M': stock.priceHistory.slice(-180),
    '1Y': stock.priceHistory.slice(-365),
  }[chartPeriod] || stock.priceHistory.slice(-90);

  const riskRadarData = [
    { subject: 'Volatility', value: stock.riskProfile.volatilityRisk * 10 },
    { subject: 'Business', value: stock.riskProfile.businessRisk * 10 },
    { subject: 'Financial', value: stock.riskProfile.financialRisk * 10 },
    { subject: 'Regulatory', value: stock.riskProfile.regulatoryRisk * 10 },
    { subject: 'Sentiment', value: Math.max(0, (50 - stock.riskProfile.sentimentScore / 2)) },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/research">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Research
        </button>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black">{stock.ticker}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{stock.exchange}</span>
              {owned && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  ✓ Owned ({owned.quantity})
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-2">{stock.name}</p>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black">₹{stock.currentPrice.toLocaleString('en-IN')}</div>
              <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>₹{Math.abs(stock.dayChange).toFixed(2)}</span>
                <span>({formatPercent(stock.dayChangePercent)})</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => inWatchlist ? removeFromWatchlist(stock.ticker) : addToWatchlist(stock.ticker)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${inWatchlist ? 'bg-amber-50 border-amber-300 text-amber-500' : 'border-border hover:bg-muted text-muted-foreground'}`}
              title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowBuyModal(true)}
              disabled={cash <= 0}
              className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Invest
            </button>
          </div>
        </div>

        {/* Cash indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <Wallet className="w-3.5 h-3.5" />
          <span>Cash available: <span className="font-bold text-foreground">₹{cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></span>
          {owned && (
            <span className="ml-2">· Avg buy price: <span className="font-bold text-foreground">₹{owned.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border">
          <div><div className="text-xs text-muted-foreground">52W High</div><div className="font-bold text-sm">₹{stock.week52High.toLocaleString('en-IN')}</div></div>
          <div><div className="text-xs text-muted-foreground">52W Low</div><div className="font-bold text-sm">₹{stock.week52Low.toLocaleString('en-IN')}</div></div>
          <div><div className="text-xs text-muted-foreground">Market Cap</div><div className="font-bold text-sm">{formatINR(stock.marketCap)}</div></div>
          <div className="hidden sm:block"><div className="text-xs text-muted-foreground">Sector</div><div className="font-bold text-sm">{stock.sector}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4 bg-white rounded-xl border border-border p-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex gap-2 mb-4">
            {['1W', '1M', '6M', '1Y'].map(p => (
              <button key={p} onClick={() => setChartPeriod(p)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${chartPeriod === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>{p}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={periodData}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#1B6B3A' : '#dc2626'} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isPositive ? '#1B6B3A' : '#dc2626'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v.toFixed(0)}`} domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => [`₹${v.toFixed(2)}`, 'Price']} />
              <Area type="monotone" dataKey="price" stroke={isPositive ? '#1B6B3A' : '#dc2626'} fill="url(#stockGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'Fundamentals' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'P/E Ratio', value: stock.fundamentals.pe.toFixed(1), benchmark: `Industry: ${stock.riskProfile.industryPeMedian}` },
              { label: 'P/B Ratio', value: stock.fundamentals.pb.toFixed(1) },
              { label: 'EPS', value: `₹${stock.fundamentals.eps.toFixed(1)}` },
              { label: 'Revenue Growth (3Y)', value: `${stock.fundamentals.revenueGrowth3Y}%`, positive: stock.fundamentals.revenueGrowth3Y > 10 },
              { label: 'Net Profit Growth (3Y)', value: `${stock.fundamentals.netProfitGrowth3Y}%`, positive: stock.fundamentals.netProfitGrowth3Y > 10 },
              { label: 'Debt/Equity', value: stock.fundamentals.debtToEquity.toFixed(2) },
              { label: 'Dividend Yield', value: `${stock.fundamentals.dividendYield}%` },
              { label: 'ROE', value: `${stock.fundamentals.roe}%`, positive: stock.fundamentals.roe > 15 },
              { label: 'ROCE', value: `${stock.fundamentals.roce}%`, positive: stock.fundamentals.roce > 15 },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className={`font-bold text-sm ${m.positive === true ? 'text-green-600' : m.positive === false ? 'text-red-600' : 'text-foreground'}`}>
                  {m.value}
                </div>
                {m.benchmark && <div className="text-xs text-muted-foreground mt-0.5">{m.benchmark}</div>}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center text-sm">
            <div><div className="text-xs text-muted-foreground">Promoter</div><div className="font-bold">{stock.promoterHolding}%</div></div>
            <div><div className="text-xs text-muted-foreground">FII</div><div className="font-bold">{stock.fiiHolding}%</div></div>
            <div><div className="text-xs text-muted-foreground">DII</div><div className="font-bold">{stock.diiHolding}%</div></div>
          </div>
        </div>
      )}

      {activeTab === 'Risk Profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-4">Composite Risk Score</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-5xl font-black ${
                stock.riskProfile.compositeScore <= 4 ? 'text-green-600'
                : stock.riskProfile.compositeScore <= 6 ? 'text-amber-600'
                : 'text-red-600'
              }`}>
                {stock.riskProfile.compositeScore}
                <span className="text-xl font-medium text-muted-foreground">/10</span>
              </div>
              <div>
                <div className={`font-semibold ${
                  stock.riskProfile.compositeScore <= 4 ? 'text-green-600'
                  : stock.riskProfile.compositeScore <= 6 ? 'text-amber-600'
                  : 'text-red-600'
                }`}>
                  {stock.riskProfile.compositeScore <= 4 ? 'Low Risk' : stock.riskProfile.compositeScore <= 6 ? 'Moderate Risk' : 'High Risk'}
                </div>
                <div className="text-xs text-muted-foreground">Beta: {stock.riskProfile.beta} · Sentiment: {stock.riskProfile.sentimentScore > 0 ? '+' : ''}{stock.riskProfile.sentimentScore}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={riskRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="Risk" dataKey="value" stroke="#2E86AB" fill="#2E86AB" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'Analyst View' && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-bold mb-4">Analyst Consensus</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-2">
              {[
                { label: 'Buy', count: stock.analystRatings.buy, color: 'bg-green-500' },
                { label: 'Hold', count: stock.analystRatings.hold, color: 'bg-amber-500' },
                { label: 'Sell', count: stock.analystRatings.sell, color: 'bg-red-500' },
              ].map((r) => (
                <div key={r.label} className="text-center">
                  <div className={`w-12 h-12 rounded-xl ${r.color} text-white font-black text-xl flex items-center justify-center mb-1`}>{r.count}</div>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-sm"><span className="text-muted-foreground">Target Low: </span><span className="font-bold">₹{stock.analystRatings.targetLow.toLocaleString('en-IN')}</span></div>
              <div className="text-sm"><span className="text-muted-foreground">Target Median: </span><span className="font-bold text-primary">₹{stock.analystRatings.targetMedian.toLocaleString('en-IN')}</span></div>
              <div className="text-sm"><span className="text-muted-foreground">Target High: </span><span className="font-bold">₹{stock.analystRatings.targetHigh.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-xs font-semibold text-muted-foreground mb-1">AI UPSIDE POTENTIAL</div>
            <div className="text-lg font-black text-primary">
              +{(((stock.analystRatings.targetMedian - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Based on median analyst target vs current price</div>
          </div>
        </div>
      )}

      {activeTab === 'News' && (
        <div className="space-y-3">
          {stock.news.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${item.sentiment === 'positive' ? 'bg-green-500' : item.sentiment === 'negative' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div>
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground mb-1">{item.source} · {item.publishedAt}</div>
                  <div className="text-xs text-foreground/80">{item.summary}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buy modal */}
      <AnimatePresence>
        {showBuyModal && (
          <BuyModal
            stock={{ ticker: stock.ticker, name: stock.name, currentPrice: stock.currentPrice, sector: stock.sector }}
            onClose={() => setShowBuyModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
