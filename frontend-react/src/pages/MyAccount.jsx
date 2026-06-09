import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Package, Calendar, Settings, Play, Pause, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyAccount = () => {
  const baseUrl = import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com';

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pauseTarget, setPauseTarget] = useState(null);

  const [wallet, setWallet] = useState({ walletBalance: 0, reservedBalance: 0, withdrawableBalance: 0, transactions: [], withdrawalRequests: [] });
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  
  // Withdrawal Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ amount: '', method: 'UPI', upiId: '', accNo: '', ifsc: '', name: '' });
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

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
    } else if (user && activeTab === 'wallet') {
      fetchWallet();
    }
  }, [user, activeTab]);

  const fetchSubscriptions = async () => {
    setLoadingSubs(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr || userInfoStr === 'undefined') return;
      const userToken = JSON.parse(userInfoStr).token;
      
      const res = await fetch(`${baseUrl}/api/users/subscriptions`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : []);
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

      const res = await fetch(`${baseUrl}/api/users/orders`, {
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

  const fetchWallet = async () => {
    setLoadingWallet(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr || userInfoStr === 'undefined') return;
      const userToken = JSON.parse(userInfoStr).token;
      
      const res = await fetch(`${baseUrl}/api/users/wallet`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      setWallet(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWallet(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) return;
      const userObj = JSON.parse(userInfoStr);
      const userToken = userObj.token;

      // 1. Load Razorpay Script
      const resLoad = await loadRazorpayScript();
      if (!resLoad) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 2. Create Order on Backend
      const orderRes = await fetch(`${baseUrl}/api/users/wallet/create-recharge-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        },
        body: JSON.stringify({ amount: rechargeAmount })
      });
      
      let orderData;
      try {
        orderData = await orderRes.json();
      } catch (parseErr) {
        alert('Server is still deploying or returned an invalid response. Please try again in 2 minutes.');
        return;
      }

      if (!orderRes.ok || !orderData.id) {
        alert(`Server Error: ${orderData.message || 'Could not create Razorpay Order.'}`);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_mock', // Replace with real key in production
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MilQuu Fresh',
        description: 'Wallet Recharge',
        order_id: orderData.id,
        handler: async function (response) {
          // 4. Verify Payment on Backend
          try {
            const verifyRes = await fetch(`${baseUrl}/api/users/wallet/recharge`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}` 
              },
              body: JSON.stringify({
                amount: rechargeAmount,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            if (verifyRes.ok) {
              setRechargeAmount('');
              fetchWallet();
              alert('Wallet Recharged Successfully via Razorpay!');
            } else {
              const errData = await verifyRes.json();
              alert(`Payment Verification Failed: ${errData.message}`);
            }
          } catch (err) {
            console.error('Verification Error', err);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: userObj.name,
          email: userObj.email,
          contact: userObj.phone || '9999999999'
        },
        theme: {
          color: '#3B82F6' // Milquu Blue
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert(`Error initiating recharge: ${err.message}`);
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    if (withdrawData.amount > wallet.withdrawableBalance) {
      alert(`You can only withdraw up to ₹${wallet.withdrawableBalance}`);
      return;
    }
    
    // Auto-pause warning for < 3 days balance
    // We assume 1 day is already reserved, so if remaining walletBalance < 3 * reservedBalance loosely...
    // The requirement states: If withdrawal causes wallet to fall below 3 days delivery requirement, show warning.
    // Let's implement a simple warning if amount > withdrawableBalance - (wallet.reservedBalance * 2).
    if (wallet.reservedBalance > 0 && (wallet.walletBalance - withdrawData.amount) < (wallet.reservedBalance * 3)) {
      if (!window.confirm("Warning: Your wallet balance may not be sufficient for upcoming deliveries. Are you sure you want to withdraw?")) {
        return;
      }
    }

    setLoadingWithdraw(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) return;
      const userToken = JSON.parse(userInfoStr).token;

      const payload = {
        amount: withdrawData.amount,
        refundMethod: withdrawData.method,
        upiId: withdrawData.method === 'UPI' ? withdrawData.upiId : undefined,
        bankDetails: withdrawData.method === 'Bank Account' ? {
          accountNumber: withdrawData.accNo,
          ifscCode: withdrawData.ifsc,
          accountName: withdrawData.name
        } : undefined
      };

      const res = await fetch(`${baseUrl}/api/users/wallet/withdraw`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Withdrawal request submitted successfully!');
        setShowWithdrawModal(false);
        setWithdrawData({ amount: '', method: 'UPI', upiId: '', accNo: '', ifsc: '', name: '' });
        fetchWallet();
      } else {
        alert(data.message || 'Error submitting request');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoadingWithdraw(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus, pauseStartDate = null, pauseEndDate = null) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr || userInfoStr === 'undefined') return;
      const userToken = JSON.parse(userInfoStr).token;
      
      const payload = { status: newStatus };
      if (pauseStartDate) payload.pauseStartDate = pauseStartDate;
      if (pauseEndDate) payload.pauseEndDate = pauseEndDate;

      const res = await fetch(`${baseUrl}/api/users/subscriptions/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        },
        body: JSON.stringify(payload)
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
                <span className="text-2xl font-bold font-serif">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center md:text-left">{user?.name || 'User'}</h2>
              <p className="text-sm text-gray-500 text-center md:text-left">{user?.email}</p>
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
                  onClick={() => setActiveTab('wallet')}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === 'wallet' ? 'bg-blue-50 text-milquu-blue' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg> My Wallet
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
                        {user?.name || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
                        {user?.email || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
                        {user?.phone || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Delivery Address</label>
                      <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-gray-800 font-medium">
                        {user?.address || 'Not provided'}
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
                              {(sub.status === 'paused' || sub.status === 'Cancelled') && (
                                <button 
                                  onClick={() => handleUpdateStatus(sub._id, 'Active')}
                                  className="flex-1 md:flex-none flex items-center justify-center bg-white border border-gray-200 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 shadow-sm"
                                >
                                  <Play size={16} className="mr-2" /> Continue
                                </button>
                              )}
                              
                              {sub.status === 'Active' && (
                                <button 
                                  onClick={() => setPauseTarget({ id: sub._id, startDate: '', endDate: '' })}
                                  className="flex-1 md:flex-none flex items-center justify-center bg-white border border-gray-200 text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-50 shadow-sm"
                                >
                                  <Pause size={16} className="mr-2" /> Pause
                                </button>
                              )}

                              {sub.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleUpdateStatus(sub._id, 'Cancelled')}
                                  className="flex-1 md:flex-none flex items-center justify-center bg-white border border-gray-200 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 shadow-sm"
                                >
                                  <XCircle size={16} className="mr-2" /> Cancel
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Pause Dates Form */}
                          {pauseTarget?.id === sub._id && (
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                              <h5 className="font-bold text-yellow-800 mb-2">Pause Subscription (Vacation Mode)</h5>
                              <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-yellow-700 mb-1">Pause Start Date</label>
                                  <input 
                                    type="date" 
                                    min={new Date().toISOString().split('T')[0]}
                                    value={pauseTarget.startDate}
                                    onChange={(e) => setPauseTarget({ ...pauseTarget, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-yellow-300 bg-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-yellow-700 mb-1">Pause End Date</label>
                                  <input 
                                    type="date" 
                                    min={pauseTarget.startDate || new Date().toISOString().split('T')[0]}
                                    value={pauseTarget.endDate}
                                    onChange={(e) => setPauseTarget({ ...pauseTarget, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-yellow-300 bg-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setPauseTarget(null)}
                                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button 
                                  disabled={!pauseTarget.startDate || !pauseTarget.endDate}
                                  onClick={() => {
                                    handleUpdateStatus(sub._id, 'paused', pauseTarget.startDate, pauseTarget.endDate);
                                    setPauseTarget(null);
                                  }}
                                  className="px-4 py-2 text-sm font-bold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                                >
                                  Confirm Pause
                                </button>
                              </div>
                            </div>
                          )}
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

              {activeTab === 'wallet' && (
                <div>
                  <h3 className="text-2xl font-bold font-serif text-gray-800 mb-6">My Wallet</h3>
                  {loadingWallet ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-milquu-blue"></div>
                    </div>
                  ) : (
                    <div>
                      {/* Wallet Balance Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-milquu-blue p-5 rounded-2xl shadow-md text-white flex flex-col justify-between">
                          <p className="text-blue-100 text-sm font-medium mb-1">Current Balance</p>
                          <h2 className="text-3xl font-bold">₹{wallet.walletBalance}</h2>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                          <p className="text-gray-500 text-sm font-medium mb-1">Reserved Amount</p>
                          <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-800">₹{wallet.reservedBalance}</h2>
                            <span className="text-xs text-gray-400 mb-1" title="For active subscriptions & pending orders">ⓘ</span>
                          </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                          <p className="text-green-600 text-sm font-medium mb-1">Withdrawable Balance</p>
                          <h2 className="text-3xl font-bold text-green-700">₹{wallet.withdrawableBalance}</h2>
                          <button 
                            onClick={() => setShowWithdrawModal(true)}
                            className="mt-2 w-full bg-white text-green-600 border border-green-200 text-sm py-1.5 rounded-lg hover:bg-green-100 font-medium transition"
                          >
                            Withdraw Money
                          </button>
                        </div>
                      </div>

                      {/* Recharge Form */}
                      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">Add Money</h4>
                          <p className="text-sm text-gray-500">Recharge instantly via Razorpay</p>
                        </div>
                        <form onSubmit={handleRecharge} className="flex gap-3 w-full md:w-auto">
                          <input 
                            type="number" 
                            required 
                            min="100" 
                            placeholder="Amount (₹)" 
                            value={rechargeAmount}
                            onChange={(e) => setRechargeAmount(e.target.value)}
                            className="px-4 py-2 rounded-xl text-gray-800 outline-none w-full md:w-32 focus:ring-2 focus:ring-blue-100 border border-gray-200"
                          />
                          <button type="submit" className="bg-milquu-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                            Recharge
                          </button>
                        </form>
                      </div>

                      {/* Withdrawal Tracking */}
                      {wallet.withdrawalRequests && wallet.withdrawalRequests.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">Refund Requests</h4>
                          <div className="space-y-3">
                            {wallet.withdrawalRequests.map(req => (
                              <div key={req._id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-orange-50 p-4 rounded-xl border border-orange-100 gap-2">
                                <div>
                                  <p className="font-semibold text-gray-800">Withdrawal to {req.refundMethod}</p>
                                  <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()} • ID: {req._id.substring(0, 8)}</p>
                                </div>
                                <div className="text-right flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-orange-200 text-orange-800'
                                  }`}>
                                    {req.status}
                                  </span>
                                  <p className="font-bold text-gray-800">₹{req.amount}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Transaction History */}
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h4>
                      {wallet.transactions && wallet.transactions.length > 0 ? (
                        <div className="space-y-3">
                          {wallet.transactions.map(txn => (
                            <div key={txn._id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {txn.type === 'credit' ? '+' : '-'}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{txn.description}</p>
                                  <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {txn.type === 'credit' ? '+' : '-'} ₹{txn.amount}
                                </p>
                                <p className="text-xs text-gray-500">Bal: ₹{txn.balanceAfter}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          No transactions yet. Recharge your wallet to get started!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Withdrawal Modal */}
                  {showWithdrawModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
                          <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif">Withdraw Funds</h2>
                        
                        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl flex justify-between items-center border border-green-200">
                          <span className="text-sm">Withdrawable Balance</span>
                          <span className="font-bold text-xl">₹{wallet.withdrawableBalance}</span>
                        </div>

                        <form onSubmit={handleWithdrawRequest} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw (₹)</label>
                            <input 
                              type="number" 
                              required 
                              min="1"
                              max={wallet.withdrawableBalance}
                              value={withdrawData.amount}
                              onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-milquu-blue outline-none"
                              placeholder="Enter amount"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
                            <select 
                              value={withdrawData.method}
                              onChange={(e) => setWithdrawData({...withdrawData, method: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-milquu-blue outline-none bg-white"
                            >
                              <option value="UPI">UPI</option>
                              <option value="Bank Account">Bank Transfer</option>
                            </select>
                          </div>

                          {withdrawData.method === 'UPI' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                              <input 
                                type="text" 
                                required 
                                value={withdrawData.upiId}
                                onChange={(e) => setWithdrawData({...withdrawData, upiId: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-milquu-blue outline-none"
                                placeholder="example@upi"
                              />
                            </div>
                          )}

                          {withdrawData.method === 'Bank Account' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={withdrawData.accNo}
                                  onChange={(e) => setWithdrawData({...withdrawData, accNo: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-milquu-blue outline-none"
                                  placeholder="00000000000"
                                />
                              </div>
                              <div className="flex gap-3">
                                <div className="w-1/2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                  <input 
                                    type="text" 
                                    required 
                                    value={withdrawData.ifsc}
                                    onChange={(e) => setWithdrawData({...withdrawData, ifsc: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-milquu-blue outline-none"
                                    placeholder="HDFC0001234"
                                  />
                                </div>
                                <div className="w-1/2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                  <input 
                                    type="text" 
                                    required 
                                    value={withdrawData.name}
                                    onChange={(e) => setWithdrawData({...withdrawData, name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-milquu-blue outline-none"
                                    placeholder="John Doe"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={loadingWithdraw}
                            className={`w-full py-3 mt-4 rounded-xl font-bold text-white shadow-md transition-colors ${loadingWithdraw ? 'bg-gray-400 cursor-not-allowed' : 'bg-milquu-blue hover:bg-blue-700'}`}
                          >
                            {loadingWithdraw ? 'Processing...' : `Withdraw ₹${withdrawData.amount || '0'}`}
                          </button>
                          <p className="text-xs text-center text-gray-500 mt-2">Refunds take 3-5 business days to process. <a href="/refund-policy" className="text-milquu-blue hover:underline">Read Policy</a></p>
                        </form>
                      </div>
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
