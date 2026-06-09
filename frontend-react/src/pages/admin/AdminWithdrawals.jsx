import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Clock, CheckCircle2, XCircle, FileText, Search, RefreshCw } from 'lucide-react';

const baseUrl = import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com';

const AdminWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) return;
      const adminToken = JSON.parse(userInfoStr).token;

      const res = await fetch(`${baseUrl}/api/admin/withdrawals`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      } else {
        alert(data.message || 'Error fetching requests');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    let remarks = '';
    if (status === 'Rejected') {
      remarks = prompt('Enter reason for rejection:');
      if (remarks === null) return;
    } else {
      if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return;
    }

    setProcessingId(id);
    try {
      const adminToken = JSON.parse(localStorage.getItem('userInfo')).token;
      const res = await fetch(`${baseUrl}/api/admin/withdrawals/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ status, adminRemarks: remarks })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`Status updated to ${status}`);
        fetchRequests();
      } else {
        alert(data.message || 'Error updating status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.user?.phone.includes(searchTerm) ||
    req.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.refundMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = requests.filter(r => ['Pending', 'Under Review'].includes(r.status)).reduce((sum, r) => sum + r.amount, 0);
  const totalApproved = requests.filter(r => ['Approved', 'Completed'].includes(r.status)).reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-serif">Refund Management</h1>
          <p className="text-gray-500 mt-1">Review and process customer withdrawal requests</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Amount</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{totalPending}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Processed Refunds</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{totalApproved}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Requests</p>
            <h3 className="text-2xl font-bold text-gray-800">{requests.length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-72 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-milquu-blue text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Method Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10">Loading requests...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10">No requests found.</td></tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{new Date(req.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">{req._id.substring(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{req.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{req.user?.phone}</p>
                      <p className="text-xs text-blue-600 mt-1">Wallet: ₹{req.user?.walletBalance}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 text-lg">₹{req.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-semibold mb-1 border border-gray-200">{req.refundMethod}</span>
                      {req.refundMethod === 'UPI' ? (
                        <p className="text-sm font-medium">{req.upiId}</p>
                      ) : (
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <p><span className="text-gray-400">A/C:</span> {req.bankDetails?.accountNumber}</p>
                          <p><span className="text-gray-400">IFSC:</span> {req.bankDetails?.ifscCode}</p>
                          <p><span className="text-gray-400">Name:</span> {req.bankDetails?.accountName}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {req.status}
                      </span>
                      {req.adminRemarks && (
                        <p className="text-[10px] text-gray-400 mt-2 max-w-[150px] leading-tight" title={req.adminRemarks}>
                          Note: {req.adminRemarks.substring(0, 30)}...
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(req.status === 'Pending' || req.status === 'Under Review') && (
                        <div className="flex gap-2">
                          <button 
                            disabled={processingId === req._id}
                            onClick={() => handleUpdateStatus(req._id, 'Approved')}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button 
                            disabled={processingId === req._id}
                            onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                            className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-50 transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status === 'Approved' && (
                        <button 
                          disabled={processingId === req._id}
                          onClick={() => handleUpdateStatus(req._id, 'Completed')}
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
