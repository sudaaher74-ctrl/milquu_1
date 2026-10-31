import React, { useState, useEffect } from 'react';
import { 
  X, Banknote, Smartphone, CreditCard, TrendingUp, TrendingDown, 
  Plus, Calendar, RefreshCw, AlertTriangle, CheckCircle2, Droplet, 
  Receipt, Wallet, Trash2, ArrowUpRight, ArrowDownRight, Clock, User
} from 'lucide-react';
import api from '../../../utils/api';
import toast from '../../../utils/toast';

const EXPENSE_CATEGORIES = [
  'Packaging & Pouches',
  'Ice & Cooling',
  'Petrol & Delivery',
  'Tea & Refreshments',
  'Cleaning & Sanitation',
  'Shop Maintenance',
  'Counter Supplies',
  'Other Counter Expense'
];

const WASTAGE_REASONS = [
  'Pouch Leaked / Punctured',
  'Curdled / Spoiled',
  'Broken Seal',
  'Expired / Sours',
  'Spillage at Counter',
  'Other'
];

export default function ShopPOSDaybookModal({ isOpen, onClose, products = [], onDataUpdated }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'collections' | 'expenses' | 'wastage' | 'add_expense' | 'add_wastage'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    summary: {
      totalCollected: 0,
      cashCollected: 0,
      upiCollected: 0,
      cardCollected: 0,
      otherCollected: 0,
      totalExpenses: 0,
      cashExpenses: 0,
      upiExpenses: 0,
      totalWastageLoss: 0,
      totalWastageQty: 0,
      netCashInDrawer: 0,
      netTotal: 0,
      counts: { collections: 0, expenses: 0, wastages: 0 }
    },
    collections: [],
    expenses: [],
    wastages: []
  });

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    category: 'Packaging & Pouches',
    description: '',
    amount: '',
    paidTo: '',
    paymentMethod: 'Cash'
  });
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Wastage form state
  const [wastageForm, setWastageForm] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    unit: 'Litre',
    reason: 'Pouch Leaked / Punctured',
    lossValue: 64
  });
  const [isSubmittingWastage, setIsSubmittingWastage] = useState(false);

  const fetchDaybook = async (dateStr = selectedDate) => {
    setLoading(true);
    try {
      const res = await api.get('/api/erp/pos/summary', { params: { date: dateStr } });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load daybook summary:', err);
      toast.error('Failed to load register summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDaybook(selectedDate);
      if (products.length > 0 && !wastageForm.productId) {
        const defaultProd = products.find(p => (p.name || '').toLowerCase().includes('cow milk')) || products[0];
        setWastageForm(prev => ({
          ...prev,
          productId: defaultProd.id || defaultProd._id,
          productName: defaultProd.name,
          lossValue: defaultProd.price || 64
        }));
      }
    }
  }, [isOpen, selectedDate]);

  const handleProductSelectForWastage = (prodId) => {
    const found = products.find(p => (p.id || p._id) === prodId);
    if (found) {
      const qty = Number(wastageForm.quantity) || 1;
      setWastageForm(prev => ({
        ...prev,
        productId: prodId,
        productName: found.name,
        lossValue: (found.price || 64) * qty
      }));
    }
  };

  const handleWastageQtyChange = (qtyVal) => {
    const qty = Number(qtyVal) || 0;
    const found = products.find(p => (p.id || p._id) === wastageForm.productId);
    const unitPrice = found ? found.price : (wastageForm.lossValue / (wastageForm.quantity || 1));
    setWastageForm(prev => ({
      ...prev,
      quantity: qty,
      lossValue: Math.round(unitPrice * qty)
    }));
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }
    setIsSubmittingExpense(true);
    try {
      const payload = {
        category: expenseForm.category,
        description: expenseForm.description || expenseForm.category,
        amount: Number(expenseForm.amount),
        paidTo: expenseForm.paidTo || 'Shop Staff / Vendor',
        paymentMethod: expenseForm.paymentMethod,
        date: new Date(selectedDate + 'T12:00:00.000Z')
      };
      await api.post('/api/erp/expenses', payload);
      toast.success(`Recorded expense of ₹${payload.amount}`);
      setExpenseForm({
        category: 'Packaging & Pouches',
        description: '',
        amount: '',
        paidTo: '',
        paymentMethod: 'Cash'
      });
      fetchDaybook(selectedDate);
      setActiveTab('summary');
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error('Error saving expense:', err);
      toast.error(err.response?.data?.message || 'Failed to record expense');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleSaveWastage = async (e) => {
    e.preventDefault();
    if (!wastageForm.quantity || Number(wastageForm.quantity) <= 0) {
      toast.error('Please enter a valid wastage quantity');
      return;
    }
    setIsSubmittingWastage(true);
    try {
      const payload = {
        productName: wastageForm.productName || 'Milk',
        category: 'Dairy',
        quantity: Number(wastageForm.quantity),
        unit: wastageForm.unit,
        reason: wastageForm.reason,
        lossValue: Number(wastageForm.lossValue) || 0,
        date: new Date(selectedDate + 'T12:00:00.000Z')
      };
      await api.post('/api/erp/wastages', payload);
      toast.success(`Logged wastage of ${payload.quantity} ${payload.unit} (₹${payload.lossValue})`);
      fetchDaybook(selectedDate);
      setActiveTab('summary');
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error('Error saving wastage:', err);
      toast.error(err.response?.data?.message || 'Failed to log wastage');
    } finally {
      setIsSubmittingWastage(false);
    }
  };

  if (!isOpen) return null;

  const { summary } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shadow-xs">
              <Wallet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">Shop Daybook & Register</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Live Counter Cash
                </span>
              </div>
              <p className="text-xs text-gray-500">Track collections, counter expenses, wastage and cash in hand</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-700 shadow-2xs">
              <Calendar size={13} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="focus:outline-none cursor-pointer bg-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchDaybook(selectedDate)}
              title="Refresh"
              className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs font-bold pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Register Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'collections'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>💰 Collections</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                {summary.counts?.collections || 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'expenses'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>🧾 Expenses</span>
              <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded-full">
                {summary.counts?.expenses || 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wastage')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'wastage'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>🥛 Wastage</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                {summary.counts?.wastages || 0}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('add_expense')}
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add_wastage')}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Wastage</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RefreshCw size={28} className="animate-spin text-emerald-600 mb-2" />
              <p className="text-xs font-semibold">Calculating register balances...</p>
            </div>
          ) : activeTab === 'summary' ? (
            <div className="space-y-5">
              
              {/* Primary 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                
                {/* 1. Cash In Drawer */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between opacity-80 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Cash in Drawer</span>
                    <Banknote size={16} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-1">
                    ₹{summary.netCashInDrawer.toFixed(2)}
                  </div>
                  <div className="text-[11px] opacity-90 mt-1 flex items-center gap-1">
                    <span>Cash collected: ₹{summary.cashCollected}</span>
                  </div>
                </div>

                {/* 2. Total Collected */}
                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Collected</span>
                    <ArrowUpRight size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 font-mono tracking-tight mt-1">
                    ₹{summary.totalCollected.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
                    <span>UPI: ₹{summary.upiCollected}</span>
                    <span>Cash: ₹{summary.cashCollected}</span>
                  </div>
                </div>

                {/* 3. Shop Expenses */}
                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Shop Expenses</span>
                    <ArrowDownRight size={16} className="text-red-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-red-600 font-mono tracking-tight mt-1">
                    ₹{summary.totalExpenses.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {summary.counts?.expenses || 0} recorded items
                  </div>
                </div>

                {/* 4. Milk Wastage */}
                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Wastage Loss</span>
                    <Droplet size={16} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-600 font-mono tracking-tight mt-1">
                    ₹{summary.totalWastageLoss.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {summary.totalWastageQty} Litres / Units
                  </div>
                </div>

              </div>

              {/* Collections by Payment Method Breakdown */}
              <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Collections Breakdown by Mode</span>
                  <span className="text-gray-400 font-normal">Date: {data.date}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-50 text-green-700 flex items-center justify-center font-bold">
                        💵
                      </div>
                      <div>
                        <span className="block font-bold text-gray-800">Cash</span>
                        <span className="text-[10px] text-gray-400">At counter</span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-gray-900 text-sm">
                      ₹{summary.cashCollected.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        📱
                      </div>
                      <div>
                        <span className="block font-bold text-gray-800">UPI / QR</span>
                        <span className="text-[10px] text-gray-400">PhonePe/GPay</span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-gray-900 text-sm">
                      ₹{summary.upiCollected.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        💳
                      </div>
                      <div>
                        <span className="block font-bold text-gray-800">Card / POS</span>
                        <span className="text-[10px] text-gray-400">Swipe</span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-gray-900 text-sm">
                      ₹{summary.cardCollected.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                        ⚖️
                      </div>
                      <div>
                        <span className="block font-bold text-gray-800">Net Balance</span>
                        <span className="text-[10px] text-gray-400">After costs</span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-emerald-700 text-sm">
                      ₹{summary.netTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Recent Collections */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                      <span>💰 Today's Collections</span>
                      <span className="text-[10px] text-gray-400">({data.collections.length})</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setActiveTab('collections')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      View All
                    </button>
                  </div>
                  {data.collections.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No collections logged yet for this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.collections.slice(0, 4).map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                          <div>
                            <span className="font-bold text-gray-800 block truncate max-w-[180px]">
                              {c.customerName}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <span className="font-semibold text-emerald-700">{c.paymentMethod}</span> • {c.type}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-emerald-600 text-sm">
                            +₹{c.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expenses & Wastage list preview */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                      <span>📉 Expenses & Wastage</span>
                      <span className="text-[10px] text-gray-400">({data.expenses.length + data.wastages.length})</span>
                    </h5>
                    <div className="flex gap-2 text-xs font-bold">
                      <button type="button" onClick={() => setActiveTab('expenses')} className="text-red-600 hover:text-red-700">
                        Expenses
                      </button>
                      <span className="text-gray-300">•</span>
                      <button type="button" onClick={() => setActiveTab('wastage')} className="text-amber-600 hover:text-amber-700">
                        Wastage
                      </button>
                    </div>
                  </div>
                  {data.expenses.length === 0 && data.wastages.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No expenses or wastage logged for this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.expenses.slice(0, 2).map((exp, i) => (
                        <div key={`exp-${i}`} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                          <div>
                            <span className="font-bold text-gray-800 block truncate max-w-[180px]">
                              {exp.category}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {exp.description || exp.paidTo} • {exp.paymentMethod}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-red-600 text-sm">
                            -₹{Number(exp.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {data.wastages.slice(0, 2).map((wst, i) => (
                        <div key={`wst-${i}`} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                          <div>
                            <span className="font-bold text-amber-900 block truncate max-w-[180px]">
                              🥛 {wst.productName} ({wst.quantity} {wst.unit})
                            </span>
                            <span className="text-[10px] text-amber-700">
                              Reason: {wst.reason}
                            </span>
                          </div>
                          <span className="font-bold font-mono text-amber-700 text-sm">
                            -₹{Number(wst.lossValue).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : activeTab === 'collections' ? (
            /* Collections Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-800">
                  Total Collections ({data.collections.length} transactions)
                </h4>
                <span className="font-bold font-mono text-emerald-600 text-base">
                  ₹{summary.totalCollected.toFixed(2)}
                </span>
              </div>
              {data.collections.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Banknote size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No collections found on {data.date}.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {data.collections.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                          item.paymentMethod?.toLowerCase().includes('cash')
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {item.paymentMethod?.toLowerCase().includes('cash') ? '💵' : '📱'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{item.customerName}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-600">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.itemsSummary}
                          </p>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {new Date(item.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-emerald-600 block">
                          +₹{item.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {item.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'expenses' ? (
            /* Expenses Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-800">
                  Shop Expenses ({data.expenses.length} records)
                </h4>
                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-red-600 text-base">
                    ₹{summary.totalExpenses.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add_expense')}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>
              {data.expenses.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No shop expenses logged on {data.date}.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {data.expenses.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{exp.category}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-red-50 text-red-700">
                            {exp.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {exp.description} {exp.paidTo && `• Paid to: ${exp.paidTo}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-red-600 block">
                          -₹{Number(exp.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'wastage' ? (
            /* Wastage Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-800">
                  Milk & Product Wastage ({data.wastages.length} records)
                </h4>
                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-amber-600 text-base">
                    ₹{summary.totalWastageLoss.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add_wastage')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>
              {data.wastages.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Droplet size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No wastage logged on {data.date}.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {data.wastages.map((wst, idx) => (
                    <div key={idx} className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-amber-900">🥛 {wst.productName}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                            {wst.quantity} {wst.unit}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Reason: {wst.reason} {wst.reportedBy && `• Reported by: ${wst.reportedBy}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-amber-700 block">
                          -₹{Number(wst.lossValue).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'add_expense' ? (
            /* Add Expense Form */
            <form onSubmit={handleSaveExpense} className="max-w-lg mx-auto bg-gray-50/50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="font-bold text-sm text-gray-800">Record Shop Expense</h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 150"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full text-xs font-bold font-mono p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Paid Via</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full text-xs font-semibold p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                  >
                    <option value="Cash">Cash (from drawer)</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Paid To / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Ice vendor / Delivery boy"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 2 blocks of ice for milk crates"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingExpense}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmittingExpense ? 'Saving...' : 'Record Expense'}
              </button>
            </form>
          ) : (
            /* Add Wastage Form */
            <form onSubmit={handleSaveWastage} className="max-w-lg mx-auto bg-gray-50/50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="font-bold text-sm text-gray-800">Log Milk / Counter Wastage</h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Product</label>
                <select
                  value={wastageForm.productId}
                  onChange={(e) => handleProductSelectForWastage(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  {products.map(prod => (
                    <option key={prod.id || prod._id} value={prod.id || prod._id}>
                      {prod.name} (₹{prod.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={wastageForm.quantity}
                    onChange={(e) => handleWastageQtyChange(e.target.value)}
                    className="w-full text-xs font-bold font-mono p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Unit</label>
                  <select
                    value={wastageForm.unit}
                    onChange={(e) => setWastageForm({ ...wastageForm, unit: e.target.value })}
                    className="w-full text-xs font-semibold p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                  >
                    <option value="Litre">Litre</option>
                    <option value="Packet">Packet</option>
                    <option value="kg">kg</option>
                    <option value="Bottle">Bottle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Reason for Wastage</label>
                <select
                  value={wastageForm.reason}
                  onChange={(e) => setWastageForm({ ...wastageForm, reason: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  {WASTAGE_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Estimated Loss (₹)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={wastageForm.lossValue}
                  onChange={(e) => setWastageForm({ ...wastageForm, lossValue: e.target.value })}
                  className="w-full text-xs font-bold font-mono p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingWastage}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmittingWastage ? 'Logging...' : 'Log Wastage'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="text-gray-500 text-[11px] flex items-center gap-2">
            <span>Cash collected: <b>₹{summary.cashCollected}</b></span>
            <span>•</span>
            <span>Cash expenses: <b>₹{summary.cashExpenses}</b></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
