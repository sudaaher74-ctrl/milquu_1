import { BookOpen, CheckCircle, ChevronRight, Clock, CreditCard, Factory, IndianRupee, MapPin, Phone, RefreshCw, Search, ShoppingCart } from 'lucide-react';

// Extracted from Purchases.jsx. Receives the page state and
// handlers it uses as props of the same name.
const VendorLedgerTab = ({ activeTab, fetchData, fetchVendorLedger, filteredVendors, openRecordPaymentModal, searchTerm, setSearchTerm, setVendorStatusFilter, vendorStatusFilter, vendorSummaryMetrics, vendorsSummary }) => (
  <>
    {/* TAB 2: VENDOR ACCOUNTING & LEDGER (KHATA) */}
    {activeTab === 'vendors' && (
      <>
        {/* Vendor Accounting KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Purchases</p>
              <h3 className="text-2xl font-bold text-milquu-dark">₹{vendorSummaryMetrics.totalBilledAll.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-gray-500 mt-1">{vendorSummaryMetrics.totalVendors} Registered Suppliers</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-milquu-blue">
              <ShoppingCart size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount Paid</p>
              <h3 className="text-2xl font-bold text-emerald-600">₹{vendorSummaryMetrics.totalPaidAll.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-emerald-700 mt-1 flex items-center">
                <CheckCircle size={12} className="mr-1" /> Cleared Payments
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Outstanding Dues</p>
              <h3 className="text-2xl font-bold text-amber-600">₹{vendorSummaryMetrics.totalOutstandingAll.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-amber-700 mt-1 font-medium">
                {vendorSummaryMetrics.vendorsWithDues} vendors have pending dues
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Suppliers Count</p>
              <h3 className="text-2xl font-bold text-milquu-dark">{vendorsSummary.length}</h3>
              <button
                onClick={fetchData}
                className="text-xs text-milquu-blue font-semibold mt-1 flex items-center hover:underline cursor-pointer"
              >
                <RefreshCw size={11} className="mr-1" /> Refresh Summary
              </button>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Factory size={22} />
            </div>
          </div>
        </div>

        {/* Vendors Directory & Khata Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Filter:</span>
              {[
                { id: 'all', label: 'All Vendors' },
                { id: 'dues', label: 'Pending Dues' },
                { id: 'settled', label: 'Fully Settled' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setVendorStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    vendorStatusFilter === st.id
                      ? 'bg-milquu-dark text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Vendor / Supplier</th>
                  <th className="px-6 py-3.5">Contact & Location</th>
                  <th className="px-6 py-3.5">Products Supplied</th>
                  <th className="px-6 py-3.5 text-center">Orders</th>
                  <th className="px-6 py-3.5 text-right">Total Billed</th>
                  <th className="px-6 py-3.5 text-right">Total Paid</th>
                  <th className="px-6 py-3.5 text-right">Balance Due</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Accounting Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                      No vendors found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => fetchVendorLedger(vendor.supplierName)}
                          className="font-bold text-milquu-dark hover:text-milquu-blue flex items-center gap-1.5 text-left cursor-pointer"
                        >
                          <span>{vendor.supplierName}</span>
                          <ChevronRight size={14} className="text-gray-400 group-hover:text-milquu-blue transition-colors" />
                        </button>
                        <span className="text-xs text-gray-400">
                          Last purchase: {vendor.lastPurchaseDate ? new Date(vendor.lastPurchaseDate).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {vendor.supplierPhone || 'No Phone Recorded'}
                        </p>
                        {vendor.supplierAddress && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-gray-400" />
                            {vendor.supplierAddress}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                          {vendor.productsList && vendor.productsList.length > 0 ? (
                            vendor.productsList.slice(0, 3).map((prod, pIdx) => (
                              <span
                                key={pIdx}
                                className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded-md font-medium"
                              >
                                {prod.name} ({prod.totalQty} {prod.unit})
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                          {vendor.productsList && vendor.productsList.length > 3 && (
                            <span className="text-[11px] text-gray-400 font-semibold">
                              +{vendor.productsList.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700">
                        {vendor.totalPurchasesCount}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-800">
                        ₹{Number(vendor.totalBilled || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        ₹{Number(vendor.totalPaid || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {vendor.balanceDue > 0 ? (
                          <span className="text-amber-600 text-base">₹{Number(vendor.balanceDue).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-emerald-700 text-xs font-semibold">₹0 (Settled)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                          vendor.balanceDue > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Ledger Statement */}
                          <button
                            onClick={() => fetchVendorLedger(vendor.supplierName)}
                            className="px-3 py-1.5 bg-blue-50 text-milquu-blue hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="View full account statement & products breakdown"
                          >
                            <BookOpen size={13} /> Khata Ledger
                          </button>
                          {/* Record Payment */}
                          <button
                            onClick={() => openRecordPaymentModal(vendor.supplierName, vendor.supplierPhone, vendor.balanceDue)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Record payment to this vendor"
                          >
                            <IndianRupee size={13} /> Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </>
);

export default VendorLedgerTab;
