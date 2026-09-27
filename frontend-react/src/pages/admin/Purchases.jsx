import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, Search, Filter, Download,
  TrendingUp, Truck, Package, IndianRupee, Factory, Edit2, Trash2,
  FileText, Printer, CheckCircle, Clock, AlertCircle, Eye,
  ArrowUpRight, ArrowDownLeft, Calendar, User, Phone, MapPin,
  CreditCard, ChevronRight, Share2, X, RefreshCw, BookOpen, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { exportToExcel } from '../../utils/exportUtils.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Purchases = () => {
  // Navigation & Filter Tabs
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' | 'vendors'
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('all');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');

  // Core Data
  const [purchaseData, setPurchaseData] = useState([]);
  const [vendorsSummary, setVendorsSummary] = useState([]);
  const [vendorSummaryMetrics, setVendorSummaryMetrics] = useState({
    totalVendors: 0,
    totalBilledAll: 0,
    totalPaidAll: 0,
    totalOutstandingAll: 0,
    vendorsWithDues: 0
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal 1: Add / Edit Purchase Order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyFormData = {
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    supplierPhone: '',
    supplierAddress: '',
    supplierGst: '',
    category: 'Raw Milk',
    productName: '',
    quantity: '',
    unit: 'Litre',
    rate: '',
    sellingPrice: '',
    paidAmount: '',
    paymentMode: 'Cash',
    status: 'Pending',
    notes: ''
  };
  const [formData, setFormData] = useState(emptyFormData);

  // Modal 2: Printable Purchase Bill / Invoice
  const [selectedPurchaseForBill, setSelectedPurchaseForBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Modal 3: Vendor Ledger Statement
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedVendorForLedger, setSelectedVendorForLedger] = useState(null);
  const [vendorLedgerData, setVendorLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Modal 4: Record Vendor Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    supplierName: '',
    supplierPhone: '',
    purchaseId: '',
    amount: '',
    paymentMode: 'Cash',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [currentVendorDue, setCurrentVendorDue] = useState(0);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [purchaseRes, productRes, vendorRes] = await Promise.all([
        api.get('/api/erp/purchases'),
        api.get('/api/products'),
        api.get('/api/erp/vendors/summary')
      ]);
      setPurchaseData(purchaseRes.data || []);
      setProducts(productRes.data || []);
      if (vendorRes.data) {
        setVendorsSummary(vendorRes.data.vendors || []);
        if (vendorRes.data.summary) {
          setVendorSummaryMetrics(vendorRes.data.summary);
        }
      }
    } catch (error) {
      console.error('Error fetching purchase & vendor data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Vendor Ledger
  const fetchVendorLedger = async (vendorName) => {
    if (!vendorName) return;
    try {
      setLoadingLedger(true);
      setSelectedVendorForLedger(vendorName);
      setShowLedgerModal(true);
      const res = await api.get(`/api/erp/vendors/${encodeURIComponent(vendorName)}/ledger`);
      setVendorLedgerData(res.data);
    } catch (error) {
      console.error('Error loading vendor ledger', error);
      alert('Failed to load vendor ledger statement.');
    } finally {
      setLoadingLedger(false);
    }
  };

  // Open Add PO Modal
  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  // Open Edit PO Modal
  const openEditModal = (purchase) => {
    setEditingId(purchase._id);
    const product = products.find((p) => p.name === purchase.productName);
    setFormData({
      date: new Date(purchase.date).toISOString().split('T')[0],
      supplierName: purchase.supplierName || '',
      supplierPhone: purchase.supplierPhone || '',
      supplierAddress: purchase.supplierAddress || '',
      supplierGst: purchase.supplierGst || '',
      category: purchase.category || 'Raw Milk',
      productName: purchase.productName || '',
      quantity: purchase.quantity || '',
      unit: purchase.unit || 'Litre',
      rate: purchase.rate || '',
      sellingPrice: product ? product.price : '',
      paidAmount: purchase.paidAmount !== undefined ? purchase.paidAmount : (purchase.status === 'Paid' ? purchase.totalCost : 0),
      paymentMode: purchase.paymentMode || 'Cash',
      status: purchase.status || 'Pending',
      notes: purchase.notes || ''
    });
    setIsModalOpen(true);
  };

  // Delete Purchase
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase order? This will also reverse its effect on inventory stock.')) return;
    try {
      await api.delete(`/api/erp/purchases/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting purchase', error);
      alert('Failed to delete purchase');
    }
  };

  // Handle Save / Update Purchase
  const handleSavePurchase = async (e) => {
    e.preventDefault();
    try {
      const quantity = Number(formData.quantity) || 0;
      const rate = Number(formData.rate) || 0;
      const totalCost = quantity * rate;
      let paidAmount = Number(formData.paidAmount) || 0;

      if (formData.status === 'Paid' && paidAmount === 0) {
        paidAmount = totalCost;
      }
      const balanceAmount = Math.max(0, totalCost - paidAmount);

      const payload = {
        ...formData,
        quantity,
        rate,
        totalCost,
        paidAmount,
        balanceAmount
      };

      if (editingId) {
        await api.put(`/api/erp/purchases/${editingId}`, payload);
      } else {
        const poNumber = `PO-${Date.now().toString().slice(-6)}`;
        await api.post('/api/erp/purchases', { ...payload, poNumber });
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData(emptyFormData);
      await fetchData();
    } catch (error) {
      console.error('Error saving purchase', error);
      alert('Failed to save purchase: ' + (error.response?.data?.message || error.message));
    }
  };

  // Open Payment Modal
  const openRecordPaymentModal = (vendorName = '', phone = '', due = 0, purchaseId = '') => {
    setCurrentVendorDue(due);
    setPaymentFormData({
      supplierName: vendorName,
      supplierPhone: phone,
      purchaseId: purchaseId || '',
      amount: due > 0 ? due.toString() : '',
      paymentMode: 'Cash',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      notes: purchaseId ? 'Bill payment' : 'Vendor khata payment'
    });
    setShowPaymentModal(true);
  };

  // Save Vendor Payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    const payAmount = Number(paymentFormData.amount);
    if (!payAmount || payAmount <= 0) {
      alert('Please enter a valid payment amount greater than 0');
      return;
    }
    try {
      await api.post('/api/erp/vendors/payment', paymentFormData);
      setShowPaymentModal(false);
      await fetchData();
      if (showLedgerModal && selectedVendorForLedger) {
        await fetchVendorLedger(selectedVendorForLedger);
      }
      alert(`Payment of ₹${payAmount.toLocaleString('en-IN')} recorded successfully!`);
    } catch (error) {
      console.error('Error recording payment', error);
      alert('Failed to record payment: ' + (error.response?.data?.message || error.message));
    }
  };

  // View Bill Modal
  const openBillModal = (purchase) => {
    setSelectedPurchaseForBill(purchase);
    setShowBillModal(true);
  };

  // Print Bill
  const handlePrint = () => {
    window.print();
  };

  // Download Bill PDF
  const handleDownloadBillPDF = (purchase) => {
    if (!purchase) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Brand Header Banner
      doc.setFillColor(30, 41, 59); // Milquu dark slate
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('MilQuu Fresh', 14, 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text('Pure Farm Fresh Milk & Premium Dairy Products', 14, 19);
      doc.text('Panvel, Navi Mumbai | Tel: +91 87670 67884 | support@milquufresh.in', 14, 24);

      // Title & Voucher Details
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('PURCHASE INVOICE / VOUCHER', 14, 38);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Voucher / PO No: ${purchase.poNumber || 'N/A'}`, 14, 45);
      doc.text(`Issue Date: ${new Date(purchase.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 51);
      doc.text(`Payment Status: ${purchase.status?.toUpperCase() || 'PENDING'}`, 14, 57);

      // Vendor Info Block
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('SUPPLIER / VENDOR DETAILS:', 115, 38);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Name: ${purchase.supplierName || 'N/A'}`, 115, 45);
      doc.text(`Phone: ${purchase.supplierPhone || 'N/A'}`, 115, 51);
      if (purchase.supplierAddress) {
        doc.text(`Address: ${purchase.supplierAddress}`, 115, 57);
      }

      // Line items table
      const totalCost = Number(purchase.totalCost || 0);
      const paidAmount = Number(purchase.paidAmount || (purchase.status === 'Paid' ? totalCost : 0));
      const balanceAmount = Math.max(0, totalCost - paidAmount);

      autoTable(doc, {
        startY: 65,
        head: [['#', 'Item / Material Description', 'Category', 'Quantity', 'Rate (INR)', 'Total Amount (INR)']],
        body: [
          [
            '1',
            purchase.productName || 'Material Supply',
            purchase.category || 'Raw Milk',
            `${purchase.quantity} ${purchase.unit || 'Litre'}`,
            `₹${Number(purchase.rate || 0).toFixed(2)}`,
            `₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
        foot: [
          ['', '', '', '', 'Total Purchase Cost:', `₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
          ['', '', '', '', 'Amount Paid:', `₹${paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
          ['', '', '', '', 'Balance Due / Payable:', `₹${balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
        ],
        footStyles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [15, 23, 42], fontSize: 9 }
      });

      // Notes and Payment Details
      let endY = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      if (purchase.notes) {
        doc.text(`Notes / Remarks: ${purchase.notes}`, 14, endY);
        endY += 6;
      }
      doc.text(`Payment Mode: ${purchase.paymentMode || 'Cash'}`, 14, endY);

      // Signatures
      const sigY = Math.max(endY + 28, 140);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, sigY, 70, sigY);
      doc.text('Vendor / Supplier Signature', 14, sigY + 5);

      doc.line(130, sigY, 190, sigY);
      doc.text('Authorized Signatory (MilQuu Fresh)', 130, sigY + 5);

      // Bottom footer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('This is a computer-generated voucher issued by MilQuu Fresh Dairy ERP.', 14, 285);

      doc.save(`MilQuu_Purchase_Bill_${purchase.poNumber || 'Voucher'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF bill', err);
      alert('Could not download PDF. Please try the Print option.');
    }
  };

  // WhatsApp Share for Purchase Bill
  const handleShareBillWhatsApp = (purchase) => {
    if (!purchase) return;
    const rawPhone = (purchase.supplierPhone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.slice(-10);
    const totalCost = Number(purchase.totalCost || 0);
    const paidAmount = Number(purchase.paidAmount || (purchase.status === 'Paid' ? totalCost : 0));
    const balanceAmount = Math.max(0, totalCost - paidAmount);

    const msg = `*MilQuu Fresh - Purchase Bill / Voucher* 🥛\n\n` +
      `*PO / Voucher No:* ${purchase.poNumber}\n` +
      `*Date:* ${new Date(purchase.date).toLocaleDateString('en-IN')}\n` +
      `*Vendor:* ${purchase.supplierName}\n` +
      `*Item:* ${purchase.productName} (${purchase.category})\n` +
      `*Quantity:* ${purchase.quantity} ${purchase.unit || 'Litre'} @ ₹${purchase.rate}\n` +
      `*Total Cost:* ₹${totalCost.toLocaleString('en-IN')}\n` +
      `*Amount Paid:* ₹${paidAmount.toLocaleString('en-IN')}\n` +
      `*Balance Due:* ₹${balanceAmount.toLocaleString('en-IN')}\n` +
      `*Status:* ${purchase.status?.toUpperCase()}\n\n` +
      `Thank you for your trusted supply to MilQuu Fresh!`;

    const url = phone && phone.length === 10
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Download Vendor Ledger PDF
  const handleDownloadLedgerPDF = () => {
    if (!vendorLedgerData) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Brand Header Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('MilQuu Fresh - Vendor Account Statement', 14, 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text('Dairy Supply Ledger & Khata Account Statement', 14, 19);
      doc.text('Panvel, Navi Mumbai | Tel: +91 87670 67884', 14, 24);

      // Vendor Info & Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Vendor: ${vendorLedgerData.vendor?.name || 'Supplier'}`, 14, 38);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Contact: ${vendorLedgerData.vendor?.phone || 'N/A'}`, 14, 44);
      if (vendorLedgerData.vendor?.address) {
        doc.text(`Address: ${vendorLedgerData.vendor?.address}`, 14, 49);
      }
      doc.text(`Statement Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 54);

      // Financial Summary Box on Right
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Purchases: INR ${Number(vendorLedgerData.summary?.totalBilled || 0).toLocaleString('en-IN')}`, 115, 38);
      doc.text(`Total Paid: INR ${Number(vendorLedgerData.summary?.totalPaid || 0).toLocaleString('en-IN')}`, 115, 44);
      
      const bal = Number(vendorLedgerData.summary?.balanceDue || 0);
      doc.setTextColor(bal > 0 ? 185 : 22, bal > 0 ? 28 : 101, bal > 0 ? 28 : 52);
      doc.text(`Net Outstanding Balance: INR ${bal.toLocaleString('en-IN')}`, 115, 50);

      let currentY = 60;

      // Products Supplied Table
      if (vendorLedgerData.productsBreakdown && vendorLedgerData.productsBreakdown.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Products & Materials Supplied Breakdown:', 14, currentY);

        autoTable(doc, {
          startY: currentY + 3,
          head: [['Product Name', 'Category', 'Total Qty Supplied', 'Total Cost (INR)']],
          body: vendorLedgerData.productsBreakdown.map((p) => [
            p.name,
            p.category || 'General',
            `${p.quantity} ${p.unit || ''}`,
            `₹${Number(p.totalCost).toLocaleString('en-IN')}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontSize: 8.5 },
          bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] }
        });
        currentY = doc.lastAutoTable.finalY + 10;
      }

      // Chronological Ledger Table
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Ledger Transactions (Bills & Payments):', 14, currentY);

      autoTable(doc, {
        startY: currentY + 3,
        head: [['Date', 'Type', 'Ref #', 'Particulars / Details', 'Debit (Billed)', 'Credit (Paid)', 'Balance (INR)']],
        body: vendorLedgerData.transactions.map((t) => [
          new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          t.type,
          t.refNo || '-',
          t.productName || t.notes || '-',
          t.debit > 0 ? `₹${Number(t.debit).toLocaleString('en-IN')}` : '-',
          t.credit > 0 ? `₹${Number(t.credit).toLocaleString('en-IN')}` : '-',
          `₹${Number(t.balance).toLocaleString('en-IN')}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] }
      });

      const safeName = (vendorLedgerData.vendor?.name || 'Vendor').replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`MilQuu_Vendor_Statement_${safeName}.pdf`);
    } catch (err) {
      console.error('Error downloading vendor ledger PDF', err);
      alert('Could not download PDF.');
    }
  };

  // Download Vendor Ledger Excel
  const handleDownloadLedgerExcel = () => {
    if (!vendorLedgerData || !vendorLedgerData.transactions) return;
    const rows = vendorLedgerData.transactions.map((t, idx) => ({
      'S.No': idx + 1,
      'Date': new Date(t.date).toLocaleDateString('en-IN'),
      'Transaction Type': t.type,
      'Reference / Voucher': t.refNo || '',
      'Item / Particulars': t.productName || '',
      'Quantity': t.quantity ? `${t.quantity} ${t.unit}` : '',
      'Rate (INR)': t.rate || '',
      'Debit (Billed Amount)': t.debit || 0,
      'Credit (Paid Amount)': t.credit || 0,
      'Running Balance (INR)': t.balance || 0,
      'Payment Mode': t.paymentMode || '',
      'Notes': t.notes || ''
    }));

    const safeName = (vendorLedgerData.vendor?.name || 'Vendor').replace(/[^a-zA-Z0-9]/g, '_');
    exportToExcel(rows, `Vendor_Ledger_${safeName}_${new Date().toISOString().split('T')[0]}`);
  };

  // WhatsApp Share for Vendor Statement
  const handleShareLedgerWhatsApp = () => {
    if (!vendorLedgerData) return;
    const rawPhone = (vendorLedgerData.vendor?.phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.slice(-10);
    const s = vendorLedgerData.summary || {};

    const msg = `*MilQuu Fresh - Vendor Account Statement* 📄\n\n` +
      `*Vendor:* ${vendorLedgerData.vendor?.name}\n` +
      `*Total Purchases:* ₹${Number(s.totalBilled || 0).toLocaleString('en-IN')}\n` +
      `*Total Money Paid:* ₹${Number(s.totalPaid || 0).toLocaleString('en-IN')}\n` +
      `*Current Net Balance:* ₹${Number(s.balanceDue || 0).toLocaleString('en-IN')}\n` +
      `*Status:* ${s.balanceDue <= 0 ? 'Fully Settled ✅' : 'Pending Payment ⏳'}\n\n` +
      `As of: ${new Date().toLocaleDateString('en-IN')}\n` +
      `MilQuu Fresh Dairy, Panvel, Navi Mumbai.`;

    const url = phone && phone.length === 10
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Export current tab (Purchases or Vendors) to Excel
  const handleExport = () => {
    if (activeTab === 'purchases') {
      if (purchaseData.length === 0) {
        alert('No purchase orders to export');
        return;
      }
      const rows = purchaseData.map((p) => {
        const total = Number(p.totalCost || 0);
        const paid = Number(p.paidAmount || (p.status === 'Paid' ? total : 0));
        const balance = Math.max(0, total - paid);
        return {
          'PO Number': p.poNumber || '',
          'Date': new Date(p.date).toLocaleDateString('en-IN'),
          'Supplier Name': p.supplierName || '',
          'Supplier Contact': p.supplierPhone || '',
          'Category': p.category || '',
          'Product Name': p.productName || '',
          'Quantity': p.quantity || 0,
          'Unit': p.unit || 'Litre',
          'Rate (INR)': p.rate || 0,
          'Total Cost (INR)': total,
          'Paid Amount (INR)': paid,
          'Balance Due (INR)': balance,
          'Payment Mode': p.paymentMode || '',
          'Status': p.status || '',
          'Notes': p.notes || ''
        };
      });
      exportToExcel(rows, `MilQuu_Purchase_Orders_${new Date().toISOString().split('T')[0]}`);
    } else {
      if (vendorsSummary.length === 0) {
        alert('No vendor summary data to export');
        return;
      }
      const rows = vendorsSummary.map((v) => ({
        'Vendor Name': v.supplierName,
        'Phone': v.supplierPhone || '',
        'Total POs': v.totalPurchasesCount || 0,
        'Products Supplied': v.productsList?.map((p) => `${p.name} (${p.totalQty} ${p.unit})`).join(', ') || '',
        'Total Billed (INR)': v.totalBilled || 0,
        'Total Paid (INR)': v.totalPaid || 0,
        'Balance Due (INR)': v.balanceDue || 0,
        'Status': v.status || '',
        'Last Purchase': v.lastPurchaseDate ? new Date(v.lastPurchaseDate).toLocaleDateString('en-IN') : ''
      }));
      exportToExcel(rows, `MilQuu_Vendor_Khata_${new Date().toISOString().split('T')[0]}`);
    }
  };

  // Calculated margin for Add/Edit PO
  const rateVal = Number(formData.rate) || 0;
  const spVal = Number(formData.sellingPrice) || 0;
  const marginPercentage = rateVal > 0 ? (((spVal - rateVal) / rateVal) * 100).toFixed(1) : 0;
  const computedTotalCost = (Number(formData.quantity) || 0) * rateVal;
  const computedPaid = Number(formData.paidAmount) || 0;
  const computedBalance = Math.max(0, computedTotalCost - computedPaid);

  // Monthly Purchase Cost
  const totalMonthlyCost = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return purchaseData.filter((e) => {
      try {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      } catch {
        return false;
      }
    }).reduce((sum, e) => sum + (e.totalCost || 0), 0);
  }, [purchaseData]);

  // Active Suppliers Count
  const activeSuppliersCount = useMemo(() => {
    return new Set(purchaseData.map((p) => p.supplierName).filter(Boolean)).size;
  }, [purchaseData]);

  // Pending deliveries
  const pendingDeliveriesCount = useMemo(() => {
    return purchaseData.filter((p) => p.status === 'Pending').length;
  }, [purchaseData]);

  // Trend data for chart
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      let d = new Date();
      d.setMonth(currentMonthIndex - i);
      last6Months.push({
        name: months[d.getMonth()],
        month: d.getMonth(),
        year: d.getFullYear(),
        cost: 0
      });
    }

    purchaseData.forEach((p) => {
      const d = new Date(p.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      const target = last6Months.find((item) => item.month === m && item.year === y);
      if (target) {
        target.cost += p.totalCost || 0;
      }
    });

    return last6Months;
  }, [purchaseData]);

  // Unique supplier names list for autocomplete
  const existingSupplierNames = useMemo(() => {
    return Array.from(new Set(purchaseData.map((p) => p.supplierName).filter(Boolean)));
  }, [purchaseData]);

  // Filtered Purchases list
  const filteredPurchases = useMemo(() => {
    return purchaseData.filter((p) => {
      const matchSearch =
        (p.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = purchaseStatusFilter === 'all' || p.status === purchaseStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseData, searchTerm, purchaseStatusFilter]);

  // Filtered Vendors list
  const filteredVendors = useMemo(() => {
    return vendorsSummary.filter((v) => {
      const matchSearch =
        (v.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.supplierPhone || '').includes(searchTerm);
      let matchStatus = true;
      if (vendorStatusFilter === 'dues') {
        matchStatus = v.balanceDue > 0;
      } else if (vendorStatusFilter === 'settled') {
        matchStatus = v.balanceDue <= 0;
      }
      return matchSearch && matchStatus;
    });
  }, [vendorsSummary, searchTerm, vendorStatusFilter]);

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pt-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Purchase Management</h1>
            <span className="bg-blue-100 text-milquu-blue text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              ERP & Khata
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Manage vendor procurements, generate purchase bills, and track supplier ledger accounting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} /> Export {activeTab === 'purchases' ? 'Orders' : 'Khata'}
          </button>
          {activeTab === 'vendors' && (
            <button
              onClick={() => openRecordPaymentModal()}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <IndianRupee size={17} /> Record Vendor Payment
            </button>
          )}
          <button
            onClick={openAddModal}
            className="bg-milquu-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6 gap-8">
        <button
          onClick={() => { setActiveTab('purchases'); setSearchTerm(''); }}
          className={`pb-3.5 text-sm font-bold flex items-center gap-2.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'border-milquu-blue text-milquu-blue'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingCart size={18} />
          <span>Purchase Orders</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'purchases' ? 'bg-blue-100 text-milquu-blue' : 'bg-gray-100 text-gray-600'
          }`}>
            {purchaseData.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('vendors'); setSearchTerm(''); }}
          className={`pb-3.5 text-sm font-bold flex items-center gap-2.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'vendors'
              ? 'border-milquu-blue text-milquu-blue'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen size={18} />
          <span>Vendor Accounting & Ledger (Khata)</span>
          {vendorSummaryMetrics.totalOutstandingAll > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
              ₹{vendorSummaryMetrics.totalOutstandingAll.toLocaleString('en-IN')} Due
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'purchases' && (
        <>
          {/* Top Dashboard Metrics & Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {/* KPI Cards */}
            <div className="flex flex-col space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between flex-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Purchase Cost</p>
                  <h3 className="text-3xl font-bold text-milquu-dark">₹{totalMonthlyCost.toLocaleString('en-IN')}</h3>
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    <TrendingUp size={12} className="mr-1" /> Active Procurements
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <IndianRupee size={24} />
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between flex-1">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Suppliers</p>
                  <h3 className="text-3xl font-bold text-milquu-dark">{activeSuppliersCount}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">{pendingDeliveriesCount} pending deliveries</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-milquu-blue">
                  <Factory size={24} />
                </div>
              </div>
            </div>

            {/* Purchase Trends Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 sm:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-milquu-dark">Purchase Trends (Last 6 Months)</h2>
                <span className="text-xs text-gray-400">Monthly procurement spend</span>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Cost']}
                    />
                    <Bar dataKey="cost" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Purchases Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/50">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by supplier, product or PO number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Status:</span>
                {['all', 'Pending', 'Received', 'Paid', 'Partial'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPurchaseStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      purchaseStatusFilter === st
                        ? 'bg-milquu-dark text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1050px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">PO Number</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Supplier / Vendor</th>
                    <th className="px-6 py-3.5">Category & Product</th>
                    <th className="px-6 py-3.5 text-right">Quantity</th>
                    <th className="px-6 py-3.5 text-right">Rate</th>
                    <th className="px-6 py-3.5 text-right">Total Cost</th>
                    <th className="px-6 py-3.5 text-right">Paid / Due</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-gray-400">
                        No purchase orders found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((purchase) => {
                      const total = Number(purchase.totalCost || 0);
                      const paid = Number(purchase.paidAmount || (purchase.status === 'Paid' ? total : 0));
                      const due = Math.max(0, total - paid);

                      return (
                        <tr key={purchase._id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openBillModal(purchase)}
                              className="font-bold text-milquu-blue hover:underline flex items-center gap-1 cursor-pointer"
                              title="Click to view & print Purchase Bill"
                            >
                              <span>{purchase.poNumber}</span>
                              <FileText size={13} className="text-milquu-blue/70" />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                            {new Date(purchase.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-milquu-dark">{purchase.supplierName}</p>
                            {purchase.supplierPhone && (
                              <p className="text-xs text-gray-400">{purchase.supplierPhone}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800">{purchase.productName}</p>
                            <p className="text-xs text-gray-400 flex items-center mt-0.5">
                              {purchase.category === 'Raw Milk' ? <Package size={11} className="mr-1" /> :
                               purchase.category === 'Transport' ? <Truck size={11} className="mr-1" /> :
                               <ShoppingCart size={11} className="mr-1" />}
                              {purchase.category}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-800">
                            {purchase.quantity ? purchase.quantity.toLocaleString('en-IN') : 0} {purchase.unit || 'L'}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-800">
                            ₹{Number(purchase.rate || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-milquu-dark">
                            ₹{total.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs font-semibold text-emerald-600">₹{paid.toLocaleString('en-IN')}</span>
                            {due > 0 ? (
                              <span className="block text-[11px] font-bold text-amber-600">Due: ₹{due.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="block text-[11px] font-medium text-gray-400">Clear</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                              purchase.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              purchase.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                              purchase.status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {purchase.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Print / View Bill Button */}
                              <button
                                onClick={() => openBillModal(purchase)}
                                className="p-2 text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="View & Print Bill / Invoice"
                              >
                                <Printer size={16} />
                              </button>
                              {/* Edit Button */}
                              <button
                                onClick={() => openEditModal(purchase)}
                                className="p-2 text-gray-500 hover:text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Purchase"
                              >
                                <Edit2 size={16} />
                              </button>
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(purchase._id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Purchase"
                              >
                                <Trash2 size={16} />
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
        </>
      )}

      {/* TAB 2: VENDOR ACCOUNTING & LEDGER (KHATA) */}
      {activeTab === 'vendors' && (
        <>
          {/* Vendor Accounting KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Purchases</p>
                <h3 className="text-2xl font-bold text-milquu-dark">₹{vendorSummaryMetrics.totalBilledAll.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-gray-500 mt-1">{vendorSummaryMetrics.totalVendors} Registered Suppliers</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-milquu-blue">
                <ShoppingCart size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount Paid</p>
                <h3 className="text-2xl font-bold text-emerald-600">₹{vendorSummaryMetrics.totalPaidAll.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-emerald-700 mt-1 flex items-center">
                  <CheckCircle size={12} className="mr-1" /> Cleared Payments
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CreditCard size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Outstanding Dues</p>
                <h3 className="text-2xl font-bold text-amber-600">₹{vendorSummaryMetrics.totalOutstandingAll.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  {vendorSummaryMetrics.vendorsWithDues} vendors have pending dues
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Suppliers Count</p>
                <h3 className="text-2xl font-bold text-milquu-dark">{vendorsSummary.length}</h3>
                <button
                  onClick={fetchData}
                  className="text-xs text-milquu-blue font-semibold mt-1 flex items-center hover:underline cursor-pointer"
                >
                  <RefreshCw size={11} className="mr-1" /> Refresh Summary
                </button>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Factory size={22} />
              </div>
            </div>
          </div>

          {/* Vendors Directory & Khata Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/50">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendor by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Filter:</span>
                {[
                  { id: 'all', label: 'All Vendors' },
                  { id: 'dues', label: 'Pending Dues' },
                  { id: 'settled', label: 'Fully Settled' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setVendorStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      vendorStatusFilter === st.id
                        ? 'bg-milquu-dark text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Vendor / Supplier</th>
                    <th className="px-6 py-3.5">Contact & Location</th>
                    <th className="px-6 py-3.5">Products Supplied</th>
                    <th className="px-6 py-3.5 text-center">Orders</th>
                    <th className="px-6 py-3.5 text-right">Total Billed</th>
                    <th className="px-6 py-3.5 text-right">Total Paid</th>
                    <th className="px-6 py-3.5 text-right">Balance Due</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Accounting Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                        No vendors found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => fetchVendorLedger(vendor.supplierName)}
                            className="font-bold text-milquu-dark hover:text-milquu-blue flex items-center gap-1.5 text-left cursor-pointer"
                          >
                            <span>{vendor.supplierName}</span>
                            <ChevronRight size={14} className="text-gray-400 group-hover:text-milquu-blue transition-colors" />
                          </button>
                          <span className="text-xs text-gray-400">
                            Last purchase: {vendor.lastPurchaseDate ? new Date(vendor.lastPurchaseDate).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Phone size={12} className="text-gray-400" />
                            {vendor.supplierPhone || 'No Phone Recorded'}
                          </p>
                          {vendor.supplierAddress && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="text-gray-400" />
                              {vendor.supplierAddress}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                            {vendor.productsList && vendor.productsList.length > 0 ? (
                              vendor.productsList.slice(0, 3).map((prod, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded-md font-medium"
                                >
                                  {prod.name} ({prod.totalQty} {prod.unit})
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                            {vendor.productsList && vendor.productsList.length > 3 && (
                              <span className="text-[11px] text-gray-400 font-semibold">
                                +{vendor.productsList.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-700">
                          {vendor.totalPurchasesCount}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                          ₹{Number(vendor.totalBilled || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                          ₹{Number(vendor.totalPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          {vendor.balanceDue > 0 ? (
                            <span className="text-amber-600 text-base">₹{Number(vendor.balanceDue).toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-emerald-700 text-xs font-semibold">₹0 (Settled)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                            vendor.balanceDue > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Ledger Statement */}
                            <button
                              onClick={() => fetchVendorLedger(vendor.supplierName)}
                              className="px-3 py-1.5 bg-blue-50 text-milquu-blue hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="View full account statement & products breakdown"
                            >
                              <BookOpen size={13} /> Khata Ledger
                            </button>
                            {/* Record Payment */}
                            <button
                              onClick={() => openRecordPaymentModal(vendor.supplierName, vendor.supplierPhone, vendor.balanceDue)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Record payment to this vendor"
                            >
                              <IndianRupee size={13} /> Pay
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PRINTABLE & DOWNLOADABLE PURCHASE BILL / VOUCHER               */}
      {/* ========================================================================= */}
      {showBillModal && selectedPurchaseForBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/70 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            {/* Modal Control Header (Sticky at top, always visible) */}
            <div className="shrink-0 sticky top-0 z-20 p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center no-print shadow-xs">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-milquu-dark" />
                <span className="font-bold text-milquu-dark text-sm">Purchase Bill / Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer size={14} /> Print Bill
                </button>
                <button
                  onClick={() => handleDownloadBillPDF(selectedPurchaseForBill)}
                  className="px-3.5 py-1.5 bg-milquu-dark text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={() => handleShareBillWhatsApp(selectedPurchaseForBill)}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Share2 size={14} /> WhatsApp
                </button>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Bill Area (Scrollable within modal) */}
            <div id="purchase-bill-printable" className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-gray-800 font-sans">
              
              {/* Header */}
              <div className="border-b-2 border-gray-800 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h1 className="text-2xl font-serif font-black text-milquu-dark tracking-tight">MilQuu Fresh</h1>
                  <p className="text-xs font-semibold text-gray-600 mt-0.5">Pure Farm Fresh Milk & Dairy Products</p>
                  <p className="text-[11px] text-gray-500">Panvel, Navi Mumbai, Maharashtra</p>
                  <p className="text-[11px] text-gray-500">Tel: +91 87670 67884 | Email: support@milquufresh.in</p>
                </div>
                <div className="sm:text-right">
                  <span className="inline-block bg-milquu-dark text-white text-[11px] font-bold px-3 py-1 rounded-md tracking-wider uppercase mb-1">
                    Purchase Voucher
                  </span>
                  <p className="text-xs text-gray-500">
                    PO No: <span className="font-bold text-gray-900">{selectedPurchaseForBill.poNumber}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: <span className="font-semibold text-gray-900">{new Date(selectedPurchaseForBill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </p>
                </div>
              </div>

              {/* Vendor & Status Grid */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 border border-gray-200 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Vendor / Farmer Details</p>
                  <p className="font-bold text-milquu-dark text-sm">{selectedPurchaseForBill.supplierName}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Phone: {selectedPurchaseForBill.supplierPhone || 'N/A'}
                  </p>
                  {selectedPurchaseForBill.supplierAddress && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Address: {selectedPurchaseForBill.supplierAddress}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedPurchaseForBill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    selectedPurchaseForBill.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                    selectedPurchaseForBill.status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedPurchaseForBill.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Payment Mode: <span className="font-semibold text-gray-800">{selectedPurchaseForBill.paymentMode || 'Cash'}</span>
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <th className="p-3">#</th>
                      <th className="p-3">Particulars / Material</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Rate / Unit</th>
                      <th className="p-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    <tr>
                      <td className="p-3 font-semibold text-gray-500">1</td>
                      <td className="p-3 font-bold text-gray-900">{selectedPurchaseForBill.productName}</td>
                      <td className="p-3 text-gray-600">{selectedPurchaseForBill.category}</td>
                      <td className="p-3 text-right font-semibold text-gray-900">
                        {selectedPurchaseForBill.quantity} {selectedPurchaseForBill.unit || 'Litre'}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-700">
                        ₹{Number(selectedPurchaseForBill.rate || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-bold text-gray-900">
                        ₹{Number(selectedPurchaseForBill.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Box */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Total Purchase Cost:</span>
                    <span className="font-bold text-gray-900">
                      ₹{Number(selectedPurchaseForBill.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 text-emerald-700">
                    <span className="font-medium">Amount Paid:</span>
                    <span className="font-bold">
                      ₹{Number(selectedPurchaseForBill.paidAmount || (selectedPurchaseForBill.status === 'Paid' ? selectedPurchaseForBill.totalCost : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t-2 border-gray-800 text-sm font-bold text-milquu-dark">
                    <span>Balance Due:</span>
                    <span className={selectedPurchaseForBill.balanceAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                      ₹{Number(selectedPurchaseForBill.balanceAmount ?? (selectedPurchaseForBill.totalCost - (selectedPurchaseForBill.paidAmount || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-dashed border-gray-300 grid grid-cols-2 gap-10 text-center text-xs text-gray-600">
                <div>
                  <div className="h-14"></div>
                  <div className="border-t border-gray-400 pt-1.5 font-medium">
                    Vendor / Farmer Signature
                  </div>
                </div>
                <div>
                  <div className="h-14"></div>
                  <div className="border-t border-gray-400 pt-1.5 font-bold text-milquu-dark">
                    Authorized Signatory (MilQuu Fresh)
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-center text-gray-400 mt-6">
                Thank you for supplying pure, high quality produce to MilQuu Fresh!
              </p>
            </div>

            {/* Bottom Sticky Action Bar (Ensures actions are always visible) */}
            <div className="shrink-0 p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center no-print">
              <span className="text-xs text-gray-500 font-medium">Voucher #{selectedPurchaseForBill.poNumber}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadBillPDF(selectedPurchaseForBill)}
                  className="px-4 py-2 bg-milquu-dark text-white rounded-xl text-xs font-bold hover:bg-gray-800 flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VENDOR LEDGER STATEMENT MODAL (KHATA)                          */}
      {/* ========================================================================= */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/70 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            {/* Modal Control Header (Sticky at top, always visible) */}
            <div className="shrink-0 sticky top-0 z-20 p-4 bg-gray-100 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3 no-print shadow-xs">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-milquu-dark" />
                <span className="font-bold text-milquu-dark text-sm">
                  Vendor Ledger & Khata Account: {selectedVendorForLedger}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openRecordPaymentModal(
                    selectedVendorForLedger,
                    vendorLedgerData?.vendor?.phone,
                    vendorLedgerData?.summary?.balanceDue
                  )}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <IndianRupee size={13} /> Record Payment
                </button>
                <button
                  onClick={handleDownloadLedgerExcel}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} /> Excel
                </button>
                <button
                  onClick={handleDownloadLedgerPDF}
                  className="px-3 py-1.5 bg-milquu-dark text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} /> PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={handleShareLedgerWhatsApp}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Share2 size={13} /> WhatsApp
                </button>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div id="vendor-ledger-printable" className="p-6 overflow-y-auto font-sans">
              {loadingLedger || !vendorLedgerData ? (
                <div className="py-20 text-center">
                  <RefreshCw size={28} className="animate-spin text-milquu-blue mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-500">Generating vendor accounting ledger...</p>
                </div>
              ) : (
                <>
                  {/* Vendor Details Banner */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-serif font-bold text-milquu-dark">{vendorLedgerData.vendor?.name}</h2>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          vendorLedgerData.summary?.balanceDue > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {vendorLedgerData.summary?.balanceDue > 0 ? 'Pending Dues' : 'Fully Settled'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                        <span>Tel: {vendorLedgerData.vendor?.phone || 'N/A'}</span>
                        {vendorLedgerData.vendor?.address && (
                          <span>• Address: {vendorLedgerData.vendor.address}</span>
                        )}
                      </p>
                    </div>

                    {/* Financial Summary Badges */}
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Purchases</span>
                        <span className="text-sm font-bold text-milquu-dark">₹{Number(vendorLedgerData.summary?.totalBilled || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Paid</span>
                        <span className="text-sm font-bold text-emerald-700">₹{Number(vendorLedgerData.summary?.totalPaid || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-right">
                        <span className="text-[10px] uppercase font-bold text-amber-600 block">Net Balance Due</span>
                        <span className="text-base font-bold text-amber-700">₹{Number(vendorLedgerData.summary?.balanceDue || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Products Supplied Breakdown */}
                  {vendorLedgerData.productsBreakdown && vendorLedgerData.productsBreakdown.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Package size={14} className="text-milquu-blue" />
                        Products Purchased From This Vendor
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {vendorLedgerData.productsBreakdown.map((prod, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-xs">
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{prod.name}</p>
                              <p className="text-[11px] text-gray-500">{prod.category || 'General'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-milquu-dark text-xs">{prod.quantity.toLocaleString('en-IN')} {prod.unit || 'L'}</p>
                              <p className="text-[11px] text-gray-400">₹{Number(prod.totalCost).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section: Chronological Ledger Transactions */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers size={14} className="text-milquu-blue" />
                      Detailed Ledger Statement (Bills & Payments)
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-600 uppercase tracking-wider text-[10px]">
                            <th className="p-3">Date</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Ref / PO #</th>
                            <th className="p-3">Particulars / Description</th>
                            <th className="p-3 text-right">Debit (Billed)</th>
                            <th className="p-3 text-right">Credit (Paid)</th>
                            <th className="p-3 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {vendorLedgerData.transactions.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="p-6 text-center text-gray-400">
                                No transactions found for this vendor.
                              </td>
                            </tr>
                          ) : (
                            vendorLedgerData.transactions.map((tx, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="p-3 text-gray-600">
                                  {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1 ${
                                    tx.type === 'BILL'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {tx.type === 'BILL' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-milquu-dark">{tx.refNo || '-'}</td>
                                <td className="p-3">
                                  <p className="font-semibold text-gray-800">{tx.productName || tx.notes || '-'}</p>
                                  {tx.quantity > 0 && (
                                    <p className="text-[10px] text-gray-400">{tx.quantity} {tx.unit} @ ₹{tx.rate}</p>
                                  )}
                                  {tx.paymentMode && (
                                    <p className="text-[10px] text-emerald-600 font-medium">Via {tx.paymentMode}</p>
                                  )}
                                </td>
                                <td className="p-3 text-right font-bold text-gray-900">
                                  {tx.debit > 0 ? `₹${Number(tx.debit).toLocaleString('en-IN')}` : '-'}
                                </td>
                                <td className="p-3 text-right font-bold text-emerald-600">
                                  {tx.credit > 0 ? `₹${Number(tx.credit).toLocaleString('en-IN')}` : '-'}
                                </td>
                                <td className="p-3 text-right font-bold text-milquu-dark">
                                  ₹{Number(tx.balance).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECORD VENDOR PAYMENT                                           */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-milquu-dark">Record Vendor Payment</h2>
                <p className="text-xs text-gray-500">Record cash, UPI, or bank transfer made to supplier</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Vendor / Supplier Name</label>
                <input
                  required
                  type="text"
                  list="vendor-names-list"
                  value={paymentFormData.supplierName}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, supplierName: e.target.value })}
                  placeholder="Select or enter vendor name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-milquu-blue"
                />
                <datalist id="vendor-names-list">
                  {existingSupplierNames.map((s, idx) => (
                    <option key={idx} value={s} />
                  ))}
                </datalist>
              </div>

              {currentVendorDue > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs">
                  <span className="text-amber-800 font-medium">Outstanding Balance Due:</span>
                  <span className="text-amber-900 font-bold text-sm">₹{currentVendorDue.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount to Pay (₹)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="any"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-milquu-dark focus:outline-none focus:border-milquu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date</label>
                  <input
                    required
                    type="date"
                    value={paymentFormData.date}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentFormData.paymentMode}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMode: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-milquu-blue"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reference / UTR #</label>
                  <input
                    type="text"
                    value={paymentFormData.reference}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, reference: e.target.value })}
                    placeholder="e.g. UPI Ref #1234"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  placeholder="e.g. Weekly milk supply settlement"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md cursor-pointer"
                >
                  Confirm & Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT PURCHASE ORDER                                       */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 my-auto z-10 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-serif font-bold text-milquu-dark">
                {editingId ? 'Edit Purchase Order' : 'Create New Purchase Order'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier / Vendor Name</label>
                  <input
                    required
                    type="text"
                    name="supplierName"
                    list="po-supplier-list"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="e.g. Ramesh Patil (Dairy)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                  <datalist id="po-supplier-list">
                    {existingSupplierNames.map((s, idx) => (
                      <option key={idx} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier Phone (For Bill & WA)</label>
                  <input
                    type="text"
                    name="supplierPhone"
                    value={formData.supplierPhone}
                    onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    required
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  >
                    <option value="Raw Milk">Raw Milk</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Transport">Transport</option>
                    <option value="Feed & Fodder">Feed & Fodder</option>
                    <option value="Veterinary">Veterinary</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product / Material Name</label>
                <div className="flex gap-2">
                  <select
                    name="productName"
                    value={formData.productName}
                    onChange={(e) => {
                      const selProd = products.find(p => p.name === e.target.value);
                      setFormData({
                        ...formData,
                        productName: e.target.value,
                        rate: selProd?.purchasePrice ? selProd.purchasePrice.toString() : formData.rate,
                        sellingPrice: selProd?.price ? selProd.price.toString() : formData.sellingPrice
                      });
                    }}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  >
                    <option value="" disabled>Select from products catalog</option>
                    {products.map((p) => (
                      <option key={p._id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or type custom item..."
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  >
                    <option value="Litre">Litre</option>
                    <option value="Kg">Kg</option>
                    <option value="Units">Units / Pcs</option>
                    <option value="Bags">Bags</option>
                    <option value="Box">Box</option>
                    <option value="Trips">Trips</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Rate / Unit (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    name="rate"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    placeholder="e.g. 55"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Bill Cost (₹)</label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm font-bold text-milquu-dark">
                    ₹{computedTotalCost.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price / Unit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="e.g. 75"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Margin (%)</label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm font-semibold text-emerald-700">
                    {marginPercentage}%
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment & Settlement</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amount Paid (₹)</label>
                    <input
                      type="number"
                      min="0"
                      name="paidAmount"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      placeholder="0 if pending"
                      className="w-full border border-gray-200 bg-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-milquu-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Mode</label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full border border-gray-200 bg-white rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-milquu-blue"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / QR</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Credit">Credit / Due</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-200 bg-white rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-milquu-blue"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Received">Received</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold pt-1">
                  <span className="text-gray-500">Calculated Balance Due:</span>
                  <span className={computedBalance > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                    ₹{computedBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Batch #45 morning delivery"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-milquu-dark text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-md cursor-pointer"
                >
                  {editingId ? 'Update Purchase Order' : 'Save Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #purchase-bill-printable, #purchase-bill-printable * {
            visibility: visible;
          }
          #vendor-ledger-printable, #vendor-ledger-printable * {
            visibility: visible;
          }
          #purchase-bill-printable, #vendor-ledger-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Purchases;
