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
          <div id="purchase-bill-printable" className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-gray-800 font-sans">
            
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-2xl font-serif font-black text-milquu-dark tracking-tight">{business.businessName}</h1>
                {business.tagline && <p className="text-xs font-semibold text-gray-600 mt-0.5">{business.tagline}</p>}
                {business.address && <p className="text-[11px] text-gray-500">{business.address}</p>}
                <p className="text-[11px] text-gray-500">{[business.supportPhone && `Tel: ${business.supportPhone}`, business.supportEmail && `Email: ${business.supportEmail}`].filter(Boolean).join(' | ')}</p>
                {business.gstin && <p className="text-[11px] text-gray-500">GSTIN: {business.gstin}</p>}
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
