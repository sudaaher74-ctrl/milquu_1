import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════
   REAL DAIRY IMAGE LIBRARY — all dairy/farm/milk related
══════════════════════════════════════════════════ */
const DAIRY_IMGS = {
  heroFarm:     '/images/hero-farm.jpg',
  cowMilking:   'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&auto=format&fit=crop&q=80',   // cow close-up
  labTest:      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80',   // lab/testing
  coldStore:    'https://images.unsplash.com/photo-1563636619-e9143da7f009?w=800&auto=format&fit=crop&q=80',      // milk in glass/cold
  milkBottles:  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',      // milk bottles
  farmAerial:   'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',   // cows grazing
  freshMilk:    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&auto=format&fit=crop&q=80',      // fresh milk pour
  farmMorning:  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop&q=80',   // farm morning
  dairyCows:    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80',   // dairy cows
  packaging:    'https://images.unsplash.com/photo-1608636048516-97f9d6b4a29b?w=800&auto=format&fit=crop&q=80',   // food packaging
  ctaBg:        'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&auto=format&fit=crop&q=80',
};

/* ══════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════ */
const STORY_STEPS = [
  { time: '4:00 AM', label: 'Ethical Milking', icon: '🐄', img: DAIRY_IMGS.cowMilking,
    desc: 'Our partner cows are hand-milked at dawn in stress-free, ethical conditions.' },
  { time: '5:00 AM', label: 'Quality Testing', icon: '🔬', img: DAIRY_IMGS.labTest,
    desc: 'Every batch tested for purity, fat content, SNF and microbial safety.' },
  { time: '5:30 AM', label: 'Cold Packaging', icon: '❄️', img: DAIRY_IMGS.milkBottles,
    desc: 'Sealed at 4°C in food-grade tamper-proof packaging within 90 minutes of milking.' },
  { time: '6:00 AM', label: 'Van Dispatch', icon: '🚐', img: DAIRY_IMGS.farmAerial,
    desc: 'Refrigerated vans loaded and dispatched across Navi Mumbai zones.' },
  { time: '7:00 AM', label: 'At Your Door', icon: '🏡', img: DAIRY_IMGS.freshMilk,
    desc: 'Fresh, cold milk waiting before your alarm — pure, certified, perfect.' },
  { time: 'Always', label: 'Zero Compromise', icon: '🌿', img: DAIRY_IMGS.dairyCows,
    desc: 'No additives. No preservatives. No artificial hormones. Ever.' },
];

const CATEGORIES = [
  { src: '/images/milk-products.png', label: 'Pure Milk', sub: 'Cow, Buffalo & A2 Organic', filter: 'milk', accent: '#C8A97E' },
  { src: '/images/vegitables.png', label: 'Vegetables', sub: 'Farm-picked daily', filter: 'vegetables', accent: '#4a9e5c' },
  { src: '/images/milk-by-products.png', label: 'Dairy Products', sub: 'Ghee, Paneer, Butter', filter: 'dairy', accent: '#e8c99e' },
  { src: '/images/fruits.png', label: 'Fresh Fruits', sub: 'Seasonal & Tropical', filter: 'fruits', accent: '#a8d5a2' },
];

const WHY_ITEMS = [
  { icon: '🌾', title: 'Direct from Farms', img: DAIRY_IMGS.farmAerial,
    desc: 'We partner with verified local farms, cutting out every middleman so you always get the freshest produce at fair prices.' },
  { icon: '⏰', title: 'Daily Fresh Delivery', img: DAIRY_IMGS.milkBottles,
    desc: 'Milk collected every morning at 4AM and at your doorstep by 7AM — fresher than any supermarket, every single day.' },
  { icon: '🌿', title: '100% Organic', img: DAIRY_IMGS.dairyCows,
    desc: 'No artificial hormones, no shortcuts. Pure natural goodness from ethically raised, stress-free animals.' },
  { icon: '🔬', title: 'Lab Tested Purity', img: DAIRY_IMGS.labTest,
    desc: 'Every batch tested in FSSAI-certified labs for purity, fat content and safety. Zero compromises.' },
];

