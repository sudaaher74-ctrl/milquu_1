import { useEffect, useState } from 'react';
import api from '../../utils/api.js';
import toast from '../../utils/toast';
import { getAdminSession, isAdminRole } from '../../utils/adminAccess';
import { Users, UserPlus, UserCheck, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ExportButton from '../../components/admin/ExportButton';
import { ChartGradients, GlassTooltip, GlowingDot } from '../../components/admin/charts/PremiumChart.jsx';

const PAGE_SIZE = 25;
const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

const StatCard = ({ title, value, icon, hint }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-milquu-dark">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
    <div className="p-4 rounded-xl bg-gray-50 text-gray-700">{icon}</div>
  </div>
);

const Customers = () => {
  const canManageWallets = isAdminRole(getAdminSession()?.role);

  // Headline numbers and charts, counted by the server
  const [insights, setInsights] = useState(null);
  // One page of customers
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [creditOnly, setCreditOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [walletForm, setWalletForm] = useState({ amount: '', type: 'credit', description: 'Manual Recharge' });

  useEffect(() => {
    api.get('/api/admin/customers/insights')
      .then(({ data }) => setInsights(data))
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load customer insights'));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) params.set('search', search);
    if (creditOnly) params.set('credit', 'true');
    api.get(`/api/admin/customers?${params}`)
      .then(({ data }) => {
        if (cancelled) return;
        setCustomers(data.customers);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load customers'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, search, creditOnly, reloadKey]);

  const submitSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    const verb = walletForm.type === 'credit' ? 'Add' : 'Deduct';
    if (!window.confirm(`${verb} ₹${walletForm.amount} ${walletForm.type === 'credit' ? 'to' : 'from'} ${selectedCustomer.name}'s wallet? This is recorded in the audit log.`)) return;
    try {
      await api.post('/api/admin/wallets/transaction', {
        userId: selectedCustomer._id,
        amount: walletForm.amount,
        type: walletForm.type,
        description: walletForm.description
      });
      toast.success(`Wallet ${walletForm.type === 'credit' ? 'credited' : 'debited'}`);
      setWalletModalOpen(false);
      setWalletForm({ amount: '', type: 'credit', description: 'Manual Recharge' });
      setReloadKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  };

  const stats = insights?.stats;
  const growthData = insights?.growthData || [];
  const segmentData = insights?.segmentData || [];

  const exportData = customers.map(c => ({
    'Customer ID': c._id,
    'Name': c.name,
    'Phone': c.phone || '',
    'Joined': new Date(c.createdAt).toLocaleDateString('en-IN'),
    'Paid Orders': c.orders,
    'Lifetime Value': c.lifetimeValue,
    'Wallet': c.walletBalance,
    'Status': c.status
  }));

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Who your customers are, how they buy, and their wallets.</p>
        </div>
        <ExportButton data={exportData} filename="Customers_Export" title="Customers (this page)" label="Export page" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total customers" value={stats ? stats.totalCustomers.toLocaleString('en-IN') : '—'} icon={<Users size={24} className="text-blue-600" />} />
        <StatCard title="New in the last 30 days" value={stats ? stats.newCustomers30d.toLocaleString('en-IN') : '—'} icon={<UserPlus size={24} className="text-green-600" />} />
        <StatCard title="Have ever ordered" value={stats ? `${stats.retentionRate}%` : '—'} hint="Share of customers with a paid order" icon={<UserCheck size={24} className="text-purple-600" />} />
        <StatCard title="Avg lifetime value" value={stats ? rupees(stats.avgLTV) : '—'} hint="Per customer who has ordered" icon={<Star size={24} className="text-orange-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">New & Returning Customers</h2>
              <p className="text-xs text-slate-400 mt-0.5">Growth trajectory over the last 6 months</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Last 6 months</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <ChartGradients />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<GlassTooltip unit="" />} />
                <Area 
                  type="monotone" 
                  dataKey="returning" 
                  name="Returning" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#sapphireGlow)" 
                  activeDot={<GlowingDot stroke="#2563eb" />}
                />
                <Area 
                  type="monotone" 
                  dataKey="new" 
                  name="New Signups" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#emeraldGlow)" 
                  activeDot={<GlowingDot stroke="#059669" />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-0.5">Plans by Rhythm</h2>
            <p className="text-xs text-slate-400 mb-4">Subscription frequencies</p>
          </div>
          <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentData} innerRadius={62} outerRadius={86} paddingAngle={5} dataKey="value" stroke="none">
                  {segmentData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<GlassTooltip unit="%" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
            {segmentData.map((segment) => (
              <div key={segment.name} className="flex items-center text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100/80">
                <span className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: segment.color }} />
                <span className="text-slate-600 font-medium truncate">{segment.name}</span>
                <span className="ml-auto font-mono font-bold text-slate-900">{segment.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-milquu-dark">All customers</h2>
            <p className="text-xs text-gray-500">{loading ? 'Loading…' : `${total.toLocaleString('en-IN')} customer${total === 1 ? '' : 's'}${search ? ` matching “${search}”` : ''}`} · newest first</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={submitSearch} role="search" className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 sm:w-72">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Name, phone or email" aria-label="Search customers" className="bg-transparent border-none outline-none text-sm w-full" />
            </form>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={creditOnly} onChange={(e) => { setLoading(true); setPage(1); setCreditOnly(e.target.checked); }} />
              Khata customers only
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Paid orders</th>
                <th className="px-6 py-4 font-semibold">Wallet</th>
                <th className="px-6 py-4 font-semibold">Lifetime value</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                {canManageWallets && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && customers.length === 0 && (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">No customers found.</td></tr>
              )}
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-green-100 flex items-center justify-center text-milquu-dark font-bold text-xs mr-3">
                        {(customer.name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-milquu-dark">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.phone || customer.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{customer.orders}</td>
                  <td className="px-6 py-4 text-sm font-bold text-milquu-blue">{rupees(customer.walletBalance)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{rupees(customer.lifetimeValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      customer.status === 'VIP' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      customer.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status}
                    </span>
                    {customer.isCreditCustomer && <span className="ml-2 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">Khata</span>}
                  </td>
                  {canManageWallets && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedCustomer(customer); setWalletModalOpen(true); }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-bold transition-colors"
                      >
                        Manage wallet
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => { setLoading(true); setPage((p) => p - 1); }} disabled={page <= 1} aria-label="Previous page" className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronLeft size={18} /></button>
              <button onClick={() => { setLoading(true); setPage((p) => p + 1); }} disabled={page >= pages} aria-label="Next page" className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {walletModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="wallet-title">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <h2 id="wallet-title" className="text-xl font-bold text-milquu-dark mb-1">Manage wallet</h2>
            <p className="text-sm text-gray-500 mb-6">Customer: <span className="font-bold">{selectedCustomer.name}</span> | Balance: <span className="font-bold text-milquu-blue">{rupees(selectedCustomer.walletBalance)}</span></p>
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-700 mb-1">Transaction type</legend>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="type" checked={walletForm.type === 'credit'} onChange={() => setWalletForm({ ...walletForm, type: 'credit', description: 'Manual Recharge' })} />
                    <span className="text-sm font-medium text-gray-700">Credit (add)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="type" checked={walletForm.type === 'debit'} onChange={() => setWalletForm({ ...walletForm, type: 'debit', description: 'Manual Deduction' })} />
                    <span className="text-sm font-medium text-gray-700">Debit (deduct)</span>
                  </label>
                </div>
              </fieldset>
              <div>
                <label htmlFor="wallet-amount" className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input id="wallet-amount" type="number" required min="1" step="0.01" value={walletForm.amount} onChange={e => setWalletForm({ ...walletForm, amount: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-milquu-blue text-sm" />
              </div>
              <div>
                <label htmlFor="wallet-reason" className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
                <input id="wallet-reason" type="text" required value={walletForm.description} onChange={e => setWalletForm({ ...walletForm, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-milquu-blue text-sm" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setWalletModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${walletForm.type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  Confirm {walletForm.type === 'credit' ? 'recharge' : 'deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
