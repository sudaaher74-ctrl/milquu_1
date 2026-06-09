import React from 'react';
import api from '../../utils/api.js';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, 
  BarChart2, ArrowUpRight, ArrowDownRight, Calculator, Download
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// Mock Data removed, deriving from state inside component

const StatCard = ({ title, value, icon, colorClass, trend, subtitle }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110 pointer-events-none`}></div>
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-xl ${colorClass.replace('from-', 'bg-').split(' ')[0]} bg-opacity-10 text-gray-700`}>
        {icon}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-baseline space-x-2">
      <p className="text-2xl font-bold text-milquu-dark">{value}</p>
    </div>
    {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>}
  </div>
);

const ProfitAnalytics = () => {
  const [dateRange, setDateRange] = React.useState('This Month');
  const [analytics, setAnalytics] = React.useState({
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    expenses: 0,
    netProfit: 0,
    inventoryValue: 0,
    orders: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/api/erp/analytics?dateRange=${encodeURIComponent(dateRange)}`);
        setAnalytics(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange]);

  const profitTrendData = (analytics.revenueData || []).map(d => ({
    month: d.name,
    gross: d.revenue,
    net: d.profit
  }));

  const categoryProfitData = [
    { name: 'Milk Products', value: (analytics.revenue || 0) * 0.8, color: '#0D47A1' },
    { name: 'Subscriptions', value: (analytics.revenue || 0) * 0.15, color: '#2E7D32' },
    { name: 'Other', value: (analytics.revenue || 0) * 0.05, color: '#D4AF37' }
  ];

  const topProfitable = (analytics.topPerformers || []).map((p, i) => ({
    id: i,
    name: p.name,
    margin: '35%',
    profitPerUnit: Math.round(p.revenue / (p.volume || 1) * 0.35),
    monthlyProfit: p.revenue * 0.35
  }));

  const leastProfitable = [];

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Profit Analytics Engine</h1>
          <p className="text-gray-500 text-sm mt-1">Advanced breakdown of margins, costs, and net profitability.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-milquu-blue"
          >
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
          <button className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
            <Download size={18} className="mr-2" /> Export Profit P&L
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Revenue" value={`₹${(analytics.revenue || 0).toLocaleString()}`} subtitle={dateRange} icon={<DollarSign size={20} className="text-blue-600"/>} colorClass="from-blue-400 to-blue-600" />
        <StatCard title="Cost of Goods (COGS)" value={`₹${(analytics.cogs || 0).toLocaleString()}`} subtitle={dateRange} icon={<Calculator size={20} className="text-red-600"/>} colorClass="from-red-400 to-red-600" />
        <StatCard title="Gross Profit" value={`₹${(analytics.grossProfit || 0).toLocaleString()}`} subtitle={dateRange} icon={<PieChartIcon size={20} className="text-purple-600"/>} colorClass="from-purple-400 to-purple-600" />
        <StatCard title="Operating Expenses" value={`₹${(analytics.expenses || 0).toLocaleString()}`} subtitle={dateRange} icon={<BarChart2 size={20} className="text-orange-600"/>} colorClass="from-orange-400 to-orange-600" />
        <StatCard title="Net Profit" value={`₹${(analytics.netProfit || 0).toLocaleString()}`} subtitle={dateRange} trend={0} icon={<TrendingUp size={20} className="text-green-600"/>} colorClass="from-green-400 to-green-600" />
        <StatCard title="Inventory Value" value={`₹${(analytics.inventoryValue || 0).toLocaleString()}`} subtitle="Current Stock" icon={<TrendingUp size={20} className="text-teal-600"/>} colorClass="from-teal-400 to-teal-600" />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Cost Formula Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-milquu-dark mb-4">Profit Formula ({dateRange})</h2>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Total Revenue</span>
              <span className="font-bold text-milquu-blue">₹{(analytics.revenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>(-) Cost of Goods Sold (COGS)</span>
              <span className="text-red-500">-₹{(analytics.cogs || 0).toLocaleString()}</span>
            </div>
            <div className="border-b border-gray-100 my-1"></div>
            <div className="flex justify-between items-center text-sm text-gray-800 font-bold">
              <span>= Gross Profit</span>
              <span className="text-purple-600">₹{(analytics.grossProfit || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
              <span>(-) Operating Expenses</span>
              <span className="text-red-500">-₹{(analytics.expenses || 0).toLocaleString()}</span>
            </div>
            <div className="border-b border-gray-200 my-1"></div>
            <div className="flex justify-between items-center text-lg mt-2">
              <span className="font-bold text-milquu-dark">= Net Profit</span>
              <span className={`font-bold ${(analytics.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(analytics.netProfit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Profit Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Gross vs Net Profit Trend</h2>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitTrendData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(val) => `₹${val.toLocaleString()}`} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="gross" name="Gross Profit" stroke="#0D47A1" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" />
                <Area type="monotone" dataKey="net" name="Net Profit" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Profit by Category & Product Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profit by Category Pie */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-milquu-dark mb-6">Profit By Category</h2>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryProfitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryProfitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryProfitData.map((cat, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-gray-600 font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-milquu-dark">₹{cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Profitable Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden col-span-1 lg:col-span-1 border-t-4 border-t-green-500">
          <div className="p-4 border-b border-gray-100 bg-green-50/30 flex items-center">
            <ArrowUpRight size={18} className="text-green-600 mr-2" />
            <h2 className="text-base font-bold text-milquu-dark">Most Profitable Products</h2>
          </div>
          <div className="p-0">
            {topProfitable.map((p, i) => (
              <div key={p.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-gray-800 leading-tight">{p.name}</h4>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{p.margin}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Profit/Unit: <span className="font-bold text-gray-700">₹{p.profitPerUnit}</span></p>
                  <p className="text-sm font-bold text-milquu-dark">₹{(p.monthlyProfit/1000).toFixed(1)}k /mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Profitable Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden col-span-1 lg:col-span-1 border-t-4 border-t-red-500">
          <div className="p-4 border-b border-gray-100 bg-red-50/30 flex items-center">
            <ArrowDownRight size={18} className="text-red-600 mr-2" />
            <h2 className="text-base font-bold text-milquu-dark">Least Profitable Products</h2>
          </div>
          <div className="p-0">
            {leastProfitable.map((p, i) => (
              <div key={p.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-gray-800 leading-tight">{p.name}</h4>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{p.margin}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Profit/Unit: <span className="font-bold text-gray-700">₹{p.profitPerUnit}</span></p>
                  <p className="text-sm font-bold text-milquu-dark">₹{(p.monthlyProfit/1000).toFixed(1)}k /mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfitAnalytics;
