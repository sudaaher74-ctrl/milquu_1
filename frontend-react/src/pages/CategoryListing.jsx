import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Product database grouped by category with rich premium details
export const categoryData = {
  'milk': {
    title: 'Pure Farm Milk',
    description: '100% organic, freshly milked and delivered within hours. Experience the rich, natural taste of authentic farm-fresh dairy.',
    bgLight: 'bg-milquu-green/5',
    blobColor: 'bg-milquu-green/20',
    products: [
      { 
        id: 'a2-milk', 
        name: 'A2 Cow Milk', 
        description: 'Rich in A2 protein, easily digestible and highly nutritious.',
        price: '₹95', 
        unit: '1 Litre', 
        image: '/img/A2milk.png',
        labels: ['Farm Fresh', 'A2 Protein']
      },
      { 
        id: 'buffalo-milk', 
        name: 'Premium Buffalo Milk', 
        description: 'Thick, creamy, and perfect for making rich curds and ghee.',
        price: '₹105', 
        unit: '1 Litre', 
        image: '/img/buffalomilk.png',
        labels: ['High Fat', 'Creamy']
      },
      { 
        id: 'cow-milk', 
        name: 'Pure Cow Milk', 
        description: 'Light, healthy, and packed with essential vitamins for daily use.',
        price: '₹85', 
        unit: '1 Litre', 
        image: '/img/cowmilk.png',
        labels: ['Organic', 'Daily Health']
      },
    ]
  },
  'by-products': {
    title: 'Authentic Dairy Delights',
    description: 'Traditional dairy products crafted from pure farm-fresh milk with unmatched taste and quality.',
    bgLight: 'bg-milquu-gold/5',
    blobColor: 'bg-milquu-gold/20',
    products: [
      { 
        id: 'dahi', 
        name: 'Fresh Dahi', 
        description: 'Thick, naturally set curd with a smooth, velvety texture.',
        price: '₹60', 
        unit: '500g', 
        image: '/img/Dahi.png',
        labels: ['Farm Fresh', 'Probiotic']
      },
      { 
        id: 'lassi', 
        name: 'Sweet Lassi', 
        description: 'Traditional churned yogurt drink, refreshing and lightly sweetened.',
        price: '₹40', 
        unit: '250ml', 
        image: '/img/lassi.png',
        labels: ['Traditional', 'Refreshing']
      },
      { 
        id: 'paneer', 
        name: 'Soft Paneer', 
        description: 'Melt-in-mouth cottage cheese, rich in protein and incredibly soft.',
        price: '₹120', 
        unit: '200g', 
        image: '/img/panner.png',
        labels: ['High Protein', 'Pure']
      },
    ]
  }
};

const CategoryListing = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const category = categoryData[categoryId];
  
  useEffect(() => {
    if (!category) {
      navigate('/');
    }
  }, [category, navigate]);

  if (!category) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-20 pb-16 relative overflow-hidden">
      
      {/* Soft Background Effects (Milk Splash/Glow) */}
      <div className={`absolute top-0 left-0 w-full h-[60vh] pointer-events-none transition-colors duration-1000 ${category.bgLight} rounded-b-[120px]`}></div>
      <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] ${category.blobColor} opacity-40 mix-blend-multiply pointer-events-none`}></div>
      <div className={`absolute top-40 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] ${category.blobColor} opacity-30 mix-blend-multiply pointer-events-none`}></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-milquu-dark font-sans mb-8 transition-colors absolute left-6 lg:left-12 top-0">
            <ArrowLeft size={20} className="mr-2" />
            Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-milquu-dark mb-6 leading-tight">
              {category.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-sans leading-relaxed">
              {category.description}
            </p>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
              className="group h-full"
            >
              {/* Premium Luxury Card */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 lg:p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/90 h-full flex flex-col relative overflow-hidden">
                
                {/* Labels */}
                <div className="flex flex-wrap gap-2 mb-6 relative z-20">
                  {product.labels.map(label => (
                    <span key={label} className="px-2 py-0.5 bg-white/80 border border-gray-100 rounded-full text-[10px] uppercase tracking-wider font-sans font-semibold text-milquu-dark shadow-sm">
                      {label}
                    </span>
                  ))}
                </div>

                {/* Floating Image */}
                <div className="relative h-[180px] lg:h-[220px] mb-6 flex justify-center items-center w-full">
                  {/* Card specific soft glow */}
                  <div className={`absolute w-3/4 h-3/4 rounded-full blur-[60px] ${category.blobColor} opacity-50 mix-blend-multiply group-hover:opacity-70 transition-opacity duration-500`}></div>
                  
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                    className="relative z-10 h-full w-full flex justify-center items-center"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain drop-shadow-2xl scale-125 lg:scale-[1.35] origin-bottom"
                    />
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-grow text-center">
                  <h3 className="text-xl lg:text-2xl font-serif font-bold text-milquu-dark mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 font-sans text-xs leading-relaxed mb-4 flex-grow">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-col space-y-4 w-full pt-4 border-t border-gray-100/80">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-gray-400 font-sans text-sm font-medium">
                        {product.unit}
                      </span>
                      <span className="text-xl font-sans font-bold text-milquu-dark">
                        {product.price}
                      </span>
                    </div>

                    {/* Premium CTA Button */}
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full relative group/btn overflow-hidden rounded-full p-[1px]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-milquu-cream via-milquu-gold/30 to-milquu-cream rounded-full opacity-70 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                      <div className="relative bg-gradient-to-r from-[#FFFDF9] to-[#FFF8ED] px-4 py-3 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 group-hover/btn:bg-opacity-0 group-hover/btn:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        <ShoppingCart size={18} className="text-milquu-gold" />
                        <span className="font-sans font-bold text-milquu-dark uppercase tracking-wide text-sm">
                          Add to Cart
                        </span>
                      </div>
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
