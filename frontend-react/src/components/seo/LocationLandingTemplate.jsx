import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Truck, ShieldCheck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import SEOHead from '../seo/SEOHead';
import StickyMobileCTA from '../seo/StickyMobileCTA';
import { LocalBusinessSchema, buildFAQSchema, buildBreadcrumbSchema, commonFAQs } from '../../data/schemas';

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
  title, 
  description, 
  keywords,
  heroSubtitle,
  slug,
  customFAQs = [],
  mainContent
}) => {
  const combinedFAQs = [...customFAQs, ...commonFAQs].slice(0, 5); // Take 5 FAQs max
  
  const schema = [
    LocalBusinessSchema,
    buildFAQSchema(combinedFAQs),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: `${locationName} Delivery`, url: `/${slug}` }
    ])
  ];

  return (
    <div className="bg-milquu-cream min-h-screen pb-16 md:pb-0 font-sans">
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
        canonical={`https://milquufresh.in/${slug}`}
        schema={schema}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-milquu-blue via-blue-800 to-indigo-900 text-white py-24 md:py-32 px-4 relative overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" 
        />
        <div className="max-w-5xl mx-auto text-center relative z-10">
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
            Premium Farm Fresh Milk Delivery in <span className="text-yellow-400">{locationName}</span>
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
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
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
            <h3 className="font-bold text-gray-900 text-lg">100% Pure</h3>
            <p className="text-sm text-gray-500">No Preservatives</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-yellow-100 transition-all shadow-sm">
              <Clock size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Farm to Home</h3>
            <p className="text-sm text-gray-500">Within 24 Hours</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-100 transition-all shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">A2 Certified</h3>
            <p className="text-sm text-gray-500">Desi Gir Cows</p>
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
          className="max-w-4xl mx-auto prose prose-lg prose-blue prose-h2:font-serif prose-h2:text-4xl prose-h3:font-serif prose-h3:text-2xl text-gray-700"
        >
          {mainContent}
        </motion.div>
      </section>

      {/* Popular Products Localized */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
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
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8"
          >
            {[
              { title: "A2 Farm Fresh Cow Milk", img: "a2-cow-milk.png", link: "farm-fresh-cow-milk", desc: "Pure, natural A2 milk from free-grazing Gir cows. Delivered fresh every morning." },
              { title: "Premium Buffalo Milk", img: "buffalo-milk.png", link: "pure-buffalo-milk", desc: "Thick, creamy buffalo milk perfect for making tea, coffee, curd, and homemade sweets." },
              { title: "Bilona A2 Cow Ghee", img: "desi-ghee.png", link: "desi-cow-ghee", desc: "Traditional bilona churned A2 ghee with rich aroma, golden texture, and immense health benefits." }
            ].map((product, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-32 md:h-56 bg-gray-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors z-10"></div>
                  <img src={`/img/products/${product.img}`} alt={product.title} className="h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display='none'} />
                </div>
                <h3 className="text-sm md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 font-serif line-clamp-2">{product.title}</h3>
                <p className="hidden md:block text-gray-600 mb-6 text-base leading-relaxed line-clamp-2">{product.desc}</p>
                <Link to={`/product/${product.link}`} className="inline-flex items-center text-milquu-blue font-bold hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 md:px-4 md:py-2 rounded-lg group-hover:bg-blue-100 text-xs md:text-base">
                  View <ChevronRight size={16} className="ml-0.5 md:ml-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
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
              <motion.div key={index} variants={itemVariants} className="glass p-8 rounded-2xl hover:shadow-md transition-shadow">
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
          <p className="text-gray-700 text-xl md:text-2xl mb-10 font-light">Join hundreds of families in {locationName} who start their day with MilQuu Fresh. Setup your daily subscription today.</p>
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
