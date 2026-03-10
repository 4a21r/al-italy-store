'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function PageHeader({ title }) {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [brandName, setBrandName] = useState('الأيطالي');

  useEffect(() => {
    const savedBrand = localStorage.getItem('luxe-brand-name');
    if (savedBrand) {
      setBrandName(savedBrand);
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center">
            <span className="font-serif text-2xl lg:text-3xl font-semibold tracking-tight">
              {brandName}
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium hover:text-accent transition-colors">
              الرئيسية
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-accent transition-colors">
              لوحة التحكم
            </Link>
            <Link
              href="/"
              className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

