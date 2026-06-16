import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'milk', image: '/img/categories/categoris1.webp', title: "Pure Milk" },
  { id: 'by-products', image: '/img/categories/categorie2.webp', title: "Dairy Delights" }
];

const Products = () => {
  return (
    <section id="products" className="pt-20 pb-24 lg:py-32 bg-white relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-milquu-gold/10 rounded-full blur-[100px] -z-0 pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-milquu-blue/5 rounded-full blur-[100px] -z-0 pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <span className="text-milquu-gold font-bold tracking-widest text-sm uppercase mb-3">Explore Quality</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-milquu-blue to-indigo-600 italic">Categories</span>
            </h2>
            <div className="w-24 h-1.5 bg-milquu-gold/80 rounded-full"></div>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center justify-items-center">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
              className="w-full flex justify-center group"
            >
              <Link to="/products" className="w-full max-w-[450px] lg:max-w-[550px] block outline-none relative">
                
                {/* Premium Background Card */}
                <div className="absolute inset-0 bg-gray-50/80 rounded-[3rem] border border-gray-100 shadow-sm group-hover:shadow-2xl group-hover:bg-blue-50/50 transition-all duration-500 -z-10 transform group-hover:-translate-y-2"></div>

                <div className="flex flex-col items-center py-10 px-4">
                  <motion.div 
                    animate={{ 
                      y: [0, 8, 0, -4, 0], 
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: index * 0.8 }}
                    className="w-full transform transition-transform duration-700 cursor-pointer origin-bottom group-hover:scale-110 mb-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
                      <img 
                        src={category.image} 
                        alt={category.title} 
                        className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative z-10" 
                      />
                    </div>
                  </motion.div>

                  {/* Title Label */}
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 group-hover:text-milquu-blue transition-colors">
                    {category.title}
                  </h3>
                  <div className="mt-4 flex items-center text-milquu-gold font-bold uppercase tracking-wider text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    View Range <span className="ml-2">→</span>
                  </div>
                </div>

              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Products;
