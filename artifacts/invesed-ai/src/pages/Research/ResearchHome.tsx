import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Star, ChevronDown } from 'lucide-react';
import { mockStocks, mockMutualFunds } from '../../data/marketData';
import { formatPercent } from '../../utils/formatters';
import { useSimulator } from '../../context/SimulatorContext';
import { useUser } from '../../context/UserContext';

const STOCK_SECTORS = ['All', 'Banking', 'Information Technology', 'Pharmaceuticals', 'FMCG', 'Automobile', 'Energy', 'Metals', 'Telecom', 'Consumer', 'Financial Services', 'Defence', 'Infrastructure'];

const FUND_CATEGORIES = [
  { key: 'all', label: 'All Funds' },
  { key: 'large_cap', label: 'Large Cap' },
  { key: 'mid_cap', label: 'Mid Cap' },
  { key: 'small_cap', label: 'Small Cap' },
  { key: 'index', label: 'Index Funds' },
  { key: 'flexi_cap', label: 'Flexi Cap' },
  { key: 'elss', label: 'ELSS / Tax Saver' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'debt', label: 'Debt' },
];

const RISK_COLOR: Record<string, string> = {
  Low: 'text-green-600',
  Moderate: 'text-blue-600',
  'Moderately High': 'text-amber-600',
  High: 'text-orange-600',
  'Very High': 'text-red-600',
};

const SORT_OPTIONS = [
  { key: 'default', label: 'Default' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'change_desc', label: 'Gainers' },
  { key: 'change_asc', label: 'Losers' },
  { key: 'risk_asc', label: 'Low Risk' },
];

