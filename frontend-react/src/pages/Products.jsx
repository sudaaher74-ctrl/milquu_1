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
      <div className="bg-[var(--color-navy)] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-[var(--color-gold)] text-xs font-bold px-3 py-1 uppercase tracking-widest mb-3">Our Collection</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Farm-Fresh Products</h1>
            <p className="text-[var(--color-cream)]/70 text-sm max-w-lg mx-auto font-sans">All sourced directly from farms — pure, fresh, and delivered with care.</p>
          </motion.div>
        </div>
      </div>
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProductGrid products={products} initialFilter={initialCat} />
        </div>
      </section>
    </>
  );
}
