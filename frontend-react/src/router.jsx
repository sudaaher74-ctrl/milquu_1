import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load all pages to improve mobile load speed significantly
const Home = lazy(() => import('./pages/Home'));
const CategoryListing = lazy(() => import('./pages/CategoryListing'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyAccount = lazy(() => import('./pages/MyAccount'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const FreeSampleCampaign = lazy(() => import('./pages/FreeSampleCampaign'));

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
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const BusinessOverview = lazy(() => import('./pages/admin/BusinessOverview'));
const POS = lazy(() => import('./pages/admin/POS'));
const Purchases = lazy(() => import('./pages/admin/Purchases'));
const Expenses = lazy(() => import('./pages/admin/Expenses'));
const ProfitAnalytics = lazy(() => import('./pages/admin/ProfitAnalytics'));
const Procurement = lazy(() => import('./pages/admin/Procurement'));
const Wastage = lazy(() => import('./pages/admin/Wastage'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const SEOGenerator = lazy(() => import('./pages/admin/SEOGenerator'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const TodayOrderList = lazy(() => import('./pages/admin/TodayOrderList'));
const FreeSamples = lazy(() => import('./pages/admin/FreeSamples'));

// Chatbot Pages
const AIChatDashboard = lazy(() => import('./pages/chatbot/AIChatDashboard'));
const ChatbotLogin = lazy(() => import('./pages/chatbot/ChatbotLogin'));

// SEO & Content Pages
const AboutUs = lazy(() => import('./pages/seo/AboutUs'));
const OurFarm = lazy(() => import('./pages/seo/OurFarm'));
const OurProcess = lazy(() => import('./pages/seo/OurProcess'));
const QualityAssurance = lazy(() => import('./pages/seo/QualityAssurance'));
const ProductPage = lazy(() => import('./pages/seo/ProductPage'));

// Blog Pages
const BlogIndex = lazy(() => import('./pages/blog/BlogIndex'));
const BlogPost = lazy(() => import('./pages/blog/BlogPost'));

// System Pages
const OfflineFallback = lazy(() => import('./pages/OfflineFallback'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Location Landing Pages
const MilkDeliveryPanvel = lazy(() => import('./pages/seo/MilkDeliveryPanvel'));
const MilkDeliveryNewPanvel = lazy(() => import('./pages/seo/MilkDeliveryNewPanvel'));
const MilkDeliveryKaranjade = lazy(() => import('./pages/seo/MilkDeliveryKaranjade'));
const OrganicMilkKharghar = lazy(() => import('./pages/seo/OrganicMilkKharghar'));
const FreshCowMilkBelapur = lazy(() => import('./pages/seo/FreshCowMilkBelapur'));
const FarmFreshMilkNerul = lazy(() => import('./pages/seo/FarmFreshMilkNerul'));
const MilkDeliveryNaviMumbai = lazy(() => import('./pages/seo/MilkDeliveryNaviMumbai'));

// Delivery Pages
const DeliveryLayout = lazy(() => import('./pages/delivery/DeliveryLayout'));
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard'));
const DeliveryLogin = lazy(() => import('./pages/delivery/DeliveryLogin'));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <CategoryListing /> },
      { path: "contact", element: <ContactUs /> },
      { path: "subscribe", element: <Subscription /> },
      { path: "cart", element: <Cart /> },
      { path: "refund-policy", element: <RefundPolicy /> },
      { path: "free-sample", element: <FreeSampleCampaign /> },
      
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "account", element: <MyAccount /> },
      
      { path: "about-us", element: <AboutUs /> },
      { path: "our-farm", element: <OurFarm /> },
      { path: "our-process", element: <OurProcess /> },
      { path: "quality-assurance", element: <QualityAssurance /> },
      
      { path: "blog", element: <BlogIndex /> },
      { path: "blog/:slug", element: <BlogPost /> },
      { path: "product/:slug", element: <ProductPage /> },
      
      { path: "offline", element: <OfflineFallback /> },
      
      { path: "milk-delivery-panvel", element: <MilkDeliveryPanvel /> },
      { path: "milk-delivery-new-panvel", element: <MilkDeliveryNewPanvel /> },
      { path: "milk-delivery-karanjade", element: <MilkDeliveryKaranjade /> },
      { path: "organic-milk-kharghar", element: <OrganicMilkKharghar /> },
      { path: "fresh-cow-milk-belapur", element: <FreshCowMilkBelapur /> },
      { path: "farm-fresh-milk-nerul", element: <FarmFreshMilkNerul /> },
      { path: "milk-delivery-navi-mumbai", element: <MilkDeliveryNaviMumbai /> },
      
      { path: "admin/login", element: <AdminLogin /> },
      {
        path: "admin",
        element: <ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Overview /> },
          { path: "dashboard", element: <Overview /> },
          { path: "business-overview", element: <BusinessOverview /> },
          { path: "orders", element: <Orders /> },
          { path: "customers", element: <Customers /> },
          { path: "products", element: <AdminProducts /> },
          { path: "subscriptions", element: <AdminSubscriptions /> },
          { path: "deliveries", element: <Deliveries /> },
          { path: "delivery-boys", element: <DeliveryBoys /> },
          { path: "refunds", element: <AdminWithdrawals /> },
          { path: "revenue", element: <Revenue /> },
          { path: "inventory", element: <Inventory /> },
          { path: "pos", element: <POS /> },
          { path: "purchases", element: <Purchases /> },
          { path: "expenses", element: <Expenses /> },
          { path: "profit", element: <ProfitAnalytics /> },
          { path: "procurement", element: <Procurement /> },
          { path: "wastage", element: <Wastage /> },
          { path: "reports", element: <Reports /> },
          { path: "free-samples", element: <FreeSamples /> },
          { path: "seo-tools", element: <SEOGenerator /> },
          { path: "today-orders", element: <TodayOrderList /> },
          { path: "notifications", element: <Notifications /> },
          { path: "settings", element: <Settings /> },
          { path: "*", element: <Navigate to="/admin" replace /> }
        ]
      },

      { path: "delivery/login", element: <DeliveryLogin /> },
      {
        path: "delivery",
        element: <ProtectedRoute allowedRole="delivery"><DeliveryLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <DeliveryDashboard /> },
          { path: "map", element: <div className="p-8 text-center text-gray-500">Live Map View (Coming Soon)</div> }
        ]
      },

      { path: "chatbot/login", element: <ChatbotLogin /> },
      {
        path: "chatbot",
        element: <ProtectedRoute allowedRole="chatbot"><AIChatDashboard /></ProtectedRoute>
      },

      { path: "*", element: <NotFound /> }
    ]
  }
]);
