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
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <SEOHead 
        title="Our Farm to Home Process | MilQuu Fresh"
        description="Learn how MilQuu Fresh delivers pure milk from the farm to your home within 24 hours while maintaining a strict 4°C cold chain."
        keywords="farm to home milk, cold chain milk delivery, fresh milk process"
        canonical="https://milquufresh.in/our-process"
        schema={schema}
      />

      <section className="bg-milquu-blue text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Our Process</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">
            From the udder to your doorstep in under 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg prose-blue">
          <h2>The 4°C Cold Chain</h2>
          <p>
            The secret to maintaining the freshness and extending the natural shelf life of unpasteurized raw milk is temperature control. Milk leaves the cow's udder at body temperature (around 37°C), which is ideal for bacterial growth. 
          </p>
          <p>
            At MilQuu Fresh, immediately after milking, the milk is transferred to bulk milk chillers where the temperature is rapidly brought down to 4°C. 
          </p>

          <h3>Step-by-Step Delivery</h3>
          <ol>
            <li><strong>Morning/Evening Milking:</strong> Cows are milked in a hygienic, automated parlor.</li>
            <li><strong>Instant Chilling:</strong> Milk is chilled to 4°C to arrest bacterial growth.</li>
            <li><strong>Quality Testing:</strong> Samples from every batch are tested for adulterants, FAT, and SNF.</li>
            <li><strong>Insulated Transport:</strong> Milk is transported in insulated vehicles to our urban distribution hubs.</li>
            <li><strong>Last-Mile Delivery:</strong> Our delivery executives pick up the milk early morning and deliver it to your doorstep before 8:00 AM.</li>
          </ol>

          <h3>Why We Don't Standardize</h3>
          <p>
            Commercial dairy brands standardize their milk, stripping it of natural fats to achieve a uniform consistency and sell the cream separately. We deliver milk in its natural, whole form. The thickness and cream content may vary slightly based on the season and the cow's diet, which is the hallmark of truly natural milk.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default OurProcess;
