import React from 'react';
import api from '../../utils/api.js';
import ExportButton from '../../components/admin/ExportButton';
import { motion } from 'framer-motion';
import { 
  Briefcase, IndianRupee, TrendingUp, Package, Globe, Store, 
  Users, CalendarDays, ShoppingBag, Download, ArrowUpRight, ArrowDownRight, PackageX, Truck, Receipt
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ComposedChart
} from 'recharts';

// Mock data removed

const StatCard = ({ title, value, icon, subtitle, colorClass, borderClass }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border ${borderClass || 'border-gray-100'} flex flex-col relative overflow-hidden group`}>
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-gray-700`}>
        {icon}
      </div>
    </div>
    <div className="flex items-baseline space-x-2">
      <p className="text-2xl font-bold text-milquu-dark">{value}</p>
    </div>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const BusinessOverview = () => {
  const [analytics, setAnalytics] = React.useState({
    revenue: 0,
    expenses: 0,
    purchases: 0,
    netProfit: 0,
    orders: 0
  });

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/erp/analytics');
        setAnalytics(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      }
    };
    fetchAnalytics();
  }, []);

  const trendData = (analytics.revenueData || []).map(d => ({
    name: d.name,
    revenue: d.revenue,
    profit: d.profit,
    sales: Math.round(d.revenue / 70) // Mock sales volume
  }));

  const exportData = [
    { Metric: 'Revenue Today', Value: analytics.revenue || 0 },
    { Metric: 'Profit Today', Value: analytics.netProfit || 0 },
    { Metric: 'Inventory Value', Value: analytics.purchases || 0 },
    { Metric: 'Active Customers', Value: analytics.customerData?.length ? analytics.customerData[analytics.customerData.length-1].customers : 0 },
    { Metric: 'Pending Deliveries', Value: analytics.operationsLive?.pendingDeliveries || 0 }
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">CEO Business Overview</h1>
          <p className="text-gray-500 text-sm mt-1">High-level financial and operational summary.</p>
        </div>
        <ExportButton 
          data={exportData} 
          filename="CEO_Executive_Report" 
          title="Executive Business Overview" 
          label="Download Executive Report"
          className="!bg-milquu-dark !text-white hover:!bg-gray-800 !px-5 !py-2.5 !rounded-lg !text-sm !font-medium !shadow-md !flex !items-center !border-0" 
        />
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Revenue Today" value={`₹${(analytics.revenue || 0).toLocaleString()}`} icon={<IndianRupee size={18} className="text-blue-600"/>} colorClass="bg-blue-100" />
        <StatCard title="Revenue This Month" value={`₹${(analytics.revenue || 0).toLocaleString()}`} icon={<IndianRupee size={18} className="text-blue-600"/>} colorClass="bg-blue-100" />
        <StatCard title="Profit Today" value={`₹${(analytics.netProfit || 0).toLocaleString()}`} icon={<TrendingUp size={18} className="text-green-600"/>} colorClass="bg-green-100" />
        <StatCard title="Profit This Month" value={`₹${(analytics.netProfit || 0).toLocaleString()}`} icon={<TrendingUp size={18} className="text-green-600"/>} colorClass="bg-green-100" />
        <StatCard title="Inventory Value" value={`₹${(analytics.purchases || 0).toLocaleString()}`} icon={<Package size={18} className="text-purple-600"/>} colorClass="bg-purple-100" />
        
        <StatCard title="Shop Revenue" value="₹0" subtitle="This Month" icon={<Store size={18} className="text-orange-600"/>} colorClass="bg-orange-100" />
        <StatCard title="Website Revenue" value={`₹${(analytics.revenue || 0).toLocaleString()}`} subtitle="This Month" icon={<Globe size={18} className="text-indigo-600"/>} colorClass="bg-indigo-100" />
        <StatCard title="Active Customers" value={analytics.customerData?.length ? analytics.customerData[analytics.customerData.length-1].customers : 0} icon={<Users size={18} className="text-teal-600"/>} colorClass="bg-teal-100" />
        <StatCard title="Active Subscribers" value={analytics.customerData?.length ? analytics.customerData[analytics.customerData.length-1].subs : 0} icon={<CalendarDays size={18} className="text-rose-600"/>} colorClass="bg-rose-100" />
        <StatCard title="Pending Orders" value={analytics.operationsLive?.pendingDeliveries || 0} icon={<ShoppingBag size={18} className="text-red-600"/>} colorClass="bg-red-100" borderClass="border-red-100 bg-red-50/30" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue & Profit Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Financial Performance (MTD)</h2>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-milquu-blue text-gray-600">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(val) => `₹${val.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" name="Revenue Trend" stroke="#0D47A1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Line type="monotone" dataKey="profit" name="Profit Trend" stroke="#2E7D32" strokeWidth={3} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Volume Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Sales Trend (Volume)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="sales" name="Items Sold" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* WIDGETS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Top Products */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center"><TrendingUp size={16} className="text-green-600 mr-2"/> Top Products</h3>
          <div className="space-y-3">
            {(analytics.topPerformers || []).length > 0 ? (
              (analytics.topPerformers || []).map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">{p.name || 'Unknown'}</span>
                  <span className="font-bold text-milquu-dark">₹{p.revenue?.toLocaleString() || 0}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 bg-orange-50/20">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center"><PackageX size={16} className="text-orange-600 mr-2"/> Low Stock Alerts</h3>
          <div className="space-y-3">
            {(analytics.actionRequired || []).length > 0 ? (
              (analytics.actionRequired || []).map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">{p.name}</span>
                  <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">{p.stock} left</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">Stock levels healthy</div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center"><Receipt size={16} className="text-red-500 mr-2"/> Recent Expenses</h3>
          <div className="space-y-3">
            {(analytics.operationsLive?.recentExpenses || []).length > 0 ? (
              (analytics.operationsLive?.recentExpenses || []).map((e, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium capitalize">{e.category || 'Expense'}</span>
                  <span className="font-bold text-milquu-dark">₹{e.amount?.toLocaleString() || 0}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">No recent expenses</div>
            )}
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 bg-blue-50/20">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center"><Truck size={16} className="text-blue-600 mr-2"/> Pending Deliveries</h3>
          <div className="flex flex-col items-center justify-center h-full pb-4">
            <span className="text-4xl font-bold text-milquu-blue mb-1">{analytics.operationsLive?.pendingDeliveries || 0}</span>
            <span className="text-sm text-gray-500">Orders waiting to be dispatched</span>
            <button className="mt-4 text-xs font-bold text-white bg-milquu-blue px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors w-full">
              View Dispatch Board
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BusinessOverview;
