import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreVertical, Edit2, Trash2, Package } from 'lucide-react';

// Mock product data for the dashboard
const mockProducts = [
  { id: 1, name: 'Premium A2 Cow Milk', category: 'Milk', price: '₹95/L', stock: 120, dailySales: 45, revenue: 4275, image: '/img/A2milk.png', status: 'In Stock' },
  { id: 2, name: 'Farm Fresh Buffalo Milk', category: 'Milk', price: '₹105/L', stock: 85, dailySales: 38, revenue: 3990, image: '/img/buffalomilk.png', status: 'Low Stock' },
  { id: 3, name: 'Pure Cow Milk', category: 'Milk', price: '₹85/L', stock: 200, dailySales: 92, revenue: 7820, image: '/img/cowmilk.png', status: 'In Stock' },
  { id: 4, name: 'Fresh Malai Paneer', category: 'By-Products', price: '₹120/200g', stock: 40, dailySales: 15, revenue: 1800, image: '/img/panner.png', status: 'Low Stock' },
  { id: 5, name: 'Thick Farm Dahi', category: 'By-Products', price: '₹60/500g', stock: 65, dailySales: 28, revenue: 1680, image: '/img/Dahi.png', status: 'In Stock' },
  { id: 6, name: 'Traditional Lassi', category: 'By-Products', price: '₹40/250ml', stock: 110, dailySales: 42, revenue: 1680, image: '/img/lassi.png', status: 'In Stock' },
  { id: 7, name: 'A2 Cow Ghee', category: 'By-Products', price: '₹850/500g', stock: 12, dailySales: 3, revenue: 2550, image: '/img/A2ghee.png', status: 'Critical' },
  { id: 8, name: 'Pure Cow Ghee', category: 'By-Products', price: '₹650/500g', stock: 25, dailySales: 5, revenue: 3250, image: '/img/cowghee.png', status: 'In Stock' },
];

const ProductCard = ({ product }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
  >
    {/* Status Badge */}
    <div className="absolute top-4 left-4 z-10">
      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
        product.status === 'In Stock' ? 'bg-green-100 text-green-700' :
        product.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
        'bg-red-100 text-red-700'
      }`}>
        {product.status}
      </span>
    </div>

    {/* Actions */}
    <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-milquu-blue hover:bg-milquu-blue hover:text-white shadow-sm transition-colors">
        <Edit2 size={14} />
      </button>
      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white shadow-sm transition-colors">
        <Trash2 size={14} />
      </button>
    </div>

    {/* Image Area */}
    <div className="h-48 bg-gray-50/80 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent"></div>
      <img src={product.image} alt={product.name} className="h-full object-contain relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
    </div>

    {/* Content Area */}
    <div className="p-5">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-base font-bold text-milquu-dark leading-tight">{product.name}</h3>
        <span className="text-sm font-bold text-milquu-blue ml-2 whitespace-nowrap">{product.price}</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">{product.category}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-1 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[9px] text-gray-400 uppercase font-semibold mb-1 truncate">Stock</p>
          <p className="text-sm font-bold text-milquu-dark">{product.stock}</p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] text-gray-400 uppercase font-semibold mb-1 truncate">Daily</p>
          <p className="text-sm font-bold text-milquu-dark">{product.dailySales}</p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] text-gray-400 uppercase font-semibold mb-1 truncate">Monthly</p>
          <p className="text-sm font-bold text-milquu-dark">{product.dailySales * 30}</p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] text-gray-400 uppercase font-semibold mb-1 truncate">Rev.</p>
          <p className="text-sm font-bold text-green-600">₹{product.revenue > 999 ? (product.revenue/1000).toFixed(1)+'k' : product.revenue}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const AdminProducts = () => {
  const [filter, setFilter] = useState('All');

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Products Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your dairy products, pricing, and stock levels.</p>
        </div>
        <button className="flex items-center space-x-2 bg-milquu-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md shadow-milquu-blue/20">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
        {['All', 'Milk', 'By-Products', 'Low Stock'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-milquu-dark text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts
          .filter(p => filter === 'All' ? true : filter === 'Low Stock' ? p.status === 'Low Stock' || p.status === 'Critical' : p.category === filter)
          .map((product, i) => (
            <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
};

export default AdminProducts;
