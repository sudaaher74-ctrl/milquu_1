import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative h-[100dvh] lg:min-h-screen flex flex-col lg:flex-row items-center bg-milquu-cream pt-20 lg:pt-24 overflow-hidden">
      
      <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-2">
        
        {/* Left Side: Split Image (home1.png) */}
        <div className="relative w-full flex-grow lg:h-full flex items-end lg:items-center justify-center order-2 lg:order-1 px-4 pb-0 lg:pl-12 lg:pr-4 xl:pl-20 xl:pr-8 overflow-hidden">
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
                src="/img/home1.png" 
                alt="MILQUU FRESH Premium Farm" 
                className="w-full h-[45vh] lg:h-auto object-cover lg:object-contain object-top lg:object-center drop-shadow-2xl scale-110 lg:scale-125 origin-bottom lg:origin-center"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-center px-6 lg:pl-8 lg:pr-12 xl:pl-12 xl:pr-24 pt-4 lg:py-0 z-10 bg-milquu-cream order-1 lg:order-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-milquu-green/10 text-milquu-green font-sans text-[10px] md:text-sm font-semibold tracking-wider mb-2 lg:mb-6 mt-2 lg:mt-0">
              100% ORGANIC & PURE
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-milquu-dark leading-tight mb-2 lg:mb-6">
              Pure Farm Fresh Dairy <br/><span className="text-milquu-gold italic font-light">Delivered Daily.</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-sans mb-4 lg:mb-10 max-w-xl leading-relaxed">
              Premium quality milk and dairy products processed hygienically and delivered fresh to your doorstep every morning.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <button className="w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-milquu-dark hover:bg-black text-white rounded-full font-sans font-medium transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center group text-sm lg:text-base">
                Start Subscription
                <ArrowRight className="ml-2 w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-white hover:bg-gray-50 text-milquu-dark border border-gray-200 rounded-full font-sans font-medium transition-all duration-300 shadow-sm hover:shadow-md text-center text-sm lg:text-base">
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
