import React, { useState } from 'react';
import { 
  Barcode, Search, Plus, Minus, Trash2, Printer, 
  CreditCard, Banknote, Smartphone, Store, Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Product Database
const posProducts = [];

const POS = () => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discount, setDiscount] = useState(0);

  // Stats
  const dailySales = 0;
  const monthlySales = 0;
  const shopProfit = 0;
  const avgBill = 0;

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = posProducts.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert("Product not found!");
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + change;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();
  const filteredProducts = posProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-[1600px] mx-auto pb-4 font-sans h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight flex items-center">
            <Store className="mr-3 text-milquu-blue" size={28} /> Shop POS
          </h1>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-1 border-r border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400">Daily Sales</p>
            <p className="text-lg font-bold text-milquu-dark">₹{dailySales.toLocaleString()}</p>
          </div>
          <div className="px-4 py-1 border-r border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400">Monthly</p>
            <p className="text-lg font-bold text-milquu-dark">₹{monthlySales.toLocaleString()}</p>
          </div>
          <div className="px-4 py-1">
            <p className="text-[10px] uppercase font-bold text-gray-400">Avg Bill</p>
            <p className="text-lg font-bold text-milquu-blue">₹{avgBill}</p>
          </div>
        </div>
      </div>

      {/* Main POS Interface */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* Left Side: Products Catalog & Scanner */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Top Bar: Search & Barcode */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue shadow-sm"
              />
            </div>
            <form onSubmit={handleBarcodeSubmit} className="relative w-64">
              <Barcode size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Scan Barcode..." 
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 shadow-sm"
              />
            </form>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-milquu-blue cursor-pointer transition-all flex flex-col items-center text-center group"
                >
                  <div className="h-24 w-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    <img src={product.image} alt={product.name} className="max-h-full max-w-full mix-blend-multiply" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-milquu-blue mt-auto">₹{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Billing Cart */}
        <div className="w-full lg:w-[400px] xl:w-[450px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          
          <div className="p-4 border-b border-gray-100 bg-milquu-dark text-white flex justify-between items-center">
            <h2 className="text-lg font-bold">Current Bill</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{cart.length} Items</span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-50/30">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 bg-white mb-2 rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex-1 pr-3">
                    <h4 className="text-sm font-bold text-gray-800 leading-tight truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">₹{item.price} / unit</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Qty Controls */}
                    <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"><Minus size={14}/></button>
                      <span className="w-8 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"><Plus size={14}/></button>
                    </div>
                    <div className="w-16 text-right">
                      <p className="text-sm font-bold text-milquu-dark">₹{item.price * item.qty}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Calculator size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Cart is empty</p>
                  <p className="text-xs">Scan a barcode or add products from catalog</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Billing Summary */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500">Discount (₹)</span>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 text-right text-sm border-b border-gray-200 focus:outline-none focus:border-milquu-blue font-bold text-red-500"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST (5%)</span>
                <span className="font-bold text-gray-800">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl pt-2 border-t border-gray-100 mt-2">
                <span className="font-bold text-milquu-dark">Total</span>
                <span className="font-bold text-green-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button className="flex flex-col items-center justify-center py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
                <Banknote size={20} className="mb-1" />
                <span className="text-xs font-bold uppercase">Cash</span>
              </button>
              <button className="flex flex-col items-center justify-center py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                <CreditCard size={20} className="mb-1" />
                <span className="text-xs font-bold uppercase">Card</span>
              </button>
              <button className="flex flex-col items-center justify-center py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">
                <Smartphone size={20} className="mb-1" />
                <span className="text-xs font-bold uppercase">UPI</span>
              </button>
            </div>
            
            <button 
              onClick={() => { alert('Receipt Printed! Order Saved.'); setCart([]); setDiscount(0); }}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center shadow-md transition-colors ${
                cart.length > 0 ? 'bg-milquu-dark text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Printer size={18} className="mr-2" /> Print Receipt
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default POS;