const TESTIMONIALS = [
  { name: 'Abhishek Gunjal', loc: 'Nerul, Navi Mumbai', text: 'The milk quality is absolutely amazing. You can taste the difference — no powdery smell, just pure creamy goodness. Our kids love it!', stars: 5 },
  { name: 'Rushikesh Patil', loc: 'Kharghar, Navi Mumbai', text: 'Vegetables are so fresh they last much longer than supermarket ones. Always on time, always perfect. Highly recommended!', stars: 5 },
  { name: 'Shantanu Dhanawde', loc: 'Belapur, Navi Mumbai', text: 'Five stars for the buffalo milk! The cream layer on top every morning is a testament to its purity. Nothing beats it.', stars: 5 },
  { name: 'Priya Sharma', loc: 'Panvel, Navi Mumbai', text: 'Switched 3 months ago. Cannot go back. The ghee is world-class. Premium quality at genuinely fair pricing.', stars: 5 },
  { name: 'Amit Desai', loc: 'Kamothe, Navi Mumbai', text: 'Subscription is seamless — pause, skip, change quantities with one tap. The team is incredibly responsive!', stars: 5 },
];

const PLANS = [
  { name: 'Starter', price: '1,800', yPrice: '1,530', desc: 'Cow Milk · 1L Daily', badge: null,
    features: ['1L Cow Milk daily', 'By 7AM daily', 'Free delivery always', 'Pause anytime'] },
  { name: 'Popular', price: '2,250', yPrice: '1,913', desc: 'Buffalo Milk · 1L Daily', badge: 'Most Popular',
    features: ['1L Buffalo Milk daily', 'Priority by 6AM', 'Free delivery always', 'Vacation mode', 'WhatsApp support'] },
  { name: 'Premium', price: '3,600', yPrice: '3,060', desc: 'A2 Organic · 1L Daily', badge: 'Best Quality',
    features: ['1L A2 Organic daily', 'Priority by 5:30AM', 'Free delivery always', 'Flexible scheduling', 'Dedicated concierge'] },
];

const ZONES = [
  { name: 'Kharghar', x: 32, y: 42, active: true },
  { name: 'Belapur', x: 52, y: 34, active: true },
  { name: 'Seawoods', x: 46, y: 56, active: true },
  { name: 'Nerul', x: 58, y: 62, active: true },
  { name: 'Panvel', x: 22, y: 68, active: false },
  { name: 'Kamothe', x: 18, y: 52, active: false },
];

/* ══════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════ */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block h-px w-10 bg-[#C8A97E]" />
      <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C8A97E]">{children}</span>
    </div>
  );
}

