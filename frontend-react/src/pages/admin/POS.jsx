import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, Search, Plus, Minus, Trash2, Printer, 
  CreditCard, Banknote, Smartphone, Store, Calculator,
  User, Phone, UserPlus, X, Check, FileText, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discount, setDiscount] = useState(0);

  // Customer Management State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef(null);

  // Quick Add Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Payment & Order Completion
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Load products and registered customers
  useEffect(() => {
    // 1. Fetch products
    api.get('/api/products').then(({ data }) => {
      setProducts(data.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        barcode: p.barcode || p._id,
        image: p.image,
        category: p.category || 'Dairy',
      })));
    }).catch(console.error);

    // 2. Fetch existing customers for fixed/regular customer selection
    api.get('/api/admin/customers').then(({ data }) => {
      if (data?.topCustomers) {
        setCustomerList(data.topCustomers);
      }
    }).catch(console.error);
  }, []);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Product not found!');
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
    const total = Math.max(0, subtotal - discount);
    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter fixed customers for autocomplete dropdown
  const matchingCustomers = customerList.filter(c => {
    if (!customerName.trim()) return true;
    const q = customerName.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q));
  });

  const selectCustomer = (c) => {
    setCustomerName(c.name || '');
    setCustomerPhone(c.phone || '');
    setCustomerId(c._id || c.id || null);
    setShowCustomerDropdown(false);
  };

  const handleClearCustomer = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerId(null);
  };

  // Save new fixed customer to database
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) {
      alert('Please enter customer name');
      return;
    }
    setIsSavingCustomer(true);
    try {
      const { data } = await api.post('/api/admin/customers', newCustomer);
      setCustomerList(prev => [data, ...prev]);
      selectCustomer(data);
      setShowAddCustomerModal(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      alert(`Customer "${data.name}" added successfully!`);
    } catch (err) {
      console.error('Error adding customer:', err);
      alert(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Complete bill and print receipt
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Please add products to cart before generating a bill.');
      return;
    }

    setIsSubmitting(true);
    const finalCustomerName = customerName.trim() || 'Walk-in Customer';
    const finalCustomerPhone = customerPhone.trim() || '';
    const billNo = `POS-${Date.now().toString().slice(-6)}`;
    const billDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const payload = {
      user: customerId || undefined,
      name: finalCustomerName,
      phone: finalCustomerPhone || undefined,
      orderItems: cart.map(item => ({
        product: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image
      })),
      discount,
      totalPrice: total,
      paymentMethod,
      orderSource: 'POS'
    };

    try {
      await api.post('/api/erp/orders', payload);
      
      const receiptData = {
        billNo,
        date: billDate,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        items: [...cart],
        subtotal,
        discount,
        total,
        paymentMethod
      };

      setCompletedOrder(receiptData);
      setShowReceiptModal(true);

      // Reset cart and inputs for next bill
      setCart([]);
      setDiscount(0);
      handleClearCustomer();
    } catch (err) {
      console.error('Checkout error:', err);
      // Still show receipt even if network fails in offline store
      const receiptData = {
        billNo,
        date: billDate,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        items: [...cart],
        subtotal,
        discount,
        total,
        paymentMethod
      };
      setCompletedOrder(receiptData);
      setShowReceiptModal(true);
      setCart([]);
      setDiscount(0);
      handleClearCustomer();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-4 font-sans h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight flex items-center">
            <Store className="mr-3 text-milquu-blue" size={28} /> Shop POS
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Quick over-the-counter billing & customer management</p>
        </div>
        
        {/* Quick Mode Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-3.5 py-2 bg-milquu-blue text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-800 transition-colors"
          >
            <UserPlus size={15} /> Add Regular Customer
          </button>
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
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue shadow-sm bg-white"
              />
            </div>
            <form onSubmit={handleBarcodeSubmit} className="relative w-64">
              <Barcode size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Scan Barcode..." 
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 shadow-sm bg-white"
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

        {/* Right Side: Billing Cart with Customer Info */}
        <div className="w-full lg:w-[420px] xl:w-[460px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-milquu-dark text-white flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText size={18} /> Current Bill
            </h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{cart.length} Items</span>
          </div>

          {/* Customer Selection Section */}
          <div className="p-3.5 bg-gray-50 border-b border-gray-200" ref={customerDropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <User size={14} className="text-milquu-blue" />
                Customer (Regular / Walk-in)
              </span>
              {customerName && (
                <button 
                  type="button"
                  onClick={handleClearCustomer}
                  className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Reset to Walk-in
                </button>
              )}
            </div>

            <div className="relative">
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search or enter customer name..."
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-semibold text-gray-800 shadow-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  title="Add New Regular Customer to System"
                  className="px-3 bg-white border border-gray-200 hover:border-milquu-blue text-milquu-blue rounded-xl flex items-center gap-1 text-xs font-bold shadow-xs transition-colors"
                >
                  <UserPlus size={14} />
                  <span>New</span>
                </button>
              </div>

              {/* Autocomplete Suggestions for Fixed/Regular Customers */}
              {showCustomerDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-gray-100">
                  <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Regular / Registered Customers</span>
                    <button 
                      type="button" 
                      onClick={() => setShowCustomerDropdown(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  
                  {matchingCustomers.length > 0 ? (
                    matchingCustomers.map(c => (
                      <button
                        key={c._id || c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="w-full px-3 py-2.5 text-left hover:bg-blue-50/70 flex items-center justify-between text-xs transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-gray-800 group-hover:text-milquu-blue">{c.name}</p>
                          {c.phone && <p className="text-[11px] text-gray-500 font-mono mt-0.5">{c.phone}</p>}
                        </div>
                        {c.status && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {c.status}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-xs text-gray-400 text-center">
                      No matching registered customer. Name will be used as a custom billing name.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Customer Phone */}
            <div className="relative mt-2">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel"
                placeholder="Phone number (optional)..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-medium font-mono shadow-xs"
              />
            </div>
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
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                  <Calculator size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Cart is empty</p>
                  <p className="text-xs">Select products from the catalog to build bill</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Billing Summary & Payment Methods */}
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
                  min="0"
                  value={discount || ''} 
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-20 text-right text-sm border-b border-gray-200 focus:outline-none focus:border-milquu-blue font-bold text-red-500"
                />
              </div>
              <div className="flex justify-between text-xl pt-2 border-t border-gray-100 mt-2">
                <span className="font-bold text-milquu-dark">Total</span>
                <span className="font-bold text-green-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    paymentMethod === 'Cash' 
                      ? 'bg-green-600 text-white border-green-600 shadow-sm font-bold' 
                      : 'bg-green-50/60 border-green-200 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <Banknote size={18} className="mb-1" />
                  <span className="text-xs uppercase font-bold">Cash</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    paymentMethod === 'Card' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold' 
                      : 'bg-blue-50/60 border-blue-200 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <CreditCard size={18} className="mb-1" />
                  <span className="text-xs uppercase font-bold">Card</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    paymentMethod === 'UPI' 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-bold' 
                      : 'bg-purple-50/60 border-purple-200 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <Smartphone size={18} className="mb-1" />
                  <span className="text-xs uppercase font-bold">UPI</span>
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center shadow-md transition-all ${
                cart.length > 0 && !isSubmitting
                  ? 'bg-milquu-dark text-white hover:bg-gray-800' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Printer size={18} className="mr-2" /> Generate & Print Bill
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Add Regular Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowAddCustomerModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-milquu-blue flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Regular Customer</h3>
                <p className="text-xs text-gray-500">Save fixed customer for rapid billing</p>
              </div>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number</label>
                <input 
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Address / Note</label>
                <input 
                  type="text"
                  placeholder="e.g. Flat 402, Sector 6, New Panvel"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-5 py-2 bg-milquu-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50"
                >
                  {isSavingCustomer ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header Controls (hidden when printing) */}
            <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center print:hidden">
              <span className="text-xs font-bold text-gray-600">Bill Generated Successfully</span>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Voucher Body (Printed content) */}
            <div id="pos-receipt-voucher" className="p-6 bg-white overflow-y-auto text-gray-800 text-xs font-mono">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-dashed border-gray-400 mb-3">
                <h2 className="text-base font-bold text-black uppercase tracking-wider font-serif">MilQuu Fresh</h2>
                <p className="text-[11px] text-gray-600">Pure Farm Fresh Milk & Dairy</p>
                <p className="text-[10px] text-gray-500">Panvel, Navi Mumbai</p>
                <p className="text-[10px] text-gray-500">Tel: +91 87670 67884</p>
              </div>

              {/* Bill Details */}
              <div className="pb-3 border-b border-dashed border-gray-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill No:</span>
                  <span className="font-bold text-black">{completedOrder.billNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{completedOrder.date}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-dotted border-gray-200">
                  <span className="text-gray-700">Customer:</span>
                  <span className="text-black text-right">{completedOrder.customerName}</span>
                </div>
                {completedOrder.customerPhone && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Phone:</span>
                    <span>{completedOrder.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-bold text-green-700">{completedOrder.paymentMethod} (PAID)</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3 border-b border-dashed border-gray-300">
                <div className="flex justify-between font-bold text-gray-600 pb-1 mb-1 border-b border-gray-200 text-[11px]">
                  <span>Item</span>
                  <span className="text-right">Qty x Rate = Amt</span>
                </div>
                <div className="space-y-1.5">
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <span className="font-semibold text-gray-800 pr-2">{it.name}</span>
                      <span className="whitespace-nowrap font-bold text-gray-900">
                        {it.qty} x ₹{it.price} = ₹{it.qty * it.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Totals */}
              <div className="py-3 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{completedOrder.subtotal.toFixed(2)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-₹{completedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-black pt-1 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-green-700">₹{completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-3 text-[10px] text-gray-500">
                <p className="font-semibold text-gray-700">Thank you for visiting MilQuu Fresh!</p>
                <p>Have a fresh & healthy day</p>
              </div>
            </div>

            {/* Modal Actions (hidden when printing) */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-milquu-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Printer size={15} /> Print Bill
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Next Sale
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Print Stylesheet for clean thermal receipt printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pos-receipt-voucher, #pos-receipt-voucher * {
            visibility: visible;
          }
          #pos-receipt-voucher {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            max-width: 100%;
            margin: 0;
            padding: 10px;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default POS;
