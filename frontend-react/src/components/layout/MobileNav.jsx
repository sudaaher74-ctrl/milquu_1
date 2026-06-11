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
      className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pb-[max(env(safe-area-inset-bottom,16px),16px)] flex justify-center`}
    >
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full h-[60px] px-6 w-full max-w-[400px] flex justify-between items-center">
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
              <div className="relative flex flex-col items-center justify-center z-10">
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative flex items-center justify-center"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-[#f0f0f0] rounded-full"
                      style={{ padding: '12px 24px', margin: '-8px -16px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                  <div className="relative z-10 text-black">
                    <Icon 
                      size={26} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      fill={isActive ? "currentColor" : "none"} 
                    />
                  </div>
                  
                  {/* Notification Badge */}
                  {((item.id === 'subscription' && hasUpdates.subscription) || 
                    (item.id === 'profile' && hasUpdates.profile)) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-[2px] border-white z-20" />
                  )}
                </motion.div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
