import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Quality Verified', value: '100%' },
  { label: 'Daily Procurement', value: 'Fresh' },
  { label: 'Doorstep Delivery', value: 'Reliable' },
  { label: 'Subscription Plans', value: 'Flexible' },
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-milquu-gold font-sans font-semibold tracking-[0.2em] uppercase text-sm"
          >
            Our Mission
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold text-milquu-dark mt-4"
          >
            Why Choose MilQuu Fresh
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Premium Farm Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full"
          >
            <img src="/img/hero/home2.webp" alt="Premium Dairy Quality" className="w-full h-auto object-contain drop-shadow-xl" />
          </motion.div>

          {/* Right: Description & Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <p className="text-lg text-gray-600 font-sans leading-relaxed mb-12">
              <span className="font-semibold text-milquu-dark">MILQUU FRESH</span> was founded with a simple mission: to provide families with reliable access to fresh, high-quality dairy products. We partner with trusted dairy suppliers and carefully selected processing facilities to ensure every product meets our quality standards before reaching your home. Our focus is on freshness, convenience, transparency, and customer satisfaction.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-milquu-cream/50 border border-gray-100 p-6 rounded-2xl hover:shadow-[0_8px_30px_rgb(212,175,55,0.15)] transition-all duration-300"
                >
                  <h3 className="text-4xl font-serif font-bold text-milquu-green mb-2">{stat.value}</h3>
                  <p className="text-sm font-sans font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
