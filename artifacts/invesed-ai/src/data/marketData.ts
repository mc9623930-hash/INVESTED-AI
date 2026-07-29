import type { StockData, MutualFundData, PricePoint, NewsItem } from '../types';

function generatePriceHistory(basePrice: number, days = 365, drift = 0.48): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * 0.78;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - drift) * price * 0.022;
    price = Math.max(price + change, basePrice * 0.35);
    history.push({ date: date.toISOString().split('T')[0], price: parseFloat(price.toFixed(2)), volume: Math.floor(Math.random() * 6000000 + 300000) });
  }
  return history;
}

function generateNAVHistory(nav: number, days = 365): PricePoint[] {
  const history: PricePoint[] = [];
  let p = nav * 0.70;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    p = Math.max(p + (Math.random() - 0.46) * p * 0.012, nav * 0.35);
    history.push({ date: date.toISOString().split('T')[0], price: parseFloat(p.toFixed(4)) });
  }
  return history;
}

const SECTOR_NEWS: Record<string, NewsItem[]> = {
  Banking: [
    { title: 'RBI Holds Repo Rate at 6.5%, Signals Easing Ahead', source: 'Economic Times', publishedAt: '2026-05-20', url: '#', sentiment: 'positive', sentimentScore: 0.68, summary: 'RBI maintains accommodative stance; banks expected to benefit from stable interest rate environment.' },
    { title: 'Credit Growth Accelerates to 16% YoY in Q4 FY26', source: 'Mint', publishedAt: '2026-05-12', url: '#', sentiment: 'positive', sentimentScore: 0.72, summary: 'Retail and MSME lending drive broad-based credit expansion across the banking sector.' },
    { title: 'NPA Ratio Hits Decade Low at 2.8% for Indian Banks', source: 'Business Standard', publishedAt: '2026-04-28', url: '#', sentiment: 'positive', sentimentScore: 0.81, summary: 'Asset quality improvement continues; capital adequacy remains strong across major lenders.' },
  ],
  'Information Technology': [
    { title: 'India IT Sector Wins $12B in AI Transformation Deals in Q4', source: 'Economic Times', publishedAt: '2026-05-18', url: '#', sentiment: 'positive', sentimentScore: 0.74, summary: 'Generative AI projects drive deal momentum; large-cap IT firms lead in enterprise AI engagements.' },
    { title: 'USD-INR at ₹84 Boosts IT Earnings Outlook', source: 'Mint', publishedAt: '2026-05-10', url: '#', sentiment: 'positive', sentimentScore: 0.65, summary: 'Favourable currency adds 100–150bps to IT margin guidance for FY27.' },
    { title: 'US IT Spending Recovery Lifts Indian Software Stocks', source: 'NDTV Profit', publishedAt: '2026-04-22', url: '#', sentiment: 'positive', sentimentScore: 0.69, summary: 'BFSI and retail verticals lead demand recovery in North America, boosting Indian IT revenue visibility.' },
  ],
  Pharmaceuticals: [
    { title: 'India Pharma Exports Cross $30B Milestone in FY26', source: 'Economic Times', publishedAt: '2026-05-15', url: '#', sentiment: 'positive', sentimentScore: 0.76, summary: 'Generic drug exports surge; US FDA approvals at 5-year high for Indian manufacturers.' },
    { title: 'USFDA Issues 5 Import Alerts for Indian Plants in 2026', source: 'Business Standard', publishedAt: '2026-04-30', url: '#', sentiment: 'negative', sentimentScore: -0.62, summary: 'Regulatory scrutiny remains a key risk for Indian pharma companies with heavy US exposure.' },
    { title: 'Biosimilar Opportunity Worth $80B for Indian Companies', source: 'Mint', publishedAt: '2026-04-18', url: '#', sentiment: 'positive', sentimentScore: 0.78, summary: 'Indian pharma companies rapidly building biosimilar pipeline targeting EU and US patent cliffs.' },
  ],
  FMCG: [
    { title: 'Rural Demand Recovery Boosts FMCG Volume Growth to 8%', source: 'Economic Times', publishedAt: '2026-05-14', url: '#', sentiment: 'positive', sentimentScore: 0.71, summary: 'Monsoon expectations and government spending lift rural consumption; FMCG sector sees broad recovery.' },
    { title: 'Raw Material Costs Ease 12% YoY; FMCG Margins to Expand', source: 'Mint', publishedAt: '2026-04-25', url: '#', sentiment: 'positive', sentimentScore: 0.69, summary: 'Palm oil, crude derivatives ease; FMCG companies to benefit from margin tailwinds in H1 FY27.' },
    { title: 'Quick Commerce Threatens Traditional FMCG Distribution', source: 'Business Standard', publishedAt: '2026-04-10', url: '#', sentiment: 'neutral', sentimentScore: 0.10, summary: 'Blinkit, Zepto disrupting kirana channel; FMCG companies adapting go-to-market strategies.' },
  ],
  Automobile: [
    { title: 'India Auto Sales Hit Record 5.2 Million Units in FY26', source: 'Economic Times', publishedAt: '2026-05-16', url: '#', sentiment: 'positive', sentimentScore: 0.80, summary: 'SUV segment and electric vehicles drive record vehicle sales; two-wheelers see rural recovery.' },
    { title: 'EV Penetration Reaches 8% of Total Passenger Vehicle Sales', source: 'Mint', publishedAt: '2026-05-02', url: '#', sentiment: 'positive', sentimentScore: 0.72, summary: 'Government PLI subsidies and charging infrastructure expansion accelerate EV adoption.' },
    { title: 'Auto Ancillary Exports Surge on Global Supply Chain Shift', source: 'Business Standard', publishedAt: '2026-04-20', url: '#', sentiment: 'positive', sentimentScore: 0.67, summary: 'India gains auto component market share as global OEMs diversify supply chains from China.' },
  ],
  Energy: [
    { title: 'India Targets 500GW Renewable Energy by 2030', source: 'Economic Times', publishedAt: '2026-05-12', url: '#', sentiment: 'positive', sentimentScore: 0.75, summary: 'Solar and wind capacity additions accelerate; green hydrogen policy framework announced.' },
    { title: 'Crude Oil at $72/Barrel Eases Refining Margins', source: 'NDTV Profit', publishedAt: '2026-04-28', url: '#', sentiment: 'neutral', sentimentScore: 0.15, summary: 'Lower crude benefits downstream users but compresses GRM for refining-heavy energy companies.' },
    { title: 'Power Demand at Record Peak; Coal India Supplies Surge', source: 'Mint', publishedAt: '2026-04-15', url: '#', sentiment: 'positive', sentimentScore: 0.66, summary: 'Summer peak demand hits 250GW; thermal plants run at high PLF, boosting coal demand.' },
  ],
  Metals: [
    { title: 'China Steel Overproduction Pressures Global Steel Prices', source: 'Economic Times', publishedAt: '2026-05-08', url: '#', sentiment: 'negative', sentimentScore: -0.58, summary: 'Chinese steel overcapacity and weak domestic demand export deflation globally; Indian steelmakers impacted.' },
    { title: 'India Infrastructure Boom Supports Domestic Steel Demand', source: 'Business Standard', publishedAt: '2026-04-22', url: '#', sentiment: 'positive', sentimentScore: 0.64, summary: 'PM Gati Shakti and housing projects drive 10% YoY domestic steel demand growth.' },
    { title: 'Aluminium Premiums Rise as LME Inventory Falls', source: 'Mint', publishedAt: '2026-04-14', url: '#', sentiment: 'positive', sentimentScore: 0.59, summary: 'Supply tightness and EV battery demand boost aluminium prices; Hindalco and Nalco benefit.' },
  ],
  Telecom: [
    { title: '5G Subscribers in India Cross 100 Million Mark', source: 'Economic Times', publishedAt: '2026-05-10', url: '#', sentiment: 'positive', sentimentScore: 0.77, summary: 'Airtel and Jio lead 5G rollout; enterprise 5G use cases drive ARPU expansion.' },
    { title: 'Telecom Tariff Hike Expected in H2 2026', source: 'Mint', publishedAt: '2026-04-20', url: '#', sentiment: 'positive', sentimentScore: 0.68, summary: 'Industry consolidation enables ARPU-accretive tariff increases; analysts expect 15–20% hike.' },
    { title: 'BSNL 4G Rollout Gains Speed; Threatens Private Operators in Tier-3', source: 'Business Standard', publishedAt: '2026-04-08', url: '#', sentiment: 'neutral', sentimentScore: -0.10, summary: 'Government-owned BSNL expanding 4G footprint with TCS-built indigenous network.' },
  ],
  Consumer: [
    { title: 'Quick Commerce Platforms Show 60% YoY GMV Growth', source: 'Economic Times', publishedAt: '2026-05-05', url: '#', sentiment: 'positive', sentimentScore: 0.73, summary: 'Zomato Blinkit, Swiggy Instamart see explosive growth; profitability path becoming clearer.' },
    { title: 'Titan Gains Jewellery Market Share as Gold Prices Rise', source: 'Mint', publishedAt: '2026-04-25', url: '#', sentiment: 'positive', sentimentScore: 0.70, summary: 'Organised jewellery sector growing; Titan\'s Tanishq brand captures premium market.' },
    { title: 'India Internet Economy to Reach $300B by 2027', source: 'Business Standard', publishedAt: '2026-04-12', url: '#', sentiment: 'positive', sentimentScore: 0.79, summary: 'E-commerce, fintech, and edtech drive digital economy expansion.' },
  ],
  Defence: [
    { title: 'India Defence Budget Hits ₹6.2 Lakh Crore in FY26', source: 'Economic Times', publishedAt: '2026-05-01', url: '#', sentiment: 'positive', sentimentScore: 0.82, summary: 'Atmanirbhar Bharat push accelerates; HAL, BEL, and L&T Defence win major contracts.' },
    { title: 'HAL Tejas Mk2 Gets 97-Aircraft Order from IAF', source: 'Mint', publishedAt: '2026-04-18', url: '#', sentiment: 'positive', sentimentScore: 0.88, summary: 'Largest ever fighter aircraft order boosts HAL\'s order book to ₹1.2 lakh crore.' },
    { title: 'India Defence Exports Cross $3B; MOD Sets $5B Target for FY27', source: 'Business Standard', publishedAt: '2026-04-05', url: '#', sentiment: 'positive', sentimentScore: 0.76, summary: 'Indian defence manufacturers increasingly competitive on global stage.' },
  ],
  Infrastructure: [
    { title: 'L&T Wins ₹45,000 Cr Qatar Rail Contract', source: 'Economic Times', publishedAt: '2026-05-06', url: '#', sentiment: 'positive', sentimentScore: 0.85, summary: 'Largest single overseas order in L&T\'s history boosts international order book.' },
    { title: 'Adani Ports Handles 400 MMT Cargo in FY26', source: 'Mint', publishedAt: '2026-04-22', url: '#', sentiment: 'positive', sentimentScore: 0.71, summary: 'Record cargo volumes; Colombo port investment boosts regional hub status.' },
    { title: 'India Road Construction Averages 38 Km/Day in FY26', source: 'Business Standard', publishedAt: '2026-04-10', url: '#', sentiment: 'positive', sentimentScore: 0.73, summary: 'NHAI maintains record pace; infra companies benefit from strong order pipeline.' },
  ],
};

