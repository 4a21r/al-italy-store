'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-medium rounded-full mb-6">
            مجموعة جديدة 2026
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="font-serif text-5xl sm:text-6xl lg:text-8xl font-medium text-gray-900 mb-6"
        >
          أناقة في<br />
          <span className="text-accent">كل خيط</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="text-lg text-gray-600 max-w-2xl mx-auto mb-10"
        >
          اكتشف مجموعتنا المنتقاة من الأزياء الفاخرة المصممة لأولئك الذين يقدرون الأسلوب الخالد والجودة الاستثنائية.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="#products"
            className="btn-accent px-8 py-4 rounded-full text-sm font-medium"
          >
            تسوق الآن
          </Link>
          <Link
            href="#about"
            className="px-8 py-4 rounded-full text-sm font-medium border border-gray-200 hover:border-accent transition-colors"
          >
            اعرف المزيد
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

