import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle, Droplets, Info } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { productSEOData } from '../../data/products-seo';
import { buildBreadcrumbSchema } from '../../data/schemas';

const ProductPage = () => {
  const { slug } = useParams();
  const product = productSEOData[slug];

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const breadcrumbs = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/product/${slug}` }
  ]);

  const finalSchema = [...product.schema, breadcrumbs];

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <SEOHead 
        title={product.title}
        description={product.description}
        keywords={product.keywords}
        canonical={`https://milquufresh.in/product/${slug}`}
        schema={finalSchema}
        ogImage={`https://milquufresh.in${product.image}`}
      />

      <div className="bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-milquu-blue">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-milquu-blue">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center border border-gray-100 relative overflow-hidden aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent opacity-50"></div>
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-3/4 object-contain relative z-10 drop-shadow-2xl"
              onError={(e) => { e.target.src = '/favicon.svg'; e.target.className="w-1/2 opacity-20" }} 
            />
          </div>

          {/* Details */}
          <div>
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
              <CheckCircle size={14} /> 100% Pure & Natural
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">{product.name}</h1>
            
            <div className="text-3xl font-bold text-milquu-blue mb-6">
              ₹{product.price} <span className="text-base text-gray-500 font-normal">/ {slug.includes('ghee') ? '1 Ltr' : slug.includes('paneer') ? '250g' : '1 Ltr'}</span>
            </div>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/subscribe" className="flex-1 bg-milquu-blue text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors shadow-md">
                Subscribe Daily
              </Link>
              <Link to="/login" className="flex-1 bg-white text-milquu-blue border-2 border-milquu-blue text-center py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <ShoppingCart size={20} /> One-time Order
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-8">
              <div className="flex items-start gap-3">
                <Droplets className="text-blue-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Farm Fresh</h4>
                  <p className="text-xs text-gray-500">Delivered within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="text-green-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">No Preservatives</h4>
                  <p className="text-xs text-gray-500">Zero adulteration guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description, Nutrition, and FAQ removed as requested */}

      <StickyMobileCTA />
    </div>
  );
};

export default ProductPage;
