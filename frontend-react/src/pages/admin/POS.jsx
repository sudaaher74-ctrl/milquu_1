import React, { useState, useEffect, useRef } from 'react';
import { Barcode, Search, Plus, Minus, Trash2, Printer, CreditCard, Banknote, Smartphone, Store, Calculator, User, Phone, UserPlus, X, FileText, BookOpen, Clock, RefreshCw, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import CreditCustomersTab from './pos/CreditCustomersTab';
import QuantityModal from './pos/QuantityModal';
import AddCustomerModal from './pos/AddCustomerModal';
import CustomerLedgerModal from './pos/CustomerLedgerModal';
import SettlementModal from './pos/SettlementModal';
import BillingCycleModal from './pos/BillingCycleModal';
import ReceiptModal from './pos/ReceiptModal';
import DailyRegisterModal from './pos/DailyRegisterModal';
import EditCustomerModal from './pos/EditCustomerModal';
import MilkInvoiceModal from './pos/MilkInvoiceModal';
import CustomerKhataDetail from './pos/CustomerKhataDetail';
import { DAIRY_KHATA_BANK_DETAILS } from '../../utils/khataPaymentConfig';
import toast from '../../utils/toast';

const POS = () => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'credit'
  const [selectedKhataCustomerForDetail, setSelectedKhataCustomerForDetail] = useState(null);

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
  const customerInputRef = useRef(null);
  const [customerNameError, setCustomerNameError] = useState(false);

  // Dedicated Daily Milk Register Modal State
  const [showDailyRegisterModal, setShowDailyRegisterModal] = useState(false);
  const [dailyRegisterData, setDailyRegisterData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    productId: '',
    productName: '',
    unit: '1 Litre',
    price: 54,
    qty: 1,
    shift: 'Morning',
    date: new Date().toISOString().split('T')[0],
    notes: 'Daily milk supply'
  });
  const [isSubmittingDailyRegister, setIsSubmittingDailyRegister] = useState(false);

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

  // Edit Customer Modal State
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [isSavingCustomerEdit, setIsSavingCustomerEdit] = useState(false);

  // Milk Invoice Bill Modal State
  const [selectedCustomerForInvoice, setSelectedCustomerForInvoice] = useState(null);
  const [showMilkInvoiceModal, setShowMilkInvoiceModal] = useState(false);

  // Manual / Custom Quantity Modal State
  const [qtyModalItem, setQtyModalItem] = useState(null);
  const [customQtyInput, setCustomQtyInput] = useState('');
  const qtyInputRef = useRef(null);

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
      const [adminRes, creditRes] = await Promise.allSettled([
        api.get('/api/admin/customers'),
        api.get('/api/erp/credit-customers')
      ]);

      const map = new Map();

      if (adminRes.status === 'fulfilled' && adminRes.value?.data?.topCustomers) {
        adminRes.value.data.topCustomers.forEach(c => {
          const key = (c.phone || c.name || c._id || '').toString().trim();
          if (key) {
            map.set(key, { ...c, id: c._id });
          }
        });
      }

      if (creditRes.status === 'fulfilled' && creditRes.value?.data?.customers) {
        creditRes.value.data.customers.forEach(c => {
          const key = (c.phone || c.name || c.customerId || c.userId || '').toString().trim();
          if (key) {
            const existing = map.get(key) || {};
            map.set(key, {
              ...existing,
              ...c,
              id: c.customerId || c.userId || c._id,
              isCreditCustomer: true
            });
          }
        });
      }

      const mergedList = Array.from(map.values());
      setCustomerList(mergedList);
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

  // Helper: check if product is milk
  const isMilkProduct = (product) => {
    if (!product) return false;
    const cat = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    return cat === 'milk' || name.includes('milk');
  };

  // Barcode Handler
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product, '1L');
      setBarcodeInput('');
    } else {
      toast.error('Product not found!');
    }
  };

  // Cart operations
  const addToCart = (product, targetUnit = null) => {
    const isMilk = isMilkProduct(product);
    const unit = isMilk ? (targetUnit || '1L') : (product.unit || 'Standard');
    const isHalf = isMilk && (unit === '500 ml' || unit === '500ml');
    
    // Unique cart item ID based on unit variant
    const itemId = isMilk ? `${product.id}-${isHalf ? '500ml' : '1L'}` : product.id;
    const effectivePrice = isHalf ? Math.ceil(product.price / 2) : product.price;
    const variantName = isMilk 
      ? (isHalf 
          ? (product.name.includes('500') ? product.name : `${product.name} (500 ml)`)
          : (product.name.includes('1L') || product.name.includes('1 Litre') ? product.name : `${product.name} (1L)`))
      : product.name;

    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
      setCart(cart.map(item => item.id === itemId ? { ...item, qty: (parseFloat(item.qty) || 0) + 1 } : item));
    } else {
      setCart([...cart, { 
        ...product, 
        id: itemId, 
        baseProductId: product.id,
        name: variantName, 
        unit: isHalf ? '500 ml' : (isMilk ? '1 Litre' : (product.unit || 'Standard')),
        price: effectivePrice, 
        basePrice: product.price,
        isMilk,
        qty: 1 
      }]);
    }
  };

  // Switch unit between 1L and 500ml for a milk item directly in the cart
  const switchItemUnit = (cartItemId, newUnit) => {
    const item = cart.find(i => i.id === cartItemId);
    if (!item || !item.isMilk) return;
    const isNowHalf = newUnit === '500 ml' || newUnit === '500ml';
    const baseId = item.baseProductId || (typeof item.id === 'string' && item.id.includes('-') ? item.id.split('-')[0] : item.id);
    const newCartId = `${baseId}-${isNowHalf ? '500ml' : '1L'}`;
    const newPrice = isNowHalf ? Math.ceil(item.basePrice / 2) : item.basePrice;
    
    // Base product name without variant suffix
    const rawName = item.name.replace(/\s*\((500\s*ml|1L|1\s*Litre)\)/gi, '').trim();
    const newName = isNowHalf ? `${rawName} (500 ml)` : `${rawName} (1L)`;
    const newUnitText = isNowHalf ? '500 ml' : '1 Litre';

    // If an item with newCartId already exists in cart, merge quantities
    const existingWithNewId = cart.find(i => i.id === newCartId && i.id !== cartItemId);
    if (existingWithNewId) {
      setCart(cart.filter(i => i.id !== cartItemId).map(i => {
        if (i.id === newCartId) {
          return { ...i, qty: (parseFloat(i.qty) || 0) + (parseFloat(item.qty) || 1) };
        }
        return i;
      }));
    } else {
      setCart(cart.map(i => {
        if (i.id === cartItemId) {
          return {
            ...i,
            id: newCartId,
            name: newName,
            unit: newUnitText,
            price: newPrice
          };
        }
        return i;
      }));
    }
  };

  const updateQty = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const currentQty = typeof item.qty === 'number' ? item.qty : (parseFloat(item.qty) || 1);
        const newQty = Math.max(1, currentQty + change);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handleDirectQtyChange = (id, rawValue) => {
    if (rawValue === '') {
      setCart(cart.map(item => item.id === id ? { ...item, qty: '' } : item));
      return;
    }
    const val = parseFloat(rawValue);
    if (!isNaN(val) && val >= 0) {
      setCart(cart.map(item => item.id === id ? { ...item, qty: val } : item));
    }
  };

  const handleDirectQtyBlur = (id, rawValue) => {
    const val = parseFloat(rawValue);
    const finalQty = (!isNaN(val) && val > 0) ? val : 1;
    setCart(cart.map(item => item.id === id ? { ...item, qty: finalQty } : item));
  };

  const addBulkQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const currentQty = typeof item.qty === 'number' ? item.qty : (parseFloat(item.qty) || 1);
        return { ...item, qty: currentQty + delta };
      }
      return item;
    }));
  };

  const openQtyModal = (item) => {
    setQtyModalItem(item);
    setCustomQtyInput(String(item.qty || 1));
    setTimeout(() => {
      if (qtyInputRef.current) {
        qtyInputRef.current.focus();
        qtyInputRef.current.select();
      }
    }, 60);
  };

  const handleSaveCustomQty = (e) => {
    if (e) e.preventDefault();
    if (!qtyModalItem) return;
    const val = parseFloat(customQtyInput);
    if (isNaN(val) || val <= 0) {
      toast('Please enter a valid quantity greater than 0');
      return;
    }
    setCart(cart.map(i => i.id === qtyModalItem.id ? { ...i, qty: val } : i));
    setQtyModalItem(null);
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => {
      const q = typeof item.qty === 'number' ? item.qty : (parseFloat(item.qty) || 0);
      return acc + (item.price * q);
    }, 0);
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
    setCustomerId(c._id || c.id || c.customerId || c.userId || null);
    setSelectedCustomer(c);
    setCustomerNameError(false);
    
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
    setCustomerNameError(false);
    setPaymentMethod('Cash');
    setBillingCycle('15 Days');
  };

  // Rapid Daily Milk Register Submission to Khata
  const handleDailyRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!dailyRegisterData.customerName.trim()) {
      toast('Please select or enter customer name for daily milk entry.');
      return;
    }
    const qty = parseFloat(dailyRegisterData.qty);
    if (!qty || qty <= 0) {
      toast('Please enter a valid quantity greater than 0.');
      return;
    }

    setIsSubmittingDailyRegister(true);
    try {
      const selectedProd = products.find(p => p.id === dailyRegisterData.productId) || products.find(isMilkProduct) || products[0];
      const prodName = dailyRegisterData.productName || selectedProd?.name || 'Cow Milk (Pouch)';
      const unit = dailyRegisterData.unit || (prodName.includes('500') ? '500 ml' : '1 Litre');
      const rate = Number(dailyRegisterData.price) || (selectedProd ? (unit.includes('500') ? Math.ceil(selectedProd.price / 2) : selectedProd.price) : 54);
      const totalAmount = rate * qty;

      const payload = {
        user: dailyRegisterData.customerId || undefined,
        name: dailyRegisterData.customerName.trim(),
        phone: dailyRegisterData.customerPhone?.trim() || undefined,
        orderItems: [{
          product: selectedProd?.id || undefined,
          name: `${prodName} (${unit})`,
          price: rate,
          unit: unit,
          qty: qty,
          image: selectedProd?.image || '/img/categories/logo.png'
        }],
        discount: 0,
        totalPrice: totalAmount,
        paymentMethod: 'Credit',
        billingCycle: '15 Days',
        orderSource: 'POS',
        notes: `[Daily Milk Register - ${dailyRegisterData.shift}] Date: ${dailyRegisterData.date} | ${dailyRegisterData.notes || ''}`.trim()
      };

      await api.post('/api/erp/orders', payload);

      // Refresh credit records & customer list
      fetchCreditCustomers();
      fetchCustomers();

      toast(`✅ Recorded ${qty} ${unit} ${prodName} for ${dailyRegisterData.customerName} on Credit (₹${totalAmount}) successfully!`);

      // Reset form
      setDailyRegisterData(prev => ({
        ...prev,
        qty: 1,
        notes: 'Daily milk supply'
      }));
      setShowDailyRegisterModal(false);
    } catch (err) {
      console.error('Error submitting daily milk register:', err);
      toast.error(err.response?.data?.message || 'Failed to submit daily milk entry');
    } finally {
      setIsSubmittingDailyRegister(false);
    }
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
      toast('Please enter customer name');
      return;
    }
    setIsSavingCustomer(true);
    try {
      const payload = {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone?.trim() || undefined,
        address: newCustomer.address?.trim() || '',
        billingCycle: newCustomer.billingCycle || '15 Days',
        isCreditCustomer: newCustomer.billingCycle !== 'none',
        creditLimit: Number(newCustomer.creditLimit) || 0
      };
      if (newCustomer.email && newCustomer.email.trim()) {
        payload.email = newCustomer.email.trim();
      }
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
      toast(`Customer "${data.name}" added successfully with ${data.billingCycle || '15 Days'} billing system!`);
    } catch (err) {
      console.error('Error adding customer:', err);
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast('Please add products to cart before generating a bill.');
      return;
    }

    const isCredit = paymentMethod === 'Credit';
    if (isCredit && !customerName.trim()) {
      setCustomerNameError(true);
      if (customerInputRef.current) {
        customerInputRef.current.focus();
        customerInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast('Please enter or select a customer name for Credit / Khata billing so the milk entry is recorded to their account.');
      return;
    }
    setCustomerNameError(false);

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

    const sanitizedCart = cart.map(item => ({
      ...item,
      qty: Math.max(1, parseFloat(item.qty) || 1)
    }));

    const payload = {
      user: customerId || undefined,
      name: finalCustomerName,
      phone: finalCustomerPhone || undefined,
      orderItems: sanitizedCart.map(item => ({
        product: item.baseProductId || (typeof item.id === 'string' && item.id.includes('-') ? item.id.split('-')[0] : item.id),
        name: item.name,
        price: item.price,
        unit: item.unit || (item.name?.includes('500') ? '500 ml' : '1 Litre'),
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
        items: [...sanitizedCart],
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
        items: [...sanitizedCart],
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
      toast.error('No valid 10-digit mobile number found for this customer.');
      return;
    }
    const cycleText = cust.billingCycle || '15 Days';
    const dueText = cust.nextDueDate 
      ? new Date(cust.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'the scheduled due date';
    const totalDueFormatted = cust.totalDue?.toFixed(2) || '0.00';

    const message = `Namaste ${cust.name || 'Sir/Madam'}, greetings from MilQuu Fresh! 🥛\n\n` +
      `This is a friendly reminder that your milk & dairy credit bill for the ${cycleText} billing cycle is *₹${totalDueFormatted}*.\n` +
      `Payment Due Date: ${dueText}.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💳 *PAYMENT DETAILS (UPI & BANK)*\n` +
      `📲 *UPI ID:* ${DAIRY_KHATA_BANK_DETAILS.upiId}\n` +
      `🏦 *Bank:* ${DAIRY_KHATA_BANK_DETAILS.bankName}\n` +
      `👤 *Account Holder:* ${DAIRY_KHATA_BANK_DETAILS.accountHolder}\n` +
      `🔢 *Account Number:* ${DAIRY_KHATA_BANK_DETAILS.accountNumber}\n` +
      `🏛️ *Branch IFSC:* ${DAIRY_KHATA_BANK_DETAILS.ifscCode}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Kindly clear at your convenience via UPI, Bank Transfer, or Cash. Please share payment screenshot once paid.\n` +
      `Thank you for choosing pure & fresh MilQuu Fresh! 🙏`;
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
      toast('Please enter a valid payment amount.');
      return;
    }
    setIsSettling(true);
    try {
      await api.post(`/api/erp/credit-customers/${selectedCreditCustomerForSettlement.customerId}/settle`, {
        amount,
        paymentMethod: settlePaymentMethod
      });
      toast(`Payment of ₹${amount} recorded successfully via ${settlePaymentMethod}!`);
      setShowSettleModal(false);
      setSelectedCreditCustomerForSettlement(null);
      setSettleAmount('');
      fetchCreditCustomers();
    } catch (err) {
      console.error('Settlement error:', err);
      toast.error(err.response?.data?.message || 'Failed to process settlement');
    } finally {
      setIsSettling(false);
    }
  };

  // Mark Individual Order as Paid from Ledger
  const handleMarkOrderPaid = async (orderId) => {
    if (!confirm('Mark this specific bill as paid?')) return;
    try {
      await api.put(`/api/erp/orders/${orderId}/pay`, { paymentMethod: 'Cash' });
      toast('Bill marked as paid successfully!');
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
      toast.error('Failed to mark order as paid');
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
      toast('This is a walk-in record without a registered customer account. Please add them as a regular customer first.');
      return;
    }
    setIsUpdatingCycle(true);
    try {
      await api.put(`/api/admin/customers/${selectedCustomerForEditCycle.userId}`, {
        billingCycle: editCycleValue,
        isCreditCustomer: editCycleValue !== 'none',
        creditLimit: Number(editCreditLimit) || 0
      });
      toast(`Customer billing cycle updated to ${editCycleValue}!`);
      setShowEditCycleModal(false);
      fetchCreditCustomers();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update billing cycle');
    } finally {
      setIsUpdatingCycle(false);
    }
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (cust) => {
    setSelectedCustomerForEdit(cust);
    setShowEditCustomerModal(true);
  };

  // Submit Customer Edit (Name, Phone, Address, Cycle, Limit, Notes)
  const handleSaveCustomerEdit = async (formData) => {
    const custId = formData.id;
    if (!custId) {
      toast.error('Customer ID missing');
      return;
    }
    setIsSavingCustomerEdit(true);
    try {
      await api.put(`/api/admin/customers/${custId}`, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        billingCycle: formData.billingCycle,
        isCreditCustomer: formData.billingCycle !== 'none',
        creditLimit: formData.creditLimit !== '' ? Number(formData.creditLimit) : 0,
        creditNotes: formData.creditNotes
      });
      toast.success('Customer details updated successfully!');
      setShowEditCustomerModal(false);
      fetchCreditCustomers();
      fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error(err.response?.data?.message || 'Failed to update customer details');
    } finally {
      setIsSavingCustomerEdit(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (cust) => {
    const custId = cust.customerId || cust.userId || cust._id;
    if (!custId) {
      toast.error('Customer ID not found');
      return;
    }
    try {
      await api.delete(`/api/admin/customers/${custId}`);
      toast.success(`Customer ${cust.name || ''} deleted successfully`);
      setShowEditCustomerModal(false);
      fetchCreditCustomers();
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error(err.response?.data?.message || 'Failed to delete customer');
      throw err;
    }
  };

  // Open Milk Invoice Modal
  const handleOpenInvoiceModal = (cust) => {
    setSelectedCustomerForInvoice(cust);
    setShowMilkInvoiceModal(true);
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
              onClick={() => {
                setActiveTab('terminal');
                setSelectedKhataCustomerForDetail(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'terminal' && !selectedKhataCustomerForDetail
                  ? 'bg-white text-milquu-dark shadow-sm'
                  : 'text-gray-500 hover:text-milquu-dark'
              }`}
            >
              <Store size={15} className={activeTab === 'terminal' && !selectedKhataCustomerForDetail ? 'text-milquu-blue' : ''} />
              <span>POS Billing</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('credit');
                setSelectedKhataCustomerForDetail(null);
                fetchCreditCustomers();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'credit' && !selectedKhataCustomerForDetail
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

          {/* Daily Milk Register Button */}
          <button
            onClick={() => {
              if (selectedCustomer) {
                setDailyRegisterData(prev => ({
                  ...prev,
                  customerId: selectedCustomer._id || selectedCustomer.id || selectedCustomer.customerId || selectedCustomer.userId || '',
                  customerName: selectedCustomer.name || '',
                  customerPhone: selectedCustomer.phone || ''
                }));
              }
              const milkProd = products.find(isMilkProduct) || products[0];
              if (milkProd) {
                setDailyRegisterData(prev => ({
                  ...prev,
                  productId: milkProd.id,
                  productName: milkProd.name,
                  price: milkProd.price,
                  unit: '1 Litre'
                }));
              }
              setShowDailyRegisterModal(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:from-amber-700 hover:to-amber-800 transition-all cursor-pointer"
            title="Open Daily Milk Register for Credit Customers"
          >
            <span>🥛</span>
            <span>Daily Milk Register</span>
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
      {/* CONDITIONAL: KHATA CUSTOMER DETAIL & CALENDAR VIEW           */}
      {/* ============================================================ */}
      {selectedKhataCustomerForDetail ? (
        <CustomerKhataDetail
          customerId={selectedKhataCustomerForDetail.customerId || selectedKhataCustomerForDetail.userId || selectedKhataCustomerForDetail._id || selectedKhataCustomerForDetail.id}
          onBack={() => {
            setSelectedKhataCustomerForDetail(null);
            fetchCreditCustomers();
          }}
        />
      ) : (
        <>
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
                {filteredProducts.map(product => {
                  const isMilk = isMilkProduct(product);
                  const cart1L = cart.find(i => i.id === `${product.id}-1L` || (!isMilk && i.id === product.id));
                  const cart500 = cart.find(i => i.id === `${product.id}-500ml`);
                  const nonMilkCart = !isMilk && cart.find(i => i.id === product.id);

                  return (
                    <div 
                      key={product.id}
                      className="relative bg-white p-3 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-milquu-blue/60 transition-all flex flex-col items-center text-center group"
                    >
                      {/* Active in-bill badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                        {isMilk && cart1L && (
                          <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                            {cart1L.qty}× 1L
                          </span>
                        )}
                        {isMilk && cart500 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                            {cart500.qty}× 500ml
                          </span>
                        )}
                        {!isMilk && nonMilkCart && (
                          <span className="bg-amber-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            {nonMilkCart.qty} in bill
                          </span>
                        )}
                      </div>

                      <div className="h-20 w-20 bg-gray-50 rounded-xl mb-2 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                        <img src={product.image || '/img/categories/logo.png'} alt={product.name} className="max-h-full max-w-full mix-blend-multiply object-contain" />
                      </div>
                      
                      <h3 className="text-xs font-bold text-gray-800 leading-tight mb-2 line-clamp-2 h-8 flex items-center justify-center">
                        {product.name}
                      </h3>

                      {isMilk ? (
                        <div className="w-full mt-auto space-y-1.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            {/* 1 Litre button */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); addToCart(product, '1L'); }}
                              className="py-1.5 px-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 border border-blue-200 hover:border-blue-600 rounded-xl transition-all cursor-pointer flex flex-col items-center shadow-2xs group/btn"
                              title={`Add 1 Litre ${product.name}`}
                            >
                              <span className="text-[11px] font-extrabold leading-none">1 Litre</span>
                              <span className="text-[12px] font-black text-blue-900 group-hover/btn:text-white mt-0.5">₹{product.price}</span>
                            </button>

                            {/* 500 ml button */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); addToCart(product, '500 ml'); }}
                              className="py-1.5 px-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 hover:border-emerald-600 rounded-xl transition-all cursor-pointer flex flex-col items-center shadow-2xs group/btn"
                              title={`Add 500 ml ${product.name}`}
                            >
                              <span className="text-[11px] font-extrabold leading-none">500 ml</span>
                              <span className="text-[12px] font-black text-emerald-900 group-hover/btn:text-white mt-0.5">₹{Math.ceil(product.price / 2)}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full mt-auto">
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="w-full py-2 bg-gray-100 hover:bg-milquu-blue hover:text-white text-gray-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Add</span>
                            <span className="font-extrabold text-milquu-blue group-hover:text-white">₹{product.price}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Billing Cart with Customer Info & Khata Support */}
          <div className="w-full lg:w-[420px] xl:w-[460px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 h-full">
            
            {/* Header */}
            <div className="p-3.5 border-b border-gray-100 bg-milquu-dark text-white flex justify-between items-center shrink-0">
              <h2 className="text-base font-bold flex items-center gap-2">
                <FileText size={18} /> Current Bill
              </h2>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">{cart.length} Items</span>
            </div>

            {/* Scrollable Middle Container: Customer + Cart Items + Payment Mode & Discounts */}
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-100">

              {/* Customer Selection Section */}
              <div className="p-3.5 bg-gray-50/80" ref={customerDropdownRef}>
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
                        ref={customerInputRef}
                        type="text" 
                        placeholder="Search or enter customer name..." 
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setCustomerNameError(false);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:outline-none font-semibold text-gray-800 shadow-xs transition-all ${
                          customerNameError 
                            ? 'border-red-500 ring-2 ring-red-200 bg-red-50/40 text-red-900 placeholder:text-red-400' 
                            : 'border-gray-200 focus:border-milquu-blue'
                        }`}
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
                            key={c._id || c.id || c.customerId || c.userId}
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
                              {c.totalDue > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                                  Due: ₹{c.totalDue}
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
                          No matching customer. Type name to bill as custom/guest account.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Select Customer Dropdown */}
                <select
                  onChange={(e) => {
                    if (!e.target.value) {
                      handleClearCustomer();
                      return;
                    }
                    const found = customerList.find(c => (c._id || c.id || c.customerId || c.userId) === e.target.value);
                    if (found) selectCustomer(found);
                  }}
                  value={selectedCustomer?._id || selectedCustomer?.id || selectedCustomer?.customerId || selectedCustomer?.userId || ''}
                  className="w-full mt-2 text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:border-milquu-blue cursor-pointer"
                >
                  <option value="">-- Quick Select from Registered Customers --</option>
                  {customerList.map((c) => (
                    <option key={c._id || c.id || c.customerId || c.userId} value={c._id || c.id || c.customerId || c.userId}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} {c.totalDue > 0 ? `— Due: ₹${c.totalDue}` : ''}
                    </option>
                  ))}
                </select>

                {/* Quick Frequent Customer Chips */}
                {customerList.filter(c => c.isCreditCustomer || c.totalDue > 0).slice(0, 4).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mr-0.5">Frequent:</span>
                    {customerList.filter(c => c.isCreditCustomer || c.totalDue > 0).slice(0, 4).map((c) => (
                      <button
                        key={c._id || c.id || c.customerId || c.userId}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

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
              <div className="p-2 bg-gray-50/30">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3 bg-white mb-2 rounded-xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-gray-800 leading-tight">{item.name}</h4>
                            {item.unit && (
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-2xs ${
                                item.unit.includes('500') 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}>
                                {item.unit}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">₹{item.price} / unit</p>

                          {/* 1L / 500ml quick toggle in cart row for milk products */}
                          {item.isMilk && (
                            <div className="inline-flex rounded-lg border border-gray-200 mt-1 bg-gray-50 p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => switchItemUnit(item.id, '1L')}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                                  !item.unit?.includes('500') 
                                    ? 'bg-blue-600 text-white shadow-xs' 
                                    : 'text-gray-600 hover:text-blue-700'
                                }`}
                                title="Switch to 1 Litre"
                              >
                                1L (₹{item.basePrice || item.price})
                              </button>
                              <button
                                type="button"
                                onClick={() => switchItemUnit(item.id, '500 ml')}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                                  item.unit?.includes('500') 
                                    ? 'bg-emerald-600 text-white shadow-xs' 
                                    : 'text-gray-600 hover:text-emerald-700'
                                }`}
                                title="Switch to 500 ml"
                              >
                                500ml (₹{Math.ceil((item.basePrice || item.price * 2) / 2)})
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Qty Controls with direct manual numeric input */}
                          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <button 
                              type="button"
                              onClick={() => updateQty(item.id, -1)} 
                              className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                              title="Decrease quantity by 1"
                            >
                              <Minus size={14}/>
                            </button>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={item.qty}
                              onChange={(e) => handleDirectQtyChange(item.id, e.target.value)}
                              onBlur={(e) => handleDirectQtyBlur(item.id, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.target.blur();
                              }}
                              className="w-12 text-center text-sm font-extrabold text-gray-900 bg-white border-x border-gray-200 focus:outline-none focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 py-0.5"
                              title="Click to type quantity directly"
                            />
                            <button 
                              type="button"
                              onClick={() => updateQty(item.id, 1)} 
                              className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                              title="Increase quantity by 1"
                            >
                              <Plus size={14}/>
                            </button>
                          </div>

                          {/* Set / Manual Qty Button */}
                          <button
                            type="button"
                            onClick={() => openQtyModal(item)}
                            className="px-2 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Manually set quantity or choose presets"
                          >
                            <Edit3 size={11} />
                            <span>Set</span>
                          </button>

                          <div className="w-16 text-right">
                            <p className="text-sm font-bold text-milquu-dark font-mono">
                              ₹{((item.price * (parseFloat(item.qty) || 0))).toFixed(2)}
                            </p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeItem(item.id)} 
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Quick Add Presets (+5, +10, +15, +30) */}
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Quick Add:</span>
                        {[5, 10, 15, 30].map(delta => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() => addBulkQty(item.id, delta)}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-50 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300 text-gray-600 border border-gray-200 transition-all cursor-pointer"
                            title={`Add +${delta} to ${item.name}`}
                          >
                            +{delta}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {cart.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                      <Calculator size={44} className="mb-3 opacity-20" />
                      <p className="font-semibold text-sm">Cart is empty</p>
                      <p className="text-xs">Click milk or products on the left to add items</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Billing Summary & Payment Methods */}
              <div className="p-3.5 bg-white space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-gray-500 font-medium">Discount (₹)</span>
                    <input 
                      type="number" 
                      min="0"
                      value={discount || ''} 
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      placeholder="0"
                      className="w-20 text-right text-xs border-b border-gray-200 focus:outline-none focus:border-milquu-blue font-bold text-red-500"
                    />
                  </div>
                </div>

                {/* Payment Mode Selection (Cash, Card, UPI, Credit / Khata) */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Method</label>
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
                      <Banknote size={15} className="mb-1" />
                      <span className="text-[10px] uppercase font-bold">Cash</span>
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
                      <CreditCard size={15} className="mb-1" />
                      <span className="text-[10px] uppercase font-bold">Card</span>
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
                      <Smartphone size={15} className="mb-1" />
                      <span className="text-[10px] uppercase font-bold">UPI</span>
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
                      <BookOpen size={15} className="mb-1" />
                      <span className="text-[10px] uppercase font-bold">Credit</span>
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
                        <p className="text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-200">
                          ⚠️ Please select or enter customer name above to assign credit.
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Pinned Sticky Bottom Action Bar - NEVER CUT OFF */}
            <div className="shrink-0 bg-white border-t border-gray-200 p-3 shadow-lg z-20 sticky bottom-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    {paymentMethod === 'Credit' ? 'Khata Total (Pay Later)' : 'Bill Total'}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {cart.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)} items ({cart.length} unique)
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black font-mono tracking-tight ${paymentMethod === 'Credit' ? 'text-amber-600' : 'text-green-600'}`}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center shadow-md transition-all cursor-pointer text-sm ${
                  cart.length > 0 && !isSubmitting
                    ? paymentMethod === 'Credit' 
                      ? 'bg-amber-700 text-white hover:bg-amber-800 ring-2 ring-amber-400 ring-offset-1' 
                      : 'bg-milquu-dark text-white hover:bg-gray-800' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Printer size={17} className="mr-2" /> 
                    {paymentMethod === 'Credit' ? 'Record Credit Bill & Submit' : 'Generate & Print Bill'}
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      <CreditCustomersTab
        activeTab={activeTab}
        creditCycleFilter={creditCycleFilter}
        creditSearch={creditSearch}
        creditSort={creditSort}
        creditSummary={creditSummary}
        filteredCreditCustomers={filteredCreditCustomers}
        handleOpenEditCycle={handleOpenEditCycle}
        handleOpenEditCustomer={handleOpenEditCustomer}
        handleDeleteCustomer={handleDeleteCustomer}
        handleOpenInvoiceModal={handleOpenInvoiceModal}
        handleOpenSettleModal={handleOpenSettleModal}
        handleSendWhatsAppReminder={handleSendWhatsAppReminder}
        handleStartBillForCustomer={handleStartBillForCustomer}
        setCreditCycleFilter={setCreditCycleFilter}
        setCreditSearch={setCreditSearch}
        setCreditSort={setCreditSort}
        setSelectedCreditCustomerForLedger={setSelectedCreditCustomerForLedger}
        setShowAddCustomerModal={setShowAddCustomerModal}
        setShowLedgerModal={setShowLedgerModal}
        handleOpenCustomerDetail={(customer) => setSelectedKhataCustomerForDetail(customer)}
      />
      </>
    )}

      <QuantityModal
        customQtyInput={customQtyInput}
        handleSaveCustomQty={handleSaveCustomQty}
        qtyInputRef={qtyInputRef}
        qtyModalItem={qtyModalItem}
        setCustomQtyInput={setCustomQtyInput}
        setQtyModalItem={setQtyModalItem}
      />

      <AddCustomerModal
        handleCreateCustomer={handleCreateCustomer}
        isSavingCustomer={isSavingCustomer}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        setShowAddCustomerModal={setShowAddCustomerModal}
        showAddCustomerModal={showAddCustomerModal}
      />

      <CustomerLedgerModal
        handleMarkOrderPaid={handleMarkOrderPaid}
        handleOpenSettleModal={handleOpenSettleModal}
        handleOpenInvoiceModal={handleOpenInvoiceModal}
        selectedCreditCustomerForLedger={selectedCreditCustomerForLedger}
        setShowLedgerModal={setShowLedgerModal}
        showLedgerModal={showLedgerModal}
      />

      <SettlementModal
        handleSettleSubmit={handleSettleSubmit}
        isSettling={isSettling}
        selectedCreditCustomerForSettlement={selectedCreditCustomerForSettlement}
        setSettleAmount={setSettleAmount}
        setSettlePaymentMethod={setSettlePaymentMethod}
        setShowSettleModal={setShowSettleModal}
        settleAmount={settleAmount}
        settlePaymentMethod={settlePaymentMethod}
        showSettleModal={showSettleModal}
      />

      <BillingCycleModal
        editCreditLimit={editCreditLimit}
        editCycleValue={editCycleValue}
        handleUpdateCycleSubmit={handleUpdateCycleSubmit}
        isUpdatingCycle={isUpdatingCycle}
        selectedCustomerForEditCycle={selectedCustomerForEditCycle}
        setEditCreditLimit={setEditCreditLimit}
        setEditCycleValue={setEditCycleValue}
        setShowEditCycleModal={setShowEditCycleModal}
        showEditCycleModal={showEditCycleModal}
      />

      <ReceiptModal
        completedOrder={completedOrder}
        handlePrint={handlePrint}
        setShowReceiptModal={setShowReceiptModal}
        showReceiptModal={showReceiptModal}
      />

      <DailyRegisterModal
        customerList={customerList}
        dailyRegisterData={dailyRegisterData}
        handleDailyRegisterSubmit={handleDailyRegisterSubmit}
        isMilkProduct={isMilkProduct}
        isSubmittingDailyRegister={isSubmittingDailyRegister}
        products={products}
        setDailyRegisterData={setDailyRegisterData}
        setShowDailyRegisterModal={setShowDailyRegisterModal}
        showDailyRegisterModal={showDailyRegisterModal}
      />

      <EditCustomerModal
        showEditModal={showEditCustomerModal}
        setShowEditModal={setShowEditCustomerModal}
        customer={selectedCustomerForEdit}
        handleSaveCustomerEdit={handleSaveCustomerEdit}
        handleDeleteCustomer={handleDeleteCustomer}
        isSaving={isSavingCustomerEdit}
      />

      <MilkInvoiceModal
        showInvoiceModal={showMilkInvoiceModal}
        setShowInvoiceModal={setShowMilkInvoiceModal}
        customer={selectedCustomerForInvoice}
      />
    </div>
  );
};

export default POS;
