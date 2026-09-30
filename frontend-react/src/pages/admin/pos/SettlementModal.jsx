import { Banknote, X, QrCode } from 'lucide-react';
import { DAIRY_KHATA_BANK_DETAILS } from '../../../utils/khataPaymentConfig';

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

            {/* UPI QR & Bank Transfer Card */}
            {settlePaymentMethod === 'UPI' && (
              <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl text-center space-y-2 animate-fadeIn">
                <div className="flex items-center justify-center gap-1.5 text-purple-900 font-bold text-xs uppercase tracking-wide">
                  <QrCode size={14} /> Scan & Pay Khata Settlement
                </div>
                <div className="flex justify-center">
                  <img
                    src={DAIRY_KHATA_BANK_DETAILS.qrCodeUrl}
                    alt="Kotak Mahindra Bank & PhonePe UPI QR"
                    className="w-28 h-28 object-contain rounded-xl border border-purple-200 bg-white p-1 shadow-2xs"
                  />
                </div>
                <div className="text-[11px] space-y-1">
                  <p className="font-mono font-bold text-gray-900 bg-white inline-block px-2.5 py-0.5 rounded-lg border border-purple-200">
                    UPI: {DAIRY_KHATA_BANK_DETAILS.upiId}
                  </p>
                  <div className="text-[10px] text-gray-600 pt-1 border-t border-purple-100 font-mono space-y-0.5 text-left px-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">A/C:</span>
                      <span className="font-bold text-gray-900 font-sans">{DAIRY_KHATA_BANK_DETAILS.accountHolder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">Bank:</span>
                      <span>{DAIRY_KHATA_BANK_DETAILS.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">A/C No:</span>
                      <span className="font-bold text-gray-900">{DAIRY_KHATA_BANK_DETAILS.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-sans">IFSC:</span>
                      <span className="font-bold text-purple-800">{DAIRY_KHATA_BANK_DETAILS.ifscCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
