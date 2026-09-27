import { Clock, X } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const BillingCycleModal = ({ editCreditLimit, editCycleValue, handleUpdateCycleSubmit, isUpdatingCycle, selectedCustomerForEditCycle, setEditCreditLimit, setEditCycleValue, setShowEditCycleModal, showEditCycleModal }) => (
  <>
    {/* ============================================================ */}
    {/* MODAL 4: EDIT BILLING CYCLE MODAL                            */}
    {/* ============================================================ */}
    {showEditCycleModal && selectedCustomerForEditCycle && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
          <button 
            onClick={() => setShowEditCycleModal(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-milquu-blue flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Change Billing System</h3>
              <p className="text-xs text-gray-500">{selectedCustomerForEditCycle.name}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateCycleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Billing Cycle Period
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['10 Days', '15 Days', '30 Days'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditCycleValue(c)}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      editCycleValue === c
                        ? 'bg-milquu-blue text-white border-milquu-blue shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                placeholder="0 for unlimited"
                value={editCreditLimit}
                onChange={(e) => setEditCreditLimit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowEditCycleModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingCycle}
                className="px-5 py-2 bg-milquu-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingCycle ? 'Saving...' : 'Update System'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

export default BillingCycleModal;
