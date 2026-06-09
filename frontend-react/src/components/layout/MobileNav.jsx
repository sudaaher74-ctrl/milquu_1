import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNav = () => {
  const location = useLocation();
  const [hasUpdates, setHasUpdates] = useState({
    subscription: true, // Demo update badge
    profile: false
  });

  // Nav Items
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      route: '/'
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      route: '/products'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: Calendar,
      route: '/subscribe'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      route: '/account'
    }
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[20px] px-4"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
      }}
    >
      <div className="flex justify-between items-center h-[70px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.route}
              className="relative flex flex-col items-center justify-center w-full h-full"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-milquu-blue/5 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              
              <div className="relative flex flex-col items-center justify-center z-10">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`p-1.5 rounded-full ${isActive ? 'text-milquu-blue' : 'text-gray-400'}`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Notification Badge */}
                  {((item.id === 'subscription' && hasUpdates.subscription) || 
                    (item.id === 'profile' && hasUpdates.profile)) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  )}
                </motion.div>
                
                <span 
                  className={`text-[10px] font-medium mt-0.5 transition-colors duration-200 ${
                    isActive ? 'text-milquu-blue font-semibold' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
