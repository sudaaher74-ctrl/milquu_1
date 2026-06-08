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

const ProductCard = ({ product, index, category, getProductSlug, addToCart }) => {
  const isMilk = product.name.toLowerCase().includes('milk');
  const [selectedUnit, setSelectedUnit] = useState('1 Litre');

  // If it's milk and 500ml is selected, halve the price (round up). Otherwise use default.
  const currentPrice = (isMilk && selectedUnit === '500 ml') 
    ? Math.ceil(product.price / 2) 
    : product.price;

  const stockLevel = parseInt(product.stock, 10);
  const isOutOfStock = isNaN(stockLevel) ? true : stockLevel <= 0;

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      _id: isMilk ? `${product._id}-${selectedUnit.replace(' ', '')}` : product._id,
      id: isMilk ? `${product.id || product._id}-${selectedUnit.replace(' ', '')}` : (product.id || product._id),
      price: currentPrice,
      unit: isMilk ? selectedUnit : product.unit,
      name: isMilk ? `${product.name} (${selectedUnit})` : product.name
    };
    addToCart(productToAdd);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
      className="group h-full"
    >
      {/* Transparent Boxless Card */}
      <div className="h-full flex flex-col items-center text-center relative group-hover:-translate-y-2 transition-transform duration-500">

        {/* Floating Image */}
        <Link to={`/product/${getProductSlug(product.name)}`} className="relative h-[160px] sm:h-[180px] lg:h-[280px] w-full flex justify-center items-center mb-4 sm:mb-8 cursor-pointer">
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2 sm:right-6 lg:right-12 z-30 bg-red-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-400/50">
              OUT OF STOCK
            </div>
          )}
          
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
              className="h-full object-contain drop-shadow-xl sm:drop-shadow-2xl scale-110 sm:scale-125 lg:scale-[1.3] origin-center"
            />
          </motion.div>
        </Link>

        {/* Product Info */}
        <div className="flex flex-col items-center text-center w-full max-w-[280px]">
          <Link to={`/product/${getProductSlug(product.name)}`}>
            <h3 className="text-base sm:text-2xl lg:text-3xl font-serif font-bold text-milquu-dark mb-1 sm:mb-4 leading-tight hover:text-milquu-gold transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex flex-col items-center space-y-0.5 sm:space-y-1.5 mb-3 sm:mb-4">
            <p className="text-gray-500 font-sans text-xs sm:text-sm">
              Price: <span className="font-semibold text-milquu-dark">₹{currentPrice}</span>
            </p>
            <p className="text-gray-500 font-sans text-xs sm:text-sm">
              Unit: <span className="font-semibold text-milquu-dark">{isMilk ? selectedUnit : product.unit}</span>
            </p>
          </div>

          {/* Size Selector for Milk */}
          {isMilk && (
            <div className="flex bg-gray-100/80 p-1 rounded-full mb-4 sm:mb-6 border border-gray-200/50">
              <button
                onClick={() => setSelectedUnit('1 Litre')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 ${selectedUnit === '1 Litre' ? 'bg-white text-milquu-gold shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                1 Litre
              </button>
              <button
                onClick={() => setSelectedUnit('500 ml')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 ${selectedUnit === '500 ml' ? 'bg-white text-milquu-gold shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                500 ml
              </button>
            </div>
          )}
          {!isMilk && <div className="mb-4 sm:mb-6"></div>}
          
          {/* Minimal Text CTA Button */}
          <button 
            onClick={isOutOfStock ? null : handleAddToCart}
            disabled={isOutOfStock}
            className={`group/btn flex items-center justify-center space-x-1 sm:space-x-2 font-sans font-bold uppercase tracking-widest text-xs sm:text-sm transition-colors ${
              isOutOfStock 
              ? 'text-red-400 cursor-not-allowed opacity-70' 
              : 'text-milquu-gold hover:text-milquu-green'
            }`}
          >
            <span>{isOutOfStock ? 'Unavailable' : 'Add To Cart'}</span>
            {!isOutOfStock && (
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
              >
                →
              </motion.span>
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

const CategoryListing = () => {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  const getProductSlug = (name) => {
    const n = name.toLowerCase();
    if (n.includes('buffalo') && n.includes('pouch')) return 'buffalo-milk-pouch';
    if (n.includes('cow') && n.includes('pouch')) return 'cow-milk-pouch';
    if (n.includes('buffalo')) return 'pure-buffalo-milk';
    if (n.includes('paneer')) return 'fresh-paneer';
    if (n.includes('ghee')) return 'desi-cow-ghee';
    if (n.includes('dahi')) return 'fresh-dahi';
    if (n.includes('lassi')) return 'sweet-lassi';
    return 'farm-fresh-cow-milk';
  };

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
    <div className="min-h-screen bg-white pt-24 pb-16 relative overflow-hidden">
      
      {/* Soft Background Effects (kept minimal without sharp horizontal split) */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-30 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-gold/20 opacity-20 mix-blend-multiply pointer-events-none"></div>

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
                <ProductCard 
                  key={product._id || product.id} 
                  product={product} 
                  index={index} 
                  category={category}
                  getProductSlug={getProductSlug}
                  addToCart={addToCart}
                />
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
