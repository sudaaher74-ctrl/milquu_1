import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-milquu-dark text-white pt-20 pb-10 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-white tracking-wider">
              MILQUU <span className="text-milquu-gold">FRESH</span>
            </h2>
            <p className="text-gray-400 font-sans text-sm leading-relaxed max-w-xs">
              Premium dairy products sourced directly from trusted farms and processed with international hygiene standards. Delivered fresh to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><Instagram size={18} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><Facebook size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><Twitter size={18} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6 text-white border-b border-white/20 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3 font-sans text-sm text-gray-400">
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Our Heritage</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Why Choose Us</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Quality Process</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Delivery Map</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Testimonials</a></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6 text-white border-b border-white/20 pb-2 inline-block">Premium Products</h3>
            <ul className="space-y-3 font-sans text-sm text-gray-400">
              <li><a href="#" className="hover:text-milquu-gold transition-colors">A2 Gir Cow Milk</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Farm Fresh Cow Milk</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Rich Buffalo Milk</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Pure Desi Ghee</a></li>
              <li><a href="#" className="hover:text-milquu-gold transition-colors">Fresh Malai Paneer</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6 text-white border-b border-white/20 pb-2 inline-block">Contact Us</h3>
            <ul className="space-y-4 font-sans text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-milquu-gold flex-shrink-0 mt-0.5" />
                <span>123 Dairy Farm Road,<br/>Green Valley Estate, 400001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-milquu-gold flex-shrink-0" />
                <span>+1 (800) MILQUU-FRESH</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-milquu-gold flex-shrink-0" />
                <span>hello@milquufresh.com</span>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-sans">
          <p>&copy; {new Date().getFullYear()} MILQUU FRESH. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
