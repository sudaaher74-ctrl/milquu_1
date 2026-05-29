import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import CategoryListing from './pages/CategoryListing';
import ContactUs from './pages/ContactUs';
import Subscription from './pages/Subscription';
import Cart from './pages/Cart';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Orders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';

import AdminProducts from './pages/admin/AdminProducts';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import Deliveries from './pages/admin/Deliveries';
import Revenue from './pages/admin/Revenue';
import Inventory from './pages/admin/Inventory';
import Notifications from './pages/admin/Notifications';
import Settings from './pages/admin/Settings';
import WhatsAppSettings from './pages/admin/WhatsAppSettings';
import DeliveryBoys from './pages/admin/DeliveryBoys';
import BusinessOverview from './pages/admin/BusinessOverview';
import POS from './pages/admin/POS';
import Purchases from './pages/admin/Purchases';
import Expenses from './pages/admin/Expenses';
import ProfitAnalytics from './pages/admin/ProfitAnalytics';
import Procurement from './pages/admin/Procurement';
import Wastage from './pages/admin/Wastage';
import Reports from './pages/admin/Reports';

import DeliveryLayout from './pages/delivery/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryLogin from './pages/delivery/DeliveryLogin';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';

// Helper to scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isDelivery = location.pathname.startsWith('/delivery');
  const showNavAndFooter = !isAdmin && !isDelivery;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {showNavAndFooter && <Navbar />}
      <ScrollToTop />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<CategoryListing />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/subscribe" element={<Subscription />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="delivery-boys" element={<DeliveryBoys />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="inventory" element={<Inventory />} />
            
            {/* New ERP Modules */}
            <Route path="business-overview" element={<BusinessOverview />} />
            <Route path="pos" element={<POS />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="profit" element={<ProfitAnalytics />} />
            <Route path="procurement" element={<Procurement />} />
            <Route path="wastage" element={<Wastage />} />
            <Route path="reports" element={<Reports />} />

            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="whatsapp-settings" element={<WhatsAppSettings />} />
          </Route>
          {/* Delivery Boy Portal Routes */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery" element={
            <ProtectedRoute allowedRole="delivery">
              <DeliveryLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DeliveryDashboard />} />
            <Route path="map" element={<div className="p-8 text-center text-gray-500">Live Map View (Coming Soon)</div>} />
            <Route path="profile" element={<div className="p-8 text-center text-gray-500">Profile View (Coming Soon)</div>} />
          </Route>
        </Routes>
      </main>

      {showNavAndFooter && <Footer />}
    </div>
  );
}

export default App;
