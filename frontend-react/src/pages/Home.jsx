import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════
   REAL DAIRY IMAGE LIBRARY
══════════════════════════════════════════════ */
const IMG = {
  heroFarm:    '/images/hero-farm.jpg',
  cowClose:    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=900&auto=format&fit=crop&q=85',
  labTest:     'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop&q=85',
  milkBottles: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&auto=format&fit=crop&q=85',
  farmAerial:  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900&auto=format&fit=crop&q=85',
  milkPour:    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=900&auto=format&fit=crop&q=85',
  dairyCows:   'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&auto=format&fit=crop&q=85',
  farmMorning: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&auto=format&fit=crop&q=85',
  milkGlass:   'https://images.unsplash.com/photo-1563636619-e9143da7f009?w=900&auto=format&fit=crop&q=85',
  founderFarm: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=900&auto=format&fit=crop&q=85',
  ctaBg:       'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1800&auto=format&fit=crop&q=80',
};

/* ══════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════ */
const STORY_STEPS = [
  { time: '4:00 AM', label: 'Ethical Milking',   icon: '🐄', img: IMG.cowClose,    desc: 'Hand-milked at dawn in stress-free, ethical conditions by our partner farmers.' },
  { time: '5:00 AM', label: 'Quality Testing',   icon: '🔬', img: IMG.labTest,     desc: 'Every batch tested for purity, fat content, SNF and microbial safety.' },
  { time: '5:30 AM', label: 'Cold Packaging',    icon: '❄️', img: IMG.milkBottles, desc: 'Sealed at 4°C in food-grade tamper-proof packaging within 90 minutes.' },
  { time: '6:00 AM', label: 'Van Dispatch',      icon: '🚐', img: IMG.farmAerial,  desc: 'Refrigerated vans loaded and dispatched across Navi Mumbai.' },
  { time: '7:00 AM', label: 'At Your Door',      icon: '🏡', img: IMG.milkPour,    desc: 'Fresh, cold milk waiting before your alarm goes off.' },
  { time: 'Always',  label: 'Zero Compromise',   icon: '🌿', img: IMG.dairyCows,   desc: 'No additives. No preservatives. No artificial hormones. Ever.' },
];

const CATEGORIES = [
  { src: '/images/milk-products.png',    label: 'Pure Milk',      sub: 'Cow, Buffalo & A2 Organic', filter: 'milk',       accent: '#C8A97E', icon: '🥛' },
  { src: '/images/vegitables.png',       label: 'Vegetables',     sub: 'Farm-picked daily',         filter: 'vegetables', accent: '#4a9e5c', icon: '🥦' },
  { src: '/images/milk-by-products.png', label: 'Dairy Products', sub: 'Ghee, Paneer, Butter',      filter: 'dairy',      accent: '#e8c99e', icon: '🧀' },
  { src: '/images/fruits.png',           label: 'Fresh Fruits',   sub: 'Seasonal & Tropical',       filter: 'fruits',     accent: '#a8d5a2', icon: '🍑' },
];

const WHY_ITEMS = [
  { icon: '🌾', title: 'Direct from Farms',    img: IMG.farmAerial,  desc: 'We partner with verified local farms, cutting every middleman so you always get the freshest produce at fair prices.' },
  { icon: '⏰', title: 'Daily Fresh Delivery', img: IMG.milkBottles, desc: 'Milk collected at 4AM and at your doorstep by 7AM — fresher than any supermarket, every single day.' },
  { icon: '🌿', title: '100% Organic',         img: IMG.dairyCows,   desc: 'No artificial hormones, no shortcuts. Pure natural goodness from ethically raised, stress-free animals.' },
  { icon: '🔬', title: 'Lab Tested Purity',    img: IMG.labTest,     desc: 'Every batch tested in FSSAI-certified labs for purity, fat content and safety. Zero compromises.' },
];

const TESTIMONIALS = [
  { name: 'Abhishek Gunjal',    loc: 'Nerul',    text: 'The milk quality is absolutely amazing. You can taste the difference — no powdery smell, just pure creamy goodness. Our kids love it!', stars: 5 },
  { name: 'Rushikesh Patil',    loc: 'Kharghar', text: 'Vegetables so fresh they last far longer than anything from a supermarket. Always on time, always perfect. Highly recommended!', stars: 5 },
  { name: 'Shantanu Dhanawde',  loc: 'Belapur',  text: 'Five stars for the buffalo milk! The cream layer on top every morning proves its purity. Nothing beats it.', stars: 5 },
  { name: 'Priya Sharma',       loc: 'Panvel',   text: 'Switched 3 months ago and cannot go back. The ghee is world-class — premium quality at genuinely fair pricing.', stars: 5 },
  { name: 'Amit Desai',         loc: 'Kamothe',  text: 'Subscription is seamless — pause, skip, change quantities with one tap. The team is incredibly responsive!', stars: 5 },
  { name: 'Sneha Kulkarni',     loc: 'Seawoods', text: "Best decision for my family's health. Pure A2 milk, delivered cold every morning. The difference is night and day.", stars: 5 },
  { name: 'Vikram Nair',        loc: 'Nerul',    text: 'Started with the trial, never looked back. Even my fussy toddler loves the taste. That says everything.', stars: 5 },
  { name: 'Meera Iyer',         loc: 'Belapur',  text: "The paneer and ghee are simply outstanding. Restaurant-quality dairy at home — that's what Milqu Fresh delivers.", stars: 5 },
];

