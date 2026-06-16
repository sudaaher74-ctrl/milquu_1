import React from 'react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../../data/schemas';

const OurFarm = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Our Farm', url: '/our-farm' }
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
        title="Our Ethical Dairy Farms | MilQuu Fresh"
        description="Discover the ethical dairy farms behind MilQuu Fresh. Happy cows, natural grazing, and hygienic milking processes ensure the highest quality A2 milk."
        keywords="ethical dairy farm, happy cows, A2 milk farm, free grazing cows"
        canonical="https://milquufresh.in/our-farm"
        schema={schema}
      />

      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white pt-32 pb-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Our Farms & Cattle</h1>
          <p className="text-xl md:text-2xl font-light opacity-90">
            Where happy cows produce the healthiest milk.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 relative z-10 -mt-10">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 prose prose-lg prose-green">
          <h2>Ethical Dairy Farming</h2>
          <p>
            At MilQuu Fresh, we believe that the quality of milk is directly linked to the well-being of the cattle. Our partner farms practice ethical dairy farming, ensuring a stress-free environment for our Gir cows and Murrah buffaloes.
          </p>

          <h3>Natural Diet & Free Grazing</h3>
          <p>
            Unlike commercial mega-dairies where cattle are confined, our animals enjoy open spaces. They are fed a scientifically balanced, natural diet of fresh green fodder, dry hay, and essential minerals. We strictly prohibit the use of genetically modified feed, ensuring the milk remains 100% natural.
          </p>

          <h3>No Oxytocin or Hormones</h3>
          <p>
            To artificially boost milk production, many commercial dairies inject cows with hormones like Oxytocin. We have a zero-tolerance policy towards this. Our cows are milked naturally, preserving the natural hormonal balance of the milk which is safe for children and pregnant women.
          </p>

          <h3>Hygienic Milking Process</h3>
          <p>
            The milking process is conducted in highly hygienic environments using automated milking machines. This "untouched by human hands" approach minimizes the risk of bacterial contamination and maintains the milk's purity right from the udder to the chilling tank.
          </p>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default OurFarm;
