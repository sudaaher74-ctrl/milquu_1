import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, Search, Plus, Minus, Trash2, Printer, 
  CreditCard, Banknote, Smartphone, Store, Calculator,
  User, Phone, UserPlus, X, Check, FileText, ChevronDown,
  BookOpen, AlertCircle, Clock, Calendar, CheckCircle2,
  MessageCircle, ExternalLink, RefreshCw, Filter, ArrowRight,
  DollarSign, Edit3, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const POS = () => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'credit'

  // Products & Cart State
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discount, setDiscount] = useState(0);

  // Customer Management State for POS Cart
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef(null);

  // Billing Cycle & Payment Mode State
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'Card' | 'UPI' | 'Credit'
  const [billingCycle, setBillingCycle] = useState('15 Days'); // '10 Days' | '15 Days' | '30 Days'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Quick Add Regular Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    billingCycle: '15 Days', 
    isCreditCustomer: true, 
    creditLimit: '' 
  });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Credit Customers (Khata) State
  const [creditSummary, setCreditSummary] = useState({
    totalCreditOutstanding: 0,
    totalCreditCustomers: 0,
    customersWithDuesCount: 0,
    overdueCount: 0,
    dueSoonCount: 0,
    cycleBreakdown: {}
  });
  const [creditCustomers, setCreditCustomers] = useState([]);
  const [loadingCredit, setLoadingCredit] = useState(false);
  const [creditSearch, setCreditSearch] = useState('');
  const [creditCycleFilter, setCreditCycleFilter] = useState('ALL'); // 'ALL' | '10 Days' | '15 Days' | '30 Days' | 'OVERDUE'
  const [creditSort, setCreditSort] = useState('dues_desc'); // 'dues_desc' | 'due_date_asc' | 'name_asc'

  // Ledger / Bills History Modal State
  const [selectedCreditCustomerForLedger, setSelectedCreditCustomerForLedger] = useState(null);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Payment Settlement Modal State
  const [selectedCreditCustomerForSettlement, setSelectedCreditCustomerForSettlement] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [settlePaymentMethod, setSettlePaymentMethod] = useState('Cash');
  const [isSettling, setIsSettling] = useState(false);

  // Edit Customer Cycle Modal State
  const [selectedCustomerForEditCycle, setSelectedCustomerForEditCycle] = useState(null);
  const [showEditCycleModal, setShowEditCycleModal] = useState(false);
  const [editCycleValue, setEditCycleValue] = useState('15 Days');
  const [editCreditLimit, setEditCreditLimit] = useState('');
  const [isUpdatingCycle, setIsUpdatingCycle] = useState(false);

  // Initial Data Fetching
  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/products');
      setProducts(data.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        barcode: p.barcode || p._id,
        image: p.image,
        category: p.category || 'Dairy',
      })));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/api/admin/customers');
      if (data?.topCustomers) {
        setCustomerList(data.topCustomers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchCreditCustomers = async () => {
    setLoadingCredit(true);
    try {
      const { data } = await api.get('/api/erp/credit-customers');
      if (data) {
        setCreditSummary(data.summary || {});
        setCreditCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to load credit customers:', err);
    } finally {
      setLoadingCredit(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchCreditCustomers();
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

  // Barcode Handler
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

  // Cart operations
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

  // Autocomplete matching customers
  const matchingCustomers = customerList.filter(c => {
    if (!customerName.trim()) return true;
    const q = customerName.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q));
  });

  const selectCustomer = (c) => {
    setCustomerName(c.name || '');
    setCustomerPhone(c.phone || '');
    setCustomerId(c._id || c.id || c.userId || null);
    setSelectedCustomer(c);
    
    // Automatically inherit customer's billing cycle if configured
    if (c.billingCycle && c.billingCycle !== 'none') {
      setBillingCycle(c.billingCycle);
      if (c.isCreditCustomer) {
        setPaymentMethod('Credit');
      }
    }
    setShowCustomerDropdown(false);
  };

  const handleClearCustomer = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerId(null);
    setSelectedCustomer(null);
    setPaymentMethod('Cash');
    setBillingCycle('15 Days');
  };

  // Switch from Credit tab directly into POS Cart for a given customer
  const handleStartBillForCustomer = (cust) => {
    selectCustomer(cust);
    setActiveTab('terminal');
  };

  // Add New Regular Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) {
      alert('Please enter customer name');
      return;
    }
    setIsSavingCustomer(true);
    try {
      const payload = {
        ...newCustomer,
        isCreditCustomer: newCustomer.billingCycle !== 'none',
        creditLimit: Number(newCustomer.creditLimit) || 0
      };
      const { data } = await api.post('/api/admin/customers', payload);
      setCustomerList(prev => [data, ...prev]);
      selectCustomer(data);
      setShowAddCustomerModal(false);
      setNewCustomer({ 
        name: '', 
        phone: '', 
        email: '', 
        address: '', 
        billingCycle: '15 Days', 
        isCreditCustomer: true, 
        creditLimit: '' 
      });
      fetchCreditCustomers();
      alert(`Customer "${data.name}" added successfully with ${data.billingCycle || '15 Days'} billing system!`);
    } catch (err) {
      console.error('Error adding customer:', err);
      alert(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Please add products to cart before generating a bill.');
      return;
    }

    const isCredit = paymentMethod === 'Credit';
    if (isCredit && !customerName.trim()) {
      alert('Please enter or select a customer name for Credit / Khata billing so the bill is recorded to their account.');
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

    const cycleDays = billingCycle.includes('10') ? 10 : billingCycle.includes('30') ? 30 : 15;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + cycleDays);
    const formattedDueDate = dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

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
      billingCycle: isCredit ? billingCycle : undefined,
      creditDueDate: isCredit ? dueDate : undefined,
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
        paymentMethod,
        isCredit,
        billingCycle: isCredit ? billingCycle : null,
        creditDueDate: isCredit ? formattedDueDate : null
      };

      setCompletedOrder(receiptData);
      setShowReceiptModal(true);

      // Reset cart and inputs for next bill
      setCart([]);
      setDiscount(0);
      handleClearCustomer();
      fetchCreditCustomers();
    } catch (err) {
      console.error('Checkout error:', err);
      // Offline fallback: still generate receipt
      const receiptData = {
        billNo,
        date: billDate,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        items: [...cart],
        subtotal,
        discount,
        total,
        paymentMethod,
        isCredit,
        billingCycle: isCredit ? billingCycle : null,
        creditDueDate: isCredit ? formattedDueDate : null
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

  // WhatsApp Reminder Generator
  const handleSendWhatsAppReminder = (cust) => {
    const rawPhone = cust.phone ? cust.phone.replace(/[^0-9]/g, '') : '';
    const phone = rawPhone.slice(-10);
    if (!phone || phone.length < 10) {
      alert('No valid 10-digit mobile number found for this customer.');
      return;
    }
    const cycleText = cust.billingCycle || '15 Days';
    const dueText = cust.nextDueDate 
      ? new Date(cust.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'the scheduled due date';
    const totalDueFormatted = cust.totalDue?.toFixed(2) || '0.00';

    const message = `Namaste ${cust.name || 'Sir/Madam'}, greetings from MilQuu Fresh! 🥛\n\nThis is a friendly reminder that your milk & dairy credit bill for the ${cycleText} billing cycle is ₹${totalDueFormatted}.\nPayment Due Date: ${dueText}.\n\nKindly clear at your convenience via Cash or UPI at the store. Thank you for choosing pure & fresh MilQuu Fresh!`;
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Open Settle Modal
  const handleOpenSettleModal = (cust) => {
    setSelectedCreditCustomerForSettlement(cust);
    setSettleAmount(cust.totalDue ? cust.totalDue.toString() : '');
    setSettlePaymentMethod('Cash');
    setShowSettleModal(true);
  };

  // Submit Settlement Payment
  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCreditCustomerForSettlement) return;
    const amount = Number(settleAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    setIsSettling(true);
    try {
      await api.post(`/api/erp/credit-customers/${selectedCreditCustomerForSettlement.customerId}/settle`, {
        amount,
        paymentMethod: settlePaymentMethod
      });
      alert(`Payment of ₹${amount} recorded successfully via ${settlePaymentMethod}!`);
      setShowSettleModal(false);
      setSelectedCreditCustomerForSettlement(null);
      setSettleAmount('');
      fetchCreditCustomers();
    } catch (err) {
      console.error('Settlement error:', err);
      alert(err.response?.data?.message || 'Failed to process settlement');
    } finally {
      setIsSettling(false);
    }
  };

  // Mark Individual Order as Paid from Ledger
  const handleMarkOrderPaid = async (orderId) => {
    if (!confirm('Mark this specific bill as paid?')) return;
    try {
      await api.put(`/api/erp/orders/${orderId}/pay`, { paymentMethod: 'Cash' });
      alert('Bill marked as paid successfully!');
      fetchCreditCustomers();
      if (selectedCreditCustomerForLedger) {
        setSelectedCreditCustomerForLedger(prev => {
          if (!prev) return null;
          const updatedOrders = prev.orders.filter(o => (o._id || o.orderId) !== orderId);
          const newTotal = updatedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
          return {
            ...prev,
            orders: updatedOrders,
            totalDue: newTotal,
            unpaidCount: updatedOrders.length
          };
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to mark order as paid');
    }
  };

  // Open Edit Customer Cycle Modal
  const handleOpenEditCycle = (cust) => {
    setSelectedCustomerForEditCycle(cust);
    setEditCycleValue(cust.billingCycle || '15 Days');
    setEditCreditLimit(cust.creditLimit ? cust.creditLimit.toString() : '');
    setShowEditCycleModal(true);
  };

  // Submit Customer Cycle Update
  const handleUpdateCycleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerForEditCycle) return;
    if (!selectedCustomerForEditCycle.userId) {
      alert('This is a walk-in record without a registered customer account. Please add them as a regular customer first.');
      return;
    }
    setIsUpdatingCycle(true);
    try {
      await api.put(`/api/admin/customers/${selectedCustomerForEditCycle.userId}`, {
        billingCycle: editCycleValue,
        isCreditCustomer: editCycleValue !== 'none',
        creditLimit: Number(editCreditLimit) || 0
      });
      alert(`Customer billing cycle updated to ${editCycleValue}!`);
      setShowEditCycleModal(false);
      fetchCreditCustomers();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update billing cycle');
    } finally {
      setIsUpdatingCycle(false);
    }
  };

  // Filter & Sort Credit Customers
  const filteredCreditCustomers = creditCustomers.filter(c => {
    // Search query
    if (creditSearch.trim()) {
      const q = creditSearch.toLowerCase();
      const matches = (c.name && c.name.toLowerCase().includes(q)) || 
                      (c.phone && c.phone.includes(q));
      if (!matches) return false;
    }
    // Cycle filter
    if (creditCycleFilter === '10 Days') return c.billingCycle === '10 Days';
    if (creditCycleFilter === '15 Days') return c.billingCycle === '15 Days';
    if (creditCycleFilter === '30 Days') return c.billingCycle === '30 Days';
    if (creditCycleFilter === 'OVERDUE') return c.status === 'Overdue';
    return true;
  }).sort((a, b) => {
    if (creditSort === 'dues_desc') return b.totalDue - a.totalDue;
    if (creditSort === 'due_date_asc') {
      if (!a.nextDueDate) return 1;
      if (!b.nextDueDate) return -1;
      return new Date(a.nextDueDate) - new Date(b.nextDueDate);
    }
    if (creditSort === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="max-w-[1600px] mx-auto pb-4 font-sans h-[calc(100vh-100px)] flex flex-col">
      
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-milquu-dark tracking-tight flex items-center">
            <Store className="mr-3 text-milquu-blue" size={28} /> Shop POS
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Quick over-the-counter billing, customer management & Khata ledger</p>
        </div>

        {/* Tab Navigation & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Main POS / Credit Tab Switcher */}
          <div className="bg-gray-100/90 p-1 rounded-2xl flex items-center border border-gray-200 shadow-xs">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'terminal'
                  ? 'bg-white text-milquu-dark shadow-sm'
                  : 'text-gray-500 hover:text-milquu-dark'
              }`}
            >
              <Store size={15} className={activeTab === 'terminal' ? 'text-milquu-blue' : ''} />
              <span>POS Billing</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('credit');
                fetchCreditCustomers();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'credit'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-amber-800'
              }`}
            >
              <BookOpen size={15} />
              <span>Credit Customers (Khata)</span>
              {creditSummary.customersWithDuesCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'credit' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
                }`}>
                  {creditSummary.customersWithDuesCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Add Regular Customer Button */}
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-3.5 py-2 bg-milquu-blue text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <UserPlus size={15} /> Add Regular Customer
          </button>

          {activeTab === 'credit' && (
            <button
              onClick={fetchCreditCustomers}
              disabled={loadingCredit}
              className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-milquu-blue rounded-xl text-xs font-bold shadow-xs hover:bg-gray-50 transition-colors"
              title="Refresh Credit Records"
            >
              <RefreshCw size={15} className={loadingCredit ? 'animate-spin text-milquu-blue' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: POS TERMINAL BILLING                                 */}
      {/* ============================================================ */}
      {activeTab === 'terminal' && (
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

          {/* Right Side: Billing Cart with Customer Info & Khata Support */}
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
                    className="px-3 bg-white border border-gray-200 hover:border-milquu-blue text-milquu-blue rounded-xl flex items-center gap-1 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>New</span>
                  </button>
                </div>

                {/* Autocomplete Suggestions for Fixed/Regular Customers */}
                {showCustomerDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-gray-100">
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
                          className="w-full px-3 py-2.5 text-left hover:bg-blue-50/70 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                        >
                          <div>
                            <p className="font-bold text-gray-800 group-hover:text-milquu-blue">{c.name}</p>
                            {c.phone && <p className="text-[11px] text-gray-500 font-mono mt-0.5">{c.phone}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {c.billingCycle && c.billingCycle !== 'none' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                {c.billingCycle} Cycle
                              </span>
                            )}
                            {c.status && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                {c.status}
                              </span>
                            )}
                          </div>
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
                  placeholder="Phone number (required for credit)..." 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-medium font-mono shadow-xs"
                />
              </div>

              {/* Selected Customer Billing Cycle Badge & Outstanding Details */}
              {selectedCustomer && (
                <div className="mt-2.5 p-2 bg-blue-50/80 border border-blue-200/70 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-milquu-blue text-white font-bold text-[10px] uppercase">
                      {selectedCustomer.billingCycle || '15 Days'} System
                    </span>
                    {selectedCustomer.totalDue > 0 ? (
                      <span className="text-amber-800 font-semibold text-[11px]">
                        Khata Dues: <b>₹{selectedCustomer.totalDue}</b>
                      </span>
                    ) : (
                      <span className="text-green-700 font-semibold text-[11px]">
                        No Pending Dues
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCreditCustomerForLedger(selectedCustomer);
                      setShowLedgerModal(true);
                    }}
                    className="text-[10px] text-milquu-blue underline font-bold hover:text-blue-900"
                  >
                    View Ledger
                  </button>
                </div>
              )}
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
              <div className="space-y-1.5 mb-3">
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
                <div className="flex justify-between text-xl pt-2 border-t border-gray-100 mt-1">
                  <span className="font-bold text-milquu-dark">Total</span>
                  <span className={`font-bold ${paymentMethod === 'Credit' ? 'text-amber-600' : 'text-green-600'}`}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selection (Cash, Card, UPI, Credit / Khata) */}
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Method</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'Cash' 
                        ? 'bg-green-600 text-white border-green-600 shadow-sm font-bold' 
                        : 'bg-green-50/60 border-green-200 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <Banknote size={16} className="mb-1" />
                    <span className="text-[11px] uppercase font-bold">Cash</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'Card' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold' 
                        : 'bg-blue-50/60 border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <CreditCard size={16} className="mb-1" />
                    <span className="text-[11px] uppercase font-bold">Card</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'UPI' 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-bold' 
                        : 'bg-purple-50/60 border-purple-200 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <Smartphone size={16} className="mb-1" />
                    <span className="text-[11px] uppercase font-bold">UPI</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Credit')}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'Credit' 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold ring-2 ring-amber-300' 
                        : 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <BookOpen size={16} className="mb-1" />
                    <span className="text-[11px] uppercase font-bold">Credit</span>
                  </button>
                </div>

                {/* Credit / Khata Billing Cycle System Options */}
                {paymentMethod === 'Credit' && (
                  <div className="mt-2.5 p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                        <Clock size={13} className="text-amber-700" />
                        Billing Cycle System
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                        Due in {billingCycle.includes('10') ? '10' : billingCycle.includes('30') ? '30' : '15'} Days
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {['10 Days', '15 Days', '30 Days'].map(cycle => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() => setBillingCycle(cycle)}
                          className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                            billingCycle === cycle
                              ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                              : 'bg-white text-gray-700 border-amber-200 hover:bg-amber-100/60'
                          }`}
                        >
                          {cycle}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-amber-900 pt-1 border-t border-amber-200/70">
                      <span>Expected Due Date:</span>
                      <span className="font-bold font-mono">
                        {new Date(Date.now() + (billingCycle.includes('10') ? 10 : billingCycle.includes('30') ? 30 : 15) * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {!customerName.trim() && (
                      <p className="text-[10px] text-red-600 font-semibold">
                        ⚠️ Please enter customer name above to assign credit.
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center shadow-md transition-all cursor-pointer ${
                  cart.length > 0 && !isSubmitting
                    ? paymentMethod === 'Credit' 
                      ? 'bg-amber-700 text-white hover:bg-amber-800' 
                      : 'bg-milquu-dark text-white hover:bg-gray-800' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Printer size={18} className="mr-2" /> 
                    {paymentMethod === 'Credit' ? 'Record Credit Bill & Print' : 'Generate & Print Bill'}
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CREDIT CUSTOMERS (KHATA / UDHAR) VIEW                 */}
      {/* ============================================================ */}
      {activeTab === 'credit' && (
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
            {/* Card 1: Total Outstanding */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Credit Outstanding</p>
                <h3 className="text-2xl font-bold text-amber-700 mt-1">₹{creditSummary.totalCreditOutstanding?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{creditSummary.customersWithDuesCount || 0} customers with active dues</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Banknote size={24} />
              </div>
            </div>

            {/* Card 2: Registered Credit Accounts */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Customers</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{creditSummary.totalCreditCustomers || 0} Accounts</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Fixed dairy customer ledger</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-milquu-blue flex items-center justify-center">
                <User size={24} />
              </div>
            </div>

            {/* Card 3: Overdue Accounts */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overdue Accounts</p>
                <h3 className={`text-2xl font-bold mt-1 ${creditSummary.overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {creditSummary.overdueCount || 0} Accounts
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{creditSummary.dueSoonCount || 0} accounts due within 3 days</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${creditSummary.overdueCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <AlertCircle size={24} />
              </div>
            </div>

            {/* Card 4: Billing Cycles Breakdown */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Billing Cycles Breakdown</p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                  10 Days: {creditSummary.cycleBreakdown?.['10 Days'] || 0}
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
                  15 Days: {creditSummary.cycleBreakdown?.['15 Days'] || 0}
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                  30 Days: {creditSummary.cycleBreakdown?.['30 Days'] || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={creditSearch}
                onChange={(e) => setCreditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            {/* Cycle Filters */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
                <Filter size={13} /> Filter:
              </span>
              {[
                { id: 'ALL', label: 'All Cycles' },
                { id: '10 Days', label: '10 Days' },
                { id: '15 Days', label: '15 Days' },
                { id: '30 Days', label: '30 Days' },
                { id: 'OVERDUE', label: 'Overdue Only' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setCreditCycleFilter(item.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    creditCycleFilter === item.id
                      ? item.id === 'OVERDUE'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-amber-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Sort Selector */}
              <select
                value={creditSort}
                onChange={(e) => setCreditSort(e.target.value)}
                className="ml-2 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-amber-500 text-gray-700"
              >
                <option value="dues_desc">Highest Dues First</option>
                <option value="due_date_asc">Soonest Due Date</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Customer Cards & Ledger Table */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {filteredCreditCustomers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCreditCustomers.map(customer => {
                  const hasDues = customer.totalDue > 0;
                  const isOverdue = customer.status === 'Overdue';
                  const isDueSoon = customer.status === 'Due Soon';

                  return (
                    <div 
                      key={customer.customerId}
                      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Top Info */}
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-milquu-blue/10 text-milquu-blue flex items-center justify-center font-bold font-serif text-base">
                              {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{customer.name}</h4>
                              {customer.phone ? (
                                <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                  <Phone size={12} className="text-gray-400" /> {customer.phone}
                                </p>
                              ) : (
                                <p className="text-[11px] text-gray-400 italic">No phone recorded</p>
                              )}
                            </div>
                          </div>

                          {/* Billing Cycle Badge */}
                          <button
                            onClick={() => handleOpenEditCycle(customer)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            title="Click to change billing system"
                          >
                            <Clock size={11} />
                            <span>{customer.billingCycle || '15 Days'}</span>
                            <Edit3 size={10} className="opacity-60" />
                          </button>
                        </div>

                        {/* Financial Metrics */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 my-3 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Outstanding Balance</span>
                            <span className={`text-xl font-bold font-mono ${hasDues ? 'text-amber-700' : 'text-green-600'}`}>
                              ₹{customer.totalDue?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Unpaid Bills</span>
                            <span className="text-sm font-bold text-gray-700">
                              {customer.unpaidCount || 0} Bills
                            </span>
                          </div>
                        </div>

                        {/* Status & Due Date */}
                        <div className="flex justify-between items-center text-xs mb-3">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar size={13} className="text-gray-400" />
                            Next Due:
                          </span>
                          <span className="font-semibold text-gray-800 font-mono">
                            {customer.nextDueDate ? new Date(customer.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No dues pending'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs text-gray-500">Account Status:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isDueSoon
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : hasDues
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {customer.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                        {/* New Bill Button */}
                        <button
                          type="button"
                          onClick={() => handleStartBillForCustomer(customer)}
                          className="flex-1 py-1.5 px-2 bg-milquu-blue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-800 transition-colors cursor-pointer"
                          title="Open POS Terminal with this customer selected"
                        >
                          <Plus size={13} />
                          <span>Bill Now</span>
                        </button>

                        {/* View Ledger / Bills */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCreditCustomerForLedger(customer);
                            setShowLedgerModal(true);
                          }}
                          className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="View all unpaid bills and items"
                        >
                          <FileText size={13} />
                          <span>Ledger</span>
                        </button>

                        {/* Settle / Collect Payment */}
                        {hasDues && (
                          <button
                            type="button"
                            onClick={() => handleOpenSettleModal(customer)}
                            className="py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Collect cash, UPI or card payment against Khata"
                          >
                            <Banknote size={13} />
                            <span>Settle</span>
                          </button>
                        )}

                        {/* WhatsApp Reminder */}
                        {hasDues && customer.phone && (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(customer)}
                            className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Send WhatsApp payment reminder"
                          >
                            <MessageCircle size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-gray-400">
                <BookOpen size={48} className="mb-3 opacity-20" />
                <p className="font-semibold text-gray-600">No credit customer records match your filter</p>
                <p className="text-xs text-gray-400 mt-1">Add regular customers with a 10, 15, or 30 days billing system to see them here.</p>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="mt-4 px-4 py-2 bg-milquu-blue text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-800"
                >
                  <UserPlus size={14} className="inline mr-1" /> Add Credit Customer
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD REGULAR CUSTOMER                                */}
      {/* ============================================================ */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowAddCustomerModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-milquu-blue flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Regular Customer</h3>
                <p className="text-xs text-gray-500">Configure customer details & credit billing system</p>
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number (Required for Credit)</label>
                <input 
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono"
                />
              </div>

              {/* Billing System Selection (10 Days, 15 Days, 30 Days, None) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Billing Cycle System (Khata Terms) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['10 Days', '15 Days', '30 Days'].map(cycle => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setNewCustomer({ ...newCustomer, billingCycle: cycle, isCreditCustomer: true })}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        newCustomer.billingCycle === cycle
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Customer will be scheduled for billing reconciliation every {newCustomer.billingCycle}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Address / Society</label>
                <input 
                  type="text"
                  placeholder="e.g. Flat 402, Sector 6, New Panvel"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Credit Limit (₹ Optional)</label>
                <input 
                  type="number"
                  placeholder="e.g. 5000 (0 for unlimited)"
                  value={newCustomer.creditLimit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-5 py-2 bg-milquu-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCustomer ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CUSTOMER KHATA / LEDGER BILLS MODAL                 */}
      {/* ============================================================ */}
      {showLedgerModal && selectedCreditCustomerForLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-600" />
                  Khata Ledger: {selectedCreditCustomerForLedger.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedCreditCustomerForLedger.phone || 'Walk-in'} • {selectedCreditCustomerForLedger.billingCycle || '15 Days'} Cycle
                </p>
              </div>
              <button 
                onClick={() => setShowLedgerModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Total Summary Banner */}
            <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-amber-800 block">Total Unpaid Balance:</span>
                <span className="text-2xl font-bold text-amber-900 font-mono">
                  ₹{selectedCreditCustomerForLedger.totalDue?.toFixed(2) || '0.00'}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowLedgerModal(false);
                  handleOpenSettleModal(selectedCreditCustomerForLedger);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Settle Full / Partial Dues
              </button>
            </div>

            {/* Bills List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedCreditCustomerForLedger.orders && selectedCreditCustomerForLedger.orders.length > 0 ? (
                selectedCreditCustomerForLedger.orders.map((ord, idx) => (
                  <div key={ord._id || idx} className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-gray-800">
                          Bill #{ord.orderId ? ord.orderId.toString().slice(-6) : `POS-${idx + 1}`}
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Date: {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-amber-700 font-mono">₹{ord.totalPrice?.toFixed(2)}</span>
                        <p className="text-[10px] text-gray-500">
                          Due: {ord.creditDueDate ? new Date(ord.creditDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="bg-gray-50 p-2 rounded-lg text-xs space-y-1 mb-2">
                        {ord.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-gray-600">
                            <span>{it.name} (x{it.qty})</span>
                            <span className="font-mono">₹{it.price * it.qty}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleMarkOrderPaid(ord._id || ord.orderId)}
                        className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        ✓ Mark This Bill Paid
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <CheckCircle2 size={40} className="mx-auto mb-2 text-green-500 opacity-60" />
                  <p className="font-semibold text-gray-700">All bills are cleared!</p>
                  <p className="text-xs text-gray-400">This customer has 0 outstanding balance.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: PAYMENT SETTLEMENT MODAL                            */}
      {/* ============================================================ */}
      {showSettleModal && selectedCreditCustomerForSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowSettleModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Banknote size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Record Khata Payment</h3>
                <p className="text-xs text-gray-500">{selectedCreditCustomerForSettlement.name} ({selectedCreditCustomerForSettlement.phone || 'Walk-in'})</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4 flex justify-between items-center">
              <span className="text-xs text-amber-800">Current Outstanding:</span>
              <span className="text-lg font-bold text-amber-950 font-mono">
                ₹{selectedCreditCustomerForSettlement.totalDue?.toFixed(2)}
              </span>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Payment Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-base font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Card'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSettlePaymentMethod(mode)}
                      className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        settlePaymentMethod === mode
                          ? 'bg-green-600 text-white border-green-600 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSettling}
                  className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSettling ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: EDIT BILLING CYCLE MODAL                            */}
      {/* ============================================================ */}
      {showEditCycleModal && selectedCustomerForEditCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setShowEditCycleModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-milquu-blue flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Change Billing System</h3>
                <p className="text-xs text-gray-500">{selectedCustomerForEditCycle.name}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateCycleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Billing Cycle Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['10 Days', '15 Days', '30 Days'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditCycleValue(c)}
                      className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        editCycleValue === c
                          ? 'bg-milquu-blue text-white border-milquu-blue shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Credit Limit (₹)
                </label>
                <input
                  type="number"
                  placeholder="0 for unlimited"
                  value={editCreditLimit}
                  onChange={(e) => setEditCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditCycleModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCycle}
                  className="px-5 py-2 bg-milquu-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingCycle ? 'Saving...' : 'Update System'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: PRINTABLE RECEIPT MODAL                             */}
      {/* ============================================================ */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header Controls (hidden when printing) */}
            <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center print:hidden">
              <span className="text-xs font-bold text-gray-600">Bill Generated Successfully</span>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
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
                  {completedOrder.isCredit ? (
                    <span className="font-bold text-amber-700">CREDIT / KHATA ({completedOrder.billingCycle} Cycle)</span>
                  ) : (
                    <span className="font-bold text-green-700">{completedOrder.paymentMethod} (PAID)</span>
                  )}
                </div>
                {completedOrder.isCredit && completedOrder.creditDueDate && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Payment Due:</span>
                    <span className="font-bold text-red-600">{completedOrder.creditDueDate}</span>
                  </div>
                )}
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
                  <span className={completedOrder.isCredit ? 'text-amber-700' : 'text-green-700'}>
                    ₹{completedOrder.total.toFixed(2)}
                  </span>
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
                className="flex-1 py-2.5 bg-milquu-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
              >
                <Printer size={15} /> Print Bill
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Next Sale
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Thermal receipt printing stylesheet */}
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
