'use client';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const sampleProducts = [
  {
    id: '1',
    title: 'سترة حريرية',
    price: 289,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop',
    colors: ['أسود', 'كحلي', 'بيج'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '2',
    title: 'سترة كشمير',
    price: 195,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=533&fit=crop',
    colors: ['كريمي', 'رمادي', 'كحلي'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '3',
    title: 'بناطيل كتان',
    price: 165,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop',
    colors: ['أبيض', 'بيج', 'أسود'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '4',
    title: 'معطف صوف',
    price: 450,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=533&fit=crop',
    colors: ['أسود', 'بني', 'رمادي'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '5',
    title: 'قميص قطن',
    price: 125,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=533&fit=crop',
    colors: ['أبيض', 'كحلي', 'وردي'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '6',
    title: 'تنورة طويلة',
    price: 175,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=533&fit=crop',
    colors: ['أسود', 'كحلي', 'بيج'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '7',
    title: 'سترة رسمية',
    price: 145,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop',
    colors: ['أسود', 'رمادي', 'كحلي'],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '8',
    title: 'منديل حريري',
    price: 89,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=533&fit=crop',
    colors: ['وردي', 'كحلي', 'أحمر'],
    sizes: ['One Size'],
  },
];

export default function ProductCatalog() {
  const [products, setProducts] = useState(sampleProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (!querySnapshot.empty) {
          const firebaseProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(firebaseProducts);
        }
      } catch (error) {
        console.log('Using sample products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

