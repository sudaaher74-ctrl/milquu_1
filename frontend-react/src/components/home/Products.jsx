import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const products = [
  { name: 'Cow Milk', desc: 'Fresh & Pure Daily', color: 'from-[#E8F5E9] to-white', image: '/img/cow%20milk.png' },
  { name: 'Buffalo Milk', desc: 'Rich & Creamy', color: 'from-[#FFF8E1] to-white', image: '/img/buffalomilk.png' },
  { name: 'A2 Gir Cow Milk', desc: 'Premium Nutrition', color: 'from-[#F3E5F5] to-white', image: '/img/A2cow.png' },
  { name: 'Paneer', desc: 'Soft Malai Paneer', color: 'from-[#E3F2FD] to-white' },
  { name: 'Ghee', desc: 'Traditional Bilona', color: 'from-[#FFF3E0] to-white' },
];

const Products = () => {
  return (
    <section id="products" className="py-24 bg-milquu-cream relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-milquu-gold/5 rounded-full blur-[100px] -z-0 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-bold text-milquu-dark mb-4"
            >
              Explore Our <span className="text-milquu-gold italic">Pure Range</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 font-sans"
            >
              From farm to table, experience the rich, unadulterated taste of our premium dairy products delivered fresh daily.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mt-6 md:mt-0"
          >
            <button className="flex items-center text-milquu-gold font-sans font-semibold hover:text-milquu-dark transition-colors group">
              View All Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative flex flex-col items-center p-8 rounded-[2.5rem] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500 border border-white/50"
            >
              {/* Soft Splash Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-t ${product.color} opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-[2.5rem]`}></div>
              
              {/* Product Image Container */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                className="relative z-10 w-32 h-40 mb-8 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500"
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-xl" />
                ) : (
                  <div className="w-full h-full bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-lg flex items-center justify-center">
                    <span className="text-milquu-dark/40 font-serif text-sm">Image Coming</span>
                  </div>
                )}
              </motion.div>

              {/* Content */}
              <div className="relative z-10 text-center w-full">
                <h3 className="text-xl font-serif font-bold text-milquu-dark mb-2">{product.name}</h3>
                <p className="text-sm text-gray-500 font-sans mb-6">{product.desc}</p>
                
                <button className="w-12 h-12 mx-auto rounded-full bg-white text-milquu-dark border border-gray-100 flex items-center justify-center group-hover:bg-milquu-dark group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                  <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Products;
