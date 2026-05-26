import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import PincodeChecker from '../components/storefront/PincodeChecker';

const TESTIMONIALS = [
  { name: 'Abhishek Gunjal', loc: 'Nerul, Navi Mumbai', text: '"The milk quality is absolutely amazing. You can taste the difference — no powdery smell, just pure creamy goodness."', stars: 5, avatar: '👩' },
  { name: 'Rushikesh Patil', loc: 'Kharghar, Navi Mumbai', text: '"Vegetables are so fresh they last much longer than supermarket ones. Always on time!"', stars: 5, avatar: '👨' },
  { name: 'Shantanu Dhanawde', loc: 'Belapur, Navi Mumbai', text: '"Five stars for the buffalo milk! The cream layer on top every morning is a testament to its purity."', stars: 5, avatar: '👨' },
];

const WHY_US = [
  { icon: '🌾', title: 'Direct from Farms', desc: 'We source directly from local partner farms, cutting out middlemen so you get the freshest produce at fair prices.' },
  { icon: '⏰', title: 'Daily Fresh Delivery', desc: 'Milk collected every morning and delivered to your doorstep by 7 AM — fresher than your local store.' },
  { icon: '🌿', title: '100% Organic', desc: 'No artificial hormones, no preservatives. Pure, natural goodness from ethically raised animals.' },
  { icon: '💰', title: 'Affordable Pricing', desc: 'By working directly with farmers, we keep prices fair for families while paying farmers properly.' },
  { icon: '📦', title: 'Flexible Subscription', desc: 'Subscribe for daily, alternate-day, or weekday delivery. Pause, cancel, or change quantities anytime.' },
  { icon: '🔬', title: 'Quality Tested', desc: 'Every batch is tested for purity and processed in certified hygienic facilities for your safety.' },
];

