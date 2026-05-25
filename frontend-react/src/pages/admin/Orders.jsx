import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { updateOrderStatus } from '../../services/api';
import { useToastStore } from '../../stores/toastStore';

const STATUS_OPTS = ['pending', 'confirmed', 'assigned', 'out_for_delivery', 'delivered', 'cancelled'];
const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const PER_PAGE = 10;

export default function Orders() {
  const { orders = [], loadAll } = useOutletContext() || {};
  const toast = useToastStore((s) => s.show);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [updating, setUpdating] = useState(null);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
    if (search) list = list.filter((o) => o.orderId?.includes(search) || o.customer?.name?.toLowerCase().includes(search.toLowerCase()) || o.customer?.phone?.includes(search));
    return list;
  }, [orders, filter, search]);

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  async function changeStatus(id, status) {
    setUpdating(id);
    try {
      await updateOrderStatus(id, status);
      await loadAll(true);
      toast(`Order status updated to ${status} ✅`);
    } catch {
      toast('❌ Failed to update status');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUS_OPTS].map((s) => (
            <button key={s} onClick={() => { setFilter(s); setPage(0); }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all capitalize ${filter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.replace(/_/g, ' ')} {s === 'all' ? `(${orders.length})` : `(${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <input type="text" placeholder="Search by Order ID, name, or phone..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Area', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((o) => (
                <tr key={o._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">#{o.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-xs text-gray-800">{o.customer?.name}</div>
                    <div className="text-xs text-gray-400">{o.customer?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px]">
                    {o.items?.map((i, idx) => <div key={idx}>{i.productId?.name || 'Product'} × {i.qty}</div>)}
                  </td>
                  <td className="px-4 py-3 font-bold text-xs text-gray-800 whitespace-nowrap">₹{o.total}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{o.area?.name || o.customer?.address?.split(',')[1]?.trim() || '—'}</td>
                  <td className="px-4 py-3"><Badge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmt(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      disabled={updating === o._id}
                      value={o.status}
                      onChange={(e) => changeStatus(o._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No orders found.</div>}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 text-xs">Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
