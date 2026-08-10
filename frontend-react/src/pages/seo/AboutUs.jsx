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
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen pb-16 md:pb-0 relative overflow-hidden">
      <SEOHead
        title="About MilQuu Fresh | Fresh Essentials Delivered Daily"
        description="MilQuu Fresh is building a convenient platform for ordering milk, vegetables and other everyday fresh essentials, delivered to your doorstep in Navi Mumbai."
        keywords="about milquu fresh, fresh essentials delivery navi mumbai, milk and vegetable delivery"
        canonical="https://milquufresh.in/about-us"
        schema={schema}
      />

      {/* Hero Section with Glassmorphism & Gradient */}
      <section className="relative bg-gradient-to-br from-milquu-blue via-blue-800 to-indigo-900 text-white pt-32 pb-32 px-4 overflow-hidden z-10">
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
            Making everyday fresh essentials easier to get.
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
          className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl p-10 md:p-14 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 -mt-20 relative z-20"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-milquu-blue mb-6">Our Story</h2>
          <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose">
            <p className="text-lg md:text-xl">
              MilQuu Fresh is building a convenient platform for ordering milk, vegetables and other everyday fresh essentials. We work with trusted suppliers and milk-processing partners and bring their products closer to customers through a simple digital ordering and doorstep delivery experience.
            </p>
            <p className="text-lg md:text-xl">
              Our goal is simple: make everyday fresh shopping easier, more convenient and more reliable. Milk was where we started — we're building toward vegetables and more everyday essentials over time.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Core Values with Animated Cards */}
      <section className="py-16 px-4 relative z-10">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/5 opacity-60"></div>
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-50"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
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
            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-blue-600 mt-1 bg-blue-50 p-4 rounded-xl group-hover:bg-blue-100 transition-colors">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Trusted Sourcing</h3>
                <p className="text-gray-600 text-lg leading-relaxed">We work with trusted suppliers and processing partners for everything we deliver.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-red-500 mt-1 bg-red-50 p-4 rounded-xl group-hover:bg-red-100 transition-colors">
                <Heart size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Convenient Delivery</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Get everyday fresh essentials delivered to your doorstep, on a schedule that works for you.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-green-600 mt-1 bg-green-50 p-4 rounded-xl group-hover:bg-green-100 transition-colors">
                <Leaf size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Easy Ordering</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Choose what you need and order in a few simple steps — one-off or on a standing plan.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-purple-600 mt-1 bg-purple-50 p-4 rounded-xl group-hover:bg-purple-100 transition-colors">
                <Users size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">One Convenient Platform</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Milk, vegetables and more everyday essentials in one place, growing over time.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 text-center md:text-left"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To make fresh everyday essentials accessible through a simple, convenient doorstep delivery experience.
            </p>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To become a trusted everyday fresh-essentials platform for households — starting with milk and vegetables, and growing from there.
            </p>
          </div>
        </motion.div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default AboutUs;
