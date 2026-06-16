import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Leaf, Users } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../../data/schemas';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const AboutUs = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About Us', url: '/about-us' }
    ])
  ];

  return (
    <div className="bg-milquu-cream min-h-screen pb-16 md:pb-0 relative overflow-hidden">
      <SEOHead 
        title="About MilQuu Fresh | Premium Dairy Brand in Navi Mumbai"
        description="Learn about MilQuu Fresh's journey to becoming Navi Mumbai's most trusted premium dairy brand. Discover our commitment to pure, ethical, and farm-fresh milk."
        keywords="about milquu fresh, premium dairy navi mumbai, pure milk brand, ethical dairy farming"
        canonical="https://milquufresh.in/about-us"
        schema={schema}
      />

      {/* Hero Section with Glassmorphism & Gradient */}
      <section className="relative bg-gradient-to-br from-milquu-blue via-blue-800 to-indigo-900 text-white py-32 px-4 overflow-hidden">
        {/* Animated background blobbing */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" 
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold font-serif mb-6 drop-shadow-lg"
          >
            About MilQuu Fresh
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl font-light opacity-90 max-w-3xl mx-auto leading-relaxed"
          >
            Redefining dairy by bringing 100% natural, unadulterated milk from happy cows directly to your family.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="max-w-4xl mx-auto glass p-10 md:p-14 rounded-3xl -mt-20 relative z-20"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-milquu-blue mb-6">Our Story</h2>
          <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose">
            <p className="text-lg md:text-xl">
              MilQuu Fresh was born out of a simple yet profound realization: the milk we consume every day has lost its natural goodness. Between heavy processing, long supply chains, and rampant adulteration, the true essence of dairy was being compromised. 
            </p>
            <p className="text-lg md:text-xl">
              We set out on a mission to change that. Based in Navi Mumbai, we started by partnering with local ethical farms that prioritize animal welfare and natural grazing. By cutting out the middlemen and managing our own cold-chain logistics, we ensure that the milk reaches your home within hours of milking, retaining its full nutritional profile.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Core Values with Animated Cards */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-milquu-gold mx-auto rounded-full"></div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants} className="group glass p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex gap-5">
              <div className="text-blue-600 mt-1 bg-blue-50 p-4 rounded-xl group-hover:bg-blue-100 transition-colors">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Uncompromised Purity</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Zero adulteration. No water, no preservatives, no powder added. Just pure milk.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group glass p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex gap-5">
              <div className="text-red-500 mt-1 bg-red-50 p-4 rounded-xl group-hover:bg-red-100 transition-colors">
                <Heart size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Ethical Treatment</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Our cows and buffaloes are treated with love, fed natural fodder, and never given synthetic hormones.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group glass p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex gap-5">
              <div className="text-green-600 mt-1 bg-green-50 p-4 rounded-xl group-hover:bg-green-100 transition-colors">
                <Leaf size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Farm Fresh Guarantee</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Delivered within 24 hours of milking, maintaining a strict cold chain to ensure maximum freshness.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group glass p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex gap-5">
              <div className="text-purple-600 mt-1 bg-purple-50 p-4 rounded-xl group-hover:bg-purple-100 transition-colors">
                <Users size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Community First</h3>
                <p className="text-gray-600 text-lg leading-relaxed">We support local farmers with fair pricing while providing urban families with reliable nutrition.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* EEAT Section */}
      <section className="py-20 px-4 bg-milquu-cream">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">Why E-E-A-T Matters to Us</h2>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            We take our role in your daily nutrition seriously. Our commitment to <strong className="text-milquu-blue">Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T)</strong> is reflected in every drop of milk we deliver. From rigorous lab testing to transparent farm practices, we aim to be the dairy brand you can trust implicitly.
          </p>
        </motion.div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default AboutUs;
