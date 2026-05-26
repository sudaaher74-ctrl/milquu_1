import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

/* ══════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════ */
const TIMELINE = [
  { time: '4:00 AM', label: 'Milking', icon: '🐄', desc: 'Fresh milk collected from our partner farms at dawn.' },
  { time: '5:00 AM', label: 'Quality Testing', icon: '🔬', desc: 'Every batch tested for purity, fat content and hygiene.' },
  { time: '5:30 AM', label: 'Packaging', icon: '📦', desc: 'Sealed in chilled, tamper-proof food-grade packaging.' },
  { time: '6:00 AM', label: 'Dispatch', icon: '🚐', desc: 'Cold-chain delivery vans depart from our central hub.' },
  { time: '7:00 AM', label: 'At Your Door', icon: '🏡', desc: 'Fresh milk delivered while your family still sleeps.' },
];

const TESTIMONIALS = [
  { name: 'Abhishek Gunjal', loc: 'Nerul, Navi Mumbai', text: 'The milk quality is absolutely amazing. You can taste the difference — no powdery smell, just pure creamy goodness. Our kids love it!', stars: 5 },
  { name: 'Rushikesh Patil', loc: 'Kharghar, Navi Mumbai', text: 'Vegetables are so fresh they last much longer than supermarket ones. Always on time, always perfect. Highly recommend!', stars: 5 },
  { name: 'Shantanu Dhanawde', loc: 'Belapur, Navi Mumbai', text: 'Five stars for the buffalo milk! The cream layer on top every morning is a testament to its purity. Nothing beats it.', stars: 5 },
  { name: 'Priya Sharma', loc: 'Panvel, Navi Mumbai', text: 'Switched from supermarket milk 3 months ago and cannot go back. The ghee is world-class. Premium quality at fair pricing.', stars: 5 },
  { name: 'Amit Desai', loc: 'Kamothe, Navi Mumbai', text: 'The subscription is seamless — pause, skip, change quantities with one tap. The team is incredibly responsive too!', stars: 5 },
];

const CATEGORIES = [
  { src: '/images/milk-products.png', label: 'Pure Milk', sub: 'Cow, Buffalo & A2 Organic', filter: 'milk', accent: '#C8A97E' },
  { src: '/images/vegitables.png', label: 'Vegetables', sub: 'Farm-picked daily', filter: 'vegetables', accent: '#2f7a38' },
  { src: '/images/milk-by-products.png', label: 'Dairy Products', sub: 'Ghee, Paneer, Butter', filter: 'dairy', accent: '#e8c99e' },
  { src: '/images/fruits.png', label: 'Fresh Fruits', sub: 'Seasonal & Tropical', filter: 'fruits', accent: '#a8d5a2' },
];

