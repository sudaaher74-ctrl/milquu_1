import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, ArrowRight, ShoppingCart, Lock } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const [step, setStep] = useState(1); // 1: View Cart, 2: Checkout Form, 3: Success
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetch('https://milquu-backend.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error(err));
  }, []);

  const recommendedProducts = allProducts.filter(p => !cartItems.find(item => item._id === p._id || item.id === p.id));

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : item.price;
    return total + (priceNum * item.quantity);
  }, 0);
  
  const deliveryFee = 0; // Free delivery for now
  const total = subtotal + deliveryFee;

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate payment immediately for demonstration without needing real Razorpay keys
    alert('Test Mode: Simulating successful payment...');
    
    // Generate a fake payment ID
    const fakePaymentId = 'pay_' + Math.random().toString(36).substring(2, 15);
    
    // Proceed directly to saving the order
    await handlePaymentSuccess(fakePaymentId);
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userId = userInfoStr && userInfoStr !== 'undefined' ? JSON.parse(userInfoStr)._id : undefined;

      const orderData = {
        user: userId,
        name: formData.name,
        phone: formData.phone,
        orderItems: cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : item.price
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.pincode,
          country: 'India'
        },
        paymentMethod: 'Razorpay',
        paymentResult: {
          id: paymentId,
          status: 'paid',
          update_time: new Date().toISOString()
        },
        totalPrice: total,
        orderSource: 'Website'
      };

      const res = await fetch('https://milquu-backend.onrender.com/api/erp/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        setStep(3); // Success page
        clearCart();
      } else {
        alert("Failed to submit order to our system, but payment was successful. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting order.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (step === 3) {
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
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-28 pb-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[40vh] pointer-events-none bg-milquu-gold/5 rounded-b-[120px]"></div>
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-40 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        
        {step === 1 ? (
          <Link to="/products" className="inline-flex items-center text-gray-400 hover:text-milquu-dark font-sans text-sm mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Continue Shopping
          </Link>
        ) : (
          <button onClick={() => setStep(1)} className="inline-flex items-center text-gray-400 hover:text-milquu-dark font-sans text-sm mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Cart
          </button>
        )}

        {cartItems.length === 0 && step === 1 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-lg rounded-[24px] border border-white/60 shadow-sm">
            <h2 className="text-xl font-serif text-gray-400 mb-4">Your cart is perfectly empty.</h2>
            <Link to="/products">
              <button className="bg-milquu-gold hover:bg-milquu-green text-white px-6 py-2.5 rounded-full font-sans text-sm font-bold shadow-md transition-colors">
                Explore Farm Fresh Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-2xl p-6 sm:p-8 rounded-[24px] border border-white/60 shadow-xl relative overflow-hidden">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-serif font-bold text-milquu-dark">
                {step === 1 ? 'Your Cart' : 'Checkout'}
              </h1>
              <div className="flex items-center space-x-2 text-sm font-sans">
                <span className={`font-bold ${step === 1 ? 'text-milquu-dark' : 'text-gray-400'}`}>1. Cart</span>
                <span className="text-gray-300">-</span>
                <span className={`font-bold ${step === 2 ? 'text-milquu-dark' : 'text-gray-400'}`}>2. Delivery</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div 
                          key={item._id || item.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          className="flex items-center justify-between border-b border-gray-100 pb-4"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-1">
                              <img src={item.image} alt={item.name} className="h-full object-contain" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-serif font-bold text-milquu-dark">{item.name}</h3>
                              <p className="text-gray-500 font-sans text-xs">{item.unit}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6">
                            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-100">
                              <button onClick={() => updateQuantity(item._id || item.id, -1)} className="text-gray-400 hover:text-milquu-dark">
                                <Minus size={14} />
                              </button>
                              <span className="font-sans font-bold text-sm w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id || item.id, 1)} className="text-gray-400 hover:text-milquu-dark">
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm sm:text-base font-sans font-bold text-milquu-dark">
                                ₹{(typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : item.price) * item.quantity}
                              </span>
                              <button onClick={() => removeFromCart(item._id || item.id)} className="text-gray-300 hover:text-red-400">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Calculations */}
                  <div className="bg-gray-50/50 p-4 rounded-2xl font-sans text-sm space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="font-semibold text-milquu-green">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                      <span className="text-base font-bold text-milquu-dark">Total</span>
                      <span className="text-xl font-sans font-bold text-milquu-dark">₹{total}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-milquu-dark hover:bg-milquu-gold text-white px-4 py-3.5 rounded-full font-sans font-bold text-sm transition-colors shadow-md flex items-center justify-center"
                  >
                    Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                  </button>

                  {/* Recommended Products */}
                  {recommendedProducts.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-gray-100">
                      <h3 className="text-lg font-serif font-bold text-milquu-dark mb-4">You Might Also Like</h3>
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                        {recommendedProducts.map(product => (
                          <div key={product._id || product.id} className="min-w-[140px] max-w-[140px] bg-gray-50/50 border border-gray-100 rounded-2xl p-3 snap-start shadow-sm flex flex-col hover:shadow-md transition-shadow">
                            <img src={product.image} className="h-16 object-contain mx-auto mb-3 drop-shadow-md" alt={product.name} />
                            <h4 className="font-serif font-bold text-sm text-milquu-dark leading-tight mb-1">{product.name}</h4>
                            <p className="text-[10px] text-gray-500 font-sans mb-2">{product.unit}</p>
                            <div className="flex justify-between items-center mt-auto">
                              <span className="font-sans font-bold text-sm text-milquu-dark">₹{typeof product.price === 'number' ? product.price : product.price.replace('₹','')}</span>
                              <button 
                                onClick={() => addToCart(product)} 
                                className="bg-milquu-green/10 text-milquu-green p-1.5 rounded-full hover:bg-milquu-green hover:text-white transition-colors"
                              >
                                <ShoppingCart size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <h4 className="font-serif font-bold text-milquu-dark text-sm mb-3">Delivery Details</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input required type="text" name="name" placeholder="Full Name" onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30" />
                      <input required type="tel" name="phone" placeholder="Phone Number" onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30" />
                    </div>
                    
                    <textarea required name="address" placeholder="Full Delivery Address" onChange={handleInputChange} rows="2" className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30 resize-none"></textarea>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <select required name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30 appearance-none text-gray-600">
                        <option value="" disabled>Select Delivery Area</option>
                        <option value="Panvel">Panvel</option>
                        <option value="New Panvel">New Panvel</option>
                        <option value="Khanda Colony">Khanda Colony</option>
                        <option value="Kamothe">Kamothe</option>
                        <option value="Karanjade">Karanjade</option>
                        <option value="Kharghar">Kharghar</option>
                        <option value="Belapur">Belapur</option>
                        <option value="Nerul">Nerul</option>
                      </select>
                      <input required type="text" name="pincode" placeholder="Pincode" onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/30" />
                    </div>

                    <div className="bg-milquu-gold/10 text-milquu-dark rounded-xl p-4 font-sans text-sm flex items-start mt-4">
                      <div className="mr-3 mt-0.5"><Lock size={16} className="text-milquu-gold" /></div>
                      <div>
                        <strong>Secure Online Payment</strong><br/>
                        Pay ₹{total} securely via Razorpay.
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-milquu-dark hover:bg-milquu-gold text-white px-4 py-3.5 rounded-full font-sans font-bold text-sm transition-colors shadow-md mt-6"
                    >
                      Pay ₹{total} Now
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
