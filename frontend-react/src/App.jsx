import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import ProtectedRoute from './components/ui/ProtectedRoute';
import CartSidebar from './components/cart/CartSidebar';
import CheckoutModal from './components/cart/CheckoutModal';
import FloatingCartBar from './components/cart/FloatingCartBar';

// Storefront Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Subscription from './pages/Subscription';
import Account from './pages/Account';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Orders from './pages/admin/Orders';
import Subscriptions from './pages/admin/Subscriptions';
import AdminProducts from './pages/admin/Products';
import Customers from './pages/admin/Customers';
import Delivery from './pages/admin/Delivery';
import Analytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

// Product store
import { useProductStore } from './stores/productStore';
import { useCartStore } from './stores/cartStore';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

function StorefrontLayout({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <main>
        <motion.div key="page" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
          {children}
        </motion.div>
      </main>
      <FloatingCartBar onClick={() => setCartOpen(true)} isHidden={cartOpen} />
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const loadProducts = useProductStore((s) => s.load);
  const syncWithCatalog = useCartStore((s) => s.syncWithCatalog);
  const products = useProductStore((s) => s.products);
  const lenisRef = useRef(null);

  /* ── Lenis smooth scroll ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  /* ── Stop scroll during route changes ── */
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) syncWithCatalog(products);
  }, [products]);

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Toast />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ── Storefront ── */}
          <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
          <Route path="/products" element={<StorefrontLayout><Products /></StorefrontLayout>} />
          <Route path="/products/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
          <Route path="/subscription" element={<StorefrontLayout><Subscription /></StorefrontLayout>} />
          <Route path="/account" element={<StorefrontLayout><Account /></StorefrontLayout>} />
          <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
          <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />

          {/* ── Admin ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<Customers />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}
