import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, ShoppingBag } from 'lucide-react';
import { PHONE_NUMBER, WHATSAPP_NUMBER } from '../../data/schemas';

const StickyMobileCTA = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50 md:hidden flex justify-around items-center p-2 border-t border-gray-100">
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20MilQuu%20Fresh,%20I%20want%20to%20know%20more%20about%20your%20milk%20delivery.`}
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center flex-1 text-green-600 font-medium p-2"
      >
        <MessageCircle size={22} className="mb-1" />
        <span className="text-[10px] uppercase tracking-wider font-bold">WhatsApp</span>
      </a>
      
      <div className="w-px h-10 bg-gray-200"></div>
      
      <Link 
        to="/subscribe"
        className="flex flex-col items-center justify-center flex-1 text-milquu-blue font-medium p-2"
      >
        <ShoppingBag size={22} className="mb-1" />
        <span className="text-[10px] uppercase tracking-wider font-bold">Subscribe</span>
      </Link>
      
      <div className="w-px h-10 bg-gray-200"></div>
      
      <a 
        href={`tel:${PHONE_NUMBER}`}
        className="flex flex-col items-center justify-center flex-1 text-blue-600 font-medium p-2"
      >
        <Phone size={22} className="mb-1" />
        <span className="text-[10px] uppercase tracking-wider font-bold">Call Now</span>
      </a>
    </div>
  );
};

export default StickyMobileCTA;
