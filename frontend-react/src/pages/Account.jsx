import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../config/api';
import { useToastStore } from '../stores/toastStore';

export default function Account() {
  const toast = useToastStore((s) => s.show);
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function lookup() {
    if (!/^[6-9]\d{9}$/.test(phone.trim())) { toast('Enter a valid 10-digit phone number ⚠️'); return; }
    setLoading(true);
    try {
      const [oRes, sRes] = await Promise.all([
        api.get(`/orders?phone=${phone.trim()}&limit=20`),
        api.get(`/subscriptions?phone=${phone.trim()}&limit=20`),
      ]);
      setOrders(oRes.data.orders || []);
      setSubs(sRes.data.subscriptions || []);
      setSearched(true);
    } catch {
      toast('Could not fetch orders. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const STATUS_COLOR = { confirmed: 'text-green-700 bg-green-50', pending: 'text-amber-700 bg-amber-50', delivered: 'text-green-700 bg-green-50', cancelled: 'text-red-700 bg-red-50', out_for_delivery: 'text-blue-700 bg-blue-50' };

  return (
    <>
      <div className="bg-gradient-to-br from-green-800 to-green-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">My Orders</h1>
            <p className="text-green-200 text-sm">Track your orders and subscriptions.</p>
          </motion.div>
        </div>
      </div>

      <section className="py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="font-bold text-gray-800 mb-4">Look Up Your Orders</h2>
            <div className="flex gap-3">
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter registered phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookup()}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button onClick={lookup} disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm">
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </div>

          {searched && (
            <div className="space-y-6">
              {/* Orders */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Orders ({orders.length})</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl">No orders found for this number.</div>
                ) : orders.map((o) => (
                  <div key={o._id} className="bg-white rounded-2xl p-5 border border-gray-100 mb-3 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-gray-800">#{o.orderId}</div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] || 'text-gray-600 bg-gray-50'}`}>{(o.status || '').replace(/_/g,' ')}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">{fmt(o.createdAt)}</div>
                    {o.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{item.productId?.name || 'Product'} × {item.qty}</span>
                        <span>₹{(item.price * item.qty).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-sm">
                      <span>Total</span><span className="text-green-700">₹{o.total}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subscriptions */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Subscriptions ({subs.length})</h3>
                {subs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl">No subscriptions found.</div>
                ) : subs.map((s) => (
                  <div key={s._id} className="bg-white rounded-2xl p-5 border border-gray-100 mb-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-gray-800">#{s.subscriptionId}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.milkType} · {s.qty}L/day · {s.schedule}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.status === 'active' ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>{s.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Monthly: <strong>{s.monthlyTotal}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
