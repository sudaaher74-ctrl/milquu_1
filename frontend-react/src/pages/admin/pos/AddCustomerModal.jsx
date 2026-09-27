import { UserPlus, X } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const AddCustomerModal = ({ handleCreateCustomer, isSavingCustomer, newCustomer, setNewCustomer, setShowAddCustomerModal, showAddCustomerModal }) => (
  <>
    {/* ============================================================ */}
    {/* MODAL 1: ADD REGULAR CUSTOMER                                */}
    {/* ============================================================ */}
    {showAddCustomerModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
          <button 
            onClick={() => setShowAddCustomerModal(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-milquu-blue flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Add Regular Customer</h3>
              <p className="text-xs text-gray-500">Configure customer details & credit billing system</p>
            </div>
          </div>

          <form onSubmit={handleCreateCustomer} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Full Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number (Required for Credit)</label>
              <input 
                type="tel"
                placeholder="e.g. 9876543210"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono"
              />
            </div>

            {/* Billing System Selection (10 Days, 15 Days, 30 Days, None) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Billing Cycle System (Khata Terms) *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['10 Days', '15 Days', '30 Days'].map(cycle => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setNewCustomer({ ...newCustomer, billingCycle: cycle, isCreditCustomer: true })}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      newCustomer.billingCycle === cycle
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {cycle}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Customer will be scheduled for billing reconciliation every {newCustomer.billingCycle}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Address / Society</label>
              <input 
                type="text"
                placeholder="e.g. Flat 402, Sector 6, New Panvel"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Credit Limit (₹ Optional)</label>
              <input 
                type="number"
                placeholder="e.g. 5000 (0 for unlimited)"
                value={newCustomer.creditLimit}
                onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCustomer}
                className="px-5 py-2 bg-milquu-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
              >
                {isSavingCustomer ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

export default AddCustomerModal;
