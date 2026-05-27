import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-milquu-cream pt-24 lg:pt-20">
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 h-full min-h-screen">
        
        {/* Left Side: Split Image (home2.png) */}
        <div className="relative w-full flex items-center justify-center order-2 lg:order-1 p-4 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img 
                src="/img/home2.png" 
                alt="MILQUU FRESH Premium Farm" 
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-center px-6 lg:px-16 xl:px-24 py-12 lg:py-0 z-10 bg-milquu-cream order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-milquu-green/10 text-milquu-green font-sans text-xs md:text-sm font-semibold tracking-wider mb-4 lg:mb-6 mt-8 lg:mt-0">
              100% ORGANIC & PURE
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-milquu-dark leading-tight mb-4 lg:mb-6">
              Pure Farm Fresh Dairy <br/><span className="text-milquu-gold italic font-light">Delivered Daily.</span>
            </h1>
            <p className="text-lg text-gray-600 font-sans mb-10 max-w-xl leading-relaxed">
              Premium quality milk and dairy products processed hygienically and delivered fresh to your doorstep every morning.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="w-full sm:w-auto px-8 py-4 bg-milquu-dark hover:bg-black text-white rounded-full font-sans font-medium transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center group">
                Start Subscription
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-milquu-dark border border-gray-200 rounded-full font-sans font-medium transition-all duration-300 shadow-sm hover:shadow-md text-center">
                Explore Products
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
