import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import { productSEOData } from '../../data/products-seo';
import { buildBreadcrumbSchema } from '../../data/schemas';

const ProductPage = () => {
  const { slug } = useParams();
  const product = productSEOData[slug];

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', quantity: '', message: ''
  });

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
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans overflow-x-hidden">
      <SEOHead 
        title={product.title}
        description={product.description}
        keywords={product.keywords}
        canonical={`https://milquufresh.in/product/${slug}`}
        schema={finalSchema}
        ogImage={`https://milquufresh.in${product.image}`}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Side: Massive Image Container */}
        <div className="lg:w-1/2 relative flex items-center justify-center p-8 lg:p-20 bg-black min-h-[50vh] lg:min-h-screen border-r border-white/5 pt-28 lg:pt-20">
          
          <Link to="/products" className="absolute top-24 lg:top-8 left-6 lg:left-8 text-white/50 hover:text-white transition-colors flex items-center gap-2 z-20 text-sm font-semibold uppercase tracking-wider">
            <ArrowLeft size={18} /> Back
          </Link>
          
          {/* Subtle glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-milquu-gold/5 to-transparent opacity-50 pointer-events-none"></div>
          
          <img 
            src={product.image} 
            alt={product.name} 
            className="relative z-10 w-full max-w-[280px] sm:max-w-md lg:max-w-2xl object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-700"
            onError={(e) => { e.target.src = '/favicon.svg'; e.target.className="w-1/2 opacity-20" }} 
          />
        </div>

        {/* Right Side: Form & Details */}
        <div className="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex flex-col justify-center bg-[#111]">
          
          <div className="mb-10 lg:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4 tracking-tight">{product.name}</h1>
            <div className="text-2xl text-milquu-gold font-bold mb-4">
              ₹{product.price} <span className="text-sm text-gray-500 font-normal">/ {slug.includes('ghee') ? '1 Ltr' : slug.includes('paneer') ? '250g' : '1 Ltr'}</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg max-w-xl">
              {product.description}
            </p>
          </div>

          {/* Inquiry Form Card (matching screenshot) */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 tracking-wide">Order Inquiry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-milquu-gold focus:ring-1 focus:ring-milquu-gold outline-none transition-all" 
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-milquu-gold focus:ring-1 focus:ring-milquu-gold outline-none transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-milquu-gold focus:ring-1 focus:ring-milquu-gold outline-none transition-all" 
                />
                <input 
                  type="text" 
                  value={product.name} 
                  readOnly 
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-5 py-4 text-gray-400 outline-none cursor-not-allowed" 
                />
              </div>
              
              <input 
                type="text" 
                placeholder="Quantity Requirement (e.g., 2 Liters daily)" 
                required
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-milquu-gold focus:ring-1 focus:ring-milquu-gold outline-none transition-all" 
              />
              
              <textarea 
                rows="3" 
                placeholder="Delivery Address or Additional Message" 
                required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-milquu-gold focus:ring-1 focus:ring-milquu-gold outline-none transition-all resize-none"
              ></textarea>
              
              <button 
                type="submit" 
                className="w-full bg-[#fbbc05] hover:bg-[#f2a900] text-black font-bold text-lg py-4 rounded-xl mt-2 transition-colors shadow-[0_0_20px_rgba(251,188,5,0.2)]"
              >
                Submit Inquiry
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
              <Link to="/subscribe" className="flex-1 text-center py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors font-semibold tracking-wide">
                Subscribe Daily
              </Link>
              <Link to="/login" className="flex-1 text-center py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 hover:border-white/40 transition-colors font-semibold tracking-wide">
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
