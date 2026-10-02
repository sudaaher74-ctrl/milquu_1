import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  CheckCircle2, Clock, AlertCircle, Banknote, Download, FileText, 
  Plus, Phone, MapPin, User, IndianRupee, QrCode, Trash2, Printer, 
  Share2, RefreshCw, Sparkles, MessageCircle, X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import toast from '../../../utils/toast';
import { DAIRY_KHATA_BANK_DETAILS } from '../../../utils/khataPaymentConfig';
import MilkInvoiceModal from './MilkInvoiceModal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CustomerKhataDetail({ customerId: propCustomerId, onBack }) {
  const navigate = useNavigate();
  const params = useParams();
  const customerId = propCustomerId || params.id;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState({
    totalMilkLitres: 0,
    totalBilledAmount: 0,
    totalPaidAmount: 0,
    totalDue: 0,
    unpaidOrdersCount: 0,
    unpaidBillsCount: 0
  });
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'bills' | 'deliveries'

  // Bill Creation from Calendar Date Range
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);

  // Settlement Modal State
  const [settleTargetBill, setSettleTargetBill] = useState(null); // null means full customer balance
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [settlePaymentMethod, setSettlePaymentMethod] = useState('Cash');
  const [isSubmittingSettle, setIsSubmittingSettle] = useState(false);

  // Quick Daily Entry Modal
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState('');
  const [quickAddQty, setQuickAddQty] = useState(1);
  const [quickAddPrice, setQuickAddPrice] = useState(54);
  const [quickAddProduct, setQuickAddProduct] = useState('Cow Milk (Pouch)');
  const [quickAddShift, setQuickAddShift] = useState('Morning');
  const [isSubmittingQuickAdd, setIsSubmittingQuickAdd] = useState(false);

  // Milk Invoice PDF Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch full details
  const fetchCustomerDetails = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/erp/credit-customers/${customerId}/details`);
      if (res.data) {
        setCustomer(res.data.customer || null);
        setStats(res.data.stats || {});
        setOrders(res.data.orders || []);
        setBills(res.data.bills || []);
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
      toast.error(err.response?.data?.message || 'Could not load customer khata details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // Map deliveries/orders by date: "YYYY-MM-DD"
  const deliveriesByDate = useMemo(() => {
    const map = {};
    for (const ord of orders) {
      // Extract date string
      let dateKey = '';
      if (ord.notes && ord.notes.includes('Date:')) {
        const match = ord.notes.match(/Date:\s*(\d{4}-\d{2}-\d{2})/);
        if (match && match[1]) {
          dateKey = match[1];
        }
      }
      if (!dateKey) {
        const rawDate = ord.createdAt || ord.scheduledDeliveryDate;
        if (rawDate) {
          dateKey = new Date(rawDate).toISOString().slice(0, 10);
        }
      }

      if (!dateKey) continue;

      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          orders: [],
          totalLitres: 0,
          totalAmount: 0,
          isPaid: true, // will be false if any order is unpaid
          shifts: []
        };
      }

      const ordAmt = Number(ord.totalPrice) || 0;
      let litres = 0;
      let pName = 'Milk';
      if (Array.isArray(ord.orderItems) && ord.orderItems.length > 0) {
        for (const item of ord.orderItems) {
          pName = item.name || 'Milk';
          const qty = Number(item.qty) || 1;
          const u = (item.unit || '').toLowerCase();
          if (u.includes('500') || (item.name || '').includes('500')) {
            litres += qty * 0.5;
          } else {
            litres += qty;
          }
        }
      } else {
        litres = 1;
      }

      map[dateKey].orders.push(ord);
      map[dateKey].totalLitres += litres;
      map[dateKey].totalAmount += ordAmt;
      if (!ord.isPaid) {
        map[dateKey].isPaid = false;
      }
      const shift = (ord.notes || '').includes('Evening') ? 'Evening' : 'Morning';
      if (!map[dateKey].shifts.includes(shift)) {
        map[dateKey].shifts.push(shift);
      }
    }
    return map;
  }, [orders]);

  // Match which bills cover which dates
  const billByDate = useMemo(() => {
    const map = {};
    for (const bill of bills) {
      const bStart = new Date(bill.startDate).toISOString().slice(0, 10);
      const bEnd = new Date(bill.endDate).toISOString().slice(0, 10);

      // Iterate through the days of the bill
      const cur = new Date(bill.startDate);
      const end = new Date(bill.endDate);
      while (cur <= end) {
        const dStr = cur.toISOString().slice(0, 10);
        map[dStr] = bill;
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [bills]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentDate(new Date());
  };

  // Helper: check if a date string is inside the selected date range
  const isDateInSelectedRange = (dateStr) => {
    if (!rangeStart || !rangeEnd) return false;
    return dateStr >= rangeStart && dateStr <= rangeEnd;
  };

  // Set date range presets
  const handleSetPresetRange = (preset) => {
    const yStr = String(year);
    const mStr = String(month + 1).padStart(2, '0');
    if (preset === '1st-15th') {
      setRangeStart(`${yStr}-${mStr}-01`);
      setRangeEnd(`${yStr}-${mStr}-15`);
    } else if (preset === '16th-end') {
      setRangeStart(`${yStr}-${mStr}-16`);
      setRangeEnd(`${yStr}-${mStr}-${String(daysInMonth).padStart(2, '0')}`);
    } else if (preset === 'full-month') {
      setRangeStart(`${yStr}-${mStr}-01`);
      setRangeEnd(`${yStr}-${mStr}-${String(daysInMonth).padStart(2, '0')}`);
    } else if (preset === 'last-10-days') {
      const today = new Date();
      const tenAgo = new Date();
      tenAgo.setDate(today.getDate() - 10);
      setRangeStart(tenAgo.toISOString().slice(0, 10));
      setRangeEnd(today.toISOString().slice(0, 10));
    }
  };

  // Compute live calculations for the selected range
  const rangeCalculation = useMemo(() => {
    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
      return { daysCount: 0, deliveryCount: 0, totalLitres: 0, totalAmount: 0 };
    }

    let daysCount = 0;
    let deliveryCount = 0;
    let totalLitres = 0;
    let totalAmount = 0;

    const cur = new Date(rangeStart);
    const end = new Date(rangeEnd);

    while (cur <= end) {
      daysCount += 1;
      const dStr = cur.toISOString().slice(0, 10);
      const delivery = deliveriesByDate[dStr];
      if (delivery) {
        deliveryCount += 1;
        totalLitres += delivery.totalLitres;
        totalAmount += delivery.totalAmount;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return { daysCount, deliveryCount, totalLitres, totalAmount };
  }, [rangeStart, rangeEnd, deliveriesByDate]);

  // Handler: Create and save bill for selected date range
  const handleCreateBill = async () => {
    if (!rangeStart || !rangeEnd) {
      toast.error('Please select both start date and end date.');
      return;
    }
    if (rangeStart > rangeEnd) {
      toast.error('Start date cannot be after end date.');
      return;
    }

    setIsCreatingBill(true);
    try {
      const res = await api.post(`/api/erp/credit-customers/${customerId}/bills`, {
        startDate: rangeStart,
        endDate: rangeEnd,
        notes: billNotes
      });

      toast(`✅ Bill ${res.data.bill?.billNumber || ''} created & saved successfully!`);
      setShowCreateBillModal(false);
      setBillNotes('');
      // Refresh customer data so calendar immediately reflects the bill!
      await fetchCustomerDetails();
    } catch (err) {
      console.error('Error creating bill:', err);
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setIsCreatingBill(false);
    }
  };

  // Handler: Open settle modal for a specific bill or full dues
  const handleOpenSettle = (bill = null) => {
    setSettleTargetBill(bill);
    if (bill) {
      const remaining = Math.max(0, bill.totalAmount - (bill.paidAmount || 0));
      setSettleAmount(String(remaining || bill.totalAmount));
    } else {
      setSettleAmount(String(stats.totalDue || ''));
    }
    setSettlePaymentMethod('Cash');
    setShowSettleModal(true);
  };

  // Handler: Submit payment settlement
  const handleSettleSubmit = async (e) => {
    if (e) e.preventDefault();
    const amt = Number(settleAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setIsSubmittingSettle(true);
    try {
      if (settleTargetBill) {
        // Settle specific bill
        await api.post(`/api/erp/credit-bills/${settleTargetBill._id}/settle`, {
          amount: amt,
          paymentMethod: settlePaymentMethod
        });
        toast(`✅ Bill ${settleTargetBill.billNumber} marked as Settled (${settlePaymentMethod})!`);
      } else {
        // Lump sum settlement for customer
        await api.post(`/api/erp/credit-customers/${customerId}/settle`, {
          amount: amt,
          paymentMethod: settlePaymentMethod
        });
        toast(`✅ Payment of ₹${amt} recorded successfully!`);
      }

      setShowSettleModal(false);
      // Immediately refresh customer data so calendar updates automatically!
      await fetchCustomerDetails();
    } catch (err) {
      console.error('Settlement error:', err);
      toast.error(err.response?.data?.message || 'Failed to process settlement');
    } finally {
      setIsSubmittingSettle(false);
    }
  };

  // Handler: Delete bill
  const handleDeleteBill = async (billId, billNum) => {
    if (!window.confirm(`Are you sure you want to delete bill ${billNum}? This will unlink any included orders.`)) {
      return;
    }
    try {
      await api.delete(`/api/erp/credit-bills/${billId}`);
      toast('Bill deleted successfully');
      await fetchCustomerDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete bill');
    }
  };

  // Handler: Quick add delivery on a date
  const handleQuickAddDelivery = async (e) => {
    if (e) e.preventDefault();
    if (!quickAddDate) {
      toast.error('Select a date');
      return;
    }
    const qty = Number(quickAddQty);
    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }

    setIsSubmittingQuickAdd(true);
    try {
      const rate = Number(quickAddPrice) || 54;
      const totalAmount = rate * qty;
      const unit = quickAddProduct.includes('500') ? '500 ml' : '1 Litre';

      const payload = {
        user: customer?.userId || undefined,
        name: customer?.name || 'Customer',
        phone: customer?.phone || undefined,
        orderItems: [{
          name: `${quickAddProduct} (${unit})`,
          price: rate,
          unit: unit,
          qty: qty,
          image: '/img/products/cowmilkplasticbag.png'
        }],
        discount: 0,
        totalPrice: totalAmount,
        paymentMethod: 'Credit',
        billingCycle: customer?.billingCycle || '15 Days',
        orderSource: 'POS',
        notes: `[Daily Milk Register - ${quickAddShift}] Date: ${quickAddDate} | Logged from Khata Calendar`
      };

      await api.post('/api/erp/orders', payload);
      toast(`✅ Added ${qty} L on ${quickAddDate} for ${customer?.name}`);
      setShowQuickAddModal(false);
      await fetchCustomerDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add milk delivery');
    } finally {
      setIsSubmittingQuickAdd(false);
    }
  };

  // WhatsApp Reminder
  const handleSendWhatsAppReminder = () => {
    if (!customer?.phone) {
      toast.error('Customer phone number is missing');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${customer.name}, greeting from MilQuu Fresh! 🥛\nYour current dairy milk account outstanding is ₹${stats.totalDue?.toFixed(2)}.\n\nBank Account Details for UPI / Netbanking:\nA/C Name: ${DAIRY_KHATA_BANK_DETAILS.accountHolder}\nA/C No: ${DAIRY_KHATA_BANK_DETAILS.accountNumber}\nIFSC: ${DAIRY_KHATA_BANK_DETAILS.ifscCode}\nUPI ID: ${DAIRY_KHATA_BANK_DETAILS.upiId}\n\nPlease settle your bill at your earliest convenience. Thank you!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  if (loading && !customer) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-semibold text-sm">Loading Customer Khata & Calendar...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-16">
      
      {/* ── TOP NAVIGATION & PROFILE BAR ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Back & Customer Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate('/admin/pos'))}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              title="Back to POS / Khata"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-serif font-bold text-xl shadow-2xs">
              {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                  {customer?.name || 'Customer Profile'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  stats.totalDue > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {stats.totalDue > 0 ? 'Active Dues' : 'All Settled'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {customer?.billingCycle || '15 Days'} Cycle
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                {customer?.phone ? (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone size={12} className="text-gray-400" /> {customer.phone}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">No phone recorded</span>
                )}
                {customer?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" /> {customer.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQuickAddDate(new Date().toISOString().slice(0, 10));
                setShowQuickAddModal(true);
              }}
              className="px-3 py-2 bg-milquu-blue hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Milk Entry</span>
            </button>

            {stats.totalDue > 0 && (
              <button
                type="button"
                onClick={() => handleOpenSettle(null)}
                className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Banknote size={14} />
                <span>Settle Dues</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FileText size={14} className="text-blue-600" />
              <span>Milk Bill PDF</span>
            </button>

            {customer?.phone && stats.totalDue > 0 && (
              <button
                type="button"
                onClick={handleSendWhatsAppReminder}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Send WhatsApp Reminder"
              >
                <MessageCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* ── KPI METRICS CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Milk */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Milk Delivered
            </span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-milquu-blue font-mono">
                {stats.totalMilkLitres?.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs font-bold text-gray-500">Litres</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Across all recorded shifts
            </span>
          </div>

          {/* Total Billed */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Billed
            </span>
            <div className="mt-1.5">
              <span className="text-2xl font-black text-gray-800 font-mono">
                ₹{stats.totalBilledAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Gross supply value
            </span>
          </div>

          {/* Total Paid */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Total Payments Received
            </span>
            <div className="mt-1.5">
              <span className="text-2xl font-black text-green-600 font-mono">
                ₹{stats.totalPaidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Total settled amount
            </span>
          </div>

          {/* Current Outstanding Balance */}
          <div className={`p-4 rounded-2xl border shadow-2xs ${
            stats.totalDue > 0 
              ? 'bg-amber-50/70 border-amber-200' 
              : 'bg-green-50/60 border-green-200'
          }`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              stats.totalDue > 0 ? 'text-amber-800' : 'text-green-800'
            }`}>
              Outstanding Balance
            </span>
            <div className="mt-1.5">
              <span className={`text-2xl font-black font-mono ${
                stats.totalDue > 0 ? 'text-amber-900' : 'text-green-700'
              }`}>
                ₹{stats.totalDue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </span>
            </div>
            <span className={`text-[10px] mt-1 block ${
              stats.totalDue > 0 ? 'text-amber-700' : 'text-green-600'
            }`}>
              {stats.unpaidBillsCount || 0} bills pending payment
            </span>
          </div>
        </div>

        {/* ── MAIN TABS (CALENDAR / SAVED BILLS / ORDER LOG) ── */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Tab Header Bar */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70">
            <div className="flex items-center gap-1.5 bg-gray-200/70 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon size={14} className="text-amber-600" />
                <span>Milk & Delivery Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bills')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'bills'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText size={14} className="text-blue-600" />
                <span>Saved Bills & Invoices ({bills.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('deliveries')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'deliveries'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock size={14} className="text-purple-600" />
                <span>All Orders Log ({orders.length})</span>
              </button>
            </div>

            {/* Quick Bill Creator CTA */}
            {activeTab === 'calendar' && (
              <button
                type="button"
                onClick={() => {
                  if (!rangeStart) handleSetPresetRange('1st-15th');
                  setShowCreateBillModal(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Create Bill From Calendar</span>
              </button>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: MILK & DELIVERY CALENDAR                                         */}
          {/* ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'calendar' && (
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Calendar Month Navigation & Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 font-serif min-w-[160px] text-center">
                      {MONTH_NAMES[month]} {year}
                    </h2>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTodayMonth}
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                    <span className="text-gray-600 font-medium">Bill Settled / Paid</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="text-gray-600 font-medium">Billed (Due / Unpaid)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                    <span className="text-gray-600 font-medium">Delivered (Unbilled)</span>
                  </span>
                </div>
              </div>

              {/* Date Range Selector Bar for Billing */}
              <div className="p-4 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Select Date Range:
                    </span>
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-white shadow-2xs"
                    />
                    <span className="text-xs font-bold text-gray-400">to</span>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-white shadow-2xs"
                    />
                  </div>

                  {/* Presets */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetPresetRange('1st-15th')}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      1st–15th
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetRange('16th-end')}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      16th–End
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetRange('full-month')}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Full Month
                    </button>
                  </div>
                </div>

                {/* Range Summary & Create Bill Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-amber-200">
                  <div className="text-right">
                    <span className="text-[11px] text-gray-500 font-medium block">
                      {rangeCalculation.deliveryCount} Deliveries · {rangeCalculation.totalLitres} L
                    </span>
                    <span className="text-sm font-black text-amber-900 font-mono">
                      ₹{rangeCalculation.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateBillModal(true)}
                    disabled={!rangeStart || !rangeEnd || rangeCalculation.totalAmount <= 0}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Generate Bill
                  </button>
                </div>
              </div>

              {/* 7-DAY CALENDAR GRID */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                {/* Header row */}
                <div className="grid grid-cols-7 bg-gray-100/80 border-b border-gray-200 text-center py-2.5">
                  {WEEK_DAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={`text-xs font-bold uppercase tracking-wider ${
                        idx === 0 ? 'text-red-500' : 'text-gray-600'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 bg-gray-200 gap-[1px]">
                  {/* Empty cells before month starts */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-50/50 min-h-[95px] p-2" />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const delivery = deliveriesByDate[dateStr];
                    const bill = billByDate[dateStr];
                    const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                    const isSelected = isDateInSelectedRange(dateStr);

                    // Determine day billing & settlement status
                    let statusColor = 'text-gray-400';
                    let statusBadge = null;

                    if (bill) {
                      if (bill.status === 'Settled') {
                        statusBadge = (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-md mt-1">
                            <CheckCircle2 size={11} className="text-green-600 shrink-0" />
                            <span className="truncate">Bill Settled</span>
                          </div>
                        );
                      } else {
                        statusBadge = (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md mt-1">
                            <Clock size={11} className="text-amber-600 shrink-0" />
                            <span className="truncate">Billed (Due)</span>
                          </div>
                        );
                      }
                    } else if (delivery) {
                      if (delivery.isPaid) {
                        statusBadge = (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md mt-1">
                            <CheckCircle2 size={11} className="text-green-600 shrink-0" />
                            <span className="truncate">Paid</span>
                          </div>
                        );
                      } else {
                        statusBadge = (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md mt-1">
                            <span>🥛 Delivered</span>
                          </div>
                        );
                      }
                    }

                    return (
                      <div
                        key={dateStr}
                        onClick={() => {
                          // Quick add delivery for this day
                          setQuickAddDate(dateStr);
                          setShowQuickAddModal(true);
                        }}
                        className={`min-h-[95px] p-2 transition-all flex flex-col justify-between cursor-pointer group ${
                          isSelected
                            ? 'bg-amber-50/90 ring-2 ring-inset ring-amber-500'
                            : 'bg-white hover:bg-blue-50/40'
                        }`}
                      >
                        {/* Day Number and Today Indicator */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-mono ${
                              isToday
                                ? 'bg-milquu-blue text-white shadow-2xs'
                                : 'text-gray-700 group-hover:text-milquu-blue'
                            }`}
                          >
                            {dayNum}
                          </span>
                          
                          {delivery && (
                            <span className="text-[11px] font-black text-gray-900 font-mono">
                              ₹{delivery.totalAmount}
                            </span>
                          )}
                        </div>

                        {/* Delivery Info */}
                        <div className="my-1">
                          {delivery ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                                <span>🥛</span>
                                <span>{delivery.totalLitres} L</span>
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium">
                                {delivery.shifts.join(', ')}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                              + Add milk
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div>
                          {statusBadge}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: SAVED BILLS & INVOICES                                            */}
          {/* ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'bills' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Saved Customer Bills</h3>
                  <p className="text-xs text-gray-500">All cycle bills created from the calendar or POS</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('calendar');
                    if (!rangeStart) handleSetPresetRange('1st-15th');
                    setShowCreateBillModal(true);
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create New Bill</span>
                </button>
              </div>

              {bills.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Bill Number</th>
                        <th className="p-3">Billing Period</th>
                        <th className="p-3">Total Milk</th>
                        <th className="p-3">Bill Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Settled Details</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bills.map((bill) => {
                        const isSettled = bill.status === 'Settled';
                        const remaining = Math.max(0, bill.totalAmount - (bill.paidAmount || 0));

                        return (
                          <tr key={bill._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="p-3 font-mono font-bold text-gray-900">
                              {bill.billNumber}
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-gray-800 block">
                                {bill.dateRangeStr || `${new Date(bill.startDate).toLocaleDateString('en-IN')} – ${new Date(bill.endDate).toLocaleDateString('en-IN')}`}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Created: {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-milquu-blue">
                              {bill.totalLitres || 0} Litres
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-black font-mono text-gray-900 block">
                                ₹{bill.totalAmount?.toFixed(2)}
                              </span>
                              {!isSettled && bill.paidAmount > 0 && (
                                <span className="text-[10px] text-amber-700 font-bold block">
                                  Due: ₹{remaining.toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                isSettled
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {isSettled ? (
                                  <>
                                    <CheckCircle2 size={11} className="text-green-600" />
                                    <span>Settled</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={11} className="text-amber-600" />
                                    <span>Unpaid</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3">
                              {isSettled ? (
                                <div className="text-[11px] text-gray-600">
                                  <span className="font-bold text-gray-800">{bill.settledMethod || 'Cash'}</span>
                                  {bill.settledAt && (
                                    <span className="text-gray-400 block text-[10px]">
                                      {new Date(bill.settledAt).toLocaleDateString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-[11px]">Pending Payment</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isSettled ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSettle(bill)}
                                    className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                    title="Settle this specific bill"
                                  >
                                    <Banknote size={12} />
                                    <span>Settle Bill</span>
                                  </button>
                                ) : (
                                  <span className="text-green-600 font-bold text-xs flex items-center gap-1 mr-1">
                                    <CheckCircle2 size={13} /> Paid
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setShowInvoiceModal(true)}
                                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                                  title="View Invoice PDF"
                                >
                                  <Printer size={13} />
                                </button>

                                {!isSettled && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBill(bill._id, bill.billNumber)}
                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Bill"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                  <FileText size={40} className="mb-2 opacity-20" />
                  <p className="font-semibold text-gray-600">No bills generated for this customer yet</p>
                  <p className="text-xs text-gray-400 mt-1">Select a date range on the calendar to create and save a bill.</p>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: ALL ORDERS LOG                                                    */}
          {/* ════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'deliveries' && (
            <div className="p-4 sm:p-6 space-y-3">
              <h3 className="text-base font-bold text-gray-900 mb-2">Chronological Orders Log</h3>
              {orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((ord, idx) => (
                    <div
                      key={ord._id || idx}
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                          ord.isPaid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          🥛
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">
                              {(ord.orderItems && ord.orderItems[0]?.name) || 'Daily Milk Delivery'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              #{ord._id?.toString().slice(-6)}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 block">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-gray-900 block">
                            ₹{Number(ord.totalPrice).toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-bold ${ord.isPaid ? 'text-green-600' : 'text-amber-700'}`}>
                            {ord.isPaid ? `Paid (${ord.creditSettledMethod || 'Settled'})` : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">No orders recorded yet.</div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ── MODAL: CREATE BILL FROM DATE RANGE ── */}
      {showCreateBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowCreateBillModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">Create Milk Bill</h3>
                <p className="text-xs text-gray-500">{customer?.name} ({customer?.phone || 'Customer'})</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                  />
                </div>
              </div>

              {/* Live Calculation preview */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <div className="flex justify-between text-xs text-gray-700">
                  <span>Selected Days:</span>
                  <span className="font-bold">{rangeCalculation.daysCount} Days</span>
                </div>
                <div className="flex justify-between text-xs text-gray-700">
                  <span>Milk Deliveries:</span>
                  <span className="font-bold text-milquu-blue">{rangeCalculation.deliveryCount} Deliveries ({rangeCalculation.totalLitres} L)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-950 pt-1 border-t border-amber-200">
                  <span>Calculated Bill Total:</span>
                  <span className="font-mono text-base font-black">₹{rangeCalculation.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  placeholder="e.g. 15-day milk cycle bill..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBillModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBill}
                  disabled={isCreatingBill || rangeCalculation.totalAmount <= 0}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isCreatingBill ? 'Saving Bill...' : 'Create & Save Bill'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SETTLE BILL OR FULL BALANCE ── */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowSettleModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center font-bold">
                <Banknote size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">
                  {settleTargetBill ? `Settle Bill #${settleTargetBill.billNumber}` : 'Record Khata Payment'}
                </h3>
                <p className="text-xs text-gray-500">{customer?.name} ({customer?.phone || 'Customer'})</p>
              </div>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Settlement Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-lg font-bold font-mono border border-gray-300 rounded-xl focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cash', 'UPI', 'Card', 'Bank Transfer'].map((mode) => (
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

              {/* UPI QR & Account Display */}
              {settlePaymentMethod === 'UPI' && (
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-purple-900 font-bold text-xs uppercase tracking-wide">
                    <QrCode size={14} /> Scan & Pay via UPI
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={DAIRY_KHATA_BANK_DETAILS.qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-28 h-28 object-contain rounded-xl border border-purple-200 bg-white p-1 shadow-2xs"
                    />
                  </div>
                  <div className="text-[11px] font-mono font-bold text-gray-800">
                    UPI: {DAIRY_KHATA_BANK_DETAILS.upiId}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSettle}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmittingSettle ? 'Recording...' : 'Confirm Settle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: QUICK ADD DAILY ENTRY FROM CALENDAR ── */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowQuickAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl p-2 bg-blue-50 rounded-2xl border border-blue-200">🥛</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">Add Daily Milk</h3>
                <p className="text-xs text-gray-500">{new Date(quickAddDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            <form onSubmit={handleQuickAddDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={quickAddDate}
                  onChange={(e) => setQuickAddDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Milk Product</label>
                <select
                  value={quickAddProduct}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuickAddProduct(val);
                    if (val.includes('Buffalo')) setQuickAddPrice(75);
                    else if (val.includes('A2')) setQuickAddPrice(90);
                    else setQuickAddPrice(54);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800"
                >
                  <option value="Cow Milk (Pouch)">Cow Milk (Pouch) - ₹54/L</option>
                  <option value="Buffalo Milk (Pouch)">Buffalo Milk (Pouch) - ₹75/L</option>
                  <option value="A2 Cow Milk">A2 Cow Milk - ₹90/L</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (Litres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    required
                    value={quickAddQty}
                    onChange={(e) => setQuickAddQty(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rate (₹/L)</label>
                  <input
                    type="number"
                    required
                    value={quickAddPrice}
                    onChange={(e) => setQuickAddPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Shift</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Morning', 'Evening'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuickAddShift(s)}
                      className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        quickAddShift === s
                          ? 'bg-milquu-blue text-white border-milquu-blue'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
                <span className="text-gray-500">Total Entry Amount:</span>
                <span className="text-base font-bold font-mono text-gray-900">
                  ₹{(Number(quickAddQty) * Number(quickAddPrice)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuickAdd}
                  className="flex-1 py-2.5 bg-milquu-blue hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmittingQuickAdd ? 'Saving...' : 'Add to Khata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MILK INVOICE BILL (PDF) ── */}
      {showInvoiceModal && (
        <MilkInvoiceModal
          showInvoiceModal={showInvoiceModal}
          setShowInvoiceModal={setShowInvoiceModal}
          customer={{
            ...customer,
            totalDue: stats.totalDue,
            orders: orders
          }}
        />
      )}

    </div>
  );
}
