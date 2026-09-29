import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { generateDeliveryReportPDF } from '../../utils/reportUtils.js';
import { 
  LayoutDashboard, ShoppingBag, Users, LogOut, ArrowLeft, 
  Package, CalendarDays, Truck, BarChart3, Boxes, 
  Bell, Settings, Search, Plus, Menu, X, ChevronDown, Bike,
  Briefcase, Store, ShoppingCart, Receipt, TrendingUp, Droplets, Trash2, FileBarChart, MessageCircle, Wand2, Mic, Volume2, Loader2, Sparkles, Banknote, Gift,
  PanelLeft, PanelLeftClose, ShieldOff,
  Download, WifiOff, Wifi, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { canAccess, getAdminSession, ROLE_LABELS } from '../../utils/adminAccess.js';
import { ToastHost } from '../../components/admin/Toast.jsx';
import { useToday } from '../../utils/useToday.js';
import { buildAlerts, getReadAlerts } from '../../utils/adminAlerts.js';
import { eventBus } from '../../utils/eventBus.js';
import { useInstallPrompt, useNetworkStatus } from '../../utils/usePWA.js';

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // PWA: install prompt & network status
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const { isOnline, wasOffline } = useNetworkStatus();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('adminSidebarOpen');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const synth = window.speechSynthesis;

  // The signed-in employee, saved by the login page
  const session = getAdminSession();
  const role = session?.role || 'staff';
  const adminInfo = { name: session?.name || 'Admin', role: ROLE_LABELS[role] || role };

  const { today } = useToday();
  const [searchTerm, setSearchTerm] = useState('');
  // Re-read the "read" set when alerts are marked read elsewhere
  const [, setReadTick] = useState(0);
  useEffect(() => eventBus.on('ALERTS_READ', () => setReadTick((t) => t + 1)), []);
  const readAlerts = getReadAlerts();
  const unreadCount = buildAlerts(today, role).filter((a) => !readAlerts.has(a.id)).length;

  // Setup Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  // Grouped by what the page is for; each role only sees what it can open.
  const navSections = [
    {
      title: 'Today',
      items: [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: "Today's Orders", path: '/admin/today-orders', icon: <ShoppingCart size={20} /> },
        { name: 'Live Tracking', path: '/admin/deliveries', icon: <Truck size={20} /> },
        { name: 'Alerts', path: '/admin/notifications', icon: <Bell size={20} /> },
      ]
    },
    {
      title: 'Sales',
      items: [
        { name: 'Shop POS', path: '/admin/pos', icon: <Store size={20} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Subscriptions', path: '/admin/subscriptions', icon: <CalendarDays size={20} /> },
        { name: 'Free Samples', path: '/admin/free-samples', icon: <Gift size={20} /> },
      ]
    },
    {
      title: 'Customers',
      items: [
        { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
        { name: 'Refunds', path: '/admin/refunds', icon: <Banknote size={20} /> },
      ]
    },
    {
      title: 'Stock & Purchasing',
      items: [
        { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
        { name: 'Inventory', path: '/admin/inventory', icon: <Boxes size={20} /> },
        { name: 'Purchases', path: '/admin/purchases', icon: <ShoppingCart size={20} /> },
        { name: 'Milk Procurement', path: '/admin/procurement', icon: <Droplets size={20} /> },
        { name: 'Wastage', path: '/admin/wastage', icon: <Trash2 size={20} /> },
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Revenue', path: '/admin/revenue', icon: <BarChart3 size={20} /> },
        { name: 'Profit Analytics', path: '/admin/profit', icon: <TrendingUp size={20} /> },
        { name: 'Expenses', path: '/admin/expenses', icon: <Receipt size={20} /> },
        { name: 'Reports', path: '/admin/reports', icon: <FileBarChart size={20} /> },
      ]
    },
    {
      title: 'Team & Settings',
      items: [
        { name: 'Delivery Staff', path: '/admin/delivery-boys', icon: <Bike size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ]
    }
  ]
    .map((section) => ({ ...section, items: section.items.filter((item) => canAccess(item.path, role)) }))
    .filter((section) => section.items.length > 0);

  const pageAllowed = canAccess(location.pathname, role);

  const quickAddLinks = [
    { to: '/admin/products', label: 'Add Product', icon: <Package size={16} className="mr-2"/> },
    { to: '/admin/pos', label: 'New POS Bill', icon: <Store size={16} className="mr-2"/> },
    { to: '/admin/subscriptions', label: 'Create Subscription', icon: <CalendarDays size={16} className="mr-2"/> },
    { to: '/admin/deliveries', label: 'Assign Delivery', icon: <Truck size={16} className="mr-2"/> },
  ].filter((link) => canAccess(link.to, role));

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

  useEffect(() => {
    if (localStorage.getItem('enterpriseDarkMode') === 'true') {
      document.documentElement.classList.add('dark-dashboard');
    } else {
      document.documentElement.classList.remove('dark-dashboard');
    }
    return () => {
      document.documentElement.classList.remove('dark-dashboard');
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden font-sans relative">
      
      {/* Ambient Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] bg-milquu-green/10 opacity-50"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white/85 backdrop-blur-2xl border-r border-white/60 shadow-lg transform transition-all duration-300 ease-in-out lg:relative flex flex-col ${
        mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
      } ${
        sidebarOpen 
          ? 'lg:w-72 lg:opacity-100' 
          : 'lg:w-0 lg:p-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0 pointer-events-none lg:pointer-events-auto'
      }`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 shrink-0 whitespace-nowrap overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-milquu-green to-milquu-blue rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-md shrink-0">M</div>
            <span className="text-xl font-serif font-bold text-milquu-dark tracking-tight">MilQuu Fresh</span>
          </div>
          {/* Mobile close */}
          <button onClick={toggleMobileMenu} className="lg:hidden text-gray-500 hover:text-milquu-dark transition-colors">
            <X size={24} />
          </button>
          {/* Desktop collapse button */}
          <button 
            onClick={() => {
              setSidebarOpen(false);
              try { localStorage.setItem('adminSidebarOpen', 'false'); } catch (e) {}
            }} 
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-milquu-dark hover:bg-gray-100 transition-colors"
            title="Hide Sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="mb-3">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-3 mt-3">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative z-10 ${
                      isActive
                        ? 'bg-milquu-blue/10 text-milquu-blue font-bold shadow-sm'
                        : 'text-gray-500 hover:bg-white/60 hover:text-milquu-dark'
                    }`
                  }
                >
                  {React.cloneElement(item.icon, { className: location.pathname === item.path ? 'text-milquu-blue' : 'text-gray-400 group-hover:text-milquu-blue transition-colors' })}
                  <span className="text-sm relative z-10 flex-1">{item.name}</span>
                  {item.path === '/admin/notifications' && unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">{unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 whitespace-nowrap overflow-hidden">
          {/* PWA Install Button */}
          {canInstall && (
            <button
              onClick={promptInstall}
              className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-milquu-blue hover:bg-blue-50 rounded-xl transition-all mb-1 font-medium group"
            >
              <Download size={18} className="group-hover:animate-bounce" />
              <span>Install App</span>
            </button>
          )}
          {isInstalled && (
            <div className="flex items-center space-x-3 px-3 py-2 text-xs text-green-600 mb-1">
              <CheckCircle2 size={14} />
              <span>App installed</span>
            </div>
          )}
          <NavLink to="/" className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-500 hover:bg-white hover:text-milquu-dark hover:shadow-sm rounded-xl transition-all">
            <ArrowLeft size={18} className="text-gray-400" />
            <span>Back to Store</span>
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1">
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-sm flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
          
          <div className="flex items-center">
            {/* Sidebar Toggle Button (Hide / Open on desktop, Drawer on mobile) */}
            <button 
              onClick={toggleSidebar} 
              className="mr-3 p-2 text-gray-600 hover:text-milquu-blue hover:bg-white rounded-xl transition-all border border-gray-200/80 shadow-xs flex items-center gap-1.5 group cursor-pointer"
              title={sidebarOpen ? "Hide Sidebar" : "Open Sidebar"}
            >
              <PanelLeft size={20} className={!sidebarOpen ? "text-milquu-blue" : "text-gray-500 group-hover:text-milquu-blue"} />
              <span className="hidden sm:inline text-xs font-semibold text-gray-600 group-hover:text-milquu-blue">
                {sidebarOpen ? 'Hide Menu' : 'Open Menu'}
              </span>
            </button>
            
            {/* Search Bar */}
            {canAccess('/admin/orders', role) && (
              <form onSubmit={handleSearch} role="search" className="hidden md:flex items-center bg-gray-100/80 rounded-full px-4 py-2 border border-transparent focus-within:border-milquu-blue/30 focus-within:bg-white focus-within:shadow-sm transition-all w-80">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search orders by name, phone or ID…"
                  aria-label="Search orders"
                  className="bg-transparent border-none outline-none text-sm w-full font-sans text-gray-700 placeholder-gray-400"
                />
              </form>
            )}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* PWA Install — compact header button for when sidebar is collapsed */}
            {canInstall && !sidebarOpen && (
              <button
                onClick={promptInstall}
                className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-milquu-blue to-blue-600 text-white px-3.5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
                title="Install MilQuu as desktop app"
              >
                <Download size={16} />
                <span>Install</span>
              </button>
            )}
            {/* Quick Add */}
            <div className="relative">
              <button 
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className={`${quickAddLinks.length ? 'hidden sm:flex' : 'hidden'} items-center space-x-2 bg-milquu-dark text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-md`}
              >
                <Plus size={16} />
                <span>Quick Add</span>
                <ChevronDown size={14} className={`transition-transform ${quickAddOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {quickAddOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setQuickAddOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2"
                    >
                      {quickAddLinks.map((link) => (
                        <Link key={link.to} to={link.to} onClick={() => setQuickAddOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-milquu-blue transition-colors flex items-center">{link.icon} {link.label}</Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notification */}
            <Link
              to="/admin/notifications"
              className="relative p-2 text-gray-400 hover:text-milquu-blue transition-colors rounded-full hover:bg-blue-50"
              aria-label={unreadCount ? `${unreadCount} unread alerts` : 'Alerts'}
              title={unreadCount ? `${unreadCount} unread alerts` : 'No new alerts'}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center">{unreadCount}</span>
              )}
            </Link>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-milquu-blue/10 ring-2 ring-gray-100 flex items-center justify-center text-milquu-blue font-bold text-sm">
                {adminInfo.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-milquu-dark leading-tight">{adminInfo.name}</p>
                <p className="text-xs text-gray-500 capitalize">{adminInfo.role}</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Offline / Reconnected Banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-50 border-b border-amber-200 overflow-hidden z-20"
            >
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-amber-800 font-medium">
                <WifiOff size={16} className="shrink-0" />
                <span>You're offline — showing cached data. Changes will sync when reconnected.</span>
              </div>
            </motion.div>
          )}
          {isOnline && wasOffline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-green-50 border-b border-green-200 overflow-hidden z-20"
            >
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-green-800 font-medium">
                <Wifi size={16} className="shrink-0" />
                <span>Back online — data is now up to date.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {pageAllowed ? <Outlet /> : (
            <div className="max-w-lg mx-auto mt-16 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <ShieldOff size={36} className="mx-auto text-gray-400 mb-3" />
              <h1 className="text-xl font-bold text-milquu-dark mb-1">You don’t have access to this page</h1>
              <p className="text-sm text-gray-500 mb-5">Your role ({adminInfo.role}) can’t open it. Ask an admin if you need it.</p>
              <Link to="/admin" className="inline-block bg-milquu-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">Back to dashboard</Link>
            </div>
          )}
        </div>
        <ToastHost />
      </main>
    </div>
  );
};

export default AdminLayout;
