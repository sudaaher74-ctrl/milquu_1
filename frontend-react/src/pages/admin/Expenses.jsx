import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Receipt, Plus, Filter, Download, Search, 
  IndianRupee, TrendingDown, TrendingUp, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const categoryData = [];

const monthlyTrendData = [];

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await axios.get('https://milquu-backend.onrender.com/api/erp/expenses');
        setExpenseData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching expenses", error);
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const todayExpense = 0;
  const monthExpense = expenseData.reduce((acc, curr) => acc + curr.amount, 0);
  const yearExpense = 0;

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Expense Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track operational costs, salaries, and utility bills.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download size={16} className="mr-2" /> Export
          </button>
          <button className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
            <Plus size={18} className="mr-2" /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 opacity-5 rounded-bl-[100px] pointer-events-none"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Today's Expenses</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold text-milquu-dark">₹{(todayExpense).toLocaleString()}</h3>
          </div>
          <p className="text-xs text-red-500 font-medium mt-2 flex items-center"><TrendingUp size={14} className="mr-1"/> 0% vs yesterday</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 opacity-5 rounded-bl-[100px] pointer-events-none"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Monthly Expenses</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold text-milquu-dark">₹{(monthExpense).toLocaleString()}</h3>
          </div>
          <p className="text-xs text-green-500 font-medium mt-2 flex items-center"><TrendingDown size={14} className="mr-1"/> 0% vs last month</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 opacity-5 rounded-bl-[100px] pointer-events-none"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Yearly Expenses (YTD)</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold text-milquu-dark">₹{(yearExpense).toLocaleString()}</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-2 flex items-center">Since Jan 1, {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Expense Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-milquu-dark">Expense Trend</h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} formatter={(val) => `₹${val.toLocaleString()}`} />
                <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-milquu-dark mb-2 flex items-center">
            <PieChartIcon size={18} className="mr-2 text-milquu-blue" /> Expense Categories
          </h2>
          <div className="flex h-[250px]">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-3">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-gray-600 font-medium">{cat.name}</span>
                  </div>
                  <span className="font-bold text-milquu-dark">₹{cat.value > 999 ? (cat.value/1000).toFixed(1)+'k' : cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-80">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-milquu-blue transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Expense ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Paid To</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenseData.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase())).map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-milquu-blue cursor-pointer hover:underline">{expense.expenseId}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold uppercase tracking-wide">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[250px] truncate">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {expense.paidTo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {expense.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-milquu-dark text-right">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
