import { useOutletContext } from 'react-router-dom';
import StatsCard from '../../components/admin/StatsCard';
import RevenueChart from '../../components/admin/RevenueChart';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Overview() {
  const { orders = [], subs = [], msgs = [] } = useOutletContext() || {};

  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const activeSubs = subs.filter((s) => s.status === 'active').length;
  const unreadMsgs = msgs.filter((m) => m.status === 'unread').length;
  const pending = orders.filter((o) => o.status === 'pending').length;

  const stats = [
    { icon: '🛒', label: "Today's Orders", value: todayOrders.length, sub: `${pending} pending`, color: 'blue' },
    { icon: '💰', label: "Today's Revenue", value: `₹${todayRevenue.toFixed(0)}`, sub: 'Cash on Delivery', color: 'green' },
    { icon: '📦', label: 'Active Subscriptions', value: activeSubs, color: 'purple' },
    { icon: '💬', label: 'Unread Messages', value: unreadMsgs, color: 'amber' },
    { icon: '🧾', label: 'Total Orders', value: orders.length, color: 'green' },
    { icon: '📊', label: 'Total Revenue', value: `₹${orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0).toFixed(0)}`, color: 'blue' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Live dashboard — updates every 5 seconds</p>
      </div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => <StatsCard key={s.label} {...s} />)}
      </motion.div>

      {/* Chart */}
      <RevenueChart orders={orders} />

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-gray-700">Recent Orders</h3>
          <span className="text-xs text-gray-400">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">#{o.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-xs text-gray-800">{o.customer?.name}</div>
                    <div className="text-xs text-gray-400">{o.customer?.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-xs text-gray-800">₹{o.total}</td>
                  <td className="px-4 py-3"><Badge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{fmt(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No orders yet. Waiting for first order... 🎯</div>
          )}
        </div>
      </div>
    </div>
  );
}
