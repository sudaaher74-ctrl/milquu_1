import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api.js';
import toast from '../../utils/toast.js';
import { useBusinessSettings } from '../../utils/useBusinessSettings.js';
import { exportToExcel } from '../../utils/exportUtils.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Landmark, Plus, Search, RefreshCw, Download, Share2, 
  CheckCircle2, Clock, IndianRupee, ArrowDownLeft, ArrowUpRight,
  TrendingUp, Users, Phone, Calendar, FileText, Trash2, Edit2,
  X, AlertCircle, Printer, Filter, Building2, CreditCard
} from 'lucide-react';

const Financiers = () => {
  const business = useBusinessSettings();

  // State
  const [loading, setLoading] = useState(true);
  const [financiers, setFinanciers] = useState([]);
  const [metrics, setMetrics] = useState({
    totalFinancedAll: 0,
    totalRepaidAll: 0,
    totalOutstandingAll: 0,
    financiersCount: 0,
    totalCustomerCredit: 0,
    workingCapitalGap: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [selectedFinancierId, setSelectedFinancierId] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'FINANCED', 'REPAYMENT'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Vendor names for autocomplete
  const [vendorNames, setVendorNames] = useState([]);

  // Modals state
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [showFinancierProfileModal, setShowFinancierProfileModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [editingFinancier, setEditingFinancier] = useState(null);

  // Form states
  const emptyFinancingForm = {
    financierId: '',
    amount: '',
    linkedVendor: '',
    clearVendorDue: true,
    paymentMode: 'UPI',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };
  const [financingForm, setFinancingForm] = useState(emptyFinancingForm);

  const emptyRepaymentForm = {
    financierId: '',
    amount: '',
    paymentMode: 'UPI',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: 'Lump sum repayment from customer collections'
  };
  const [repaymentForm, setRepaymentForm] = useState(emptyRepaymentForm);

  const emptyProfileForm = {
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    isActive: true
  };
  const [profileForm, setProfileForm] = useState(emptyProfileForm);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [finRes, vendorsRes] = await Promise.all([
        api.get('/api/erp/financiers'),
        api.get('/api/erp/vendors/summary').catch(() => ({ data: { vendors: [] } }))
      ]);

      const finData = finRes.data || {};
      setFinanciers(finData.financiers || []);
      setMetrics(finData.metrics || {
        totalFinancedAll: 0,
        totalRepaidAll: 0,
        totalOutstandingAll: 0,
        financiersCount: 0,
        totalCustomerCredit: 0,
        workingCapitalGap: 0
      });

      // Extract unique vendor names
      const vList = (vendorsRes.data?.vendors || []).map(v => v.supplierName).filter(Boolean);
      setVendorNames(vList);

      // Fetch ledger
      await fetchLedger(selectedFinancierId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Financier data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (financierId = selectedFinancierId) => {
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await api.get(`/api/erp/financiers/${financierId}/ledger`, { params });
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ledger transactions');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLedger(selectedFinancierId);
  }, [selectedFinancierId, typeFilter, dateRange]);

  // Selected Financier Object
  const currentFinancier = useMemo(() => {
    if (selectedFinancierId === 'all') return null;
    return financiers.find(f => f._id === selectedFinancierId) || null;
  }, [financiers, selectedFinancierId]);

  // Handle open financing modal
  const openFinancingModal = (finId = null) => {
    const id = finId || (selectedFinancierId !== 'all' ? selectedFinancierId : (financiers[0]?._id || ''));
    setFinancingForm({
      ...emptyFinancingForm,
      financierId: id,
      date: new Date().toISOString().split('T')[0]
    });
    setShowFinancingModal(true);
  };

  // Handle open repayment modal
  const openRepaymentModal = (finId = null) => {
    const id = finId || (selectedFinancierId !== 'all' ? selectedFinancierId : (financiers[0]?._id || ''));
    setRepaymentForm({
      ...emptyRepaymentForm,
      financierId: id,
      date: new Date().toISOString().split('T')[0]
    });
    setShowRepaymentModal(true);
  };

  // Handle open profile modal
  const openProfileModal = (financier = null) => {
    if (financier) {
      setEditingFinancier(financier);
      setProfileForm({
        name: financier.name,
        phone: financier.phone || '',
        email: financier.email || '',
        address: financier.address || '',
        notes: financier.notes || '',
        isActive: financier.isActive !== false
      });
    } else {
      setEditingFinancier(null);
      setProfileForm(emptyProfileForm);
    }
    setShowFinancierProfileModal(true);
  };

  // Submit Financing
  const handleSaveFinancing = async (e) => {
    e.preventDefault();
    if (!financingForm.financierId) {
      return toast.warning('Please select a financier');
    }
    if (!financingForm.amount || Number(financingForm.amount) <= 0) {
      return toast.warning('Please enter a valid amount');
    }

    try {
      await api.post('/api/erp/financiers/transaction', {
        ...financingForm,
        type: 'FINANCED'
      });
      toast.success('Milk bill financing recorded successfully!');
      setShowFinancingModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record financing');
    }
  };

  // Submit Repayment
  const handleSaveRepayment = async (e) => {
    e.preventDefault();
    if (!repaymentForm.financierId) {
      return toast.warning('Please select a financier');
    }
    if (!repaymentForm.amount || Number(repaymentForm.amount) <= 0) {
      return toast.warning('Please enter a valid amount');
    }

    try {
      await api.post('/api/erp/financiers/transaction', {
        ...repaymentForm,
        type: 'REPAYMENT'
      });
      toast.success('Repayment recorded successfully!');
      setShowRepaymentModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record repayment');
    }
  };

  // Save Financier Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      return toast.warning('Financier name is required');
    }

    try {
      if (editingFinancier) {
        await api.put(`/api/erp/financiers/${editingFinancier._id}`, profileForm);
        toast.success('Financier profile updated');
      } else {
        await api.post('/api/erp/financiers', profileForm);
        toast.success('New financier added');
      }
      setShowFinancierProfileModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save financier profile');
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (txn) => {
    if (!window.confirm(`Are you sure you want to delete transaction ${txn.transactionId} of ₹${txn.amount}? This will update the financier balance.`)) {
      return;
    }
    try {
      await api.delete(`/api/erp/financiers/transaction/${txn._id}`);
      toast.success('Transaction removed and balance recalculated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  // WhatsApp Share Single Receipt
  const handleShareReceiptWhatsApp = (txn) => {
    const targetFin = financiers.find(f => f._id === txn.financier);
    const rawPhone = (targetFin?.phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.slice(-10);

    const isFinanced = txn.type === 'FINANCED';
    const msg = `*MilQuu Fresh - Financier Transaction Receipt* 🧾\n\n` +
      `*Transaction ID:* ${txn.transactionId}\n` +
      `*Financier:* ${txn.financierName}\n` +
      `*Type:* ${isFinanced ? 'Milk Bill Financed (+)' : 'Lump Sum Repayment (-)'}\n` +
      `*Amount:* ₹${Number(txn.amount).toLocaleString('en-IN')}\n` +
      `*Date:* ${new Date(txn.date).toLocaleDateString('en-IN')}\n` +
      `*Mode:* ${txn.paymentMode} ${txn.reference ? `(Ref: ${txn.reference})` : ''}\n` +
      (txn.linkedVendor ? `*Vendor Paid:* ${txn.linkedVendor}\n` : '') +
      (txn.notes ? `*Notes:* ${txn.notes}\n` : '') +
      `*Net Outstanding Owed:* ₹${Number(txn.runningBalance || 0).toLocaleString('en-IN')}\n\n` +
      `${business.businessName}${business.address ? `, ${business.address}` : ''}.`;

    const url = phone && phone.length === 10
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // WhatsApp Share Full Statement
  const handleShareStatementWhatsApp = () => {
    const fin = currentFinancier || financiers[0];
    if (!fin) {
      return toast.warning('Please select a financier to share statement');
    }
    const rawPhone = (fin.phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.slice(-10);

    const msg = `*MilQuu Fresh - Financier Statement & Khata Summary* 📄\n\n` +
      `*Financier:* ${fin.name}\n` +
      `*Total Milk Bills Financed:* ₹${Number(fin.totalFinanced || 0).toLocaleString('en-IN')}\n` +
      `*Total Repaid to You:* ₹${Number(fin.totalRepaid || 0).toLocaleString('en-IN')}\n` +
      `*Current Net Outstanding Owed:* ₹${Number(fin.currentOutstanding || 0).toLocaleString('en-IN')}\n` +
      `*Status:* ${fin.currentOutstanding <= 0 ? 'Fully Cleared ✅' : 'Pending Settlement ⏳'}\n\n` +
      `As of: ${new Date().toLocaleDateString('en-IN')}\n` +
      `Thank you for your trusted partnership.\n` +
      `${business.businessName}${business.address ? `, ${business.address}` : ''}.`;

    const url = phone && phone.length === 10
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (transactions.length === 0) {
      return toast.info('No transactions to export');
    }
    const data = transactions.map(t => ({
      'Date': new Date(t.date).toLocaleDateString('en-IN'),
      'Transaction ID': t.transactionId,
      'Financier': t.financierName,
      'Type': t.type === 'FINANCED' ? 'Milk Bill Financed' : 'Lump Sum Repayment',
      'Vendor / Source': t.linkedVendor || '-',
      'Payment Mode': t.paymentMode,
      'Reference No': t.reference || '-',
      'Financed (+) ₹': t.type === 'FINANCED' ? t.amount : 0,
      'Repaid (-) ₹': t.type === 'REPAYMENT' ? t.amount : 0,
      'Outstanding Balance ₹': t.runningBalance,
      'Notes': t.notes || ''
    }));
    exportToExcel(data, `MilQuu_Financier_Ledger_${new Date().toISOString().split('T')[0]}`);
  };

  // Export PDF Statement
  const handleExportPDF = () => {
    if (transactions.length === 0) {
      return toast.info('No transactions to export');
    }
    const doc = new jsPDF();
    const titleFinancier = currentFinancier ? currentFinancier.name : 'All Financiers';

    // Header
    doc.setFontSize(18);
    doc.setTextColor(24, 43, 73);
    doc.text(business.businessName || 'MilQuu Fresh', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(business.address || 'Panvel, Navi Mumbai', 14, 26);
    doc.text(`Financier Account Statement: ${titleFinancier}`, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 38);

    // Summary box
    const totalF = currentFinancier ? currentFinancier.totalFinanced : metrics.totalFinancedAll;
    const totalR = currentFinancier ? currentFinancier.totalRepaid : metrics.totalRepaidAll;
    const totalO = currentFinancier ? currentFinancier.currentOutstanding : metrics.totalOutstandingAll;

    doc.setDrawColor(220, 225, 230);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 42, 182, 16, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(50);
    doc.text(`Total Financed: Rs. ${totalF.toLocaleString('en-IN')}`, 18, 52);
    doc.text(`Total Repaid: Rs. ${totalR.toLocaleString('en-IN')}`, 78, 52);
    doc.setTextColor(180, 50, 50);
    doc.text(`Balance Due: Rs. ${totalO.toLocaleString('en-IN')}`, 138, 52);

    // Table
    const tableRows = transactions.map((t, idx) => [
      idx + 1,
      new Date(t.date).toLocaleDateString('en-IN'),
      t.transactionId,
      t.financierName,
      t.type === 'FINANCED' ? `Financed (${t.linkedVendor || 'Procurement'})` : 'Repayment',
      t.paymentMode,
      t.type === 'FINANCED' ? `Rs. ${t.amount.toLocaleString('en-IN')}` : '-',
      t.type === 'REPAYMENT' ? `Rs. ${t.amount.toLocaleString('en-IN')}` : '-',
      `Rs. ${(t.runningBalance || 0).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 62,
      head: [['#', 'Date', 'Txn ID', 'Financier', 'Description', 'Mode', 'Financed (+)', 'Repaid (-)', 'Balance']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [24, 43, 73] },
      styles: { fontSize: 8 },
      foot: [['', '', '', '', 'Total', '', `Rs. ${totalF.toLocaleString('en-IN')}`, `Rs. ${totalR.toLocaleString('en-IN')}`, `Rs. ${totalO.toLocaleString('en-IN')}`]],
      footStyles: { fillColor: [240, 243, 246], textColor: [20, 30, 40], fontStyle: 'bold' }
    });

    doc.save(`MilQuu_Financier_Statement_${titleFinancier.replace(/\s+/g, '_')}.pdf`);
    toast.success('Statement PDF generated');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Landmark size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-milquu-dark flex items-center gap-2">
                Financier Khata <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">फाइनेंस लेजर</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Track milk procurement financing, vendor bill clearances, and lump-sum customer collection repayments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openFinancingModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} /> Bill Financed (+)
          </button>
          <button
            onClick={() => openRepaymentModal()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <ArrowDownLeft size={16} /> Settle / Repay (-)
          </button>
          <button
            onClick={() => openProfileModal()}
            className="px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Users size={16} /> + Financier
          </button>
          <button
            onClick={() => setShowStatementModal(true)}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            title="Statement / Passbook View"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Financed */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Milk Financed</p>
            <h3 className="text-2xl font-bold text-milquu-dark">
              ₹{(currentFinancier ? currentFinancier.totalFinanced : metrics.totalFinancedAll).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Building2 size={12} className="text-gray-400" /> Procurement dues paid
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Landmark size={22} />
          </div>
        </div>

        {/* Card 2: Total Repaid */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Money Repaid</p>
            <h3 className="text-2xl font-bold text-emerald-600">
              ₹{(currentFinancier ? currentFinancier.totalRepaid : metrics.totalRepaidAll).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Returned from collections
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 3: Pending Balance Due */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Outstanding Dues Owed</p>
            <h3 className="text-2xl font-bold text-amber-600">
              ₹{(currentFinancier ? currentFinancier.currentOutstanding : metrics.totalOutstandingAll).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-amber-700 mt-1 font-semibold flex items-center gap-1">
              <Clock size={12} />
              {(currentFinancier ? currentFinancier.currentOutstanding : metrics.totalOutstandingAll) <= 0 
                ? 'Fully settled account' 
                : 'Pending to repay financier'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* Card 4: Customer Credit vs Financier Coverage */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Credit Coverage</p>
            <h3 className="text-2xl font-bold text-indigo-700">
              ₹{metrics.totalCustomerCredit.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs mt-1 font-medium text-gray-500">
              {metrics.workingCapitalGap >= 0 ? (
                <span className="text-emerald-600 font-bold">
                  +₹{metrics.workingCapitalGap.toLocaleString('en-IN')} Surplus Margin
                </span>
              ) : (
                <span className="text-red-500 font-bold">
                  ₹{Math.abs(metrics.workingCapitalGap).toLocaleString('en-IN')} Deficit Gap
                </span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Financiers Selector Bar & Profile Info */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedFinancierId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFinancierId === 'all'
                  ? 'bg-milquu-dark text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Financiers ({financiers.length})
            </button>
            {financiers.map(f => (
              <button
                key={f._id}
                onClick={() => setSelectedFinancierId(f._id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  selectedFinancierId === f._id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{f.name}</span>
                {f.currentOutstanding > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedFinancierId === f._id ? 'bg-indigo-800 text-amber-200' : 'bg-amber-100 text-amber-800'
                  }`}>
                    ₹{f.currentOutstanding.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            ))}
          </div>

          {currentFinancier && (
            <div className="flex items-center gap-2 text-xs">
              {currentFinancier.phone && (
                <a
                  href={`tel:${currentFinancier.phone}`}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-1 font-semibold"
                >
                  <Phone size={12} className="text-emerald-600" /> {currentFinancier.phone}
                </a>
              )}
              <button
                onClick={handleShareStatementWhatsApp}
                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1 font-bold cursor-pointer"
                title="Send WhatsApp Statement"
              >
                <Share2 size={12} /> WhatsApp Statement
              </button>
              <button
                onClick={() => openProfileModal(currentFinancier)}
                className="px-2.5 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-1 font-medium cursor-pointer"
                title="Edit Financier Profile"
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>
          )}
        </div>

        {/* If no financiers added yet */}
        {financiers.length === 0 && !loading && (
          <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <Landmark size={32} className="mx-auto text-gray-400 mb-2" />
            <h4 className="text-sm font-bold text-gray-700">No Financier profile created yet</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Add your financier (e.g. the investor financing daily milk bills) to track capital provided and lump-sum repayments.
            </p>
            <button
              onClick={() => openProfileModal()}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer"
            >
              + Add First Financier
            </button>
          </div>
        )}
      </div>

      {/* Transactions Ledger / Passbook */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Table Controls / Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ref, vendor, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLedger()}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-gray-700"
            >
              <option value="all">All Types</option>
              <option value="FINANCED">Milk Bill Financed (+)</option>
              <option value="REPAYMENT">Repayment (-)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Download size={13} /> Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-milquu-dark text-white rounded-xl text-xs font-bold hover:bg-gray-800 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Download size={13} /> PDF
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Txn ID & Mode</th>
                <th className="px-4 py-3">Financier</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Vendor / Purpose</th>
                <th className="px-4 py-3 text-right">Financed (+)</th>
                <th className="px-4 py-3 text-right">Repaid (-)</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400">
                    <FileText size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-xs">No transactions found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Record a milk bill financed or a repayment to see passbook entries here.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isFinanced = t.type === 'FINANCED';
                  return (
                    <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-gray-800">
                          {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-gray-800">{t.transactionId}</span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                          <CreditCard size={10} />
                          <span>{t.paymentMode}</span>
                          {t.reference && <span className="text-gray-400">({t.reference})</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {t.financierName}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {isFinanced ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowUpRight size={10} /> Financed (+)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <ArrowDownLeft size={10} /> Repayment (-)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        {t.linkedVendor ? (
                          <div className="font-bold text-gray-800 flex items-center gap-1">
                            <Building2 size={11} className="text-gray-400" />
                            <span>{t.linkedVendor}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Procurement General</span>
                        )}
                        {t.notes && <p className="text-[10px] text-gray-500 truncate mt-0.5">{t.notes}</p>}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {isFinanced ? (
                          <span className="font-bold text-emerald-700 text-xs">
                            +₹{t.amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {!isFinanced ? (
                          <span className="font-bold text-blue-700 text-xs">
                            -₹{t.amount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-gray-900 text-xs">
                        ₹{(t.runningBalance || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleShareReceiptWhatsApp(t)}
                            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"
                            title="Share receipt via WhatsApp"
                          >
                            <Share2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(t)}
                            className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD MILK BILL FINANCED                                       */}
      {/* ========================================================================= */}
      {showFinancingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-milquu-dark flex items-center gap-1.5">
                  <Landmark size={18} className="text-emerald-600" /> Record Milk Bill Financed
                </h3>
                <p className="text-xs text-gray-500">Record when the financier pays a milk vendor bill</p>
              </div>
              <button
                onClick={() => setShowFinancingModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFinancing} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Financier *</label>
                <select
                  required
                  value={financingForm.financierId}
                  onChange={(e) => setFinancingForm({ ...financingForm, financierId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 font-medium"
                >
                  <option value="">Select a Financier</option>
                  {financiers.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} {f.phone ? `(${f.phone})` : ''} - Owed: ₹{f.currentOutstanding.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bill Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="any"
                    placeholder="e.g. 25000"
                    value={financingForm.amount}
                    onChange={(e) => setFinancingForm({ ...financingForm, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={financingForm.date}
                    onChange={(e) => setFinancingForm({ ...financingForm, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Milk Vendor / Supplier Name</label>
                <input
                  type="text"
                  list="vendor-names-list"
                  placeholder="e.g. Sangamner Chilling Center"
                  value={financingForm.linkedVendor}
                  onChange={(e) => setFinancingForm({ ...financingForm, linkedVendor: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                />
                <datalist id="vendor-names-list">
                  {vendorNames.map((name, idx) => (
                    <option key={idx} value={name} />
                  ))}
                </datalist>
              </div>

              {financingForm.linkedVendor && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="clearVendorDue"
                    checked={financingForm.clearVendorDue}
                    onChange={(e) => setFinancingForm({ ...financingForm, clearVendorDue: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="clearVendorDue" className="text-[11px] text-emerald-900 font-medium cursor-pointer">
                    <strong>Auto-clear in Purchases Ledger:</strong> Mark this vendor's purchase bill as paid by Financier so you don't enter it twice.
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={financingForm.paymentMode}
                    onChange={(e) => setFinancingForm({ ...financingForm, paymentMode: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">UTR / Ref Number</label>
                  <input
                    type="text"
                    placeholder="Optional UTR / Ref"
                    value={financingForm.reference}
                    onChange={(e) => setFinancingForm({ ...financingForm, reference: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Narration</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Cleared morning cow milk purchase"
                  value={financingForm.notes}
                  onChange={(e) => setFinancingForm({ ...financingForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFinancingModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  Record Financing (+)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD REPAYMENT TO FINANCIER                                    */}
      {/* ========================================================================= */}
      {showRepaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-milquu-dark flex items-center gap-1.5">
                  <ArrowDownLeft size={18} className="text-blue-600" /> Settle / Repay Financier
                </h3>
                <p className="text-xs text-gray-500">Record lump-sum payments returned to the financier</p>
              </div>
              <button
                onClick={() => setShowRepaymentModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRepayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Financier *</label>
                <select
                  required
                  value={repaymentForm.financierId}
                  onChange={(e) => setRepaymentForm({ ...repaymentForm, financierId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 font-medium"
                >
                  <option value="">Select a Financier</option>
                  {financiers.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name} - Owed: ₹{f.currentOutstanding.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Outstanding balance badge & quick chips */}
              {(() => {
                const targetFin = financiers.find(f => f._id === repaymentForm.financierId);
                const due = targetFin ? targetFin.currentOutstanding : 0;
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-amber-800 font-semibold text-xs">Current Outstanding Owed:</span>
                      <span className="text-amber-900 font-black text-sm">₹{due.toLocaleString('en-IN')}</span>
                    </div>
                    {due > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => setRepaymentForm({ ...repaymentForm, amount: due })}
                          className="px-2 py-0.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 rounded-md text-[10px] font-bold cursor-pointer"
                        >
                          Pay Full Due (₹{due.toLocaleString('en-IN')})
                        </button>
                        {[5000, 10000, 25000, 50000].filter(a => a < due).map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setRepaymentForm({ ...repaymentForm, amount: amt })}
                            className="px-2 py-0.5 bg-white border border-amber-300 text-amber-900 rounded-md text-[10px] font-medium hover:bg-amber-100 cursor-pointer"
                          >
                            ₹{amt.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Repayment Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="any"
                    placeholder="e.g. 15000"
                    value={repaymentForm.amount}
                    onChange={(e) => setRepaymentForm({ ...repaymentForm, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={repaymentForm.date}
                    onChange={(e) => setRepaymentForm({ ...repaymentForm, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={repaymentForm.paymentMode}
                    onChange={(e) => setRepaymentForm({ ...repaymentForm, paymentMode: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">UTR / Ref Number</label>
                  <input
                    type="text"
                    placeholder="Optional Ref / Cheque No"
                    value={repaymentForm.reference}
                    onChange={(e) => setRepaymentForm({ ...repaymentForm, reference: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Source / Narration</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Lump sum repayment from monthly customer khata collections"
                  value={repaymentForm.notes}
                  onChange={(e) => setRepaymentForm({ ...repaymentForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRepaymentModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  Confirm Repayment (-)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT FINANCIER PROFILE                                     */}
      {/* ========================================================================= */}
      {showFinancierProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-milquu-dark flex items-center gap-1.5">
                  <Users size={18} className="text-indigo-600" /> 
                  {editingFinancier ? 'Edit Financier Profile' : 'Add New Financier'}
                </h3>
                <p className="text-xs text-gray-500">Financier / Capital partner details</p>
              </div>
              <button
                onClick={() => setShowFinancierProfileModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rajesh Patel"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number (10 digits)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Panvel, Navi Mumbai"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Partnership Notes / Terms</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Weekly milk procurement funding, 0% interest principal settlement"
                  value={profileForm.notes}
                  onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveFinancier"
                  checked={profileForm.isActive}
                  onChange={(e) => setProfileForm({ ...profileForm, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActiveFinancier" className="text-gray-700 font-medium cursor-pointer">
                  Active Financier
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFinancierProfileModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PASSBOOK STATEMENT MODAL (PREVIEW, PRINT, WHATSAPP)              */}
      {/* ========================================================================= */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/70 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Header toolbar */}
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2 no-print shadow-xs">
              <div className="flex items-center gap-2">
                <Landmark size={18} className="text-indigo-600" />
                <span className="font-bold text-milquu-dark text-sm">
                  Financier Statement: {currentFinancier ? currentFinancier.name : 'All Financiers'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareStatementWhatsApp}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Share2 size={13} /> WhatsApp
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 bg-milquu-dark text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} /> PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} /> Excel
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Statement Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Business Header */}
              <div className="border-b border-gray-200 pb-5 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-milquu-dark">{business.businessName || 'MilQuu Fresh'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{business.tagline || 'Pure Farm Fresh Milk & Dairy'}</p>
                  <p className="text-xs text-gray-500">{business.address}</p>
                  {business.supportPhone && <p className="text-xs text-gray-500">Phone: {business.supportPhone}</p>}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    FINANCIER STATEMENT
                  </span>
                  <p className="text-xs text-gray-500 mt-2">Date: {new Date().toLocaleDateString('en-IN')}</p>
                  {currentFinancier && (
                    <div className="mt-2 text-xs">
                      <p className="font-bold text-gray-800">Financier: {currentFinancier.name}</p>
                      {currentFinancier.phone && <p className="text-gray-500">Phone: {currentFinancier.phone}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">Total Financed</span>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    ₹{(currentFinancier ? currentFinancier.totalFinanced : metrics.totalFinancedAll).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Total Repaid</span>
                  <p className="text-xl font-bold text-emerald-800 mt-1">
                    ₹{(currentFinancier ? currentFinancier.totalRepaid : metrics.totalRepaidAll).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase">Outstanding Due</span>
                  <p className="text-xl font-black text-amber-900 mt-1">
                    ₹{(currentFinancier ? currentFinancier.currentOutstanding : metrics.totalOutstandingAll).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Passbook Table */}
              <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Txn ID</th>
                    <th className="p-2.5">Description / Vendor</th>
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5 text-right">Financed (+)</th>
                    <th className="p-2.5 text-right">Repaid (-)</th>
                    <th className="p-2.5 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td className="p-2.5">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-2.5 font-mono">{t.transactionId}</td>
                      <td className="p-2.5">
                        {t.linkedVendor ? `Vendor Bill: ${t.linkedVendor}` : (t.type === 'FINANCED' ? 'Milk Financing' : 'Lump Sum Repayment')}
                        {t.notes && <div className="text-[10px] text-gray-400">{t.notes}</div>}
                      </td>
                      <td className="p-2.5">{t.paymentMode}</td>
                      <td className="p-2.5 text-right font-semibold text-emerald-700">
                        {t.type === 'FINANCED' ? `₹${t.amount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-blue-700">
                        {t.type === 'REPAYMENT' ? `₹${t.amount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-gray-900">
                        ₹{(t.runningBalance || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                This is a computer generated financier statement by {business.businessName}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financiers;

