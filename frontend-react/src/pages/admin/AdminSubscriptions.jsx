import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api.js';
import { Users, CalendarCheck, AlertCircle, Search, Filter, IndianRupee, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ExportButton from '../../components/admin/ExportButton';
import toast from '../../utils/toast';

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

const PAGE_SIZE = 25;
const STATUSES = ['Active', 'Pending', 'Paused', 'Cancelled'];

/** Row shape for the table and the manage modal. */
const toRow = (sub) => ({
  ...sub,
  id: sub._id,
  product: sub.items && sub.items.length > 0
    ? sub.items.map(i => `${i.product?.name || i.name || 'Item'}${i.unit === '500 ml' ? ' (500 ml)' : ''}`).join(', ')
    : 'Custom Box',
  qty: sub.items && sub.items.length > 0 ? sub.items.map(i => i.quantity ?? i.qty).join(', ') : 1,
  freq: sub.frequency,
  staffName: sub.assignedStaff?.name || null,
  pausedUntil: sub.status === 'Paused' && sub.pauseEndDate ? new Date(sub.pauseEndDate).toLocaleDateString('en-IN') : null
});

const AdminSubscriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = STATUSES.includes(searchParams.get('status')) ? searchParams.get('status') : '';
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pages: 1, counts: {}, activeMonthly: 0 });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryAddress: '',
    frequency: 'Daily',
    productId: '',
    qty: 1
  });
  // Plans are priced by the server from the product, so the form picks a real
  // milk product rather than typing a name and a hardcoded price.
  const [milkProducts, setMilkProducts] = useState([]);

  useEffect(() => {
    api.get('/api/products')
      .then(({ data }) => {
        const milk = (data || []).filter(p => p.category === 'milk');
        setMilkProducts(milk);
        if (milk.length) setFormData(f => (f.productId ? f : { ...f, productId: milk[0]._id }));
      })
      .catch(() => setMilkProducts([]));
  }, []);

  const fetchSubscriptions = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (unassignedOnly) params.set('unassigned', 'true');
    api.get(`/api/subscriptions?${params}`)
      .then(({ data }) => {
        if (cancelled) return;
        setSubscriptionsData(data.subscriptions.map(toRow));
        setSummary({ total: data.total, pages: data.pages, counts: data.counts || {}, activeMonthly: data.activeMonthly || 0 });
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load subscriptions'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, search, statusFilter, unassignedOnly, reloadKey]);

  const setStatusFilter = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value); else next.delete('status');
    setLoading(true);
    setPage(1);
    setSearchParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setSearch(searchInput.trim());
  };

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
        items: [{ product: formData.productId, quantity: Number(formData.qty) }],
        status: 'Active',
      };
      if (!formData.productId) {
        toast('Please choose a milk product');
        return;
      }
      await api.post('/api/subscriptions', payload);
      toast('Subscription created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', deliveryAddress: '', frequency: 'Daily', productId: milkProducts[0]?._id || '', qty: 1 });
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create subscription');
    }
  };

  const openManageModal = (sub) => {
    setSelectedSub(sub);
    setIsManageModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedSub) return;
    if (status === 'Cancelled' && !window.confirm(`Cancel ${selectedSub.name || 'this'} plan? Deliveries stop from tomorrow.`)) return;
    try {
      await api.put(`/api/subscriptions/${selectedSub.id}`, { status });
      toast(`Subscription marked as ${status}`);
      setIsManageModalOpen(false);
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
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
          <ExportButton data={subscriptionsData.map(({ id, name, phone, product, qty, freq, status, staffName }) => ({ ID: id, Name: name, Phone: phone, Plan: product, Qty: qty, Frequency: freq, Status: status, "Delivery person": staffName || "Unassigned" }))} filename="Subscriptions_Export" title="Subscriptions (this page)" label="Export page" />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-milquu-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md shadow-milquu-blue/20"
          >
            Create Subscription
          </button>
        </div>
      </div>

      {/* Top Stats — counted by the server across all plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <StatCard title="Active plans" value={summary.counts.Active || 0} subtitle="Delivering now" icon={<CalendarCheck size={20} className="text-green-600" />} color="bg-green-500" />
        <StatCard title="Waiting for approval" value={summary.counts.Pending || 0} subtitle="From the website" icon={<Clock size={20} className="text-blue-600" />} color="bg-blue-500" />
        <StatCard title="Paused" value={summary.counts.Paused || 0} subtitle="Holiday or low wallet" icon={<AlertCircle size={20} className="text-orange-600" />} color="bg-orange-500" />
        <StatCard title="All plans" value={Object.values(summary.counts).reduce((a, b) => a + b, 0)} subtitle="Every status" icon={<Users size={20} className="text-purple-600" />} color="bg-purple-500" />
        <StatCard title="Plan revenue" value={`₹${summary.activeMonthly.toLocaleString('en-IN')}`} subtitle="Active plans, typical month" icon={<IndianRupee size={20} className="text-milquu-blue" />} color="bg-milquu-blue" />
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <form onSubmit={submitSearch} role="search" className="flex items-center bg-gray-50 rounded-lg px-3 py-2 w-full md:w-80 border border-gray-200 focus-within:border-milquu-blue transition-colors">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="search"
              aria-label="Search subscriptions"
              placeholder="Name, phone, plan ID or address"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-sans"
            />
          </form>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Filter size={16} className="text-gray-500 mr-2" />
              <select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent outline-none text-sm font-medium text-gray-600">
                <option value="">All statuses</option>
                {STATUSES.map((st) => <option key={st} value={st}>{st} ({summary.counts[st] || 0})</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={unassignedOnly} onChange={(e) => { setLoading(true); setPage(1); setUnassignedOnly(e.target.checked); }} />
              No delivery person
            </label>
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
                <th className="px-6 py-4 font-semibold">Delivery person</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && subscriptionsData.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">No subscriptions match.</td></tr>
              )}
              {subscriptionsData.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-milquu-dark">{sub.name}</p>
                    <p className="text-xs text-gray-400">{sub.phone || sub.subscriptionId || sub.id}</p>
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
                  <td className="px-6 py-4 text-sm font-medium">
                    {sub.staffName ? <span className="text-gray-700">{sub.staffName}</span> : <span className="text-red-600">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${sub.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                      <span className="text-sm font-semibold text-gray-700">{sub.status}</span>
                    </div>
                    {sub.pausedReason === 'insufficient_balance' && <p className="text-xs text-red-500 font-medium">Wallet ran short</p>}
                    {sub.pausedUntil && <p className="text-xs text-gray-400">Until {sub.pausedUntil}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openManageModal(sub)} className="text-milquu-blue text-sm font-medium hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summary.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">{summary.total.toLocaleString('en-IN')} plans · page {page} of {summary.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => { setLoading(true); setPage((p) => p - 1); }} disabled={page <= 1} aria-label="Previous page" className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronLeft size={18} /></button>
              <button onClick={() => { setLoading(true); setPage((p) => p + 1); }} disabled={page >= summary.pages} aria-label="Next page" className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
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
                  <select required name="productId" value={formData.productId} onChange={handleInputChange} className="w-full border rounded-lg p-2">
                    {milkProducts.length === 0 && <option value="">No milk products found</option>}
                    {milkProducts.map(p => (
                      <option key={p._id} value={p._id}>{p.name} — ₹{p.planPrice || p.price}</option>
                    ))}
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
