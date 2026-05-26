import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore';

const NAV_LINKS = [
  { label: 'HOME', to: '/' },
  { label: 'PRODUCTS', to: '/products' },
  { label: 'ABOUT US', to: '/about' },
  { label: 'SUBSCRIPTIONS', to: '/subscription' },
  { label: 'CONTACT', to: '/contact' },
  { label: 'MY ORDERS', to: '/account' },
];

export default function Navbar({ onCartOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const navigate = useNavigate();
  const location = useLocation();

  if (typeof window !== 'undefined') {
    window.onscroll = () => setScrolled(window.scrollY > 20);
  }

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;
  const navBgClass = isTransparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm';
  const logoTextClass = isTransparent ? 'text-white' : 'text-[var(--color-navy)]';
  const linkTextClass = isTransparent ? 'text-white/90 hover:text-white' : 'text-[var(--color-navy)] hover:text-[var(--color-gold)]';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className={`font-serif font-bold text-2xl tracking-tight transition-colors ${logoTextClass}`}>
                Milqu Fresh
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className={`text-xs font-bold tracking-widest transition-colors border-b-2 border-transparent hover:border-[var(--color-gold)] pb-1 ${linkTextClass}`}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onCartOpen}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                aria-label="Open cart"
              >
                <span className={`text-xl ${isTransparent ? 'opacity-90' : ''}`}>🛒</span>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden flex flex-col gap-1.5 p-2 rounded-md ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                aria-label="Toggle menu"
              >
                <span className={`w-5 h-0.5 transition-all ${isTransparent ? 'bg-white' : 'bg-gray-700'} ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-5 h-0.5 transition-all ${isTransparent ? 'bg-white' : 'bg-gray-700'} ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`w-5 h-0.5 transition-all ${isTransparent ? 'bg-white' : 'bg-gray-700'} ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <button
                onClick={() => { onCartOpen(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold tracking-wider text-[var(--color-navy)] bg-[var(--color-gold)] rounded-xl"
              >
                🛒 View Cart ({totalItems})
              </button>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
