import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api.js';
import { ShoppingCart, Plus, Download, IndianRupee, BookOpen } from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import PurchaseOrdersTab from './purchases/PurchaseOrdersTab';
import { useBusinessSettings } from '../../utils/useBusinessSettings';
import VendorLedgerTab from './purchases/VendorLedgerTab';
import PurchaseBillModal from './purchases/PurchaseBillModal';
import VendorStatementModal from './purchases/VendorStatementModal';
import VendorPaymentModal from './purchases/VendorPaymentModal';
import PurchaseFormModal from './purchases/PurchaseFormModal';
import toast from '../../utils/toast';

const Purchases = () => {
  // Signs off the WhatsApp statement with the saved business details
  const business = useBusinessSettings();
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
  const [isGeneratingBillPdf, setIsGeneratingBillPdf] = useState(false);

  // Modal 3: Vendor Ledger Statement
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedVendorForLedger, setSelectedVendorForLedger] = useState(null);
  const [vendorLedgerData, setVendorLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [isGeneratingLedgerPdf, setIsGeneratingLedgerPdf] = useState(false);

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
      toast.error('Failed to load vendor ledger statement.');
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
      toast.error('Failed to delete purchase');
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
      toast.error('Failed to save purchase: ' + (error.response?.data?.message || error.message));
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
      toast('Please enter a valid payment amount greater than 0');
      return;
    }
    try {
      await api.post('/api/erp/vendors/payment', paymentFormData);
      setShowPaymentModal(false);
      await fetchData();
      if (showLedgerModal && selectedVendorForLedger) {
        await fetchVendorLedger(selectedVendorForLedger);
      }
      toast(`Payment of ₹${payAmount.toLocaleString('en-IN')} recorded successfully!`);
    } catch (error) {
      console.error('Error recording payment', error);
      toast.error('Failed to record payment: ' + (error.response?.data?.message || error.message));
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

  // Helper to ensure colors and fonts render cleanly across all browsers in html2canvas
  const captureElementToCanvas = async (element, options = {}) => {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // Ignore font readiness errors
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 150));

    return await html2canvas(element, {
      scale: 2.5, // 250-300 DPI high-definition resolution for crisp vector-like text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200, // Forces desktop layout queries even on small mobile screens
      ...options,
      onclone: (clonedDoc) => {
        if (options.onclone) {
          options.onclone(clonedDoc);
        }
        // Sanitize any modern CSS color functions (like oklch or color()) to standard rgba()
        const clonedRoot = clonedDoc.getElementById(element.id);
        if (clonedRoot) {
          const scratchCanvas = document.createElement('canvas');
          scratchCanvas.width = 1;
          scratchCanvas.height = 1;
          const ctx = scratchCanvas.getContext('2d');

          const sanitizeColor = (val) => {
            if (!val || typeof val !== 'string') return val;
            if (val.includes('oklch') || val.includes('color(')) {
              try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = val;
                ctx.fillRect(0, 0, 1, 1);
                const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
              } catch {
                return val;
              }
            }
            return val;
          };

          const allElements = [clonedRoot, ...clonedRoot.querySelectorAll('*')];
          allElements.forEach((el) => {
            try {
              const comp = window.getComputedStyle(el);
              const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
              colorProps.forEach((prop) => {
                const val = comp[prop];
                if (val && (val.includes('oklch') || val.includes('color('))) {
                  el.style[prop] = sanitizeColor(val);
                }
              });
            } catch {
              // Ignore inaccessible styles
            }
          });
        }
      }
    });
  };

  // Download Bill PDF - Matches the EXACT UI shown in the modal preview
  const handleDownloadBillPDF = async (purchase) => {
    const targetPurchase = purchase || selectedPurchaseForBill;
    if (!targetPurchase) return;

    try {
      setIsGeneratingBillPdf(true);

      let printableElement = document.getElementById('purchase-bill-printable');
      if (!printableElement) {
        openBillModal(targetPurchase);
        await new Promise((resolve) => setTimeout(resolve, 300));
        printableElement = document.getElementById('purchase-bill-printable');
      }

      if (!printableElement) {
        throw new Error('Printable voucher element not found in DOM.');
      }

      const canvas = await captureElementToCanvas(printableElement, {
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('purchase-bill-printable');
          if (el) {
            let parent = el.parentElement;
            while (parent) {
              parent.style.overflow = 'visible';
              parent.style.maxHeight = 'none';
              parent.style.maxWidth = 'none';
              parent.style.width = 'auto';
              parent.style.height = 'auto';
              parent = parent.parentElement;
            }
            el.style.overflow = 'visible';
            el.style.maxHeight = 'none';
            el.style.maxWidth = 'none';
            el.style.width = '760px';
            el.style.padding = '36px';
            el.style.margin = '0 auto';
            el.style.backgroundColor = '#ffffff';
          }
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      const totalPdfHeight = (canvas.height * contentWidth) / canvas.width;
      const maxPageContentHeight = pageHeight - (margin * 2);

      if (totalPdfHeight <= maxPageContentHeight) {
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, totalPdfHeight, '', 'FAST');
      } else {
        let currentY = 0;
        const pagePixelHeight = (canvas.width * maxPageContentHeight) / contentWidth;

        while (currentY < canvas.height) {
          const sliceHeight = Math.min(pagePixelHeight, canvas.height - currentY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

          const sliceImgData = pageCanvas.toDataURL('image/png', 1.0);
          const slicePdfHeight = (sliceHeight * contentWidth) / canvas.width;

          if (currentY > 0) {
            pdf.addPage();
          }
          pdf.addImage(sliceImgData, 'PNG', margin, margin, contentWidth, slicePdfHeight, '', 'FAST');
          currentY += sliceHeight;
        }
      }

      pdf.save(`MilQuu_Purchase_Bill_${targetPurchase.poNumber || 'Voucher'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF bill with html2canvas', err);
      toast('Could not download PDF. Please try again or use the Print option.');
    } finally {
      setIsGeneratingBillPdf(false);
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

  // Download Vendor Ledger PDF - Matches the on-screen Ledger statement UI
  const handleDownloadLedgerPDF = async () => {
    if (!vendorLedgerData) return;

    try {
      setIsGeneratingLedgerPdf(true);

      const printableElement = document.getElementById('vendor-ledger-printable');
      if (!printableElement) {
        throw new Error('Ledger printable element not found in DOM.');
      }

      const canvas = await captureElementToCanvas(printableElement, {
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('vendor-ledger-printable');
          if (el) {
            let parent = el.parentElement;
            while (parent) {
              parent.style.overflow = 'visible';
              parent.style.maxHeight = 'none';
              parent.style.maxWidth = 'none';
              parent.style.width = 'auto';
              parent.style.height = 'auto';
              parent = parent.parentElement;
            }
            el.style.overflow = 'visible';
            el.style.maxHeight = 'none';
            el.style.maxWidth = 'none';
            el.style.width = '820px';
            el.style.padding = '32px';
            el.style.margin = '0 auto';
            el.style.backgroundColor = '#ffffff';
          }
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      const totalPdfHeight = (canvas.height * contentWidth) / canvas.width;
      const maxPageContentHeight = pageHeight - (margin * 2);

      if (totalPdfHeight <= maxPageContentHeight) {
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, totalPdfHeight, '', 'FAST');
      } else {
        let currentY = 0;
        const pagePixelHeight = (canvas.width * maxPageContentHeight) / contentWidth;

        while (currentY < canvas.height) {
          const sliceHeight = Math.min(pagePixelHeight, canvas.height - currentY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

          const sliceImgData = pageCanvas.toDataURL('image/png', 1.0);
          const slicePdfHeight = (sliceHeight * contentWidth) / canvas.width;

          if (currentY > 0) {
            pdf.addPage();
          }
          pdf.addImage(sliceImgData, 'PNG', margin, margin, contentWidth, slicePdfHeight, '', 'FAST');
          currentY += sliceHeight;
        }
      }

      const safeName = (vendorLedgerData.vendor?.name || 'Vendor').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`MilQuu_Vendor_Statement_${safeName}.pdf`);
    } catch (err) {
      console.error('Error downloading vendor ledger PDF', err);
      toast('Could not download PDF. Please try again or use the Print button.');
    } finally {
      setIsGeneratingLedgerPdf(false);
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
      `${business.businessName}${business.address ? `, ${business.address}` : ''}.`;

    const url = phone && phone.length === 10
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Export current tab (Purchases or Vendors) to Excel
  const handleExport = () => {
    if (activeTab === 'purchases') {
      if (purchaseData.length === 0) {
        toast.info('No purchase orders to export');
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
        toast.info('No vendor summary data to export');
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

      <PurchaseOrdersTab
        activeSuppliersCount={activeSuppliersCount}
        activeTab={activeTab}
        filteredPurchases={filteredPurchases}
        handleDelete={handleDelete}
        openBillModal={openBillModal}
        openEditModal={openEditModal}
        pendingDeliveriesCount={pendingDeliveriesCount}
        purchaseStatusFilter={purchaseStatusFilter}
        searchTerm={searchTerm}
        setPurchaseStatusFilter={setPurchaseStatusFilter}
        setSearchTerm={setSearchTerm}
        totalMonthlyCost={totalMonthlyCost}
        trendData={trendData}
      />

      <VendorLedgerTab
        activeTab={activeTab}
        fetchData={fetchData}
        fetchVendorLedger={fetchVendorLedger}
        filteredVendors={filteredVendors}
        openRecordPaymentModal={openRecordPaymentModal}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setVendorStatusFilter={setVendorStatusFilter}
        vendorStatusFilter={vendorStatusFilter}
        vendorSummaryMetrics={vendorSummaryMetrics}
        vendorsSummary={vendorsSummary}
      />

      <PurchaseBillModal
        handleDownloadBillPDF={handleDownloadBillPDF}
        handlePrint={handlePrint}
        handleShareBillWhatsApp={handleShareBillWhatsApp}
        isGeneratingBillPdf={isGeneratingBillPdf}
        selectedPurchaseForBill={selectedPurchaseForBill}
        setShowBillModal={setShowBillModal}
        showBillModal={showBillModal}
      />

      <VendorStatementModal
        handleDownloadLedgerExcel={handleDownloadLedgerExcel}
        handleDownloadLedgerPDF={handleDownloadLedgerPDF}
        handlePrint={handlePrint}
        handleShareLedgerWhatsApp={handleShareLedgerWhatsApp}
        isGeneratingLedgerPdf={isGeneratingLedgerPdf}
        loadingLedger={loadingLedger}
        openRecordPaymentModal={openRecordPaymentModal}
        selectedVendorForLedger={selectedVendorForLedger}
        setShowLedgerModal={setShowLedgerModal}
        showLedgerModal={showLedgerModal}
        vendorLedgerData={vendorLedgerData}
      />

      <VendorPaymentModal
        currentVendorDue={currentVendorDue}
        existingSupplierNames={existingSupplierNames}
        handleSavePayment={handleSavePayment}
        paymentFormData={paymentFormData}
        setPaymentFormData={setPaymentFormData}
        setShowPaymentModal={setShowPaymentModal}
        showPaymentModal={showPaymentModal}
      />

      <PurchaseFormModal
        computedBalance={computedBalance}
        computedTotalCost={computedTotalCost}
        editingId={editingId}
        existingSupplierNames={existingSupplierNames}
        formData={formData}
        handleSavePurchase={handleSavePurchase}
        isModalOpen={isModalOpen}
        marginPercentage={marginPercentage}
        products={products}
        setEditingId={setEditingId}
        setFormData={setFormData}
        setIsModalOpen={setIsModalOpen}
      />

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
