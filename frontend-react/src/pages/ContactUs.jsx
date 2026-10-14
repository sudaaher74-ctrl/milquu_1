import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { trackContact, trackGenerateLead } from '../utils/analytics';
import { PHONE_NUMBER, CONTACT_EMAIL } from '../data/schemas';

const ContactUs = () => {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' });
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  // The form used to do nothing (its button was type="button" with no handler),
  // so every enquiry was silently lost. It now opens WhatsApp with the enquiry
  // pre-filled — the channel the business already answers on. The text goes to
  // WhatsApp only; analytics receives just the event, never the content.
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = [
      `Hi MilQuuFresh, I'd like to get in touch.`,
      `Name: ${f.name}`,
      f.phone ? `Phone: ${f.phone}` : '',
      f.email ? `Email: ${f.email}` : '',
      f.message ? `Message: ${f.message}` : '',
    ].filter(Boolean).join('\n');
    trackGenerateLead('contact_form_whatsapp');
    trackContact('form', 'contact_page');
    window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
  };
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-32 pb-24 relative overflow-hidden flex items-center justify-center">
      <SEOHead path="/contact" />
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[60vh] pointer-events-none bg-milquu-gold/5 rounded-b-[120px]"></div>
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/20 opacity-30 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-40 mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-3xl w-full mx-auto px-6 lg:px-12 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-milquu-gold/20 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none"></div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-milquu-dark mb-3 relative z-10">Contact MilQuuFresh</h1>
            <p className="text-gray-600 font-sans mb-8 relative z-10">
              Questions about milk delivery, subscriptions or our products? Call <a href={`tel:${PHONE_NUMBER}`} onClick={() => trackContact('phone', 'contact_page')} className="font-semibold text-milquu-blue hover:underline">+91 87670 67884</a>, email <a href={`mailto:${CONTACT_EMAIL}`} onClick={() => trackContact('email', 'contact_page')} className="font-semibold text-milquu-blue hover:underline">{CONTACT_EMAIL}</a>, or send your message below and we will continue on WhatsApp.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  id="name" required value={f.name} onChange={set('name')} 
                  placeholder="John Doe"
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                />
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" value={f.email} onChange={set('email')} 
                    placeholder="john@example.com"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" value={f.phone} onChange={set('phone')} 
                    placeholder="+91 87670 67884"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Your Message</label>
                <textarea 
                  id="message" value={f.message} onChange={set('message')} 
                  rows="4" 
                  placeholder="How can we help you?"
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full relative group/btn overflow-hidden rounded-full p-[1px] mt-4"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-milquu-cream via-milquu-gold/40 to-milquu-cream rounded-full opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                <div className="relative bg-gradient-to-r from-[#FFFDF9] to-[#FFF8ED] px-8 py-5 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 group-hover/btn:bg-opacity-0 group-hover/btn:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <span className="font-sans font-bold text-milquu-dark uppercase tracking-wide text-sm">
                    Submit
                  </span>
                  <ArrowRight size={18} className="text-milquu-gold ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </button>

            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ContactUs;