export default function ResearchHome() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'stocks' | 'funds'>('stocks');
  const [stockSector, setStockSector] = useState('All');
  const [fundCategory, setFundCategory] = useState('all');
  const [sortKey, setSortKey] = useState('default');
  const [showSort, setShowSort] = useState(false);

  const { holdings } = useSimulator();
  const { userProfile } = useUser();

  const filteredStocks = useMemo(() => {
    let list = mockStocks.filter(s => {
      const q = query.toLowerCase();
      const matchQuery = !q || s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
      const matchSector = stockSector === 'All' || s.sector === stockSector;
      return matchQuery && matchSector;
    });
    if (sortKey === 'price_asc') list = [...list].sort((a, b) => a.currentPrice - b.currentPrice);
    else if (sortKey === 'price_desc') list = [...list].sort((a, b) => b.currentPrice - a.currentPrice);
    else if (sortKey === 'change_desc') list = [...list].sort((a, b) => b.dayChangePercent - a.dayChangePercent);
    else if (sortKey === 'change_asc') list = [...list].sort((a, b) => a.dayChangePercent - b.dayChangePercent);
    else if (sortKey === 'risk_asc') list = [...list].sort((a, b) => a.riskProfile.compositeScore - b.riskProfile.compositeScore);
    return list;
  }, [query, stockSector, sortKey]);

  const filteredFunds = useMemo(() => {
    return mockMutualFunds.filter(f => {
      const q = query.toLowerCase();
      const matchQuery = !q || f.name.toLowerCase().includes(q) || f.amcName.toLowerCase().includes(q) || f.subCategory.toLowerCase().includes(q);
      const matchCat = fundCategory === 'all' || f.category === fundCategory;
      return matchQuery && matchCat;
    });
  }, [query, fundCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-primary mb-1 flex items-center gap-2">
          <Search className="w-6 h-6" />
          Research Lab
        </h1>
        <p className="text-sm text-muted-foreground">
          {mockStocks.length} NSE stocks · {mockMutualFunds.length} mutual funds · AI-powered risk analysis
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, ticker, sector…"
            className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring text-sm shadow-sm"
          />
        </div>
        {tab === 'stocks' && (
          <div className="relative">
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-2xl text-sm font-medium hover:border-primary/50 transition-colors whitespace-nowrap">
              {SORT_OPTIONS.find(s => s.key === sortKey)?.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-10 min-w-[140px]">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => { setSortKey(opt.key); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted first:rounded-t-xl last:rounded-b-xl transition-colors ${sortKey === opt.key ? 'text-primary font-semibold' : 'text-foreground'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('stocks')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'stocks' ? 'brand-gradient text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'}`}>
          NSE Stocks ({filteredStocks.length})
        </button>
        <button onClick={() => setTab('funds')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'funds' ? 'brand-gradient text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'}`}>
          Mutual Funds ({filteredFunds.length})
        </button>
      </div>

      {/* Sector filter chips — Stocks */}
      {tab === 'stocks' && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {STOCK_SECTORS.map(sector => (
            <button key={sector} onClick={() => setStockSector(sector)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${stockSector === sector ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
              {sector}
            </button>
          ))}
        </div>
      )}

      {/* Category filter — Funds */}
      {tab === 'funds' && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {FUND_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setFundCategory(cat.key)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${fundCategory === cat.key ? 'bg-secondary text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:border-secondary/40'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Stocks list */}
      {tab === 'stocks' && (
        <>
          {filteredStocks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No stocks found</p>
              <p className="text-sm">Try a different search or sector filter</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredStocks.map((stock, i) => {
                const isOwned = holdings.some(h => h.ticker === stock.ticker);
                const isWatched = userProfile?.watchlist?.includes(stock.ticker);
                return (
                  <motion.div key={stock.ticker} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                    <Link href={`/research/${stock.ticker}`}>
                      <div className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${isOwned ? 'brand-gradient text-white' : 'bg-primary/8 text-primary'}`}>
                          {stock.ticker.slice(0, 3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm">{stock.ticker}</span>
                            {isOwned && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">✓ Owned</span>}
                            {isWatched && !isOwned && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm">₹{stock.currentPrice.toLocaleString('en-IN')}</div>
                          <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${stock.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.dayChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {formatPercent(stock.dayChangePercent)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 hidden sm:block w-16">
                          <div className="text-[10px] text-muted-foreground">Risk</div>
                          <div className={`text-xs font-bold ${stock.riskProfile.compositeScore <= 4 ? 'text-green-600' : stock.riskProfile.compositeScore <= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                            {stock.riskProfile.compositeScore}/10
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 hidden md:block w-24">
                          <div className="text-[10px] text-muted-foreground">Sector</div>
                          <div className="text-xs font-medium truncate">{stock.sector}</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Funds list */}
      {tab === 'funds' && (
        <>
          {filteredFunds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No funds found</p>
              <p className="text-sm">Try a different search or category filter</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredFunds.map((fund, i) => {
                const isOwned = holdings.some(h => h.ticker === fund.code);
                return (
                  <motion.div key={fund.code} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                    <Link href={`/research/fund/${fund.code}`}>
                      <div className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-4 hover:border-secondary/50 hover:shadow-sm transition-all cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${isOwned ? 'bg-secondary text-white' : 'bg-secondary/10 text-secondary'}`}>
                          {isOwned ? '✓' : 'MF'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm line-clamp-1">{fund.name}</span>
                            {isOwned && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold flex-shrink-0">✓ Invested</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{fund.amcName} · {fund.subCategory}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm">₹{fund.nav.toFixed(2)}</div>
                          <div className="text-[10px] text-muted-foreground">NAV</div>
                        </div>
                        <div className="text-right flex-shrink-0 hidden sm:block w-20">
                          <div className="text-[10px] text-muted-foreground">5Y Return</div>
                          <div className="text-xs font-bold text-green-600">+{fund.returns.fiveYear}%</div>
                        </div>
                        <div className="text-right flex-shrink-0 hidden md:block w-24">
                          <div className="text-[10px] text-muted-foreground">Risk</div>
                          <div className={`text-xs font-semibold ${RISK_COLOR[fund.riskRating] || 'text-muted-foreground'}`}>{fund.riskRating}</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
