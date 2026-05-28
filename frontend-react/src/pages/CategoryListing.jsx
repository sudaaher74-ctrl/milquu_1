import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Product database grouped by category with rich premium details
export const categoryData = {
  'milk': {
    title: 'Pure Farm Milk',
    description: '100% organic, freshly milked and delivered within hours.',
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
    description: 'Traditional dairy products crafted from pure farm-fresh milk.',
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
  const { addToCart } = useCart();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-24 pb-16 relative overflow-hidden">
      
      {/* Soft Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[60vh] pointer-events-none bg-milquu-gold/5 rounded-b-[120px]"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-60 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-gold/20 opacity-40 mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
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
              Farm Fresh Products
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-sans leading-relaxed">
              Experience the rich, natural taste of authentic dairy, delivered straight from our organic farms to your doorstep.
            </p>
          </motion.div>
        </div>

        {Object.entries(categoryData).map(([key, category]) => (
          <div key={key} className="mb-20">
            <div className="flex items-center justify-center mb-10">
              <div className="h-px w-12 bg-milquu-gold/50 mr-4"></div>
              <h2 className="text-3xl font-serif font-bold text-milquu-dark">{category.title}</h2>
              <div className="h-px w-12 bg-milquu-gold/50 ml-4"></div>
            </div>

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
                    
                    {/* Labels removed for cleaner look, or just kept minimal if needed */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4 relative z-20">
                      {product.labels.map(label => (
                        <span key={label} className="text-[10px] uppercase tracking-widest font-sans font-bold text-milquu-green">
                          {label}
                        </span>
                      ))}
                    </div>

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
                          className="h-full object-contain drop-shadow-xl sm:drop-shadow-2xl scale-125 lg:scale-[1.3] origin-center"
                        />
                      </motion.div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col items-center text-center w-full max-w-[280px]">
                      <h3 className="text-base sm:text-2xl lg:text-3xl font-serif font-bold text-milquu-dark mb-2 sm:mb-4 leading-tight">
                        {product.name}
                      </h3>
                      
                      <div className="flex flex-col items-center space-y-0.5 sm:space-y-1.5 mb-4 sm:mb-8">
                        <p className="text-gray-500 font-sans text-[10px] sm:text-sm">
                          Price: <span className="font-semibold text-milquu-dark">{product.price}</span>
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
        ))}

      </div>
    </div>
  );
};

export default CategoryListing;
