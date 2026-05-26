import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore';

const NAV_LINKS = [
  { label: 'HOME', to: '/' },
  { label: 'PRODUCTS', to: '/products' },
  { label: 'SUBSCRIPTIONS', to: '/subscription' },
  { label: 'CONTACT', to: '/contact' },
  { label: 'ABOUT US', to: '/about' },
  { label: 'MY ORDERS', to: '/account' },
];

export default function Navbar({ onCartOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        initial={false}
        animate={{
          backgroundColor: isTransparent ? 'rgba(11,25,44,0)' : 'rgba(11,25,44,0.75)',
          borderBottomColor: isTransparent ? 'rgba(255,255,255,0)' : 'rgba(200,169,126,0.12)',
          backdropFilter: isTransparent ? 'blur(0px)' : 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: isTransparent ? 'blur(0px)' : 'blur(20px) saturate(1.5)',
          boxShadow: isTransparent ? 'none' : '0 1px 40px rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ borderBottom: '1px solid' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.span
                className="font-serif font-bold text-xl tracking-tight text-white"
                whileHover={{ opacity: 0.85 }}
                transition={{ duration: 0.2 }}
              >
                Milqu{' '}
                <span style={{ color: '#C8A97E' }}>Fresh</span>
              </motion.span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map((l) => {
                const isActive = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="relative text-[10px] font-bold tracking-widest transition-colors group"
                    style={{ color: isActive ? '#C8A97E' : 'rgba(255,255,255,0.7)' }}
                  >
                    <span className="group-hover:text-white transition-colors" style={{ color: 'inherit' }}>
                      {l.label}
                    </span>
                    {/* Animated underline */}
                    <motion.div
                      className="absolute -bottom-0.5 left-0 h-px rounded-full"
                      style={{ background: '#C8A97E' }}
                      initial={{ width: isActive ? '100%' : '0%' }}
                      animate={{ width: isActive ? '100%' : '0%' }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <motion.button
                onClick={onCartOpen}
                className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-white/10"
                aria-label="Open cart"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg text-white/80">🛒</span>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-0.5 -right-0.5 text-[#0B192C] text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#C8A97E', minWidth: '18px', height: '18px', padding: '0 4px' }}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Subscribe CTA — desktop only */}
              <motion.button
                onClick={() => navigate('/subscription')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="hidden lg:inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full transition-all ml-1"
                style={{
                  background: 'linear-gradient(135deg, #C8A97E, #e8c99e)',
                  color: '#0B192C',
                }}
              >
                Subscribe Now
              </motion.button>

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex flex-col justify-center gap-[5px] w-10 h-10 p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <motion.span
                  className="block w-5 h-0.5 bg-white rounded-full origin-center"
                  animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block w-5 h-0.5 bg-white rounded-full"
                  animate={{ opacity: mobileOpen ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="block w-5 h-0.5 bg-white rounded-full origin-center"
                  animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-16 left-0 right-0 z-40 lg:hidden"
            style={{
              background: 'rgba(11,25,44,0.96)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(200,169,126,0.15)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-1">
              <button
                onClick={() => { onCartOpen(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-wider rounded-xl mb-2"
                style={{ background: 'rgba(200,169,126,0.15)', color: '#C8A97E', border: '1px solid rgba(200,169,126,0.2)' }}
              >
                🛒 View Cart ({totalItems})
              </button>
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-xs font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors uppercase"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 pt-3 border-t border-white/8">
                <button
                  onClick={() => { navigate('/subscription'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-full text-xs font-bold tracking-widest uppercase text-[#0B192C]"
                  style={{ background: 'linear-gradient(135deg, #C8A97E, #e8c99e)' }}
                >
                  Subscribe Now →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
