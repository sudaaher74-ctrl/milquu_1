import React from 'react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../../data/schemas';

const QualityAssurance = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Quality Assurance', url: '/quality-assurance' }
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
        title="Quality | MilQuu Fresh"
        description="How MilQuu Fresh approaches quality — working with trusted processing partners and checking orders before they go out for delivery."
        keywords="milk quality milquu fresh, trusted milk suppliers"
        canonical="https://milquufresh.in/quality-assurance"
        schema={schema}
      />

      <section className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white pt-32 pb-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Quality</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">
            Trusted partners, checked before delivery.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 relative z-10 -mt-10">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 prose prose-lg prose-blue">
          <h2>Trusted Processing Partners</h2>
          <p>
            MilQuu Fresh does not process milk itself — we work with trusted milk-processing partners for the products we deliver, and focus on getting them to you conveniently and reliably.
          </p>

          <h3>Checked Before It Leaves Us</h3>
          <p>
            Every order is checked as part of our packing process before it goes out for delivery, so what you ordered is what arrives.
          </p>

          <h2>A Note on Cream</h2>
          <p>
            Milk that hasn't been industrially homogenized can form a layer of malai (cream) on top when boiled — the thickness and cream content can vary batch to batch, which is normal for non-homogenized milk.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default QualityAssurance;
