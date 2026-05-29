import React from 'react';
import { Download, TrendingUp, TrendingDown, IndianRupee, CreditCard, Wallet, Calendar } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000 },
  { month: 'Feb', revenue: 52000, expenses: 31000, profit: 21000 },
  { month: 'Mar', revenue: 48000, expenses: 29000, profit: 19000 },
  { month: 'Apr', revenue: 61000, expenses: 34000, profit: 27000 },
  { month: 'May', revenue: 65000, expenses: 35000, profit: 30000 },
  { month: 'Jun', revenue: 78000, expenses: 40000, profit: 38000 },
];

const productPerformanceData = [
  { name: 'Cow Milk', sales: 4500, target: 4000 },
  { name: 'Buffalo Milk', sales: 3200, target: 3500 },
  { name: 'Paneer', sales: 2100, target: 1500 },
  { name: 'Ghee', sales: 1800, target: 1200 },
  { name: 'Dahi', sales: 2400, target: 2000 },
];

const StatCard = ({ title, value, icon, trend, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110 pointer-events-none`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass.replace('from-', 'bg-').split(' ')[0]} bg-opacity-10 text-gray-700`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-milquu-dark">{value}</p>
  </div>
);

const Revenue = () => {
  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Revenue Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Deep dive into financial performance, product sales, and growth trends.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Calendar size={16} className="mr-2" /> This Year (2026)
          </button>
          <button className="bg-milquu-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/20 flex items-center">
            <Download size={16} className="mr-2" /> Generate Report
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Revenue (YTD)" value="₹3,49,000" trend={18.2} icon={<IndianRupee size={24} className="text-blue-600"/>} colorClass="from-blue-400 to-blue-600" />
        <StatCard title="Net Profit Margin" value="48.7%" trend={4.1} icon={<Wallet size={24} className="text-green-600"/>} colorClass="from-green-400 to-green-600" />
        <StatCard title="Avg Order Value" value="₹415" trend={-1.2} icon={<CreditCard size={24} className="text-purple-600"/>} colorClass="from-purple-400 to-purple-600" />
        <StatCard title="Monthly Recurring Rev" value="₹1.2L" trend={12.5} icon={<IndianRupee size={24} className="text-orange-600"/>} colorClass="from-orange-400 to-orange-600" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* P&L Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Profit & Loss Trend</h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#0D47A1" strokeWidth={2} fillOpacity={0} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products - Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-milquu-dark mb-2">Product Performance</h2>
          <p className="text-sm text-gray-500 mb-6">Sales vs Target (Current Month)</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformanceData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} width={80} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="target" name="Target" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="sales" name="Actual Sales" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Revenue;
