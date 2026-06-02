import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import { productSEOData } from '../../data/products-seo';
import { buildBreadcrumbSchema } from '../../data/schemas';
import api from '../../utils/api.js';

const ProductPage = () => {
  const { slug } = useParams();
  const product = productSEOData[slug];

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', quantity: '', message: ''
  });
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const { data } = await api.get('/api/products');
        // Match by image or exact name
        const dbProduct = data.find(p => p.image === product?.image || p.name === product?.name);
        const stockLevel = dbProduct ? (dbProduct.stock || 0) : 0;
        if (dbProduct && stockLevel <= 0) {
          setIsOutOfStock(true);
        }
      } catch (err) {
        console.error("Error fetching stock:", err);
      } finally {
        setLoadingStock(false);
      }
    };
    if (product) {
      fetchStock();
    }
  }, [product]);

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const breadcrumbs = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/product/${slug}` }
  ]);

  const finalSchema = [...product.schema, breadcrumbs];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Inquiry submitted successfully! Our team will contact you shortly.');
    setFormData({ name: '', phone: '', email: '', quantity: '', message: '' });
  };

  return (
    <div className="bg-white min-h-screen text-milquu-dark font-sans overflow-x-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/20 opacity-20 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-30 mix-blend-multiply pointer-events-none"></div>

      <SEOHead 
        title={product.title}
        description={product.description}
        keywords={product.keywords}
        canonical={`https://milquufresh.in/product/${slug}`}
        schema={finalSchema}
        ogImage={`https://milquufresh.in${product.image}`}
      />

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10 pt-20 lg:pt-0">
        
        {/* Left Side: Massive Image Container */}
        <div className="lg:w-1/2 relative flex items-center justify-center p-8 lg:p-20 min-h-[40vh] lg:h-screen lg:sticky lg:top-0 pt-12 lg:pt-20">
          
          <Link to="/products" className="absolute top-8 left-6 lg:left-12 text-gray-500 hover:text-milquu-dark transition-colors flex items-center gap-2 z-20 text-sm font-bold uppercase tracking-widest bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={18} /> Back
          </Link>
          
          <div className="relative">
            {isOutOfStock && (
              <div className="absolute top-0 right-0 z-30 bg-red-500/90 backdrop-blur-sm text-white text-sm sm:text-base font-bold px-4 py-2 rounded-full shadow-lg border border-red-400/50 -rotate-12 transform">
                OUT OF STOCK
              </div>
            )}
            <img 
              src={product.image} 
              alt={product.name} 
              className={`relative z-10 w-full max-w-[280px] sm:max-w-md lg:max-w-xl object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-700 ${!isOutOfStock ? 'hover:scale-105' : 'grayscale opacity-80'}`}
              onError={(e) => { e.target.src = '/favicon.svg'; e.target.className="w-1/2 opacity-20" }} 
            />
          </div>
        </div>

        {/* Right Side: Form & Details */}
        <div className="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex flex-col justify-center">
          
          {/* Inquiry Form Card */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[40px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-milquu-gold/20 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none"></div>

            <h2 className="text-2xl font-serif font-bold mb-6 tracking-wide text-milquu-dark">Order Inquiry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 87670 67884" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Product Interest</label>
                  <input 
                    type="text" 
                    value={product.name} 
                    readOnly 
                    className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-500 outline-none cursor-not-allowed font-sans font-semibold" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Quantity Requirement</label>
                <input 
                  type="text" 
                  placeholder="e.g., 2 Liters daily" 
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Additional Message</label>
                <textarea 
                  rows="3" 
                  placeholder="Delivery Address or any specific requests..." 
                  required
                  disabled={isOutOfStock}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans resize-none disabled:opacity-50"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={isOutOfStock || loadingStock}
                className={`w-full relative group/btn overflow-hidden rounded-full p-[1px] mt-4 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-milquu-cream via-milquu-gold/40 to-milquu-cream rounded-full opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                <div className="relative bg-gradient-to-r from-[#FFFDF9] to-[#FFF8ED] px-8 py-4 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 group-hover/btn:bg-opacity-0 group-hover/btn:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <span className="font-sans font-bold text-milquu-dark uppercase tracking-wide text-sm">
                    {loadingStock ? 'Checking...' : isOutOfStock ? 'Out of Stock' : 'Submit Inquiry'}
                  </span>
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 relative z-10">
              <Link to="/subscribe" className={`flex-1 text-center py-4 rounded-2xl border border-gray-200 font-bold tracking-wide shadow-sm font-sans transition-all ${isOutOfStock ? 'text-gray-400 bg-gray-50 pointer-events-none' : 'text-milquu-dark hover:bg-white hover:border-milquu-gold hover:text-milquu-gold'}`}>
                Subscribe Daily
              </Link>
              <Link to="/login" className={`flex-1 text-center py-4 rounded-2xl border border-gray-200 font-bold tracking-wide shadow-sm font-sans transition-all ${isOutOfStock ? 'text-gray-400 bg-gray-50 pointer-events-none' : 'text-milquu-dark hover:bg-white hover:border-milquu-gold hover:text-milquu-gold'}`}>
                One-time Order
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductPage;
