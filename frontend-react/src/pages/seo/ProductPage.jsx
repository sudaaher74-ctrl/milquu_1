import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, MapPin, MessageCircle, Snowflake } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import { productSEOData, matchDbProduct } from '../../data/products-seo';
import { buildBreadcrumbSchema } from '../../data/schemas';
import { SERVED_AREAS, LOCATION_PAGES } from '../../data/locations';
import api from '../../utils/api.js';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { trackViewItem, trackGenerateLead, trackContact } from '../../utils/analytics';

const ProductPage = () => {
  const { slug } = useParams();
  const product = productSEOData[slug];

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', quantity: '', message: ''
  });
  // Live catalogue row (price, stock, pack size) from GET /api/products. The
  // static `product.price` is only a fallback if that request fails.
  const [dbProduct, setDbProduct] = useState(null);
  const [loadingStock, setLoadingStock] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('1 Litre');

  const isMilk = (product?.name || '').toLowerCase().includes('milk') || (slug || '').toLowerCase().includes('milk');
  const livePrice = dbProduct && Number(dbProduct.price) > 0 ? Number(dbProduct.price) : null;
  const basePrice = livePrice ?? product?.price ?? 64;
  const currentPrice = (isMilk && selectedUnit === '500 ml') ? Math.ceil(basePrice / 2) : basePrice;

  const stockLevel = dbProduct ? parseInt(dbProduct.stock, 10) : NaN;
  const isOutOfStock = !!dbProduct && (isNaN(stockLevel) || stockLevel <= 0);

  useEffect(() => {
    let cancelled = false;
    const fetchStock = async () => {
      try {
        const { data } = await api.get('/api/products');
        if (!cancelled) setDbProduct(matchDbProduct(product, data));
      } catch (err) {
        console.error("Error fetching stock:", err);
      } finally {
        if (!cancelled) setLoadingStock(false);
      }
    };
    if (product) {
      setLoadingStock(true);
      fetchStock();
    }
    return () => { cancelled = true; };
  }, [product]);

  // GA4 view_item — once per product view, after the real price is known.
  useEffect(() => {
    if (product && !loadingStock) {
      trackViewItem({ id: product.slug, name: product.displayName, price: basePrice, category: product.slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, loadingStock]);

  // Structured data: the registry's markup plus a real Offer once the live
  // price/stock are known (prices are never asserted from static data).
  const schema = useMemo(() => {
    if (!product) return [];
    return [
      ...product.buildSchema(
        dbProduct && livePrice
          ? { price: livePrice, availability: isOutOfStock ? 'OutOfStock' : 'InStock' }
          : undefined
      ),
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: product.displayName, url: `/product/${slug}` }
      ])
    ];
  }, [product, slug, dbProduct, livePrice, isOutOfStock]);

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  // The form used to show an alert() and discard the enquiry. It now hands the
  // enquiry to WhatsApp, the channel the business already answers on. Personal
  // details go to WhatsApp only — analytics gets just the event.
  const handleSubmit = (e) => {
    e.preventDefault();
    const sizeNote = isMilk ? ` (${selectedUnit}, ₹${currentPrice})` : '';
    const text = [
      `Hi MilQuuFresh, I'd like to order ${product.displayName}${sizeNote}.`,
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      formData.email ? `Email: ${formData.email}` : '',
      `Quantity: ${formData.quantity}`,
      `Address / notes: ${formData.message}`,
    ].filter(Boolean).join('\n');
    trackGenerateLead('product_whatsapp_inquiry');
    trackContact('whatsapp', 'product_inquiry');
    window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
    setFormData({ name: '', phone: '', email: '', quantity: '', message: '' });
  };

  const related = product.related.map((r) => productSEOData[r]).filter(Boolean);
  const unitLabel = isMilk ? selectedUnit : (dbProduct?.unit || 'unit');
  const pageClass = 'bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]';

  return (
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen text-milquu-dark font-sans overflow-x-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/20 opacity-20 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-30 mix-blend-multiply pointer-events-none"></div>

      <SEOHead path={`/product/${slug}`} schema={schema} />

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
            {/* Primary (LCP) image: eager + high priority, never lazy. */}
            <img 
              src={product.image} 
              alt={`${product.displayName} from MilQuuFresh`} 
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className={`relative z-10 w-full max-w-[280px] sm:max-w-md lg:max-w-xl object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-700 ${!isOutOfStock ? 'hover:scale-105' : 'grayscale opacity-80'}`}
              onError={(e) => { e.target.src = '/brand-logo.jpg'; e.target.className="w-1/2 opacity-20" }} 
            />
          </div>
        </div>

        {/* Right Side: Details, Form & Content */}
        <div className="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex flex-col justify-center gap-8">

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="max-w-2xl text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-milquu-blue transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li><Link to="/products" className="hover:text-milquu-blue transition-colors">Products</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page" className="font-semibold text-milquu-dark">{product.displayName}</li>
            </ol>
          </nav>

          {/* Heading + summary */}
          <header className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-milquu-dark mb-4">
              {product.displayName}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-5">{product.summary}</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-milquu-gold flex-shrink-0"></span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </header>
          
          {/* Inquiry Form Card */}
          <div className={`${pageClass} max-w-2xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-milquu-gold/20 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-2xl font-serif font-bold tracking-wide text-milquu-dark">Order Inquiry</h2>
              <div className="text-right">
                <span className="text-2xl font-bold text-milquu-blue">₹{currentPrice}</span>
                <span className="text-xs text-gray-500 block font-medium">per {unitLabel}</span>
              </div>
            </div>

            {/* Milk Size Variant Selector */}
            {isMilk && (
              <div className="mb-6 p-1.5 bg-gray-100/80 rounded-2xl flex items-center gap-2 border border-gray-200 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnit('1 Litre');
                    setFormData(prev => ({
                      ...prev,
                      quantity: prev.quantity.includes('500') ? '1 Litre daily' : (prev.quantity || '1 Litre daily')
                    }));
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center transition-all cursor-pointer ${
                    selectedUnit === '1 Litre'
                      ? 'bg-white text-milquu-blue shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>1 Litre</span>
                  <span className="text-[11px] font-semibold text-gray-400">₹{basePrice}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnit('500 ml');
                    setFormData(prev => ({
                      ...prev,
                      quantity: prev.quantity.includes('1') ? '500 ml daily' : (prev.quantity || '500 ml daily')
                    }));
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center transition-all cursor-pointer ${
                    selectedUnit === '500 ml'
                      ? 'bg-white text-emerald-700 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>500 ml</span>
                  <span className="text-[11px] font-semibold text-gray-400">₹{Math.ceil(basePrice / 2)}</span>
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="pp-name" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    id="pp-name"
                    type="text" 
                    placeholder="John Doe" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans" 
                  />
                </div>
                <div>
                  <label htmlFor="pp-phone" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    id="pp-phone"
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
                  <label htmlFor="pp-email" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    id="pp-email"
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans" 
                  />
                </div>
                <div>
                  <label htmlFor="pp-product" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Product Interest</label>
                  <input 
                    id="pp-product"
                    type="text" 
                    value={product.displayName} 
                    readOnly 
                    className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-gray-500 outline-none cursor-not-allowed font-sans font-semibold" 
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="pp-qty" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Quantity Requirement</label>
                <input 
                  id="pp-qty"
                  type="text" 
                  placeholder="e.g., 2 Liters daily" 
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 outline-none transition-all font-sans" 
                />
              </div>
              
              <div>
                <label htmlFor="pp-msg" className="block text-sm font-sans font-semibold text-gray-700 mb-2">Additional Message</label>
                <textarea 
                  id="pp-msg"
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
                  <MessageCircle size={18} className="text-milquu-gold" />
                  <span className="font-sans font-bold text-milquu-dark uppercase tracking-wide text-sm">
                    {loadingStock ? 'Checking...' : isOutOfStock ? 'Out of Stock' : 'Send Inquiry on WhatsApp'}
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

          {/* About this product */}
          <section className={`${pageClass} max-w-2xl`} aria-labelledby="about-product">
            <h2 id="about-product" className="text-2xl font-serif font-bold mb-3">About {product.displayName}</h2>
            <p className="text-gray-600 leading-relaxed">{product.details}</p>
            {product.packaging === 'glass' && (
              <p className="mt-4 text-sm text-gray-600">
                This product comes in glass bottles.{' '}
                <Link to="/glass-bottle-milk-delivery" className="font-semibold text-milquu-blue hover:underline">
                  Read about our glass bottle milk delivery
                </Link>.
              </p>
            )}
            <h3 className="mt-6 mb-2 text-lg font-serif font-bold flex items-center gap-2">
              <Snowflake size={18} className="text-milquu-blue" /> Storage
            </h3>
            <p className="text-gray-600 leading-relaxed">{product.storage}</p>
          </section>

          {/* Delivery availability */}
          <section className={`${pageClass} max-w-2xl`} aria-labelledby="delivery-areas">
            <h2 id="delivery-areas" className="text-2xl font-serif font-bold mb-3 flex items-center gap-2">
              <MapPin size={22} className="text-milquu-gold" /> Delivery areas
            </h2>
            <p className="text-gray-600 mb-4">
              MilQuuFresh currently delivers in the following parts of Navi Mumbai.{' '}
              <Link to="/milk-delivery-navi-mumbai" className="font-semibold text-milquu-blue hover:underline">See all delivery areas</Link>.
            </p>
            <ul className="flex flex-wrap gap-2">
              {SERVED_AREAS.map((area) => {
                const page = LOCATION_PAGES.find((p) => p.areaSlug === area.slug);
                const chip = 'inline-block px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white';
                return (
                  <li key={area.slug}>
                    {page
                      ? <Link to={page.path} className={`${chip} text-milquu-blue hover:border-milquu-gold`}>{area.name}</Link>
                      : <span className={`${chip} text-gray-700`}>{area.name}</span>}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* FAQs (rendered visibly — they're the source of the FAQ markup) */}
          {product.faqs.length > 0 && (
            <section className={`${pageClass} max-w-2xl`} aria-labelledby="product-faqs">
              <h2 id="product-faqs" className="text-2xl font-serif font-bold mb-4">Frequently asked questions</h2>
              <div className="space-y-4">
                {product.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-bold text-gray-800 mb-1">{faq.question}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <section className="max-w-2xl" aria-labelledby="related-products">
              <h2 id="related-products" className="text-2xl font-serif font-bold mb-4">You may also like</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link to={`/product/${r.slug}`} className="block h-full bg-white/80 border border-white/60 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <img src={r.image} alt={`${r.displayName} from MilQuuFresh`} loading="lazy" decoding="async" className="mx-auto h-24 object-contain mb-3" />
                      <span className="text-sm font-bold text-milquu-dark">{r.displayName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductPage;
