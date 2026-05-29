import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, LogOut, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const navItems = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xl font-serif font-bold text-milquu-dark">Milquu Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-milquu-green text-white font-medium shadow-md shadow-milquu-green/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-milquu-dark'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavLink to="/" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-milquu-dark rounded-lg transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Site</span>
          </NavLink>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between">
           <span className="text-xl font-serif font-bold text-milquu-dark">Milquu Admin</span>
           <NavLink to="/" className="text-gray-500"><ArrowLeft size={24} /></NavLink>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#FDFBF7]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
