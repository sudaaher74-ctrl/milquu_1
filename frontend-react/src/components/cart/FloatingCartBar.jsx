import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore';

export default function FloatingCartBar({ onClick }) {
  const cart = useCartStore((s) => s.items) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  
  if (totalItems === 0) return null;

  // Get up to 3 distinct items for the stacked images
  const previewItems = cart.slice(0, 3);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center"
      >
        <div 
          onClick={onClick}
          className="pointer-events-auto cursor-pointer w-full max-w-md bg-[#0a182d] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-md rounded-full p-2 pl-4 flex items-center justify-between overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(10,24,45,0.9), rgba(6,14,28,0.95))' }}
        >
          {/* Left: Stacked Images */}
          <div className="flex items-center">
            <div className="flex -space-x-3 mr-4">
              {previewItems.map((item, i) => (
                <div key={item.id} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 shadow-md flex items-center justify-center overflow-hidden z-[3] relative" style={{ zIndex: 10 - i }}>
                  {item.e ? (
                    <span className="text-xl drop-shadow-md">{item.e}</span>
                  ) : (
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
              {cart.length > 3 && (
                <div className="w-10 h-10 rounded-full bg-[#16283d] border border-white/20 shadow-md flex items-center justify-center text-white text-xs font-bold z-0 relative">
                  +{cart.length - 3}
                </div>
              )}
            </div>

            {/* Middle: Text */}
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-wide">View Cart</span>
              <span className="text-[#C8A97E] text-[10px] uppercase tracking-widest font-bold">
                {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
              </span>
            </div>
          </div>

          {/* Right: Action Button */}
          <div className="w-10 h-10 rounded-full bg-[#C8A97E] flex items-center justify-center shadow-lg transition-transform hover:scale-105">
            <svg className="w-5 h-5 text-[#050d1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
