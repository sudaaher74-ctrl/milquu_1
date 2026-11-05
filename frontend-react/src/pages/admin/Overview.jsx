import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import { 
  IndianRupee, TrendingUp, TrendingDown, Package, Users, 
  CalendarDays, ShoppingBag, Truck, Store, Globe, 
  Landmark, Droplets, ArrowUpRight, ArrowRight, Clock,
  CheckCircle2, Wallet, AlertCircle, RefreshCw, Sparkles,
  Receipt, Boxes, Bike, ArrowDownLeft, ShieldCheck, Layers
} from 'lucide-react';
import ExportButton from '../../components/admin/ExportButton';
import TodayPanel from '../../components/admin/TodayPanel';
import { getAdminSession, isManagerRole } from '../../utils/adminAccess';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line
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
  shopRevenue: 0,
  webRevenue: 0,
  shopStats: {
    revenue: 0,
    orderCount: 0,
    customerCreditDue: 0,
    financierDue: 0,
    netWorkingBuffer: 0,
    milkMargin: {
      buyRate: 52,
      sellRate: 64,
      marginPerLitre: 12,
      marginPercent: 19,
      totalLitres: 936.5,
      totalProcurementCost: 48259,
      projectedSalesRevenue: 59936,
      totalEarnedProfit: 11677
    }
  },
  webStats: {
    revenue: 0,
    orderCount: 0,
    codRevenue: 0,
    codPending: 0,
    activeSubscribers: 0,
    pendingDeliveries: 0
  },
  activeCustomers: 0,
  activeSubscribers: 0,
  revenueData: [],
  topPerformers: [],
  operationsLive: {
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalDeliveries: 0,
    recentExpenses: []
  }
};

