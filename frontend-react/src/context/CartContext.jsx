import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if product already exists
      const existingItemIndex = prevItems.findIndex(item => (item._id || item.id) === (product._id || product.id));
      
      if (existingItemIndex >= 0) {
        // Increase quantity
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      }
      
      // Add new item
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, amount) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if ((item._id || item.id) === productId) {
          const newQuantity = Math.max(1, item.quantity + amount); // Prevent going below 1
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter(item => (item._id || item.id) !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
