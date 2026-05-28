import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const priceNum = parseFloat(item.price.replace('₹', ''));
    return total + (priceNum * item.quantity);
  }, 0);
  
  const deliveryFee = 0; // Free delivery for now
  const total = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    // Simulate API call for COD
    setTimeout(() => {
      setOrderComplete(true);
      clearCart();
    }, 1500);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-24 pb-12 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-[24px] shadow-2xl border border-white/60 text-center max-w-md mx-4"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-milquu-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-milquu-green"
          >
            <CheckCircle size={32} />
          </motion.div>
          <h2 className="text-2xl font-serif font-bold text-milquu-dark mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 text-sm font-sans mb-6">
            Thank you, {formData.name}. Your order has been placed. You will pay <strong>₹{total}</strong> via Cash on Delivery.
          </p>
          <Link to="/">
            <button className="bg-milquu-dark hover:bg-milquu-gold text-white px-6 py-2.5 rounded-full font-sans text-sm font-bold transition-colors shadow-lg">
              Return Home
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[40vh] pointer-events-none bg-milquu-gold/5 rounded-b-[120px]"></div>
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-40 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-6">
          <Link to="/category/milk" className="inline-flex items-center text-gray-400 hover:text-milquu-dark font-sans text-sm mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark">Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-lg rounded-[24px] border border-white/60 shadow-sm">
            <h2 className="text-xl font-serif text-gray-400 mb-4">Your cart is perfectly empty.</h2>
            <Link to="/category/milk">
              <button className="bg-milquu-gold hover:bg-milquu-green text-white px-6 py-2.5 rounded-full font-sans text-sm font-bold shadow-md transition-colors">
                Explore Farm Fresh Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col-reverse lg:flex-row gap-8">
            
            {/* Left: Cart Items */}
            <div className="lg:w-[55%] space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="bg-white/80 backdrop-blur-xl p-3 lg:p-4 rounded-2xl border border-white/60 shadow-sm flex flex-col sm:flex-row items-center gap-4"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center p-1 shadow-inner">
                      <img src={item.image} alt={item.name} className="h-full object-contain drop-shadow-sm" />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-base font-serif font-bold text-milquu-dark mb-0.5">{item.name}</h3>
                      <p className="text-gray-500 font-sans text-xs">{item.unit}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3 bg-gray-50/80 rounded-full px-3 py-1.5 border border-gray-100">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-milquu-dark transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="font-sans font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-milquu-dark transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price & Delete */}
                    <div className="flex items-center gap-4">
                      <span className="text-base font-sans font-bold text-milquu-dark">
                        ₹{parseFloat(item.price.replace('₹', '')) * item.quantity}
                      </span>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right: Checkout Split View */}
            <div className="lg:w-[45%]">
              <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-[24px] border border-white/60 shadow-md sticky top-24">
                
                <h3 className="text-xl font-serif font-bold text-milquu-dark mb-4">Order Summary</h3>
                
                {/* Calculations */}
                <div className="space-y-2 mb-6 font-sans text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-semibold text-milquu-green">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-milquu-dark">Total</span>
                    <span className="text-xl font-sans font-bold text-milquu-dark">₹{total}</span>
                  </div>
                </div>

                {!isCheckingOut ? (
                  <button 
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full bg-milquu-dark hover:bg-milquu-gold text-white px-4 py-3 rounded-full font-sans font-bold text-sm transition-colors shadow-md flex items-center justify-center"
                  >
                    Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                  </button>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleCheckoutSubmit}
                    className="space-y-3 pt-3 border-t border-gray-100"
                  >
                    <h4 className="font-serif font-bold text-milquu-dark text-sm mb-2">Delivery Details (Cash on Delivery)</h4>
                    
                    <input required type="text" name="name" placeholder="Full Name" onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30" />
                    <input required type="tel" name="phone" placeholder="Phone Number" onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30" />
                    <textarea required name="address" placeholder="Full Delivery Address" onChange={handleInputChange} rows="2" className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30 resize-none"></textarea>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="text" name="city" placeholder="City" onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30" />
                      <input required type="text" name="pincode" placeholder="Pincode" onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30" />
                    </div>

                    <div className="bg-milquu-green/10 text-milquu-green rounded-lg p-3 font-sans text-xs flex items-start mt-2">
                      <div className="mr-2 mt-0.5"><CheckCircle size={14} /></div>
                      <div>
                        <strong>Cash on Delivery.</strong><br/>
                        Pay ₹{total} when order arrives.
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-milquu-green hover:bg-[#1a4a35] text-white px-4 py-3 rounded-full font-sans font-bold text-sm transition-colors shadow-md mt-4"
                    >
                      Confirm Order
                    </button>
                  </motion.form>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
