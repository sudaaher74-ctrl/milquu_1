import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Map, List, User, Bell, LogOut } from 'lucide-react';

const DeliveryLayout = () => {
  const [staff, setStaff] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedStaff = localStorage.getItem('deliveryStaff');
    if (!savedStaff) {
      navigate('/delivery/login');
    } else {
      setStaff(JSON.parse(savedStaff));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('deliveryStaff');
    navigate('/delivery/login');
  };

  if (!staff) return null; // Wait for redirect or load

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      
      {/* Top Header */}
      <header className="bg-white px-4 py-4 shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-milquu-blue overflow-hidden shadow-sm">
            <img src={staff.image || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-milquu-dark leading-tight">{staff.name}</h1>
            <p className="text-xs font-medium text-milquu-blue">Area: {staff.area}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="relative p-2 text-gray-400 hover:text-milquu-dark transition-colors bg-gray-50 rounded-full">
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-600 transition-colors bg-red-50 rounded-full" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      
      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-safe z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <NavLink 
          to="/delivery" 
          end
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-milquu-blue' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <List size={22} />
          <span className="text-[10px] font-semibold tracking-wide">Tasks</span>
        </NavLink>

        <NavLink 
          to="/delivery/map" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-milquu-blue' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Map size={22} />
          <span className="text-[10px] font-semibold tracking-wide">Map</span>
        </NavLink>

        <NavLink 
          to="/delivery/profile" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-milquu-blue' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <User size={22} />
          <span className="text-[10px] font-semibold tracking-wide">Profile</span>
        </NavLink>
      </nav>
      
    </div>
  );
};

export default DeliveryLayout;
