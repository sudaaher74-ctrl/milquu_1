import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import ProtectedRoute from './components/ui/ProtectedRoute';
import CartSidebar from './components/cart/CartSidebar';
import CheckoutModal from './components/cart/CheckoutModal';

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
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const loadProducts = useProductStore((s) => s.load);
  const syncWithCatalog = useCartStore((s) => s.syncWithCatalog);
  const products = useProductStore((s) => s.products);

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
