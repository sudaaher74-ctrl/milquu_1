import React, { useState } from 'react';
import api from '../../utils/api.js';
import { motion } from 'framer-motion';
import { 
  IndianRupee, TrendingUp, TrendingDown, Package, Users, 
  CalendarDays, ShoppingBag, Truck, Store, Globe, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import ExportButton from '../../components/admin/ExportButton';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ComposedChart
} from 'recharts';

// Mock Data removed, now fetched from API

const StatCard = ({ title, value, icon, trend, colorClass, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/60 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110 pointer-events-none`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass.replace('from-', 'bg-').split(' ')[0]} bg-opacity-10 text-gray-700`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline space-x-2">
      <p className="text-2xl font-bold text-milquu-dark">{value}</p>
      {subtitle && <span className="text-xs text-gray-400 font-medium">{subtitle}</span>}
    </div>
  </motion.div>
);

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    expenses: 0,
    netProfit: 0,
    inventoryValue: 0,
    orders: 0,
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

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/erp/analytics');
        setMetrics(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time command center for your entire dairy business.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Last 7 Days
          </button>
          <ExportButton data={reportData} filename="Executive_Overview" title="Executive Overview Report" className="!bg-milquu-dark !text-white hover:!bg-gray-800" />
        </div>
      </div>
      
      {/* TOP KPI SECTION */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Primary Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Revenue" value={`₹${metrics.revenue.toLocaleString()}`} icon={<IndianRupee size={22} className="text-blue-600" />} colorClass="from-blue-400 to-blue-600" />
          <StatCard title="Net Profit" value={`₹${metrics.netProfit.toLocaleString()}`} icon={<TrendingUp size={22} className="text-green-600" />} colorClass="from-green-400 to-green-600" />
          <StatCard title="Total Orders" value={metrics.orders || 0} icon={<ShoppingBag size={22} className="text-purple-600" />} colorClass="from-purple-400 to-purple-600" />
          <StatCard title="Active Subscribers" value={metrics.activeSubscribers || 0} icon={<CalendarDays size={22} className="text-orange-600" />} colorClass="from-orange-400 to-orange-600" />
          <StatCard title="Inventory Value" value={`₹${(metrics.inventoryValue || 0).toLocaleString()}`} icon={<Package size={22} className="text-teal-600" />} colorClass="from-teal-400 to-teal-600" />
        </div>
      </div>

      {/* SECOND KPI SECTION */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Secondary Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Website Revenue" value={`₹${(metrics.webRevenue || 0).toLocaleString()}`} subtitle="Filtered" icon={<Globe size={22} className="text-indigo-600" />} colorClass="from-indigo-400 to-indigo-600" />
          <StatCard title="Shop POS Revenue" value={`₹${(metrics.shopRevenue || 0).toLocaleString()}`} subtitle="Filtered" icon={<Store size={22} className="text-rose-600" />} colorClass="from-rose-400 to-rose-600" />
          <StatCard title="Total Expenses" value={`₹${(metrics.expenses || 0).toLocaleString()}`} icon={<TrendingDown size={22} className="text-red-500" />} colorClass="from-red-300 to-red-500" />
          <StatCard title="Cost of Goods (COGS)" value={`₹${(metrics.cogs || 0).toLocaleString()}`} icon={<Package size={22} className="text-green-500" />} colorClass="from-green-300 to-green-500" />
          <StatCard title="Pending Deliveries" value={metrics.operationsLive?.pendingDeliveries || 0} icon={<Truck size={22} className="text-yellow-600" />} colorClass="from-yellow-400 to-yellow-600" />
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue & Profit Trend */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-white/60">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Revenue & Profit Trend</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.revenueData || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0D47A1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#2E7D32" strokeWidth={3} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-white/60">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Growth & Acquisition</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.customerData || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="customers" name="Total Customers" fill="#0D47A1" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="subs" name="Active Subscribers" fill="#2E7D32" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SMART BUSINESS WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling & Profitable */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-white/60 p-6">
          <h2 className="text-lg font-bold text-milquu-dark mb-4">Top Performers</h2>
          <div className="space-y-4">
            {metrics.topPerformers?.length > 0 ? metrics.topPerformers.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Top Seller</p>
                </div>
                <p className="text-sm font-bold text-milquu-blue">{item.volume} Sold</p>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No top performers data available yet.</p>
            )}
          </div>
        </div>

        {/* Alerts & Low Stock */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-white/60 p-6">
          <h2 className="text-lg font-bold text-milquu-dark mb-4 flex items-center">
            <AlertTriangle size={18} className="text-orange-500 mr-2" /> Action Required
          </h2>
          <div className="space-y-3">
            {metrics.actionRequired?.length > 0 ? metrics.actionRequired.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border border-red-100 bg-red-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-800">{item.name}</p>
                    <p className="text-xs text-red-600">Low Stock</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-red-600">Only {item.stock} left</p>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No immediate actions required.</p>
            )}
          </div>
        </div>

        {/* Delivery & Operations */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-white/60 p-6">
          <h2 className="text-lg font-bold text-milquu-dark mb-4">Operations Live</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <p className="text-sm font-bold text-gray-700">Delivery Status</p>
                <p className="text-xs font-bold text-milquu-blue">{metrics.operationsLive?.completedDeliveries || 0} / {metrics.operationsLive?.totalDeliveries || 0} Delivered</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-milquu-blue h-2 rounded-full" style={{ width: `${metrics.operationsLive?.totalDeliveries > 0 ? (metrics.operationsLive?.completedDeliveries / metrics.operationsLive?.totalDeliveries) * 100 : 0}%` }}></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold uppercase text-gray-400 mb-3">Recent Expenses</p>
              {metrics.operationsLive?.recentExpenses?.length > 0 ? metrics.operationsLive.recentExpenses.map((exp, idx) => (
                <div key={idx} className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-700">{exp.category}</p>
                  <p className="text-sm font-bold text-red-500">-₹{exp.amount}</p>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No recent expenses.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Overview;
