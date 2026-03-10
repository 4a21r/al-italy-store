'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import Cart from '../../components/Cart';

function ReceiptContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        setOrderData(JSON.parse(atob(data)));
      } catch (e) {
        console.error('Error parsing order data');
      }
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="bg-accent p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h1 className="font-serif text-3xl text-white">شكراً لك!</h1>
            <p className="text-white/80 mt-2">تم تقديم طلبك بنجاح</p>
          </div>

          <div className="p-8">
            <div className="border-b pb-6 mb-6">
              <h2 className="font-serif text-2xl mb-4">تفاصيل الطلب</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">رقم الطلب</p>
                  <p className="font-medium">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500">التاريخ</p>
                  <p className="font-medium">{new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <div>
                  <p className="text-gray-500">اسم العميل</p>
                  <p className="font-medium">{orderData.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">الهاتف</p>
                  <p className="font-medium">{orderData.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">عنوان التوصيل</p>
                  <p className="font-medium">{orderData.address}</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-6 mb-6">
              <h3 className="font-medium mb-4">المنتجات المطلوبة</h3>
              <div className="space-y-4">
                {orderData.items?.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || 'https://via.placeholder.com/64x80'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.color} / {item.size} × {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-semibold mb-8">
              <span>المبلغ المدفوع</span>
              <span className="text-accent">${orderData.total?.toFixed(2)}</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePrint}
                className="flex-1 py-4 border border-gray-200 rounded-xl font-medium hover:border-accent transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                طباعة الإيصال
              </button>
              <a
                href="/"
                className="flex-1 py-4 bg-accent text-white rounded-xl font-medium hover:bg-accent-dark transition-colors text-center"
              >
                continue shopping
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <div className="min-h-screen">
      <PageHeader />
      <Suspense fallback={<LoadingFallback />}>
        <ReceiptContent />
      </Suspense>
      <Cart />
    </div>
  );
}

