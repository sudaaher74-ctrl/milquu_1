import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { WHATSAPP_DISPLAY, getWhatsAppUrl } from '../../utils/whatsapp';

const InstagramIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const TwitterIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const LinkedinIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;

const Footer = () => {
  return (
    <footer className="relative bg-milquu-dark text-white pt-16 pb-10 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-5 lg:col-span-2">
            <Link to="/" className="inline-block" aria-label="MilQuuFresh Home">
              <img src="/brand-logo.jpg" alt="MilQuuFresh" className="h-16 w-auto object-contain rounded-full shadow-md" />
            </Link>
            <p className="text-gray-300 font-sans text-sm leading-relaxed max-w-sm">
              MilQuuFresh delivers farm-fresh, chemical-free A2 Gir Cow Milk, Whole Cow Milk, Buffalo Milk, Desi Ghee, and Fresh Malai Paneer in sterilized glass bottles across Navi Mumbai every morning before 7:00 AM.
            </p>
            <div className="flex space-x-3">
              <a href="https://instagram.com/milquufresh" target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><InstagramIcon size={17} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer noopener" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><FacebookIcon size={17} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><TwitterIcon size={17} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-milquu-gold transition-colors duration-300 text-white"><LinkedinIcon size={17} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-serif font-semibold mb-4 text-white border-b border-white/20 pb-2 inline-block">Company</h3>
            <ul className="space-y-2.5 font-sans text-sm text-gray-300">
              <li><Link to="/about-us" className="hover:text-milquu-gold transition-colors">About MilQuuFresh</Link></li>
              <li><Link to="/our-farm" className="hover:text-milquu-gold transition-colors">Our Partner Farms</Link></li>
              <li><Link to="/our-process" className="hover:text-milquu-gold transition-colors">Quality & Process</Link></li>
              <li><Link to="/quality-assurance" className="hover:text-milquu-gold transition-colors">Lab Testing & QA</Link></li>
              <li><Link to="/glass-bottle-milk-delivery" className="hover:text-milquu-gold transition-colors">Glass Bottle Delivery</Link></li>
              <li><Link to="/blog" className="hover:text-milquu-gold transition-colors">Dairy & Health Blog</Link></li>
              <li><Link to="/subscribe" className="hover:text-milquu-gold transition-colors">Milk Subscriptions</Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-base font-serif font-semibold mb-4 text-white border-b border-white/20 pb-2 inline-block">Fresh Dairy</h3>
            <ul className="space-y-2.5 font-sans text-sm text-gray-300">
              <li><Link to="/product/farm-fresh-cow-milk" className="hover:text-milquu-gold transition-colors">A2 Gir Cow Milk</Link></li>
              <li><Link to="/product/cow-milk-pouch" className="hover:text-milquu-gold transition-colors">Farm Fresh Cow Milk</Link></li>
              <li><Link to="/product/pure-buffalo-milk" className="hover:text-milquu-gold transition-colors">Pure Buffalo Milk</Link></li>
              <li><Link to="/product/desi-cow-ghee" className="hover:text-milquu-gold transition-colors">Bilona Desi Ghee</Link></li>
              <li><Link to="/product/fresh-paneer" className="hover:text-milquu-gold transition-colors">Fresh Malai Paneer</Link></li>
              <li><Link to="/products" className="text-milquu-gold hover:underline font-medium">View All Products &rarr;</Link></li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-base font-serif font-semibold mb-4 text-white border-b border-white/20 pb-2 inline-block">Service Areas</h3>
            <ul className="space-y-2.5 font-sans text-sm text-gray-300">
              <li><Link to="/milk-delivery-panvel" className="hover:text-milquu-gold transition-colors">Milk Delivery Panvel</Link></li>
              <li><Link to="/milk-delivery-new-panvel" className="hover:text-milquu-gold transition-colors">Milk Delivery New Panvel</Link></li>
              <li><Link to="/milk-delivery-karanjade" className="hover:text-milquu-gold transition-colors">Milk Delivery Karanjade</Link></li>
              <li><Link to="/organic-milk-kharghar" className="hover:text-milquu-gold transition-colors">Milk Delivery Kharghar</Link></li>
              <li><Link to="/fresh-cow-milk-belapur" className="hover:text-milquu-gold transition-colors">Milk Delivery CBD Belapur</Link></li>
              <li><Link to="/farm-fresh-milk-nerul" className="hover:text-milquu-gold transition-colors">Milk Delivery Nerul</Link></li>
              <li><Link to="/milk-delivery-navi-mumbai" className="text-milquu-gold hover:underline font-medium">All Navi Mumbai Areas &rarr;</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Contact Strip */}
        <div className="border-t border-white/10 pt-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300 font-sans">
          <div className="flex items-start space-x-3">
            <MapPin size={18} className="text-milquu-gold flex-shrink-0 mt-0.5" />
            <span>Lakhani Centrium, Sector 15, CBD Belapur, Navi Mumbai, Maharashtra 400614</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone size={18} className="text-milquu-gold flex-shrink-0" />
            <a href="tel:+918767067884" className="hover:text-milquu-gold transition-colors">+91 87670 67884</a>
          </div>
          <div className="flex items-center space-x-3">
            <Mail size={18} className="text-milquu-gold flex-shrink-0" />
            <a href="mailto:milquufresh@gmail.com" className="hover:text-milquu-gold transition-colors">milquufresh@gmail.com</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 font-sans">
          <p>&copy; {new Date().getFullYear()} MilQuuFresh. All rights reserved. Delighting Navi Mumbai with pure farm dairy daily.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact & Support</Link>
            <a 
              href={getWhatsAppUrl("Hello MilQuuFresh, I have a query about your fresh milk delivery.")}
              target="_blank"
              rel="noreferrer noopener"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              WhatsApp Us ({WHATSAPP_DISPLAY})
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
