import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Lazy load all pages to improve mobile load speed significantly
const Home = lazy(() => import('./pages/Home'));
const CategoryListing = lazy(() => import('./pages/CategoryListing'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyAccount = lazy(() => import('./pages/MyAccount'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminSubscriptions = lazy(() => import('./pages/admin/AdminSubscriptions'));
const Deliveries = lazy(() => import('./pages/admin/Deliveries'));
const Revenue = lazy(() => import('./pages/admin/Revenue'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const Notifications = lazy(() => import('./pages/admin/Notifications'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const DeliveryBoys = lazy(() => import('./pages/admin/DeliveryBoys'));
const BusinessOverview = lazy(() => import('./pages/admin/BusinessOverview'));
const POS = lazy(() => import('./pages/admin/POS'));
const Purchases = lazy(() => import('./pages/admin/Purchases'));
const Expenses = lazy(() => import('./pages/admin/Expenses'));
const ProfitAnalytics = lazy(() => import('./pages/admin/ProfitAnalytics'));
const Procurement = lazy(() => import('./pages/admin/Procurement'));
const Wastage = lazy(() => import('./pages/admin/Wastage'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

// Delivery Pages
const DeliveryLayout = lazy(() => import('./pages/delivery/DeliveryLayout'));
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard'));
const DeliveryLogin = lazy(() => import('./pages/delivery/DeliveryLogin'));

import ProtectedRoute from './components/auth/ProtectedRoute';

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-milquu-blue mb-4"></div>
      <p className="text-gray-500 font-medium">Loading Milquu Fresh...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<CategoryListing />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/subscribe" element={<Subscription />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Customer Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<MyAccount />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="business-overview" element={<BusinessOverview />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="delivery-boys" element={<DeliveryBoys />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="pos" element={<POS />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="profit" element={<ProfitAnalytics />} />
              <Route path="procurement" element={<Procurement />} />
              <Route path="wastage" element={<Wastage />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
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
        </Suspense>
      </main>

      {showNavAndFooter && <Footer />}
    </div>
  );
}

export default App;
