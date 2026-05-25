import { useState } from 'react';
import { motion } from 'framer-motion';
import { sendMessage } from '../services/api';
import { useToastStore } from '../stores/toastStore';

export default function Contact() {
  const toast = useToastStore((s) => s.show);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) { toast('Please fill required fields ⚠️'); return; }
    setLoading(true);
    try {
      await sendMessage(form);
      setSent(true);
      toast('Message sent! We\'ll get back to you soon 💬');
    } catch {
      toast('❌ Could not send message. Please try WhatsApp directly.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5';

  return (
    <>
      <div className="bg-gradient-to-br from-green-800 to-green-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Contact Us</h1>
            <p className="text-green-200 text-sm">We'd love to hear from you. Reach out anytime.</p>
          </motion.div>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info */}
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold text-gray-900">Get in Touch</h2>
              <p className="text-gray-500 text-sm leading-relaxed">Have questions about our products, delivery areas, or subscriptions? We're here to help.</p>
              {[
                ['📞', 'Phone / WhatsApp', '+91 8767067884', 'https://wa.me/918767067884'],
                ['📍', 'Service Area', 'Navi Mumbai (Kharghar, Panvel, Kamothe, Belapur & more)', null],
                ['⏰', 'Delivery Hours', 'Every morning before 7 AM', null],
              ].map(([icon, label, val, href]) => (
                <div key={label} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-700">{label}</div>
                    {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">{val}</a>
                      : <div className="text-sm text-gray-500">{val}</div>}
                  </div>
                </div>
              ))}
              <a href="https://wa.me/918767067884" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-colors">
                💬 Chat on WhatsApp
              </a>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
              {sent ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-bold text-xl mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">We'll get back to you within a few hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-lg mb-1">Send a Message</h3>
                  <div><label className={labelCls}>Name *</label><input className={inputCls} value={form.name} onChange={update('name')} placeholder="Your name" /></div>
                  <div><label className={labelCls}>Phone *</label><input className={inputCls} type="tel" value={form.phone} onChange={update('phone')} placeholder="98XXXXXXXX" maxLength={10} /></div>
                  <div><label className={labelCls}>Email</label><input className={inputCls} type="email" value={form.email} onChange={update('email')} placeholder="optional" /></div>
                  <div><label className={labelCls}>Message *</label><textarea className={inputCls} rows={4} value={form.message} onChange={update('message')} placeholder="How can we help?" /></div>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-colors">
                    {loading ? '⏳ Sending...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