function getNews(sector: string): NewsItem[] {
  const mapping: Record<string, string> = {
    Banking: 'Banking', 'Financial Services': 'Banking',
    'Information Technology': 'Information Technology', IT: 'Information Technology',
    Pharmaceuticals: 'Pharmaceuticals', Pharma: 'Pharmaceuticals',
    FMCG: 'FMCG',
    Automobile: 'Automobile', Auto: 'Automobile',
    Energy: 'Energy', 'Oil & Gas': 'Energy', Power: 'Energy',
    Metals: 'Metals', Steel: 'Metals',
    Telecom: 'Telecom',
    Consumer: 'Consumer', 'E-Commerce': 'Consumer', Retail: 'Consumer',
    Defence: 'Defence',
    Infrastructure: 'Infrastructure', Ports: 'Infrastructure',
  };
  return SECTOR_NEWS[mapping[sector] || 'Consumer'] || SECTOR_NEWS.Consumer;
}

function s(
  ticker: string, name: string, sector: string, industry: string,
  price: number, mcapCr: number,
  pe: number, pb: number, eps: number, rev3y: number, np3y: number, dte: number, divYield: number, roe: number, roce: number,
  risk: number, beta: number, volatR: number, busR: number, finR: number, regR: number, sentiment: number,
  promoter: number, fii: number, dii: number,
  dayChangePct: number,
  analystBuy: number, analystHold: number, analystSell: number, targetUpPct: number,
  industryPeMedian: number,
): StockData {
  const dayChange = parseFloat((price * dayChangePct / 100).toFixed(2));
  const w52high = parseFloat((price * (1 + 0.18 + Math.random() * 0.1)).toFixed(2));
  const w52low = parseFloat((price * (0.72 - Math.random() * 0.08)).toFixed(2));
  const targetMedian = parseFloat((price * (1 + targetUpPct / 100)).toFixed(2));
  const targetLow = parseFloat((targetMedian * 0.87).toFixed(2));
  const targetHigh = parseFloat((targetMedian * 1.18).toFixed(2));
  return {
    ticker, name, exchange: 'NSE', sector, industry,
    marketCap: mcapCr * 10000000,
    currentPrice: price, dayChange, dayChangePercent: dayChangePct,
    week52High: w52high, week52Low: w52low,
    volume: Math.floor(Math.random() * 8000000 + 200000),
    fundamentals: { pe, pb, eps, revenueGrowth3Y: rev3y, netProfitGrowth3Y: np3y, debtToEquity: dte, dividendYield: divYield, roe, roce },
    riskProfile: { compositeScore: risk, volatilityRisk: volatR, businessRisk: busR, financialRisk: finR, regulatoryRisk: regR, sentimentScore: sentiment, beta, industryPeMedian },
    priceHistory: generatePriceHistory(price),
    analystRatings: { buy: analystBuy, hold: analystHold, sell: analystSell, targetLow, targetMedian, targetHigh },
    news: getNews(sector),
    promoterHolding: promoter, fiiHolding: fii, diiHolding: dii, promoterPledged: 0,
  };
}

