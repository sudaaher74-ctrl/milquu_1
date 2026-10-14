import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Sparkles, ArrowRight, CheckCircle2, ChevronRight, Recycle } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import { GLASS_BOTTLE } from '../../data/glass-bottle';
import { productSEOData } from '../../data/products-seo';
import { SERVED_AREAS } from '../../data/locations';

const GlassBottleDelivery = () => {
  const cowMilk = productSEOData['farm-fresh-cow-milk'];
  const buffaloMilk = productSEOData['pure-buffalo-milk'];
  const a2Ghee = productSEOData['desi-cow-ghee'];

  return (
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen pb-20 font-sans relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 fixed">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/5 opacity-60"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-50"></div>
      </div>

      <SEOHead path="/glass-bottle-milk-delivery" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-milquu-blue via-blue-900 to-indigo-950 text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
            <ol className="flex flex-wrap items-center justify-center gap-2">
              <li><Link to="/" className="hover:text-white underline-offset-2 hover:underline">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">Glass Bottle Delivery</li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full mb-8 shadow-lg"
          >
            <Recycle size={18} className="text-yellow-400" />
            <span className="font-semibold tracking-wide text-sm md:text-base">Reusable Glass Bottles &amp; Jars</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Fresh Milk Delivery in <span className="text-yellow-400">Glass Bottles</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
            MilQuuFresh delivers farm-fresh milk in returnable glass bottles across Navi Mumbai. Enjoy authentic taste and zero plastic leaching, straight to your doorstep before morning tea.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/subscribe" className="bg-white text-milquu-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-50 hover:text-blue-900 transition-all shadow-xl">
              Start Milk Subscription
            </Link>
            <Link to="/products" className="bg-transparent border-2 border-white/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Main Informational Pillars */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-milquu-blue flex items-center justify-center mb-6">
              <Sparkles size={28} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-milquu-dark mb-3">Pure Taste &amp; Cold Retention</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Glass is non-porous and non-reactive, keeping milk fresh at its chilled temperature without absorbing odors or imparting plastic taste. The natural cream rises to the neck just like traditional dairy.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Recycle size={28} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-milquu-dark mb-3">Doorstep Bottle Collection</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              {GLASS_BOTTLE.emptyBottleInstruction} Simply place your rinsed empty bottle outside your door before your morning drop, and our delivery executive picks it up on the delivery round.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-milquu-dark mb-3">Eco-Friendly &amp; Sustainable</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              Replacing single-use plastic pouches with durable glass bottles eliminates hundreds of discarded plastic packets every year per household, supporting clean residential communities.
            </p>
          </div>
        </div>
      </section>

      {/* Available Glass Bottle Products */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-milquu-dark mb-3">
            MilQuuFresh Products in Glass Packaging
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Choose pure dairy packaged in sterile, high-grade glass bottles and jars delivered straight to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cowMilk && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 p-6 rounded-[28px] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="h-48 flex items-center justify-center mb-4">
                  <img src={cowMilk.image} alt="A2 Gir Cow Milk in Glass Bottle" className="h-full object-contain" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-milquu-gold">A2 Gir Cow</span>
                <h3 className="text-2xl font-serif font-bold text-milquu-dark mt-1 mb-2">{cowMilk.displayName}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{cowMilk.summary}</p>
              </div>
              <Link to={`/product/${cowMilk.slug}`} className="inline-flex items-center text-milquu-blue font-bold hover:underline">
                View Details &amp; Subscribe <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          )}

          {buffaloMilk && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 p-6 rounded-[28px] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="h-48 flex items-center justify-center mb-4">
                  <img src={buffaloMilk.image} alt="Buffalo Milk in Glass Bottle" className="h-full object-contain" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-milquu-gold">Full Cream</span>
                <h3 className="text-2xl font-serif font-bold text-milquu-dark mt-1 mb-2">{buffaloMilk.displayName}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{buffaloMilk.summary}</p>
              </div>
              <Link to={`/product/${buffaloMilk.slug}`} className="inline-flex items-center text-milquu-blue font-bold hover:underline">
                View Details &amp; Subscribe <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          )}

          {a2Ghee && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 p-6 rounded-[28px] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="h-48 flex items-center justify-center mb-4">
                  <img src={a2Ghee.image} alt="Bilona A2 Cow Ghee in Glass Jar" className="h-full object-contain" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-milquu-gold">Bilona Churned</span>
                <h3 className="text-2xl font-serif font-bold text-milquu-dark mt-1 mb-2">{a2Ghee.displayName}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{a2Ghee.summary}</p>
              </div>
              <Link to={`/product/${a2Ghee.slug}`} className="inline-flex items-center text-milquu-blue font-bold hover:underline">
                View Details &amp; Order <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Delivery Service Areas */}
      <section className="py-12 px-6 max-w-4xl mx-auto text-center relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-[32px] shadow-sm">
          <Truck size={32} className="mx-auto text-milquu-blue mb-4" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-milquu-dark mb-4">
            Glass Bottle Delivery Across Navi Mumbai
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Our morning milk rounds deliver to societies and residences in {SERVED_AREAS.map((a) => a.name).join(', ')}.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {SERVED_AREAS.map((a) => (
              <span key={a.slug} className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700">
                {a.name}
              </span>
            ))}
          </div>
          <Link to="/milk-delivery-navi-mumbai" className="text-milquu-blue font-bold hover:underline inline-flex items-center gap-1">
            Check all service localities <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GlassBottleDelivery;
