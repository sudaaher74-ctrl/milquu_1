import { useBusinessSettings } from '../../../utils/useBusinessSettings';
import { Download, FileText, Printer, RefreshCw, Share2, X } from 'lucide-react';

// Extracted from Purchases.jsx. Receives the page state and
// handlers it uses as props of the same name.
const PurchaseBillModal = ({ handleDownloadBillPDF, handlePrint, handleShareBillWhatsApp, isGeneratingBillPdf, selectedPurchaseForBill, setShowBillModal, showBillModal }) => {
  // Letterhead from Settings → Business
  const business = useBusinessSettings();
  return (
  <>
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
                disabled={isGeneratingBillPdf}
                className="px-3.5 py-1.5 bg-milquu-dark text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {isGeneratingBillPdf ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download PDF
                  </>
                )}
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
          <div
            id="purchase-bill-printable"
            className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-gray-800 font-sans"
            style={{
              backgroundColor: '#ffffff',
              color: '#1f2937',
              fontFamily: "'Outfit', sans-serif",
              padding: '32px',
              boxSizing: 'border-box'
            }}
          >
            
            {/* Header */}
            <div
              className="border-b-2 border-gray-800 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                borderBottom: '2px solid #111827',
                paddingBottom: '20px',
                marginBottom: '24px'
              }}
            >
              <div>
                <h1
                  className="text-2xl font-serif font-black text-milquu-dark tracking-tight"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '26px',
                    fontWeight: 900,
                    color: '#111827',
                    margin: '0 0 2px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {business.businessName}
                </h1>
                <p
                  className="text-xs font-semibold text-gray-600 mt-0.5"
                  style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', margin: '2px 0 0 0' }}
                >
                  {business.tagline}
                </p>
                <p
                  className="text-[11px] text-gray-500"
                  style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}
                >
                  {business.address}
                </p>
                <p
                  className="text-[11px] text-gray-500"
                  style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}
                >
                  {[business.supportPhone && `Tel: ${business.supportPhone}`, business.supportEmail && `Email: ${business.supportEmail}`, business.gstin && `GSTIN: ${business.gstin}`].filter(Boolean).join(' | ')}
                </p>
              </div>
              <div className="sm:text-right" style={{ textAlign: 'right' }}>
                <span
                  className="inline-block bg-milquu-dark text-white text-[11px] font-bold px-3 py-1 rounded-md tracking-wider uppercase mb-1"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                  }}
                >
                  Purchase Voucher
                </span>
                <p className="text-xs text-gray-500" style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
                  PO No: <span className="font-bold text-gray-900" style={{ color: '#111827', fontWeight: 700 }}>{selectedPurchaseForBill.poNumber}</span>
                </p>
                <p className="text-xs text-gray-500" style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
                  Date: <span className="font-semibold text-gray-900" style={{ color: '#111827', fontWeight: 600 }}>{new Date(selectedPurchaseForBill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </p>
              </div>
            </div>

            {/* Vendor & Status Grid */}
            <div
              className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 border border-gray-200 mb-6"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                marginBottom: '24px',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <p
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"
                  style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}
                >
                  Vendor / Farmer Details
                </p>
                <p
                  className="font-bold text-milquu-dark text-sm"
                  style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}
                >
                  {selectedPurchaseForBill.supplierName}
                </p>
                <p
                  className="text-xs text-gray-600 mt-0.5"
                  style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0 0 0' }}
                >
                  Phone: {selectedPurchaseForBill.supplierPhone || 'N/A'}
                </p>
                {selectedPurchaseForBill.supplierAddress && (
                  <p
                    className="text-xs text-gray-600 mt-0.5"
                    style={{ fontSize: '12px', color: '#4b5563', margin: '2px 0 0 0' }}
                  >
                    Address: {selectedPurchaseForBill.supplierAddress}
                  </p>
                )}
              </div>
              <div className="text-right" style={{ textAlign: 'right' }}>
                <p
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"
                  style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' }}
                >
                  Payment Status
                </p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: selectedPurchaseForBill.status === 'Paid' ? '#d1fae5' : selectedPurchaseForBill.status === 'Received' ? '#dbeafe' : selectedPurchaseForBill.status === 'Partial' ? '#fef3c7' : '#ffedd5',
                    color: selectedPurchaseForBill.status === 'Paid' ? '#065f46' : selectedPurchaseForBill.status === 'Received' ? '#1e40af' : selectedPurchaseForBill.status === 'Partial' ? '#92400e' : '#9a3412'
                  }}
                >
                  {selectedPurchaseForBill.status}
                </span>
                <p className="text-xs text-gray-500 mt-1.5" style={{ fontSize: '12px', color: '#6b7280', margin: '6px 0 0 0' }}>
                  Payment Mode: <span className="font-semibold text-gray-800" style={{ fontWeight: 600, color: '#111827' }}>{selectedPurchaseForBill.paymentMode || 'Cash'}</span>
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div
              className="mb-6 overflow-hidden rounded-xl border border-gray-200"
              style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: '12px 16px' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>Particulars / Material</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Rate / Unit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontWeight: 600 }}>1</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>{selectedPurchaseForBill.productName}</td>
                    <td style={{ padding: '14px 16px', color: '#4b5563' }}>{selectedPurchaseForBill.category}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                      {selectedPurchaseForBill.quantity} {selectedPurchaseForBill.unit || 'Litre'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#374151' }}>
                      ₹{Number(selectedPurchaseForBill.rate || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                      ₹{Number(selectedPurchaseForBill.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Calculation Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
              <div style={{ width: '260px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#4b5563' }}>Total Purchase Cost:</span>
                  <strong style={{ color: '#111827' }}>
                    ₹{Number(selectedPurchaseForBill.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6', color: '#047857' }}>
                  <span>Amount Paid:</span>
                  <strong style={{ color: '#047857' }}>
                    ₹{Number(selectedPurchaseForBill.paidAmount || (selectedPurchaseForBill.status === 'Paid' ? selectedPurchaseForBill.totalCost : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #111827', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                  <span>Balance Due:</span>
                  <span style={{ color: (selectedPurchaseForBill.balanceAmount ?? (selectedPurchaseForBill.totalCost - (selectedPurchaseForBill.paidAmount || 0))) > 0 ? '#b45309' : '#047857', fontWeight: 700 }}>
                    ₹{Number(selectedPurchaseForBill.balanceAmount ?? (selectedPurchaseForBill.totalCost - (selectedPurchaseForBill.paidAmount || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ paddingTop: '32px', borderTop: '1px dashed #d1d5db', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', textAlign: 'center', fontSize: '12px', color: '#4b5563' }}>
              <div>
                <div style={{ height: '50px' }}></div>
                <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontWeight: 500 }}>
                  Vendor / Farmer Signature
                </div>
              </div>
              <div>
                <div style={{ height: '50px' }}></div>
                <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontWeight: 700, color: '#111827' }}>
                  Authorized Signatory ({business.businessName})
                </div>
              </div>
            </div>

            <p style={{ fontSize: '10px', textAlign: 'center', color: '#9ca3af', marginTop: '24px', marginBottom: 0 }}>
              Thank you for supplying pure, high quality produce to {business.businessName}!
            </p>
          </div>

          {/* Bottom Sticky Action Bar (Ensures actions are always visible) */}
          <div className="shrink-0 p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center no-print">
            <span className="text-xs text-gray-500 font-medium">Voucher #{selectedPurchaseForBill.poNumber}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadBillPDF(selectedPurchaseForBill)}
                disabled={isGeneratingBillPdf}
                className="px-4 py-2 bg-milquu-dark text-white rounded-xl text-xs font-bold hover:bg-gray-800 flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
              >
                {isGeneratingBillPdf ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download PDF
                  </>
                )}
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
  </>
  );
};

export default PurchaseBillModal;