export const mockStocks: StockData[] = [
  /* ── BANKING ─────────────────────────────────────────────────────── */
  s('HDFCBANK','HDFC Bank Ltd','Banking','Private Sector Banking',1648,1245000, 18.2,2.6,90.5,18.4,22.1,0.82,1.10,16.8,12.4, 4,0.85,4,3,4,3,72, 0,16.8,22.4, 1.22, 30,12,4,14,18.0),
  s('ICICIBANK','ICICI Bank Ltd','Banking','Private Sector Banking',1284,905000, 17.8,2.9,72.1,20.2,28.4,0.88,0.90,18.2,14.1, 4,0.90,4,3,4,3,76, 0,18.2,19.8, 0.86, 32,10,2,16,18.0),
  s('SBIN','State Bank of India','Banking','Public Sector Banking',812,724000, 10.4,1.5,78.1,14.2,35.8,6.20,2.30,14.8,9.8, 5,1.05,5,5,5,5,58, 57.5,8.2,16.4, -0.54, 26,14,5,12,10.5),
  s('AXISBANK','Axis Bank Ltd','Banking','Private Sector Banking',1092,337000, 14.6,1.9,74.8,18.8,24.2,0.96,0.90,14.2,10.8, 5,0.98,5,4,5,3,64, 8.2,17.4,18.2, 0.74, 28,11,4,15,18.0),
  s('KOTAKBANK','Kotak Mahindra Bank Ltd','Banking','Private Sector Banking',1924,382000, 22.4,3.2,85.8,16.4,18.8,0.42,0.10,14.8,11.2, 4,0.80,4,3,3,3,68, 26.0,14.8,16.4, -0.22, 22,14,6,14,18.0),
  s('INDUSINDBK','IndusInd Bank Ltd','Banking','Private Sector Banking',928,72000, 10.2,1.2,91.0,12.4,8.2,0.92,1.60,11.8,9.4, 6,1.10,6,5,5,4,48, 16.2,18.4,14.2, -1.84, 18,12,8,12,18.0),
  s('BANDHANBNK','Bandhan Bank Ltd','Banking','Microfinance Banking',172,27800, 12.8,1.4,13.4,8.2,-18.4,4.82,0.00,10.2,7.4, 7,1.22,7,6,7,5,38, 39.9,12.4,10.2, -2.14, 14,10,10,15,12.0),
  s('FEDERALBNK','Federal Bank Ltd','Banking','Private Sector Banking',188,38600, 11.2,1.4,16.8,18.4,22.8,0.82,1.10,13.8,10.4, 5,0.92,5,4,4,3,62, 0,18.8,24.4, 1.04, 20,8,4,16,11.5),
  s('IDFCFIRSTB','IDFC First Bank Ltd','Banking','Private Sector Banking',64,44800, 18.4,1.1,3.5,28.4,42.8,0.88,0.00,8.4,6.2, 6,1.15,6,5,6,4,54, 39.9,14.2,18.4, 2.24, 22,10,6,20,18.0),
  s('CANARABNK','Canara Bank','Banking','Public Sector Banking',102,92400, 6.4,0.8,15.8,12.8,28.4,7.40,3.40,12.4,8.4, 5,1.08,5,5,5,5,55, 62.9,6.8,14.2, -1.14, 18,12,8,14,10.5),

  /* ── INFORMATION TECHNOLOGY ───────────────────────────────────────── */
  s('TCS','Tata Consultancy Services Ltd','Information Technology','IT Services & Consulting',3872,1420000, 28.4,11.2,136.4,12.8,14.2,0.00,3.50,46.8,48.2, 4,0.60,4,3,2,3,72, 71.8,12.8,11.2, -1.08, 28,14,6,14,26.0),
  s('INFY','Infosys Ltd','Information Technology','IT Services & Consulting',1568,652000, 24.8,7.8,63.2,10.4,12.8,0.00,2.80,32.8,34.2, 4,0.65,4,3,2,3,68, 14.4,32.2,18.8, 0.62, 26,12,6,18,26.0),
  s('WIPRO','Wipro Ltd','Information Technology','IT Services & Consulting',468,242000, 20.4,3.2,22.9,7.2,8.4,0.00,0.20,16.8,17.4, 4,0.68,4,3,2,3,62, 72.9,6.4,8.2, -0.84, 18,16,8,12,26.0),
  s('HCLTECH','HCL Technologies Ltd','Information Technology','IT Services & Consulting',1592,432000, 24.2,6.4,65.8,12.2,16.4,0.00,3.80,22.8,24.2, 4,0.62,4,3,2,3,70, 60.8,12.8,14.4, 1.14, 28,12,4,14,26.0),
  s('TECHM','Tech Mahindra Ltd','Information Technology','IT Services & Consulting',1644,161000, 38.8,5.2,42.4,4.8,-12.4,0.00,0.90,12.4,13.2, 5,0.72,5,4,3,3,58, 35.2,14.8,12.4, 1.84, 20,14,8,18,26.0),
  s('MPHASIS','Mphasis Ltd','Information Technology','IT Services & Consulting',2948,55200, 34.2,8.8,86.2,10.8,14.8,0.00,2.80,28.8,30.4, 5,0.74,5,4,3,3,64, 55.7,16.4,10.8, 0.44, 18,12,6,16,26.0),
  s('LTIM','LTIMindtree Ltd','Information Technology','IT Services & Consulting',5248,155000, 36.4,7.8,144.2,15.2,18.4,0.00,1.80,28.4,30.2, 5,0.70,5,4,3,3,62, 74.2,12.4,10.2, -0.64, 22,12,6,14,26.0),
  s('PERSISTENT','Persistent Systems Ltd','Information Technology','IT Services & Consulting',5948,46200, 52.8,14.2,112.6,24.8,28.4,0.00,0.60,28.8,30.4, 5,0.80,5,4,3,3,72, 31.4,14.8,12.4, 1.24, 24,10,4,12,30.0),
  s('COFORGE','Coforge Ltd','Information Technology','IT Services & Consulting',8248,54000, 48.4,10.2,170.4,22.4,24.8,0.00,0.60,24.8,26.4, 6,0.85,6,5,3,3,66, 0,14.2,14.8, 2.04, 20,10,6,14,30.0),

  /* ── PHARMACEUTICALS ─────────────────────────────────────────────── */
  s('SUNPHARMA','Sun Pharmaceutical Industries Ltd','Pharmaceuticals','Specialty Pharma',1748,419000, 36.8,5.2,47.5,14.2,18.4,0.18,0.70,18.4,16.2, 5,0.55,5,4,4,6,68, 54.5,16.4,12.8, 0.88, 28,14,4,16,32.0),
  s('DRREDDY','Dr Reddys Laboratories Ltd','Pharmaceuticals','Generic Pharma',6248,104000, 22.4,4.2,278.8,12.4,16.8,0.22,0.60,18.8,16.4, 5,0.60,5,4,4,6,66, 26.8,18.4,14.2, 0.44, 22,12,6,16,28.0),
  s('CIPLA','Cipla Ltd','Pharmaceuticals','Generic Pharma',1548,124000, 28.4,3.8,54.5,10.8,14.4,0.12,0.50,16.8,14.4, 5,0.58,5,4,4,6,64, 33.5,16.8,12.4, 0.64, 24,12,4,14,28.0),
  s('DIVISLAB','Divi\'s Laboratories Ltd','Pharmaceuticals','API & Contract Manufacturing',4848,128000, 54.2,9.8,89.4,4.2,-8.4,0.00,0.90,16.4,16.8, 4,0.48,4,3,3,4,70, 52.0,14.8,18.4, 0.84, 22,12,6,18,40.0),
  s('AUROPHARMA','Aurobindo Pharma Ltd','Pharmaceuticals','Generic Pharma',1248,73000, 18.4,2.8,67.8,8.4,12.4,0.62,0.40,14.8,12.4, 5,0.65,5,4,5,6,56, 51.8,14.2,16.4, 1.04, 18,14,8,16,22.0),
  s('LUPIN','Lupin Ltd','Pharmaceuticals','Generic Pharma',2148,97800, 32.4,4.2,66.2,10.4,22.8,0.22,0.50,14.4,12.8, 5,0.62,5,4,4,6,62, 46.9,14.8,18.2, 1.44, 20,12,6,18,28.0),
  s('BIOCON','Biocon Ltd','Pharmaceuticals','Biopharmaceuticals',348,41800, 48.8,3.8,7.1,18.4,-12.4,0.88,0.00,8.4,7.2, 7,0.80,7,6,6,7,48, 60.7,10.4,8.2, -0.64, 14,12,10,20,42.0),

  /* ── FMCG ─────────────────────────────────────────────────────────── */
  s('ITC','ITC Ltd','FMCG','Conglomerate-FMCG',468,584000, 26.4,7.4,17.7,8.4,14.8,0.00,3.40,28.4,26.8, 3,0.52,3,2,2,3,74, 0,14.8,20.4, 0.42, 28,14,4,18,26.0),
  s('HINDUNILVR','Hindustan Unilever Ltd','FMCG','Personal Products',2448,574000, 54.8,11.2,44.6,6.4,8.2,0.00,1.40,20.8,22.4, 3,0.45,3,2,2,3,72, 61.9,12.8,14.4, 0.22, 24,16,4,14,48.0),
  s('NESTLE','Nestle India Ltd','FMCG','Food Products',2248,217000, 76.4,66.8,29.4,8.4,12.4,0.00,1.70,96.8,86.4, 3,0.42,3,2,2,3,74, 62.8,9.4,13.4, 0.62, 24,14,4,12,60.0),
  s('BRITANNIA','Britannia Industries Ltd','FMCG','Packaged Foods',5248,126000, 58.4,24.8,89.8,10.4,16.8,0.22,1.60,42.8,36.4, 3,0.48,3,2,2,3,70, 50.6,11.8,15.4, 0.84, 22,14,4,14,50.0),
  s('DABUR','Dabur India Ltd','FMCG','Ayurvedic & Natural Products',548,97000, 52.4,11.8,10.5,8.8,10.4,0.00,1.00,20.8,19.4, 3,0.46,3,2,2,3,68, 67.6,12.4,11.8, 0.22, 20,14,6,12,46.0),
  s('MARICO','Marico Ltd','FMCG','Hair & Edible Oil',648,84000, 52.8,14.8,12.3,6.4,8.8,0.00,1.20,38.4,36.8, 3,0.44,3,2,2,3,70, 59.6,13.8,15.4, 0.44, 22,14,4,10,48.0),
  s('COLPAL','Colgate-Palmolive India Ltd','FMCG','Oral Care',2948,80200, 54.8,28.8,53.8,7.4,12.4,0.00,1.60,52.8,48.4, 3,0.38,3,2,2,3,72, 51.0,10.4,12.4, 0.42, 22,14,4,10,50.0),

  /* ── AUTOMOBILE ──────────────────────────────────────────────────── */
  s('MARUTI','Maruti Suzuki India Ltd','Automobile','Passenger Vehicles',12848,387000, 26.4,5.8,486.8,14.4,22.8,0.00,1.40,18.8,17.4, 4,0.72,4,4,3,4,72, 56.4,12.8,14.4, 0.84, 26,12,4,14,22.0),
  s('TATAMOTORS','Tata Motors Ltd','Automobile','Passenger & Commercial Vehicles',988,362000, 8.4,2.8,117.6,18.8,124.8,1.22,0.00,14.8,10.4, 6,1.15,6,5,6,4,62, 46.4,14.8,12.4, 1.14, 24,14,8,18,12.0),
  s('M&M','Mahindra & Mahindra Ltd','Automobile','SUV & Tractors',2848,353000, 28.4,5.2,100.3,22.4,28.8,0.22,0.80,16.8,14.4, 5,0.90,5,4,4,4,74, 18.8,12.4,14.8, 1.44, 28,12,4,16,24.0),
  s('BAJAJ-AUTO','Bajaj Auto Ltd','Automobile','Two-Wheeler & Three-Wheeler',9248,259000, 28.8,8.8,321.2,12.4,18.4,0.00,1.60,24.8,22.4, 4,0.72,4,3,3,4,70, 55.2,8.4,12.8, 0.64, 24,12,4,12,26.0),
  s('HEROMOTOCO','Hero MotoCorp Ltd','Automobile','Two-Wheeler',4648,93000, 22.8,6.4,203.8,6.4,10.8,0.00,3.60,28.8,26.4, 4,0.68,4,3,3,4,66, 34.8,10.4,14.2, 0.24, 20,14,6,10,22.0),
  s('EICHERMOT','Eicher Motors Ltd','Automobile','Motorcycles & Commercial Vehicles',4948,135000, 34.4,9.2,143.8,14.8,18.4,0.00,1.60,28.8,26.4, 5,0.80,5,4,3,4,70, 49.2,8.8,12.4, 1.04, 22,12,4,14,28.0),

  /* ── ENERGY ──────────────────────────────────────────────────────── */
  s('RELIANCE','Reliance Industries Ltd','Energy','Oil Gas & Retail Conglomerate',2945,1850000, 28.4,2.1,103.7,18.5,22.3,0.45,0.34,11.2,13.8, 5,1.12,5,4,4,6,62, 50.3,22.4,14.5, 1.33, 28,8,3,10,25.0),
  s('ONGC','Oil & Natural Gas Corp Ltd','Energy','Upstream Oil & Gas',248,311000, 7.4,0.9,33.4,4.8,8.4,0.28,5.80,11.4,9.8, 5,0.88,5,5,4,6,56, 58.9,8.4,14.4, 0.44, 22,14,8,14,8.0),
  s('NTPC','NTPC Ltd','Energy','Power Generation',384,374000, 16.4,2.2,23.4,8.4,12.4,1.22,2.80,12.4,9.8, 4,0.72,4,4,4,5,62, 51.1,12.4,18.8, 0.64, 26,12,4,14,16.0),
  s('POWERGRID','Power Grid Corp of India Ltd','Energy','Power Transmission',348,323000, 18.4,3.4,18.9,10.4,12.8,1.58,4.40,16.8,14.4, 4,0.62,4,4,4,4,64, 51.3,14.4,20.4, 0.84, 24,12,4,12,18.0),
  s('COALINDIA','Coal India Ltd','Energy','Coal Mining',468,289000, 8.4,4.2,55.7,4.2,12.4,0.00,6.20,52.4,46.8, 4,0.72,4,4,3,5,62, 66.1,10.4,12.8, 0.54, 22,14,6,10,8.5),
  s('ADANIGREEN','Adani Green Energy Ltd','Energy','Renewable Energy',1848,292000, 184.8,18.4,9.8,48.4,68.4,7.88,0.00,8.4,6.4, 8,1.28,8,7,8,7,52, 60.4,5.4,6.8, 2.44, 14,10,14,24,80.0),

  /* ── METALS ──────────────────────────────────────────────────────── */
  s('TATASTEEL','Tata Steel Ltd','Metals','Steel Manufacturing',148,184000, 14.8,1.8,9.9,8.4,-42.8,2.22,0.00,8.8,7.4, 7,1.22,7,6,7,5,52, 33.2,18.8,22.4, -0.84, 18,14,10,16,12.0),
  s('JSWSTEEL','JSW Steel Ltd','Metals','Steel Manufacturing',924,228000, 22.4,3.8,41.2,12.8,-18.4,1.88,0.80,12.8,10.4, 7,1.18,7,6,7,5,54, 44.8,14.2,18.4, 1.14, 20,14,8,16,14.0),
  s('HINDALCO','Hindalco Industries Ltd','Metals','Aluminium & Copper',668,149000, 12.4,1.4,53.8,8.4,14.8,0.92,0.60,12.4,10.8, 6,1.05,6,5,6,5,58, 34.6,14.8,18.4, 0.84, 20,12,8,18,12.0),
  s('SAIL','Steel Authority of India Ltd','Metals','Steel Manufacturing',132,54600, 14.4,0.8,9.2,6.4,-28.4,2.88,3.80,6.8,5.4, 7,1.15,7,6,7,6,44, 65.0,6.8,12.4, -1.04, 14,12,12,14,10.0),

  /* ── TELECOM ──────────────────────────────────────────────────────── */
  s('BHARTIARTL','Bharti Airtel Ltd','Telecom','Mobile & Enterprise Telecom',1748,1044000, 78.4,8.4,22.3,18.4,124.8,2.88,0.40,14.8,10.4, 5,0.90,5,4,5,5,72, 56.2,10.4,8.4, 0.64, 28,12,4,16,50.0),

  /* ── CONSUMER / RETAIL ────────────────────────────────────────────── */
  s('ZOMATO','Zomato Ltd','Consumer','Quick Commerce & Food Delivery',248,221000, 284.8,12.4,0.9,48.4,268.4,0.00,0.00,4.8,3.4, 8,1.35,8,7,7,6,64, 0,14.8,6.4, 2.24, 20,12,14,28,100.0),
  s('BAJFINANCE','Bajaj Finance Ltd','Financial Services','Consumer & MSME Finance',6948,420000, 28.4,6.8,244.7,28.4,24.8,3.88,0.30,22.4,18.8, 5,0.98,5,4,5,4,72, 54.8,12.8,18.4, 0.94, 28,12,4,18,28.0),
  s('TITAN','Titan Company Ltd','Consumer','Jewellery & Accessories',3448,306000, 74.8,22.8,46.1,18.8,22.4,0.22,0.50,28.8,24.4, 5,0.88,5,4,4,4,72, 52.9,8.4,14.8, 1.24, 24,14,4,12,64.0),
  s('NAUKRI','Info Edge (India) Ltd','Consumer','Internet Job Platforms',6748,88000, 74.8,8.4,90.1,14.8,-8.4,0.00,0.30,14.8,12.4, 6,0.82,6,5,5,4,62, 37.6,6.4,12.4, 0.84, 18,12,8,16,60.0),
  s('TRENT','Trent Ltd','Consumer','Fashion Retail',6248,221000, 156.8,24.8,39.8,42.4,68.4,0.22,0.10,18.8,16.4, 7,1.10,7,6,5,4,68, 37.3,8.4,14.4, 2.44, 22,12,8,12,80.0),

  /* ── DEFENCE ─────────────────────────────────────────────────────── */
  s('HAL','Hindustan Aeronautics Ltd','Defence','Aircraft Manufacturing',4448,149000, 32.4,8.8,137.3,18.4,28.4,0.00,0.80,28.8,26.4, 5,0.72,5,4,4,4,80, 75.2,8.4,8.2, 1.84, 24,12,4,18,30.0),
  s('BEL','Bharat Electronics Ltd','Defence','Defence Electronics',292,213000, 48.8,12.8,5.99,22.4,28.8,0.00,0.70,24.8,22.4, 4,0.68,4,3,3,4,78, 51.1,9.8,14.4, 1.14, 26,12,2,22,40.0),

  /* ── INFRASTRUCTURE ──────────────────────────────────────────────── */
  s('LT','Larsen & Toubro Ltd','Infrastructure','Engineering & Construction',3648,509000, 34.8,5.4,104.8,16.8,22.4,0.88,0.80,14.8,12.4, 5,0.82,5,4,5,4,72, 10.4,10.4,18.4, 0.84, 28,12,4,18,28.0),
  s('ADANIPORTS','Adani Ports & SEZ Ltd','Infrastructure','Port Operations',1348,290000, 28.8,4.8,46.8,18.4,22.4,1.22,0.40,18.8,14.4, 6,1.05,6,5,5,5,62, 65.9,5.8,8.4, 1.44, 22,14,8,18,26.0),
];

