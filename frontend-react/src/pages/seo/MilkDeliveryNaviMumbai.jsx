import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { LocalBusinessSchema, buildFAQSchema, buildBreadcrumbSchema, commonFAQs } from '../../data/schemas';

const MilkDeliveryNaviMumbai = () => {
  const schema = [
    LocalBusinessSchema,
    buildFAQSchema(commonFAQs),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Milk Delivery Navi Mumbai', url: '/milk-delivery-navi-mumbai' }
    ])
  ];

  const locations = [
    { name: 'Panvel', link: '/milk-delivery-panvel', desc: 'A2 Cow & Buffalo Milk' },
    { name: 'New Panvel', link: '/milk-delivery-new-panvel', desc: 'Free Daily Morning Delivery' },
    { name: 'Karanjade', link: '/milk-delivery-karanjade', desc: 'Quality-Checked Milk Delivery' },
    { name: 'Kharghar', link: '/organic-milk-kharghar', desc: 'Milk & Fresh Paneer' },
    { name: 'Belapur', link: '/fresh-cow-milk-belapur', desc: 'Fresh Cow Milk Delivery' },
    { name: 'Nerul', link: '/farm-fresh-milk-nerul', desc: 'Hassle-free Daily Subscriptions' }
  ];

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <SEOHead path="/milk-delivery-navi-mumbai" />

      <section className="bg-milquu-blue text-white py-24 px-4 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight">
            Navi Mumbai's <br className="hidden md:block"/> <span className="text-yellow-400">Fresh Milk Delivery</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto font-light">
            Pure Gir cow milk and buffalo milk delivered in returnable glass bottles before 7:00 AM across Navi Mumbai.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/subscribe" className="bg-white text-milquu-blue px-8 py-3.5 rounded-xl font-bold text-base hover:bg-gray-100 transition-all shadow-lg transform hover:-translate-y-0.5 inline-block">
              Start Milk Subscription
            </Link>
            <Link to="/glass-bottle-milk-delivery" className="bg-white/15 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white hover:text-milquu-blue transition-all inline-block">
              Glass Bottle Delivery
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-4">Our Service Areas in Navi Mumbai</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Select your location below to see localized delivery timings and specific product availability in your neighborhood.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc, idx) => (
              <Link key={idx} to={loc.link} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 text-milquu-blue rounded-full flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{loc.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{loc.desc}</p>
                </div>
                <div className="flex items-center text-milquu-blue font-bold group-hover:translate-x-2 transition-transform">
                  View Local Delivery <ArrowRight size={18} className="ml-2" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-blue-50/70 border border-blue-100 rounded-2xl p-6 text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Also Delivering in Kamothe & Taloja</h3>
            <p className="text-sm text-gray-600 mb-4">
              MilQuuFresh serves Kamothe and Taloja with fresh morning milk delivery before 7:00 AM.
            </p>
            <Link to="/subscribe" className="inline-flex items-center text-milquu-blue font-bold text-sm hover:underline">
              Start Subscription for Kamothe or Taloja &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg prose-blue">
          <h2>Why Choose MilQuu Fresh in Navi Mumbai</h2>
          <p>
            In a fast-paced city like Navi Mumbai, sourcing reliable, quality milk has become increasingly difficult. MilQuu Fresh brings together trusted milk-processing partners and a simple ordering experience, so <strong>daily milk delivery in Navi Mumbai</strong> is one less thing to manage.
          </p>
          <h3>Our Commitment to Quality</h3>
          <p>
            We work to maintain a consistent cold chain from our partners to your door, helping preserve freshness along the way.
          </p>
          <h3>A Range of Dairy Products</h3>
          <p>
            Alongside <strong>A2 Cow Milk</strong> and <strong>Buffalo Milk</strong>, we also deliver fresh Paneer, Ghee, and Curd. With our <strong>daily milk subscription in Navi Mumbai</strong>, you can count on a fresh delivery right at your door.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default MilkDeliveryNaviMumbai;
