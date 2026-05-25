import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';
import { fetchAreas, placeOrder } from '../../services/api';

const COD_FEE = 1;

export default function CheckoutModal({ open, onClose }) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const toast = useToastStore((s) => s.show);

  const [step, setStep] = useState(1);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    fname: '', lname: '', phone: '', email: '', address: '', area: '', notes: ''
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + COD_FEE;

  useEffect(() => {
    if (open) { fetchAreas().then(setAreas); setStep(1); setSuccess(false); setForm({ fname:'',lname:'',phone:'',email:'',address:'',area:'',notes:'' }); }
  }, [open]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    if (!form.fname || !form.lname || !form.phone || !form.address || !form.area) {
      toast('Please fill all required fields ⚠️'); return false;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast('Enter a valid 10-digit phone number ⚠️'); return false;
    }
    return true;
  }

  function toStep(n) {
    if (n > 1 && !validate()) return;
    setStep(n);
  }

  const isMongoId = (v) => /^[a-f\d]{24}$/i.test(String(v || ''));
  const selectedArea = areas.find((a) => a.value === form.area);
  const fullAddress = [form.address, selectedArea?.label?.split('(')[0]?.trim() || 'Navi Mumbai'].filter(Boolean).join(', ');

  async function handlePlaceOrder() {
    if (!form.area) { toast('Please select a delivery area ⚠️'); return; }
    setLoading(true);
    try {
      const res = await placeOrder({
        customer: { name: `${form.fname} ${form.lname}`.trim(), phone: form.phone, email: form.email, address: fullAddress, notes: form.notes },
        area_id: isMongoId(form.area) ? form.area : undefined,
        items: items.map((i) => ({ productId: i.productId || i.id, qty: i.qty })),
        total,
        paymentMethod: 'cod',
      });
      setOrderId(res.orderId);
      clearCart();
      setSuccess(true);
    } catch (err) {
      toast(`❌ ${err.response?.data?.message || 'Order failed. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 35 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h3 className="font-display font-bold text-lg">🛒 Checkout</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors">✕</button>
              </div>

              {!success ? (
                <div className="px-6 py-5">
                  {/* Step Tabs */}
                  <div className="flex gap-2 mb-6">
                    {['Details', 'Payment', 'Confirm'].map((label, i) => (
                      <div key={i} className={`flex-1 text-center text-xs font-semibold py-2 rounded-xl transition-all ${step === i + 1 ? 'bg-green-600 text-white' : step > i + 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {i + 1}. {label}
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Details */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>First Name *</label><input className={inputCls} value={form.fname} onChange={update('fname')} placeholder="Rahul" /></div>
                        <div><label className={labelCls}>Last Name *</label><input className={inputCls} value={form.lname} onChange={update('lname')} placeholder="Sharma" /></div>
                      </div>
                      <div><label className={labelCls}>Phone *</label><input className={inputCls} type="tel" value={form.phone} onChange={update('phone')} placeholder="98XXXXXXXX" maxLength={10} /></div>
                      <div><label className={labelCls}>Email</label><input className={inputCls} type="email" value={form.email} onChange={update('email')} placeholder="optional" /></div>
                      <div><label className={labelCls}>Address *</label><input className={inputCls} value={form.address} onChange={update('address')} placeholder="Flat no, Street, Area" /></div>
                      <div>
                        <label className={labelCls}>Delivery Area *</label>
                        <select className={inputCls} value={form.area} onChange={update('area')}>
                          <option value="">Select Area</option>
                          {areas.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} value={form.notes} onChange={update('notes')} placeholder="Leave at door, ring twice..." /></div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        {items.map((i) => (
                          <div key={i.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{i.e} {i.name} × {i.qty}</span>
                            <span className="font-semibold">₹{(i.price * i.qty).toFixed(0)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-500">Delivery</span>
                          <span className="text-green-600 font-semibold">FREE</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Subtotal</span>
                          <span className="text-green-700">₹{subtotal.toFixed(0)}</span>
                        </div>
                      </div>
                      <button onClick={() => toStep(2)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-colors">Continue to Payment →</button>
                    </div>
                  )}

                  {/* Step 2: Payment */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">💵</span>
                          <div>
                            <div className="font-bold text-green-800">Cash on Delivery</div>
                            <div className="text-sm text-green-700 opacity-80">Pay when your order arrives</div>
                          </div>
                          <span className="ml-auto bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">✓ Selected</span>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3 text-xs text-green-800 leading-6">
                          🏡 Our agent will collect cash at your doorstep.<br/>
                          📋 Please keep the exact amount ready.<br/>
                          ⏱ Orders confirmed within 30 minutes.
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-sm text-gray-500">
                        <span>ℹ️</span>
                        <span>A <strong className="text-gray-700">₹{COD_FEE} handling fee</strong> is added for COD orders.</span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-colors">← Back</button>
                        <button onClick={() => toStep(3)} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition-colors">Review Order →</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirm */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <h4 className="text-sm font-bold mb-2">📦 Delivering To</h4>
                        <p className="font-semibold text-sm">{form.fname} {form.lname}</p>
                        <p className="text-xs text-gray-500">{form.phone}</p>
                        <p className="text-xs text-gray-500 mt-1">{fullAddress}</p>
                      </div>
                      <div className="bg-green-50 border border-green-300 rounded-2xl p-4">
                        <h4 className="text-sm font-bold text-green-800 mb-1">💵 Cash on Delivery</h4>
                        <p className="text-xs text-green-700">Pay ₹{total.toFixed(0)} in cash (incl. ₹{COD_FEE} handling fee)</p>
                      </div>
                      <div className="space-y-2">
                        {items.map((i) => (
                          <div key={i.id} className="flex justify-between text-sm">
                            <span>{i.e} {i.name} × {i.qty}</span>
                            <span className="font-semibold">₹{(i.price * i.qty).toFixed(0)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-gray-500">COD Handling Fee</span>
                          <span>₹{COD_FEE}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total to Pay (Cash)</span>
                          <span className="text-green-700">₹{total.toFixed(0)}</span>
                        </div>
                      </div>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors text-sm"
                      >
                        {loading ? '⏳ Processing...' : '💵 Confirm & Place Order'}
                      </button>
                      <button onClick={() => setStep(2)} className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-colors text-sm">← Back</button>
                    </div>
                  )}
                </div>
              ) : (
                /* Success */
                <div className="px-6 py-10 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-6xl mb-5">✅</motion.div>
                  <h2 className="font-display text-2xl font-bold mb-2">Order Placed! 🎉</h2>
                  <p className="text-gray-500 text-sm mb-4">Your order has been confirmed. We'll deliver it fresh tomorrow morning.</p>
                  <div className="bg-green-50 rounded-2xl px-5 py-3 inline-block mb-5">
                    <span className="text-green-800 font-bold">Order ID: #{orderId}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-6">A confirmation will be sent to your phone. Track via WhatsApp.</p>
                  <button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-2xl transition-colors">Continue Shopping →</button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
