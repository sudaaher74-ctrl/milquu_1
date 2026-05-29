import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Users, LogOut, ArrowLeft, 
  Package, CalendarDays, Truck, BarChart3, Boxes, 
  Bell, Settings, Search, Plus, Menu, X, ChevronDown, Bike,
  Briefcase, Store, ShoppingCart, Receipt, TrendingUp, Droplets, Trash2, FileBarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: <CalendarDays size={20} /> },
    { name: 'Live Tracking', path: '/admin/deliveries', icon: <Truck size={20} /> },
    { name: 'Delivery Staff', path: '/admin/delivery-boys', icon: <Bike size={20} /> },
    { name: 'Revenue', path: '/admin/revenue', icon: <BarChart3 size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <Boxes size={20} /> },
    
    // New ERP Modules
    { name: 'Business Overview', path: '/admin/business-overview', icon: <Briefcase size={20} /> },
    { name: 'Shop POS', path: '/admin/pos', icon: <Store size={20} /> },
    { name: 'Purchases', path: '/admin/purchases', icon: <ShoppingCart size={20} /> },
    { name: 'Expenses', path: '/admin/expenses', icon: <Receipt size={20} /> },
    { name: 'Profit Analytics', path: '/admin/profit', icon: <TrendingUp size={20} /> },
    { name: 'Milk Procurement', path: '/admin/procurement', icon: <Droplets size={20} /> },
    { name: 'Wastage', path: '/admin/wastage', icon: <Trash2 size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileBarChart size={20} /> },

    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex h-screen bg-milquu-gray overflow-hidden font-sans">
      
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-milquu-green to-milquu-blue rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">M</div>
            <span className="text-xl font-serif font-bold text-milquu-dark tracking-tight">MilQuu Fresh</span>
          </div>
          <button onClick={toggleMobileMenu} className="lg:hidden text-gray-500 hover:text-milquu-dark transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3 mt-2">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-milquu-blue text-white font-medium shadow-lg shadow-milquu-blue/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-milquu-dark'
                }`
              }
            >
              <div className={({ isActive }) => isActive ? 'text-white' : 'text-gray-400 group-hover:text-milquu-blue transition-colors'}>
                {React.cloneElement(item.icon, { className: location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin') ? 'text-white' : 'text-gray-400 group-hover:text-milquu-blue transition-colors' })}
              </div>
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <NavLink to="/" className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-500 hover:bg-white hover:text-milquu-dark hover:shadow-sm rounded-xl transition-all">
            <ArrowLeft size={18} className="text-gray-400" />
            <span>Back to Store</span>
          </NavLink>
          <button className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1">
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
          
          <div className="flex items-center">
            <button onClick={toggleMobileMenu} className="mr-4 lg:hidden text-gray-500 hover:text-milquu-dark transition-colors">
              <Menu size={24} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100/80 rounded-full px-4 py-2 border border-transparent focus-within:border-milquu-blue/30 focus-within:bg-white focus-within:shadow-sm transition-all w-80">
              <Search size={18} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search orders, customers, products..." 
                className="bg-transparent border-none outline-none text-sm w-full font-sans text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Quick Add */}
            <div className="relative">
              <button 
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className="hidden sm:flex items-center space-x-2 bg-milquu-dark text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-md"
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
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-milquu-blue transition-colors flex items-center"><Package size={16} className="mr-2"/> Add Product</button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-milquu-blue transition-colors flex items-center"><Users size={16} className="mr-2"/> Add Customer</button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-milquu-blue transition-colors flex items-center"><CalendarDays size={16} className="mr-2"/> Create Subscription</button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-milquu-blue transition-colors flex items-center"><Truck size={16} className="mr-2"/> Assign Delivery</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notification */}
            <button className="relative p-2 text-gray-400 hover:text-milquu-blue transition-colors rounded-full hover:bg-blue-50">
              <Bell size={22} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-gray-200">
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100" />
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-milquu-dark leading-tight">Admin User</p>
                <p className="text-xs text-gray-500">Superadmin</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
