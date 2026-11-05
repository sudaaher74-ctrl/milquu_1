import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import { motion } from 'framer-motion';
import { 
  IndianRupee, TrendingUp, TrendingDown, Package, Users, 
  CalendarDays, ShoppingBag, Truck, Store, Globe, 
  Landmark, Droplets, ArrowUpRight, ArrowRight, Clock,
  CheckCircle2, Wallet, AlertCircle, RefreshCw, Sparkles,
  Receipt, Boxes
} from 'lucide-react';
import ExportButton from '../../components/admin/ExportButton';
import TodayPanel from '../../components/admin/TodayPanel';
import { getAdminSession, isManagerRole } from '../../utils/adminAccess';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Line, ComposedChart
} from 'recharts';

const DATE_RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year', 'All Time'];

const EMPTY_METRICS = {
  revenue: 0,
  cogs: 0,
  grossProfit: 0,
  expenses: 0,
  netProfit: 0,
  inventoryValue: 0,
  orders: 0,
  activeSubscribers: 0,
  webRevenue: 0,
  shopRevenue: 0,
  revenueData: [],
  customerData: [],
  topPerformers: [],
  actionRequired: [],
  operationsLive: {
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalDeliveries: 0,
    recentExpenses: []
  }
};

const MetricCard = ({ title, value, icon, subtitle, colorTheme = 'emerald', trend }) => {
  const themeStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${themeStyles[colorTheme] || themeStyles.emerald}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

const Overview = () => {
  const session = getAdminSession();
  const role = session?.role || 'staff';
  const showBusiness = isManagerRole(role);

  const [dateRange, setDateRange] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);

  // Financier & Khata Pulse
  const [financierMetrics, setFinancierMetrics] = useState({
    totalOutstandingAll: 0,
    totalCustomerCredit: 0,
    workingCapitalGap: 0
  });

  const reportData = [
    { Metric: 'Total Revenue', Value: metrics.revenue },
    { Metric: 'COGS', Value: metrics.cogs },
    { Metric: 'Gross Profit', Value: metrics.grossProfit },
    { Metric: 'Total Expenses', Value: metrics.expenses },
    { Metric: 'Net Profit', Value: metrics.netProfit },
    { Metric: 'Total Orders', Value: metrics.orders },
    { Metric: 'Inventory Value', Value: metrics.inventoryValue }
  ];

  const fetchAnalytics = async () => {
    if (!showBusiness) return;
    try {
      setLoading(true);
      const query = dateRange === 'All Time' ? '' : `?dateRange=${encodeURIComponent(dateRange)}`;
      const [analyticsRes, finRes] = await Promise.all([
        api.get(`/api/erp/analytics${query}`),
        api.get('/api/erp/financiers').catch(() => ({ data: { metrics: {} } }))
      ]);

      setMetrics({ ...EMPTY_METRICS, ...(analyticsRes.data || {}) });
      if (finRes.data?.metrics) {
        setFinancierMetrics(finRes.data.metrics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, showBusiness]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* ========================================================================= */}
      {/* 1. WELCOME & OPERATIONS HEADER                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Welcome back, {session?.name || 'Admin'}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Dairy Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time dairy dispatch, counter sales, milk procurement, and financial balances.
          </p>
        </div>

        {showBusiness && (
          <div className="flex items-center gap-2.5">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              {DATE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ExportButton 
              data={reportData} 
              filename="MilQuu_Business_Performance" 
              title={`Business Performance — ${dateRange}`} 
              className="!bg-slate-900 !text-white hover:!bg-slate-800 !text-xs !py-1.5 !px-3 rounded-xl" 
            />
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE WORKING CAPITAL & CASHFLOW COMMAND CARD                      */}
      {/* ========================================================================= */}
      {showBusiness && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                <Wallet size={13} className="text-indigo-400" /> Working Capital & Cashflow Pulse
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Customer Credit vs Financier Debt
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Compare outstanding receivables from customer credit khatas with procurement debt owed to financiers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/admin/financiers"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Landmark size={14} /> Open Financier Khata <ArrowRight size={13} />
              </Link>
              <Link
                to="/admin/pos"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Store size={14} /> Counter & Credit Bills
              </Link>
            </div>
          </div>

          {/* 3 Metric Pills inside Command Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Clock size={12} className="text-amber-400" /> Customer Credit Due (उधारी)
              </span>
              <p className="text-2xl font-black text-amber-300 mt-1">
                ₹{(financierMetrics.totalCustomerCredit || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Money to collect from retail/credit customers</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Landmark size={12} className="text-indigo-300" /> Financier Pending Due (देना बाकी)
              </span>
              <p className="text-2xl font-black text-white mt-1">
                ₹{(financierMetrics.totalOutstandingAll || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Owed for milk procurement bills</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-400" /> Net Safety Buffer
              </span>
              <p className={`text-2xl font-black mt-1 ${
                financierMetrics.workingCapitalGap >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {financierMetrics.workingCapitalGap >= 0 ? '+' : ''}₹{(financierMetrics.workingCapitalGap || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {financierMetrics.workingCapitalGap >= 0 ? 'Surplus buffer after settlements' : 'Deficit: collections needed'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TODAY'S DISPATCH & ROUNDS PANEL                                        */}
      {/* ========================================================================= */}
      <TodayPanel role={role} />

      {/* ========================================================================= */}
      {/* 4. FAST WORKFLOW LAUNCHPAD                                                */}
      {/* ========================================================================= */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Workflows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/pos"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-emerald-400 transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 group-hover:text-emerald-700">
                <Store size={15} /> Shop POS
              </span>
              <p className="text-base font-bold text-slate-900">Counter Sales</p>
              <p className="text-[11px] text-slate-400">Retail billing & daily cash</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-800 flex items-center justify-center transition-colors">
              <ArrowUpRight size={16} />
            </div>
          </Link>

          <Link
            to="/admin/procurement"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-blue-400 transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 group-hover:text-blue-700">
                <Droplets size={15} /> Procurement
              </span>
              <p className="text-base font-bold text-slate-900">Milk Sourcing</p>
              <p className="text-[11px] text-slate-400">Daily litres, Fat & SNF</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-800 flex items-center justify-center transition-colors">
              <ArrowUpRight size={16} />
            </div>
          </Link>

          <Link
            to="/admin/purchases"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-400 transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 group-hover:text-indigo-700">
                <ShoppingCart size={15} /> Purchases
              </span>
              <p className="text-base font-bold text-slate-900">Vendor Khata</p>
              <p className="text-[11px] text-slate-400">Supplier bills & balances</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-800 flex items-center justify-center transition-colors">
              <ArrowUpRight size={16} />
            </div>
          </Link>

          <Link
            to="/admin/subscriptions"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-amber-400 transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 group-hover:text-amber-700">
                <CalendarDays size={15} /> Subscriptions
              </span>
              <p className="text-base font-bold text-slate-900">Doorstep Milk</p>
              <p className="text-[11px] text-slate-400">Daily plans & pause/resume</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-100 text-slate-400 group-hover:text-amber-800 flex items-center justify-center transition-colors">
              <ArrowUpRight size={16} />
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRIMARY BUSINESS PERFORMANCE KPIS                                      */}
      {/* ========================================================================= */}
      {showBusiness && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Business Performance ({dateRange})
            </h2>
            <span className="text-xs text-slate-400 font-medium">{loading ? 'Updating...' : 'Live Synced'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard 
              title="Total Revenue" 
              value={`₹${(metrics.revenue || 0).toLocaleString('en-IN')}`} 
              icon={<IndianRupee size={18} />} 
              colorTheme="emerald" 
            />
            <MetricCard 
              title="Net Profit" 
              value={`₹${(metrics.netProfit || 0).toLocaleString('en-IN')}`} 
              icon={<TrendingUp size={18} />} 
              colorTheme={metrics.netProfit >= 0 ? 'blue' : 'rose'} 
            />
            <MetricCard 
              title="Total Orders" 
              value={(metrics.orders || 0).toLocaleString('en-IN')} 
              icon={<ShoppingBag size={18} />} 
              colorTheme="indigo" 
            />
            <MetricCard 
              title="Subscribers" 
              value={(metrics.activeSubscribers || 0).toLocaleString('en-IN')} 
              icon={<CalendarDays size={18} />} 
              colorTheme="amber" 
            />
            <MetricCard 
              title="Inventory Stock" 
              value={`₹${(metrics.inventoryValue || 0).toLocaleString('en-IN')}`} 
              icon={<Boxes size={18} />} 
              colorTheme="violet" 
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Shop POS Revenue</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">₹{(metrics.shopRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <Store size={20} className="text-rose-600" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Online Web Orders</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">₹{(metrics.webRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <Globe size={20} className="text-indigo-600" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Expenses</span>
                <p className="text-lg font-bold text-rose-600 mt-0.5">₹{(metrics.expenses || 0).toLocaleString('en-IN')}</p>
              </div>
              <TrendingDown size={20} className="text-rose-500" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Cost of Goods (COGS)</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">₹{(metrics.cogs || 0).toLocaleString('en-IN')}</p>
              </div>
              <Package size={20} className="text-slate-600" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CHARTS & OPERATIONS LIVE                                               */}
      {/* ========================================================================= */}
      {showBusiness && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Profit Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revenue & Profit Trend</h3>
                <p className="text-xs text-slate-400">Cashflow trajectory across billing cycles</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Revenue
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Net Profit
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics.revenueData || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevNew)" />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth & Top Products */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top Performing Products</h3>
                <p className="text-xs text-slate-400">High volume milk & dairy items</p>
              </div>
              <Link to="/admin/products" className="text-xs font-bold text-emerald-700 hover:underline">
                Manage Catalog &rarr;
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {metrics.topPerformers?.length > 0 ? (
                metrics.topPerformers.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Farm Fresh Direct</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-lg">
                      {item.volume} units sold
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No product sales data recorded for this period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
