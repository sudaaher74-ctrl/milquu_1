import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative lg:min-h-[100dvh] flex flex-col lg:flex-row items-center bg-gradient-to-br from-milquu-cream via-white to-milquu-cream pt-28 lg:pt-24 pb-4 lg:pb-0 overflow-hidden">
      
      {/* Decorative Animated Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-milquu-gold/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-milquu-blue/10 rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-2 relative z-10">
        
        {/* Left Side: Split Image (home3.png) */}
        <div className="relative w-full flex-grow lg:h-full flex items-center justify-center order-1 lg:order-1 px-4 lg:pl-12 lg:pr-4 xl:pl-20 xl:pr-8 mt-4 lg:mt-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-full"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img 
                src="/img/hero/home2.webp" 
                alt="MILQUU FRESH Premium Dairy" 
                className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-center px-6 lg:pl-8 lg:pr-12 xl:pl-12 xl:pr-24 pt-8 pb-12 lg:py-0 order-2 lg:order-2 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass p-8 md:p-12 rounded-[2rem] border border-white/40 shadow-xl bg-white/40"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center py-1.5 px-4 rounded-full bg-green-100/80 backdrop-blur-sm border border-green-200/50 text-green-700 font-sans text-xs md:text-sm font-bold tracking-widest mb-4 lg:mb-6 mt-2 lg:mt-0 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              FRESH. PURE. DELIVERED DAILY.
            </motion.span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-serif font-bold text-gray-900 leading-[1.1] mb-4 lg:mb-6 tracking-tight">
              Premium Fresh Milk <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-milquu-gold to-yellow-600 italic font-medium">Delivered Daily.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 font-sans mb-8 lg:mb-10 max-w-xl leading-relaxed">
              Quality-verified milk and dairy products sourced from trusted dairy partners and delivered fresh to your doorstep every day.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => navigate('/subscribe')}
                className="w-full sm:w-auto px-8 py-4 bg-milquu-blue hover:bg-blue-900 text-white rounded-full font-sans font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center group text-base"
              >
                Subscribe Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/free-sample')}
                className="w-full sm:w-auto px-8 py-4 bg-white/80 hover:bg-white text-milquu-dark border border-gray-200 rounded-full font-sans font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 text-center text-base"
              >
                Get Free Sample
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
