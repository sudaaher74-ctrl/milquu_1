import { useOutletContext } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { updateOrderStatus } from '../../services/api';
import { useToastStore } from '../../stores/toastStore';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Delivery() {
  const { orders = [], loadAll } = useOutletContext() || {};
  const toast = useToastStore((s) => s.show);

  const active = orders.filter((o) => ['confirmed', 'assigned', 'out_for_delivery'].includes(o.status));

  async function markDelivered(id) {
    try {
      await updateOrderStatus(id, 'delivered');
      await loadAll(true);
      toast('Order marked as delivered ✅');
    } catch { toast('❌ Failed to update'); }
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Delivery Management</h1>
      <div className="grid grid-cols-3 gap-4">
        {[['confirmed','🟡 Confirmed'], ['assigned','🔵 Assigned'], ['out_for_delivery','🟢 Out for Delivery']].map(([s, label]) => (
          <div key={s} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="font-display text-2xl font-bold text-gray-900">{orders.filter((o) => o.status === s).length}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 font-bold text-sm text-gray-700">Active Deliveries ({active.length})</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Order', 'Customer', 'Address', 'Items', 'Status', 'Time', 'Action'].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {active.map((o) => (
                <tr key={o._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">#{o.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-xs">{o.customer?.name}</div>
                    <div className="text-xs text-gray-400">{o.customer?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px]">{o.customer?.address}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{o.items?.length} item(s)</td>
                  <td className="px-4 py-3"><Badge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmt(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    {o.status !== 'delivered' && (
                      <button onClick={() => markDelivered(o._id)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold">
                        ✓ Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {active.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No active deliveries right now 🎉</div>}
        </div>
      </div>
    </div>
  );
}
