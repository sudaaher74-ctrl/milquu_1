import { useOutletContext } from 'react-router-dom';
import Badge from '../../components/ui/Badge';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Subscriptions() {
  const { subs = [] } = useOutletContext() || {};

  const active = subs.filter((s) => s.status === 'active').length;
  const paused = subs.filter((s) => s.status === 'paused').length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">Subscriptions</h1>
        <div className="flex gap-3 text-xs">
          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">{active} Active</span>
          <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-semibold">{paused} Paused</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Sub ID', 'Customer', 'Milk Type', 'Qty', 'Schedule', 'Area', 'Monthly', 'Status', 'Start Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">#{s.subscriptionId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-xs text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.phone}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-xs text-gray-600">{s.milkType}</td>
                  <td className="px-4 py-3 text-xs">{s.qty}L/day</td>
                  <td className="px-4 py-3 capitalize text-xs text-gray-600">{s.schedule}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.area?.name || '—'}</td>
                  <td className="px-4 py-3 font-bold text-xs text-green-700">{s.monthlyTotal}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{s.startDate ? fmt(s.startDate) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {subs.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No subscriptions yet.</div>}
        </div>
      </div>
    </div>
  );
}
