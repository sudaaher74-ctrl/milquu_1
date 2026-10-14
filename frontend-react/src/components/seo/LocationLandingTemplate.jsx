import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Truck, ShieldCheck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import SEOHead from '../seo/SEOHead';
import StickyMobileCTA from '../seo/StickyMobileCTA';
import { LocalBusinessSchema, buildFAQSchema, buildBreadcrumbSchema, commonFAQs } from '../../data/schemas';
import { LOCATION_PAGES, areaBySlug } from '../../data/locations';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const LocationLandingTemplate = ({ 
  locationName, 
  heroSubtitle,
  slug,
  customFAQs = [],
  mainContent
}) => {
  const combinedFAQs = [...customFAQs, ...commonFAQs].slice(0, 5); // Take 5 FAQs max
  const path = `/${slug}`;
  const otherAreas = LOCATION_PAGES.filter((p) => p.path !== path);
  
  // Title / description / canonical / robots come from the central registry
  // (src/data/seo-routes.js) so they match the prerendered HTML and sitemap.
  const schema = [
    LocalBusinessSchema,
    buildFAQSchema(combinedFAQs),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Delivery Areas', url: '/milk-delivery-navi-mumbai' },
      { name: locationName, url: path }
    ])
  ];

  return (
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen pb-16 md:pb-0 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 fixed">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/5 opacity-60"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-50"></div>
      </div>
      <SEOHead path={path} schema={schema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-milquu-blue via-blue-800 to-indigo-900 text-white py-24 md:py-32 px-4 relative overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" 
        />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
            <ol className="flex flex-wrap items-center justify-center gap-2">
              <li><Link to="/" className="hover:text-white underline-offset-2 hover:underline">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/milk-delivery-navi-mumbai" className="hover:text-white underline-offset-2 hover:underline">Delivery Areas</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">{locationName}</li>
            </ol>
          </nav>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full mb-8 shadow-lg"
          >
            <MapPin size={18} className="text-yellow-400" />
            <span className="font-semibold tracking-wide text-sm md:text-base">Serving {locationName} & Nearby Areas</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold font-serif mb-8 leading-tight drop-shadow-lg"
          >
            Premium Fresh Milk Delivery in <span className="text-yellow-400">{locationName}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl opacity-90 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <Link to="/subscribe" className="bg-white text-milquu-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-50 hover:text-blue-900 transition-all shadow-xl transform hover:-translate-y-1">
              Start Subscription
            </Link>
            <Link to="/products" className="bg-transparent border-2 border-white/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              View All Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white py-12 px-4 shadow-sm relative z-20 -mt-6 mx-4 md:mx-auto max-w-6xl rounded-2xl glass">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-white/80 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-blue-50 text-milquu-blue rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all shadow-sm">
              <Truck size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Free Daily Delivery</h3>
            <p className="text-sm text-gray-500">Before 8:00 AM</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-green-100 transition-all shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Trusted Sourcing</h3>
            <p className="text-sm text-gray-500">Quality-Checked</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-yellow-100 transition-all shadow-sm">
              <Clock size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Fresh to Home</h3>
            <p className="text-sm text-gray-500">Within 24 Hours</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-100 transition-all shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">A2 Milk Available</h3>
            <p className="text-sm text-gray-500">From Trusted Partners</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content Area (SEO Text) */}
      <section className="py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 prose prose-lg prose-blue prose-h2:font-serif prose-h2:text-4xl prose-h3:font-serif prose-h3:text-2xl text-gray-700 relative z-10"
        >
          {mainContent}
        </motion.div>
      </section>

      {/* Popular Products Localized */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Popular Dairy Deliveries in {locationName}</h2>
            <div className="w-24 h-1 bg-milquu-gold mx-auto rounded-full"></div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { title: "A2 Gir Cow Milk", img: "A2milk.webp", link: "farm-fresh-cow-milk", desc: "A2 cow milk from Gir cows, delivered in glass bottles. Order daily or once." },
              { title: "Buffalo Milk", img: "buffalomilk.webp", link: "pure-buffalo-milk", desc: "Thick, full-cream buffalo milk for chai, curd and homemade sweets." },
              { title: "Bilona A2 Cow Ghee", img: "A2ghee.webp", link: "desi-cow-ghee", desc: "Bilona ghee, hand-churned from cultured A2 curd." }
            ].map((product, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300 group">
                <div className="h-56 bg-gradient-to-br from-gray-50 to-white rounded-[24px] mb-6 flex items-center justify-center overflow-hidden relative border border-gray-100">
                  <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors z-10"></div>
                  <img src={`/img/products/${product.img}`} alt={`${product.title} delivered by MilQuuFresh in ${locationName}`} loading="lazy" decoding="async" className="h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">{product.title}</h3>
                <p className="text-gray-600 mb-6 text-base leading-relaxed line-clamp-2">{product.desc}</p>
                <Link to={`/product/${product.link}`} className="inline-flex items-center text-milquu-blue font-bold hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-100">
                  View Details <ChevronRight size={18} className="ml-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Other delivery areas — links back up to the hub and across to siblings */}
      <section className="px-4 pb-4 relative z-10" aria-labelledby="other-areas">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="other-areas" className="text-2xl font-bold font-serif text-gray-900 mb-4">Also delivering in Navi Mumbai</h2>
          <ul className="flex flex-wrap justify-center gap-3 mb-4">
            {otherAreas.map((p) => (
              <li key={p.path}>
                <Link to={p.path} className="inline-block px-4 py-2 rounded-full bg-white border border-gray-200 text-milquu-blue font-semibold hover:border-milquu-gold transition-colors">
                  Milk delivery in {areaBySlug(p.areaSlug).name}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/milk-delivery-navi-mumbai" className="text-milquu-blue font-bold hover:underline">See all MilQuuFresh delivery areas</Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-serif text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-milquu-gold mx-auto rounded-full"></div>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {combinedFAQs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants} className="bg-white/60 backdrop-blur-xl p-8 rounded-[24px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif flex items-start">
                  <span className="text-milquu-gold mr-3 mt-1">Q.</span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed pl-8">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-90"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-milquu-blue mb-6">Ready for Fresh Milk in {locationName}?</h2>
          <p className="text-gray-700 text-xl md:text-2xl mb-10 font-light">Start your day with MilQuu Fresh in {locationName}. Set up your daily subscription today.</p>
          <Link to="/subscribe" className="bg-milquu-blue text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block">
            Setup Daily Delivery
          </Link>
        </motion.div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default LocationLandingTemplate;