const PLANS = [
  { name: 'Starter',  price: '1,800', yPrice: '1,530', desc: 'Cow Milk · 1L Daily',       badge: null,
    features: ['1L Cow Milk daily', 'By 7AM every day', 'Free delivery always', 'Pause anytime'] },
  { name: 'Popular',  price: '2,250', yPrice: '1,913', desc: 'Buffalo Milk · 1L Daily',   badge: 'Most Popular',
    features: ['1L Buffalo Milk daily', 'Priority by 6AM', 'Free delivery always', 'Vacation mode', 'WhatsApp support'] },
  { name: 'Premium',  price: '3,600', yPrice: '3,060', desc: 'A2 Organic · 1L Daily',    badge: 'Best Quality',
    features: ['1L A2 Organic daily', 'Priority by 5:30AM', 'Free delivery always', 'Flexible scheduling', 'Dedicated concierge'] },
];

const TRUST_STEPS = [
  { time: '4:00 AM', label: 'Milking',         icon: '🐄', desc: 'Fresh milk from partner farms at dawn.' },
  { time: '5:00 AM', label: 'Quality Testing', icon: '🔬', desc: 'Purity, fat % and microbial safety verified.' },
  { time: '5:30 AM', label: 'Packaging',       icon: '📦', desc: 'Sealed at 4°C in tamper-proof containers.' },
  { time: '6:00 AM', label: 'Dispatch',        icon: '🚐', desc: 'Cold-chain vans depart from the hub.' },
  { time: '7:00 AM', label: 'At Your Door',    icon: '🏡', desc: 'Fresh, cold, perfect — every morning.' },
];

const ZONES = [
  { name: 'Kharghar', x: 32, y: 42, active: true  },
  { name: 'Belapur',  x: 52, y: 34, active: true  },
  { name: 'Seawoods', x: 46, y: 56, active: true  },
  { name: 'Nerul',    x: 58, y: 62, active: true  },
  { name: 'Panvel',   x: 22, y: 68, active: false },
  { name: 'Kamothe',  x: 18, y: 52, active: false },
];

/* ══════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════ */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-70px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block h-px w-9" style={{ background: '#C8A97E' }} />
      <span className="text-[10px] font-black uppercase tracking-[0.38em]"
        style={{ color: light ? 'rgba(200,169,126,0.7)' : '#C8A97E' }}>
        {children}
      </span>
    </div>
  );
}

