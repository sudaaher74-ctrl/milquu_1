import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, Share2, FileText, CheckCircle2, Clock, MapPin, Phone, User, Calendar, IndianRupee, Copy, QrCode, Filter } from 'lucide-react';
import { useBusinessSettings } from '../../../utils/useBusinessSettings';
import { DAIRY_KHATA_BANK_DETAILS, getDateKey, getOrderDateKey, formatKhataDate } from '../../../utils/khataPaymentConfig';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import api from '../../../utils/api';
import toast from '../../../utils/toast';

const MilkInvoiceModal = ({
  showInvoiceModal,
  setShowInvoiceModal,
  customer,
  targetBill = null,
  initialDateRange = null
}) => {
  const business = useBusinessSettings();
  const invoiceRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [filterMode, setFilterMode] = useState('unpaid'); // 'bill' | 'period' | 'unpaid' | '10days' | '15days' | 'thisMonth' | 'all' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (showInvoiceModal && customer) {
      if (targetBill) {
        setFilterMode('bill');
        const bStart = getDateKey(targetBill.startDate);
        const bEnd = getDateKey(targetBill.endDate);
        setCustomStartDate(bStart);
        setCustomEndDate(bEnd);
      } else if (initialDateRange?.startDate && initialDateRange?.endDate) {
        setFilterMode('period');
        setCustomStartDate(initialDateRange.startDate);
        setCustomEndDate(initialDateRange.endDate);
      } else {
        setFilterMode('unpaid');
      }

      // If customer already has orders in state, initialize with them
      if (Array.isArray(customer.orders) && customer.orders.length > 0) {
        setAllOrders(customer.orders);
      }
      
      // Also fetch full order history if available
      const customerId = customer.customerId || customer.userId || customer._id;
      if (customerId) {
        setLoadingOrders(true);
        api.get(`/api/erp/credit-customers/${customerId}/orders`)
          .then((res) => {
            if (Array.isArray(res.data) && res.data.length > 0) {
              setAllOrders(res.data);
            }
          })
          .catch((err) => {
            console.warn('Could not fetch extra order history, using active orders:', err);
          })
          .finally(() => {
            setLoadingOrders(false);
          });
      }
    }
  }, [showInvoiceModal, customer, targetBill, initialDateRange]);

  if (!showInvoiceModal || !customer) return null;

  // Calculate totals from orders with cycle/date filtering
  const rawOrders = allOrders.length > 0 ? allOrders : (customer.orders || []);
  
  const displayOrders = rawOrders.filter((ord) => {
    const dateStr = getOrderDateKey(ord);
    const oDate = new Date(dateStr + 'T00:00:00');

    if (filterMode === 'bill') {
      const bStart = getDateKey(targetBill?.startDate) || customStartDate;
      const bEnd = getDateKey(targetBill?.endDate) || customEndDate;
      if (bStart && dateStr < bStart) return false;
      if (bEnd && dateStr > bEnd) return false;

      // If targetBill has specific orders recorded, match them
      if (Array.isArray(targetBill?.orders) && targetBill.orders.length > 0) {
        const targetOrderIds = new Set(
          targetBill.orders.map(o => (typeof o === 'object' && o !== null ? (o._id || o.orderId) : o).toString())
        );
        const ordId = (ord._id || ord.orderId || '').toString();
        if (targetOrderIds.size > 0 && ordId) {
          return targetOrderIds.has(ordId);
        }
      }
      return true;
    }
    if (filterMode === 'period') {
      if (customStartDate && dateStr < customStartDate) return false;
      if (customEndDate && dateStr > customEndDate) return false;
      return true;
    }
    if (filterMode === 'unpaid') {
      return ord.isPaid !== true;
    }
    if (filterMode === '10days') {
      const now = new Date();
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      tenDaysAgo.setHours(0, 0, 0, 0);
      return oDate >= tenDaysAgo && oDate <= now;
    }
    if (filterMode === '15days') {
      const now = new Date();
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      fifteenDaysAgo.setHours(0, 0, 0, 0);
      return oDate >= fifteenDaysAgo && oDate <= now;
    }
    if (filterMode === 'thisMonth') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return oDate >= startOfMonth && oDate <= endOfMonth;
    }
    if (filterMode === 'custom') {
      if (customStartDate && dateStr < customStartDate) return false;
      if (customEndDate && dateStr > customEndDate) return false;
      return true;
    }
    return true; // 'all'
  }).sort((a, b) => {
    const dA = getOrderDateKey(a);
    const dB = getOrderDateKey(b);
    return filterMode === 'bill' || filterMode === 'period' ? dA.localeCompare(dB) : dB.localeCompare(dA);
  });

  let totalLitres = 0;
  let totalBilled = 0;
  let totalPaid = 0;

  const lineItems = [];
  displayOrders.forEach((ord, oIdx) => {
    const oDateStr = getOrderDateKey(ord);
    const oId = ord.orderId || ord._id || `PO-${oIdx + 1}`;
    const billRef = oId.toString().slice(-6).toUpperCase();
    const isOrderPaid = ord.isPaid === true;

    totalBilled += Number(ord.totalPrice || 0);
    totalPaid += Number(ord.creditPaidAmount || (isOrderPaid ? ord.totalPrice : 0));

    if (Array.isArray(ord.orderItems) && ord.orderItems.length > 0) {
      ord.orderItems.forEach((it) => {
        const qty = Number(it.qty || 1);
        const price = Number(it.price || 0);
        let lQty = qty;
        const u = (it.unit || '').toLowerCase();
        const n = (it.name || '').toLowerCase();
        if (u.includes('500') || n.includes('500')) {
          lQty = qty * 0.5;
        }
        totalLitres += lQty;
        lineItems.push({
          date: oDateStr,
          billNo: `#${billRef}`,
          productName: it.name || 'Pure Cow Milk',
          qty: qty,
          rate: price,
          total: qty * price,
          isPaid: isOrderPaid
        });
      });
    } else if (Array.isArray(ord.items) && ord.items.length > 0) {
      ord.items.forEach((it) => {
        const qty = Number(it.qty || 1);
        const price = Number(it.price || 0);
        let lQty = qty;
        const u = (it.unit || '').toLowerCase();
        const n = (it.name || '').toLowerCase();
        if (u.includes('500') || n.includes('500')) {
          lQty = qty * 0.5;
        }
        totalLitres += lQty;
        lineItems.push({
          date: oDateStr,
          billNo: `#${billRef}`,
          productName: it.name || 'Pure Cow Milk',
          qty: qty,
          rate: price,
          total: qty * price,
          isPaid: isOrderPaid
        });
      });
    } else {
      totalLitres += 1;
      lineItems.push({
        date: oDateStr,
        billNo: `#${billRef}`,
        productName: 'Dairy Milk Supply',
        qty: 1,
        rate: Number(ord.totalPrice || 0),
        total: Number(ord.totalPrice || 0),
        isPaid: isOrderPaid
      });
    }
  });

  // Fallback: If filterMode is bill and no raw orders matched, use targetBill.dailyDeliveries if available
  if (filterMode === 'bill' && targetBill && lineItems.length === 0 && Array.isArray(targetBill.dailyDeliveries) && targetBill.dailyDeliveries.length > 0) {
    targetBill.dailyDeliveries.forEach((d, idx) => {
      const dLitres = Number(d.litres) || 0;
      const dRate = Number(d.rate) || 0;
      const dAmount = Number(d.amount) || (dLitres * dRate);
      totalLitres += dLitres;
      totalBilled += dAmount;
      lineItems.push({
        date: getDateKey(d.date),
        billNo: `#DEL-${String(idx + 1).padStart(3, '0')}`,
        productName: d.productName ? `${d.productName} (${d.shift || 'Milk'})` : 'Pure Cow Milk',
        qty: dLitres,
        rate: dRate,
        total: dAmount,
        isPaid: targetBill.status === 'Settled'
      });
    });
  }

  // Exact bill-level totals override when viewing a saved bill
  if (filterMode === 'bill' && targetBill) {
    if (targetBill.totalAmount !== undefined && targetBill.totalAmount !== null) {
      totalBilled = Number(targetBill.totalAmount);
    }
    if (targetBill.totalLitres !== undefined && targetBill.totalLitres !== null) {
      totalLitres = Number(targetBill.totalLitres);
    }
    totalPaid = Number(targetBill.paidAmount || (targetBill.status === 'Settled' ? totalBilled : 0));
  }

  const balanceDue = filterMode === 'bill' && targetBill
    ? Math.max(0, totalBilled - totalPaid)
    : (filterMode === 'all' && customer.totalDue !== undefined 
        ? Math.max(0, customer.totalDue) 
        : Math.max(0, totalBilled - totalPaid));

  const deliveriesCount = filterMode === 'bill' && targetBill
    ? (lineItems.length || displayOrders.length || (targetBill.dailyDeliveries?.length || 0))
    : displayOrders.length;

  const invoiceNumber = (filterMode === 'bill' && targetBill?.billNumber)
    ? targetBill.billNumber
    : `MILK-INV-${(customer.phone || customer.customerId || customer.name).toString().replace(/[^0-9a-zA-Z]/g, '').slice(-6).toUpperCase()}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;

  const filterLabel = 
    filterMode === 'bill' && targetBill ? (targetBill.dateRangeStr || `${formatKhataDate(targetBill.startDate)} – ${formatKhataDate(targetBill.endDate)}`) :
    filterMode === 'period' ? `Selected Period (${formatKhataDate(customStartDate)} – ${formatKhataDate(customEndDate)})` :
    filterMode === 'unpaid' ? 'Active Unpaid Dues' :
    filterMode === '10days' ? 'Last 10 Days Cycle' :
    filterMode === '15days' ? 'Last 15 Days Cycle' :
    filterMode === 'thisMonth' ? 'Current Month Cycle' :
    filterMode === 'custom' ? `Custom Period (${customStartDate || 'Start'} to ${customEndDate || 'End'})` :
    'Complete Order History';

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Generation via html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const element = invoiceRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      const totalPdfHeight = (canvas.height * contentWidth) / canvas.width;

      const maxContentHeight = pageHeight - (margin * 2);
      // Shrink a slightly-too-tall bill to fit one page; only very long
      // statements (fit scale below MIN_FIT_SCALE) still spill onto more pages.
      const MIN_FIT_SCALE = 0.6;
      const fitScale = Math.min(1, maxContentHeight / totalPdfHeight);

      if (fitScale >= MIN_FIT_SCALE) {
        const imgW = contentWidth * fitScale;
        const imgH = totalPdfHeight * fitScale;
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', margin + (contentWidth - imgW) / 2, margin, imgW, imgH, '', 'FAST');
      } else {
        let currentY = 0;
        const pagePixelHeight = (canvas.width * (pageHeight - (margin * 2))) / contentWidth;

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

          if (currentY > 0) pdf.addPage();
          pdf.addImage(sliceImgData, 'PNG', margin, margin, contentWidth, slicePdfHeight, '', 'FAST');
          currentY += sliceHeight;
        }
      }

      const safeName = (customer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      const billSuffix = (filterMode === 'bill' && targetBill?.billNumber)
        ? `_${targetBill.billNumber}`
        : (filterMode === 'period' && customStartDate && customEndDate
            ? `_${customStartDate}_to_${customEndDate}`
            : '');
      pdf.save(`MilQuu_Milk_Invoice_${safeName}${billSuffix}.pdf`);
      toast.success('Milk Invoice downloaded successfully!');
    } catch (err) {
      console.error('Error generating Milk Invoice PDF:', err);
      toast.error('Could not download PDF. Please try Print.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    if (!customer.phone) {
      toast.error('No phone number recorded for this customer.');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '').slice(-10);
    const msg = `*MILQUU FRESH - MILK BILL INVOICE* 🥛\n\n` +
      `Hello *${customer.name}*,\n` +
      `Here is your consolidated milk supply invoice statement:\n\n` +
      `📄 *Invoice No:* ${invoiceNumber}\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n` +
      `🗓️ *Billing Period:* ${filterLabel} (${customer.billingCycle || '15 Days'} Cycle)\n` +
      `📦 *Total Deliveries:* ${deliveriesCount} bills\n` +
      `💰 *Total Billed:* ₹${totalBilled.toFixed(2)}\n` +
      `💳 *Paid / Settled:* ₹${totalPaid.toFixed(2)}\n` +
      `🔴 *Net Balance Due: ₹${balanceDue.toFixed(2)}*\n` +
      (customer.nextDueDate ? `⏰ *Due Date:* ${new Date(customer.nextDueDate).toLocaleDateString('en-IN')}\n\n` : `\n`) +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💳 *BANK & UPI PAYMENT DETAILS*\n` +
      `📲 *UPI ID:* ${DAIRY_KHATA_BANK_DETAILS.upiId}\n` +
      `🏦 *Bank:* ${DAIRY_KHATA_BANK_DETAILS.bankName}\n` +
      `👤 *Account Holder:* ${DAIRY_KHATA_BANK_DETAILS.accountHolder}\n` +
      `🔢 *Account Number:* ${DAIRY_KHATA_BANK_DETAILS.accountNumber}\n` +
      `🏛️ *Branch IFSC:* ${DAIRY_KHATA_BANK_DETAILS.ifscCode}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Please scan the QR code on the invoice or pay via the bank/UPI details above. Kindly share payment screenshot once completed.\n` +
      `Thank you for being our valued dairy customer! 🙏`;

    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const isSettled = filterMode === 'bill' && targetBill
    ? targetBill.status === 'Settled'
    : (balanceDue <= 0);

  const statusText = filterMode === 'bill' && targetBill
    ? (targetBill.status === 'Settled' ? 'Bill Settled / Paid' : (targetBill.status === 'Partially Paid' ? 'Partially Paid' : 'Pending Payment'))
    : (balanceDue > 0 ? 'Pending Dues' : 'Fully Settled');

  const statusColorClass = isSettled ? 'text-green-700' : 'text-amber-800';

  const dueDateDisplay = filterMode === 'bill' && targetBill
    ? (targetBill.status === 'Settled' ? 'Settled' : (targetBill.dueDate ? formatKhataDate(targetBill.dueDate) : 'Due on Receipt'))
    : (balanceDue <= 0 ? 'Settled' : (customer.nextDueDate ? formatKhataDate(customer.nextDueDate) : 'Due on Receipt'));

  const invoiceDateDisplay = filterMode === 'bill' && targetBill?.createdAt
    ? formatKhataDate(targetBill.createdAt)
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-start p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal Control Header (Sticky at top, hidden when printing) */}
        <div className="shrink-0 sticky top-0 z-20 p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center print:hidden shadow-xs">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-milquu-blue" />
            <span className="font-bold text-gray-800 text-sm">Customer Milk Bill Statement</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Printer size={13} /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-milquu-blue hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={13} />
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>
            {customer.phone && (
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Send invoice via WhatsApp"
              >
                <Share2 size={13} /> WhatsApp
              </button>
            )}
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cycle & Date Filter Toolbar (hidden when printing) */}
        <div className="shrink-0 px-4 py-2.5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 print:hidden shadow-2xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 mr-1">
              <Filter size={12} className="text-amber-600" /> Filter:
            </span>

            {targetBill && (
              <button
                type="button"
                onClick={() => setFilterMode('bill')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  filterMode === 'bill' ? 'bg-milquu-blue text-white shadow-2xs' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <FileText size={12} />
                <span>Bill #{targetBill.billNumber}</span>
              </button>
            )}

            {initialDateRange && !targetBill && (
              <button
                type="button"
                onClick={() => setFilterMode('period')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  filterMode === 'period' ? 'bg-milquu-blue text-white shadow-2xs' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Calendar size={12} />
                <span>Selected Period ({formatKhataDate(initialDateRange.startDate)} – {formatKhataDate(initialDateRange.endDate)})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilterMode('thisMonth')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'thisMonth' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unpaid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'unpaid' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Unpaid Dues
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('15days')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === '15days' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Last 15 Days
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('10days')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === '10days' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Last 10 Days
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-gray-800 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All History
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('custom')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'custom' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Custom Dates
            </button>
          </div>

          {(filterMode === 'custom' || filterMode === 'period') && (
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setFilterMode('custom');
                }}
                className="px-2 py-1 border border-gray-300 rounded-lg text-xs font-mono"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setFilterMode('custom');
                }}
                className="px-2 py-1 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Scrollable Printable Paper Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50 print:p-0 print:bg-white">
          <div 
            ref={invoiceRef} 
            id="printable-milk-invoice" 
            className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm text-gray-800 print:border-none print:shadow-none print:p-4 max-w-2xl mx-auto"
          >
            {/* Header: Company Info & Invoice Badge */}
            <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-gray-200 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-black text-milquu-blue tracking-tight font-serif">MilQuu Fresh</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                    Premium Dairy
                  </span>
                </div>
                {business.tagline && <p className="text-xs text-gray-500 font-medium">{business.tagline}</p>}
                {business.address && <p className="text-[11px] text-gray-400 mt-1 max-w-xs">{business.address}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-gray-400 font-mono mt-1">
                  {business.supportPhone && <span>Tel: {business.supportPhone}</span>}
                  {business.gstin && <span>GSTIN: {business.gstin}</span>}
                  {business.fssaiLicense && <span>FSSAI: {business.fssaiLicense}</span>}
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-black uppercase tracking-wider mb-2">
                  Milk Bill Statement
                </span>
                <p className="text-xs font-mono font-bold text-gray-700">{invoiceNumber}</p>
                <p className="text-[11px] text-gray-400">Date: {invoiceDateDisplay}</p>
                <p className="text-[11px] text-blue-700 font-bold mt-0.5">{filterLabel}</p>
              </div>
            </div>

            {/* Bill To Customer Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-gray-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Billed To (Customer):</span>
                <h4 className="font-bold text-gray-900 text-sm">{customer.name}</h4>
                {customer.phone && (
                  <p className="text-gray-600 font-mono flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="text-gray-400" /> {customer.phone}
                  </p>
                )}
                {customer.address && (
                  <p className="text-gray-500 flex items-start gap-1 mt-0.5 text-[11px]">
                    <MapPin size={11} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{customer.address}</span>
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Billing Cycle:</span>
                  <span className="font-bold text-gray-800">{customer.billingCycle || '15 Days'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Orders:</span>
                  <span className="font-bold text-gray-800">{deliveriesCount} {deliveriesCount === 1 ? 'bill' : 'bills'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="font-bold text-red-600">
                    {dueDateDisplay}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-500">Account Status:</span>
                  <span className={`font-bold ${statusColorClass}`}>
                    {statusText}
                  </span>
                </div>
              </div>
            </div>

            {/* Consumption Highlights */}
            <div className="grid grid-cols-3 gap-2 my-5">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Deliveries</span>
                <span className="text-lg font-black text-blue-900">{deliveriesCount} {deliveriesCount === 1 ? 'Bill' : 'Bills'} {totalLitres > 0 ? `· ${totalLitres} L` : ''}</span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Total Billed</span>
                <span className="text-lg font-black text-emerald-900 font-mono">₹{totalBilled.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Net Balance Due</span>
                <span className="text-lg font-black text-amber-900 font-mono">₹{balanceDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Detailed Line Items Table */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/80">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-2">Bill #</th>
                    <th className="py-2.5 px-3">Milk Item / Description</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-gray-400 font-sans">
                        No recorded supply bills found for this customer.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                          {formatKhataDate(item.date)}
                        </td>
                        <td className="py-2.5 px-2 text-gray-500 font-bold">{item.billNo}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-gray-900">{item.productName}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-gray-800">{item.qty}</td>
                        <td className="py-2.5 px-2 text-right text-gray-600">₹{item.rate}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary Calculation */}
            <div className="pt-4 border-t-2 border-gray-200 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Gross Billed:</span>
                  <span className="font-mono font-bold">₹{totalBilled.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Paid / Advances:</span>
                  <span className="font-mono font-bold">- ₹{totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-900 pt-2 border-t border-gray-200 bg-amber-50/70 p-2 rounded-lg">
                  <span>Total Amount Due:</span>
                  <span className="font-mono font-black text-base text-amber-950">₹{balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment (QR Code + Bank Transfer Details) & Signatures Footer */}
            <div className="mt-7 pt-5 border-t-2 border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                
                {/* QR Code Column */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 text-center shadow-2xs">
                  <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs">
                    <img 
                      src={DAIRY_KHATA_BANK_DETAILS.qrCodeUrl} 
                      alt="Kotak Mahindra Bank & PhonePe UPI QR Code" 
                      className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="mt-2 text-center w-full">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-wider">Scan & Pay via Any UPI App</p>
                    <p className="text-[9px] text-gray-500 font-medium">PhonePe • Google Pay • Paytm • BHIM</p>
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <span className="font-mono text-[10px] font-bold text-milquu-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {DAIRY_KHATA_BANK_DETAILS.upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(DAIRY_KHATA_BANK_DETAILS.upiId);
                          toast.success('UPI ID copied!');
                        }}
                        className="p-1 text-gray-400 hover:text-milquu-blue cursor-pointer print:hidden transition-colors"
                        title="Copy UPI ID"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details & Signatures Column */}
                <div className="sm:col-span-7 flex flex-col justify-between h-full space-y-3">
                  <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 text-xs">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-blue-200/60">
                      <span className="text-[10px] font-black text-blue-950 uppercase tracking-wider flex items-center gap-1">
                        <QrCode size={12} className="text-milquu-blue" /> Direct Bank Transfer Details
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Dairy Khata
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">Account Holder:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900 text-right">{DAIRY_KHATA_BANK_DETAILS.accountHolder}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(DAIRY_KHATA_BANK_DETAILS.accountHolder);
                              toast.success('Account Holder copied!');
                            }}
                            className="p-0.5 text-gray-400 hover:text-milquu-blue cursor-pointer print:hidden"
                            title="Copy Account Holder"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">Bank Name:</span>
                        <span className="font-semibold text-gray-800">{DAIRY_KHATA_BANK_DETAILS.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">Account Number:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-black text-gray-950 tracking-wider text-xs">{DAIRY_KHATA_BANK_DETAILS.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(DAIRY_KHATA_BANK_DETAILS.accountNumber);
                              toast.success('Account Number copied!');
                            }}
                            className="p-0.5 text-gray-400 hover:text-milquu-blue cursor-pointer print:hidden"
                            title="Copy Account Number"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">Branch IFSC:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-black text-milquu-blue tracking-wide text-xs">{DAIRY_KHATA_BANK_DETAILS.ifscCode}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(DAIRY_KHATA_BANK_DETAILS.ifscCode);
                              toast.success('IFSC Code copied!');
                            }}
                            className="p-0.5 text-gray-400 hover:text-milquu-blue cursor-pointer print:hidden"
                            title="Copy IFSC Code"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[9px] text-gray-500 mt-2 italic pt-1.5 border-t border-blue-100">
                      * Please share payment confirmation screenshot on WhatsApp after clearing your bill.
                    </p>
                  </div>

                  {/* Signatures & Support Helpline */}
                  <div className="pt-2 flex justify-between items-end text-[10px] text-gray-500">
                    <div>
                      <p className="font-bold text-gray-700">MilQuu Fresh Helpline</p>
                      <p>{business.supportPhone || '+91 87670 67884'}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-28 border-b border-gray-400 pb-4 mb-1"></div>
                      <p className="font-bold text-gray-800 text-[11px]">Authorized Signatory</p>
                      <p className="text-[9px] text-gray-400">MilQuu Fresh</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center print:hidden">
          <span className="text-xs text-gray-400 font-mono">Invoice Reference: {invoiceNumber}</span>
          <button
            onClick={() => setShowInvoiceModal(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default MilkInvoiceModal;
