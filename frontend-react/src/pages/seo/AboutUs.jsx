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
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen pb-16 md:pb-0">
      <SEOHead
        title="About MilQuu Fresh | Fresh Essentials Delivered Daily"
        description="MilQuu Fresh is building a convenient platform for ordering milk, dairy products and other everyday fresh essentials, delivered to your doorstep in Navi Mumbai."
        keywords="about milquu fresh, fresh essentials delivery navi mumbai, milk and dairy delivery"
        canonical="https://milquufresh.in/about-us"
        schema={schema}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-milquu-blue via-blue-800 to-indigo-900 text-white pt-32 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
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
            Making everyday fresh essentials easier to get — delivered to your doorstep in Navi Mumbai.
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
              MilQuu Fresh is building a convenient platform for ordering milk, dairy products and other everyday fresh essentials. We work with trusted suppliers and milk-processing partners and bring their products closer to customers through a simple digital ordering and doorstep delivery experience.
            </p>
            <p className="text-lg md:text-xl">
              Our goal is simple: make everyday fresh shopping easier, more convenient and more reliable. Milk was where we started — we are building toward dairy delights and more everyday essentials over time.
            </p>
            <p className="text-lg md:text-xl">
              We know how much households depend on fresh milk every single morning. A missed delivery or an out-of-stock situation is not just an inconvenience — it disrupts routines and adds unnecessary stress to your day. That is why we focus first on reliability: showing up on time, every time, with the products you expect.
            </p>
            <p className="text-lg md:text-xl">
              Based in Navi Mumbai, we serve households across the region, making it easy to place standing orders or one-off deliveries, manage quantities, and never run short on the essentials your family needs.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything we do is guided by a commitment to quality, convenience, and trust. These values shape every product we source, every delivery we make, and every interaction with our customers.</p>
            <div className="w-24 h-1 bg-milquu-gold mx-auto rounded-full mt-6"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-blue-600 mt-1 bg-blue-50 p-4 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Trusted Sourcing</h3>
                <p className="text-gray-600 text-lg leading-relaxed">We partner with reputable suppliers and FSSAI-compliant processing units to ensure every product that reaches your door meets high standards of quality and safety. Our sourcing process is built around accountability and transparency.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-red-500 mt-1 bg-red-50 p-4 rounded-xl group-hover:bg-red-100 transition-colors shrink-0">
                <Heart size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Convenient Delivery</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Get everyday fresh essentials delivered to your doorstep, on a schedule that works for you. Whether you need early morning delivery before the family wakes up or a mid-day drop-off, we are here to fit around your routine, not the other way around.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-green-600 mt-1 bg-green-50 p-4 rounded-xl group-hover:bg-green-100 transition-colors shrink-0">
                <Leaf size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">Easy Ordering</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Choose what you need and order in a few simple steps — one-off or on a standing plan. Pause, modify, or cancel your subscription at any time without hassle. Our app and website are designed to make managing your fresh essentials as straightforward as possible.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group bg-white/60 backdrop-blur-xl p-8 rounded-[24px] hover:bg-white/80 transition-all duration-300 shadow-[0_4px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-2 border border-white/60 flex gap-5">
              <div className="text-purple-600 mt-1 bg-purple-50 p-4 rounded-xl group-hover:bg-purple-100 transition-colors shrink-0">
                <Users size={32} />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">One Convenient Platform</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Milk, dairy products and more everyday essentials in one place, growing over time. We are continuously adding new products so you can reduce the number of apps and vendors you juggle for your daily household needs.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
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
              To make fresh everyday essentials accessible through a simple, convenient doorstep delivery experience. We believe that every household in Navi Mumbai deserves reliable access to quality dairy products without the friction of last-minute store runs or uncertain supply.
            </p>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To become a trusted everyday fresh-essentials platform for households — starting with milk and dairy products, and growing from there. We envision a future where managing your daily grocery needs is effortless, and where every delivery strengthens the trust between MilQuu Fresh and the communities we serve.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Why MilQuu Fresh */}
      <section className="py-16 px-4 bg-white/60">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">Why Choose MilQuu Fresh?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-xl font-bold text-milquu-blue mb-3">Fresh Every Morning</h3>
              <p className="text-gray-600 leading-relaxed">Our milk and dairy products are sourced and dispatched daily, ensuring maximum freshness from farm to your doorstep.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-milquu-blue mb-3">Flexible Subscriptions</h3>
              <p className="text-gray-600 leading-relaxed">Set up a daily, alternate-day, or weekly delivery plan. Pause or cancel any time — no hidden fees, no lock-ins, no stress.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-milquu-blue mb-3">Serving Navi Mumbai</h3>
              <p className="text-gray-600 leading-relaxed">We are focused on delivering across Navi Mumbai localities, with a growing service area as we expand our network of delivery partners.</p>
            </div>
          </div>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default AboutUs;
