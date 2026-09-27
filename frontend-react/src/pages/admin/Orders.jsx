import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api.js';
import { Search, Filter, ChevronLeft, ChevronRight, X, MapPin, Phone, User, Package, Calendar, Truck, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExportButton from '../../components/admin/ExportButton';
import toast from '../../utils/toast';

const PAGE_SIZE = 20;

const StatusBadge = ({ status }) => {
  const normalized = String(status || 'Pending').toLowerCase();
  let classes = 'bg-blue-100 text-blue-700';
  if (normalized === 'delivered') classes = 'bg-green-100 text-green-700';
  if (normalized === 'failed') classes = 'bg-red-100 text-red-700';
  if (normalized === 'out for delivery') classes = 'bg-amber-100 text-amber-700';
  return <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${classes}`}>{status || 'Pending'}</span>;
};

/** The delivery person's name for an order, or 'Unassigned'. */
const staffName = (order) => order.deliveryStaff?.name || 'Unassigned';
const deliveryLabel = (order) => order.isDelivered ? 'Delivered' : (order.deliveryStatus || 'Pending');

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [staffList, setStaffList] = useState([]);

  // Filters live in the URL, so the header search and a refresh land on the same view.
  const search = searchParams.get('search') || '';
  const source = searchParams.get('source') || '';
  const payment = searchParams.get('payment') || '';
  const delivery = searchParams.get('delivery') || '';
  const currentPage = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setLoading(true);
    setSearchParams(next);
  };
  const setPage = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setLoading(true);
    setSearchParams(next);
  };

  useEffect(() => {
    api.get('/api/erp/delivery-staff').then(({ data }) => setStaffList(data)).catch(() => setStaffList([]));
  }, []);

  // Keep the search box in step when the header search changes the URL
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setSearchInput(search);
  }

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_SIZE) });
    if (search) params.set('search', search);
    if (source) params.set('source', source);
    if (payment) params.set('payment', payment);
    if (delivery) params.set('delivery', delivery);
    api.get(`/api/erp/orders?${params}`)
      .then(({ data }) => {
        if (cancelled) return;
        setOrders(data.orders);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load orders'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentPage, search, source, payment, delivery]);

  const submitSearch = (e) => {
    e.preventDefault();
    setFilter('search', searchInput.trim());
  };

  const handleAssignDriver = async (orderId, staffId) => {
    try {
      const { data: updated } = await api.put(`/api/erp/orders/${orderId}/assign`, { deliveryBoyId: staffId });
      const staff = staffList.find((s) => s._id === staffId);
      const patch = (o) => (o._id === orderId
        ? { ...o, deliveryStaff: staff ? { _id: staff._id, name: staff.name } : null, deliveryStatus: updated.deliveryStatus }
        : o);
      setOrders((list) => list.map(patch));
      setSelectedOrder((o) => (o ? patch(o) : o));
      toast.success(`Assigned to ${staff?.name || 'delivery person'}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign driver');
    }
  };

  const exportData = orders.map(order => ({
    'Order ID': order._id,
    'Customer Name': order.name || order.user?.name || 'Unknown',
    'Phone': order.phone || 'N/A',
    'Source': order.orderSource,
    'Delivery': deliveryLabel(order),
    'Delivery Boy': staffName(order),
    'Payment': `${order.paymentMethod || 'COD'} (${order.paymentStatus || 'PENDING'})`,
    'Total (Rs)': order.totalPrice || 0,
    'Date': new Date(order.createdAt).toLocaleDateString('en-IN')
  }));

  const selectClass = 'bg-transparent outline-none text-sm font-medium text-gray-600 appearance-none pr-6 cursor-pointer w-full';

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{loading ? 'Loading…' : `${total.toLocaleString('en-IN')} order${total === 1 ? '' : 's'}${search ? ` matching “${search}”` : ''}`}</p>
        </div>
        <ExportButton data={exportData} filename="Orders_Export" title="Orders Report (this page)" label="Export page" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-gray-50/50">
          <form onSubmit={submitSearch} role="search" className="flex items-center bg-white rounded-lg px-4 py-2.5 w-full lg:w-96 border border-gray-200 focus-within:border-milquu-blue focus-within:shadow-sm transition-all shadow-sm">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="search"
              aria-label="Search orders"
              placeholder="Name, phone or full order ID — press Enter"
              className="bg-transparent border-none outline-none text-sm w-full font-sans text-gray-700"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
            {[
              { key: 'source', value: source, label: 'Source', options: [['', 'All sources'], ['Website', 'Website'], ['App', 'App'], ['POS', 'Shop POS']] },
              { key: 'payment', value: payment, label: 'Payment', options: [['', 'All payments'], ['paid', 'Paid'], ['unpaid', 'Unpaid']] },
              { key: 'delivery', value: delivery, label: 'Delivery', options: [['', 'All deliveries'], ['pending', 'Pending'], ['unassigned', 'Unassigned'], ['delivered', 'Delivered'], ['failed', 'Failed']] }
            ].map((f) => (
              <div key={f.key} className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2.5">
                <Filter size={16} className="text-gray-500 mr-2 shrink-0" />
                <select aria-label={f.label} className={selectClass} value={f.value} onChange={(e) => setFilter(f.key, e.target.value)}>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Items / Source</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Delivery Info</th>
                <th className="px-6 py-4 font-semibold">Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">Loading orders…</td></tr>
              ) : orders.length > 0 ? orders.map((order) => (
                <tr key={order._id} onClick={() => setSelectedOrder(order)} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-milquu-blue bg-blue-50 px-2 py-1 rounded-md">
                      #{order._id.slice(-6)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-milquu-dark group-hover:text-milquu-blue transition-colors">{order.name || order.user?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-400">{order.phone || order.user?.email || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 font-medium truncate max-w-[150px]">
                      {order.orderItems && order.orderItems.length > 0 ? order.orderItems.map(i => i.name || 'Product').join(', ') : 'Custom Order'}
                    </p>
                    <p className="text-xs text-gray-400">{order.orderSource || 'Website'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">₹{order.totalPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${order.paymentMethod === 'ONLINE' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {order.paymentMethod || 'COD'}
                    </span>
                    <p className={`text-[10px] mt-1 font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                      {order.paymentStatus || 'PENDING'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-bold flex items-center ${order.deliveryStaff ? 'text-milquu-dark' : 'text-red-600'}`}><Truck size={12} className="mr-1 text-milquu-blue" /> {staffName(order)}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">{order.shippingAddress?.city || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={deliveryLabel(order)} />
                    {order.deliverySlot && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${order.deliverySlot === 'Morning' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {order.deliverySlot === 'Morning' ? '🌅' : '🌇'} {order.deliverySlot}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <p className="text-sm font-medium">No orders found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (in the database — only one page is ever loaded) */}
        {pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>–<span className="font-semibold text-gray-700">{Math.min(currentPage * PAGE_SIZE, total)}</span> of <span className="font-semibold text-gray-700">{total.toLocaleString('en-IN')}</span>
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} of {pages}</span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pages}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-milquu-dark/60 backdrop-blur-sm cursor-pointer"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-milquu-dark">Order Details</h2>
                  <p className="text-sm text-gray-500">Order ID: <span className="font-semibold text-milquu-blue">#{selectedOrder._id}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div id="order-invoice" className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center"><User size={14} className="mr-1.5" /> Customer</h3>
                    <p className="text-sm font-bold text-milquu-dark">{selectedOrder.name || selectedOrder.user?.name || 'Guest'}</p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center"><Phone size={14} className="mr-1.5 text-gray-400" /> {selectedOrder.phone || 'N/A'}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.user?.email}</p>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center"><MapPin size={14} className="mr-1.5" /> Delivery Address</h3>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">
                      {selectedOrder.shippingAddress?.address ? (
                        <>
                          {selectedOrder.shippingAddress.address}<br/>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br/>
                          {selectedOrder.shippingAddress.country}
                        </>
                      ) : (
                        'No address provided.'
                      )}
                    </p>
                    {selectedOrder.shippingAddress?.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city || ''} ${selectedOrder.shippingAddress.postalCode || ''}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-bold text-milquu-blue hover:text-blue-700 mt-3 gap-1.5 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        <Navigation size={13} /> Open in Google Maps
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-milquu-blue shadow-sm">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-milquu-dark">Assigned to: {staffName(selectedOrder)}</h4>
                      <p className="text-xs text-gray-500">Area: {selectedOrder.shippingAddress?.city || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {staffList && staffList.length > 0 && (
                      <select 
                        onChange={(e) => handleAssignDriver(selectedOrder._id, e.target.value)}
                        className="text-xs border-gray-200 rounded-md py-1 px-2 text-gray-600 focus:outline-none focus:ring-1 focus:ring-milquu-blue"
                        value={selectedOrder.deliveryStaff?._id || ''}
                      >
                        <option value="" disabled>Assign Driver</option>
                        {staffList.map(staff => (
                          <option key={staff._id} value={staff._id}>{staff.name} ({staff.area})</option>
                        ))}
                      </select>
                    )}
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-milquu-blue shadow-sm border border-blue-100">
                      {deliveryLabel(selectedOrder)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-milquu-dark flex items-center"><Package size={16} className="mr-1.5 text-milquu-blue" /> Order Items</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-gray-500"><Calendar size={14} className="mr-1" /> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                    <StatusBadge status={deliveryLabel(selectedOrder)} />
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Qty</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? selectedOrder.orderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm font-medium text-milquu-dark">{item.name || 'Product'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.qty || item.quantity}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">₹{item.price || 0}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-milquu-dark">Custom Item</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">1</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">₹{selectedOrder.totalPrice}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-start">
                  {selectedOrder.proofOfDelivery ? (
                    <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Proof of Delivery</h4>
                      <img 
                        src={selectedOrder.proofOfDelivery} 
                        alt="Proof of Delivery" 
                        className="w-full max-w-[150px] rounded-lg shadow-sm border border-gray-200" 
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-1/3 mb-4 sm:mb-0"></div>
                  )}
                  
                  <div className="w-full sm:w-1/2 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Delivery Fee</span>
                      <span>₹0</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-bold text-milquu-dark mt-2">
                      <span>Total Amount</span>
                      <span className="text-milquu-blue">₹{selectedOrder.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Payment</span>
                      <span className={`font-bold ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                        {selectedOrder.paymentMethod || 'COD'} ({selectedOrder.paymentStatus || 'PENDING'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Close
                </button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-milquu-blue text-white rounded-lg text-sm font-medium hover:bg-blue-800 shadow-md shadow-milquu-blue/20 transition-colors">
                  Print Invoice
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print only the open order */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #order-invoice, #order-invoice * { visibility: visible; }
          #order-invoice { position: absolute; left: 0; top: 0; width: 100%; overflow: visible; }
          #order-invoice select { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Orders;
