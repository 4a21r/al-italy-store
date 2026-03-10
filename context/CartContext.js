'use client';
import { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';

const CartContext = createContext();

// Default values
const DEFAULT_DELIVERY_FEE = 0;
const DEFAULT_BRAND_NAME = 'الأيطالي';

function getStoredValue(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored !== null ? stored : defaultValue;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_DELIVERY_FEE);
  const [brandName, setBrandName] = useState(DEFAULT_BRAND_NAME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all settings from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('luxe-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    
    const savedDeliveryFee = localStorage.getItem('luxe-delivery-fee');
    if (savedDeliveryFee !== null && savedDeliveryFee !== '') {
      setDeliveryFee(parseFloat(savedDeliveryFee) || 0);
    }
    
    const savedBrandName = localStorage.getItem('luxe-brand-name');
    if (savedBrandName) {
      setBrandName(savedBrandName);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('luxe-cart', JSON.stringify(cart));
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cart, isLoaded]);

  // Save delivery fee to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('luxe-delivery-fee', deliveryFee.toString());
  }, [deliveryFee, isLoaded]);

  // Save brand name to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('luxe-brand-name', brandName);
  }, [brandName, isLoaded]);

  // Calculate grand total including delivery fee
  const grandTotal = cartTotal + deliveryFee;

  const addToCart = (product, selectedColor, selectedSize) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.color === selectedColor && item.size === selectedSize
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { ...product, color: selectedColor, size: selectedSize, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('luxe-cart');
  };

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
      deliveryFee,
      setDeliveryFee,
      grandTotal,
      brandName,
      setBrandName,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

