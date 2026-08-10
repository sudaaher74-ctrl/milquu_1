import React from 'react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../../data/schemas';

const OurProcess = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Our Process', url: '/our-process' }
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
        title="Our Process | MilQuu Fresh"
        description="See how MilQuu Fresh takes an order from trusted suppliers to your doorstep — choose, order, prepare, deliver."
        keywords="milk delivery process, fresh vegetable delivery process, MilQuu Fresh how it works"
        canonical="https://milquufresh.in/our-process"
        schema={schema}
      />

      <section className="bg-gradient-to-br from-milquu-blue to-blue-900 text-white pt-32 pb-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Our Process</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">
            From trusted suppliers to your doorstep.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 relative z-10 -mt-10">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 prose prose-lg prose-blue">
          <h2>How MilQuu Works</h2>
          <p>
            MilQuu Fresh doesn't own a farm or a processing facility — we're the platform that connects trusted suppliers to your doorstep, handling ordering, inventory, and delivery.
          </p>

          <h3>Choose → Order → Prepare → Deliver</h3>
          <ol>
            <li><strong>Choose:</strong> Browse fresh milk, vegetables and other available essentials.</li>
            <li><strong>Order:</strong> Select the products and quantities you need.</li>
            <li><strong>We Prepare:</strong> Your order is picked, checked and packed for delivery.</li>
            <li><strong>Delivered:</strong> Get your fresh essentials delivered to your doorstep, on schedule.</li>
          </ol>

          <h3>Quality Checks, Every Order</h3>
          <p>
            Each order is checked as part of our packing process before it goes out, so what you ordered is what arrives — fresh and on time.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default OurProcess;
