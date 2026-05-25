import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getSocket, disconnectSocket } from '../../services/socket';
import { fetchOrders, fetchSubscriptions, fetchMessages, fetchHealthStatus } from '../../services/api';
import { useToastStore } from '../../stores/toastStore';

export const useAdminData = () => {
  const [orders, setOrders] = useState([]);
  const [subs, setSubs] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [apiOk, setApiOk] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const toast = useToastStore((s) => s.show);

  const loadAll = useCallback(async (silent = false) => {
    if (syncing) return;
    setSyncing(true);
    try {
      await fetchHealthStatus();
      setApiOk(true);
      const [od, sd, md] = await Promise.all([
        fetchOrders('?limit=500'),
        fetchSubscriptions('?limit=500'),
        fetchMessages(),
      ]);
      setOrders(od.orders || []);
      setSubs(sd.subscriptions || []);
      setMsgs(md.messages || []);
      if (!silent) toast('Data refreshed ✅');
    } catch {
      setApiOk(false);
      if (!silent) toast('❌ Cannot reach server');
    } finally {
      setSyncing(false);
    }
  }, []);

  return { orders, subs, msgs, apiOk, syncing, loadAll, setOrders };
};

export default function AdminLayout() {
  const toast = useToastStore((s) => s.show);
  const { orders, subs, msgs, apiOk, loadAll, setOrders } = useAdminData();

  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const unreadMsgs = msgs.filter((m) => m.status === 'unread').length;

  useEffect(() => {
    loadAll(true);
    // Poll every 5s like the original dashboardSyncInterval
    const poll = setInterval(() => { if (!document.hidden) loadAll(true); }, 5000);

    // Socket.IO — listen for real-time new orders
    const socket = getSocket();
    socket.on('newOrder', (order) => {
      setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
      toast(`🛒 New order ${order.orderId} from ${order.customer?.name || 'Customer'}`);
    });
    socket.on('orderUpdated', (order) => {
      setOrders((prev) => prev.map((o) => o._id === order._id ? order : o));
    });

    return () => {
      clearInterval(poll);
      socket.off('newOrder');
      socket.off('orderUpdated');
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar newOrdersCount={pendingOrders} newMsgsCount={unreadMsgs} apiOk={apiOk} />
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm font-semibold text-gray-700">Admin Dashboard</div>
          <button onClick={() => loadAll(false)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
            ↻ Refresh
          </button>
        </div>
        {/* Inject data via context or outlet context */}
        <Outlet context={{ orders, subs, msgs, apiOk, loadAll }} />
      </div>
    </div>
  );
}
