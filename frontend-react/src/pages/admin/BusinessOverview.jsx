import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, IndianRupee, TrendingUp, Package, Globe, Store, 
  Users, CalendarDays, ShoppingBag, Download, ArrowUpRight, ArrowDownRight, PackageX, Truck, Receipt
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ComposedChart
} from 'recharts';

// Mock Data
const trendData = [];

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
  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">CEO Business Overview</h1>
          <p className="text-gray-500 text-sm mt-1">High-level financial and operational summary.</p>
        </div>
        <button className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
          <Download size={18} className="mr-2" /> Download Executive Report
        </button>
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Revenue Today" value="₹0" icon={<IndianRupee size={18} className="text-blue-600"/>} colorClass="bg-blue-100" />
        <StatCard title="Revenue This Month" value="₹0" icon={<IndianRupee size={18} className="text-blue-600"/>} colorClass="bg-blue-100" />
        <StatCard title="Profit Today" value="₹0" icon={<TrendingUp size={18} className="text-green-600"/>} colorClass="bg-green-100" />
        <StatCard title="Profit This Month" value="₹0" icon={<TrendingUp size={18} className="text-green-600"/>} colorClass="bg-green-100" />
        <StatCard title="Inventory Value" value="₹0" icon={<Package size={18} className="text-purple-600"/>} colorClass="bg-purple-100" />
        
        <StatCard title="Shop Revenue" value="₹0" subtitle="This Month" icon={<Store size={18} className="text-orange-600"/>} colorClass="bg-orange-100" />
        <StatCard title="Website Revenue" value="₹0" subtitle="This Month" icon={<Globe size={18} className="text-indigo-600"/>} colorClass="bg-indigo-100" />
        <StatCard title="Active Customers" value="0" icon={<Users size={18} className="text-teal-600"/>} colorClass="bg-teal-100" />
        <StatCard title="Active Subscribers" value="0" icon={<CalendarDays size={18} className="text-rose-600"/>} colorClass="bg-rose-100" />
        <StatCard title="Pending Orders" value="0" icon={<ShoppingBag size={18} className="text-red-600"/>} colorClass="bg-red-100" borderClass="border-red-100 bg-red-50/30" />
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
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 bg-orange-50/20">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center"><PackageX size={16} className="text-orange-600 mr-2"/> Low Stock Alerts</h3>
          <div className="space-y-3">
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center"><Receipt size={16} className="text-red-500 mr-2"/> Recent Expenses</h3>
          <div className="space-y-3">
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 bg-blue-50/20">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center"><Truck size={16} className="text-blue-600 mr-2"/> Pending Deliveries</h3>
          <div className="flex flex-col items-center justify-center h-full pb-4">
            <span className="text-4xl font-bold text-milquu-blue mb-1">0</span>
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
