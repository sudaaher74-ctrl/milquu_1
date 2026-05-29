import React from 'react';
import { Boxes, PackageOpen, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const inventoryData = [
  { name: 'Raw A2 Cow Milk', category: 'Raw Milk', stock: 500, unit: 'Liters', status: 'Healthy', minLevel: 100, trend: 5 },
  { name: 'Raw Buffalo Milk', category: 'Raw Milk', stock: 420, unit: 'Liters', status: 'Healthy', minLevel: 100, trend: 2 },
  { name: 'Glass Bottles (1L)', category: 'Packaging', stock: 1250, unit: 'Units', status: 'Healthy', minLevel: 500, trend: -12 },
  { name: 'Plastic Pouches (500ml)', category: 'Packaging', stock: 800, unit: 'Units', status: 'Low', minLevel: 1000, trend: -25 },
  { name: 'Fresh Paneer', category: 'Finished Goods', stock: 40, unit: 'kg', status: 'Low', minLevel: 50, trend: -10 },
  { name: 'Farm Dahi', category: 'Finished Goods', stock: 65, unit: 'kg', status: 'Healthy', minLevel: 30, trend: 15 },
  { name: 'Traditional Lassi', category: 'Finished Goods', stock: 110, unit: 'Liters', status: 'Healthy', minLevel: 40, trend: 8 },
  { name: 'Pure Desi Ghee', category: 'Finished Goods', stock: 12, unit: 'kg', status: 'Critical', minLevel: 20, trend: -5 },
];

const InventoryCard = ({ item }) => {
  const percentage = Math.min((item.stock / (item.minLevel * 2)) * 100, 100);
  
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] transition-opacity"></div>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-bold text-milquu-dark">{item.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          item.status === 'Healthy' ? 'bg-green-50 text-green-600' :
          item.status === 'Low' ? 'bg-orange-50 text-orange-600' :
          'bg-red-50 text-red-600'
        }`}>
          <PackageOpen size={16} />
        </div>
      </div>
      
      <div className="flex items-end space-x-1 mb-4">
        <span className="text-3xl font-bold text-milquu-dark relative z-10">{item.stock}</span>
        <span className="text-sm text-gray-500 font-medium mb-1 relative z-10">{item.unit}</span>
        <div className="ml-auto flex items-center space-x-1 mb-1 relative z-10">
          {item.trend > 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
          <span className={`text-xs font-bold ${item.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>{Math.abs(item.trend)}%</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span className="text-gray-500">Stock Level</span>
          <span className={item.status === 'Healthy' ? 'text-green-500' : item.status === 'Low' ? 'text-orange-500' : 'text-red-500'}>
            {item.status}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
          <div 
            className={`h-1.5 rounded-full ${
              item.status === 'Healthy' ? 'bg-green-500' :
              item.status === 'Low' ? 'bg-orange-500' : 'bg-red-500'
            }`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-gray-400">Minimum required: {item.minLevel} {item.unit}</p>
      </div>
    </div>
  );
};

const Inventory = () => {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track raw milk, finished goods, and packaging materials.</p>
        </div>
        <button className="bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
          <Boxes size={18} className="mr-2" /> Add Stock
        </button>
      </div>

      {/* Alerts */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start sm:items-center mb-8">
        <AlertTriangle size={20} className="text-red-500 mr-3 mt-0.5 sm:mt-0 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800">Critical Stock Alert</h4>
          <p className="text-sm text-red-600 mt-0.5">Pure Desi Ghee is below minimum threshold (12 kg remaining). Plastic Pouches are running low.</p>
        </div>
        <button className="hidden sm:flex text-sm font-bold text-red-700 hover:text-red-900 items-center">
          Order Now <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      {/* Inventory Grids by Category */}
      <div className="space-y-8">
        
        <section>
          <h2 className="text-lg font-bold text-milquu-dark mb-4 border-b border-gray-200 pb-2">Raw Milk Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventoryData.filter(i => i.category === 'Raw Milk').map((item, idx) => (
              <InventoryCard key={idx} item={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-milquu-dark mb-4 border-b border-gray-200 pb-2">Finished Goods (By-Products)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventoryData.filter(i => i.category === 'Finished Goods').map((item, idx) => (
              <InventoryCard key={idx} item={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-milquu-dark mb-4 border-b border-gray-200 pb-2">Packaging Material</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventoryData.filter(i => i.category === 'Packaging').map((item, idx) => (
              <InventoryCard key={idx} item={item} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Inventory;
