import { X } from 'lucide-react';

// Extracted from Purchases.jsx. Receives the page state and
// handlers it uses as props of the same name.
const VendorPaymentModal = ({ currentVendorDue, existingSupplierNames, handleSavePayment, paymentFormData, setPaymentFormData, setShowPaymentModal, showPaymentModal }) => (
  <>
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
  </>
);

export default VendorPaymentModal;
