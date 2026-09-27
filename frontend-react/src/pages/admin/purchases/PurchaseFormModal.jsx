import { X } from 'lucide-react';

// Extracted from Purchases.jsx. Receives the page state and
// handlers it uses as props of the same name.
const PurchaseFormModal = ({ computedBalance, computedTotalCost, editingId, existingSupplierNames, formData, handleSavePurchase, isModalOpen, marginPercentage, products, setEditingId, setFormData, setIsModalOpen }) => (
  <>
    {/* ========================================================================= */}
    {/* MODAL 4: ADD / EDIT PURCHASE ORDER                                       */}
    {/* ========================================================================= */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 my-auto z-10 max-h-[92vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 shrink-0">
            <h2 className="text-xl font-serif font-bold text-milquu-dark">
              {editingId ? 'Edit Purchase Order' : 'Create New Purchase Order'}
            </h2>
            <button
              onClick={() => { setIsModalOpen(false); setEditingId(null); }}
              className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSavePurchase} className="space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier / Vendor Name</label>
                <input
                  required
                  type="text"
                  name="supplierName"
                  list="po-supplier-list"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="e.g. Ramesh Patil (Dairy)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
                <datalist id="po-supplier-list">
                  {existingSupplierNames.map((s, idx) => (
                    <option key={idx} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier Phone (For Bill & WA)</label>
                <input
                  type="text"
                  name="supplierPhone"
                  value={formData.supplierPhone}
                  onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                >
                  <option value="Raw Milk">Raw Milk</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Transport">Transport</option>
                  <option value="Feed & Fodder">Feed & Fodder</option>
                  <option value="Veterinary">Veterinary</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Product / Material Name</label>
              <div className="flex gap-2">
                <select
                  name="productName"
                  value={formData.productName}
                  onChange={(e) => {
                    const selProd = products.find(p => p.name === e.target.value);
                    setFormData({
                      ...formData,
                      productName: e.target.value,
                      rate: selProd?.purchasePrice ? selProd.purchasePrice.toString() : formData.rate,
                      sellingPrice: selProd?.price ? selProd.price.toString() : formData.sellingPrice
                    });
                  }}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                >
                  <option value="" disabled>Select from products catalog</option>
                  {products.map((p) => (
                    <option key={p._id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or type custom item..."
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g. 100"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                >
                  <option value="Litre">Litre</option>
                  <option value="Kg">Kg</option>
                  <option value="Units">Units / Pcs</option>
                  <option value="Bags">Bags</option>
                  <option value="Box">Box</option>
                  <option value="Trips">Trips</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Rate / Unit (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  name="rate"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="e.g. 55"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Bill Cost (₹)</label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm font-bold text-milquu-dark">
                  ₹{computedTotalCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price / Unit (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="e.g. 75"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Margin (%)</label>
                <div className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm font-semibold text-emerald-700">
                  {marginPercentage}%
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment & Settlement</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    placeholder="0 if pending"
                    className="w-full border border-gray-200 bg-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-milquu-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full border border-gray-200 bg-white rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-milquu-blue"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit">Credit / Due</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-200 bg-white rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-milquu-blue"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold pt-1">
                <span className="text-gray-500">Calculated Balance Due:</span>
                <span className={computedBalance > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                  ₹{computedBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Remarks</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Batch #45 morning delivery"
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-milquu-blue"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-milquu-dark text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-md cursor-pointer"
              >
                {editingId ? 'Update Purchase Order' : 'Save Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);

export default PurchaseFormModal;