/* ── MUTUAL FUNDS ──────────────────────────────────────────────────── */

function makeHoldings(names: string[], percents: number[]): { name: string; percent: number }[] {
  return names.map((n, i) => ({ name: n, percent: percents[i] }));
}

function mf(
  code: string, name: string, amcName: string,
  category: MutualFundData['category'], subCategory: string,
  aumCr: number, nav: number, expenseRatio: number, exitLoad: string, minSip: number,
  risk: MutualFundData['riskRating'],
  ret1y: number, ret3y: number, ret5y: number, retInception: number,
  sip1y: number, sip3y: number, sip5y: number,
  sharpe: number, sortino: number, maxDD: number, stdDev: number, beta: number, alpha: number,
  topHoldings: string[], topPercents: number[],
  sectors: string[], sectorPcts: number[],
  suitTag: string, summary: string,
): MutualFundData {
  return {
    code, name, amcName, category, subCategory, aum: aumCr * 10000000, nav, expenseRatio, exitLoad, minSipAmount: minSip, riskRating: risk,
    returns: { oneYear: ret1y, threeYear: ret3y, fiveYear: ret5y, sinceInception: retInception },
    sipReturns: { oneYear: sip1y, threeYear: sip3y, fiveYear: sip5y },
    riskMetrics: { sharpeRatio: sharpe, sortinoRatio: sortino, maxDrawdown: maxDD, standardDeviation: stdDev, beta, alpha },
    topHoldings: makeHoldings(topHoldings, topPercents),
    sectorAllocation: makeHoldings(sectors, sectorPcts),
    navHistory: generateNAVHistory(nav),
    aiSuitabilityTag: suitTag,
    aiSummary: summary,
  };
}

