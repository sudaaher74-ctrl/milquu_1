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
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-green-600">Home</Link> ›{' '}
          <Link to="/products" className="hover:text-green-600">Products</Link> ›{' '}
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-green-50 rounded-3xl overflow-hidden flex items-center justify-center h-80 lg:h-96">
                {product.img ? (
                  <img src={product.img} alt={product.name} className="w-full h-full object-contain p-6"
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                ) : null}
                <div className="text-9xl hidden items-center justify-center w-full h-full">{product.e}</div>
                {!product.img && <div className="text-9xl flex items-center justify-center">{product.e}</div>}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">{product.cat}</div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="text-3xl font-bold text-gray-900 mb-4">₹{product.price}<span className="text-lg font-normal text-gray-400">{product.unit}</span></div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.desc}</p>

              {/* Nutrition */}
              {product.nut?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-sm text-gray-800 mb-3">Nutrition Information</h4>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Nutrient</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.nut.map(([name, val]) => (
                          <tr key={name} className="border-t border-gray-100">
                            <td className="px-4 py-2 text-gray-600">{name}</td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-800">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Qty */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-6 h-6 font-bold text-gray-700 hover:text-green-600 transition-colors">−</button>
                  <span className="w-6 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-6 h-6 font-bold text-gray-700 hover:text-green-600 transition-colors">+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg shadow-green-200">
                  🛒 Add to Cart
                </motion.button>
                <button onClick={() => navigate('/subscription')} className="flex-1 border-2 border-gray-200 hover:border-green-400 text-gray-700 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
                  📦 Subscribe Daily
                </button>
              </div>

              <div className="flex gap-5 mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400">
                <span>✅ Farm Fresh</span>
                <span>🚚 Free Delivery ₹200+</span>
                <span>🔄 Easy Returns</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">Related</span>
              <h2 className="font-display text-2xl font-bold text-gray-900">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
