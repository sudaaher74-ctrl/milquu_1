import { BookOpen, CheckCircle2, Download, FileText, X } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const CustomerLedgerModal = ({ handleMarkOrderPaid, handleOpenSettleModal, handleOpenInvoiceModal, selectedCreditCustomerForLedger, setShowLedgerModal, showLedgerModal }) => (
  <>
    {/* ============================================================ */}
    {/* MODAL 2: CUSTOMER KHATA / LEDGER BILLS MODAL                 */}
    {/* ============================================================ */}
    {showLedgerModal && selectedCreditCustomerForLedger && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <BookOpen size={18} className="text-amber-600" />
                Khata Ledger: {selectedCreditCustomerForLedger.name}
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                {selectedCreditCustomerForLedger.phone || 'Walk-in'} • {selectedCreditCustomerForLedger.billingCycle || '15 Days'} Cycle
              </p>
            </div>
            <div className="flex items-center gap-2">
              {handleOpenInvoiceModal && (
                <button
                  type="button"
                  onClick={() => handleOpenInvoiceModal(selectedCreditCustomerForLedger)}
                  className="px-3 py-1.5 bg-blue-50 text-milquu-blue hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                  title="Generate, Print or Download Milk Invoice PDF"
                >
                  <Download size={13} />
                  <span>Download Milk Bill</span>
                </button>
              )}
              <button 
                onClick={() => setShowLedgerModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Total Summary Banner */}
          <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex justify-between items-center">
            <div>
              <span className="text-xs text-amber-800 block">Total Unpaid Balance:</span>
              <span className="text-2xl font-bold text-amber-900 font-mono">
                ₹{selectedCreditCustomerForLedger.totalDue?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {handleOpenInvoiceModal && (
                <button
                  onClick={() => handleOpenInvoiceModal(selectedCreditCustomerForLedger)}
                  className="px-3.5 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} className="text-milquu-blue" />
                  View Invoice
                </button>
              )}
              <button
                onClick={() => {
                  setShowLedgerModal(false);
                  handleOpenSettleModal(selectedCreditCustomerForLedger);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Settle Full / Partial Dues
              </button>
            </div>
          </div>

          {/* Bills List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedCreditCustomerForLedger.orders && selectedCreditCustomerForLedger.orders.length > 0 ? (
              selectedCreditCustomerForLedger.orders.map((ord, idx) => (
                <div key={ord._id || idx} className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-gray-800">
                        Bill #{ord.orderId ? ord.orderId.toString().slice(-6) : `POS-${idx + 1}`}
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Date: {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-amber-700 font-mono">₹{ord.totalPrice?.toFixed(2)}</span>
                      <p className="text-[10px] text-gray-500">
                        Due: {ord.creditDueDate ? new Date(ord.creditDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {ord.items && ord.items.length > 0 && (
                    <div className="bg-gray-50 p-2 rounded-lg text-xs space-y-1 mb-2">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-gray-600">
                          <span>{it.name} (x{it.qty})</span>
                          <span className="font-mono">₹{it.price * it.qty}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleMarkOrderPaid(ord._id || ord.orderId)}
                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✓ Mark This Bill Paid
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <CheckCircle2 size={40} className="mx-auto mb-2 text-green-500 opacity-60" />
                <p className="font-semibold text-gray-700">All bills are cleared!</p>
                <p className="text-xs text-gray-400">This customer has 0 outstanding balance.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setShowLedgerModal(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              Close Ledger
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

export default CustomerLedgerModal;
