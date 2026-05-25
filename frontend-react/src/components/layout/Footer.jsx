import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[var(--color-navy)] border-t border-[var(--color-gold)]/10 text-[var(--color-cream)]/70">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <span className="font-serif font-bold text-2xl text-[var(--color-gold)] tracking-tight">Milqu Fresh</span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-cream)]/50 max-w-xs font-sans">
            Farm-fresh dairy, vegetables and fruits delivered to your doorstep every morning across Navi Mumbai.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <a href="https://wa.me/918767067884" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-[var(--color-navy)] text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full transition-colors shadow-lg">
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[var(--color-gold)] font-bold text-xs uppercase tracking-widest mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm font-sans">
            {[['/', 'Home'], ['/products', 'Products'], ['/subscription', 'Subscribe'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-[var(--color-gold)] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[var(--color-gold)] font-bold text-xs uppercase tracking-widest mb-6">Contact</h4>
          <ul className="space-y-4 text-sm text-[var(--color-cream)]/50 font-sans">
            <li>📞 +91 8767067884</li>
            <li>📍 Navi Mumbai, Maharashtra</li>
            <li>⏰ Delivery by 7 AM daily</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-[var(--color-cream)]/30 font-sans tracking-wide">
        © {new Date().getFullYear()} Milquu Fresh. All rights reserved.
      </div>
    </footer>
  );
}
