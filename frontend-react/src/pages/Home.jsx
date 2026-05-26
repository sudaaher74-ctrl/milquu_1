import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';

/* ─── Data ─── */
const TESTIMONIALS = [
  { name: 'Abhishek Gunjal', loc: 'Nerul, Navi Mumbai', text: '"The milk quality is absolutely amazing. You can taste the difference — no powdery smell, just pure creamy goodness."', stars: 5, avatar: '🧑' },
  { name: 'Rushikesh Patil', loc: 'Kharghar, Navi Mumbai', text: '"Vegetables are so fresh they last much longer than supermarket ones. Always on time!"', stars: 5, avatar: '👨' },
  { name: 'Shantanu Dhanawde', loc: 'Belapur, Navi Mumbai', text: '"Five stars for the buffalo milk! The cream layer on top every morning is a testament to its purity."', stars: 5, avatar: '👨' },
];

const WHY_US = [
  { icon: '🌾', title: 'Direct from Farms', desc: 'We source directly from local partner farms, cutting out middlemen so you get the freshest produce at fair prices.' },
  { icon: '⏰', title: 'Daily Fresh Delivery', desc: 'Milk collected every morning and delivered to your doorstep by 7 AM — fresher than your local store.' },
  { icon: '🌿', title: '100% Organic', desc: 'No artificial hormones, no preservatives. Pure, natural goodness from ethically raised animals.' },
  { icon: '💰', title: 'Affordable Pricing', desc: 'By working directly with farmers, we keep prices fair for families while paying farmers properly.' },
];

const CATEGORIES = [
  { icon: '/images/milk-products.png', label: 'Milk', sub: 'Cow, Buffalo & Organic', filter: 'milk' },
  { icon: '/images/vegitables.png', label: 'Vegetables', sub: 'Fresh & Farm-picked daily', filter: 'vegetables' },
  { icon: '/images/milk-by-products.png', label: 'Milk By-Products', sub: 'Ghee, Paneer, Butter & more', filter: 'dairy' },
  { icon: '/images/fruits.png', label: 'Fruits', sub: 'Seasonal & tropical varieties', filter: 'fruits' },
];

/* ─── Floating Particle ─── */
function Particle({ style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={{ y: [0, -30, 0], opacity: [0.15, 0.4, 0.15] }}
      transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut', delay: style.delay }}
    />
  );
}

/* ─── Live Delivery Counter ─── */
function LiveCounter() {
  const [count, setCount] = useState(247);
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
      </span>
      <span className="text-white/90 text-xs font-bold tracking-wider uppercase">
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {count}
          </motion.span>
        </AnimatePresence>
        {' '}Deliveries Today
      </span>
    </motion.div>
  );
}

