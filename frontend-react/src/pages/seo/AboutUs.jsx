import React from 'react';
import SEOHead from '../../components/seo/SEOHead';
import { ShieldCheck, Heart, Leaf, Users } from 'lucide-react';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../../data/schemas';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';

const AboutUs = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About Us', url: '/about-us' }
    ])
  ];

  return (
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <SEOHead 
        title="About MilQuu Fresh | Premium Dairy Brand in Navi Mumbai"
        description="Learn about MilQuu Fresh's journey to becoming Navi Mumbai's most trusted premium dairy brand. Discover our commitment to pure, ethical, and farm-fresh milk."
        keywords="about milquu fresh, premium dairy navi mumbai, pure milk brand, ethical dairy farming"
        canonical="https://milquufresh.in/about-us"
        schema={schema}
      />

      <section className="bg-milquu-blue text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">About MilQuu Fresh</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">
            Redefining dairy by bringing 100% natural, unadulterated milk from happy cows directly to your family.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg prose-blue">
          <h2>Our Story</h2>
          <p>
            MilQuu Fresh was born out of a simple yet profound realization: the milk we consume every day has lost its natural goodness. Between heavy processing, long supply chains, and rampant adulteration, the true essence of dairy was being compromised. 
          </p>
          <p>
            We set out on a mission to change that. Based in Navi Mumbai, we started by partnering with local ethical farms that prioritize animal welfare and natural grazing. By cutting out the middlemen and managing our own cold-chain logistics, we ensure that the milk reaches your home within hours of milking, retaining its full nutritional profile.
          </p>

          <h2>Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-10">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex gap-4">
              <div className="text-blue-600 mt-1"><ShieldCheck size={28} /></div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Uncompromised Purity</h3>
                <p className="text-gray-600">Zero adulteration. No water, no preservatives, no powder added. Just pure milk.</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex gap-4">
              <div className="text-red-500 mt-1"><Heart size={28} /></div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Ethical Treatment</h3>
                <p className="text-gray-600">Our cows and buffaloes are treated with love, fed natural fodder, and never given synthetic hormones.</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex gap-4">
              <div className="text-green-600 mt-1"><Leaf size={28} /></div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Farm Fresh Guarantee</h3>
                <p className="text-gray-600">Delivered within 24 hours of milking, maintaining a strict cold chain to ensure maximum freshness.</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex gap-4">
              <div className="text-purple-600 mt-1"><Users size={28} /></div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Community First</h3>
                <p className="text-gray-600">We support local farmers with fair pricing while providing urban families with reliable nutrition.</p>
              </div>
            </div>
          </div>

          <h2>Why E-E-A-T Matters to Us</h2>
          <p>
            We take our role in your daily nutrition seriously. Our commitment to <strong>Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T)</strong> is reflected in every drop of milk we deliver. From rigorous lab testing to transparent farm practices, we aim to be the dairy brand you can trust implicitly.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default AboutUs;
