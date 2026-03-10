'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const colorMap = {
  // English colors
  Black: '#000000',
  White: '#FFFFFF',
  Navy: '#1e3a5f',
  Red: '#DC2626',
  Green: '#16A34A',
  Beige: '#D4C4A8',
  Gray: '#6B7280',
  Pink: '#EC4899',
  Brown: '#92400E',
  Cream: '#FEF3C7',
  // Arabic colors
  'أسود': '#000000',
  'أبيض': '#FFFFFF',
  'كحلي': '#1e3a5f',
  'أحمر': '#DC2626',
  'أخضر': '#16A34A',
  'بيج': '#D4C4A8',
  'رمادي': '#6B7280',
  'وردي': '#EC4899',
  'بني': '#92400E',
  'كريمي': '#FEF3C7',
};

export default function ProductCard({ product }) {
  // Ensure colors and sizes are arrays
  const productColors = Array.isArray(product.colors) ? product.colors : [];
  const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
  
  const [selectedColor, setSelectedColor] = useState(productColors[0] || '');
  const [selectedSize, setSelectedSize] = useState(productSizes[0] || '');
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(product, selectedColor, selectedSize);
    toast.success(`تمت إضافة ${product.title} للسلة!`, {
      icon: '🛍️',
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-2xl overflow-hidden card-hover"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Image
          src={product.image || 'https://via.placeholder.com/400x533'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      
      <div className="p-5">
        <h3 className="font-medium text-lg text-gray-900 mb-1 truncate">
          {product.title}
        </h3>
        <p className="text-xl font-semibold text-accent mb-4">
          {product.price?.toFixed(0)} د.ع
        </p>
        
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">اللون</p>
          <div className="flex flex-wrap gap-2">
            {product.colors?.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className="color-swatch"
                style={{ 
                  backgroundColor: colorMap[color] || color,
                  border: (color === 'White' || color === 'أبيض') ? '1px solid #E5E7EB' : '2px solid transparent'
                }}
                title={color}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2">المقاس</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full py-3 bg-accent text-white rounded-xl font-medium disabled:opacity-70 transition-all hover:bg-accent-dark"
        >
          {isAdding ? 'جاري الإضافة...' : 'أضف للسلة'}
        </motion.button>
      </div>
    </motion.div>
  );
}

