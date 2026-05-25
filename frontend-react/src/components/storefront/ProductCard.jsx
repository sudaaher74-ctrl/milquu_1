import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';

export default function ProductCard({ product, onDetail, dark = false }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const toast = useToastStore((s) => s.show);
  const navigate = useNavigate();

  function handleAdd(e) {
    e.stopPropagation();
    addToCart({ id: product.id, productId: product.productId, name: product.name, price: product.price, e: product.e, unit: product.unit });
    toast(`${product.name} added to cart! ✅`);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.25 }}
      className={`rounded-[2rem] overflow-hidden border cursor-pointer group flex flex-col ${dark ? 'bg-[var(--color-navy-hover)] border-[var(--color-navy-hover)] hover:border-[var(--color-gold)]/50' : 'bg-[var(--color-cream-dark)] border-transparent hover:border-[var(--color-gold)]/30'}`}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Image */}
      <div className={`relative h-56 flex items-center justify-center overflow-hidden m-2 rounded-t-[1.5rem] rounded-b-xl ${dark ? 'bg-[var(--color-navy)] shadow-inner' : 'bg-white/50'}`}>
        {product.badge && (
          <span className={`absolute top-4 left-4 z-10 text-[10px] tracking-widest font-bold px-3 py-1.5 rounded-full uppercase ${dark ? 'bg-[var(--color-gold)] text-[var(--color-navy)]' : 'bg-[var(--color-navy)] text-[var(--color-gold)]'}`}>
            {product.badge}
          </span>
        )}
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="text-6xl hidden items-center justify-center w-full h-full">{product.e}</div>
        {!product.img && <div className="text-6xl flex items-center justify-center w-full h-full">{product.e}</div>}
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">{product.cat}</div>
        <div className={`font-serif font-bold text-xl leading-tight mb-2 ${dark ? 'text-white' : 'text-[var(--color-navy)]'}`}>{product.name}</div>
        <div className={`text-xs line-clamp-2 mb-4 font-sans ${dark ? 'text-[var(--color-cream)]/70' : 'text-[var(--color-navy)]/60'}`}>{product.desc}</div>
        <div className="mt-auto flex items-center justify-between">
          <div className={`font-bold text-lg ${dark ? 'text-[var(--color-gold)]' : 'text-[var(--color-navy)]'}`}>
            ₹{product.price}
            <span className={`text-[10px] font-normal ml-1 uppercase ${dark ? 'text-[var(--color-gold)]/60' : 'text-[var(--color-navy)]/50'}`}>{product.unit}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleAdd}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-colors shadow-md ${dark ? 'bg-white text-[var(--color-navy)] hover:bg-[var(--color-cream)]' : 'bg-[var(--color-navy)] hover:bg-[var(--color-navy-hover)] text-white'}`}
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
