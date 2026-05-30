import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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

// Error Boundary for ChunkLoadErrors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught error:", error, errorInfo);
    if (error.name === 'ChunkLoadError' || error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col px-4 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6 max-w-md">We encountered an unexpected error loading this page. Please refresh to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-milquu-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isDelivery = location.pathname.startsWith('/delivery');

  return (
    <div className="font-sans">
      <ScrollToTop />
      {!isAdmin && !isDelivery && <Navbar />}
      
      <ErrorBoundary>
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
            
            {/* Admin Routes - wrap AdminLayout so all /admin/* paths work */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="dashboard" element={<Overview />} />
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
              <Route path="*" element={<Navigate to="/admin" replace />} />
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

            {/* Global Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {!isAdmin && !isDelivery && <Footer />}
    </div>
  );
}

export default App;
