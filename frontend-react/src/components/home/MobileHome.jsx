import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShoppingCart, Search, Mic, ShieldCheck, Leaf, FlaskConical, Truck, Plus, Star, Home, ShoppingBag, CalendarCheck, Package, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const MobileHome = () => {
  const navigate = useNavigate();
  const { cartCount, addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const banners = [
    '/img/banners/subcription.png',
    '/img/banners/morning.png',
    '/img/banners/ghee.png'
  ];

  const bannerScrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerScrollRef.current) {
        const container = bannerScrollRef.current;
        const width = container.offsetWidth;
        const maxScrollLeft = container.scrollWidth - width;
        
        let newScrollLeft = container.scrollLeft + width;
        if (newScrollLeft >= maxScrollLeft + 10) {
          newScrollLeft = 0;
        }
        
        container.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth'
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fetch some products for Best Sellers and Fresh Picks
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const bestSellers = products.slice(0, 4);
  const freshPicks = products.slice(4, 7); // just grabbing a few

  const getProductSlug = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('buffalo') && n.includes('pouch')) return 'buffalo-milk-pouch';
    if (n.includes('cow') && n.includes('pouch')) return 'cow-milk-pouch';
    if (n.includes('buffalo')) return 'pure-buffalo-milk';
    if (n.includes('paneer')) return 'fresh-paneer';
    if (n.includes('ghee')) return 'desi-cow-ghee';
    if (n.includes('dahi')) return 'fresh-dahi';
    if (n.includes('lassi')) return 'sweet-lassi';
    return 'farm-fresh-cow-milk';
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productName = product.name || '';
    const isMilk = productName.toLowerCase().includes('milk');
    const selectedUnit = '500 ml'; // default for mobile quick add
    const currentPrice = isMilk ? Math.ceil(product.price / 2) : product.price;

    const productToAdd = {
      ...product,
      _id: isMilk ? `${product._id}-500ml` : product._id,
      id: isMilk ? `${product.id || product._id}-500ml` : (product.id || product._id),
      price: currentPrice,
      unit: isMilk ? selectedUnit : product.unit,
      name: isMilk ? `${productName} (500 ml)` : productName
    };
    addToCart(productToAdd);
  };

  const categories = [
    { name: 'Milk', image: '/img/products/cowmilk.webp' },
    { name: 'Ghee', image: '/img/products/cowghee.webp' },
    { name: 'Paneer', image: '/img/products/panner.webp' },
    { name: 'Curd', image: '/img/products/Dahi.webp' },
    { name: 'Butter', image: '/img/categories/categoris1.webp' },
  ];

  const features = [
    { title: 'Tested & Certified', icon: <ShieldCheck className="w-5 h-5 text-green-500" /> },
    { title: 'Farm Fresh Daily', icon: <Leaf className="w-5 h-5 text-green-500" /> },
    { title: 'No Preservatives', icon: <FlaskConical className="w-5 h-5 text-green-500" /> },
    { title: 'Fast Delivery', icon: <Truck className="w-5 h-5 text-green-500" /> },
  ];

  // Primary Blue: #1E3A8A, Fresh Green: #22C55E, Background: #FFF8F0 or #F9FAFB
  const userName = user?.name ? user.name.split(' ')[0] : 'Rahul';

  return (
    <div className="bg-[#fafafc] min-h-screen pb-28 font-poppins w-full max-w-[100vw] overflow-x-hidden md:hidden">
      
      {/* HEADER */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827] leading-tight">
              Good Morning, {userName} <span className="inline-block origin-bottom-right hover:animate-waving-hand">👋</span>
            </h1>
            <p className="text-[13px] text-gray-500 mt-1 font-medium">Fresh dairy delivered daily</p>
          </div>
          <div className="flex items-center space-x-3 mt-1">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
              <Bell className="text-[#1E3A8A] w-5 h-5" />
            </div>
            <div className="relative w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100" onClick={() => navigate('/cart')}>
              <ShoppingCart className="text-[#1E3A8A] w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#22C55E] border-2 border-white text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-5">
          <div 
            className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] cursor-pointer"
            onClick={() => navigate('/products')}
          >
            <Search className="text-gray-400 w-5 h-5 mr-3" />
            <input 
              type="text" 
              placeholder="Search milk, paneer, ghee..." 
              className="bg-transparent flex-grow outline-none text-[14px] text-gray-700 font-medium placeholder-gray-400 pointer-events-none" 
              readOnly
            />
            <Mic className="text-gray-400 w-5 h-5 ml-2" />
          </div>
        </div>
      </div>

      {/* HERO BANNER CAROUSEL */}
      <div className="px-5 mt-4">
        <div 
          className="relative w-full h-[160px] rounded-3xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          ref={bannerScrollRef}
        >
          {banners.map((banner, index) => (
              <img 
              key={index}
              src={banner} 
              alt={`Special Offer ${index + 1}`} 
              className="w-full h-full object-contain bg-white flex-shrink-0 snap-start cursor-pointer" 
              onClick={() => index === 0 ? navigate('/subscription') : navigate('/products')}
            />
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="px-5 mt-6">
        <div className="flex overflow-x-auto hide-scrollbar space-x-5 pb-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={() => navigate('/products')}>
              <div className="w-[68px] h-[68px] rounded-full bg-white mb-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center justify-center p-2">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="text-[12px] font-bold text-gray-800 text-center">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST FEATURES */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex overflow-x-auto hide-scrollbar space-x-6 items-center">
          {features.map((feature, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center flex-shrink-0 space-x-2">
                <div className="flex items-center justify-center">
                  {feature.icon}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[12px] font-bold text-gray-800 leading-tight w-16">{feature.title}</span>
                </div>
              </div>
              {idx < features.length - 1 && <div className="w-px h-8 bg-gray-100 flex-shrink-0"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* SUBSCRIPTION PROMOTION CARD */}
      <div className="px-5 mt-6">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-[#eef8eb] to-[#f5fdf2] border border-green-50 p-5 flex items-center">
          <div className="absolute top-0 right-0 w-32 h-full opacity-60">
            {/* Background elements to represent farm/bottles */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-100/50 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative z-10 w-full">
            <div className="absolute top-0 right-0 bg-[#1E3A8A] text-white text-[11px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl">
              Save 15%
            </div>
            <h3 className="text-[18px] font-bold text-[#111827] mb-1">Never run out of milk</h3>
            <p className="text-[13px] font-bold text-[#22C55E] mb-1">Save 15% every month</p>
            <p className="text-[11px] text-gray-500 font-medium mb-3">Flexible delivery • Pause anytime</p>
            <button className="bg-[#22C55E] text-white text-[12px] font-bold px-4 py-2 rounded-full w-fit flex items-center shadow-md">
              Start Subscription <span className="ml-1">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* BEST SELLERS */}
      <div className="pl-5 mt-8">
        <div className="flex justify-between items-center mb-4 pr-5">
          <h3 className="font-bold text-[#111827] text-[18px]">Best Sellers</h3>
          <span onClick={() => navigate('/products')} className="text-[#1E3A8A] text-[13px] font-bold flex items-center cursor-pointer">
            View all <span className="ml-0.5 text-[16px]">›</span>
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-6 text-gray-500 text-sm">Loading best sellers...</div>
        ) : (
          <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4 pr-5">
            {bestSellers.map((product) => (
              <div key={product._id || product.id} className="w-[280px] flex-shrink-0 bg-white rounded-[20px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-row items-center relative group">
                <Link to={`/product/${getProductSlug(product.name || '')}`} className="w-[100px] h-[100px] flex justify-center items-center bg-[#F9FAFB] rounded-[14px] p-2 flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                  />
                </Link>
                
                <div className="flex flex-col ml-3 flex-grow h-full justify-between py-1">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#111827] leading-tight line-clamp-1">{product.name}</h4>
                    <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">{(product.name || '').toLowerCase().includes('milk') ? '100% Pure A2 Milk' : 'Made from Bilona Method'}</span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex flex-col">
                      <span className="text-[16px] font-bold text-[#111827]">
                        ₹{(product.name || '').toLowerCase().includes('milk') ? Math.ceil(product.price / 2) : product.price}
                      </span>
                      <div className="flex items-center mt-0.5 space-x-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-[10px] text-gray-400 font-medium ml-1">(4.8)</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="px-3 py-1.5 rounded-full border border-[#22C55E] text-[#22C55E] flex items-center justify-center font-bold text-[12px] bg-green-50/30 hover:bg-[#22C55E] hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 mr-0.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODAY'S FRESH PICKS */}
      <div className="pl-5 mt-4 mb-8">
        <div className="flex justify-between items-center mb-4 pr-5">
          <h3 className="font-bold text-[#111827] text-[18px]">Today's Fresh Picks</h3>
          <span onClick={() => navigate('/products')} className="text-[#1E3A8A] text-[13px] font-bold flex items-center cursor-pointer">
            View all <span className="ml-0.5 text-[16px]">›</span>
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">Loading picks...</div>
        ) : (
          <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-4 pr-5">
            {freshPicks.map((product) => (
              <div key={product._id || product.id} className="w-[180px] flex-shrink-0 bg-white rounded-[16px] p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-row items-center">
                <div className="w-[50px] h-[50px] flex justify-center items-center flex-shrink-0 p-1">
                  <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-sm" />
                </div>
                <div className="flex flex-col ml-2 justify-center">
                  <h4 className="text-[12px] font-bold text-[#111827] leading-tight line-clamp-2">{product.name}</h4>
                  <span className="text-[13px] font-bold text-[#1E3A8A] mt-1">₹{product.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 py-3 pb-safe border-t border-gray-100">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex flex-col items-center cursor-pointer">
            <Home className="w-6 h-6 text-[#1E3A8A]" />
            <span className="text-[10px] font-bold text-[#1E3A8A] mt-1">Home</span>
            <div className="w-1 h-1 bg-[#1E3A8A] rounded-full mt-0.5"></div>
          </div>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/products')}>
            <ShoppingBag className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 mt-1">Shop</span>
            <div className="w-1 h-1 bg-transparent rounded-full mt-0.5"></div>
          </div>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/subscription')}>
            <CalendarCheck className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 mt-1">Subscription</span>
            <div className="w-1 h-1 bg-transparent rounded-full mt-0.5"></div>
          </div>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/my-account')}>
            <Package className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 mt-1">Orders</span>
            <div className="w-1 h-1 bg-transparent rounded-full mt-0.5"></div>
          </div>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/my-account')}>
            <User className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 mt-1">Profile</span>
            <div className="w-1 h-1 bg-transparent rounded-full mt-0.5"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
