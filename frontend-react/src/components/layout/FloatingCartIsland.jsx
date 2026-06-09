import React from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCartIsland = () => {
  const { cartItems, cartCount } = useCart();
  const location = useLocation();

  // Hide on admin, delivery, chatbot, cart, and checkout/subscribe pages
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/chatbot') ||
    location.pathname === '/cart' ||
    location.pathname === '/subscribe'
  ) {
    return null;
  }

  // Calculate total price
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 150, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 150, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-[110px] left-4 right-4 z-[90] md:hidden"
        >
          <Link
            to="/cart"
            className="flex items-center justify-between bg-gray-900 text-white rounded-full py-2.5 px-3 shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center space-x-3 ml-1">
              <div className="relative flex items-center justify-center bg-gray-800 rounded-full w-10 h-10 border border-gray-700">
                <ShoppingBag size={18} className="text-white" />
                <span className="absolute -top-1 -right-1 bg-milquu-blue text-xs text-white font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900 shadow-sm">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Cart Total</span>
                <span className="text-sm font-bold text-white">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-milquu-blue text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-[0_2px_10px_rgba(59,130,246,0.4)] active:scale-95 transition-transform duration-200">
              <span>View Cart</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartIsland;
