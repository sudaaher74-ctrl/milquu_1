import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

const ContactUs = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-32 pb-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[60vh] pointer-events-none bg-milquu-gold/5 rounded-b-[120px]"></div>
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/20 opacity-30 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-40 mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-milquu-gold font-sans font-semibold tracking-widest uppercase text-sm mb-4 block">
              Reach the Farm
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-milquu-dark mb-6 leading-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-500 font-sans leading-relaxed">
              We'd love to hear from you. Whether you have a question about our pure dairy products, deliveries, or subscriptions, our team is ready to answer all your questions.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-start">
          
          {/* Left Column: Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="space-y-12"
          >
            <div>
              <h3 className="text-3xl font-serif font-bold text-milquu-dark mb-8">Contact Information</h3>
              
              <div className="space-y-8">
                {/* Address */}
                <div className="flex items-start group">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-milquu-gold group-hover:bg-milquu-gold group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div className="ml-6">
                    <h4 className="text-lg font-sans font-bold text-milquu-dark mb-1">Farm Location</h4>
                    <p className="text-gray-500 font-sans leading-relaxed">
                      MILQUU FRESH Dairy Farm<br />
                      Village Green, Rural District<br />
                      State, 123456
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start group">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-milquu-gold group-hover:bg-milquu-gold group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div className="ml-6">
                    <h4 className="text-lg font-sans font-bold text-milquu-dark mb-1">Call Us</h4>
                    <p className="text-gray-500 font-sans leading-relaxed">
                      +91 98765 43210<br />
                      <span className="text-sm">Mon-Sat: 9am - 6pm</span>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start group">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-milquu-gold group-hover:bg-milquu-gold group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div className="ml-6">
                    <h4 className="text-lg font-sans font-bold text-milquu-dark mb-1">Email Us</h4>
                    <p className="text-gray-500 font-sans leading-relaxed">
                      hello@milquufresh.com<br />
                      <span className="text-sm">We reply within 24 hours</span>
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start group">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-milquu-gold group-hover:bg-milquu-gold group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div className="ml-6">
                    <h4 className="text-lg font-sans font-bold text-milquu-dark mb-1">Delivery Hours</h4>
                    <p className="text-gray-500 font-sans leading-relaxed">
                      Morning: 5:00 AM - 8:00 AM<br />
                      Evening: 5:00 PM - 8:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-milquu-gold/20 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none"></div>
              
              <h3 className="text-2xl font-serif font-bold text-milquu-dark mb-8">Send us a Message</h3>
              
              <form className="space-y-6">
                
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
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
                      id="email" 
                      placeholder="john@example.com"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      placeholder="+91 98765 43210"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Your Message</label>
                  <textarea 
                    id="message" 
                    rows="4" 
                    placeholder="How can we help you?"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button 
                  type="button" 
                  className="w-full relative group/btn overflow-hidden rounded-full p-[1px] mt-4"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-milquu-cream via-milquu-gold/40 to-milquu-cream rounded-full opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                  <div className="relative bg-gradient-to-r from-[#FFFDF9] to-[#FFF8ED] px-8 py-5 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 group-hover/btn:bg-opacity-0 group-hover/btn:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    <span className="font-sans font-bold text-milquu-dark uppercase tracking-wide text-sm">
                      Send Message
                    </span>
                    <ArrowRight size={18} className="text-milquu-gold ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </button>

              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
