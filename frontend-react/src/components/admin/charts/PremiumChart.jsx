import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, IndianRupee, Store, Globe, 
  Sparkles, Layers, Droplets, Calendar, CheckCircle2, ChevronRight
} from 'lucide-react';

/**
 * Universal SVG Gradients & Glow Filters for Recharts
 */
export const ChartGradients = () => (
  <defs>
    {/* Blue Sapphire Gradient */}
    <linearGradient id="sapphireGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
      <stop offset="60%" stopColor="#2563eb" stopOpacity={0.08} />
      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
    </linearGradient>

    {/* Emerald Green Gradient */}
    <linearGradient id="emeraldGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#059669" stopOpacity={0.45} />
      <stop offset="60%" stopColor="#059669" stopOpacity={0.09} />
      <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
    </linearGradient>

    {/* Amber Gold Gradient */}
    <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#d97706" stopOpacity={0.4} />
      <stop offset="60%" stopColor="#d97706" stopOpacity={0.08} />
      <stop offset="100%" stopColor="#d97706" stopOpacity={0.0} />
    </linearGradient>

    {/* Violet Purple Gradient */}
    <linearGradient id="violetGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
      <stop offset="60%" stopColor="#7c3aed" stopOpacity={0.08} />
      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.0} />
    </linearGradient>

    {/* Rose Pink Gradient */}
    <linearGradient id="roseGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#e11d48" stopOpacity={0.4} />
      <stop offset="60%" stopColor="#e11d48" stopOpacity={0.08} />
      <stop offset="100%" stopColor="#e11d48" stopOpacity={0.0} />
    </linearGradient>

    {/* Cyan Gradient */}
    <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0891b2" stopOpacity={0.4} />
      <stop offset="60%" stopColor="#0891b2" stopOpacity={0.08} />
      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.0} />
    </linearGradient>
  </defs>
);

/**
 * High-End Frosted Glass Custom Tooltip
 */
