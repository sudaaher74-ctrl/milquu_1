import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToastStore } from '../stores/toastStore';
import { useProductStore } from '../stores/productStore';
import { fetchAreas, createSubscription } from '../services/api';

const MILK_RATES_DEFAULT = { cow: 60, buffalo: 75, organic: 120 };
const MILK_META = {
  cow:     { name: 'Cow Milk',     emoji: '🐄' },
  buffalo: { name: 'Buffalo Milk', emoji: '🐃' },
  organic: { name: 'Organic Milk', emoji: '🌿' },
};
const SCHEDULE_DAYS = { daily: 30, alternate: 15, weekdays: 22 };
const SCHEDULES = [
  { key: 'daily', label: 'Daily', sub: '30 days/month' },
  { key: 'alternate', label: 'Alternate Day', sub: '15 days/month' },
  { key: 'weekdays', label: 'Weekdays Only', sub: '22 days/month' },
];

const isMongoId = (v) => /^[a-f\d]{24}$/i.test(String(v || ''));

export default function Subscription() {
  const toast = useToastStore((s) => s.show);
  const products = useProductStore((s) => s.products);
  const [areas, setAreas] = useState([]);
  const [schedule, setSchedule] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', address: '', area: '',
    milkType: 'cow', qty: 1, startDate: '', notes: ''
  });

  useEffect(() => {
    fetchAreas().then(setAreas);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm((f) => ({ ...f, startDate: tomorrow.toISOString().split('T')[0] }));
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function getMilkRate(type) {
    const p = products.find((pr) => pr.cat === 'milk' && pr.name?.toLowerCase().includes(type));
    return (p && p.price) || MILK_RATES_DEFAULT[type] || 60;
  }

  const rate = getMilkRate(form.milkType);
  const days = SCHEDULE_DAYS[schedule] || 30;
  const subtotal = parseFloat(form.qty || 1) * days * rate;
  const meta = MILK_META[form.milkType] || MILK_META.cow;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.area) {
      toast('Please fill all required fields ⚠️'); return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast('Enter a valid 10-digit phone number ⚠️'); return;
    }

    const selectedArea = areas.find((a) => a.value === form.area);
    const fullAddress = [form.address, selectedArea?.label?.split('(')[0]?.trim() || 'Navi Mumbai'].filter(Boolean).join(', ');

    setLoading(true);
    try {
      const res = await createSubscription({
        name: form.name, phone: form.phone, address: fullAddress,
        area_id: isMongoId(form.area) ? form.area : undefined,
        milkType: form.milkType, qty: form.qty, schedule,
        startDate: form.startDate, notes: form.notes,
        monthlyTotal: `₹${subtotal.toFixed(0)}`, paymentMethod: 'cod', status: 'active'
      });
      setSuccess(res.subscriptionId);
      toast(`🎉 Subscription #${res.subscriptionId} confirmed! ₹${subtotal.toFixed(0)}/month`);
    } catch (err) {
      toast(`❌ ${err.response?.data?.message || 'Subscription failed. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <>
      <div className="bg-gradient-to-br from-green-800 to-green-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">Daily Delivery</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Subscribe for Daily Fresh Milk</h1>
            <p className="text-green-200 text-sm">Never run out of fresh milk again. Get it at your door every morning.</p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              {success ? (
                <div className="text-center py-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="text-6xl mb-5">🎉</motion.div>
                  <h2 className="font-display text-2xl font-bold mb-2">Subscription Confirmed!</h2>
                  <div className="bg-green-50 rounded-2xl px-5 py-3 inline-block mb-4">
                    <span className="text-green-800 font-bold">Sub ID: #{success}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Your milk will be delivered fresh every morning starting {form.startDate}.</p>
                  <button onClick={() => setSuccess(null)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl">Create Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display font-bold text-xl mb-1">Set Up Your Subscription</h2>
                  <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.name} onChange={update('name')} placeholder="Rahul Sharma" /></div>
                  <div><label className={labelCls}>Phone Number *</label><input className={inputCls} type="tel" value={form.phone} onChange={update('phone')} placeholder="98XXXXXXXX" maxLength={10} /></div>
                  <div><label className={labelCls}>Delivery Address *</label><input className={inputCls} value={form.address} onChange={update('address')} placeholder="Flat no, Street, Area" /></div>
                  <div>
                    <label className={labelCls}>Delivery Area *</label>
                    <select className={inputCls} value={form.area} onChange={update('area')}>
                      <option value="">Select Area</option>
                      {areas.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">📍 We deliver in selected areas only</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Milk Type</label>
                      <select className={inputCls} value={form.milkType} onChange={update('milkType')}>
                        {Object.entries(MILK_META).map(([k, v]) => (
                          <option key={k} value={k}>{v.emoji} {v.name} — ₹{getMilkRate(k)}/L</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Quantity (L/day)</label>
                      <input className={inputCls} type="number" value={form.qty} onChange={update('qty')} min="0.5" max="20" step="0.5" />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className={labelCls}>Delivery Schedule</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SCHEDULES.map((s) => (
                        <button key={s.key} type="button" onClick={() => setSchedule(s.key)}
                          className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all text-center ${schedule === s.key ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          <div className="font-bold">{s.label}</div>
                          <div className="opacity-60">{s.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input className={inputCls} type="date" value={form.startDate} onChange={update('startDate')} min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea className={inputCls} rows={2} value={form.notes} onChange={update('notes')} placeholder="Any special delivery instructions..." />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors">
                    {loading ? '⏳ Processing...' : '💵 Confirm Subscription'}
                  </button>
                  <p className="text-center text-xs text-gray-400">Cash on Delivery — pay monthly when we deliver</p>
                </form>
              )}
            </div>

            {/* Summary */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ['Milk Type', `${meta.emoji} ${meta.name}`],
                    ['Rate', `₹${rate}/L`],
                    ['Quantity', `${form.qty} L/day`],
                    ['Schedule', `${days} days/month`],
                    ['Delivery', '₹0 (Free)'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold">{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                    <span>Monthly Total</span>
                    <span className="text-green-700">₹{subtotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-3xl p-6 border border-green-100 space-y-3">
                {['🕕 Morning delivery before 7 AM', '⏸️ Pause or cancel anytime', '🐄 Farm-fresh, preservative-free', '💵 Cash on Delivery'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-green-800"><span>✓</span>{f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