function PremiumBtn({ children, onClick, outline = false, className = '' }) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden text-xs font-bold tracking-widest uppercase px-9 py-4 rounded-full ${className}`}
      style={outline
        ? { border: '1px solid rgba(200,169,126,0.45)', color: '#C8A97E', background: 'transparent' }
        : { background: 'linear-gradient(135deg,#C8A97E,#e8c99e)', color: '#071426', boxShadow: '0 8px 32px rgba(200,169,126,0.28)' }
      }>
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════
   SECTION 1 — HERO
══════════════════════════════════════════════════ */
function HeroSection({ navigate }) {
  const [count, setCount] = useState(247);
  const [countKey, setCountKey] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const t = setInterval(() => { setCount(c => c + Math.floor(Math.random() * 3 + 1)); setCountKey(k => k + 1); }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(((clientX - left) / width - 0.5) * 60);
    mouseY.set(((clientY - top) / height - 0.5) * 30);
  };

  const particles = Array.from({ length: 20 }, (_, i) => ({
    w: Math.random() * 4 + 2, h: Math.random() * 4 + 2,
    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    bg: i % 3 === 0 ? 'rgba(200,169,126,0.7)' : i % 3 === 1 ? 'rgba(255,255,255,0.25)' : 'rgba(130,200,130,0.4)',
    dur: Math.random() * 6 + 5, delay: Math.random() * 5,
  }));

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden -mt-16" onMouseMove={handleMouseMove}>
      {/* Cinematic zoom bg */}
      <motion.div className="absolute inset-0 z-0"
        initial={{ scale: 1.15 }} animate={{ scale: 1.0 }}
        transition={{ duration: 12, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <img src={DAIRY_IMGS.heroFarm} alt="Milqu Fresh Farm — Pure dairy from Navi Mumbai" className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
      </motion.div>

      {/* Multi-layer overlays */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(115deg,rgba(7,20,38,0.94) 0%,rgba(7,20,38,0.62) 42%,rgba(7,20,38,0.2) 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 z-[1]" style={{ height: '45%', background: 'linear-gradient(to top,#071426 0%,transparent 100%)' }} />

      {/* Mouse-follow gradient */}
      <motion.div className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(200,169,126,0.06), transparent 70%)` }} />

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {[
          { w: 400, h: 400, l: '58%', t: '-8%', bg: 'radial-gradient(circle,rgba(200,169,126,0.11),transparent 70%)', blur: 50 },
          { w: 250, h: 250, l: '78%', t: '38%', bg: 'radial-gradient(circle,rgba(255,255,255,0.04),transparent 70%)', blur: 35 },
          { w: 180, h: 180, l: '8%',  t: '55%', bg: 'radial-gradient(circle,rgba(200,169,126,0.09),transparent 70%)', blur: 28 },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: o.w, height: o.h, left: o.l, top: o.t, background: o.bg, filter: `blur(${o.blur}px)` }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }} />
        ))}
        {/* Light rays */}
        {[16, 26, 36].map((l, i) => (
          <motion.div key={i} className="absolute top-0 h-full w-px"
            style={{ left: `${l}%`, background: 'linear-gradient(to bottom,rgba(200,169,126,0.22),transparent 55%)', filter: 'blur(3px)' }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 5 + i * 1.5, repeat: Infinity, delay: i * 2, ease: 'easeInOut' }} />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: p.w, height: p.h, left: p.left, top: p.top, background: p.bg }}
            animate={{ y: [0, -22, 0], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div>
              {/* Live counter badge */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-8"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-white/75 text-[11px] font-bold tracking-wider uppercase">
                  <AnimatePresence mode="wait">
                    <motion.span key={countKey} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.25 }} className="inline-block">
                      {count}
                    </motion.span>
                  </AnimatePresence>
                  {' '}Deliveries Today · Live
                </span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 mb-5">
                <span className="block h-px w-12 bg-[#C8A97E]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C8A97E]">Pure · Fresh · Natural</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-black leading-[1.02] mb-6 tracking-tight text-white"
                style={{ textShadow: '0 4px 48px rgba(0,0,0,0.55)' }}>
                Pure Farm<br />Fresh Milk.<br />
                <span style={{ background: 'linear-gradient(135deg,#C8A97E,#f5dba8,#C8A97E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Delivered Daily.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-white/60 text-base sm:text-lg leading-relaxed mb-10 max-w-lg font-sans">
                Farm-to-doorstep in under 3 hours. No middlemen, no preservatives —<br className="hidden sm:block" />
                just pure organic goodness delivered before sunrise.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4 mb-12">
                <PremiumBtn onClick={() => navigate('/subscription')}>Start Subscription →</PremiumBtn>
                <PremiumBtn onClick={() => navigate('/about')} outline>Explore Our Process</PremiumBtn>
              </motion.div>

              {/* Trust strip */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                className="flex flex-wrap gap-x-8 gap-y-3">
                {[['🌿', '100% Organic'], ['⚡', 'Under 3 Hours'], ['🔒', 'Zero Preservatives'], ['⭐', '4.9 Rating']].map(([ic, t]) => (
                  <div key={t} className="flex items-center gap-2 text-white/40 text-[11px] font-bold tracking-wider uppercase">
                    <span className="text-sm">{ic}</span>{t}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Floating stats card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex flex-col gap-4 items-end">
              <motion.div className="rounded-3xl p-8 w-80"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">🥛</span>
                  <span className="text-white/45 text-xs font-bold tracking-widest uppercase">Live Dashboard</span>
                </div>
                {[
                  { label: 'Deliveries Today', val: `${count}+`, color: '#C8A97E' },
                  { label: 'Organic Certified', val: '100%',    color: '#4a9e5c' },
                  { label: 'Delivered By',      val: '7 AM',    color: '#e8c99e' },
                  { label: 'Happy Families',    val: '500+',    color: '#C8A97E' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-white/40 text-xs font-sans">{s.label}</span>
                    <span className="font-serif font-bold text-xl" style={{ color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </motion.div>
              <div className="flex gap-3">
                {[{ ic: '🚐', t: 'Cold Chain', s: 'Maintained' }, { ic: '🏆', t: 'Top Rated', s: 'Navi Mumbai' }].map((b, i) => (
                  <motion.div key={b.t} className="rounded-2xl px-4 py-3 flex items-center gap-2.5"
                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4.5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}>
                    <span className="text-xl">{b.ic}</span>
                    <div>
                      <div className="text-white text-xs font-bold">{b.t}</div>
                      <div className="text-white/35 text-[10px]">{b.s}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <span className="text-white/20 text-[9px] tracking-[0.35em] uppercase font-bold block text-center mb-1">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent mx-auto" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   SECTION 2 — STORYTELLING (GSAP scroll reveal)
══════════════════════════════════════════════════ */
function StorytellingSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.story-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', delay: (i % 3) * 0.12,
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' } }
      );
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section className="py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#071426,#0a1f38 50%,#071426)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(200,169,126,0.03) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-20">
          <SectionEyebrow>Farm to Doorstep</SectionEyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Every Drop Has a<br />
            <span style={{ background: 'linear-gradient(135deg,#C8A97E,#f5dba8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Story.
            </span>
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto font-sans leading-relaxed">
            Watch your milk's journey — from ethical farms to your family's table, in under 3 hours.
          </p>
        </FadeUp>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORY_STEPS.map((s, i) => (
            <div key={s.label} className="story-card group relative rounded-3xl overflow-hidden cursor-pointer opacity-0"
              style={{ aspectRatio: '4/3' }}>
              <img src={s.img} alt={`Milqu Fresh — ${s.label}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.96) 0%,rgba(7,20,38,0.35) 50%,transparent 100%)' }} />
              {/* Gold glow border on hover */}
              <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-[#C8A97E]/30 transition-colors duration-500" />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: 'inset 0 0 40px rgba(200,169,126,0.06)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A97E]">{s.time}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-1.5">{s.label}</h3>
                <p className="text-white/45 text-xs font-sans leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   SECTION 3 — COLLECTION
══════════════════════════════════════════════════ */
function CollectionSection({ navigate }) {
  const gsapRef = useRef(null);

  useEffect(() => {
    if (!gsapRef.current) return;
    const items = gsapRef.current.querySelectorAll('.cat-card');
    items.forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 50, scale: 0.97 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }, delay: i * 0.1,
      });
    });
  }, []);

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#050d1a,#071426)' }}>
      <div className="absolute top-0 right-0 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse,rgba(200,169,126,0.05) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-8">
          <FadeUp>
            <SectionEyebrow>Our Collection</SectionEyebrow>
            <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none">
              The<br />Precision<br />
              <span style={{ background: 'linear-gradient(135deg,#C8A97E,#f5dba8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Palette.</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-white/30 text-sm max-w-xs font-sans leading-relaxed lg:text-right lg:pb-2">
              Elevating dairy to a premium lifestyle. Crafted with precision and organic soul.
            </p>
          </FadeUp>
        </div>

        <div ref={gsapRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.filter} className="cat-card group relative rounded-3xl overflow-hidden cursor-pointer opacity-0"
              style={{ marginTop: i % 2 === 1 ? '32px' : '0' }}
              onClick={() => navigate(`/products?cat=${cat.filter}`)}>
              <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
                {/* Animated glow border */}
                <div className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"
                  style={{ background: `linear-gradient(135deg,${cat.accent}40,transparent 40%,${cat.accent}15)` }} />
                <div className="bg-[#0a1e36] border border-white/5 group-hover:border-[#C8A97E]/25 transition-all duration-500 rounded-3xl overflow-hidden">
                  <div className="relative overflow-hidden" style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/3' }}>
                    <motion.img src={cat.src} alt={`Milqu Fresh ${cat.label} delivery Navi Mumbai`}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      loading="lazy" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.7) 0%,transparent 55%)' }} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-white font-bold text-xl mb-1">{cat.label}</h3>
                    <p className="text-white/30 text-xs font-sans mb-4">{cat.sub}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: cat.accent }}>
                      Explore
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <FadeUp delay={0.2} className="text-center mt-16">
          <PremiumBtn onClick={() => navigate('/products')} outline>View All Products</PremiumBtn>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   SECTION 4 — WHY US (alternating, GSAP)
══════════════════════════════════════════════════ */
function WhySection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const rows = sectionRef.current.querySelectorAll('.why-row');
    rows.forEach((row) => {
      gsap.fromTo(row, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 85%', toggleActions: 'play none none none' },
      });
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-[#F9F8F4] relative">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-20">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <span className="block h-px w-10 bg-[#C8A97E]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C8A97E]">Our Promise</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#071426]">
            Why Families Choose<br />
            <span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
          </h2>
        </FadeUp>

        <div className="space-y-28">
          {WHY_ITEMS.map((w, i) => (
            <div key={w.title} className="why-row opacity-0">
              <div className={`flex flex-col md:flex-row items-center gap-16 xl:gap-28 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Text */}
                <div className="flex-1 max-w-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: 'rgba(200,169,126,0.1)', border: '1px solid rgba(200,169,126,0.2)' }}>
                      {w.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A97E]">Pillar 0{i + 1}</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-black text-[#071426] mb-5 leading-tight">{w.title}</h3>
                  <p className="text-[#071426]/50 text-sm leading-relaxed font-sans mb-8">{w.desc}</p>
                  <div className="h-px w-20 bg-[#C8A97E]/25" />
                </div>
                {/* Image */}
                <div className="flex-1 w-full">
                  <motion.div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl"
                    style={{ aspectRatio: '4/3' }}
                    whileHover={{ y: -8, rotateY: i % 2 === 0 ? 2 : -2 }}
                    transition={{ duration: 0.5 }}>
                    <img src={w.img} alt={`Milqu Fresh — ${w.title}`} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.35),transparent 60%)' }} />
                    <div className="absolute bottom-5 left-5 rounded-xl px-4 py-2.5"
                      style={{ background: 'rgba(7,20,38,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)' }}>
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

/* ══════════════════════════════════════════════════
   SECTION 5 — TRUST TIMELINE
══════════════════════════════════════════════════ */
function TrustSection() {
  const [active, setActive] = useState(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!timelineRef.current) return;
    gsap.fromTo('.timeline-item', { opacity: 0, x: -30 }, {
      opacity: 1, x: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: timelineRef.current, start: 'top 80%' },
    });
  }, []);

  const TIMELINE = [
    { time: '4:00 AM', label: 'Milking', icon: '🐄', desc: 'Fresh milk collected from partner farms at dawn.' },
    { time: '5:00 AM', label: 'Quality Testing', icon: '🔬', desc: 'Purity, fat content and microbial safety verified.' },
    { time: '5:30 AM', label: 'Packaging', icon: '📦', desc: 'Sealed at 4°C in food-grade tamper-proof containers.' },
    { time: '6:00 AM', label: 'Dispatch', icon: '🚐', desc: 'Cold-chain delivery vans depart from central hub.' },
    { time: '7:00 AM', label: 'At Your Door', icon: '🏡', desc: 'Fresh milk delivered while your family sleeps.' },
  ];

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#071426,#0a1f38 50%,#071426)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(200,169,126,0.025) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <FadeUp className="text-center mb-16">
          <SectionEyebrow>Trust & Transparency</SectionEyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Freshness You Can<br />
            <span style={{ background: 'linear-gradient(135deg,#C8A97E,#f5dba8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Trace in Real Time.
            </span>
          </h2>
          <p className="text-white/38 text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Every minute of your milk's journey is documented, tested and fully transparent.
          </p>
        </FadeUp>

        {/* Timeline */}
        <div ref={timelineRef} className="max-w-3xl mx-auto mb-20">
          <div className="relative pl-16 sm:pl-20">
            {/* Vertical progress line */}
            <div className="absolute left-6 sm:left-8 top-4 bottom-4 w-[2px]"
              style={{ background: 'linear-gradient(to bottom,#C8A97E,rgba(200,169,126,0.1))' }} />
            <div className="space-y-6">
              {TIMELINE.map((step, i) => (
                <div key={step.time} className="timeline-item relative opacity-0 cursor-pointer"
                  onClick={() => setActive(active === i ? null : i)}>
                  {/* Dot */}
                  <div className="absolute -left-10 sm:-left-12 top-5 flex items-center justify-center">
                    <motion.div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ background: 'linear-gradient(135deg,rgba(200,169,126,0.25),rgba(200,169,126,0.05))', border: '1px solid rgba(200,169,126,0.35)', boxShadow: '0 0 20px rgba(200,169,126,0.2)' }}
                      animate={{ boxShadow: active === i ? '0 0 40px rgba(200,169,126,0.55)' : '0 0 20px rgba(200,169,126,0.2)' }}>
                      {step.icon}
                    </motion.div>
                  </div>
                  {/* Card */}
                  <motion.div className="rounded-2xl p-5"
                    style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
                    animate={{ borderColor: active === i ? 'rgba(200,169,126,0.4)' : 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8A97E]">{step.time}</span>
                      <span className="text-white/25 text-xs">{active === i ? '▲' : '▼'}</span>
                    </div>
                    <h4 className="font-serif text-white font-bold text-lg">{step.label}</h4>
                    <AnimatePresence>
                      {active === i && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-white/45 text-xs font-sans leading-relaxed mt-2">
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

        {/* Trust badges */}
        <FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { ic: '🧪', t: 'Lab Tested', s: 'Every single batch' },
              { ic: '🌿', t: 'No Preservatives', s: 'Guaranteed always' },
              { ic: '💉', t: 'Hormone Free', s: 'Ethically raised' },
              { ic: '🏆', t: 'FSSAI Certified', s: 'Quality assured' },
            ].map(b => (
              <motion.div key={b.t} className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
                whileHover={{ y: -6, borderColor: 'rgba(200,169,126,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                transition={{ duration: 0.3 }}>
                <div className="text-3xl mb-3">{b.ic}</div>
                <div className="text-white font-bold text-sm mb-1">{b.t}</div>
                <div className="text-white/35 text-[11px]">{b.s}</div>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   SECTION 6 — SUBSCRIPTION PLANS
══════════════════════════════════════════════════ */
function PlansSection({ navigate }) {
  const [billing, setBilling] = useState('monthly');

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#050d1a,#071426)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(200,169,126,0.04),transparent 70%)', filter: 'blur(100px)' }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <FadeUp className="text-center mb-16">
          <SectionEyebrow>Subscribe & Save</SectionEyebrow>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">Milk Subscription Plans</h2>
          <p className="text-white/38 text-sm max-w-lg mx-auto font-sans mb-10">
            Fresh milk every day. Pause, skip or cancel anytime — no questions asked.
          </p>
          <div className="inline-flex rounded-full p-1" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['monthly', 'yearly'].map(p => (
              <button key={p} onClick={() => setBilling(p)}
                className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all"
                style={billing === p ? { background: 'linear-gradient(135deg,#C8A97E,#e8c99e)', color: '#071426' } : { color: 'rgba(255,255,255,0.35)' }}>
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
                <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.35 }}
                  className="relative rounded-3xl overflow-hidden"
                  style={{ marginTop: isPopular ? '0' : '24px' }}>
                  {isPopular && (
                    <div className="absolute -inset-[1.5px] rounded-3xl z-0"
                      style={{ background: 'linear-gradient(90deg,#C8A97E,#fff3d4,#C8A97E,#a8895e)', backgroundSize: '300% 300%', animation: 'border-shimmer 3s ease infinite' }} />
                  )}
                  <div className="relative z-10 p-8 h-full flex flex-col"
                    style={isPopular
                      ? { background: '#0a1e36' }
                      : { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {plan.badge && (
                      <div className="self-start mb-5 rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase"
                        style={{ background: 'linear-gradient(135deg,#C8A97E,#e8c99e)', color: '#071426' }}>
                        {plan.badge}
                      </div>
                    )}
                    <div className="text-white/35 text-[10px] font-bold tracking-widest uppercase mb-4">{plan.name}</div>
                    <div className="font-serif text-5xl font-black text-white mb-1">
                      <sup className="text-2xl font-sans text-white/45">₹</sup>
                      <AnimatePresence mode="wait">
                        <motion.span key={`${plan.name}-${billing}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="inline-block">
                          {displayPrice}
                        </motion.span>
                      </AnimatePresence>
                      <sub className="text-sm font-sans font-normal text-white/30">/mo</sub>
                    </div>
                    <div className="text-white/35 text-sm mb-8 font-sans">{plan.desc}</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-white/60 font-sans">
                          <span className="text-base font-bold text-[#C8A97E]">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <PremiumBtn onClick={() => navigate('/subscription')} outline={!isPopular} className="w-full justify-center">
                      Get Started
                    </PremiumBtn>
                  </div>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.25} className="mt-12">
          <div className="flex flex-wrap justify-center gap-8 text-white/25 text-[11px] font-bold tracking-wider uppercase">
            {['Pause Anytime', 'Vacation Mode', 'Flexible Delivery', 'No Lock-in', 'WhatsApp Support'].map(p => (
              <span key={p} className="flex items-center gap-2"><span className="text-[#C8A97E]">✓</span>{p}</span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   SECTION 7 — TESTIMONIALS
══════════════════════════════════════════════════ */
function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-32 bg-[#F9F8F4] relative overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 select-none pointer-events-none font-serif font-black leading-none"
        style={{ fontSize: '18rem', color: 'rgba(200,169,126,0.05)', zIndex: 0 }}>"</div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
        <FadeUp className="text-center mb-16">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <span className="block h-px w-10 bg-[#C8A97E]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C8A97E]">Happy Families</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#071426]">
            500+ Families Trust<br /><span style={{ color: '#C8A97E' }}>Milqu Fresh</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[1,2,3,4,5].map(s => <span key={s} className="text-lg text-[#C8A97E]">★</span>)}
            <span className="text-[#071426]/35 text-sm ml-2 font-sans">4.9 out of 5</span>
          </div>
        </FadeUp>

        {/* Featured rotating review */}
        <FadeUp className="max-w-3xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-10 text-center shadow-xl"
              style={{ border: '1px solid rgba(200,169,126,0.12)' }}>
              <div className="text-[#C8A97E] text-xl tracking-wider mb-6">{'★'.repeat(TESTIMONIALS[active].stars)}</div>
              <p className="font-serif text-2xl sm:text-3xl text-[#071426] leading-relaxed italic mb-8">
                "{TESTIMONIALS[active].text}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#EFECE1] flex items-center justify-center text-2xl">🧑</div>
                <div className="text-left">
                  <div className="font-bold text-[#071426] text-sm">{TESTIMONIALS[active].name}</div>
                  <div className="text-[#071426]/35 text-xs">{TESTIMONIALS[active].loc}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: active === i ? 28 : 8, height: 8, background: active === i ? '#C8A97E' : 'rgba(200,169,126,0.22)' }} />
            ))}
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.09}>
              <motion.div whileHover={{ y: -6 }} className="bg-white rounded-2xl p-6 cursor-pointer"
                style={{ border: '1px solid rgba(200,169,126,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                onClick={() => setActive(i)}>
                <div className="text-[#C8A97E] mb-3 text-sm">{'★'.repeat(t.stars)}</div>
                <p className="text-[#071426]/55 text-xs font-sans leading-relaxed italic line-clamp-3 mb-4">"{t.text}"</p>
                <div className="font-bold text-[#071426] text-xs">{t.name}</div>
                <div className="text-[#071426]/30 text-[10px]">{t.loc}</div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   SECTION 8 — DELIVERY MAP
══════════════════════════════════════════════════ */
function DeliverySection() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#071426,#0a1f38 50%,#071426)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <SectionEyebrow>Delivery Coverage</SectionEyebrow>
            <h2 className="font-serif text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Serving All of<br />
              <span style={{ background: 'linear-gradient(135deg,#C8A97E,#f5dba8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Navi Mumbai.
              </span>
            </h2>
            <p className="text-white/38 text-sm font-sans leading-relaxed mb-8">
              We deliver to 6 major zones across Navi Mumbai — and expanding every month to reach more families.
            </p>
            <div className="space-y-3">
              {ZONES.map(z => (
                <div key={z.name} className="flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="relative w-2.5 h-2.5 rounded-full" style={{ background: z.active ? '#C8A97E' : 'rgba(255,255,255,0.18)' }}>
                    {z.active && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#C8A97E', opacity: 0.4 }} />}
                  </div>
                  <span className="text-white text-sm font-bold">{z.name}</span>
                  <span className="text-white/25 text-xs ml-auto">{z.active ? '✓ Active' : 'Coming Soon'}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Map visual */}
          <FadeUp delay={0.15}>
            <div className="relative rounded-3xl overflow-hidden"
              style={{ aspectRatio: '1', background: 'linear-gradient(135deg,#0a1e36,#071426)', border: '1px solid rgba(200,169,126,0.08)' }}>
              <div className="absolute inset-0"
                style={{ backgroundImage: 'linear-gradient(rgba(200,169,126,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,126,0.035) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
                style={{ background: 'radial-gradient(circle,rgba(200,169,126,0.09),transparent 70%)', filter: 'blur(30px)' }} />
              {ZONES.map((z, i) => (
                <motion.div key={z.name} className="absolute" style={{ left: `${z.x}%`, top: `${z.y}%` }}
                  animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}>
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full" style={{ background: z.active ? '#C8A97E' : 'rgba(255,255,255,0.12)', boxShadow: z.active ? '0 0 20px rgba(200,169,126,0.65)' : 'none' }} />
                    {z.active && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#C8A97E', opacity: 0.28 }} />}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white/60">{z.name}</div>
                  </div>
                </motion.div>
              ))}
              <svg className="absolute inset-0 w-full h-full opacity-15">
                {[['32%','42%','52%','34%'],['52%','34%','58%','62%'],['58%','62%','46%','56%']].map(([x1,y1,x2,y2], i) => (
                  <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C8A97E" strokeWidth="1.5" strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -20] }} transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'linear' }} />
                ))}
              </svg>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(7,20,38,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xl">🚐</span>
                  <div>
                    <div className="text-white text-xs font-bold">Live Delivery Fleet</div>
                    <div className="text-white/35 text-[10px]">12 vans active right now</div>
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

/* ══════════════════════════════════════════════════
   SECTION 9 — FINAL CTA
══════════════════════════════════════════════════ */
function CTASection({ navigate }) {
  return (
    <section className="relative py-40 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={DAIRY_IMGS.ctaBg} alt="Farm sunrise — Start your Milqu Fresh journey" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(7,20,38,0.96),rgba(7,20,38,0.8))' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.92) 0%,transparent 45%)' }} />
      </div>
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {Array.from({length:12},(_,i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width: Math.random()*5+2, height: Math.random()*5+2, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, background:'rgba(200,169,126,0.6)' }}
            animate={{ y:[0,-20,0], opacity:[0.2,0.5,0.2] }}
            transition={{ duration:Math.random()*6+5, repeat:Infinity, ease:'easeInOut', delay:Math.random()*5 }} />
        ))}
      </div>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center relative z-10">
        <FadeUp>
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 mb-8"
            style={{ background: 'rgba(200,169,126,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(200,169,126,0.2)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#C8A97E]">Join 500+ Happy Families</span>
          </div>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Start Your<br />Farm-Fresh<br />
            <span style={{ background: 'linear-gradient(135deg,#C8A97E,#f5dba8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Journey Today.
            </span>
          </h2>
          <p className="text-white/45 text-base sm:text-lg mb-12 font-sans max-w-xl mx-auto leading-relaxed">
            Pure milk, fresh vegetables, ethically sourced — delivered to your doorstep before sunrise, every single day.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PremiumBtn onClick={() => navigate('/subscription')}>Subscribe Now →</PremiumBtn>
            <motion.a
              href="https://wa.me/918767067884?text=Hi! I'd like to know more about Milqu Fresh delivery."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase transition-all"
              style={{ background: 'rgba(200,169,126,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(200,169,126,0.3)', color: '#C8A97E' }}
              whileHover={{ scale: 1.04, backgroundColor: 'rgba(200,169,126,0.14)' }}
              whileTap={{ scale: 0.97 }}>
              <span className="text-base">💬</span> WhatsApp Us
            </motion.a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

  // Luxury custom cursor
  useEffect(() => {
    const cursor  = document.getElementById('luxury-cursor');
    const ring    = document.getElementById('luxury-cursor-ring');
    if (!cursor || !ring) return;

    const onMove = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      ring.style.left   = e.clientX + 'px';
      ring.style.top    = e.clientY + 'px';
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      {/* Custom cursor elements */}
      <div id="luxury-cursor" />
      <div id="luxury-cursor-ring" />

      {/* WhatsApp FAB */}
      <motion.a href="https://wa.me/918767067884?text=Hi! I want to know more about Milqu Fresh."
        target="_blank" rel="noopener noreferrer" className="whatsapp-fab" aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.8, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}>
        💬
      </motion.a>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4 pt-2"
        style={{ background: 'linear-gradient(to top,rgba(7,20,38,0.97),rgba(7,20,38,0.8))', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(200,169,126,0.12)' }}>
        <div className="flex gap-3">
          <button onClick={() => navigate('/subscription')}
            className="flex-1 py-3.5 rounded-full text-xs font-black tracking-widest uppercase text-[#071426]"
            style={{ background: 'linear-gradient(135deg,#C8A97E,#e8c99e)', boxShadow: '0 6px 20px rgba(200,169,126,0.3)' }}>
            Subscribe Now →
          </button>
          <a href="https://wa.me/918767067884" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-12 rounded-full text-xl"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: '0 6px 20px rgba(37,211,102,0.35)' }}
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
      <PlansSection navigate={navigate} />
      <TestimonialsSection />
      <DeliverySection />
      <CTASection navigate={navigate} />
    </>
  );
}
