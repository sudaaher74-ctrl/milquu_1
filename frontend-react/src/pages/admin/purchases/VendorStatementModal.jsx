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
          <div id="vendor-ledger-printable" className="p-6 overflow-y-auto font-sans">
            {loadingLedger || !vendorLedgerData ? (
              <div className="py-20 text-center">
                <RefreshCw size={28} className="animate-spin text-milquu-blue mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-500">Generating vendor accounting ledger...</p>
              </div>
            ) : (
              <>
                {/* Brand Header for Statement */}
                <div className="border-b-2 border-gray-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                  <div>
                    <h1 className="text-2xl font-serif font-black text-milquu-dark tracking-tight">{business.businessName}</h1>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">Dairy Supply Ledger & Khata Account Statement</p>
                    <p className="text-[11px] text-gray-500">{[business.address, business.supportPhone && `Tel: ${business.supportPhone}`, business.supportEmail].filter(Boolean).join(' | ')}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block bg-milquu-dark text-white text-[11px] font-bold px-3 py-1 rounded-md tracking-wider uppercase mb-1">
                      Vendor Statement
                    </span>
                    <p className="text-xs text-gray-500">
                      Date: <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                </div>

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
  </>
  );
};

export default VendorStatementModal;
