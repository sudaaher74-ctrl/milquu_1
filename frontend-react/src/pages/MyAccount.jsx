import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Package, Calendar, Settings, Play, Pause, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && activeTab === 'subscriptions') {
      fetchSubscriptions();
    } else if (user && activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchSubscriptions = async () => {
    setLoadingSubs(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr || userInfoStr === 'undefined') return;
      const userToken = JSON.parse(userInfoStr).token;
      
      const res = await fetch('https://milquu-backend.onrender.com/api/users/subscriptions', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr || userInfoStr === 'undefined') {
        setLoadingOrders(false);
        return;
      }
      const userToken = JSON.parse(userInfoStr).token;

      const res = await fetch('https://milquu-backend.onrender.com/api/users/orders', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      // Guard: only set if data is actually an array
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchOrders error:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr || userInfoStr === 'undefined') return;
      const userToken = JSON.parse(userInfoStr).token;
      const res = await fetch(`https://milquu-backend.onrender.com/api/users/subscriptions/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchSubscriptions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-milquu-blue mb-4 mx-auto md:mx-0">
                <span className="text-2xl font-bold font-serif">{user.name.charAt(0)}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center md:text-left">{user.name}</h2>
              <p className="text-sm text-gray-500 text-center md:text-left">{user.email}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <nav className="flex flex-col space-y-1 p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === 'profile' ? 'bg-blue-50 text-milquu-blue' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="mr-3 h-5 w-5" /> Profile Details
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === 'orders' ? 'bg-blue-50 text-milquu-blue' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="mr-3 h-5 w-5" /> Order History
                </button>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === 'subscriptions' ? 'bg-blue-50 text-milquu-blue' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="mr-3 h-5 w-5" /> My Subscriptions
                </button>
                <div className="border-t border-gray-100 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" /> Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-2xl font-bold font-serif text-gray-800 mb-6">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
                        {user.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
                        {user.phone || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Delivery Address</label>
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
                        {user.address || 'Not provided'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 shadow-sm flex items-center">
                      <Settings size={16} className="mr-2" /> Edit Profile
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-2xl font-bold font-serif text-gray-800 mb-6">Order History</h3>
                  {loadingOrders ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-milquu-blue"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map(order => {
                        const orderId = order?._id ? String(order._id) : 'unknown';
                        const price = order?.totalPrice || order?.totalAmount || 0;
                        const date = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
                        const delivered = !!order?.isDelivered;
                        const itemCount = order?.orderItems?.length || order?.items?.length || 0;
                        return (
                          <div key={orderId} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h4 className="font-bold text-gray-800">Order #{orderId.substring(0,8).toUpperCase()}</h4>
                                <p className="text-sm text-gray-500">₹{price} • {date}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${delivered ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {delivered ? 'DELIVERED' : 'PENDING'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-lg">
                                  {itemCount} items
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">You haven't placed any orders yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'subscriptions' && (
                <div>
                  <h3 className="text-2xl font-bold font-serif text-gray-800 mb-6">Active Subscriptions</h3>
                  {loadingSubs ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-milquu-blue"></div>
                    </div>
                  ) : subscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {subscriptions.map(sub => (
                        <div key={sub._id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <h4 className="font-bold text-gray-800">{sub.name || 'Milk Subscription'}</h4>
                              <p className="text-sm text-gray-500 capitalize">{sub.frequency} Delivery • ₹{sub.totalAmount}/delivery</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                  sub.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                  sub.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {sub.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                              {sub.status === 'paused' ? (
                                <button 
                                  onClick={() => handleUpdateStatus(sub._id, 'Active')}
                                  className="flex-1 md:flex-none flex items-center justify-center bg-white border border-gray-200 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 shadow-sm"
                                >
                                  <Play size={16} className="mr-2" /> Resume
                                </button>
                              ) : sub.status === 'Active' ? (
                                <button 
                                  onClick={() => handleUpdateStatus(sub._id, 'paused')}
                                  className="flex-1 md:flex-none flex items-center justify-center bg-white border border-gray-200 text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-50 shadow-sm"
                                >
                                  <Pause size={16} className="mr-2" /> Pause
                                </button>
                              ) : null}
                              <button 
                                onClick={() => handleUpdateStatus(sub._id, 'Cancelled')}
                                disabled={sub.status === 'Cancelled'}
                                className="flex-1 md:flex-none flex items-center justify-center bg-white border border-gray-200 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 shadow-sm disabled:opacity-50"
                              >
                                <XCircle size={16} className="mr-2" /> Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">You don't have any active milk subscriptions.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
