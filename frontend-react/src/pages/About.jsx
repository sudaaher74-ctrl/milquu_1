import { motion } from 'framer-motion';

export default function About() {
  return (
    <>
      <div className="bg-[var(--color-navy)] py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-[var(--color-gold)] text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3">Our Story</span>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-6">From Trusted Farms<br/>to Modern Families</h1>
            <p className="text-[var(--color-cream)]/70 text-sm max-w-xl mx-auto font-sans">A story of purity, precision, and the evolution of dairy we trust.</p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-[var(--color-cream)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-[var(--color-cream-dark)] rounded-[2rem] p-10 relative">
                <div className="absolute -top-6 -left-6 text-[var(--color-gold)] text-6xl opacity-30 font-serif">"</div>
                <h2 className="font-serif text-3xl font-bold text-[var(--color-navy)] mb-6">Our Origins</h2>
                <p className="text-[var(--color-navy)]/70 text-sm leading-relaxed font-sans">
                  Milqu Fresh was born from a simple belief — every family deserves access to genuinely pure, farm-fresh dairy. We started by connecting directly with local farmers in Navi Mumbai and eliminating every middleman between the farm and your doorstep.
                </p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
              {[
                ['🐄', 'Farm Partnerships', 'We work with 50+ trusted local farms that follow ethical animal husbandry practices.'],
                ['⏰', 'Daily Collection', 'Milk is collected fresh every morning and dispatched within 2 hours of collection.'],
                ['🔬', 'Quality Assurance', 'Every batch is tested for purity and processed in certified hygienic facilities.'],
                ['🚚', 'Morning Delivery', 'Our delivery team ensures your milk arrives before 7 AM every single day.'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="flex gap-5 p-5 bg-white rounded-2xl shadow-sm border border-transparent hover:border-[var(--color-gold)]/30 transition-all">
                  <span className="text-3xl flex-shrink-0 bg-[var(--color-cream-dark)] w-12 h-12 flex items-center justify-center rounded-full">{icon}</span>
                  <div>
                    <div className="font-bold text-sm text-[var(--color-navy)] mb-1 font-sans">{title}</div>
                    <div className="text-xs text-[var(--color-navy)]/60 leading-relaxed font-sans">{desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Our Stewards (Team) ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[var(--color-gold)] text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3">Our Stewards</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[var(--color-navy)] mb-4">The Architects of Purity</h2>
            <p className="text-[var(--color-navy)]/60 text-sm max-w-lg mx-auto font-sans">The visionaries working behind the scenes to bring you perfection in every drop.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Dr. Aarav Patel', role: 'Head of Quality', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400' },
              { name: 'Meera Sharma', role: 'Farm Relations', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
              { name: 'Kiran Desai', role: 'Operations Chief', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
            ].map((steward, i) => (
              <motion.div key={steward.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-cream-dark)] mb-6 aspect-[3/4]">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img src={steward.img} alt={steward.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif font-bold text-xl text-[var(--color-navy)] mb-1">{steward.name}</h3>
                  <p className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest">{steward.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--color-gold)] border-t border-[var(--color-navy)]/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[['500+', 'Happy Customers'], ['50+', 'Farm Partners'], ['7 AM', 'Daily Delivery'], ['100%', 'Pure & Organic']].map(([val, label]) => (
              <div key={label}>
                <div className="font-serif text-4xl font-bold mb-2 text-white">{val}</div>
                <div className="text-[var(--color-navy)] font-bold text-xs uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