/* ─── FadeIn wrapper ─── */
function FadeIn({ children, delay = 0, fromRight = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: fromRight ? 40 : 0, y: fromRight ? 0 : 30 }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated border card ─── */
function GlowCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer rounded-[2rem] overflow-hidden ${className}`}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-[2rem] p-[1px] bg-gradient-to-br from-[#C8A97E]/60 via-transparent to-[#C8A97E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
      <div className="absolute -inset-[1px] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"
        style={{ background: 'linear-gradient(135deg, rgba(200,169,126,0.4) 0%, transparent 40%, rgba(200,169,126,0.2) 100%)', filter: 'blur(1px)' }}
      />
      {children}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Home() {
  const navigate = useNavigate();

  // Generate particles once
  const particles = Array.from({ length: 18 }, (_, i) => ({
    width: Math.random() * 6 + 2,
    height: Math.random() * 6 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: i % 3 === 0 ? 'rgba(200,169,126,0.6)' : i % 3 === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(150,210,150,0.4)',
    duration: Math.random() * 5 + 4,
    delay: Math.random() * 4,
  }));

  return (
    <>
      {/* ══════════════════════════════════════
          HERO — Cinematic, Luxury
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-0 overflow-hidden -mt-16">

        {/* Cinematic zoom background */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 8, ease: 'easeOut' }}
        >
          <img
            src="/images/hero-farm.jpg"
            alt="Farm Background"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[1]" style={{
          background: 'linear-gradient(110deg, rgba(11,25,44,0.88) 0%, rgba(11,25,44,0.55) 45%, rgba(11,25,44,0.2) 100%)'
        }} />
        <div className="absolute inset-x-0 bottom-0 h-48 z-[1]" style={{
          background: 'linear-gradient(to top, #0B192C 0%, transparent 100%)'
        }} />

        {/* Fog / light rays */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-20 left-[30%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(200,169,126,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-10 right-10 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          {/* Light rays */}
          {[15, 25, 35].map((left, i) => (
            <motion.div
              key={i}
              className="absolute top-0 h-full w-px"
              style={{
                left: `${left}%`,
                background: 'linear-gradient(to bottom, rgba(200,169,126,0.15) 0%, transparent 60%)',
                filter: 'blur(2px)',
              }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.5, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {particles.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        {/* Hero content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 w-full flex-1 flex flex-col justify-center mt-12">
          <div className="max-w-3xl">

            <LiveCounter />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="h-px w-8 bg-[#C8A97E]" />
              <span className="text-[#C8A97E] text-xs font-bold uppercase tracking-[0.25em]">Pure · Fresh · Natural</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-5xl sm:text-[5.5rem] lg:text-[7rem] font-bold text-white leading-[1.02] mb-6 tracking-tight"
              style={{ textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}
            >
              Pure Farm<br />
              Fresh Milk.<br />
              <span style={{ color: '#C8A97E' }}>Delivered Daily.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-white/75 text-base sm:text-lg leading-relaxed mb-10 max-w-lg font-sans"
            >
              Farm-to-doorstep in under 3 hours. No middlemen, no preservatives —
              just the finest organic milk delivered at sunrise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/subscription')}
                className="group relative overflow-hidden text-[#0B192C] text-xs font-bold tracking-widest px-9 py-4 rounded-full uppercase shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #C8A97E, #e8c99e)' }}
              >
                <span className="relative z-10">Start Subscription →</span>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #e8c99e, #C8A97E)' }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/about')}
                className="border border-white/30 text-white text-xs font-bold tracking-widest px-9 py-4 rounded-full uppercase backdrop-blur-sm transition-colors"
              >
                Our Process →
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: '🌿', label: '100% Organic' },
                { icon: '⚡', label: 'Same Day Delivery' },
                { icon: '🔒', label: 'No Preservatives' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-white/60 text-xs font-bold tracking-wide uppercase">
                  <span className="text-base">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-white/30 text-[10px] tracking-widest uppercase font-bold">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          COLLECTION — Dark, Asymmetric
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#0B192C] relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,169,126,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Asymmetric header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-16 gap-6">
            <FadeIn>
              <div>
                <span className="text-[#C8A97E] text-xs font-bold uppercase tracking-[0.3em] block mb-3">Our Collection</span>
                <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
                  The Precision<br />
                  <span style={{ color: '#C8A97E' }}>Palette.</span>
                </h2>
              </div>
            </FadeIn>
            <FadeIn delay={0.1} fromRight>
              <p className="text-white/40 text-sm max-w-xs font-sans leading-relaxed text-right hidden sm:block">
                Elevating dairy to a lifestyle. Crafted with futuristic precision and organic soul.
              </p>
            </FadeIn>
          </div>

          {/* Cards grid — asymmetric sizes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES.map((cat, i) => (
              <FadeIn key={cat.filter} delay={i * 0.09}>
                <GlowCard
                  onClick={() => navigate(`/products?cat=${cat.filter}`)}
                  className={`bg-[#152B4A]/60 border border-white/5 group ${i === 1 ? 'lg:mt-8' : ''} ${i === 3 ? 'lg:mt-4' : ''}`}
                >
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
                    <div className="relative w-full overflow-hidden rounded-t-[2rem]" style={{ aspectRatio: i % 2 === 0 ? '4/3' : '3/4' }}>
                      <motion.img
                        src={cat.icon}
                        alt={cat.label}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif font-bold text-white text-xl mb-1">{cat.label}</h3>
                      <p className="text-xs text-white/40 font-sans mb-3">{cat.sub}</p>
                      <span className="text-[#C8A97E] text-[10px] font-bold tracking-widest uppercase group-hover:gap-3 transition-all">
                        Explore →
                      </span>
                    </div>
                  </motion.div>
                </GlowCard>
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-16">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/products')}
              className="border border-[#C8A97E]/50 text-[#C8A97E] hover:border-[#C8A97E] hover:bg-[#C8A97E]/10 text-xs font-bold tracking-widest px-10 py-4 rounded-full transition-all uppercase"
            >
              View All Categories
            </motion.button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY US — Light, Alternating
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#F9F8F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-[#C8A97E] text-xs font-bold uppercase tracking-[0.3em] block mb-3">Our Promise</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#0B192C]">
                Why Families Choose<br />
                <span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-24">
            {WHY_US.map((w, i) => {
              const isEven = i % 2 === 0;
              return (
                <FadeIn key={w.title} delay={0.05}>
                  <div className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                    {/* Text */}
                    <div className="flex-1 max-w-md">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-[#C8A97E]/10 flex items-center justify-center text-xl">{w.icon}</div>
                        <span className="text-[#C8A97E] text-[10px] font-bold uppercase tracking-[0.2em]">Step 0{i + 1}</span>
                      </div>
                      <h3 className="font-serif font-bold text-[#0B192C] text-3xl sm:text-4xl mb-4 leading-tight">{w.title}</h3>
                      <p className="text-sm text-[#0B192C]/60 leading-relaxed font-sans mb-6">{w.desc}</p>
                      <div className="h-px w-16 bg-[#C8A97E]/40" />
                    </div>

                    {/* Image card with depth */}
                    <div className="flex-1 w-full">
                      <motion.div
                        whileHover={{ y: -6, rotateY: isEven ? 2 : -2 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl"
                        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                      >
                        <img
                          src={`https://images.unsplash.com/photo-${isEven ? '1500595046743-cd271d694d30' : '1559839734-2b71ea197ec2'}?w=800&auto=format&fit=crop`}
                          alt={w.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B192C]/30 to-transparent" />
                        {/* Corner accent */}
                        <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                          <span className="text-white text-xs font-bold">{w.icon} {w.title}</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PLANS — Dark, Premium
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#0B192C] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,126,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,169,126,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#C8A97E] text-xs font-bold uppercase tracking-[0.3em] block mb-3">Subscribe & Save</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Milk Subscription Plans</h2>
              <p className="text-white/40 text-sm max-w-lg mx-auto font-sans">Fresh milk delivered every day. Choose a plan that fits your family.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {[
              { name: 'Basic', price: '1,800', desc: 'Cow Milk · 1 Litre/day', features: ['1L Cow Milk daily', 'Morning delivery by 7AM', 'Free delivery', 'Pause anytime'], featured: false },
              { name: 'Popular ⭐', price: '2,250', desc: 'Buffalo Milk · 1 Litre/day', features: ['1L Buffalo Milk daily', 'Morning delivery by 6AM', 'Free delivery', 'Pause or skip anytime'], featured: true },
              { name: 'Premium', price: '3,600', desc: 'Organic Milk · 1 Litre/day', features: ['1L Organic Milk daily', 'Priority delivery by 6AM', 'Free delivery', 'Flexible schedule', 'Dedicated support'], featured: false },
            ].map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-3xl p-8 h-full flex flex-col overflow-hidden ${
                    plan.featured
                      ? 'bg-gradient-to-br from-[#C8A97E] to-[#a8895e] text-[#0B192C] shadow-2xl shadow-[#C8A97E]/20 scale-105'
                      : 'bg-white/4 border border-white/8 text-white hover:border-[#C8A97E]/30 transition-colors'
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute top-4 right-4 bg-[#0B192C]/20 backdrop-blur rounded-full px-3 py-1">
                      <span className="text-[10px] text-[#0B192C] font-bold tracking-widest uppercase">Most Popular</span>
                    </div>
                  )}
                  <div className={`font-bold text-xs tracking-widest uppercase mb-4 ${plan.featured ? 'text-[#0B192C]/60' : 'text-[#C8A97E]/70'}`}>
                    {plan.name}
                  </div>
                  <div className={`font-serif text-5xl font-bold mb-1 ${plan.featured ? 'text-[#0B192C]' : 'text-white'}`}>
                    <sup className="text-2xl font-sans">₹</sup>{plan.price}
                    <sub className={`text-sm font-sans font-normal ${plan.featured ? 'text-[#0B192C]/50' : 'text-white/40'}`}>/mo</sub>
                  </div>
                  <div className={`text-sm mb-8 font-sans ${plan.featured ? 'text-[#0B192C]/70' : 'text-white/50'}`}>{plan.desc}</div>
                  <ul className="space-y-3.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`text-sm flex items-center gap-3 font-sans ${plan.featured ? 'text-[#0B192C]/80' : 'text-white/70'}`}>
                        <span className={`text-base font-bold ${plan.featured ? 'text-[#0B192C]' : 'text-[#C8A97E]'}`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/subscription')}
                    className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                      plan.featured
                        ? 'bg-[#0B192C] text-white hover:bg-[#152B4A] shadow-lg'
                        : 'bg-transparent border border-[#C8A97E]/50 text-[#C8A97E] hover:bg-[#C8A97E] hover:text-[#0B192C] hover:border-[#C8A97E]'
                    }`}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS — Light
      ══════════════════════════════════════ */}
      <section className="py-28 bg-[#F9F8F4] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#C8A97E] text-xs font-bold uppercase tracking-[0.3em] block mb-3">Social Proof</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#0B192C]">What Our Customers Say</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white rounded-[2rem] p-8 h-full flex flex-col border border-[#0B192C]/5 shadow-sm hover:shadow-xl hover:border-[#C8A97E]/20 transition-all duration-500 group overflow-hidden"
                >
                  {/* Subtle animated border glow on hover */}
                  <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(200,169,126,0.25)' }} />
                  <div className="text-[#C8A97E] mb-4 text-xl tracking-wider">{'★'.repeat(t.stars)}</div>
                  <p className="text-[#0B192C]/65 text-sm leading-relaxed mb-6 font-sans italic flex-1">{t.text}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-[#EFECE1] flex items-center justify-center text-2xl">{t.avatar}</div>
                    <div>
                      <div className="font-bold text-sm text-[#0B192C]">{t.name}</div>
                      <div className="text-xs text-[#0B192C]/40 tracking-wide">{t.loc}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA — Dark + Gold gradient
      ══════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0B192C 0%, #1a2e4a 50%, #0B192C 100%)'
      }}>
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(200,169,126,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-[#C8A97E]/10 border border-[#C8A97E]/20 rounded-full px-4 py-2 mb-6">
              <span className="text-[#C8A97E] text-xs font-bold tracking-widest uppercase">Join 500+ Happy Families</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Start Your Farm-Fresh<br />
              <span style={{ color: '#C8A97E' }}>Journey Today</span>
            </h2>
            <p className="text-white/50 text-base mb-10 font-sans max-w-xl mx-auto leading-relaxed">
              Join hundreds of families enjoying pure, fresh produce delivered to their doorstep every morning.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products')}
                className="text-[#0B192C] font-bold px-10 py-4 rounded-full transition-all uppercase tracking-widest text-xs shadow-xl"
                style={{ background: 'linear-gradient(135deg, #C8A97E, #e8c99e)' }}
              >
                Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/subscription')}
                className="border border-white/20 text-white font-bold px-10 py-4 rounded-full transition-colors uppercase tracking-widest text-xs backdrop-blur-sm"
              >
                Subscribe
              </motion.button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
