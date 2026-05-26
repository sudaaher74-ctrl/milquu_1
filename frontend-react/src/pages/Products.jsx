import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/storefront/ProductGrid';
import { useProductStore } from '../stores/productStore';
import { motion } from 'framer-motion';

export default function Products() {
  const products = useProductStore((s) => s.products);
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  return (
    <>
      <div className="bg-[#050d1a] py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#050d1a 0%,#071426 100%)' }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(200,169,126,0.06), transparent 70%)' }} />
          
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-[#C8A97E] text-[10.5px] font-bold px-3 py-1 uppercase tracking-[0.2em] mb-4">Our Collection</span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">Farm-Fresh Products</h1>
            <p className="text-white/40 text-sm sm:text-base max-w-lg mx-auto font-sans leading-relaxed">All sourced directly from farms — pure, fresh, and delivered with care.</p>
          </motion.div>
        </div>
      </div>
      <section className="py-20 bg-[#071426] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ProductGrid products={products} initialFilter={initialCat} dark={true} />
        </div>
      </section>
    </>
  );
}
