import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'milk', label: '🥛 Milk' },
  { key: 'vegetables', label: '🥦 Vegetables' },
  { key: 'dairy', label: '🧀 Dairy' },
  { key: 'fruits', label: '🍎 Fruits' },
];

export default function ProductGrid({ products, initialFilter = 'all', showFilters = true, dark = false }) {
  const [filter, setFilter] = useState(initialFilter);

  const filtered = filter === 'all' ? products : products.filter((p) => p.cat === filter);

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-7">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === c.key ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="font-semibold text-gray-600">No products available</h3>
          <p className="text-sm text-gray-400 mt-2">We're updating the catalog. Check back in a moment.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} dark={dark} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