function GoldText({ children }) {
  return (
    <span style={{
      background: 'linear-gradient(135deg, #C8A97E 0%, #f5dba8 50%, #C8A97E 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    }}>
      {children}
    </span>
  );
}

/* Ripple-effect premium button */
function PremiumBtn({ children, onClick, href, outline = false, className = '', target }) {
  const addRipple = useCallback((e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, []);

  const style = outline
    ? { border: '1px solid rgba(200,169,126,0.45)', color: '#C8A97E', background: 'transparent' }
    : { background: 'linear-gradient(135deg,#C8A97E,#e8c99e)', color: '#071426', boxShadow: '0 8px 28px rgba(200,169,126,0.28)' };

  const cls = `ripple-btn relative overflow-hidden text-[11px] font-black tracking-widest uppercase px-8 py-4 rounded-full inline-block ${className}`;

  return href ? (
    <motion.a href={href} target={target} rel="noopener noreferrer"
      className={cls} style={style}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
      onClick={addRipple}>
      {children}
    </motion.a>
  ) : (
    <motion.button onClick={(e) => { addRipple(e); onClick?.(); }}
      className={cls} style={style}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════
   SECTION 1 — HERO
══════════════════════════════════════════════ */
function HeroSection({ navigate }) {
  const [count, setCount] = useState(247);
  const [countKey, setCountKey] = useState(0);
  const sectionRef = useRef(null);

  // Mouse-follow gradient
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 35, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 18 });

  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3 + 1));
      setCountKey(k => k + 1);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleMouse = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left) / width);
    mouseY.set((clientY - top) / height);
  };

  const particles = Array.from({ length: 18 }, (_, i) => ({
    w: Math.random() * 4 + 2,
    left: `${Math.random() * 100}%`,
    top:  `${Math.random() * 100}%`,
    bg: i % 3 === 0 ? 'rgba(200,169,126,0.7)' : i % 3 === 1 ? 'rgba(255,255,255,0.22)' : 'rgba(120,200,120,0.4)',
    dur: Math.random() * 6 + 5,
    delay: Math.random() * 5,
  }));

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col overflow-hidden -mt-16"
      onMouseMove={handleMouse}>
      {/* Cinematic zoom background */}
      <motion.div className="absolute inset-0 z-0"
        initial={{ scale: 1.14 }} animate={{ scale: 1 }}
        transition={{ duration: 12, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <img src={IMG.heroFarm} alt="Milqu Fresh — Premium dairy farm Navi Mumbai"
          className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(115deg,rgba(7,20,38,0.94) 0%,rgba(7,20,38,0.6) 42%,rgba(7,20,38,0.15) 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 z-[1]" style={{ height: '45%', background: 'linear-gradient(to top,#071426,transparent)' }} />

      {/* Mouse gradient */}
      <motion.div className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `radial-gradient(700px circle at ${springX.get() * 100}% ${springY.get() * 100}%, rgba(200,169,126,0.07), transparent 65%)`,
        }} />

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {[
          { w: 380, l: '55%', t: '-5%',  bg: 'radial-gradient(circle,rgba(200,169,126,0.12),transparent 70%)', blur: 55, dur: 9 },
          { w: 220, l: '80%', t: '35%',  bg: 'radial-gradient(circle,rgba(255,255,255,0.04),transparent 70%)', blur: 35, dur: 7 },
          { w: 160, l: '5%',  t: '60%',  bg: 'radial-gradient(circle,rgba(200,169,126,0.1),transparent 70%)',  blur: 28, dur: 8 },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: o.w, height: o.w, left: o.l, top: o.t, background: o.bg, filter: `blur(${o.blur}px)` }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.07, 1] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }} />
        ))}
        {/* Light rays */}
        {[15, 25, 36].map((l, i) => (
          <motion.div key={i} className="absolute top-0 h-full w-px"
            style={{ left: `${l}%`, background: 'linear-gradient(to bottom,rgba(200,169,126,0.22),transparent 55%)', filter: 'blur(3px)' }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 5 + i * 1.5, repeat: Infinity, delay: i * 2.2, ease: 'easeInOut' }} />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: p.w, height: p.w, left: p.left, top: p.top, background: p.bg }}
            animate={{ y: [0, -24, 0], opacity: [0.15, 0.55, 0.15] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div>
              {/* Live badge */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 glass rounded-full px-4 py-2 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-white/75 text-[11px] font-bold tracking-wider uppercase">
                  <AnimatePresence mode="wait">
                    <motion.span key={countKey} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.22 }} className="inline-block">
                      {count}
                    </motion.span>
                  </AnimatePresence>
                  {' '}Deliveries Today · Live
                </span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
                <Eyebrow>Pure · Fresh · Natural</Eyebrow>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-[clamp(2.8rem,7vw,6.5rem)] font-black leading-[1.01] mb-6 tracking-tight text-white"
                style={{ textShadow: '0 4px 50px rgba(0,0,0,0.55)' }}>
                Pure Farm<br />Fresh Milk.<br /><GoldText>Delivered Daily.</GoldText>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
                className="text-white/58 text-base sm:text-[1.05rem] leading-relaxed mb-10 max-w-md font-sans">
                Farm-to-doorstep in under 3 hours. No middlemen, no preservatives —
                just pure organic goodness delivered before sunrise.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
                className="flex flex-wrap gap-4 mb-12">
                <PremiumBtn onClick={() => navigate('/subscription')}>Start Subscription →</PremiumBtn>
                <PremiumBtn onClick={() => navigate('/about')} outline>Explore Our Process</PremiumBtn>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }}
                className="flex flex-wrap gap-x-7 gap-y-3">
                {[['🌿','100% Organic'],['⚡','Under 3 Hours'],['🔒','Zero Preservatives'],['⭐','4.9 Rating']].map(([ic,t]) => (
                  <div key={t} className="flex items-center gap-2 text-white/38 text-[10.5px] font-bold tracking-wider uppercase">
                    <span className="text-sm">{ic}</span>{t}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Floating glass dashboard */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.52, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex flex-col gap-4 items-end">

              <motion.div className="glass rounded-3xl p-8 w-80"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-[#C8A97E]/12 flex items-center justify-center text-lg">🥛</div>
                  <span className="text-white/38 text-[10px] font-bold tracking-widest uppercase">Live Dashboard</span>
                </div>
                {[
                  { label: 'Deliveries Today', val: `${count}+`, color: '#C8A97E' },
                  { label: 'Organic Certified', val: '100%',    color: '#4a9e5c' },
                  { label: 'Delivered By',      val: '7 AM',    color: '#e8c99e' },
                  { label: 'Happy Families',    val: '500+',    color: '#C8A97E' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                    <span className="text-white/38 text-xs font-sans">{s.label}</span>
                    <span className="font-serif font-black text-xl" style={{ color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </motion.div>

              <div className="flex gap-3">
                {[{ ic:'🚐', t:'Cold Chain', s:'Maintained' }, { ic:'🏆', t:'Top Rated', s:'Navi Mumbai' }].map((b, i) => (
                  <motion.div key={b.t} className="glass rounded-2xl px-4 py-3 flex items-center gap-2.5"
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4.5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}>
                    <span className="text-xl">{b.ic}</span>
                    <div>
                      <div className="text-white text-xs font-bold">{b.t}</div>
                      <div className="text-white/32 text-[10px]">{b.s}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-scroll-bounce">
        <span className="text-white/18 text-[9px] tracking-[0.35em] uppercase font-bold">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/18 to-transparent" />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 2 — STORYTELLING
══════════════════════════════════════════════ */
function StorytellingSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.story-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 55, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
          delay: (i % 3) * 0.11,
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' } }
      );
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#071426,#0a1f38 55%,#071426)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'radial-gradient(rgba(200,169,126,0.035) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-20">
          <Eyebrow>Farm to Doorstep</Eyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Every Drop Has a <GoldText>Story.</GoldText>
          </h2>
          <p className="text-white/38 text-sm max-w-sm mx-auto font-sans leading-relaxed">
            Watch your milk's journey — from ethical farms to your family's table, in under 3 hours.
          </p>
        </FadeUp>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STORY_STEPS.map((s) => (
            <div key={s.label} className="story-card group relative rounded-3xl overflow-hidden cursor-pointer opacity-0"
              style={{ aspectRatio: '4/3' }}>
              <img src={s.img} alt={`Milqu Fresh — ${s.label} dairy process`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.97) 0%,rgba(7,20,38,0.3) 50%,transparent 100%)' }} />
              {/* hover border glow */}
              <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-[#C8A97E]/28 transition-all duration-500"
                style={{ boxShadow: 'inset 0 0 0 0 rgba(200,169,126,0)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A97E]">{s.time}</span>
                </div>
                <h3 className="font-serif text-[1.2rem] font-bold text-white mb-1.5">{s.label}</h3>
                <p className="text-white/40 text-xs font-sans leading-relaxed max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-300">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 3 — COLLECTION
══════════════════════════════════════════════ */
function CollectionSection({ navigate }) {
  const gsapRef = useRef(null);

  useEffect(() => {
    if (!gsapRef.current) return;
    const items = gsapRef.current.querySelectorAll('.cat-card');
    items.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 40, scale: 0.97 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });
  }, []);

  const handleTilt = (e, el) => {
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    el.style.transform = `perspective(1000px) rotateY(${dx * 5}deg) rotateX(${-dy * 3.5}deg) scale(1.02)`;
    el.style.transition = 'transform 0.08s ease-out';
  };
  const resetTilt = (el) => {
    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
  };

  return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#071426 0%,#0a1a2e 100%)' }}>

      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(200,169,126,0.04), transparent)' }} />

      <div className="max-w-6xl mx-auto px-6 sm:px-10">

        {/* Centered header — matching the reference */}
        <FadeUp className="text-center mb-16">
          <Eyebrow>Our Collection</Eyebrow>
          <h2 className="font-serif font-black text-white mb-4"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', letterSpacing: '-0.01em' }}>
            The Precision Palette
          </h2>
          <p className="text-white/42 text-sm sm:text-base font-sans max-w-sm mx-auto leading-relaxed">
            Elevating dairy to a lifestyle. Discover products crafted with futuristic precision and organic soul.
          </p>
        </FadeUp>

        {/* 4 equal cards — no stagger, uniform height */}
        <div ref={gsapRef} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.filter} className="cat-card opacity-0">
              <div
                className="group relative rounded-2xl overflow-hidden cursor-pointer h-full"
                style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                onMouseLeave={(e) => resetTilt(e.currentTarget)}
                onClick={() => navigate(`/products?cat=${cat.filter}`)}>

                {/* Card */}
                <div className="relative rounded-[32px] overflow-hidden border border-white/[0.04] transition-all duration-400 group-hover:border-[#C8A97E]/30 h-full flex flex-col p-4 sm:p-5"
                  style={{
                    backgroundColor: '#16283d', // Solid navy matching the screenshot
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}>

                  {/* Image — inset with border radius */}
                  <div className="relative overflow-hidden rounded-[20px]" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={cat.src}
                      alt={`Milqu Fresh ${cat.label}`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>

                  {/* Text below image */}
                  <div className="pt-6 pb-2 flex-1 flex flex-col justify-center text-center">
                    <h3 className="font-serif font-bold text-white mb-1.5"
                      style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}>
                      {cat.label}
                    </h3>
                    <p className="text-[#8ba0b8] text-xs sm:text-sm font-sans">{cat.sub}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <FadeUp delay={0.2} className="text-center mt-12">
          <PremiumBtn onClick={() => navigate('/products')} outline>View All Products</PremiumBtn>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 4 — WHY US (alternating, GSAP)
══════════════════════════════════════════════ */
function WhySection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const rows = sectionRef.current.querySelectorAll('.why-row');
    rows.forEach(row => {
      gsap.fromTo(row, { opacity: 0, y: 48 }, {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 84%', toggleActions: 'play none none none' },
      });
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[#F9F8F4] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-20">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <span className="block h-px w-9 bg-[#C8A97E]" />
            <span className="text-[10px] font-black uppercase tracking-[0.38em] text-[#C8A97E]">Our Promise</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#071426]">
            Why Families Choose<br />
            <span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
          </h2>
        </FadeUp>

        <div className="space-y-28">
          {WHY_ITEMS.map((w, i) => (
            <div key={w.title} className="why-row opacity-0">
              <div className={`flex flex-col md:flex-row items-center gap-16 xl:gap-24 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 max-w-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: 'rgba(200,169,126,0.1)', border: '1px solid rgba(200,169,126,0.18)' }}>
                      {w.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A97E]">Pillar 0{i + 1}</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-black text-[#071426] mb-5 leading-tight">{w.title}</h3>
                  <p className="text-[#071426]/48 text-sm leading-relaxed font-sans mb-8">{w.desc}</p>
                  <div className="h-px w-20 bg-[#C8A97E]/22" />
                </div>
                <div className="flex-1 w-full">
                  <motion.div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl"
                    style={{ aspectRatio: '4/3' }}
                    whileHover={{ y: -8 }} transition={{ duration: 0.45 }}>
                    <img src={w.img} alt={`Milqu Fresh — ${w.title}`} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.32),transparent 60%)' }} />
                    <div className="absolute bottom-5 left-5 glass-dark rounded-xl px-4 py-2.5">
                      <span className="text-white text-xs font-bold">{w.icon} {w.title}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 5 — TRUST TIMELINE
══════════════════════════════════════════════ */
function TrustSection() {
  const [active, setActive] = useState(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!timelineRef.current) return;
    gsap.fromTo(timelineRef.current.querySelectorAll('.tl-item'),
      { opacity: 0, x: -28 },
      { opacity: 1, x: 0, stagger: 0.14, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: timelineRef.current, start: 'top 82%' } }
    );
  }, []);

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#071426,#0a1f38 55%,#071426)' }}>
      <div className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(200,169,126,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-16">
          <Eyebrow>Trust & Transparency</Eyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Freshness You Can<br /><GoldText>Trace in Real Time.</GoldText>
          </h2>
          <p className="text-white/36 text-sm max-w-md mx-auto font-sans leading-relaxed">
            Every minute of your milk's journey is documented, tested and fully transparent.
          </p>
        </FadeUp>

        <div ref={timelineRef} className="max-w-2xl mx-auto mb-20">
          <div className="relative pl-16 sm:pl-20">
            <div className="absolute left-6 sm:left-8 top-5 bottom-5 w-[2px] timeline-line" />
            <div className="space-y-5">
              {TRUST_STEPS.map((step, i) => (
                <div key={step.time} className="tl-item relative opacity-0 cursor-pointer"
                  onClick={() => setActive(active === i ? null : i)}>
                  {/* Dot */}
                  <div className="absolute -left-10 sm:-left-12 top-5">
                    <motion.div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ background: 'linear-gradient(135deg,rgba(200,169,126,0.25),rgba(200,169,126,0.05))', border: '1px solid rgba(200,169,126,0.35)' }}
                      animate={{ boxShadow: active === i ? '0 0 0 8px rgba(200,169,126,0.12), 0 0 40px rgba(200,169,126,0.4)' : '0 0 20px rgba(200,169,126,0.2)' }}>
                      {step.icon}
                    </motion.div>
                  </div>
                  {/* Card */}
                  <motion.div className="glass rounded-2xl p-5 cursor-pointer"
                    animate={{ borderColor: active === i ? 'rgba(200,169,126,0.42)' : 'rgba(255,255,255,0.06)' }}
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A97E]">{step.time}</span>
                      <motion.span className="text-white/22 text-xs" animate={{ rotate: active === i ? 180 : 0 }}>▼</motion.span>
                    </div>
                    <h4 className="font-serif text-white font-bold text-lg">{step.label}</h4>
                    <AnimatePresence>
                      {active === i && (
                        <motion.p initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="text-white/42 text-xs font-sans leading-relaxed overflow-hidden">
                          {step.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { ic: '🧪', t: 'Lab Tested',      s: 'Every single batch'  },
              { ic: '🌿', t: 'No Preservatives', s: 'Guaranteed always'   },
              { ic: '💉', t: 'Hormone Free',     s: 'Ethically raised'    },
              { ic: '🏆', t: 'FSSAI Certified',  s: 'Quality assured'     },
            ].map(b => (
              <motion.div key={b.t} className="glass rounded-2xl p-5 text-center cursor-default"
                whileHover={{ y: -6, borderColor: 'rgba(200,169,126,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                transition={{ duration: 0.28 }}>
                <div className="text-3xl mb-3">{b.ic}</div>
                <div className="text-white font-bold text-sm mb-1">{b.t}</div>
                <div className="text-white/32 text-[11px]">{b.s}</div>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 6 — FOUNDER STORY (new)
══════════════════════════════════════════════ */
function FounderSection() {
  return (
    <section className="py-32 bg-[#F9F8F4] relative overflow-hidden">
      {/* Background farm silhouette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img src={IMG.founderFarm} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06]" loading="lazy" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Image side */}
          <FadeUp>
            <div className="relative">
              <motion.div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl"
                style={{ aspectRatio: '3/4' }}
                whileHover={{ y: -6 }} transition={{ duration: 0.45 }}>
                <img src={IMG.farmMorning} alt="Milqu Fresh farm — Ethical dairy farming Navi Mumbai"
                  className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.5),transparent 50%)' }} />
                {/* Floating badge */}
                <motion.div
                  className="absolute bottom-6 left-6 right-6 glass-dark rounded-2xl px-5 py-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-[#C8A97E] mb-1">Our Mission</div>
                  <div className="text-white font-serif text-base font-bold leading-snug">
                    Transparency from farm to doorstep.
                  </div>
                </motion.div>
              </motion.div>
              {/* Gold accent line */}
              <div className="absolute -left-4 top-1/4 bottom-1/4 w-1 rounded-full"
                style={{ background: 'linear-gradient(to bottom,transparent,#C8A97E,transparent)' }} />
            </div>
          </FadeUp>

          {/* Text side */}
          <FadeUp delay={0.15}>
            <div className="flex items-center gap-3 mb-4 ">
              <span className="block h-px w-9 bg-[#C8A97E]" />
              <span className="text-[10px] font-black uppercase tracking-[0.38em] text-[#C8A97E]">Our Story</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-black text-[#071426] mb-6 leading-tight">
              Why We Started<br /><span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
            </h2>

            {/* Blockquote */}
            <div className="relative founder-quote mb-8 pl-6">
              <blockquote className="font-serif text-xl sm:text-2xl text-[#071426]/75 italic leading-relaxed">
                "We were tired of adulterated milk in the city. So we built a transparent farm-to-home dairy system families could finally trust."
              </blockquote>
            </div>

            <p className="text-[#071426]/50 text-sm font-sans leading-relaxed mb-6">
              Growing up in Navi Mumbai, we saw how disconnected families had become from the source of their food. Milk was diluted. Vegetables were cold-stored for weeks. There was no transparency.
            </p>
            <p className="text-[#071426]/50 text-sm font-sans leading-relaxed mb-10">
              We partnered directly with ethical local farms, built a cold-chain logistics network, and created a subscription platform where every bottle is traceable from cow to doorstep. Today, 500+ families wake up to pure, certified fresh milk — every single morning.
            </p>

            {/* Founder stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { n: '50+',   l: 'Farm Partners' },
                { n: '500+',  l: 'Families Served' },
                { n: '3 hrs', l: 'Farm to Door' },
              ].map(s => (
                <div key={s.l} className="text-center p-4 rounded-2xl"
                  style={{ background: 'rgba(200,169,126,0.07)', border: '1px solid rgba(200,169,126,0.14)' }}>
                  <div className="font-serif text-2xl font-black text-[#071426]">{s.n}</div>
                  <div className="text-[#071426]/45 text-[11px] font-bold tracking-wide mt-1">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <PremiumBtn onClick={() => {}} outline className="!text-[#071426] !border-[#C8A97E]/45">
                Learn Our Mission
              </PremiumBtn>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 7 — SUBSCRIPTION PLANS
══════════════════════════════════════════════ */
function PlansSection({ navigate }) {
  const [billing, setBilling] = useState('monthly');

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#050d1a,#071426)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(200,169,126,0.04),transparent 70%)', filter: 'blur(90px)' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <FadeUp className="text-center mb-16">
          <Eyebrow>Subscribe & Save</Eyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">Milk Subscription Plans</h2>
          <p className="text-white/36 text-sm max-w-sm mx-auto font-sans mb-10">Fresh milk every day. Pause, skip or cancel anytime — no questions asked.</p>
          {/* Billing toggle */}
          <div className="inline-flex glass rounded-full p-1">
            {['monthly', 'yearly'].map(p => (
              <button key={p} onClick={() => setBilling(p)}
                className="px-6 py-2.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all"
                style={billing === p
                  ? { background: 'linear-gradient(135deg,#C8A97E,#e8c99e)', color: '#071426' }
                  : { color: 'rgba(255,255,255,0.32)' }}>
                {p === 'yearly' ? 'Yearly (−15%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => {
            const isPopular = plan.badge === 'Most Popular';
            const displayPrice = billing === 'yearly' ? plan.yPrice : plan.price;
            return (
              <FadeUp key={plan.name} delay={i * 0.1}>
                <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.32 }}
                  className="relative rounded-3xl overflow-hidden"
                  style={{ marginTop: isPopular ? '0' : '24px' }}>
                  {isPopular && (
                    <div className="absolute -inset-[1.5px] rounded-3xl z-0 shimmer-border-anim" />
                  )}
                  <div className="relative z-10 p-8 flex flex-col h-full"
                    style={isPopular
                      ? { background: '#0a1e36' }
                      : { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {plan.badge && (
                      <span className="ribbon-badge self-start mb-5">{plan.badge}</span>
                    )}
                    <div className="text-white/32 text-[10px] font-bold tracking-widest uppercase mb-4">{plan.name}</div>
                    <div className="font-serif font-black text-white mb-1" style={{ fontSize: 'clamp(2.5rem,5vw,3.2rem)' }}>
                      <sup className="text-xl font-sans text-white/38">₹</sup>
                      <AnimatePresence mode="wait">
                        <motion.span key={`${plan.name}-${billing}`}
                          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                          className="inline-block">
                          {displayPrice}
                        </motion.span>
                      </AnimatePresence>
                      <sub className="text-sm font-sans font-normal text-white/28">/mo</sub>
                    </div>
                    <div className="text-white/32 text-sm mb-8 font-sans">{plan.desc}</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-white/58 font-sans">
                          <span className="font-bold text-[#C8A97E]">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <PremiumBtn onClick={() => navigate('/subscription')} outline={!isPopular} className="w-full text-center">
                      Get Started
                    </PremiumBtn>
                  </div>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.22} className="mt-12">
          <div className="flex flex-wrap justify-center gap-7 text-white/22 text-[10.5px] font-bold tracking-wider uppercase">
            {['Pause Anytime','Vacation Mode','Flexible Delivery','No Lock-in','WhatsApp Support'].map(p => (
              <span key={p} className="flex items-center gap-1.5"><span className="text-[#C8A97E]">✓</span>{p}</span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 8 — TESTIMONIALS (infinite marquee)
══════════════════════════════════════════════ */
function TestimonialsSection() {
  // Double the array for infinite loop illusion
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-32 bg-[#F9F8F4] relative overflow-hidden">
      {/* Giant quote mark */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 select-none pointer-events-none font-serif font-black"
        style={{ fontSize: '20rem', lineHeight: 0.7, color: 'rgba(200,169,126,0.05)', zIndex: 0 }}>"</div>

      <div className="relative z-10">
        <FadeUp className="text-center mb-16 px-6">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <span className="block h-px w-9 bg-[#C8A97E]" />
            <span className="text-[10px] font-black uppercase tracking-[0.38em] text-[#C8A97E]">Happy Families</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#071426]">
            500+ Families Trust<br /><span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[1,2,3,4,5].map(s => <span key={s} className="text-[#C8A97E] text-lg">★</span>)}
            <span className="text-[#071426]/32 text-sm ml-2 font-sans">4.9 out of 5</span>
          </div>
        </FadeUp>

        {/* Infinite marquee */}
        <div className="marquee-container">
          <div className="animate-marquee">
            {doubled.map((t, i) => (
              <div key={i} className="flex-shrink-0 w-[340px] mx-3">
                <div className="bg-white rounded-3xl p-6 h-full"
                  style={{ border: '1px solid rgba(200,169,126,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <div className="text-[#C8A97E] mb-3 tracking-wider">{'★'.repeat(t.stars)}</div>
                  <p className="font-serif text-[#071426] text-base italic leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#C8A97E]/10">
                    <div className="w-10 h-10 rounded-full bg-[#EFECE1] flex items-center justify-center text-xl flex-shrink-0">🧑</div>
                    <div>
                      <div className="font-bold text-[#071426] text-sm">{t.name}</div>
                      <div className="text-[#071426]/35 text-[11px]">{t.loc}, Navi Mumbai</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust pill badges */}
        <FadeUp className="flex flex-wrap justify-center gap-3 mt-12 px-6">
          {['✓ FSSAI Certified','🥛 A2 Certified Milk','📦 Cold Chain Verified','🌿 100% Organic','⭐ 4.9 Rating'].map(b => (
            <span key={b} className="rounded-full px-4 py-2 text-[11px] font-bold tracking-wide"
              style={{ background: 'rgba(200,169,126,0.1)', color: '#B5956A', border: '1px solid rgba(200,169,126,0.22)' }}>
              {b}
            </span>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 9 — DELIVERY MAP
══════════════════════════════════════════════ */
function DeliverySection() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#071426,#0a1f38 55%,#071426)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <Eyebrow>Delivery Coverage</Eyebrow>
            <h2 className="font-serif text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Serving All of<br /><GoldText>Navi Mumbai.</GoldText>
            </h2>
            <p className="text-white/36 text-sm font-sans leading-relaxed mb-8">
              Delivering across 6 major zones — and expanding every month to reach more premium families.
            </p>
            <div className="space-y-2.5">
              {ZONES.map(z => (
                <div key={z.name} className="glass flex items-center gap-4 rounded-xl px-4 py-3">
                  <div className="relative w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: z.active ? '#C8A97E' : 'rgba(255,255,255,0.15)' }}>
                    {z.active && <div className="absolute inset-0 rounded-full animate-live-ping" style={{ background: '#C8A97E', opacity: 0.38 }} />}
                  </div>
                  <span className="text-white text-sm font-bold">{z.name}</span>
                  <span className="text-white/22 text-[11px] ml-auto font-medium">{z.active ? '✓ Active' : 'Coming Soon'}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Map */}
          <FadeUp delay={0.15}>
            <div className="relative rounded-3xl overflow-hidden"
              style={{ aspectRatio: '1', background: 'linear-gradient(135deg,#0a1e36,#071426)', border: '1px solid rgba(200,169,126,0.08)' }}>
              <div className="absolute inset-0"
                style={{ backgroundImage: 'linear-gradient(rgba(200,169,126,0.032) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,126,0.032) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
                style={{ background: 'radial-gradient(circle,rgba(200,169,126,0.09),transparent 70%)', filter: 'blur(32px)' }} />
              {ZONES.map((z, i) => (
                <motion.div key={z.name} className="absolute" style={{ left: `${z.x}%`, top: `${z.y}%` }}
                  animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}>
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full"
                      style={{ background: z.active ? '#C8A97E' : 'rgba(255,255,255,0.12)', boxShadow: z.active ? '0 0 22px rgba(200,169,126,0.65)' : 'none' }} />
                    {z.active && <div className="absolute inset-0 rounded-full animate-live-ping" style={{ background: '#C8A97E', opacity: 0.28 }} />}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white/55">{z.name}</div>
                  </div>
                </motion.div>
              ))}
              <svg className="absolute inset-0 w-full h-full opacity-14">
                {[['32%','42%','52%','34%'],['52%','34%','58%','62%'],['58%','62%','46%','56%']].map(([x1,y1,x2,y2], i) => (
                  <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#C8A97E" strokeWidth="1.5" strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'linear' }} />
                ))}
              </svg>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="glass-dark rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">🚐</span>
                  <div>
                    <div className="text-white text-xs font-bold">Live Delivery Fleet</div>
                    <div className="text-white/32 text-[10px]">12 vans active right now</div>
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

/* ══════════════════════════════════════════════
   SECTION 10 — FINAL CTA
══════════════════════════════════════════════ */
function CTASection({ navigate }) {
  return (
    <section className="relative py-40 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={IMG.ctaBg} alt="Sunrise farm — Milqu Fresh Navi Mumbai"
          className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(7,20,38,0.97),rgba(7,20,38,0.8))' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.92),transparent 45%)' }} />
      </div>
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }, (_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: 'rgba(200,169,126,0.65)' }}
            animate={{ y: [0, -22, 0], opacity: [0.18, 0.5, 0.18] }}
            transition={{ duration: Math.random() * 6 + 5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 5 }} />
        ))}
      </div>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center relative z-10">
        <FadeUp>
          <div className="inline-flex items-center gap-2 glass-gold rounded-full px-5 py-2.5 mb-8">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#C8A97E]">Join 500+ Happy Families</span>
          </div>
          <h2 className="font-serif font-black text-white mb-6 leading-tight" style={{ fontSize: 'clamp(2.5rem,7vw,5.5rem)' }}>
            Start Your<br />Farm-Fresh<br /><GoldText>Journey Today.</GoldText>
          </h2>
          <p className="text-white/42 text-base sm:text-lg mb-12 font-sans max-w-xl mx-auto leading-relaxed">
            Pure milk, fresh vegetables, ethically sourced — delivered before sunrise, every single day.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PremiumBtn onClick={() => navigate('/subscription')}>Subscribe Now →</PremiumBtn>
            <PremiumBtn href="https://wa.me/918767067884?text=Hi! I'd like to know more about Milqu Fresh." target="_blank" outline>
              <span className="mr-1.5">💬</span> WhatsApp Us
            </PremiumBtn>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();



  return (
    <>

      {/* WhatsApp FAB */}
      <motion.a
        href="https://wa.me/918767067884?text=Hi! I'd like to know more about Milqu Fresh."
        target="_blank" rel="noopener noreferrer"
        className="whatsapp-fab" aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.94 }}>
        💬
      </motion.a>

      {/* Sticky mobile CTA */}
      <div className="mobile-sticky-cta lg:hidden">
        <div className="flex gap-3">
          <button onClick={() => navigate('/subscription')}
            className="flex-1 py-3.5 rounded-full text-[11px] font-black tracking-widest uppercase text-[#071426]"
            style={{ background: 'linear-gradient(135deg,#C8A97E,#e8c99e)', boxShadow: '0 6px 20px rgba(200,169,126,0.28)' }}>
            Subscribe Now →
          </button>
          <a href="https://wa.me/918767067884" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-[52px] rounded-full text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: '0 6px 20px rgba(37,211,102,0.32)' }}
            aria-label="WhatsApp">
            💬
          </a>
        </div>
      </div>

      {/* All sections */}
      <HeroSection navigate={navigate} />
      <StorytellingSection />
      <CollectionSection navigate={navigate} />
      <WhySection />
      <TrustSection />
      <FounderSection />
      <PlansSection navigate={navigate} />
      <TestimonialsSection />
      <DeliverySection />
      <CTASection navigate={navigate} />
    </>
  );
}
