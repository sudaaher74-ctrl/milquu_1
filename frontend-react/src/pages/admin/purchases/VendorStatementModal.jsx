import { useBusinessSettings } from '../../../utils/useBusinessSettings';
import { ArrowDownLeft, ArrowUpRight, BookOpen, Download, IndianRupee, Layers, Package, Printer, RefreshCw, Share2, X } from 'lucide-react';

// Extracted from Purchases.jsx. Receives the page state and
// handlers it uses as props of the same name.
const VendorStatementModal = ({ handleDownloadLedgerExcel, handleDownloadLedgerPDF, handlePrint, handleShareLedgerWhatsApp, isGeneratingLedgerPdf, loadingLedger, openRecordPaymentModal, selectedVendorForLedger, setShowLedgerModal, showLedgerModal, vendorLedgerData }) => {
  // Letterhead from Settings → Business
  const business = useBusinessSettings();
  return (
  <>
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
                disabled={isGeneratingLedgerPdf}
                className="px-3 py-1.5 bg-milquu-dark text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {isGeneratingLedgerPdf ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> PDF...
                  </>
                ) : (
                  <>
                    <Download size={13} /> PDF
                  </>
                )}
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
          <div
            id="vendor-ledger-printable"
            className="p-6 overflow-y-auto font-sans"
            style={{
              backgroundColor: '#ffffff',
              color: '#1f2937',
              fontFamily: "'Outfit', sans-serif",
              padding: '32px',
              boxSizing: 'border-box'
            }}
          >
            {loadingLedger || !vendorLedgerData ? (
              <div className="py-20 text-center" style={{ textAlign: 'center', padding: '80px 0' }}>
                <RefreshCw size={28} className="animate-spin text-milquu-blue mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-500" style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                  Generating vendor accounting ledger...
                </p>
              </div>
            ) : (
              <>
                {/* Brand Header for Statement */}
                <div
                  className="border-b-2 border-gray-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    borderBottom: '2px solid #111827',
                    paddingBottom: '16px',
                    marginBottom: '24px'
                  }}
                >
                  <div>
                    <h1
                      className="text-2xl font-serif font-black text-milquu-dark tracking-tight"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#111827',
                        margin: '0 0 2px 0'
                      }}
                    >
                      {business.businessName}
                    </h1>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5" style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563', margin: '2px 0 0 0' }}>
                      Dairy Supply Ledger &amp; Khata Account Statement
                    </p>
                    <p className="text-[11px] text-gray-500" style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>
                      {[business.address, business.supportPhone && `Tel: ${business.supportPhone}`, business.supportEmail].filter(Boolean).join(' | ')}
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
                      Vendor Statement
                    </span>
                    <p className="text-xs text-gray-500" style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
                      Date: <span className="font-semibold text-gray-900" style={{ fontWeight: 600, color: '#111827' }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                </div>

                {/* Vendor Details Banner */}
                <div
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 gap-4"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    gap: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2
                        className="text-xl font-serif font-bold text-milquu-dark"
                        style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}
                      >
                        {vendorLedgerData.vendor?.name}
                      </h2>
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          backgroundColor: vendorLedgerData.summary?.balanceDue > 0 ? '#fef3c7' : '#d1fae5',
                          color: vendorLedgerData.summary?.balanceDue > 0 ? '#92400e' : '#065f46'
                        }}
                      >
                        {vendorLedgerData.summary?.balanceDue > 0 ? 'Pending Dues' : 'Fully Settled'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-2" style={{ fontSize: '12px', color: '#4b5563', margin: '6px 0 0 0' }}>
                      <span>Tel: {vendorLedgerData.vendor?.phone || 'N/A'}</span>
                      {vendorLedgerData.vendor?.address && (
                        <span> • Address: {vendorLedgerData.vendor.address}</span>
                      )}
                    </p>
                  </div>

                  {/* Financial Summary Badges */}
                  <div className="flex flex-wrap gap-3" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-right"
                      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '8px 16px', textAlign: 'right' }}
                    >
                      <span className="text-[10px] uppercase font-bold text-gray-400 block" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', display: 'block' }}>
                        Total Purchases
                      </span>
                      <span className="text-sm font-bold text-milquu-dark" style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                        ₹{Number(vendorLedgerData.summary?.totalBilled || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-right"
                      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '8px 16px', textAlign: 'right' }}
                    >
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#059669', display: 'block' }}>
                        Total Paid
                      </span>
                      <span className="text-sm font-bold text-emerald-700" style={{ fontSize: '14px', fontWeight: 700, color: '#047857' }}>
                        ₹{Number(vendorLedgerData.summary?.totalPaid || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-right"
                      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '8px 16px', textAlign: 'right' }}
                    >
                      <span className="text-[10px] uppercase font-bold text-amber-600 block" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#d97706', display: 'block' }}>
                        Net Balance Due
                      </span>
                      <span className="text-base font-bold text-amber-700" style={{ fontSize: '16px', fontWeight: 700, color: '#b45309' }}>
                        ₹{Number(vendorLedgerData.summary?.balanceDue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Products Supplied Breakdown */}
                {vendorLedgerData.productsBreakdown && vendorLedgerData.productsBreakdown.length > 0 && (
                  <div className="mb-6" style={{ marginBottom: '24px' }}>
                    <h3
                      className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
                      style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Package size={14} className="text-milquu-blue" />
                      Products Purchased From This Vendor
                    </h3>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}
                    >
                      {vendorLedgerData.productsBreakdown.map((prod, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-xs"
                          style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <div>
                            <p className="font-bold text-gray-900 text-xs" style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0 }}>{prod.name}</p>
                            <p className="text-[11px] text-gray-500" style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>{prod.category || 'General'}</p>
                          </div>
                          <div className="text-right" style={{ textAlign: 'right' }}>
                            <p className="font-bold text-milquu-dark text-xs" style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0 }}>{prod.quantity.toLocaleString('en-IN')} {prod.unit || 'L'}</p>
                            <p className="text-[11px] text-gray-400" style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>₹{Number(prod.totalCost).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Chronological Ledger Transactions */}
                <div>
                  <h3
                    className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
                    style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Layers size={14} className="text-milquu-blue" />
                    Detailed Ledger Statement (Bills &amp; Payments)
                  </h3>
                  <div
                    className="overflow-x-auto rounded-xl border border-gray-200"
                    style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>
                          <th style={{ padding: '12px 14px' }}>Date</th>
                          <th style={{ padding: '12px 14px' }}>Type</th>
                          <th style={{ padding: '12px 14px' }}>Ref / PO #</th>
                          <th style={{ padding: '12px 14px' }}>Particulars / Description</th>
                          <th style={{ padding: '12px 14px', textAlign: 'right' }}>Debit (Billed)</th>
                          <th style={{ padding: '12px 14px', textAlign: 'right' }}>Credit (Paid)</th>
                          <th style={{ padding: '12px 14px', textAlign: 'right' }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorLedgerData.transactions.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                              No transactions found for this vendor.
                            </td>
                          </tr>
                        ) : (
                          vendorLedgerData.transactions.map((tx, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '12px 14px', color: '#4b5563' }}>
                                {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    fontSize: '10px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    backgroundColor: tx.type === 'BILL' ? '#dbeafe' : '#d1fae5',
                                    color: tx.type === 'BILL' ? '#1e40af' : '#065f46',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {tx.type === 'BILL' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                                  {tx.type}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#111827' }}>{tx.refNo || '-'}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <p style={{ fontWeight: 600, color: '#1f2937', margin: 0 }}>{tx.productName || tx.notes || '-'}</p>
                                {tx.quantity > 0 && (
                                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>{tx.quantity} {tx.unit} @ ₹{tx.rate}</p>
                                )}
                                {tx.paymentMode && (
                                  <p style={{ fontSize: '11px', color: '#059669', fontWeight: 500, margin: '2px 0 0 0' }}>Via {tx.paymentMode}</p>
                                )}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                                {tx.debit > 0 ? `₹${Number(tx.debit).toLocaleString('en-IN')}` : '-'}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                {tx.credit > 0 ? `₹${Number(tx.credit).toLocaleString('en-IN')}` : '-'}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
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
  </>
  );
};

export default VendorStatementModal;