const WHY_US = [
  { icon: '🌾', title: 'Direct from Farms', desc: 'We partner with ethical local farms, eliminating middlemen — so you always get the freshest produce at fair prices.', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900&auto=format&fit=crop&q=80' },
  { icon: '⏰', title: 'Daily Fresh Delivery', desc: 'Milk collected every morning and at your doorstep by 7 AM — fresher than any supermarket, guaranteed.', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&auto=format&fit=crop&q=80' },
  { icon: '🌿', title: '100% Organic', desc: 'No artificial hormones, no preservatives, no shortcuts. Pure natural goodness from ethically raised animals.', img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&auto=format&fit=crop&q=80' },
  { icon: '🔬', title: 'Lab Tested Purity', desc: 'Every single batch undergoes rigorous quality testing in certified hygienic facilities. Your safety is non-negotiable.', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop&q=80' },
];

const PLANS = [
  { name: 'Starter', price: '1,800', period: '/mo', desc: 'Cow Milk · 1L Daily', badge: null,
    features: ['1L Cow Milk daily', 'Morning delivery by 7AM', 'Free delivery always', 'Pause or skip anytime'] },
  { name: 'Popular', price: '2,250', period: '/mo', desc: 'Buffalo Milk · 1L Daily', badge: 'Most Popular',
    features: ['1L Buffalo Milk daily', 'Priority delivery by 6AM', 'Free delivery always', 'Vacation mode', 'Dedicated support'] },
  { name: 'Premium', price: '3,600', period: '/mo', desc: 'A2 Organic · 1L Daily', badge: 'Best Quality',
    features: ['1L A2 Organic Milk daily', 'Priority delivery by 5:30AM', 'Free delivery always', 'Flexible scheduling', 'Dedicated concierge'] },
];

const DELIVERY_ZONES = [
  { name: 'Kharghar', x: '35%', y: '40%', active: true },
  { name: 'Belapur', x: '50%', y: '35%', active: true },
  { name: 'Seawoods', x: '45%', y: '55%', active: true },
  { name: 'Nerul', x: '55%', y: '60%', active: true },
  { name: 'Panvel', x: '25%', y: '65%', active: false },
  { name: 'Kamothe', x: '20%', y: '50%', active: false },
];

/* ══════════════════════════════════════════════════════
   UTILITY COMPONENTS
══════════════════════════════════════════════════════ */

function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px w-10" style={{ background: '#C8A97E' }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: '#C8A97E' }}>
        {children}
      </span>
    </div>
  );
}

function GoldButton({ children, onClick, outline = false, className = '' }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`magnetic-btn relative overflow-hidden text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-full transition-all ${className}`}
      style={outline ? {
        border: '1px solid rgba(200,169,126,0.5)',
        color: '#C8A97E',
        background: 'transparent',
      } : {
        background: 'linear-gradient(135deg, #C8A97E 0%, #e8c99e 100%)',
        color: '#071426',
        boxShadow: '0 8px 32px rgba(200,169,126,0.3)',
      }}
    >
      {children}
    </motion.button>
  );
}

/* Floating ambient particle */
function Orb({ style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={{ y: [0, -24, 0], x: [0, 8, 0], opacity: [style.opacity, style.opacity * 2.5, style.opacity] }}
      transition={{ duration: style.dur, repeat: Infinity, ease: 'easeInOut', delay: style.delay }}
    />
  );
}

/* ══════════════════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════════════════ */

