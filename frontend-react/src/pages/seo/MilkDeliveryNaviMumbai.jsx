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
      <SEOHead
        title="Milk Delivery in Navi Mumbai | MilQuu Fresh"
        description="MilQuu Fresh delivers A2 cow milk, buffalo milk, paneer, and ghee to Panvel, Kharghar, Nerul & more in Navi Mumbai, sourced from trusted partners."
        keywords="milk delivery navi mumbai, daily milk subscription navi mumbai, fresh dairy products navi mumbai, A2 milk navi mumbai"
        canonical="https://milquufresh.in/milk-delivery-navi-mumbai"
        schema={schema}
      />

      <section className="bg-milquu-blue text-white py-24 px-4 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight">
            Navi Mumbai's <br className="hidden md:block"/> <span className="text-yellow-400">Fresh Milk Delivery</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto font-light">
            Milk sourced from trusted partners, delivered to your doorstep every morning before 8 AM.
          </p>
          <Link to="/subscribe" className="bg-white text-milquu-blue px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:-translate-y-1 inline-block">
            Start Your Free Trial
          </Link>
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
