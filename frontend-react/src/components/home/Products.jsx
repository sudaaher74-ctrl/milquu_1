import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Link } from 'react-router-dom';

const categories = [
  { id: 'milk', image: '/img/categoris1.webp' },
  { id: 'by-products', image: '/img/categorie2.webp' }
];

const Products = () => {
  return (
    <section id="products" className="py-24 bg-milquu-cream relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-milquu-gold/5 rounded-full blur-[100px] -z-0 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-milquu-dark mb-4"
          >
            Our <span className="text-milquu-gold italic">Categories</span>
          </motion.h2>
        </div>

        {/* Categories (Raw Floating Images) */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-16 lg:gap-24 items-center justify-items-center">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="w-full flex justify-center"
            >
              <Link to={`/category/${category.id}`} className="w-full max-w-[450px] lg:max-w-[550px] block outline-none">
                <motion.div 
                  animate={{ 
                    y: [0, 8, 0, -4, 0], 
                    rotate: [0, 1.5, 0, -1, 0],
                    scale: [1, 1.03, 1, 1.01, 1]
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: index * 0.8 }}
                  className="w-full transform transition-transform duration-700 cursor-pointer origin-bottom hover:scale-105"
                >
                  <img 
                    src={category.image} 
                    alt="Product Category" 
                    className="w-full h-auto object-contain drop-shadow-2xl pointer-events-none" 
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>



      </div>
    </section>
  );
};

export default Products;
