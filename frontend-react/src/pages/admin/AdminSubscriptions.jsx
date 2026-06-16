import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { Users, CalendarCheck, RefreshCw, AlertCircle, Search, Filter, TrendingDown, IndianRupee } from 'lucide-react';
import ExportButton from '../../components/admin/ExportButton';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 relative overflow-hidden">
    <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-milquu-dark">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const AdminSubscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryAddress: '',
    frequency: 'Daily',
    productName: 'Cow Milk',
    qty: 1
  });

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/api/subscriptions');
        const mappedData = data.map(sub => ({
          ...sub,
          id: sub._id,
          product: sub.items && sub.items.length > 0 ? sub.items.map(i => i.name).join(', ') : 'Custom Box',
          qty: sub.items && sub.items.length > 0 ? sub.items.map(i => i.qty).join(', ') : 1,
          freq: sub.frequency,
          nextDelivery: new Date(sub.createdAt).toLocaleDateString(), 
          renewal: (sub.status === 'paused' || sub.status === 'Paused') && sub.pauseEndDate 
            ? `Resumes: ${new Date(sub.pauseEndDate).toLocaleDateString()}` 
            : 'Auto-renew'
        }));
        setSubscriptionsData(mappedData);
        setLoading(false);
      } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        deliveryAddress: formData.deliveryAddress,
        frequency: formData.frequency,
        items: [{ name: formData.productName, qty: Number(formData.qty), price: 80 }],
        status: 'Active',
      };
      await api.post('/api/subscriptions', payload);
      alert('Subscription created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', deliveryAddress: '', frequency: 'Daily', productName: 'Cow Milk', qty: 1 });
      fetchSubscriptions();
    } catch (error) {
      alert('Failed to create subscription');
    }
  };

  const openManageModal = (sub) => {
    setSelectedSub(sub);
    setIsManageModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedSub) return;
    try {
      await api.put(`/api/subscriptions/${selectedSub.id}`, { status });
      alert(`Subscription marked as ${status}`);
      setIsManageModalOpen(false);
      fetchSubscriptions();
    } catch (error) {
      alert('Failed to update subscription');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Subscriptions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage recurring orders and monthly subscribers.</p>
        </div>
        <div className="flex space-x-3">
          <ExportButton data={subscriptionsData} filename="Subscriptions_Export" title="Subscriptions Report" />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-milquu-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md shadow-milquu-blue/20"
          >
            Create Subscription
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        <div className="xl:col-span-1"><StatCard title="Active Plans" value={subscriptionsData.filter(s => s.status === 'Active').length} subtitle="Currently active" icon={<CalendarCheck size={20} className="text-green-600" />} color="bg-green-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Upcoming Deliveries" value={subscriptionsData.filter(s => s.status === 'Active').length} subtitle="For tomorrow" icon={<RefreshCw size={20} className="text-blue-600" />} color="bg-blue-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Total Subs" value={subscriptionsData.length} subtitle="All time" icon={<Users size={20} className="text-purple-600" />} color="bg-purple-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Paused Plans" value={subscriptionsData.filter(s => s.status === 'Paused' || s.status === 'paused').length} subtitle="Currently on hold" icon={<AlertCircle size={20} className="text-orange-600" />} color="bg-orange-500" /></div>
        <div className="xl:col-span-1"><StatCard title="Sub Revenue" value={`₹${subscriptionsData.filter(s => s.status === 'Active').reduce((acc, s) => acc + ((s.items && s.items[0]?.price * s.items[0]?.qty) || 0), 0) * 30}`} subtitle="Est. Monthly" icon={<IndianRupee size={20} className="text-milquu-blue" />} color="bg-milquu-blue" /></div>
        <div className="xl:col-span-1"><StatCard title="Churn Rate" value="0%" subtitle="0% vs last" icon={<TrendingDown size={20} className="text-red-600" />} color="bg-red-500" /></div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 w-full sm:w-80 border border-gray-200 focus-within:border-milquu-blue transition-colors">
            <Search size={16} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by name, ID or product..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-sans"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Subscriber</th>
                <th className="px-6 py-4 font-semibold">Plan Details</th>
                <th className="px-6 py-4 font-semibold">Frequency</th>
                <th className="px-6 py-4 font-semibold">Next Delivery</th>
                <th className="px-6 py-4 font-semibold">Status/Renewal</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptionsData
                .filter(sub => 
                  (sub.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (sub.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (sub.product || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((sub, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-milquu-dark">{sub.name}</p>
                    <p className="text-xs text-gray-400">{sub.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800">{sub.product}</p>
                    <p className="text-xs text-gray-500">Qty: {sub.qty}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {sub.freq}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{sub.nextDelivery}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${sub.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                      <span className="text-sm font-semibold text-gray-700">{sub.status}</span>
                    </div>
                    <p className={`text-xs ${sub.renewal.includes('Alert') ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {sub.renewal}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openManageModal(sub)} className="text-milquu-blue text-sm font-medium hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Offline Subscription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea required name="deliveryAddress" value={formData.deliveryAddress} onChange={handleInputChange} className="w-full border rounded-lg p-2" rows="2"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select name="productName" value={formData.productName} onChange={handleInputChange} className="w-full border rounded-lg p-2">
                    <option value="A2 Cow Milk">A2 Cow Milk</option>
                    <option value="Premium Buffalo Milk">Premium Buffalo Milk</option>
                    <option value="Pure Cow Milk">Pure Cow Milk</option>
                    <option value="Cow Milk (Pouch)">Cow Milk (Pouch)</option>
                    <option value="Buffalo Milk (Pouch)">Buffalo Milk (Pouch)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Litres)</label>
                  <input required type="number" name="qty" min="1" value={formData.qty} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select name="frequency" value={formData.frequency} onChange={handleInputChange} className="w-full border rounded-lg p-2">
                  <option value="Daily">Daily</option>
                  <option value="Alternate Days">Alternate Days</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-milquu-blue text-white rounded-lg hover:bg-blue-800">
                  Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {isManageModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-milquu-dark">Manage Subscription</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-bold text-gray-800">{selectedSub.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Product</p>
                <p className="font-medium text-gray-800">{selectedSub.product} (Qty: {selectedSub.qty})</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Status</p>
                <p className="font-bold text-gray-800">{selectedSub.status}</p>
              </div>
            </div>
            
            <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => handleUpdateStatus('Active')}
                className="py-2 border border-green-200 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors"
              >
                Mark Active
              </button>
              <button 
                onClick={() => handleUpdateStatus('Paused')}
                className="py-2 border border-orange-200 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors"
              >
                Pause Delivery
              </button>
              <button 
                onClick={() => handleUpdateStatus('Cancelled')}
                className="py-2 col-span-2 border border-red-200 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setIsManageModalOpen(false)} 
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
