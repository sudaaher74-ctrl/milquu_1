import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About Us', href: '/#about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Subscriptions', href: '/subscribe' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled ? 'py-3 glass' : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer">
            <h1 className="text-2xl font-serif font-bold text-milquu-gold tracking-wider">
              MILQUU <span className="text-milquu-green">FRESH</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium font-sans uppercase tracking-wider transition-colors duration-200 ${
                  isScrolled ? 'text-milquu-dark hover:text-milquu-gold' : 'text-milquu-dark hover:text-milquu-gold'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative group flex items-center justify-center p-2">
              <ShoppingCart size={22} className="text-milquu-dark group-hover:text-milquu-gold transition-colors duration-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-milquu-gold text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/subscribe">
              <button className="bg-milquu-gold hover:bg-milquu-green text-white px-6 py-2.5 rounded-full font-sans text-sm font-semibold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Subscribe Now
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative group flex items-center justify-center p-2">
              <ShoppingCart size={22} className="text-milquu-dark" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-milquu-gold text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-milquu-dark focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif text-milquu-dark hover:text-milquu-gold transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link to="/subscribe" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="mt-4 bg-milquu-gold text-white px-8 py-3 rounded-full font-sans text-lg font-semibold shadow-lg">
                Subscribe Now
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
