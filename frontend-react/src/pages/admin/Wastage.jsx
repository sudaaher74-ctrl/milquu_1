import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Plus, Search, Filter, Download, 
  TrendingDown, AlertOctagon, PackageX
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const wastageTrendData = [];

const Wastage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wastageData, setWastageData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWastages = async () => {
      try {
        const { data } = await axios.get('https://milquu-backend.onrender.com/api/erp/wastages');
        
        // Map backend fields to frontend expectations
        const mappedData = data.map(item => ({
          ...item,
          product: item.productName || item.product,
          qty: item.quantity || item.qty
        }));
        
        setWastageData(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wastages", error);
        setLoading(false);
      }
    };
    fetchWastages();
  }, []);

  const totalLoss = wastageData.reduce((acc, curr) => acc + (curr.lossValue || 0), 0);
  const wastagePercent = 0; // 1.2% of total production

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Wastage Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track product spoilage, damages, and total loss value.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download size={16} className="mr-2" /> Export Log
          </button>
          <button className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-md flex items-center">
            <Plus size={18} className="mr-2" /> Report Wastage
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between border-t-4 border-t-red-500">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Loss Value (MTD)</p>
            <h3 className="text-3xl font-bold text-red-600">₹0</h3>
            <p className="text-xs text-green-500 font-medium mt-1 flex items-center"><TrendingDown size={12} className="mr-1"/> 0% vs Last Month</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <Trash2 size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between border-t-4 border-t-orange-500">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Overall Wastage %</p>
            <h3 className="text-3xl font-bold text-orange-600">{wastagePercent}%</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Target: &lt; 1.5%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <AlertOctagon size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center justify-between border-t-4 border-t-purple-500">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Most Wasted Product</p>
            <h3 className="text-xl font-bold text-milquu-dark leading-tight mt-1">N/A</h3>
            <p className="text-xs text-red-500 font-medium mt-2">0 kg lost this month</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <PackageX size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Loss Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Loss Value Trend (YTD)</h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wastageTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} formatter={(val) => `₹${val.toLocaleString()}`} />
                <Bar dataKey="loss" name="Loss Value" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wastage Log Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-milquu-dark">Recent Wastage Log</h2>
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-milquu-blue transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4 text-right">Qty</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4 text-right">Loss Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wastageData.filter(w => w.product.toLowerCase().includes(searchTerm.toLowerCase())).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4 text-sm font-medium text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-800">{entry.product}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-milquu-dark text-right">
                      {entry.qty} <span className="text-xs font-normal text-gray-500">{entry.unit}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{entry.reason}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-red-600 text-right">
                      -₹{entry.lossValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Wastage;
