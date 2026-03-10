'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { cart, isCartOpen, setIsCartOpen, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  
  // Local state for delivery fee and brand name (fallback if context not loaded)
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [brandName, setBrandName] = useState('الأيطالي');
  
  useEffect(() => {
    // Load delivery fee from localStorage
    const savedFee = localStorage.getItem('luxe-delivery-fee');
    if (savedFee && savedFee !== '') {
      setDeliveryFee(parseFloat(savedFee) || 0);
    }
    
    // Load brand name from localStorage
    const savedBrand = localStorage.getItem('luxe-brand-name');
    if (savedBrand) {
      setBrandName(savedBrand);
    }
  }, []);
  
  useEffect(() => {
    // Calculate grand total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setGrandTotal(total + deliveryFee);
  }, [cart, deliveryFee]);
  
  const [isClosing, setIsClosing] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    fullName: '',
    address: ''
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsClosing(false);
      setShowOrderForm(false);
      setOrderData({ fullName: '', address: '' });
    }, 300);
  };

  const handleWhatsAppCheckout = () => {
    setShowOrderForm(true);
  };

  const handleSubmitOrder = () => {
    if (!orderData.fullName.trim() || !orderData.address.trim()) {
      return;
    }

    const phoneNumber = '9647706769305';
    
    let message = `شكراً لطلبك من ${brandName} 🛍️\n\n`;
    message += `*المنتجات:*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   اللون: ${item.color} | المقاس: ${item.size}\n`;
      message += `   الكمية: ${item.quantity} | السعر: ${item.price?.toFixed(0)} د.ع\n`;
      message += `   المجموع: ${(item.price * item.quantity).toFixed(0)} د.ع\n\n`;
    });
    message += `*━━━━━━━━━━━━━━━━━━*\n`;
    message += `*سعر التوصيل: ${deliveryFee.toFixed(0)} د.ع*\n`;
    message += `*الإجمالي: ${cartTotal.toFixed(0)} د.ع*\n`;
    message += `*الإجمالي الكلي: ${grandTotal.toFixed(0)} د.ع*\n`;
    message += `*━━━━━━━━━━━━━━━━━━*\n\n`;
    message += `*بيانات الزبون:*\n`;
    message += `*الاسم:* ${orderData.fullName}\n`;
    message += `*العنوان:* ${orderData.address}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    
    handleClose();
  };

  const isFormValid = orderData.fullName.trim() && orderData.address.trim();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-serif text-2xl font-medium">سلتك</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500">سلتك فارغة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${item.color}-${item.size}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 bg-gray-50 p-4 rounded-xl"
                    >
                      <div className="relative w-20 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || 'https://via.placeholder.com/80x96'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.color} / {item.size}</p>
                        <p className="text-accent font-medium mt-1">{item.price?.toFixed(0)} د.ع</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:border-accent transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:border-accent transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="mr-auto text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && !showOrderForm && (
              <div className="p-6 border-t bg-white">
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-600">سعر التوصيل</span>
                    <span className="text-gray-900">{deliveryFee.toFixed(0)} د.ع</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">المجموع</span>
                  <span className="text-xl font-semibold">{cartTotal.toFixed(0)} د.ع</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between mb-4 text-accent font-medium">
                    <span>الإجمالي الكلي</span>
                    <span>{grandTotal.toFixed(0)} د.ع</span>
                  </div>
                )}
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  طلب عبر واتساب
                </button>
              </div>
            )}

            {cart.length > 0 && showOrderForm && (
              <div className="p-6 border-t bg-white">
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={orderData.fullName}
                    onChange={(e) => setOrderData({ ...orderData, fullName: e.target.value })}
                    className="input-field w-full"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">العنوان بالتفصيل</label>
                  <textarea
                    value={orderData.address}
                    onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                    className="input-field w-full min-h-[80px]"
                    placeholder="أدخل عنوانك بالتفصيل"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOrderForm(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:border-gray-300 transition-colors"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={!isFormValid}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    إتمام الطلب
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

