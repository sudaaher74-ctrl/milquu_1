import { useBusinessSettings } from '../../../utils/useBusinessSettings';
import { Printer, X } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const ReceiptModal = ({ completedOrder, handlePrint, setShowReceiptModal, showReceiptModal }) => {
  // Printed from Settings → Business, so the receipt always matches the business
  const business = useBusinessSettings();
  return (
  <>
    {/* ============================================================ */}
    {/* MODAL 5: PRINTABLE RECEIPT MODAL                             */}
    {/* ============================================================ */}
    {showReceiptModal && completedOrder && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Modal Header Controls (hidden when printing) */}
          <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center print:hidden">
            <span className="text-xs font-bold text-gray-600">Bill Generated Successfully</span>
            <button 
              onClick={() => setShowReceiptModal(false)}
              className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Receipt Voucher Body (Printed content) */}
          <div id="pos-receipt-voucher" className="p-6 bg-white overflow-y-auto text-gray-800 text-xs font-mono">
            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400 mb-3">
              <h2 className="text-base font-bold text-black uppercase tracking-wider font-serif">{business.businessName}</h2>
              {business.tagline && <p className="text-[11px] text-gray-600">{business.tagline}</p>}
              {business.address && <p className="text-[10px] text-gray-500">{business.address}</p>}
              {business.supportPhone && <p className="text-[10px] text-gray-500">Tel: {business.supportPhone}</p>}
              {business.gstin && <p className="text-[10px] text-gray-500">GSTIN: {business.gstin}</p>}
              {business.fssaiLicense && <p className="text-[10px] text-gray-500">FSSAI: {business.fssaiLicense}</p>}
            </div>

            {/* Bill Details */}
            <div className="pb-3 border-b border-dashed border-gray-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Bill No:</span>
                <span className="font-bold text-black">{completedOrder.billNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{completedOrder.date}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-dotted border-gray-200">
                <span className="text-gray-700">Customer:</span>
                <span className="text-black text-right">{completedOrder.customerName}</span>
              </div>
              {completedOrder.customerPhone && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Phone:</span>
                  <span>{completedOrder.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Payment:</span>
                {completedOrder.isCredit ? (
                  <span className="font-bold text-amber-700">CREDIT / KHATA ({completedOrder.billingCycle} Cycle)</span>
                ) : (
                  <span className="font-bold text-green-700">{completedOrder.paymentMethod} (PAID)</span>
                )}
              </div>
              {completedOrder.isCredit && completedOrder.creditDueDate && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Payment Due:</span>
                  <span className="font-bold text-red-600">{completedOrder.creditDueDate}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-gray-300">
              <div className="flex justify-between font-bold text-gray-600 pb-1 mb-1 border-b border-gray-200 text-[11px]">
                <span>Item</span>
                <span className="text-right">Qty x Rate = Amt</span>
              </div>
              <div className="space-y-1.5">
                {completedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <span className="font-semibold text-gray-800 pr-2">{it.name}</span>
                    <span className="whitespace-nowrap font-bold text-gray-900">
                      {it.qty} x ₹{it.price} = ₹{it.qty * it.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Totals */}
            <div className="py-3 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{completedOrder.subtotal.toFixed(2)}</span>
              </div>
              {completedOrder.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-₹{completedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-black pt-1 border-t border-gray-200">
                <span>Grand Total:</span>
                <span className={completedOrder.isCredit ? 'text-amber-700' : 'text-green-700'}>
                  ₹{completedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 text-[10px] text-gray-500">
              <p className="font-semibold text-gray-700">Thank you for visiting {business.businessName}!</p>
              <p>Have a fresh & healthy day</p>
            </div>
          </div>

          {/* Modal Actions (hidden when printing) */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-milquu-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
            >
              <Printer size={15} /> Print Bill
            </button>
            <button
              onClick={() => setShowReceiptModal(false)}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Next Sale
            </button>
          </div>

        </div>
      </div>
    )}
    {/* Thermal receipt printing stylesheet */}
    <style>{`
      @media print {
        body * {
          visibility: hidden;
        }
        #pos-receipt-voucher, #pos-receipt-voucher * {
          visibility: visible;
        }
        #pos-receipt-voucher {
          position: absolute;
          left: 0;
          top: 0;
          width: 80mm;
          max-width: 100%;
          margin: 0;
          padding: 10px;
          background: white !important;
          color: black !important;
        }
      }
    `}</style>
  </>
  );
};

export default ReceiptModal;
