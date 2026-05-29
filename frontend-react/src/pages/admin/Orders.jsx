import React, { useEffect, useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for advanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/admin/orders');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.name || order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (order.status || 'Pending').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentOrders.length > 0 ? currentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
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
                      {order.items && order.items.length > 0 ? order.items.map(i => i.product.name).join(', ') : 'Subscription'}
                    </p>
                    <p className="text-xs text-gray-400">{order.frequency}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">₹{order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
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
    </div>
  );
};

export default Orders;
