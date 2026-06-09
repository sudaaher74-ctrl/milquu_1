import React, { useState } from 'react';
import api from '../../utils/api.js';
import { Users, UserPlus, UserCheck, Star, ArrowUpRight, ArrowDownRight, Download, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import ExportButton from '../../components/admin/ExportButton';

// Data is now fetched dynamically from API

const Customers = () => {
  const [topCustomers, setTopCustomers] = React.useState([]);
  const [growthData, setGrowthData] = React.useState([]);
  const [segmentData, setSegmentData] = React.useState([]);
  const [stats, setStats] = React.useState({
    totalCustomers: 0,
    newCustomers30d: 0,
    retentionRate: 0,
    avgLTV: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/api/admin/customers');
        const data = res.data;
        const mapped = data.topCustomers.map(c => ({
          id: c._id,
          name: c.name,
          joined: new Date(c.createdAt).toLocaleDateString(),
          orders: c.orders, 
          lifetimeValue: `₹${c.lifetimeValue}`,
          walletBalance: c.walletBalance || 0,
          status: c.status
        }));
        setTopCustomers(mapped);
        setGrowthData(data.growthData || []);
        setSegmentData(data.segmentData || []);
        if (data.stats) setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [walletForm, setWalletForm] = useState({ amount: '', type: 'credit', description: 'Manual Recharge' });

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/wallets/transaction', {
        userId: selectedCustomer.id,
        amount: walletForm.amount,
        type: walletForm.type,
        description: walletForm.description
      });
      // Refresh list
      const res = await api.get('/api/admin/customers');
      const mapped = res.data.topCustomers.map(c => ({
          id: c._id,
          name: c.name,
          joined: new Date(c.createdAt).toLocaleDateString(),
          orders: c.orders, 
          lifetimeValue: `₹${c.lifetimeValue}`,
          walletBalance: c.walletBalance || 0,
          status: c.status
      }));
      setTopCustomers(mapped);
      setWalletModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Transaction failed');
    }
  };

const StatCard = ({ title, value, icon, trend, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between relative overflow-hidden group">
    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-end space-x-2">
        <p className="text-2xl font-bold text-milquu-dark">{value}</p>
        <span className={`text-xs font-bold flex items-center mb-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {Math.abs(trend)}%
        </span>
      </div>
    </div>
    <div className={`p-4 rounded-xl ${colorClass.replace('from-', 'bg-').split(' ')[0]} bg-opacity-10 text-gray-700 relative z-10`}>
      {icon}
    </div>
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-5 rounded-full transition-transform duration-500 group-hover:scale-150`}></div>
  </div>
);

  const exportData = topCustomers.map(c => ({
    'Customer ID': c.id,
    'Name': c.name,
    'Joined Date': c.joined,
    'Total Orders': c.orders,
    'Lifetime Value': c.lifetimeValue,
    'Status': c.status
  }));

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Customer Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Analyze acquisition, retention, and customer lifetime value.</p>
        </div>
        <div className="flex space-x-3">
          <ExportButton data={exportData} filename="Customers_Export" title="Customer Insights Report" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Customers" value={stats.totalCustomers} trend={12.5} icon={<Users size={24} className="text-blue-600"/>} colorClass="from-blue-400 to-blue-600" />
        <StatCard title="New Customers (30d)" value={stats.newCustomers30d} trend={24.1} icon={<UserPlus size={24} className="text-green-600"/>} colorClass="from-green-400 to-green-600" />
        <StatCard title="Retention Rate" value={`${stats.retentionRate}%`} trend={1.2} icon={<UserCheck size={24} className="text-purple-600"/>} colorClass="from-purple-400 to-purple-600" />
        <StatCard title="Avg Lifetime Value" value={`₹${stats.avgLTV.toLocaleString()}`} trend={-2.4} icon={<Star size={24} className="text-orange-600"/>} colorClass="from-orange-400 to-orange-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Customer Acquisition & Growth</h2>
            <select className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-milquu-blue">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="returning" name="Returning" stroke="#0D47A1" strokeWidth={3} fillOpacity={1} fill="url(#colorReturning)" />
                <Area type="monotone" dataKey="new" name="New" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segmentation Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-milquu-dark mb-4">Customer Segmentation</h2>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {segmentData.map((segment, idx) => (
              <div key={idx} className="flex items-center text-xs">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></span>
                <span className="text-gray-600 font-medium">{segment.name}</span>
                <span className="ml-auto font-bold text-milquu-dark">{segment.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-milquu-dark">Top Customers (By LTV)</h2>
          <button className="flex items-center text-sm font-medium text-gray-500 hover:text-milquu-blue transition-colors">
            <Filter size={16} className="mr-1" /> Sort/Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold">Total Orders</th>
                <th className="px-6 py-4 font-semibold">Wallet</th>
                <th className="px-6 py-4 font-semibold">Lifetime Value</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-green-100 flex items-center justify-center text-milquu-dark font-bold text-xs mr-3">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-milquu-dark">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{customer.joined}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{customer.orders}</td>
                  <td className="px-6 py-4 text-sm font-bold text-milquu-blue">₹{customer.walletBalance}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{customer.lifetimeValue}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      customer.status === 'VIP' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      customer.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedCustomer(customer); setWalletModalOpen(true); }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-bold transition-colors"
                    >
                      Manage Wallet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet Management Modal */}
      {walletModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-milquu-dark mb-1">Manage Wallet</h2>
            <p className="text-sm text-gray-500 mb-6">Customer: <span className="font-bold">{selectedCustomer.name}</span> | Balance: <span className="font-bold text-milquu-blue">₹{selectedCustomer.walletBalance}</span></p>
            
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="type" checked={walletForm.type === 'credit'} onChange={() => setWalletForm({...walletForm, type: 'credit', description: 'Manual Recharge'})} className="text-milquu-blue" />
                    <span className="text-sm font-medium text-gray-700">Credit (Add)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="type" checked={walletForm.type === 'debit'} onChange={() => setWalletForm({...walletForm, type: 'debit', description: 'Manual Deduction'})} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Debit (Deduct)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input type="number" required min="1" value={walletForm.amount} onChange={e => setWalletForm({...walletForm, amount: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-milquu-blue text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Reason</label>
                <input type="text" required value={walletForm.description} onChange={e => setWalletForm({...walletForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-milquu-blue text-sm" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setWalletModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${walletForm.type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  Confirm {walletForm.type === 'credit' ? 'Recharge' : 'Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
