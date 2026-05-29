import React, { useState } from 'react';
import { 
  Boxes, AlertTriangle, TrendingUp, DollarSign, Package, 
  PackageX, Database, Search, Download
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock inventory data matching ERP requirements
const inventoryData = [];

const InventoryCard = ({ item }) => {
  const stockValue = item.stock * item.purchasePrice;
  // Expected Revenue only applies to non-packaging goods that have a selling price
  const expectedRevenue = item.sellingPrice > 0 ? item.stock * item.sellingPrice : 0;
  const expectedProfit = expectedRevenue > 0 ? expectedRevenue - stockValue : 0;
  
  const percentage = Math.min((item.stock / (item.minLevel * 3)) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] transition-opacity"></div>
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-bold text-milquu-dark truncate max-w-[180px]">{item.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
        </div>
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          item.status === 'Healthy' ? 'bg-green-100 text-green-700' :
          item.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
          'bg-red-100 text-red-700'
        }`}>
          {item.status}
        </span>
      </div>
      
      <div className="flex items-end space-x-1 mb-4">
        <span className="text-3xl font-bold text-milquu-dark relative z-10">{item.stock}</span>
        <span className="text-sm text-gray-500 font-medium mb-1 relative z-10">{item.unit}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Stock Value</p>
          <p className="text-sm font-bold text-gray-800">₹{(stockValue).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Exp. Revenue</p>
          <p className="text-sm font-bold text-milquu-blue">{expectedRevenue > 0 ? `₹${(expectedRevenue).toLocaleString()}` : '-'}</p>
        </div>
        <div className="col-span-2 pt-2 border-t border-gray-200 mt-1">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Expected Profit</p>
          <p className="text-sm font-bold text-green-600">{expectedProfit > 0 ? `+₹${(expectedProfit).toLocaleString()}` : '-'}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span className="text-gray-500">Stock Level</span>
          <span className="text-gray-400 text-[10px]">Min: {item.minLevel}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              item.status === 'Healthy' ? 'bg-green-500' :
              item.status === 'Low Stock' ? 'bg-orange-500' : 'bg-red-500'
            }`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalValue = inventoryData.reduce((acc, item) => acc + (item.stock * item.purchasePrice), 0);
  const totalQuantity = inventoryData.reduce((acc, item) => acc + item.stock, 0);
  const lowStockCount = inventoryData.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = inventoryData.filter(i => i.status === 'Out of Stock').length;
  // Mock dead inventory
  const deadInventoryCount = 1;

  const filteredData = inventoryData.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Smart Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time tracking of stock values, expected revenue, and profits.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download size={16} className="mr-2" /> Export Log
          </button>
          <button className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
            <Boxes size={18} className="mr-2" /> Add Stock
          </button>
        </div>
      </div>

      {/* Smart Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
            <h3 className="text-2xl font-bold text-milquu-dark">₹{(totalValue).toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-milquu-blue">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Quantity</p>
            <h3 className="text-2xl font-bold text-milquu-dark">{totalQuantity.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Database size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm flex items-center justify-between bg-orange-50/30">
          <div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Low Stock</p>
            <h3 className="text-2xl font-bold text-orange-700">{lowStockCount} Items</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between bg-red-50/30">
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Out of Stock</p>
            <h3 className="text-2xl font-bold text-red-700">{outOfStockCount} Items</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <PackageX size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between bg-gray-50">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dead Inventory</p>
            <h3 className="text-2xl font-bold text-gray-700">{deadInventoryCount} Items</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
            <Package size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search inventory items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-milquu-blue text-sm"
          />
        </div>
        <div className="flex space-x-2">
          {['All', 'Raw Milk', 'Finished Goods', 'Packaging'].map(cat => (
            <button key={cat} className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredData.map((item) => (
          <InventoryCard key={item.id} item={item} />
        ))}
      </div>

    </div>
  );
};

export default Inventory;