const CATEGORIES = [
  { icon: '/images/milk-products.png', emoji: '🥛', label: 'Milk', sub: 'Cow, Buffalo & Organic', filter: 'milk' },
  { icon: '/images/vegitables.png', emoji: '🥦', label: 'Vegetables', sub: 'Fresh & Farm-picked daily', filter: 'vegetables' },
  { icon: '/images/milk-by-products.png', emoji: '🧀', label: 'Milk By-Products', sub: 'Ghee, Paneer, Butter & more', filter: 'dairy' },
  { icon: '/images/fruits.png', emoji: '🍎', label: 'Fruits', sub: 'Seasonal & tropical varieties', filter: 'fruits' },
];

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* ── Hero ── */}
      {/* We use -mt-16 to pull the hero up under the Navbar (since Navbar spacer is 16 = 4rem) */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-0 overflow-hidden -mt-16">
        {/* Full background image */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-farm.jpg" alt="Farm Background" className="w-full h-full object-cover" />
          {/* Subtle gradient on the left for text legibility, keeping the rest of the photo bright and vibrant */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-navy)] to-transparent opacity-80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full flex-1 flex flex-col justify-center mt-12">
          <div className="max-w-2xl text-center mx-auto sm:text-left sm:mx-0">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-serif text-5xl sm:text-[6rem] font-bold text-white leading-[1.05] mb-6 tracking-tight drop-shadow-lg">
              Pure Farm <br className="hidden sm:block" />
              Fresh Milk. <br className="hidden sm:block" />
              <span className="text-[var(--color-gold)]">Delivered Daily.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-[var(--color-cream)]/90 text-lg leading-relaxed mb-10 max-w-xl font-sans drop-shadow-md">
              Experience the Tesla of Dairy—where precision science meets the purity of nature, delivered fresh every sunrise to your doorstep.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 mb-8 justify-center sm:justify-start">
              <button onClick={() => navigate('/subscription')} className="bg-[var(--color-gold)] hover:bg-white text-[var(--color-navy)] text-xs font-bold tracking-widest px-8 py-4 rounded-[2rem] transition-all shadow-xl uppercase">
                Start Subscription →
              </button>
              <button onClick={() => navigate('/about')} className="border border-white/30 text-white hover:bg-white/10 text-xs font-bold tracking-widest px-8 py-4 rounded-[2rem] transition-colors uppercase backdrop-blur-sm">
                Our Process →
              </button>
            </motion.div>
          </div>
        </div>


      </section>

      {/* ── Our Collection (Categories Dark Edition) ── */}
      <section className="py-24 bg-[var(--color-navy)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block text-[var(--color-gold)] text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3">Our Collection</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[var(--color-cream)] mb-4">The Precision Palette</h2>
              <p className="text-[var(--color-cream)]/60 text-sm max-w-lg mx-auto font-sans">Elevating dairy to a lifestyle. Discover products crafted with futuristic precision and organic soul.</p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, i) => (
              <FadeIn key={cat.filter} delay={i * 0.08}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/products?cat=${cat.filter}`)}
                  className="bg-[var(--color-navy-hover)] border border-[var(--color-navy-hover)] hover:border-[var(--color-gold)]/50 rounded-[2rem] p-4 text-center cursor-pointer transition-all group h-full flex flex-col items-center">
                  <div className="w-full h-48 mb-6 bg-[var(--color-navy)] rounded-2xl overflow-hidden relative">
                    <img src={cat.icon || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400"} alt={cat.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="font-serif font-bold text-white text-2xl mb-2 leading-tight mt-2">{cat.label}</h3>
                  <p className="text-xs text-[var(--color-cream)]/70 font-sans mb-4">{cat.sub}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-16">
            <button onClick={() => navigate('/products')} className="border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] text-xs font-bold tracking-widest px-8 py-4 rounded-full transition-all uppercase">
              View All Categories
            </button>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      {/* ── Why Choose Us (Process Steps) ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-24">
            {WHY_US.slice(0, 4).map((w, i) => {
              const isEven = i % 2 === 0;
              return (
                <FadeIn key={w.title} delay={0.1}>
                  <div className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Text Side */}
                    <div className="flex-1">
                      <span className="inline-block text-[var(--color-gold)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        Step 0{i + 1}
                      </span>
                      <h3 className="font-serif font-bold text-[var(--color-navy)] text-3xl sm:text-4xl mb-4 leading-tight">
                        {w.title}
                      </h3>
                      <p className="text-sm text-[var(--color-navy)]/70 leading-relaxed font-sans">
                        {w.desc}
                      </p>
                    </div>

                    {/* Image Side */}
                    <div className="flex-1 w-full">
                      <div className="relative w-full aspect-[4/3] rounded-[2rem] bg-[var(--color-cream-dark)] overflow-hidden flex items-center justify-center shadow-lg border border-black/5">
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-10" />
                        <span className="text-6xl absolute z-20 opacity-50 mix-blend-overlay">{w.icon}</span>
                        {/* Placeholder for the user's 3D process video/image */}
                        <img src={`https://images.unsplash.com/photo-${isEven ? '1500595046743-cd271d694d30' : '1559839734-2b71ea197ec2'}?w=800&auto=format&fit=crop`} alt={w.title} className="w-full h-full object-cover" />
                      </div>
                    </div>

                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Subscription Plans ── */}
      <section className="py-24 bg-[var(--color-navy)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block text-[var(--color-gold)] text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3">Subscribe & Save</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Milk Subscription Plans</h2>
              <p className="text-[var(--color-cream)]/70 text-sm max-w-lg mx-auto font-sans">Get fresh milk delivered every day. Choose a plan that works for you.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Basic', price: '1,800', desc: 'Cow Milk · 1 Litre/day', features: ['1L Cow Milk daily', 'Morning delivery by 7AM', 'Free delivery', 'Pause anytime'], featured: false },
              { name: 'Popular ⭐', price: '2,250', desc: 'Buffalo Milk · 1 Litre/day', features: ['1L Buffalo Milk daily', 'Morning delivery by 6AM', 'Free delivery', 'Pause or skip anytime'], featured: true },
              { name: 'Premium', price: '3,600', desc: 'Organic Milk · 1 Litre/day', features: ['1L Organic Milk daily', 'Priority delivery by 6AM', 'Free delivery', 'Flexible schedule', 'Dedicated support'], featured: false },
            ].map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <div className={`rounded-3xl p-8 h-full flex flex-col ${plan.featured ? 'bg-[var(--color-cream)] text-[var(--color-navy)] scale-105 shadow-2xl shadow-black/40 border border-[var(--color-gold)]' : 'bg-white/5 text-white border border-white/10 hover:border-[var(--color-gold)]/50 transition-all'}`}>
                  <div className={`font-bold text-xs tracking-widest uppercase mb-4 ${plan.featured ? 'text-[var(--color-gold)]' : 'text-[var(--color-gold)]/70'}`}>{plan.name}</div>
                  <div className={`font-serif text-5xl font-bold mb-2 ${plan.featured ? 'text-[var(--color-navy)]' : 'text-white'}`}>
                    <sup className="text-2xl font-sans">₹</sup>{plan.price}<sub className={`text-sm font-sans font-normal ${plan.featured ? 'text-[var(--color-navy)]/50' : 'text-white/50'}`}>/mo</sub>
                  </div>
                  <div className={`text-sm mb-8 font-sans ${plan.featured ? 'text-[var(--color-navy)]/70' : 'text-white/60'}`}>{plan.desc}</div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`text-sm flex items-center gap-3 font-sans ${plan.featured ? 'text-[var(--color-navy)]/80' : 'text-white/80'}`}>
                        <span className="text-[var(--color-gold)] text-lg">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/subscription')}
                    className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${plan.featured ? 'bg-[var(--color-navy)] hover:bg-[var(--color-navy-hover)] text-white shadow-md' : 'bg-transparent hover:bg-[var(--color-gold)] text-white border border-[var(--color-gold)] hover:border-[var(--color-gold)]'}`}>
                    Get Started
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block text-[var(--color-gold)] text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3">Happy Customers</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[var(--color-navy)] mb-4">What Our Customers Say</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="bg-[var(--color-cream-dark)] rounded-[2rem] p-8 h-full flex flex-col border border-transparent hover:border-[var(--color-gold)]/20 transition-colors">
                  <div className="text-[var(--color-gold)] mb-4 text-xl">{'★'.repeat(t.stars)}</div>
                  <p className="text-[var(--color-navy)]/70 text-sm leading-relaxed mb-6 font-sans italic flex-1">{t.text}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">{t.avatar}</div>
                    <div>
                      <div className="font-bold text-sm text-[var(--color-navy)] font-sans">{t.name}</div>
                      <div className="text-xs text-[var(--color-navy)]/50 tracking-wide font-sans">{t.loc}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[var(--color-gold)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">Start Your Farm-Fresh Journey Today</h2>
            <p className="text-white/90 text-base mb-10 font-sans max-w-xl mx-auto">Join hundreds of families enjoying pure, fresh produce delivered to their doorstep every morning.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/products')} className="bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-hover)] font-bold px-10 py-4 rounded-full transition-colors uppercase tracking-widest text-xs shadow-xl">
                Shop Now
              </button>
              <button onClick={() => navigate('/subscription')} className="bg-transparent hover:bg-white/10 border border-white text-white font-bold px-10 py-4 rounded-full transition-colors uppercase tracking-widest text-xs">
                Subscribe
              </button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
