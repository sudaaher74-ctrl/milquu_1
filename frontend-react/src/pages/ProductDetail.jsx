import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import ProductCard from '../components/storefront/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useProductStore((s) => s.products);
  const addToCart = useCartStore((s) => s.addToCart);
  const toast = useToastStore((s) => s.show);

  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="font-semibold text-gray-600">Product not found</h2>
        <button onClick={() => navigate('/products')} className="bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-green-700">
          Back to Products
        </button>
      </div>
    );
  }

  const related = products.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 4);

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addToCart({ id: product.id, productId: product.productId, name: product.name, price: product.price, e: product.e, unit: product.unit });
    }
    toast(`${product.name} × ${qty} added to cart! ✅`);
  }

  return (
    <div className="bg-[#050d1a] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-white/[0.05] py-4 bg-[#071426]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-xs font-bold tracking-widest uppercase text-white/30">
          <Link to="/" className="hover:text-[#C8A97E] transition-colors">Home</Link> <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-[#C8A97E] transition-colors">Products</Link> <span className="mx-2">/</span>
          <span className="text-[#C8A97E]">{product.name}</span>
        </div>
      </div>

      <section className="py-20 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(200,169,126,0.05), transparent 60%)', filter: 'blur(80px)' }} />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Stage */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <div className="relative rounded-[2rem] overflow-hidden flex items-center justify-center h-96 lg:h-[500px] border border-white/[0.04]"
                style={{ background: 'linear-gradient(145deg, #0a182d, #060e1c)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
                {product.img ? (
                  <img src={product.img} alt={product.name} className="w-full h-full object-contain p-10 hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                ) : null}
                <div className="text-9xl hidden items-center justify-center w-full h-full opacity-80 drop-shadow-2xl">{product.e}</div>
                {!product.img && <div className="text-9xl flex items-center justify-center drop-shadow-2xl opacity-80">{product.e}</div>}
              </div>
            </motion.div>

            {/* Info Panel */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}>
              <div className="text-[10px] font-bold text-[#C8A97E] uppercase tracking-[0.25em] mb-4">{product.cat}</div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">{product.name}</h1>
              
              <div className="text-3xl sm:text-4xl font-bold text-white mb-6">
                ₹{product.price}
                <span className="text-sm font-normal text-white/40 ml-2 tracking-widest uppercase">{product.unit}</span>
              </div>
              
              <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-8 font-sans max-w-md">{product.desc}</p>

              {/* Nutrition (Glassmorphism) */}
              {product.nut?.length > 0 && (
                <div className="mb-10">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#C8A97E] mb-4">Nutrition Facts</h4>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {product.nut.map(([name, val], idx) => (
                          <tr key={name} className={idx !== product.nut.length - 1 ? 'border-b border-white/[0.04]' : ''}>
                            <td className="px-5 py-3 text-white/50">{name}</td>
                            <td className="px-5 py-3 text-right font-semibold text-white">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Qty & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <div className="flex items-center gap-4 bg-[#0a182d] border border-white/10 rounded-full px-5 py-2.5">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-white/40 hover:text-white transition-colors text-lg px-2">−</button>
                  <span className="w-6 text-center font-bold text-white">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="text-white/40 hover:text-white transition-colors text-lg px-2">+</button>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
                    className="flex-1 sm:flex-none px-8 py-3.5 bg-white text-[#050d1a] font-bold rounded-full transition-colors hover:bg-gray-200">
                    Add to Cart
                  </motion.button>
                  <button onClick={() => navigate('/subscription')} 
                    className="flex-1 sm:flex-none px-8 py-3.5 border border-white/20 text-white font-bold rounded-full hover:border-[#C8A97E] transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-white/[0.05] text-[10px] font-bold tracking-widest uppercase text-white/30">
                <span className="flex items-center gap-1.5"><span className="text-[#C8A97E] text-sm">✓</span> Farm Fresh</span>
                <span className="flex items-center gap-1.5"><span className="text-[#C8A97E] text-sm">✓</span> Contactless</span>
                <span className="flex items-center gap-1.5"><span className="text-[#C8A97E] text-sm">✓</span> Organic</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-20 bg-[#071426] border-t border-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <div className="mb-12">
              <span className="inline-block text-[#C8A97E] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Explore More</span>
              <h2 className="font-serif text-3xl font-bold text-white">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} dark={true} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
