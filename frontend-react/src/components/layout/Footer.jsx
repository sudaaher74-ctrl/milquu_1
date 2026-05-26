import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #050d1a 0%, #071426 100%)', borderTop: '1px solid rgba(200,169,126,0.08)' }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(200,169,126,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(200,169,126,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand col — spans 2 */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-serif font-bold text-3xl tracking-tight" style={{ color: '#C8A97E' }}>
                Milqu <span className="text-white">Fresh</span>
              </span>
            </Link>
            <p className="text-white/35 text-sm font-sans leading-relaxed mb-8 max-w-xs">
              Farm-to-doorstep dairy, vegetables and fruits — delivered pure, fresh, and ethically sourced to your home across Navi Mumbai.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mb-8">
              {[
                { icon: '📸', label: 'Instagram', href: '#' },
                { icon: '📘', label: 'Facebook', href: '#' },
                { icon: '🐦', label: 'Twitter', href: '#' },
                { icon: '▶️', label: 'YouTube', href: '#' },
              ].map(s => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  whileHover={{ scale: 1.1, borderColor: 'rgba(200,169,126,0.4)', backgroundColor: 'rgba(200,169,126,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
            <motion.a
              href="https://wa.me/918767067884?text=Hi! I'd like to know more about Milqu Fresh delivery."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-xs font-bold tracking-widest uppercase"
              style={{ background: 'linear-gradient(135deg, #C8A97E, #e8c99e)', color: '#071426' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              💬 WhatsApp Us
            </motion.a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: '#C8A97E' }}>Quick Links</h4>
            <ul className="space-y-3.5">
              {[['/', 'Home'], ['/products', 'Products'], ['/subscription', 'Subscriptions'], ['/about', 'About Us'], ['/contact', 'Contact'], ['/account', 'My Orders']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/40 hover:text-white text-sm font-sans transition-colors hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: '#C8A97E' }}>Products</h4>
            <ul className="space-y-3.5">
              {[['Cow Milk', 'milk'], ['Buffalo Milk', 'milk'], ['A2 Organic Milk', 'milk'], ['Fresh Vegetables', 'vegetables'], ['Seasonal Fruits', 'fruits'], ['Ghee & Paneer', 'dairy']].map(([label, filter]) => (
                <li key={label}>
                  <Link to={`/products?cat=${filter}`} className="text-white/40 hover:text-white text-sm font-sans transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: '#C8A97E' }}>Contact</h4>
            <ul className="space-y-3.5 mb-8">
              {[
                { icon: '📞', text: '+91 87670 67884', href: 'tel:+918767067884' },
                { icon: '📍', text: 'Navi Mumbai, Maharashtra' },
                { icon: '⏰', text: 'Delivery by 7 AM daily' },
                { icon: '✉️', text: 'hello@milqufresh.in', href: 'mailto:hello@milqufresh.in' },
              ].map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-white/40 text-sm font-sans">
                  <span className="text-base mt-0.5">{c.icon}</span>
                  {c.href ? <a href={c.href} className="hover:text-white transition-colors">{c.text}</a> : <span>{c.text}</span>}
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#C8A97E' }}>Newsletter</h4>
            {subscribed ? (
              <p className="text-emerald-400 text-xs font-bold">✓ You're subscribed!</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="premium-input text-sm"
                  required
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
                  style={{ background: 'rgba(200,169,126,0.12)', color: '#C8A97E', border: '1px solid rgba(200,169,126,0.2)' }}
                >
                  Subscribe →
                </motion.button>
              </form>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Bottom strip */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-[11px] font-sans tracking-wide">
            © {new Date().getFullYear()} Milquu Fresh. All rights reserved. · Navi Mumbai, India
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'FSSAI Certified'].map(l => (
              <span key={l} className="text-white/20 text-[11px] font-sans hover:text-white/50 cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
