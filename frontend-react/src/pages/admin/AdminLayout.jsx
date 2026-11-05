import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { 
  LayoutDashboard, ShoppingBag, Users, LogOut, ArrowLeft, 
  Package, CalendarDays, Truck, BarChart3, Boxes, 
  Bell, Settings, Search, Plus, Menu, X, ChevronDown, Bike,
  Store, ShoppingCart, Receipt, TrendingUp, Droplets, Trash2, 
  FileBarChart, Sparkles, Banknote, Gift, Landmark,
  PanelLeft, PanelLeftClose, CheckCircle2, RefreshCw,
  Wallet, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { canAccess, getAdminSession, ROLE_LABELS } from '../../utils/adminAccess.js';
import { ToastHost } from '../../components/admin/Toast.jsx';
import { useToday } from '../../utils/useToday.js';
import { buildAlerts, getReadAlerts } from '../../utils/adminAlerts.js';
import { eventBus } from '../../utils/eventBus.js';
import { useInstallPrompt, useNetworkStatus, useSyncQueue } from '../../utils/usePWA.js';

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const { isOnline, wasOffline } = useNetworkStatus();
  const { pendingCount, isSyncing, triggerSync } = useSyncQueue(api, isOnline);
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('adminSidebarOpen');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  const session = getAdminSession();
  const role = session?.role || 'staff';
  const adminInfo = { name: session?.name || 'Admin', role: ROLE_LABELS[role] || role };

  const { today } = useToday();
  const [searchTerm, setSearchTerm] = useState('');
  const [, setReadTick] = useState(0);
  useEffect(() => eventBus.on('ALERTS_READ', () => setReadTick((t) => t + 1)), []);
  const readAlerts = getReadAlerts();
  const unreadCount = buildAlerts(today, role).filter((a) => !readAlerts.has(a.id)).length;

  // Ultra-Clean 2-Wing Architecture:
  // 1. Shop POS & Khata (Counter, Credit, Financier, Milk Procurement)
  // 2. Website & Deliveries (Online, COD, Subscriptions, Riders)
  const navSections = [
    {
      title: 'Command Center',
      hindi: 'मुख्य डैशबोर्ड',
      items: [
        { name: 'Unified Dashboard', path: '/admin', icon: <LayoutDashboard size={18} />, badge: 'All' },
        { name: 'MilQuu AI Assistant', path: '/chatbot', icon: <Sparkles size={18} className="text-violet-500" />, badge: 'AI' }
      ]
    },
    {
      title: '🏪 Shop POS & Khata',
      hindi: 'काउंटर, उधारी व फाइनेंस',
      items: [
        { name: 'Shop POS Counter', path: '/admin/pos', icon: <Store size={18} className="text-emerald-600" />, badge: 'Counter' },
        { name: 'Customer Credit (Khata)', path: '/admin/customers', icon: <Users size={18} className="text-amber-600" />, badge: 'उधारी' },
        { name: 'Financier Khata', path: '/admin/financiers', icon: <Landmark size={18} className="text-indigo-600" />, badge: 'Finance' },
        { name: 'Milk Procurement', path: '/admin/procurement', icon: <Droplets size={18} className="text-blue-500" />, badge: 'Milk' },
        { name: 'Purchases & Vendors', path: '/admin/purchases', icon: <ShoppingCart size={18} />, badge: null }
      ]
    },
    {
      title: '🌐 Website & Deliveries',
      hindi: 'ऑनलाइन स्टोर व डिलीवरी',
      items: [
        { name: 'Online Orders & COD', path: '/admin/orders', icon: <ShoppingBag size={18} className="text-blue-600" />, badge: 'COD' },
        { name: 'Daily Subscriptions', path: '/admin/subscriptions', icon: <CalendarDays size={18} className="text-amber-600" />, badge: null },
        { name: 'Delivery Boys & Fleet', path: '/admin/delivery-boys', icon: <Bike size={18} />, badge: 'Riders' },
        { name: 'Live Route Tracking', path: '/admin/deliveries', icon: <Truck size={18} />, badge: 'Live' },
        { name: "Today's Dispatch", path: '/admin/today-orders', icon: <CheckCircle2 size={18} className="text-emerald-600" />, badge: null }
      ]
    },
    {
      title: '📦 Stock & Accounts',
      hindi: 'स्टॉक व हिसाब-किताब',
      items: [
        { name: 'Products & Inventory', path: '/admin/products', icon: <Package size={18} />, badge: null },
        { name: 'Revenue & Profit (P&L)', path: '/admin/revenue', icon: <BarChart3 size={18} />, badge: null },
        { name: 'Expenses', path: '/admin/expenses', icon: <Receipt size={18} />, badge: null },
        { name: 'Financial Reports', path: '/admin/reports', icon: <FileBarChart size={18} />, badge: null }
      ]
    }
  ]
    .map((section) => ({ ...section, items: section.items.filter((item) => canAccess(item.path, role)) }))
    .filter((section) => section.items.length > 0);

  const bottomUtilities = [
    { name: 'Alerts', path: '/admin/notifications', icon: <Bell size={18} />, count: unreadCount },
    { name: 'Recycle Bin', path: '/admin/recycle-bin', icon: <Trash2 size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> }
  ].filter((item) => canAccess(item.path, role));

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    navigate(`/admin/orders?search=${encodeURIComponent(term)}`);
    setSearchTerm('');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => {
        const next = !prev;
        try {
          localStorage.setItem('adminSidebarOpen', String(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/70 overflow-hidden font-sans relative text-slate-800">
      <ToastHost />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION                                                       */}
      {/* ========================================================================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200/80 shadow-xs flex flex-col transition-all duration-300 ease-in-out lg:relative ${
        mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
      } ${
        sidebarOpen 
          ? 'lg:w-68 xl:w-72 lg:opacity-100' 
          : 'lg:w-0 lg:p-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0 pointer-events-none lg:pointer-events-auto'
      }`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <span className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                MilQuu <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">ERP 2.0</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Shop POS & Website Hub</p>
            </div>
          </Link>

          <button 
            onClick={toggleSidebar} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Scrollable Nav Sections */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-4 hide-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{section.title}</span>
                <span className="text-[10px] text-slate-400 font-medium normal-case">{section.hindi}</span>
              </div>

              {section.items.map((item) => {
                const isActive = item.path === '/admin' 
                  ? location.pathname === '/admin' 
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.name}</span>

                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'Live' ? 'bg-rose-100 text-rose-700 animate-pulse' :
                            item.badge === 'Counter' ? 'bg-emerald-100 text-emerald-800' :
                            item.badge === 'COD' ? 'bg-blue-100 text-blue-800' :
                            item.badge === 'उधारी' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Utility Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0 space-y-1">
          {bottomUtilities.map((util) => {
            const isActive = location.pathname.startsWith(util.path);
            return (
              <NavLink
                key={util.path}
                to={util.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70 font-bold' : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-slate-800' : 'text-slate-400'}>{util.icon}</span>
                  <span>{util.name}</span>
                </div>
                {util.count > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {util.count}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 px-1">
            <Link
              to="/"
              className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT                                                             */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 shadow-2xs flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar} 
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/80 cursor-pointer"
              title={sidebarOpen ? "Hide Sidebar" : "Open Sidebar"}
            >
              <PanelLeft size={18} className={!sidebarOpen ? "text-emerald-700" : "text-slate-600"} />
            </button>

            {/* Quick Channel Jumpers */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/admin/pos"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Shop POS Counter"
              >
                <Store size={14} className="text-emerald-700" />
                <span>🏪 Shop Counter</span>
              </Link>
              <Link
                to="/admin/orders"
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Website Orders & COD"
              >
                <ShoppingBag size={14} className="text-blue-600" />
                <span>🌐 Web & COD</span>
              </Link>
              <Link
                to="/admin/financiers"
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Financier Khata"
              >
                <Landmark size={14} className="text-indigo-600" />
                <span>🏛️ Financier</span>
              </Link>
            </div>
          </div>

          {/* Right Header: Search, Connectivity, Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {canAccess('/admin/orders', role) && (
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search orders, phone, ID..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 w-44 lg:w-56 transition-all"
                />
              </form>
            )}

            {!isOnline && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Offline
              </span>
            )}
            {pendingCount > 0 && (
              <button 
                onClick={triggerSync}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                title="Click to sync offline actions"
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                <span>{pendingCount} Pending</span>
              </button>
            )}

            <Link
              to="/admin/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Alerts"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                {adminInfo.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{adminInfo.name}</p>
                <p className="text-[10px] text-slate-400 font-medium capitalize">{adminInfo.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 pb-20 lg:pb-8">
          <Outlet />
        </div>

        {/* Mobile Sticky Bottom Bar (Simple & Intuitive) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around z-30 px-2 shadow-lg">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `flex flex-col items-center justify-center text-[10px] font-bold ${
              isActive ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>
          <NavLink
            to="/admin/pos"
            className={({ isActive }) => `flex flex-col items-center justify-center text-[10px] font-bold ${
              isActive ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <Store size={18} />
            <span>Shop POS</span>
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `flex flex-col items-center justify-center text-[10px] font-bold ${
              isActive ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Web & COD</span>
          </NavLink>
          <NavLink
            to="/admin/financiers"
            className={({ isActive }) => `flex flex-col items-center justify-center text-[10px] font-bold ${
              isActive ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <Landmark size={18} />
            <span>Financier</span>
          </NavLink>
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-500"
          >
            <Menu size={18} />
            <span>Menu</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