const Overview = () => {
  const session = getAdminSession();
  const role = session?.role || 'staff';
  const showBusiness = isManagerRole(role);

  // Channel Switcher: 'all' (Combined) | 'shop' (Shop POS & Khata) | 'web' (Website & COD)
  const [activeChannel, setActiveChannel] = useState('all');
  const [dateRange, setDateRange] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);

  const fetchAnalytics = async () => {
    if (!showBusiness) return;
    try {
      setLoading(true);
      const query = dateRange === 'All Time' ? '' : `?dateRange=${encodeURIComponent(dateRange)}`;
      const res = await api.get(`/api/erp/analytics${query}`);
      setMetrics({ ...EMPTY_METRICS, ...(res.data || {}) });
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, showBusiness]);

  const shopStats = metrics.shopStats || EMPTY_METRICS.shopStats;
  const webStats = metrics.webStats || EMPTY_METRICS.webStats;

  const reportData = [
    { Metric: 'Total Revenue', Value: metrics.revenue },
    { Metric: 'Shop POS Revenue', Value: metrics.shopRevenue },
    { Metric: 'Website & COD Revenue', Value: metrics.webRevenue },
    { Metric: 'Shop Customer Khata Credit', Value: shopStats.customerCreditDue },
    { Metric: 'Financier Milk Bills Due', Value: shopStats.financierDue },
    { Metric: 'Website COD Pending with Riders', Value: webStats.codPending },
    { Metric: 'Active Milk Subscribers', Value: metrics.activeSubscribers },
    { Metric: 'Total Expenses', Value: metrics.expenses },
    { Metric: 'Net Profit', Value: metrics.netProfit }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & CHANNEL SWITCHER (The Core Innovation)                    */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Dairy Operations Dashboard
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                MilQuu 2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified control for Physical Shop Counter (POS/Khata/Finance) and Online Delivery Business (COD/Subs).
            </p>
          </div>

          {showBusiness && (
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {DATE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ExportButton 
                data={reportData} 
                filename="MilQuu_Operations_Summary" 
                title={`Operations Summary — ${dateRange}`} 
                className="!bg-slate-900 !text-white hover:!bg-slate-800 !text-xs !py-1.5 !px-3 rounded-xl" 
              />
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                title="Refresh"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          )}
        </div>

        {/* The 3-Way Channel Segmented Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-fit border border-slate-200/60 overflow-x-auto">
          <button
            onClick={() => setActiveChannel('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeChannel === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers size={14} />
            <span>⚡ Combined Business (पूरा हिसाब)</span>
          </button>

          <button
            onClick={() => setActiveChannel('shop')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeChannel === 'shop'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Store size={14} />
            <span>🏪 Shop POS & Khata (काउंटर व उधारी)</span>
          </button>

          <button
            onClick={() => setActiveChannel('web')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeChannel === 'web'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Globe size={14} />
            <span>🌐 Website & Deliveries (ऑनलाइन व COD)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMBINED MASTER VIEW (When activeChannel === 'all')                     */}
      {/* ========================================================================= */}
      {activeChannel === 'all' && showBusiness && (
        <>
          {/* Top 4 Overall Financial Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Total Dairy Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <IndianRupee size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                ₹{(metrics.revenue || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Shop: ₹{(metrics.shopRevenue || 0).toLocaleString('en-IN')}</span> &bull; 
                <span>Web: ₹{(metrics.webRevenue || 0).toLocaleString('en-IN')}</span>
              </p>
            </div>

            {/* Net Profit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Net Business Profit</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <h3 className={`text-2xl font-black ${metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                ₹{(metrics.netProfit || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                After ₹{(metrics.expenses || 0).toLocaleString('en-IN')} operational expenses
              </p>
            </div>

            {/* Total Orders / Billed */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Total Orders Billed</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {(metrics.orders || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                POS: {shopStats.orderCount} bills &bull; Web: {webStats.orderCount} orders
              </p>
            </div>

            {/* Working Capital Buffer */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Working Capital Buffer</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
              </div>
              <h3 className={`text-2xl font-black ${shopStats.netWorkingBuffer >= 0 ? 'text-indigo-800' : 'text-rose-600'}`}>
                {shopStats.netWorkingBuffer >= 0 ? '+' : ''}₹{shopStats.netWorkingBuffer.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Customer Khata Due vs Financier Loan
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE 2 WINGS MERGED SIDE-BY-SIDE                                           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* WING 1: 🏪 PHYSICAL SHOP POS & KHATA */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Store size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      Shop POS & Local Khata <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">काउंटर</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">Retail counter, regular credit customers & financier loans</p>
                  </div>
                </div>
                <Link
                  to="/admin/pos"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <Store size={13} /> Open POS
                </Link>
              </div>

              {/* Shop 3-box Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Counter Sales</span>
                  <p className="text-lg font-black text-emerald-950 mt-1">
                    ₹{shopStats.revenue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">{shopStats.orderCount} retail slips</span>
                </div>

                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Customer Khata (उधारी)</span>
                  <p className="text-lg font-black text-amber-950 mt-1">
                    ₹{shopStats.customerCreditDue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-amber-700 font-medium">To collect from customers</span>
                </div>

                <div className="bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Financier Pending</span>
                  <p className="text-lg font-black text-indigo-950 mt-1">
                    ₹{shopStats.financierDue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-indigo-700 font-medium">Owed for milk bills</span>
                </div>
              </div>

              {/* Milk Margin & Spread Banner in Shop Wing */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Droplets size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-emerald-950">
                        Milk Spread: Buy ₹{shopStats.milkMargin?.buyRate || 52} &rarr; Sell ₹{shopStats.milkMargin?.sellRate || 64}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900 text-[10px] font-black">
                        +₹{shopStats.milkMargin?.marginPerLitre || 12}/L (+{shopStats.milkMargin?.marginPercent || 19}%)
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700">
                      {(shopStats.milkMargin?.totalLitres || 936.5).toLocaleString('en-IN')} L financed by Digamber Aher
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">Spread Profit</span>
                  <span className="text-sm font-black text-emerald-900">
                    +₹{(shopStats.milkMargin?.totalEarnedProfit || 11677).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Fast Action Links for Shop */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to="/admin/customers"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Users size={13} className="text-amber-600" /> Collect Customer Khata &rarr;
                </Link>
                <Link
                  to="/admin/financiers"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Landmark size={13} className="text-indigo-600" /> Financier Passbook &rarr;
                </Link>
                <Link
                  to="/admin/procurement"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Droplets size={13} className="text-blue-600" /> Milk Inflow &rarr;
                </Link>
              </div>
            </div>

            {/* WING 2: 🌐 ONLINE WEBSITE & DELIVERIES */}
            <div className="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      Website & Home Delivery <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold">ऑनलाइन</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">Online store, Cash on Delivery (COD) & daily subscriptions</p>
                  </div>
                </div>
                <Link
                  to="/admin/orders"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <ShoppingBag size={13} /> View Orders
                </Link>
              </div>

              {/* Web 3-box Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Website Revenue</span>
                  <p className="text-lg font-black text-blue-950 mt-1">
                    ₹{webStats.revenue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-blue-700 font-medium">{webStats.orderCount} online orders</span>
                </div>

                <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">COD Cash with Riders</span>
                  <p className="text-lg font-black text-emerald-950 mt-1">
                    ₹{webStats.codPending.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">Cash to be deposited</span>
                </div>

                <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Daily Subscribers</span>
                  <p className="text-lg font-black text-purple-950 mt-1">
                    {metrics.activeSubscribers} Active
                  </p>
                  <span className="text-[10px] text-purple-700 font-medium">Doorstep milk deliveries</span>
                </div>
              </div>

              {/* Fast Action Links for Web */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to="/admin/delivery-boys"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Bike size={13} className="text-blue-600" /> Delivery Boys & COD Deposit &rarr;
                </Link>
                <Link
                  to="/admin/subscriptions"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <CalendarDays size={13} className="text-purple-600" /> Subscriptions Plans &rarr;
                </Link>
                <Link
                  to="/admin/deliveries"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Truck size={13} className="text-emerald-600" /> Live Tracking &rarr;
                </Link>
              </div>
            </div>

          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. SHOP POS DEEP-DIVE VIEW (When activeChannel === 'shop')                 */}
      {/* ========================================================================= */}
      {activeChannel === 'shop' && showBusiness && (
        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Physical Counter Management
                </span>
                <h2 className="text-2xl font-black mt-0.5">Shop POS, Khata & Financier Desk</h2>
                <p className="text-xs text-emerald-200 mt-1 max-w-xl">
                  Manage over-the-counter sales, customer credit khatas (उधारी), and investor financing for milk vendor dues.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/pos"
                  className="px-4 py-2 bg-white text-emerald-900 font-bold rounded-xl text-xs shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                >
                  <Store size={15} /> New Counter Bill
                </Link>
                <Link
                  to="/admin/financiers"
                  className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs border border-emerald-700 hover:bg-emerald-750 transition-colors flex items-center gap-1.5"
                >
                  <Landmark size={15} /> Financier Khata
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-800/80">
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800">
                <span className="text-[11px] text-emerald-300 font-semibold">Today's Counter Billed</span>
                <p className="text-2xl font-black mt-1">₹{shopStats.revenue.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-emerald-400">{shopStats.orderCount} retail sales</span>
              </div>
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800">
                <span className="text-[11px] text-amber-300 font-semibold">Customer Khata Due (उधारी)</span>
                <p className="text-2xl font-black text-amber-300 mt-1">₹{shopStats.customerCreditDue.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-amber-200">Pending from regular customers</span>
              </div>
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800">
                <span className="text-[11px] text-indigo-300 font-semibold">Financier Pending Debt</span>
                <p className="text-2xl font-black text-indigo-200 mt-1">₹{shopStats.financierDue.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-indigo-300">Owed to financier</span>
              </div>
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800">
                <span className="text-[11px] text-emerald-300 font-semibold">Working Capital Gap</span>
                <p className={`text-2xl font-black mt-1 ${shopStats.netWorkingBuffer >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {shopStats.netWorkingBuffer >= 0 ? '+' : ''}₹{shopStats.netWorkingBuffer.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-emerald-300">Net after khata collections</span>
              </div>
            </div>
          </div>

          {/* Dedicated Milk Procurement & Profit Margin Card in Shop Deep Dive */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Droplets size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    Milk Procurement & Spread Profit <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">दूध नफा व मार्जिन</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Procured/Financed at ₹{shopStats.milkMargin?.buyRate || 52}/L &bull; Sold at ₹{shopStats.milkMargin?.sellRate || 64}/L counter & delivery price
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-bold w-fit">
                <span className="text-slate-600 px-2 py-1">Buy: ₹{shopStats.milkMargin?.buyRate || 52}/L</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="text-slate-900 px-2 py-1">Sell: ₹{shopStats.milkMargin?.sellRate || 64}/L</span>
                <span className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-black">
                  Profit: +₹{shopStats.milkMargin?.marginPerLitre || 12}/L (+{shopStats.milkMargin?.marginPercent || 19}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Litres</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {(shopStats.milkMargin?.totalLitres || 936.5).toLocaleString('en-IN')} L
                </p>
                <span className="text-[10px] text-slate-400">Total volume funded</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Financier Cost</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  ₹{(shopStats.milkMargin?.totalProcurementCost || 48259).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-400">Paid to milk vendor</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Retail Revenue</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  ₹{(shopStats.milkMargin?.projectedSalesRevenue || 59936).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-400">At ₹64/L retail price</span>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Spread Profit</span>
                <p className="text-xl font-black text-emerald-700 mt-0.5">
                  +₹{(shopStats.milkMargin?.totalEarnedProfit || 11677).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" /> ₹12/L pure earning
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WEBSITE & COD DEEP-DIVE VIEW (When activeChannel === 'web')             */}
      {/* ========================================================================= */}
      {activeChannel === 'web' && showBusiness && (
        <div className="space-y-6">
          <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  E-Commerce & Fleet Delivery
                </span>
                <h2 className="text-2xl font-black mt-0.5">Online Website, COD & Subscriptions</h2>
                <p className="text-xs text-blue-200 mt-1 max-w-xl">
                  Track website cart orders, Cash on Delivery (COD) reconciliations with delivery boys, and daily morning doorstep milk subscriptions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/orders"
                  className="px-4 py-2 bg-white text-blue-900 font-bold rounded-xl text-xs shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag size={15} /> All Web Orders
                </Link>
                <Link
                  to="/admin/delivery-boys"
                  className="px-4 py-2 bg-blue-800 text-white font-bold rounded-xl text-xs border border-blue-700 hover:bg-blue-750 transition-colors flex items-center gap-1.5"
                >
                  <Bike size={15} /> Delivery Fleet
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-800/80">
              <div className="bg-blue-950/40 p-3.5 rounded-2xl border border-blue-800">
                <span className="text-[11px] text-blue-300 font-semibold">Web Orders Revenue</span>
                <p className="text-2xl font-black mt-1">₹{webStats.revenue.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-blue-400">{webStats.orderCount} orders placed</span>
              </div>
              <div className="bg-blue-950/40 p-3.5 rounded-2xl border border-blue-800">
                <span className="text-[11px] text-emerald-300 font-semibold">COD Pending with Riders</span>
                <p className="text-2xl font-black text-emerald-300 mt-1">₹{webStats.codPending.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-emerald-200">Cash awaiting deposit</span>
              </div>
              <div className="bg-blue-950/40 p-3.5 rounded-2xl border border-blue-800">
                <span className="text-[11px] text-purple-300 font-semibold">Active Subscribers</span>
                <p className="text-2xl font-black text-purple-200 mt-1">{metrics.activeSubscribers}</p>
                <span className="text-[10px] text-purple-300">Daily milk plans</span>
              </div>
              <div className="bg-blue-950/40 p-3.5 rounded-2xl border border-blue-800">
                <span className="text-[11px] text-yellow-300 font-semibold">Pending Deliveries</span>
                <p className="text-2xl font-black text-yellow-300 mt-1">{webStats.pendingDeliveries}</p>
                <span className="text-[10px] text-yellow-200">Bottles out for delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TODAY'S DISPATCH & ROUNDS PANEL                                        */}
      {/* ========================================================================= */}
      <TodayPanel role={role} />

      {/* ========================================================================= */}
      {/* 6. CHARTS & PERFORMANCE TRAJECTORY                                        */}
      {/* ========================================================================= */}
      {showBusiness && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Profit Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revenue & Profit Trajectory</h3>
                <p className="text-xs text-slate-400">Comparing gross revenue with net profitability</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Revenue
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Profit
                </span>
              </div>
            </div>

            <div className="h-[260px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics.revenueData || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevSimp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevSimp)" />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Dairy Products */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top Selling Products</h3>
                <p className="text-xs text-slate-400">Most ordered fresh milk & dairy items</p>
              </div>
              <Link to="/admin/products" className="text-xs font-bold text-emerald-700 hover:underline">
                All Products &rarr;
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
                      {item.volume} units
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No product sales data recorded yet.
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
