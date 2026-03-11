'use client';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore'; // شلنا الـ orderBy هسة
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // هسة نجيب كل المنتجات بدون تعقيد حتى نتأكد إن الربط شغال
    const productsQuery = query(collection(db, 'products'));

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const firebaseProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("المنتجات اللي جتي من الفايربيس:", firebaseProducts); // حتى نشوفها بالـ Console
        setProducts(firebaseProducts);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl font-medium text-gray-900 mb-4">
            مجموعتنا
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            قطع مختارة تحدد الأناقة العصرية
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4 text-gray-300">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              المحل فارغ حالياً
            </h3>
            <p className="text-gray-500">
              ارفع أول قطعة من لوحة التحكم لتظهر هنا
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}