export const GlassTooltip = ({ active, payload, label, unit = '₹', isVolume = false }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/70 shadow-2xl rounded-2xl p-3.5 min-w-[190px] text-xs pointer-events-none transition-all duration-150">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
        <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-400" />
          {label}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-semibold">
          Daily Log
        </span>
      </div>

      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const val = Number(item.value || 0);
          const formatted = isVolume || item.dataKey === 'salesVolume' || item.unit === 'L'
            ? `${val.toLocaleString('en-IN')} L`
            : `₹${val.toLocaleString('en-IN')}`;

          return (
            <div key={index} className="flex items-center justify-between gap-3 py-0.5">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 shrink-0" 
                  style={{ backgroundColor: item.color || item.stroke || '#3b82f6' }}
                />
                <span className="text-slate-300 font-medium text-[11px] truncate max-w-[110px]">
                  {item.name || item.dataKey}
                </span>
              </div>
              <span className="font-mono font-bold text-white text-[12px] shrink-0">
                {formatted}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Custom Active Concentric Dot
 */
export const GlowingDot = (props) => {
  const { cx, cy, stroke, fill = '#fff' } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={stroke} fillOpacity={0.25} />
      <circle cx={cx} cy={cy} r={4} fill={fill} stroke={stroke} strokeWidth={2.5} />
    </g>
  );
};

/**
 * 1. PREMIUM EXECUTIVE PERFORMANCE TRAJECTORY CHART (For Overview Dashboard)
 * Supports switching between:
 * - 'all' (Gross Revenue & Net Profit)
 * - 'channels' (Shop POS vs Web Deliveries)
 * - 'profit' (Pure Profit & Spread Margins)
 * - 'volume' (Milk Litres / Sales Volume)
 */
export const PremiumTrajectoryChart = ({ data = [], height = 300, className = '' }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'channels', 'profit', 'volume'

  // Pre-calculate summary stats from 7-day data
  const totalRev = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalProfit = data.reduce((sum, d) => sum + (d.profit || 0), 0);
  const totalVolume = data.reduce((sum, d) => sum + (d.salesVolume || 0), 0);
  const totalShop = data.reduce((sum, d) => sum + (d.shopRevenue || 0), 0);
  const totalWeb = data.reduce((sum, d) => sum + (d.webRevenue || 0), 0);
  const peakRev = Math.max(...data.map(d => d.revenue || 0), 0);

  return (
    <div className={`bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 ${className}`}>
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Revenue & Performance Trajectory
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live IST
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily telemetry across counter sales, deliveries, and margins.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Revenue & Profit
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏪 Shop vs Web
          </button>
          <button
            onClick={() => setActiveTab('profit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profit'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📈 Pure Margins
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'volume'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🥛 Volume (L)
          </button>
        </div>
      </div>

      {/* Micro-Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">7-Day Total Revenue</span>
          <span className="text-sm font-black text-slate-900 font-mono">₹{totalRev.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">7-Day Net Profit</span>
          <span className="text-sm font-black text-emerald-700 font-mono">+₹{totalProfit.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Single Day</span>
          <span className="text-sm font-black text-blue-700 font-mono">₹{peakRev.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
          <span className="text-sm font-black text-indigo-700 font-mono">{totalVolume.toLocaleString('en-IN')} Units</span>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div style={{ height }} className="w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'all' && (
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
              <Tooltip content={<GlassTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Gross Revenue" 
                stroke="#2563eb" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#sapphireGlow)" 
                activeDot={<GlowingDot stroke="#2563eb" />}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                name="Net Profit" 
                stroke="#059669" 
                strokeWidth={3} 
                dot={{ r: 3.5, fill: '#059669', strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={<GlowingDot stroke="#059669" />}
              />
            </ComposedChart>
          )}

          {activeTab === 'channels' && (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
              <Tooltip content={<GlassTooltip />} />
              <Bar 
                dataKey="shopRevenue" 
                name="Shop POS Counter" 
                fill="#059669" 
                radius={[6, 6, 0, 0]} 
                barSize={18} 
              />
              <Bar 
                dataKey="webRevenue" 
                name="Online Website & COD" 
                fill="#2563eb" 
                radius={[6, 6, 0, 0]} 
                barSize={18} 
              />
            </BarChart>
          )}

          {activeTab === 'profit' && (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
              <Tooltip content={<GlassTooltip />} />
              <Area 
                type="monotone" 
                dataKey="profit" 
                name="Net Profit" 
                stroke="#059669" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#emeraldGlow)" 
                activeDot={<GlowingDot stroke="#059669" />}
              />
            </AreaChart>
          )}

          {activeTab === 'volume' && (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<GlassTooltip isVolume={true} />} />
              <Bar 
                dataKey="salesVolume" 
                name="Volume Delivered" 
                fill="#7c3aed" 
                radius={[6, 6, 0, 0]} 
                barSize={24} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * 2. PREMIUM FINANCIER CAPITAL & CASHFLOW CHART (For Financier Khata)
 * Visualizes:
 * - Financed bills (+)
 * - Repayments (-)
 * - Outstanding running balance line
 */
export const PremiumFinancierCashflowChart = ({ transactions = [], metrics = {}, profitAnalytics = {} }) => {
  // Aggregate transactions by date for a smooth trend
  const timelineMap = {};
  
  // Sort oldest to newest for chronological plotting
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  sorted.forEach(t => {
    const dStr = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (!timelineMap[dStr]) {
      timelineMap[dStr] = { date: dStr, financed: 0, repaid: 0, balance: t.runningBalance || 0 };
    }
    if (t.type === 'FINANCED') {
      timelineMap[dStr].financed += Number(t.amount || 0);
    } else {
      timelineMap[dStr].repaid += Number(t.amount || 0);
    }
    timelineMap[dStr].balance = t.runningBalance || timelineMap[dStr].balance;
  });

  const chartData = Object.values(timelineMap);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Financier Capital Inflow & Repayment Ledger
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Passbook Visualizer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracking money funded by investor for milk bills vs lump-sum customer repayments.
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Financed (+)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Repaid (-)
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Outstanding Debt
          </span>
        </div>
      </div>

      <div className="h-[260px] w-full pt-1">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
              <Tooltip content={<GlassTooltip />} />
              <Bar 
                dataKey="financed" 
                name="Financed (+)" 
                fill="#2563eb" 
                radius={[5, 5, 0, 0]} 
                barSize={16} 
              />
              <Bar 
                dataKey="repaid" 
                name="Repaid (-)" 
                fill="#059669" 
                radius={[5, 5, 0, 0]} 
                barSize={16} 
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                name="Outstanding Owed" 
                stroke="#d97706" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#d97706', strokeWidth: 1.5, stroke: '#fff' }}
                activeDot={<GlowingDot stroke="#d97706" />}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No transaction timeline available yet.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 3. PREMIUM DONUT / CATEGORY DISTRIBUTION CHART
 */
export const PremiumDonutChart = ({ data = [], title = 'Category Breakdown', totalLabel = 'Total' }) => {
  const totalVal = data.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">Proportional share across product categories</p>
      </div>

      <div className="h-[200px] w-full relative flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || ['#059669', '#2563eb', '#7c3aed', '#d97706', '#0891b2'][index % 5]} />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered KPI Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-black text-slate-900 font-mono">
            ₹{totalVal.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Modern Pill Legends */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {data.map((item, idx) => {
          const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color || ['#059669', '#2563eb', '#7c3aed', '#d97706', '#0891b2'][idx % 5] }} 
                />
                <span className="text-slate-700 font-semibold">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">₹{item.value.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

