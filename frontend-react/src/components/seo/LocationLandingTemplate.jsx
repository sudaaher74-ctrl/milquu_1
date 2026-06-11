import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck, ShieldCheck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import SEOHead from '../seo/SEOHead';
import StickyMobileCTA from '../seo/StickyMobileCTA';
import { LocalBusinessSchema, buildFAQSchema, buildBreadcrumbSchema, commonFAQs } from '../../data/schemas';

const LocationLandingTemplate = ({ 
  locationName, 
  title, 
  description, 
  keywords,
  heroSubtitle,
  slug,
  customFAQs = [],
  mainContent
}) => {
  const combinedFAQs = [...customFAQs, ...commonFAQs].slice(0, 5); // Take 5 FAQs max
  
  const schema = [
    LocalBusinessSchema,
    buildFAQSchema(combinedFAQs),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: `${locationName} Delivery`, url: `/${slug}` }
    ])
  ];

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
        canonical={`https://milquufresh.in/${slug}`}
        schema={schema}
      />

      {/* Hero Section */}
      <section className="bg-milquu-blue text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <MapPin size={18} />
            <span className="font-semibold tracking-wide">Serving {locationName} & Nearby Areas</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight">
            Premium Farm Fresh Milk Delivery in <span className="text-yellow-400">{locationName}</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto font-light">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/subscribe" className="bg-white text-milquu-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:-translate-y-1">
              Start Subscription
            </Link>
            <Link to="/products" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-gray-100 bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 text-milquu-blue rounded-full flex items-center justify-center mb-3">
              <Truck size={24} />
            </div>
            <h3 className="font-bold text-gray-800">Free Daily Delivery</h3>
            <p className="text-sm text-gray-500">Before 8:00 AM</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-gray-800">100% Pure</h3>
            <p className="text-sm text-gray-500">No Preservatives</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-gray-800">Farm to Home</h3>
            <p className="text-sm text-gray-500">Within 24 Hours</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-gray-800">A2 Certified</h3>
            <p className="text-sm text-gray-500">Desi Gir Cows</p>
          </div>
        </div>
      </section>

      {/* Main Content Area (SEO Text) */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg prose-blue">
          {mainContent}
        </div>
      </section>

      {/* Popular Products Localized */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold font-serif text-center mb-12">Popular Dairy Deliveries in {locationName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <img src="/img/products/a2-cow-milk.png" alt="A2 Cow Milk" className="h-full object-cover" onError={(e) => e.target.style.display='none'} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">A2 Farm Fresh Cow Milk</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">Pure, natural A2 milk from free-grazing Gir cows. Delivered fresh every morning.</p>
              <Link to="/product/farm-fresh-cow-milk" className="text-milquu-blue font-bold flex items-center hover:underline">
                View Details <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <img src="/img/products/buffalo-milk.png" alt="Buffalo Milk" className="h-full object-cover" onError={(e) => e.target.style.display='none'} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Buffalo Milk</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">Thick, creamy buffalo milk perfect for making tea, coffee, curd, and homemade sweets.</p>
              <Link to="/product/pure-buffalo-milk" className="text-milquu-blue font-bold flex items-center hover:underline">
                View Details <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <img src="/img/products/desi-ghee.png" alt="Desi Cow Ghee" className="h-full object-cover" onError={(e) => e.target.style.display='none'} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bilona A2 Cow Ghee</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">Traditional bilona churned A2 ghee with rich aroma, golden texture, and immense health benefits.</p>
              <Link to="/product/desi-cow-ghee" className="text-milquu-blue font-bold flex items-center hover:underline">
                View Details <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-serif text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {combinedFAQs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-50 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold font-serif text-gray-800 mb-6">Ready for Fresh Milk in {locationName}?</h2>
          <p className="text-gray-600 text-lg mb-8">Join hundreds of families in {locationName} who start their day with MilQuu Fresh. Setup your daily subscription today.</p>
          <Link to="/subscribe" className="bg-milquu-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-md inline-block">
            Setup Daily Delivery
          </Link>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default LocationLandingTemplate;
