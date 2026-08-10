import React from 'react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../../data/schemas';

const OurFarm = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Our Sourcing', url: '/our-farm' }
    ])
  ];

  return (
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen pb-16 md:pb-0 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 fixed">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/5 opacity-60"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-50"></div>
      </div>
      <SEOHead
        title="Our Sourcing | MilQuu Fresh"
        description="MilQuu Fresh works with trusted milk-processing partners and vegetable suppliers to bring everyday fresh essentials to your doorstep."
        keywords="trusted milk suppliers, fresh vegetable suppliers, MilQuu Fresh sourcing"
        canonical="https://milquufresh.in/our-farm"
        schema={schema}
      />

      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white pt-32 pb-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">How We Source</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">
            Trusted partners, quality you can rely on.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 relative z-10 -mt-10">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 prose prose-lg prose-green">
          <h2>Trusted Suppliers, Not a Middleman-Free Story</h2>
          <p>
            MilQuu Fresh does not run its own dairy farm or vegetable farm. We work with trusted milk-processing partners and vegetable suppliers, and focus on what we do best: convenient ordering, careful handling, and reliable doorstep delivery.
          </p>

          <h3>Milk Supply</h3>
          <p>
            Our milk comes from established milk-processing partners. Once it reaches us, we manage inventory and order preparation so your daily crate is ready and delivered on schedule.
          </p>

          <h3>Vegetable Supply</h3>
          <p>
            Vegetables are sourced from trusted local suppliers. Our team sorts, packs, and prepares each order before it heads out for delivery.
          </p>

          <h3>Quality Checks Before Delivery</h3>
          <p>
            Every order is checked as part of our packing process before it leaves for your address, so what you ordered is what arrives.
          </p>

          <h3>Where This Is Headed</h3>
          <p>
            Milk was our starting point. We're building MilQuu Fresh into a platform for everyday fresh essentials — starting with vegetables, and expanding over time.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default OurFarm;
