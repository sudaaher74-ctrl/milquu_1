import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, ShoppingCart, Search, ScanLine, Heart, ChevronRight, Plus, ChevronDown, ShieldCheck, Truck, Droplets, MapPin, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const MobileHome = () => {
  const navigate = useNavigate();
  const { cartCount, cartItems, addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const banners = [
    '/img/mobilebanner.webp',
    '/img/coemilkbanner.webp',
    '/img/buffalomilkbanner.webp',
    '/img/cowgheebanner.webp'
  ];

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products');
        // Filter some best sellers (just taking the first 4 for the mockup feel)
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isMilk = product.name.toLowerCase().includes('milk');
    const selectedUnit = '500 ml'; // default for mobile quick add
    const currentPrice = isMilk ? Math.ceil(product.price / 2) : product.price;

    const productToAdd = {
      ...product,
      _id: isMilk ? `${product._id}-500ml` : product._id,
      id: isMilk ? `${product.id || product._id}-500ml` : (product.id || product._id),
      price: currentPrice,
      unit: isMilk ? selectedUnit : product.unit,
      name: isMilk ? `${product.name} (500 ml)` : product.name
    };
    addToCart(productToAdd);
  };

  const quickLinks = [
    { name: 'All', isIcon: true, icon: <div className="w-[22px] h-[22px] grid grid-cols-2 gap-[2px]"><div className="bg-[#1a365d] rounded-[3px]"></div><div className="bg-[#1a365d] rounded-[3px]"></div><div className="bg-[#1a365d] rounded-[3px]"></div><div className="bg-[#1a365d] rounded-[3px]"></div></div>, active: true },
    { name: 'Milk', image: '/img/cowmilk.webp' },
    { name: 'Ghee', image: '/img/cowghee.webp' },
    { name: 'Paneer', image: '/img/panner.webp' },
    { name: 'Curd', image: '/img/Dahi.webp' },
    { name: 'Butter', image: '/img/categoris1.webp' },
    { name: 'More', isIcon: true, icon: <ChevronDown className="w-6 h-6 text-[#1a365d]" /> }
  ];

  const categories = [
    { name: 'Milk', image: '/img/cowmilk.webp' },
    { name: 'Ghee', image: '/img/cowghee.webp' },
    { name: 'Paneer', image: '/img/panner.webp' },
    { name: 'Curd', image: '/img/Dahi.webp' },
    { name: 'Butter', image: '/img/categoris1.webp' },
    { name: 'Flavoured Milk', image: '/img/lassi.webp' },
  ];

  const features = [
    { title: 'Quality You Can Trust', desc: 'Tested & Certified', icon: <ShieldCheck className="w-5 h-5 text-white" /> },
    { title: 'From Our Farms', desc: 'Sourced Daily', icon: <MapPin className="w-5 h-5 text-white" /> },
    { title: 'Super Fast Delivery', desc: 'On Time, Every Time', icon: <Truck className="w-5 h-5 text-white" /> },
    { title: 'Safe & Hygienic', desc: 'Packed with Care', icon: <Droplets className="w-5 h-5 text-white" /> },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-28 font-sans w-full max-w-[100vw] overflow-x-hidden md:hidden">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Menu className="text-[#1a365d] w-7 h-7" onClick={() => navigate('/menu')} />
          <img src="/brand-logo.jpg" alt="MilQuu Fresh" className="h-10 object-contain rounded-full" />
          <div className="flex items-center space-x-3">
            <Bell className="text-[#1a365d] w-6 h-6" />
            <div className="relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="text-[#1a365d] w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#1a365d] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 pb-3 pt-1">
          <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm">
            <Search className="text-[#1a365d] w-5 h-5 mr-3" />
            <input 
              type="text" 
              placeholder="Search for milk, ghee, paneer, curd..." 
              className="bg-transparent flex-grow outline-none text-[14px] text-gray-700 font-medium placeholder-gray-400" 
            />
            <ScanLine className="text-gray-500 w-5 h-5 ml-2" />
            <div className="w-px h-5 bg-gray-200 mx-3"></div>
            <Heart className="text-gray-500 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="px-4 py-4 overflow-x-auto hide-scrollbar flex space-x-3 bg-white">
        {quickLinks.map((link, idx) => (
          <div key={idx} className="flex flex-col items-center flex-shrink-0 w-[70px]">
            <div className={`w-[60px] h-[60px] rounded-[18px] flex items-center justify-center mb-2 ${link.active ? 'bg-[#f0f4f8] border border-[#d0dbeb]' : 'bg-white border border-gray-100 shadow-sm'}`}>
              {link.isIcon ? (
                link.icon
              ) : (
                <img src={link.image} alt={link.name} className="w-[42px] h-[42px] object-contain drop-shadow-sm" />
              )}
            </div>
            <span className={`text-[12px] font-bold ${link.active ? 'text-[#1a365d]' : 'text-gray-800'}`}>{link.name}</span>
          </div>
        ))}
      </div>

      {/* HERO BANNER CAROUSEL */}
      <div className="px-4 py-2 bg-white">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-lg h-[230px] flex snap-x snap-mandatory overflow-x-auto hide-scrollbar"
          onScroll={(e) => {
            const scrollLeft = e.target.scrollLeft;
            const width = e.target.offsetWidth;
            const newIndex = Math.round(scrollLeft / width);
            if (newIndex !== currentBannerIndex) {
              setCurrentBannerIndex(newIndex);
            }
          }}
        >
          {banners.map((banner, idx) => (
            <div key={idx} className="min-w-full h-full snap-center flex-shrink-0 relative">
              <img src={banner} alt={`Banner ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-[6px] rounded-full transition-all duration-300 ${
                currentBannerIndex === idx ? 'w-[16px] bg-[#1a365d]' : 'w-[6px] bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* WHY CHOOSE / FEATURES */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex overflow-x-auto hide-scrollbar space-x-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center flex-shrink-0 space-x-3">
              <div className="w-[42px] h-[42px] rounded-full bg-[#1a365d] flex items-center justify-center flex-shrink-0 shadow-md">
                {feature.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">{feature.title}</span>
                <span className="text-[11px] text-gray-500 font-medium">{feature.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHOP BY CATEGORY */}
      <div className="px-4 mt-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-[#1a365d] font-bold text-[#1a365d] text-[18px]">Shop by Category</h3>
          <span onClick={() => navigate('/products')} className="text-[#1a365d] text-[13px] font-bold flex items-center cursor-pointer">
            View all <ChevronRight className="w-4 h-4 ml-0.5" />
          </span>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar space-x-4 pb-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center flex-shrink-0 w-20" onClick={() => navigate('/products')}>
              <div className="w-[72px] h-[72px] rounded-full bg-white mb-2 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-[54px] h-[54px] object-contain drop-shadow-md scale-[1.15]" />
              </div>
              <span className="text-[12px] font-medium text-gray-800 text-center leading-tight">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BEST SELLERS */}
      <div className="px-4 mt-8 mb-12">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-[#1a365d] font-bold text-[#1a365d] text-[18px]">Best Sellers</h3>
          <span onClick={() => navigate('/products')} className="text-[#1a365d] text-[13px] font-bold flex items-center cursor-pointer">
            View all <ChevronRight className="w-4 h-4 ml-0.5" />
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">Loading best sellers...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product._id || product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col relative group">
                <Link to={`/product/${getProductSlug(product.name)}`} className="block flex-grow relative pb-3 mb-3 border-b border-gray-50">
                  <div className="h-[120px] w-full flex justify-center items-center">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-auto object-contain drop-shadow-md scale-105"
                    />
                  </div>
                </Link>
                
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 font-medium mb-1">{product.name.toLowerCase().includes('milk') ? '500 ml' : product.unit || '1 Pack'}</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[18px] font-bold text-[#1a365d]">
                      ₹{product.name.toLowerCase().includes('milk') ? Math.ceil(product.price / 2) : product.price}
                    </span>
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-8 h-8 rounded-full bg-[#1a365d] flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING CART (Only show if items in cart) */}
      {cartCount > 0 && (
        <div className="fixed bottom-[85px] left-4 right-4 z-50">
          <div className="bg-[#1a365d] rounded-full py-3 px-5 flex justify-between items-center shadow-[0_12px_30px_rgba(26,54,93,0.4)]">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="w-8 h-8 text-white" />
                <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex justify-center items-center border-2 border-[#1a365d]">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[14px] font-bold leading-tight">{cartCount} {cartCount === 1 ? 'Item' : 'Items'} in cart</span>
                <span className="text-green-400 text-[11px] font-medium leading-tight mt-0.5">You are saving ₹18 on this order</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold text-[16px]">₹{cartTotal}</span>
              <button 
                onClick={() => navigate('/cart')}
                className="bg-white text-[#1a365d] text-[13px] font-bold px-4 py-2 rounded-full flex items-center"
              >
                View Cart <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHome;
