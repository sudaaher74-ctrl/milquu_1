import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const InstagramIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const TwitterIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const LinkedinIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;

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
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><InstagramIcon size={18} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><FacebookIcon size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><TwitterIcon size={18} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><LinkedinIcon size={18} /></a>
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
