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
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <SEOHead 
        title="Milk Quality Assurance & Testing | MilQuu Fresh"
        description="We take milk purity seriously. Discover our 20+ stringent quality tests ensuring your milk is free from water, urea, detergents, and synthetic hormones."
        keywords="milk quality testing, unadulterated milk, pure milk guarantee, milk adulteration test"
        canonical="https://milquufresh.in/quality-assurance"
        schema={schema}
      />

      <section className="bg-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Quality Assurance</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">
            Rigorous testing to guarantee 100% pure, unadulterated dairy.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg prose-blue">
          <h2>Zero Adulteration Guarantee</h2>
          <p>
            Adulteration in milk is a rampant issue in India, with water, urea, starch, and even detergents being commonly found in loose milk. MilQuu Fresh operates on a zero-tolerance policy towards adulteration. 
          </p>

          <h3>Our Testing Protocols</h3>
          <p>
            Every single batch of milk received from our partner farms undergoes strict testing before it is approved for chilling and distribution. Our daily tests include:
          </p>
          <ul>
            <li><strong>Lactometer Test:</strong> To detect added water and ensure proper density.</li>
            <li><strong>FAT & SNF Testing:</strong> To ensure the milk meets nutritional standards naturally.</li>
            <li><strong>Urea Test:</strong> To detect synthetic urea often added to artificially boost SNF.</li>
            <li><strong>Detergent & Soap Test:</strong> To check for synthetic emulsifiers.</li>
            <li><strong>Starch & Maltodextrin Test:</strong> To detect artificial thickeners.</li>
            <li><strong>Antibiotic Residue Test:</strong> Random checks to ensure the milk is antibiotic-free.</li>
          </ul>

          <h2>Why the Cream Forms on Top</h2>
          <p>
            Since we do not homogenize our milk, you will notice a thick layer of malai (cream) forming on top when you boil it. Homogenization is an industrial process that breaks down fat molecules so they remain suspended in the milk. By skipping this unnatural process, we ensure the milk is easier to digest and you get to enjoy rich, natural cream.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default QualityAssurance;
