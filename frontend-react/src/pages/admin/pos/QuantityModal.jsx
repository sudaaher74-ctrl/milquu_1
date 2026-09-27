import { Calculator, Check, X } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const QuantityModal = ({ customQtyInput, handleSaveCustomQty, qtyInputRef, qtyModalItem, setCustomQtyInput, setQtyModalItem }) => (
  <>
    {/* ============================================================ */}
    {/* MODAL 0: MANUAL SET QUANTITY MODAL                           */}
    {/* ============================================================ */}
    {qtyModalItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Calculator size={18} className="text-amber-600" />
                Set Quantity: {qtyModalItem.name}
              </h3>
              <p className="text-xs text-gray-500">
                Rate: ₹{qtyModalItem.price} / unit
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setQtyModalItem(null)}
              className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveCustomQty} className="p-5 space-y-4">
            {/* Large Manual Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Enter Quantity Manually
              </label>
              <div className="relative">
                <input
                  ref={qtyInputRef}
                  type="number"
                  min="1"
                  step="any"
                  value={customQtyInput}
                  onChange={(e) => setCustomQtyInput(e.target.value)}
                  className="w-full text-center text-3xl font-extrabold text-gray-900 border-2 border-amber-400 focus:border-amber-600 rounded-xl py-3 focus:outline-none focus:ring-4 focus:ring-amber-100 shadow-inner"
                  placeholder="e.g. 30"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  units
                </span>
              </div>
            </div>

            {/* Quick Select Preset Buttons */}
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-2">Quick Presets:</span>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20, 30, 45, 60, 90].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomQtyInput(String(preset))}
                    className={`py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                      String(customQtyInput) === String(preset)
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200 flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Calculated Subtotal:</span>
              <span className="text-lg font-extrabold text-amber-900 font-mono">
                ₹{((parseFloat(customQtyInput) || 0) * qtyModalItem.price).toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setQtyModalItem(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-milquu-blue text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={16} /> Apply Quantity
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

export default QuantityModal;
