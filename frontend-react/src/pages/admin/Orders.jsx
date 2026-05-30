import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import { Search, Filter, ChevronLeft, ChevronRight, Download, X, MapPin, Phone, User, Package, Calendar, Truck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for advanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchOrdersAndStaff = async () => {
      try {
        const [ordersRes, staffRes] = await Promise.all([
          api.get('/api/erp/orders'),
          api.get('/api/erp/delivery-staff')
        ]);
        const data = ordersRes.data;
        const staffData = staffRes.data;
        setStaffList(staffData);
        
        // Auto-assign from real database staff
        const mappedData = data.map((order, index) => {
          let area = order.shippingAddress?.city || 'Panvel';
          
          // Try to find a staff member matching the area, otherwise just pick one round-robin
          const areaStaff = staffData.filter(s => s.area?.toLowerCase().includes(area.toLowerCase()) || s.city?.toLowerCase().includes(area.toLowerCase()));
          const selectedStaff = areaStaff.length > 0 
            ? areaStaff[index % areaStaff.length] 
            : (staffData.length > 0 ? staffData[index % staffData.length] : { name: 'Unassigned' });
          
          const deliveryStatuses = ['Assigned', 'Picked Up', 'Out For Delivery', 'Delivered'];
          const randomStatus = order.status === 'Delivered' ? 'Delivered' : deliveryStatuses[Math.floor(Math.random() * (deliveryStatuses.length - 1))];
          
          return {
            ...order,
            deliveryArea: area,
            assignedBoy: selectedStaff.name,
            deliveryStatus: order.status === 'Pending' ? 'Pending Assignment' : randomStatus
          };
        });
        
        setOrders(mappedData);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrdersAndStaff();
  }, []);

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.name || order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (order.status || 'Pending').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleAssignDriver = async (orderId, staffId) => {
    try {
      const adminTokenStr = localStorage.getItem('adminToken');
      const res = await api.put(`/api/erp/orders/${orderId}/assign`, {
        deliveryBoyId: staffId
      });
      
      if (!res.data) throw new Error('Failed to assign driver');
      
      const updatedOrder = res.data;
      
      // Update local state
      const staff = staffList.find(s => s._id === staffId);
      setOrders(orders.map(o => o._id === orderId ? { ...o, deliveryStaff: staffId, assignedBoy: staff?.name, deliveryStatus: 'Out For Delivery' } : o));
      setSelectedOrder(prev => ({ ...prev, deliveryStaff: staffId, assignedBoy: staff?.name, deliveryStatus: 'Out For Delivery' }));
      
    } catch (error) {
      console.error(error);
      alert('Failed to assign driver');
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const StatusBadge = ({ status }) => {
    const normalized = (status || 'Pending').toLowerCase();
    let classes = 'bg-gray-100 text-gray-800';
    if (normalized === 'active' || normalized === 'delivered') classes = 'bg-green-100 text-green-700';
    if (normalized === 'pending') classes = 'bg-blue-100 text-blue-700';
    if (normalized === 'paused' || normalized === 'cancelled') classes = 'bg-orange-100 text-orange-700';

    return <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${classes}`}>{status || 'Pending'}</span>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex flex-col space-y-4">
        <div className="h-10 bg-gray-200 rounded-xl w-1/4 animate-pulse"></div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse w-full mt-8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Recent Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all customer orders and subscriptions.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
          <Download size={16} className="mr-2" /> Export CSV
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex items-center bg-white rounded-lg px-4 py-2.5 w-full sm:w-96 border border-gray-200 focus-within:border-milquu-blue focus-within:shadow-sm transition-all shadow-sm">
            <Search size={18} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer Name..." 
              className="bg-transparent border-none outline-none text-sm w-full font-sans text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2.5 cursor-pointer">
                <Filter size={16} className="text-gray-500 mr-2" />
                <select 
                  className="bg-transparent outline-none text-sm font-medium text-gray-600 appearance-none pr-6 cursor-pointer w-full"
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Paused">Paused</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Product/Freq</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Delivery Info</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentOrders.length > 0 ? currentOrders.map((order) => (
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
                    <p className="text-sm font-bold text-milquu-dark flex items-center"><Truck size={12} className="mr-1 text-milquu-blue" /> {order.assignedBoy}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">{order.deliveryArea}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                    <p className={`text-[10px] mt-1 font-bold ${order.deliveryStatus === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                      {order.deliveryStatus}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <p className="text-sm font-medium">No orders found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-semibold text-gray-700">{filteredOrders.length}</span> results
            </p>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-milquu-blue text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <div className="p-6 overflow-y-auto">
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
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-milquu-blue shadow-sm">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-milquu-dark">Assigned to: {selectedOrder.assignedBoy}</h4>
                      <p className="text-xs text-gray-500">Area: {selectedOrder.deliveryArea}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {staffList && staffList.length > 0 && (
                      <select 
                        onChange={(e) => handleAssignDriver(selectedOrder._id, e.target.value)}
                        className="text-xs border-gray-200 rounded-md py-1 px-2 text-gray-600 focus:outline-none focus:ring-1 focus:ring-milquu-blue"
                        defaultValue={selectedOrder.deliveryStaff || ''}
                      >
                        <option value="" disabled>Assign Driver</option>
                        {staffList.map(staff => (
                          <option key={staff._id} value={staff._id}>{staff.name} ({staff.area})</option>
                        ))}
                      </select>
                    )}
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-milquu-blue shadow-sm border border-blue-100">
                      {selectedOrder.deliveryStatus}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-milquu-dark flex items-center"><Package size={16} className="mr-1.5 text-milquu-blue" /> Order Items</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-gray-500"><Calendar size={14} className="mr-1" /> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                    <StatusBadge status={selectedOrder.status} />
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
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Close
                </button>
                <button className="px-4 py-2 bg-milquu-blue text-white rounded-lg text-sm font-medium hover:bg-blue-800 shadow-md shadow-milquu-blue/20 transition-colors">
                  Print Invoice
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Orders;
