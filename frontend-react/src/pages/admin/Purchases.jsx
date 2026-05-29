import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Plus, Search, Filter, Download, 
  TrendingUp, Truck, Package, IndianRupee, Factory
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const trendData = [];

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    category: 'Raw Milk',
    productName: '',
    quantity: '',
    rate: '',
    status: 'Pending'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      const quantity = Number(formData.quantity);
      const rate = Number(formData.rate);
      const totalCost = quantity * rate;
      
      const newPurchase = {
        ...formData,
        quantity,
        rate,
        totalCost,
        poNumber: `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      };
      const { data } = await axios.post('https://milquu-backend.onrender.com/api/erp/purchases', newPurchase);
      setPurchaseData([data, ...purchaseData]);
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        supplierName: '',
        category: 'Raw Milk',
        productName: '',
        quantity: '',
        rate: '',
        status: 'Pending'
      });
    } catch (error) {
      console.error("Error creating purchase", error);
      alert('Failed to save purchase');
    }
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data } = await axios.get('https://milquu-backend.onrender.com/api/erp/purchases');
        setPurchaseData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching purchases", error);
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const totalMonthlyCost = purchaseData.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Purchase Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track suppliers, raw materials, packaging, and logistics costs.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download size={16} className="mr-2" /> Export
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
            <Plus size={18} className="mr-2" /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Top Dashboards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* KPI Cards */}
        <div className="flex flex-col space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Purchase Cost</p>
              <h3 className="text-3xl font-bold text-milquu-dark">₹{(totalMonthlyCost).toLocaleString()}</h3>
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center"><TrendingUp size={12} className="mr-1"/> 0% vs Last Month</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <IndianRupee size={24} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Suppliers</p>
              <h3 className="text-3xl font-bold text-milquu-dark">0</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">0 pending deliveries</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-milquu-blue">
              <Factory size={24} />
            </div>
          </div>
        </div>

        {/* Purchase Trends Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 sm:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-milquu-dark">Purchase Trends (YTD)</h2>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} formatter={(val) => `₹${val.toLocaleString()}`} />
                <Bar dataKey="cost" name="Cost" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
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
              placeholder="Search by supplier or product..." 
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
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Category & Product</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4 text-right">Rate</th>
                <th className="px-6 py-4 text-right">Total Cost</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchaseData.filter(p => p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.productName?.toLowerCase().includes(searchTerm.toLowerCase())).map((purchase) => (
                <tr key={purchase._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-milquu-blue cursor-pointer hover:underline">{purchase.poNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(purchase.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-milquu-dark">{purchase.supplierName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800">{purchase.productName}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                      {purchase.category === 'Raw Milk' ? <Package size={12} className="mr-1"/> : 
                       purchase.category === 'Transport' ? <Truck size={12} className="mr-1"/> : 
                       <ShoppingCart size={12} className="mr-1" />}
                      {purchase.category}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 text-right">
                    {purchase.quantity ? purchase.quantity.toLocaleString() : 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 text-right">
                    ₹{purchase.rate}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-milquu-dark text-right">
                    ₹{purchase.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                      purchase.status === 'Received' || purchase.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      purchase.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10">
            <h2 className="text-xl font-bold text-milquu-dark mb-4">Add Purchase Order</h2>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier Name</label>
                  <input required type="text" name="supplierName" value={formData.supplierName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2" placeholder="Farmer XYZ" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2">
                  <option value="Raw Milk">Raw Milk</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
                <input required type="text" name="productName" value={formData.productName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2" placeholder="e.g. Buffalo Milk" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2" placeholder="e.g. 50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rate / Unit (₹)</label>
                  <input required type="number" name="rate" value={formData.rate} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2" placeholder="e.g. 60" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select required name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2">
                  <option value="Pending">Pending</option>
                  <option value="Received">Received</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-milquu-dark text-white rounded-lg hover:bg-gray-800">Save Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Purchases;