/* 1. HERO */
function HeroSection({ navigate }) {
  const [liveCount, setLiveCount] = useState(247);
  const [liveKey, setLiveKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 3 + 1));
      setLiveKey(k => k + 1);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const orbs = [
    { width: 300, height: 300, left: '60%', top: '-5%', background: 'radial-gradient(circle, rgba(200,169,126,0.12) 0%, transparent 70%)', filter: 'blur(40px)', opacity: 0.7, dur: 9, delay: 0 },
    { width: 200, height: 200, left: '80%', top: '40%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.5, dur: 7, delay: 2 },
    { width: 150, height: 150, left: '10%', top: '60%', background: 'radial-gradient(circle, rgba(200,169,126,0.1) 0%, transparent 70%)', filter: 'blur(25px)', opacity: 0.4, dur: 8, delay: 1 },
    { width: 80, height: 80, left: '5%', top: '20%', background: 'rgba(200,169,126,0.08)', filter: 'blur(12px)', opacity: 0.3, dur: 6, delay: 3 },
  ];

  // floating particles
  const particles = Array.from({ length: 22 }, (_, i) => ({
    width: Math.random() * 5 + 2,
    height: Math.random() * 5 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: i % 4 === 0 ? 'rgba(200,169,126,0.7)' : i % 4 === 1 ? 'rgba(255,255,255,0.3)' : i % 4 === 2 ? 'rgba(150,210,150,0.4)' : 'rgba(255,255,255,0.15)',
    dur: Math.random() * 6 + 5,
    delay: Math.random() * 5,
    opacity: 0.2,
  }));

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden -mt-16">
      {/* Cinematic zoom background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 10, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <img
          src="/images/hero-farm.jpg"
          alt="Milqu Fresh Farm"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Layered overlays */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(115deg, rgba(7,20,38,0.93) 0%, rgba(7,20,38,0.65) 42%, rgba(7,20,38,0.25) 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 z-[1]" style={{ height: '40%', background: 'linear-gradient(to top, #071426 0%, transparent 100%)' }} />

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {orbs.map((o, i) => <Orb key={i} style={o} />)}
        {/* Light rays */}
        {[18, 28, 38].map((l, i) => (
          <motion.div key={i} className="absolute top-0 h-full"
            style={{ left: `${l}%`, width: '1px', background: 'linear-gradient(to bottom, rgba(200,169,126,0.2), transparent 55%)', filter: 'blur(3px)' }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 5 + i * 1.5, repeat: Infinity, delay: i * 2, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {particles.map((p, i) => <Orb key={i} style={p} />)}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — Typography */}
            <div>
              {/* Live indicator */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 glass rounded-full px-4 py-2 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-white/80 text-[11px] font-bold tracking-wider uppercase">
                  <AnimatePresence mode="wait">
                    <motion.span key={liveKey} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="inline-block" transition={{ duration: 0.25 }}>
                      {liveCount}
                    </motion.span>
                  </AnimatePresence>
                  {' '}Deliveries Today · Live
                </span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 mb-5">
                <div className="h-px w-12" style={{ background: '#C8A97E' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: '#C8A97E' }}>Pure · Fresh · Natural</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold leading-[1.02] mb-7 tracking-tight text-white"
                style={{ textShadow: '0 4px 48px rgba(0,0,0,0.5)' }}
              >
                Pure Farm<br />
                Fresh Milk.<br />
                <span className="text-gold-gradient">Delivered Daily.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-white/65 text-base sm:text-lg leading-relaxed mb-10 max-w-lg font-sans">
                Farm-to-doorstep in under 3 hours. No middlemen, no preservatives —
                just pure organic goodness delivered before sunrise.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4 mb-12">
                <GoldButton onClick={() => navigate('/subscription')}>Start Subscription →</GoldButton>
                <GoldButton onClick={() => navigate('/about')} outline>Explore Our Process</GoldButton>
              </motion.div>

              {/* Trust strip */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                className="flex flex-wrap gap-6">
                {[
                  { icon: '🌿', t: '100% Organic' },
                  { icon: '⚡', t: 'Under 3 Hours' },
                  { icon: '🔒', t: 'Zero Preservatives' },
                  { icon: '⭐', t: '4.9 Rating' },
                ].map(b => (
                  <div key={b.t} className="flex items-center gap-2 text-white/45 text-[11px] font-bold tracking-wider uppercase">
                    <span className="text-sm">{b.icon}</span>{b.t}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Floating glass stats card */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.55, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex flex-col gap-4 items-end"
            >
              {/* Main glass card */}
              <motion.div
                className="glass rounded-3xl p-8 w-80"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-[#C8A97E]/15 flex items-center justify-center text-lg">🥛</div>
                  <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Live Dashboard</span>
                </div>
                {[
                  { label: 'Deliveries Today', value: `${liveCount}+`, color: '#C8A97E' },
                  { label: 'Organic Certified', value: '100%', color: '#2f7a38' },
                  { label: 'Delivered By', value: '7 AM', color: '#e8c99e' },
                  { label: 'Happy Families', value: '500+', color: '#C8A97E' },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
                    <span className="text-white/50 text-xs font-sans">{s.label}</span>
                    <span className="font-serif font-bold text-lg" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </motion.div>

              {/* Small badge cards */}
              <div className="flex gap-3">
                {[
                  { icon: '🚐', label: 'Cold Chain', sub: 'Maintained' },
                  { icon: '🏆', label: 'Top Rated', sub: 'Navi Mumbai' },
                ].map((b, i) => (
                  <motion.div
                    key={b.label}
                    className="glass rounded-2xl px-4 py-3 flex items-center gap-2.5"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                  >
                    <span className="text-xl">{b.icon}</span>
                    <div>
                      <div className="text-white text-xs font-bold">{b.label}</div>
                      <div className="text-white/40 text-[10px]">{b.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-scroll-bounce"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
      >
        <span className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-bold">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}

/* 2. STORYTELLING / PROCESS SCROLL SECTION */
function StorytellingSection() {
  return (
    <section className="py-32 bg-luxury-dark relative overflow-hidden noise-overlay">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <FadeUp>
          <div className="text-center mb-20">
            <SectionLabel>Farm to Doorstep</SectionLabel>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Every Drop Has a<br /><span className="text-gold-gradient">Story.</span>
            </h2>
            <p className="text-white/45 text-sm max-w-lg mx-auto font-sans leading-relaxed">
              Watch your milk's journey — from our ethical farms to your family's table, in under 3 hours.
            </p>
          </div>
        </FadeUp>

        {/* Horizontal story cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { time: '4:00 AM', title: 'Ethical Milking', icon: '🐄', desc: 'Our partner cows are milked by hand at dawn, stress-free and nourished.', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop&q=80' },
            { time: '5:00 AM', title: 'Quality Testing', icon: '🔬', desc: 'Each batch tested for purity, fat content, SNF and microbial safety.', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80' },
            { time: '5:30 AM', title: 'Cold Packaging', icon: '❄️', desc: 'Sealed at 4°C in tamper-proof, food-grade packaging within 90 minutes.', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80' },
            { time: '6:00 AM', title: 'Van Dispatch', icon: '🚐', desc: 'Refrigerated delivery vans loaded and dispatched across Navi Mumbai.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80' },
            { time: '7:00 AM', title: 'At Your Door', icon: '🏡', desc: 'Fresh milk waiting before your alarm goes off — pure, cold, perfect.', img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&auto=format&fit=crop&q=80' },
            { time: 'Always', title: 'Zero Compromise', icon: '🌿', desc: 'No additives. No preservatives. No artificial hormones. Ever.', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80' },
          ].map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.07}>
              <motion.div
                className="group relative rounded-3xl overflow-hidden cursor-pointer hover-glow"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{ aspectRatio: '4/3' }}
              >
                <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,20,38,0.95) 0%, rgba(7,20,38,0.4) 50%, transparent 100%)' }} />
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-[#C8A97E]/30 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#C8A97E' }}>{s.time}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-white/50 text-xs font-sans leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 3. COLLECTION */
function CollectionSection({ navigate }) {
  return (
    <section className="py-32 bg-luxury-darker relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,169,126,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Asymmetric header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-8">
          <FadeUp>
            <SectionLabel>Our Collection</SectionLabel>
            <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
              The<br />Precision<br /><span className="text-gold-gradient">Palette.</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-white/35 text-sm max-w-xs font-sans leading-relaxed lg:text-right pb-2">
              Elevating dairy to a lifestyle. Discover products crafted with precision and organic soul.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, i) => (
            <FadeUp key={cat.filter} delay={i * 0.1}>
              <motion.div
                className="group relative rounded-3xl overflow-hidden cursor-pointer"
                style={{ marginTop: i % 2 === 1 ? '32px' : '0' }}
                whileHover={{ y: -10, rotateX: 2 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                onClick={() => navigate(`/products?cat=${cat.filter}`)}
              >
                {/* Animated gold border glow */}
                <div className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${cat.accent}40, transparent 40%, ${cat.accent}20)`, filter: 'blur(0.5px)' }} />

                <div className="bg-[#0a1e36] border border-white/5 group-hover:border-[#C8A97E]/20 transition-colors duration-500 rounded-3xl overflow-hidden">
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/3' }}>
                    <motion.img
                      src={cat.src}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,20,38,0.7) 0%, transparent 50%)' }} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-white font-bold text-xl mb-1">{cat.label}</h3>
                    <p className="text-white/35 text-xs font-sans mb-4">{cat.sub}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-colors duration-300"
                      style={{ color: cat.accent }}>
                      Explore
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.3} className="text-center mt-16">
          <GoldButton onClick={() => navigate('/products')} outline>View All Products</GoldButton>
        </FadeUp>
      </div>
    </section>
  );
}

/* 4. WHY FAMILIES CHOOSE */
function WhySection() {
  return (
    <section className="py-32 bg-[#F9F8F4] relative">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-20">
          <SectionLabel><span style={{ color: '#C8A97E' }}>Our Promise</span></SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#071426]">
            Why Families Choose<br /><span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
          </h2>
        </FadeUp>

        <div className="space-y-28">
          {WHY_US.map((w, i) => {
            const isEven = i % 2 === 0;
            return (
              <FadeUp key={w.title} delay={0.05}>
                <div className={`flex flex-col md:flex-row items-center gap-16 xl:gap-28 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                  {/* Text */}
                  <div className="flex-1 max-w-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: 'rgba(200,169,126,0.12)', border: '1px solid rgba(200,169,126,0.2)' }}>
                        {w.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#C8A97E' }}>
                        Pillar 0{i + 1}
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#071426] mb-5 leading-tight">{w.title}</h3>
                    <p className="text-[#071426]/55 text-sm leading-relaxed font-sans mb-8">{w.desc}</p>
                    <div className="h-px w-20" style={{ background: 'rgba(200,169,126,0.3)' }} />
                  </div>
                  {/* Image card */}
                  <div className="flex-1 w-full">
                    <motion.div
                      className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl"
                      style={{ aspectRatio: '4/3' }}
                      whileHover={{ y: -8, rotateY: isEven ? 2 : -2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img src={w.img} alt={w.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,20,38,0.4) 0%, transparent 60%)' }} />
                      {/* Floating label */}
                      <div className="absolute bottom-5 left-5 glass-dark rounded-xl px-4 py-2.5">
                        <span className="text-white text-xs font-bold">{w.icon} {w.title}</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* 5. TRUST & TRANSPARENCY — Freshness Timeline */
function TrustSection() {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <section className="py-32 bg-luxury-dark relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(200,169,126,0.03) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-20">
          <SectionLabel>Trust & Transparency</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Freshness You Can<br /><span className="text-gold-gradient">Trace in Real Time.</span>
          </h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Every minute of your milk's journey — from farm to your door — is documented, tested and transparent.
          </p>
        </FadeUp>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[28px] sm:left-1/2 top-0 bottom-0 w-px timeline-line" />

            <div className="space-y-8">
              {TIMELINE.map((step, i) => (
                <FadeUp key={step.time} delay={i * 0.1}>
                  <div
                    className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'} cursor-pointer`}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                  >
                    {/* Left / Right text */}
                    <div className={`flex-1 ${i % 2 === 0 ? 'sm:text-right sm:pr-16' : 'sm:text-left sm:pl-16'} pl-16 sm:pl-0`}>
                      <motion.div
                        className="glass rounded-2xl p-5 inline-block text-left"
                        whileHover={{ scale: 1.02 }}
                        animate={{ borderColor: activeStep === i ? 'rgba(200,169,126,0.4)' : 'rgba(255,255,255,0.06)' }}
                        style={{ border: '1px solid rgba(255,255,255,0.06)', maxWidth: '280px' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{step.icon}</span>
                          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#C8A97E' }}>{step.time}</span>
                        </div>
                        <h4 className="font-serif text-white font-bold text-lg mb-1">{step.label}</h4>
                        <AnimatePresence>
                          {activeStep === i && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="text-white/50 text-xs font-sans leading-relaxed">
                              {step.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>

                    {/* Dot */}
                    <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center">
                      <motion.div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl relative"
                        style={{
                          background: 'linear-gradient(135deg, rgba(200,169,126,0.2), rgba(200,169,126,0.05))',
                          border: '1px solid rgba(200,169,126,0.3)',
                          boxShadow: '0 0 20px rgba(200,169,126,0.2)',
                        }}
                        animate={{ boxShadow: activeStep === i ? '0 0 40px rgba(200,169,126,0.5)' : '0 0 20px rgba(200,169,126,0.2)' }}
                      >
                        {step.icon}
                      </motion.div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges grid */}
        <FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '🧪', title: 'Lab Tested', sub: 'Every single batch' },
              { icon: '🌿', title: 'No Preservatives', sub: 'Ever, guaranteed' },
              { icon: '💉', title: 'Hormone Free', sub: 'Ethically raised' },
              { icon: '🏆', title: 'FSSAI Certified', sub: 'Quality assured' },
            ].map((b) => (
              <div key={b.title} className="glass rounded-2xl p-5 text-center hover-glow transition-all">
                <div className="text-3xl mb-3">{b.icon}</div>
                <div className="text-white font-bold text-sm mb-1">{b.title}</div>
                <div className="text-white/40 text-[11px]">{b.sub}</div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* 6. SUBSCRIPTION PLANS */
function PlansSection({ navigate }) {
  const [billing, setBilling] = useState('monthly');

  return (
    <section className="py-32 bg-luxury-darker relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,169,126,0.04) 0%, transparent 70%)', filter: 'blur(100px)' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <FadeUp className="text-center mb-16">
          <SectionLabel>Subscribe & Save</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Milk Subscription Plans</h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto font-sans mb-10">Fresh milk every day. Pause, skip, or cancel anytime — no questions asked.</p>

          {/* Toggle */}
          <div className="inline-flex glass rounded-full p-1">
            {['monthly', 'yearly'].map(p => (
              <button key={p} onClick={() => setBilling(p)}
                className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all"
                style={billing === p ? { background: 'linear-gradient(135deg, #C8A97E, #e8c99e)', color: '#071426' } : { color: 'rgba(255,255,255,0.4)' }}>
                {p === 'yearly' ? 'Yearly (Save 15%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => {
            const yearlyPrice = plan.price === '1,800' ? '1,530' : plan.price === '2,250' ? '1,913' : '3,060';
            const displayPrice = billing === 'yearly' ? yearlyPrice : plan.price;
            const isPopular = plan.badge === 'Most Popular';
            return (
              <FadeUp key={plan.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="relative rounded-3xl overflow-hidden"
                  style={{ marginTop: isPopular ? '0' : '24px' }}
                >
                  {/* Gradient border for popular */}
                  {isPopular && (
                    <div className="absolute -inset-[1px] rounded-3xl z-0 animate-shimmer-border" />
                  )}
                  <div className={`relative z-10 p-8 h-full flex flex-col ${isPopular ? 'bg-[#0a1e36]' : 'glass'}`}
                    style={{ border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                    {plan.badge && (
                      <div className="ribbon-badge self-start mb-5">{plan.badge}</div>
                    )}
                    <div className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-4">{plan.name}</div>
                    <div className="font-serif text-5xl font-bold text-white mb-1">
                      <sup className="text-2xl font-sans text-white/60">₹</sup>
                      <AnimatePresence mode="wait">
                        <motion.span key={displayPrice} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="inline-block">
                          {displayPrice}
                        </motion.span>
                      </AnimatePresence>
                      <sub className="text-sm font-sans font-normal text-white/35">/mo</sub>
                    </div>
                    <div className="text-white/40 text-sm mb-8 font-sans">{plan.desc}</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-white/65 font-sans">
                          <span className="text-base font-bold" style={{ color: '#C8A97E' }}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <GoldButton onClick={() => navigate('/subscription')} outline={!isPopular} className="w-full justify-center text-center">
                      Get Started
                    </GoldButton>
                  </div>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>

        {/* Plan perks */}
        <FadeUp delay={0.2} className="mt-12">
          <div className="flex flex-wrap justify-center gap-8 text-white/30 text-xs font-bold tracking-wider uppercase">
            {['Pause Anytime', 'Vacation Mode', 'Flexible Delivery', 'No Lock-in', 'WhatsApp Support'].map(p => (
              <span key={p} className="flex items-center gap-2"><span style={{ color: '#C8A97E' }}>✓</span>{p}</span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* 7. TESTIMONIALS */
function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-32 bg-[#F9F8F4] relative overflow-hidden">
      {/* Big quote mark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-serif text-[20rem] font-bold leading-none pointer-events-none select-none"
        style={{ color: 'rgba(200,169,126,0.06)', zIndex: 0 }}>
        "
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <FadeUp className="text-center mb-16">
          <SectionLabel><span style={{ color: '#C8A97E' }}>Happy Families</span></SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#071426]">
            500+ Families Trust<br /><span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1,2,3,4,5].map(s => <span key={s} className="text-lg" style={{ color: '#C8A97E' }}>★</span>)}
            <span className="text-[#071426]/40 text-sm ml-2 font-sans">4.9 out of 5</span>
          </div>
        </FadeUp>

        {/* Featured review */}
        <FadeUp className="max-w-3xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-10 shadow-xl text-center"
              style={{ border: '1px solid rgba(200,169,126,0.15)' }}
            >
              <div className="text-[#C8A97E] text-xl tracking-wider mb-6">{'★'.repeat(TESTIMONIALS[active].stars)}</div>
              <p className="font-serif text-2xl sm:text-3xl text-[#071426] leading-relaxed italic mb-8">
                "{TESTIMONIALS[active].text}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#EFECE1] flex items-center justify-center text-2xl">🧑</div>
                <div className="text-left">
                  <div className="font-bold text-[#071426] text-sm">{TESTIMONIALS[active].name}</div>
                  <div className="text-[#071426]/40 text-xs">{TESTIMONIALS[active].loc}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: active === i ? '24px' : '8px', height: '8px', background: active === i ? '#C8A97E' : 'rgba(200,169,126,0.25)' }} />
            ))}
          </div>
        </FadeUp>

        {/* Small cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 cursor-pointer"
                style={{ border: '1px solid rgba(200,169,126,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                onClick={() => setActive(i)}
              >
                <div className="text-[#C8A97E] mb-3">{'★'.repeat(t.stars)}</div>
                <p className="text-[#071426]/60 text-xs font-sans leading-relaxed italic line-clamp-3 mb-4">"{t.text}"</p>
                <div>
                  <div className="font-bold text-[#071426] text-xs">{t.name}</div>
                  <div className="text-[#071426]/35 text-[10px]">{t.loc}</div>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 8. DELIVERY MAP */
function DeliverySection() {
  return (
    <section className="py-32 bg-luxury-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <SectionLabel>Delivery Coverage</SectionLabel>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
              Serving All of<br /><span className="text-gold-gradient">Navi Mumbai.</span>
            </h2>
            <p className="text-white/40 text-sm font-sans leading-relaxed mb-8">
              We deliver to 6 major zones across Navi Mumbai — and expanding every month to reach more families.
            </p>
            <div className="space-y-3">
              {DELIVERY_ZONES.map(zone => (
                <div key={zone.name} className="flex items-center gap-4 glass rounded-xl px-4 py-3">
                  <div className="relative w-2.5 h-2.5 rounded-full"
                    style={{ background: zone.active ? '#C8A97E' : 'rgba(255,255,255,0.2)' }}>
                    {zone.active && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#C8A97E', opacity: 0.5 }} />}
                  </div>
                  <span className="text-white text-sm font-bold">{zone.name}</span>
                  <span className="text-white/30 text-xs ml-auto">{zone.active ? '✓ Active' : 'Coming Soon'}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Map visual */}
          <FadeUp delay={0.15}>
            <div className="relative rounded-3xl overflow-hidden"
              style={{ aspectRatio: '1', background: 'linear-gradient(135deg, #0a1e36, #071426)', border: '1px solid rgba(200,169,126,0.1)' }}>
              {/* Grid pattern */}
              <div className="absolute inset-0"
                style={{ backgroundImage: 'linear-gradient(rgba(200,169,126,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {/* Glow center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(200,169,126,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              {/* Zone dots */}
              {DELIVERY_ZONES.map((zone, i) => (
                <motion.div
                  key={zone.name}
                  className="absolute"
                  style={{ left: zone.x, top: zone.y }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full"
                      style={{ background: zone.active ? '#C8A97E' : 'rgba(255,255,255,0.15)', boxShadow: zone.active ? '0 0 20px rgba(200,169,126,0.6)' : 'none' }} />
                    {zone.active && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#C8A97E', opacity: 0.3 }} />}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white/70">{zone.name}</div>
                  </div>
                </motion.div>
              ))}
              {/* Route lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
                <motion.line x1="35%" y1="40%" x2="50%" y2="35%" stroke="#C8A97E" strokeWidth="1" strokeDasharray="4,4"
                  animate={{ strokeDashoffset: [0, -16] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                <motion.line x1="50%" y1="35%" x2="55%" y2="60%" stroke="#C8A97E" strokeWidth="1" strokeDasharray="4,4"
                  animate={{ strokeDashoffset: [0, -16] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                <motion.line x1="55%" y1="60%" x2="45%" y2="55%" stroke="#C8A97E" strokeWidth="1" strokeDasharray="4,4"
                  animate={{ strokeDashoffset: [0, -16] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />
              </svg>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🚐</span>
                  <div>
                    <div className="text-white text-xs font-bold">Live Delivery Fleet</div>
                    <div className="text-white/40 text-[10px]">12 vans active right now</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-[10px] font-bold">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* 9. FINAL CTA */
function CTASection({ navigate }) {
  return (
    <section className="relative py-40 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&auto=format&fit=crop&q=80"
          alt="Farm sunrise" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(7,20,38,0.95) 0%, rgba(7,20,38,0.75) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,20,38,0.9) 0%, transparent 40%)' }} />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <Orb key={i} style={{
            width: Math.random() * 5 + 2,
            height: Math.random() * 5 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'rgba(200,169,126,0.6)',
            dur: Math.random() * 5 + 4,
            delay: Math.random() * 4,
            opacity: 0.25,
          }} />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center relative z-10">
        <FadeUp>
          <div className="inline-flex items-center gap-2 glass-gold rounded-full px-5 py-2.5 mb-8">
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#C8A97E' }}>Join 500+ Happy Families</span>
          </div>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Start Your<br />Farm-Fresh<br /><span className="text-gold-gradient">Journey Today.</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg mb-12 font-sans max-w-xl mx-auto leading-relaxed">
            Pure milk, fresh vegetables, ethically sourced — delivered to your doorstep before sunrise. Every single day.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <GoldButton onClick={() => navigate('/subscription')}>Subscribe Now →</GoldButton>
            <motion.a
              href="https://wa.me/919876543210?text=Hi! I'd like to know more about Milqu Fresh milk delivery."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 glass-gold rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all"
              style={{ color: '#C8A97E' }}
              whileHover={{ scale: 1.04, backgroundColor: 'rgba(200,169,126,0.12)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-base">💬</span> WhatsApp Us
            </motion.a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

  // Custom luxury cursor
  useEffect(() => {
    const cursor = document.getElementById('luxury-cursor');
    const ring = document.getElementById('luxury-cursor-ring');
    if (!cursor || !ring) return;

    let ringX = 0, ringY = 0;
    let animId;

    const move = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    const animateRing = () => {
      // no-op; ring follows via CSS transition
      animId = requestAnimationFrame(animateRing);
    };

    const moveRing = (e) => {
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousemove', moveRing);
    animId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousemove', moveRing);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Luxury cursor elements */}
      <div id="luxury-cursor" />
      <div id="luxury-cursor-ring" />

      {/* WhatsApp FAB */}
      <motion.a
        href="https://wa.me/919876543210?text=Hi! I'd like to know more about Milqu Fresh milk delivery."
        target="_blank" rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat on WhatsApp"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      >
        💬
      </motion.a>

      {/* Page sections */}
      <HeroSection navigate={navigate} />
      <StorytellingSection />
      <CollectionSection navigate={navigate} />
      <WhySection />
      <TrustSection />
      <PlansSection navigate={navigate} />
      <TestimonialsSection />
      <DeliverySection />
      <CTASection navigate={navigate} />
    </>
  );
}
