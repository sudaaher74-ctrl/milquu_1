import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import api from '../utils/api.js';

// Product category metadata
const categoryMeta = {
  'milk': {
    title: 'Pure Farm Milk',
    description: '100% organic, freshly milked and delivered within hours.',
    bgLight: 'bg-milquu-green/5',
    blobColor: 'bg-milquu-green/20',
  },
  'by-products': {
    title: 'Authentic Dairy Delights',
    description: 'Traditional dairy products crafted from pure farm-fresh milk.',
    bgLight: 'bg-milquu-gold/5',
    blobColor: 'bg-milquu-gold/20',
  }
};

const CategoryListing = () => {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products');
        
        // Group by category
        const grouped = {
          'milk': { ...categoryMeta['milk'], products: [] },
          'by-products': { ...categoryMeta['by-products'], products: [] }
        };
        
        data.forEach(p => {
          if (grouped[p.category]) {
            grouped[p.category].products.push(p);
          }
        });
        
        setCategories(grouped);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-24 pb-16 relative overflow-hidden">
      
      {/* Soft Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[60vh] pointer-events-none bg-milquu-gold/5 rounded-b-[120px]"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-60 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-gold/20 opacity-40 mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto relative pt-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-milquu-dark font-sans mb-8 transition-colors absolute left-0 top-0">
            <ArrowLeft size={20} className="mr-2" />
            Home
          </Link>
          
            {/* Text removed as requested */}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading fresh products...</div>
        ) : (
          Object.entries(categories).map(([key, category]) => (
          <div key={key} className="mb-20">
            {/* Category title removed */}

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
              {category.products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                  className="group h-full"
                >
                  {/* Transparent Boxless Card */}
                  <div className="h-full flex flex-col items-center text-center relative group-hover:-translate-y-2 transition-transform duration-500">

                    {/* Floating Image */}
                    <div className="relative h-[120px] sm:h-[180px] lg:h-[280px] w-full flex justify-center items-center mb-4 sm:mb-8">
                      {/* Very subtle glow */}
                      <div className={`absolute w-[80%] h-[80%] rounded-full blur-[40px] sm:blur-[80px] ${category.blobColor} opacity-40 mix-blend-multiply group-hover:opacity-70 transition-opacity duration-500`}></div>
                      
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                        className="relative z-10 h-full flex justify-center items-center"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full object-contain drop-shadow-xl sm:drop-shadow-2xl scale-100 sm:scale-125 lg:scale-[1.3] origin-center"
                        />
                      </motion.div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col items-center text-center w-full max-w-[280px]">
                      <h3 className="text-sm sm:text-2xl lg:text-3xl font-serif font-bold text-milquu-dark mb-1 sm:mb-4 leading-tight">
                        {product.name}
                      </h3>
                      
                      <div className="flex flex-col items-center space-y-0.5 sm:space-y-1.5 mb-4 sm:mb-8">
                        <p className="text-gray-500 font-sans text-[10px] sm:text-sm">
                          Price: <span className="font-semibold text-milquu-dark">₹{product.price}</span>
                        </p>
                        <p className="text-gray-500 font-sans text-[10px] sm:text-sm">
                          Unit: <span className="font-semibold text-milquu-dark">{product.unit}</span>
                        </p>
                      </div>
                      
                      {/* Minimal Text CTA Button */}
                      <button 
                        onClick={() => addToCart(product)}
                        className="group/btn flex items-center justify-center space-x-1 sm:space-x-2 font-sans font-bold text-milquu-gold hover:text-milquu-green transition-colors uppercase tracking-widest text-[10px] sm:text-sm"
                      >
                        <span>Add To Cart</span>
                        <motion.span
                          className="inline-block"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          →
                        </motion.span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          ))
        )}

      </div>
    </div>
  );
};

export default CategoryListing;
