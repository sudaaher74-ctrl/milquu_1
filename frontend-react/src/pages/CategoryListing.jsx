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
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group h-full"
    >
      {/* Glassmorphic Box Card */}
      <div className="h-full flex flex-col items-center text-center relative group-hover:-translate-y-2 transition-all duration-500 bg-white border border-gray-100 shadow-sm hover:shadow-2xl rounded-3xl p-4 sm:p-6 pb-8 overflow-hidden z-10">

        {/* Decorative Background Glow inside Card */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] ${category.blobColor} opacity-20 group-hover:opacity-60 transition-opacity duration-500 -z-10`}></div>

        {/* Floating Image */}
        <Link to={`/product/${getProductSlug(product.name)}`} className="relative h-[160px] sm:h-[180px] lg:h-[240px] w-full flex justify-center items-center mb-6 cursor-pointer">
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2 z-30 bg-red-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-400/50">
              OUT OF STOCK
            </div>
          )}
          
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
            className="relative z-10 h-full flex justify-center items-center"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500 origin-bottom"
            />
          </motion.div>
        </Link>

        {/* Product Info */}
        <div className="flex flex-col items-center text-center w-full z-20">
          <Link to={`/product/${getProductSlug(product.name)}`}>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-3 leading-tight group-hover:text-milquu-blue transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex flex-col items-center space-y-1 mb-5">
            <p className="text-gray-600 font-sans text-sm sm:text-base">
              <span className="font-bold text-gray-900 text-lg">₹{currentPrice}</span>
            </p>
            <p className="text-gray-400 font-sans text-xs sm:text-sm">
              Unit: {isMilk ? selectedUnit : product.unit}
            </p>
          </div>

          {/* Size Selector for Milk */}
          {isMilk && (
            <div className="flex bg-gray-50 p-1.5 rounded-full mb-6 border border-gray-200">
              <button
                onClick={() => setSelectedUnit('1 Litre')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${selectedUnit === '1 Litre' ? 'bg-white text-milquu-blue shadow border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                1 Litre
              </button>
              <button
                onClick={() => setSelectedUnit('500 ml')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${selectedUnit === '500 ml' ? 'bg-white text-milquu-blue shadow border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                500 ml
              </button>
            </div>
          )}
          {!isMilk && <div className="mb-6 h-[34px]"></div>}
          
          {/* Premium CTA Button */}
          <button 
            onClick={isOutOfStock ? null : handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center space-x-2 font-sans font-bold py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
              isOutOfStock 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-milquu-cream text-milquu-blue border border-blue-100 hover:bg-milquu-blue hover:text-white'
            }`}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Unavailable' : 'Add To Cart'}</span>
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
    <div className="min-h-screen bg-milquu-cream pt-24 pb-20 relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-blue/10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-gold/5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto relative pt-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-milquu-blue font-sans mb-8 transition-colors absolute left-0 top-0 bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={16} className="mr-2" />
            <span className="text-sm font-bold">Back to Home</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-milquu-gold font-bold tracking-widest text-sm uppercase mb-3 block">Store</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 tracking-tight">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-milquu-blue to-indigo-600 italic">Dairy</span>
            </h1>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-milquu-blue"></div>
          </div>
        ) : (
          Object.entries(categories).map(([key, category]) => (
            category.products.length > 0 && (
              <div key={key} className="mb-24">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{category.title}</h2>
                  <p className="text-gray-500">{category.description}</p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            )
          ))
        )}

      </div>
    </div>
  );
};

export default CategoryListing;
