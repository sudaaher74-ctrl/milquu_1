import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';

// Product database grouped by category
const categoryData = {
  'milk': {
    title: 'Pure Farm Milk',
    description: '100% organic, freshly milked and delivered within hours.',
    bgLight: 'bg-milquu-green/5',
    products: [
      { id: 'a2-milk', name: 'A2 Cow Milk', price: '₹95', unit: '1L', image: '/img/A2milk.png' },
      { id: 'buffalo-milk', name: 'Buffalo Milk', price: '₹105', unit: '1L', image: '/img/buffalomilk.png' },
      { id: 'cow-milk', name: 'Premium Cow Milk', price: '₹85', unit: '1L', image: '/img/cowmilk.png' },
    ]
  },
  'by-products': {
    title: 'Dairy By-Products',
    description: 'Authentic, traditional dairy products made with pure milk.',
    bgLight: 'bg-milquu-gold/5',
    products: [
      { id: 'dahi', name: 'Fresh Dahi', price: '₹60', unit: '500g', image: '/img/Dahi.png' },
      { id: 'lassi', name: 'Sweet Lassi', price: '₹40', unit: '250ml', image: '/img/lassi.png' },
      { id: 'paneer', name: 'Soft Paneer', price: '₹120', unit: '200g', image: '/img/panner.png' },
    ]
  }
};

const CategoryListing = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  // If invalid category, redirect to home
  const category = categoryData[categoryId];
  
  useEffect(() => {
    if (!category) {
      navigate('/');
    }
  }, [category, navigate]);

  if (!category) return null;

  return (
    <div className="min-h-screen bg-milquu-cream pt-24 pb-20 relative">
      
      {/* Background Ambience */}
      <div className={`absolute top-0 left-0 w-full h-[50vh] pointer-events-none transition-colors duration-1000 ${category.bgLight} rounded-b-[100px]`}></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-milquu-dark font-sans mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-milquu-dark mb-4">
              {category.title}
            </h1>
            <p className="text-lg text-gray-600 font-sans max-w-xl">
              {category.description}
            </p>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mt-16">
          {category.products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative"
            >
              {/* Product Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 pb-10 border border-white/40 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/80 transition-all duration-500 h-full flex flex-col">
                
                {/* Floating Image */}
                <div className="relative h-64 mb-8 flex justify-center items-center">
                  <div className={`absolute w-40 h-40 rounded-full blur-[50px] ${category.bgLight} opacity-80 mix-blend-multiply`}></div>
                  
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                    className="relative z-10 h-full transform group-hover:scale-110 transition-transform duration-500"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-auto object-contain drop-shadow-xl"
                    />
                  </motion.div>
                </div>

                {/* Product Details */}
                <div className="text-center mt-auto">
                  <h3 className="text-2xl font-serif font-bold text-milquu-dark mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 font-sans mb-6">
                    {product.unit}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-2xl font-sans font-bold text-milquu-dark">
                      {product.price}
                    </span>
                    <button className="w-12 h-12 bg-milquu-dark text-white rounded-full flex items-center justify-center hover:bg-black transition-transform transform hover:scale-110 shadow-lg">
                      <Plus size={24} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CategoryListing;