export const mockMutualFunds: MutualFundData[] = [
  /* ── LARGE CAP ─── */
  mf('HDFC-TOP100','HDFC Top 100 Fund - Direct Growth','HDFC AMC','large_cap','Large Cap Fund',
    28400,934.58,0.55,'1% if <1yr',500,'Very High',
    22.4,18.8,16.4,18.2, 20.8,17.4,15.2,
    1.12,1.38,-32.4,20.2,0.96,2.4,
    ['HDFC Bank','ICICI Bank','Reliance Ind.','Infosys','Bharti Airtel'],[9.2,8.4,7.8,6.8,5.4],
    ['Financial Services','IT','Energy','FMCG','Automobile'],[32.4,18.8,12.4,10.8,8.4],
    'Best for: Stable large-cap growth with lower volatility','HDFC Top 100 invests in the top 100 companies by market cap on NSE. Managed by one of India\'s most experienced AMCs, it has delivered consistent long-term returns. Ideal for first-time equity investors who want large-cap exposure with professional management.'),

  mf('SBI-BLUECHIP','SBI Bluechip Fund - Direct Growth','SBI Mutual Fund','large_cap','Large Cap Fund',
    46200,82.34,0.82,'1% if <1yr',500,'Very High',
    20.8,17.4,15.8,17.4, 19.2,16.2,14.8,
    1.04,1.28,-33.8,21.4,0.98,1.8,
    ['HDFC Bank','Reliance Ind.','Infosys','ICICI Bank','TCS'],[8.8,7.4,7.2,7.0,6.8],
    ['Financial Services','IT','Energy','Consumer','FMCG'],[30.4,19.4,11.8,10.2,9.8],
    'Best for: Consistent large-cap returns via India\'s largest AMC','SBI Bluechip is one of India\'s most popular large-cap funds with over ₹46,000 Cr AUM. Managed by SBI\'s experienced team, it focuses on high-quality businesses with sustainable competitive advantages.'),

  mf('MIRAE-LARGECAP','Mirae Asset Large Cap Fund - Direct Growth','Mirae Asset','large_cap','Large Cap Fund',
    34800,112.44,0.54,'1% if <1yr',1000,'Very High',
    21.4,18.2,16.8,18.8, 19.8,16.8,15.4,
    1.14,1.42,-31.8,19.8,0.94,2.8,
    ['HDFC Bank','ICICI Bank','Infosys','Reliance Ind.','Axis Bank'],[9.4,8.8,7.4,7.2,5.8],
    ['Financial Services','IT','Energy','Automobile','FMCG'],[34.2,18.4,11.4,10.2,8.8],
    'Best for: Quality-focused large-cap with Mirae\'s global research','Mirae Asset Large Cap Fund is known for its research-driven quality approach. Consistently ranked in the top quartile, it provides exposure to India\'s blue-chip companies with a focus on return on equity and earnings growth.'),

  /* ── MID CAP ─── */
  mf('AXIS-MIDCAP','Axis Midcap Fund - Direct Growth','Axis Mutual Fund','mid_cap','Mid Cap Fund',
    24800,98.28,0.52,'1% if <1yr',500,'Very High',
    28.4,24.8,22.4,22.8, 26.4,22.4,20.8,
    1.18,1.48,-38.4,24.2,0.92,4.8,
    ['Persistent Sys','Cholamandalam Fin','Cummins India','Tube Investments','Supreme Industries'],[4.8,4.4,4.2,3.8,3.6],
    ['Financial Services','Consumer','IT','Industrials','Healthcare'],[20.4,18.8,14.2,12.4,10.8],
    'Best for: Growth via quality mid-cap businesses','Axis Midcap is India\'s leading mid-cap fund, known for focusing on quality businesses with sustainable growth. Fund manager Shreyash Devalkar\'s disciplined approach has generated consistent alpha over benchmark.'),

  mf('HDFC-MIDCAP','HDFC Mid-Cap Opportunities Fund - Direct Growth','HDFC AMC','mid_cap','Mid Cap Fund',
    68400,162.84,0.72,'1% if <1yr',500,'Very High',
    30.4,26.4,24.8,23.4, 28.2,24.2,22.4,
    1.24,1.54,-40.4,26.4,0.96,5.2,
    ['Persistent Sys','Coforge','Cholamandalam Fin','Voltas','Tube Investments'],[4.4,4.2,4.0,3.8,3.6],
    ['Financial Services','IT','Consumer','Industrials','Healthcare'],[22.4,16.4,14.8,12.8,10.4],
    'Best for: Long-term wealth creation via mid-cap exposure','HDFC Mid-Cap Opportunities is the largest mid-cap fund in India by AUM. Its experienced management team and diversified approach across 60-80 quality mid-cap stocks has generated superior long-term returns.'),

  mf('KOTAK-EMERGING','Kotak Emerging Equity Fund - Direct Growth','Kotak Mutual Fund','mid_cap','Mid Cap Fund',
    38200,128.48,0.44,'1% if <1yr',100,'Very High',
    32.4,24.8,22.8,20.4, 30.2,22.8,21.2,
    1.22,1.52,-42.4,27.2,1.04,4.4,
    ['Persistent Sys','Trent','Cummins India','Cholamandalam Fin','Crompton Greaves'],[4.8,4.4,4.2,4.0,3.6],
    ['Financial Services','IT','Consumer','Industrials','Healthcare'],[20.8,16.8,15.4,12.4,10.2],
    'Best for: Aggressive mid-cap growth with disciplined risk management','Kotak Emerging Equity focuses on companies transitioning from mid to large-cap status. Its concentrated portfolio of 40-55 companies with high conviction ideas has consistently outperformed the Nifty Midcap 150 index.'),

  /* ── SMALL CAP ─── */
  mf('SBI-SMALLCAP','SBI Small Cap Fund - Direct Growth','SBI Mutual Fund','small_cap','Small Cap Fund',
    28400,162.58,0.68,'1% if <3yr',500,'Very High',
    28.4,28.8,30.4,22.4, 26.2,26.4,28.4,
    1.14,1.44,-48.4,32.4,0.84,6.8,
    ['Blue Star','Finolex Industries','Hawkins Cookers','Chalet Hotels','Suprajit Engineering'],[3.4,3.2,3.0,2.8,2.6],
    ['Consumer','Industrials','Healthcare','IT','Financials'],[22.4,20.8,12.8,12.4,10.4],
    'Best for: High growth potential via quality small-cap businesses','SBI Small Cap Fund is India\'s most popular small-cap fund. It follows a bottom-up stock-picking approach with focus on companies with strong business fundamentals. Suitable for investors with 5+ year horizon who can handle high volatility.'),

  mf('NIPPON-SMALLCAP','Nippon India Small Cap Fund - Direct Growth','Nippon India AMC','small_cap','Small Cap Fund',
    48200,148.24,0.68,'1% if <1yr',100,'Very High',
    34.8,30.4,28.8,24.4, 32.4,28.4,26.8,
    1.18,1.48,-52.4,34.8,0.92,7.4,
    ['KPIT Technologies','Kirloskar Oils','Balaji Amines','DCM Shriram','KSB Ltd'],[3.2,3.0,2.8,2.6,2.4],
    ['Industrials','Consumer','Healthcare','IT','Financials'],[24.4,20.4,14.4,12.4,10.8],
    'Best for: Maximum long-term growth via diversified small-caps','Nippon India Small Cap is the largest small-cap fund in India with a highly diversified portfolio of 150+ companies. Its broad market exposure captures growth across the entire small-cap universe. Very high risk, very high potential return.'),

  /* ── INDEX FUNDS ─── */
  mf('UTI-NIFTY50','UTI Nifty 50 Index Fund - Direct Growth','UTI AMC','index','Nifty 50 Index Fund',
    14800,148.24,0.18,'None',500,'Very High',
    18.4,14.8,13.4,14.8, 17.2,13.8,12.4,
    0.88,1.08,-38.4,18.8,1.00,-0.2,
    ['HDFC Bank','Reliance Ind.','ICICI Bank','Infosys','Bharti Airtel'],[13.2,9.8,8.4,7.8,5.2],
    ['Financial Services','IT','Energy','Consumer','FMCG'],[33.4,13.8,12.4,10.8,8.4],
    'Best for: Low-cost market-matching returns — index investing for beginners','UTI Nifty 50 tracks India\'s benchmark index with just 0.18% expense ratio. Warren Buffett famously recommends index funds for most investors. Perfect for teens starting out — you own a tiny piece of India\'s 50 largest companies.'),

  mf('HDFC-NIFTY50','HDFC Index Fund Nifty 50 Plan - Direct Growth','HDFC AMC','index','Nifty 50 Index Fund',
    12400,218.44,0.20,'None',100,'Very High',
    18.2,14.6,13.2,14.6, 17.0,13.6,12.2,
    0.86,1.06,-38.6,18.6,1.00,-0.2,
    ['HDFC Bank','Reliance Ind.','ICICI Bank','Infosys','TCS'],[13.0,9.8,8.4,7.8,6.8],
    ['Financial Services','IT','Energy','FMCG','Consumer'],[33.2,14.0,12.2,10.8,8.4],
    'Best for: Ultra-low cost Nifty 50 exposure from a trusted AMC','HDFC\'s Nifty 50 index fund with just ₹100 minimum SIP. Passive investing at its most accessible — ideal for students building their first long-term portfolio.'),

  mf('UTI-NIFTYNEXT50','UTI Nifty Next 50 Index Fund - Direct Growth','UTI AMC','index','Nifty Next 50 Index Fund',
    4800,72.44,0.30,'None',500,'Very High',
    22.4,18.4,16.8,17.8, 20.8,17.2,15.4,
    0.92,1.14,-42.4,22.4,1.04,1.2,
    ['Adani Ports','Vedanta','Bharat Petroleum','Siemens','Godrej Consumer'],[3.8,3.4,3.2,3.0,2.8],
    ['Financial Services','Energy','Consumer','Industrials','IT'],[24.4,16.4,14.4,12.8,10.4],
    'Best for: Higher growth potential than Nifty 50 via next 50 companies','Nifty Next 50 contains India\'s 51st-100th largest companies — often called the "tomorrow\'s Nifty 50". Historically outperforms Nifty 50 over long periods with slightly higher volatility. Great for younger investors.'),

  /* ── FLEXI CAP ─── */
  mf('PPFAS-FLEXI','Parag Parikh Flexi Cap Fund - Direct Growth','PPFAS Mutual Fund','flexi_cap','Flexi Cap Fund',
    72400,78.32,0.59,'2% if <365d',1000,'Very High',
    24.8,22.4,20.8,20.2, 22.8,20.4,18.8,
    1.18,1.44,-36.4,19.8,0.82,4.8,
    ['HDFC Bank','Bajaj Holdings','Alphabet Inc.','Microsoft Corp.','Coal India'],[6.4,6.2,5.8,5.4,4.8],
    ['Financial Services','IT','Consumer','Energy','Communication'],[22.4,20.8,16.4,12.4,10.2],
    'Best for: Unique global + India exposure in one fund','PPFAS Flexi Cap is India\'s most trusted flexi-cap fund, unique for its 35% international allocation. Fund manager Rajeev Thakkar\'s value-investing approach and low portfolio turnover make it popular with long-term, patient investors.'),

  mf('HDFC-FLEXICAP','HDFC Flexi Cap Fund - Direct Growth','HDFC AMC','flexi_cap','Flexi Cap Fund',
    58400,1482.44,0.78,'1% if <1yr',100,'Very High',
    26.4,24.8,22.4,22.8, 24.2,22.8,20.4,
    1.14,1.42,-38.4,21.4,0.96,3.8,
    ['ICICI Bank','Axis Bank','HDFC Bank','Kotak Bank','SBI'],[7.8,6.4,6.2,5.8,5.4],
    ['Financial Services','IT','Energy','Consumer','FMCG'],[36.4,16.4,12.4,10.8,8.4],
    'Best for: Dynamic allocation across market caps with active management','HDFC Flexi Cap, managed by legendary Prashant Jain until 2022, continues to deliver strong returns. The fund dynamically moves between large, mid, and small caps based on valuations and growth outlook.'),

  /* ── ELSS ─── */
  mf('AXIS-ELSS','Axis Long Term Equity Fund - Direct Growth','Axis Mutual Fund','elss','ELSS Tax Saving Fund',
    28800,72.84,0.54,'3yr lock-in',500,'Very High',
    22.4,18.8,20.4,22.4, 20.8,17.4,18.8,
    1.08,1.34,-38.4,22.4,0.92,2.8,
    ['HDFC Bank','Infosys','TCS','Titan Co.','Asian Paints'],[7.2,6.4,6.2,5.8,5.4],
    ['Financial Services','IT','Consumer','FMCG','Healthcare'],[30.4,18.8,14.4,12.4,10.8],
    'Best for: Tax saving (Section 80C) + equity growth via quality stocks','Axis ELSS has the shortest lock-in of any 80C instrument — just 3 years. Save up to ₹46,800 in taxes while your money compounds. Axis\' quality-growth approach has historically beaten most ELSS peers.'),

  mf('HDFC-ELSS','HDFC ELSS Tax Saver Fund - Direct Growth','HDFC AMC','elss','ELSS Tax Saving Fund',
    12800,1048.32,0.80,'3yr lock-in',500,'Very High',
    20.8,18.2,16.8,22.8, 19.2,16.8,15.4,
    1.02,1.28,-40.4,22.8,0.96,2.4,
    ['ICICI Bank','HDFC Bank','Reliance Ind.','Axis Bank','SBI'],[8.4,8.0,7.2,5.8,5.4],
    ['Financial Services','IT','Energy','Consumer','FMCG'],[36.4,14.8,11.4,10.2,8.4],
    'Best for: Tax saving with equity growth (80C deduction)','HDFC ELSS Tax Saver combines equity market returns with Section 80C tax benefits of up to ₹1.5 lakh per year. With a mandatory 3-year lock-in, it enforces investment discipline. The shortest lock-in among all 80C investments.'),

  /* ── HYBRID ─── */
  mf('ICICI-BALANCED','ICICI Prudential Balanced Advantage Fund - Direct Growth','ICICI Prudential AMC','hybrid','Balanced Advantage Fund',
    48400,62.44,0.78,'1% if <1yr',500,'Moderately High',
    16.4,14.8,12.8,14.4, 15.2,13.8,12.2,
    0.98,1.22,-24.4,14.4,0.72,2.4,
    ['HDFC Bank','ICICI Bank','Reliance Ind.','Infosys','SBI'],[7.8,7.2,6.4,5.8,5.4],
    ['Financial Services','IT','Energy','Consumer','Government Securities'],[28.4,12.4,10.4,8.4,22.4],
    'Best for: Lower volatility with equity returns — all-weather fund','ICICI Prudential Balanced Advantage dynamically manages its equity-debt allocation based on market valuations (PE ratio). It automatically reduces equity when markets are expensive and adds more when cheap — perfect for nervous investors.'),

  mf('HDFC-BALANCED','HDFC Balanced Advantage Fund - Direct Growth','HDFC AMC','hybrid','Balanced Advantage Fund',
    88400,378.44,0.80,'1% if <1yr',500,'Moderately High',
    18.4,16.4,14.8,15.4, 17.2,15.2,13.8,
    1.04,1.28,-26.4,15.8,0.76,2.8,
    ['HDFC Bank','ICICI Bank','Reliance Ind.','Axis Bank','Infosys'],[8.2,7.4,6.8,5.8,5.4],
    ['Financial Services','IT','Energy','Consumer','Government Securities'],[30.4,12.8,10.4,8.4,20.4],
    'Best for: Auto-rebalancing between equity and debt','India\'s largest hybrid fund with ₹88,400 Cr AUM. HDFC Balanced Advantage automatically rebalances between equities and fixed income, offering equity-like returns with reduced volatility. Suitable for moderate risk investors.'),

  /* ── DEBT ─── */
  mf('HDFC-CORPBOND','HDFC Corporate Bond Fund - Direct Growth','HDFC AMC','debt','Corporate Bond Fund',
    28800,30.44,0.36,'None',500,'Moderate',
    8.4,7.8,7.4,8.2, 8.2,7.6,7.2,
    0.82,0.98,-6.4,4.4,0.28,0.8,
    ['REC Ltd','NABARD','NTPC','HUDCO','Power Finance Corp'],[8.4,7.8,7.2,6.8,6.4],
    ['Financial Services','Energy','Infrastructure','PSU','Housing Finance'],[22.4,18.4,16.4,14.4,12.4],
    'Best for: Stable fixed income returns from high-quality corporate bonds','HDFC Corporate Bond invests in AA+ and AAA rated bonds for stable, tax-efficient returns. Beat FD returns with lower risk than equity. Ideal for short to medium-term goals with 2-3 year horizon.'),
];

export const mockNiftyHistory: PricePoint[] = generatePriceHistory(22450, 365);

export function getStockByTicker(ticker: string): StockData | undefined {
  return mockStocks.find(s => s.ticker === ticker);
}
export function getFundByCode(code: string): MutualFundData | undefined {
  return mockMutualFunds.find(f => f.code === code);
}
