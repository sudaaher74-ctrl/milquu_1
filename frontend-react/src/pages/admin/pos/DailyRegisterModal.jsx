import { X } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const DailyRegisterModal = ({ customerList, dailyRegisterData, handleDailyRegisterSubmit, isMilkProduct, isSubmittingDailyRegister, products, setDailyRegisterData, setShowDailyRegisterModal, showDailyRegisterModal }) => (
  <>
    {/* ============================================================ */}
    {/* MODAL 6: QUICK DAILY MILK REGISTER (CREDIT / KHATA)          */}
    {/* ============================================================ */}
    {showDailyRegisterModal && (
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 my-auto z-10 max-h-[92vh] flex flex-col">
          
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-2 bg-amber-50 rounded-2xl border border-amber-200">🥛</span>
              <div>
                <h2 className="text-lg font-serif font-bold text-milquu-dark flex items-center gap-2">
                  Daily Milk Register
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    Credit / Khata
                  </span>
                </h2>
                <p className="text-xs text-gray-500">Record daily milk delivery directly to customer's account</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDailyRegisterModal(false)}
              className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleDailyRegisterSubmit} className="space-y-4 overflow-y-auto pr-1">
            
            {/* Customer Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Customer (Select or Type Name) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1.5">
                <select
                  value={dailyRegisterData.customerId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const c = customerList.find(item => (item._id || item.id || item.customerId || item.userId) === selectedId);
                    if (c) {
                      setDailyRegisterData(prev => ({
                        ...prev,
                        customerId: selectedId,
                        customerName: c.name || '',
                        customerPhone: c.phone || ''
                      }));
                    } else {
                      setDailyRegisterData(prev => ({
                        ...prev,
                        customerId: '',
                        customerName: '',
                        customerPhone: ''
                      }));
                    }
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-milquu-blue bg-white"
                >
                  <option value="">-- Choose from Regular Customers --</option>
                  {customerList.map((c) => (
                    <option key={c._id || c.id || c.customerId || c.userId} value={c._id || c.id || c.customerId || c.userId}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} {c.totalDue > 0 ? `[Due: ₹${c.totalDue}]` : ''}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="text"
                    placeholder="Customer Name *"
                    value={dailyRegisterData.customerName}
                    onChange={(e) => setDailyRegisterData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-milquu-blue"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={dailyRegisterData.customerPhone}
                    onChange={(e) => setDailyRegisterData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-milquu-blue"
                  />
                </div>
              </div>
            </div>

            {/* Date & Shift */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={dailyRegisterData.date}
                  onChange={(e) => setDailyRegisterData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-milquu-blue bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Shift</label>
                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDailyRegisterData(prev => ({ ...prev, shift: 'Morning' }))}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dailyRegisterData.shift === 'Morning'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    🌅 Morning
                  </button>
                  <button
                    type="button"
                    onClick={() => setDailyRegisterData(prev => ({ ...prev, shift: 'Evening' }))}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dailyRegisterData.shift === 'Evening'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    🌇 Evening
                  </button>
                </div>
              </div>
            </div>

            {/* Milk Product & Size Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Milk Variant</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {products.filter(isMilkProduct).slice(0, 4).map((p) => {
                  const isSelected = dailyRegisterData.productId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        const unit = dailyRegisterData.unit;
                        const effectiveRate = unit.includes('500') ? Math.ceil(p.price / 2) : p.price;
                        setDailyRegisterData(prev => ({
                          ...prev,
                          productId: p.id,
                          productName: p.name,
                          price: effectiveRate
                        }));
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold text-gray-800 leading-tight">{p.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">Base: ₹{p.price} / L</p>
                    </button>
                  );
                })}
              </div>

              {/* 1 Litre vs 500 ml Unit Toggle */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-gray-600">Packaging Size:</span>
                <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const sel = products.find(p => p.id === dailyRegisterData.productId);
                      const rate = sel ? sel.price : 54;
                      setDailyRegisterData(prev => ({ ...prev, unit: '1 Litre', price: rate }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dailyRegisterData.unit === '1 Litre'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-blue-700'
                    }`}
                  >
                    1 Litre
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = products.find(p => p.id === dailyRegisterData.productId);
                      const rate = sel ? Math.ceil(sel.price / 2) : 27;
                      setDailyRegisterData(prev => ({ ...prev, unit: '500 ml', price: rate }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dailyRegisterData.unit === '500 ml'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-emerald-700'
                    }`}
                  >
                    500 ml (Half Litre)
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity & Rate */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Quantity ({dailyRegisterData.unit})
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDailyRegisterData(prev => ({ ...prev, qty: Math.max(0.5, (parseFloat(prev.qty) || 1) - 1) }))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    required
                    type="number"
                    step="any"
                    min="0.25"
                    value={dailyRegisterData.qty}
                    onChange={(e) => setDailyRegisterData(prev => ({ ...prev, qty: e.target.value }))}
                    className="w-16 text-center text-sm font-extrabold text-milquu-dark bg-white border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-milquu-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setDailyRegisterData(prev => ({ ...prev, qty: (parseFloat(prev.qty) || 1) + 1 }))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Quick Qty Presets */}
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 5].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setDailyRegisterData(prev => ({ ...prev, qty: q }))}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-white hover:bg-amber-100 hover:text-amber-900 border border-gray-200 cursor-pointer"
                    >
                      {q}L
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rate / Unit (₹)</label>
                <input
                  required
                  type="number"
                  step="any"
                  value={dailyRegisterData.price}
                  onChange={(e) => setDailyRegisterData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-milquu-blue"
                />
                <div className="mt-2 text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Amount Due</span>
                  <span className="text-lg font-black text-amber-700 font-mono">
                    ₹{((Number(dailyRegisterData.price) || 0) * (parseFloat(dailyRegisterData.qty) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks / Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Regular morning supply, 1 pouch left at door"
                value={dailyRegisterData.notes}
                onChange={(e) => setDailyRegisterData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-milquu-blue"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDailyRegisterModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingDailyRegister}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold hover:from-amber-700 hover:to-amber-800 shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingDailyRegister ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>🥛</span>
                    <span>Record to Khata (Credit)</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    )}
  </>
);

export default DailyRegisterModal;
