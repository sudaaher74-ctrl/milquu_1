import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Edit2, Factory, FileText, IndianRupee, Package, Printer, Search, ShoppingCart, Trash2, TrendingUp, Truck } from 'lucide-react';

// Extracted from Purchases.jsx. Receives the page state and
// handlers it uses as props of the same name.
const PurchaseOrdersTab = ({ activeSuppliersCount, activeTab, filteredPurchases, handleDelete, openBillModal, openEditModal, pendingDeliveriesCount, purchaseStatusFilter, searchTerm, setPurchaseStatusFilter, setSearchTerm, totalMonthlyCost, trendData }) => (
  <>
    {/* TAB 1: PURCHASE ORDERS */}
    {activeTab === 'purchases' && (
      <>
        {/* Top Dashboard Metrics & Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* KPI Cards */}
          <div className="flex flex-col space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between flex-1">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Purchase Cost</p>
                <h3 className="text-3xl font-bold text-milquu-dark">₹{totalMonthlyCost.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                  <TrendingUp size={12} className="mr-1" /> Active Procurements
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <IndianRupee size={24} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between flex-1">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Suppliers</p>
                <h3 className="text-3xl font-bold text-milquu-dark">{activeSuppliersCount}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">{pendingDeliveriesCount} pending deliveries</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-milquu-blue">
                <Factory size={24} />
              </div>
            </div>
          </div>

          {/* Purchase Trends Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 sm:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-milquu-dark">Purchase Trends (Last 6 Months)</h2>
              <span className="text-xs text-gray-400">Monthly procurement spend</span>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Cost']}
                  />
                  <Bar dataKey="cost" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Purchases Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by supplier, product or PO number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Status:</span>
              {['all', 'Pending', 'Received', 'Paid', 'Partial'].map((st) => (
                <button
                  key={st}
                  onClick={() => setPurchaseStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    purchaseStatusFilter === st
                      ? 'bg-milquu-dark text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1050px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">PO Number</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Supplier / Vendor</th>
                  <th className="px-6 py-3.5">Category & Product</th>
                  <th className="px-6 py-3.5 text-right">Quantity</th>
                  <th className="px-6 py-3.5 text-right">Rate</th>
                  <th className="px-6 py-3.5 text-right">Total Cost</th>
                  <th className="px-6 py-3.5 text-right">Paid / Due</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-400">
                      No purchase orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => {
                    const total = Number(purchase.totalCost || 0);
                    const paid = Number(purchase.paidAmount || (purchase.status === 'Paid' ? total : 0));
                    const due = Math.max(0, total - paid);

                    return (
                      <tr key={purchase._id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openBillModal(purchase)}
                            className="font-bold text-milquu-blue hover:underline flex items-center gap-1 cursor-pointer"
                            title="Click to view & print Purchase Bill"
                          >
                            <span>{purchase.poNumber}</span>
                            <FileText size={13} className="text-milquu-blue/70" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                          {new Date(purchase.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-milquu-dark">{purchase.supplierName}</p>
                          {purchase.supplierPhone && (
                            <p className="text-xs text-gray-400">{purchase.supplierPhone}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800">{purchase.productName}</p>
                          <p className="text-xs text-gray-400 flex items-center mt-0.5">
                            {purchase.category === 'Raw Milk' ? <Package size={11} className="mr-1" /> :
                             purchase.category === 'Transport' ? <Truck size={11} className="mr-1" /> :
                             <ShoppingCart size={11} className="mr-1" />}
                            {purchase.category}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                          {purchase.quantity ? purchase.quantity.toLocaleString('en-IN') : 0} {purchase.unit || 'L'}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                          ₹{Number(purchase.rate || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-milquu-dark">
                          ₹{total.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-semibold text-emerald-600">₹{paid.toLocaleString('en-IN')}</span>
                          {due > 0 ? (
                            <span className="block text-[11px] font-bold text-amber-600">Due: ₹{due.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="block text-[11px] font-medium text-gray-400">Clear</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                            purchase.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            purchase.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                            purchase.status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Print / View Bill Button */}
                            <button
                              onClick={() => openBillModal(purchase)}
                              className="p-2 text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View & Print Bill / Invoice"
                            >
                              <Printer size={16} />
                            </button>
                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(purchase)}
                              className="p-2 text-gray-500 hover:text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Purchase"
                            >
                              <Edit2 size={16} />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(purchase._id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Purchase"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </>
);

export default PurchaseOrdersTab;
