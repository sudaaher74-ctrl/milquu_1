import React, { useState } from 'react';
import api from '../../utils/api.js';
import { 
  Download, TrendingUp, TrendingDown, IndianRupee, Globe, Store, 
  CalendarDays, Calendar, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import ExportButton from '../../components/admin/ExportButton';

// Mock Data
const monthlyRevenueData = [];

const sourceData = [];

const StatCard = ({ title, value, icon, trend, colorClass, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-110 pointer-events-none`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass.replace('from-', 'bg-').split(' ')[0]} bg-opacity-10 text-gray-700`}>
        {icon}
      </div>
      {trend > 0 && (
        <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline space-x-2">
      <p className="text-3xl font-bold text-milquu-dark">{value}</p>
      {subtitle && <span className="text-xs text-gray-400 font-medium">{subtitle}</span>}
    </div>
  </motion.div>
);

// Initial state variables and components stay the same up to Revenue component

const Revenue = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [stats, setStats] = useState({
    revenueToday: 0,
    revenueYesterday: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0
  });

  const fetchRevenueData = async () => {
    try {
      const { data } = await api.get(`/api/admin/revenue-analytics?year=${selectedYear}`);
      if (data) {
        setMonthlyRevenueData(data.monthlyRevenueData || []);
        setSourceData(data.sourceData || []);
        setStats(data.stats || {
          revenueToday: 0, revenueYesterday: 0, revenueThisMonth: 0, revenueThisYear: 0
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  React.useEffect(() => {
    fetchRevenueData();
  }, [selectedYear]);

  const exportData = monthlyRevenueData.map(d => ({
    'Month': d.month,
    'Web Sales': d.web,
    'Shop POS': d.shop,
    'Subscriptions': d.sub,
    'Total Revenue': d.web + d.shop + d.sub
  }));

  const trendToday = stats.revenueYesterday > 0 
    ? Math.round(((stats.revenueToday - stats.revenueYesterday) / stats.revenueYesterday) * 100) 
    : 100;

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Business Revenue Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Deep dive into revenue streams, channel performance, and sales growth.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-600 pl-9 pr-8 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm outline-none focus:border-milquu-gold"
            >
              <option value="2026">This Year (2026)</option>
              <option value="2025">Last Year (2025)</option>
              <option value="2024">2024</option>
            </select>
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <ExportButton data={exportData} filename={`Revenue_Export_${selectedYear}`} title={`Revenue Report - ${selectedYear}`} className="!bg-milquu-dark !text-white hover:!bg-gray-800" />
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard title="Revenue Today" value={`₹${stats.revenueToday.toLocaleString()}`} subtitle={`vs ₹${stats.revenueYesterday.toLocaleString()} yesterday`} trend={trendToday} icon={<IndianRupee size={24} className="text-blue-600"/>} colorClass="from-blue-400 to-blue-600" />
        <StatCard title="Revenue This Month" value={`₹${stats.revenueThisMonth.toLocaleString()}`} subtitle="Current Month" trend={0} icon={<TrendingUp size={24} className="text-green-600"/>} colorClass="from-green-400 to-green-600" />
        <StatCard title="Revenue This Year" value={`₹${stats.revenueThisYear.toLocaleString()}`} subtitle="YTD" trend={0} icon={<CalendarDays size={24} className="text-purple-600"/>} colorClass="from-purple-400 to-purple-600" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Revenue Trend (Overall)</h2>
          </div>
          <div className="flex-1 min-h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  formatter={(value) => `₹${value.toLocaleString()}`} 
                />
                <Area 
                  type="monotone" 
                  dataKey={(d) => d.web + d.shop + d.sub} 
                  name="Total Revenue" 
                  stroke="#0D47A1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Sources Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-milquu-dark mb-2 flex items-center">
            <PieChartIcon size={18} className="mr-2 text-milquu-blue" /> Revenue Sources
          </h2>
          <p className="text-sm text-gray-500 mb-6">Current Month Breakdown</p>
          <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm">No data for this month</div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-milquu-dark">₹{stats.revenueThisMonth.toLocaleString()}</span>
              <span className="text-xs text-gray-500 uppercase font-semibold">Total</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#2E7D32] mr-2"></div>
                <span className="text-gray-600 font-medium">Subscriptions</span>
              </div>
              <span className="font-bold text-milquu-dark">₹{(sourceData.find(s=>s.name==='Subscriptions')?.value || 0).toLocaleString()} ({stats.revenueThisMonth ? Math.round((sourceData.find(s=>s.name==='Subscriptions')?.value || 0) / stats.revenueThisMonth * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#0D47A1] mr-2"></div>
                <span className="text-gray-600 font-medium">Website Sales</span>
              </div>
              <span className="font-bold text-milquu-dark">₹{(sourceData.find(s=>s.name==='Website Sales')?.value || 0).toLocaleString()} ({stats.revenueThisMonth ? Math.round((sourceData.find(s=>s.name==='Website Sales')?.value || 0) / stats.revenueThisMonth * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#D4AF37] mr-2"></div>
                <span className="text-gray-600 font-medium">Shop POS</span>
              </div>
              <span className="font-bold text-milquu-dark">₹{(sourceData.find(s=>s.name==='Shop POS')?.value || 0).toLocaleString()} ({stats.revenueThisMonth ? Math.round((sourceData.find(s=>s.name==='Shop POS')?.value || 0) / stats.revenueThisMonth * 100) : 0}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Revenue Comparison Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-milquu-dark">Revenue Channel Comparison</h2>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                formatter={(value) => `₹${value.toLocaleString()}`} 
                cursor={{fill: '#F3F4F6'}}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="sub" name="Subscriptions" stackId="a" fill="#2E7D32" radius={[0, 0, 0, 0]} barSize={30} />
              <Bar dataKey="web" name="Website" stackId="a" fill="#0D47A1" radius={[0, 0, 0, 0]} barSize={30} />
              <Bar dataKey="shop" name="Shop POS" stackId="a" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Revenue;
