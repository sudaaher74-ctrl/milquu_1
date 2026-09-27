import { Banknote, X } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const SettlementModal = ({ handleSettleSubmit, isSettling, selectedCreditCustomerForSettlement, setSettleAmount, setSettlePaymentMethod, setShowSettleModal, settleAmount, settlePaymentMethod, showSettleModal }) => (
  <>
    {/* ============================================================ */}
    {/* MODAL 3: PAYMENT SETTLEMENT MODAL                            */}
    {/* ============================================================ */}
    {showSettleModal && selectedCreditCustomerForSettlement && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
          <button 
            onClick={() => setShowSettleModal(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Banknote size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Record Khata Payment</h3>
              <p className="text-xs text-gray-500">{selectedCreditCustomerForSettlement.name} ({selectedCreditCustomerForSettlement.phone || 'Walk-in'})</p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4 flex justify-between items-center">
            <span className="text-xs text-amber-800">Current Outstanding:</span>
            <span className="text-lg font-bold text-amber-950 font-mono">
              ₹{selectedCreditCustomerForSettlement.totalDue?.toFixed(2)}
            </span>
          </div>

          <form onSubmit={handleSettleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Payment Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-base font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'UPI', 'Card'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSettlePaymentMethod(mode)}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      settlePaymentMethod === mode
                        ? 'bg-green-600 text-white border-green-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowSettleModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSettling}
                className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSettling ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

export default SettlementModal;
