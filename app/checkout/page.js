'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Cart from '../../components/Cart';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    setGrandTotal(cartTotal + deliveryFee);
  }, [cartTotal, deliveryFee]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async () => {
    if (!formData.fullName.trim() || !formData.address.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setIsProcessing(true);

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
    message += `*الاسم:* ${formData.fullName}\n`;
    message += `*العنوان:* ${formData.address}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');

    clearCart();
    setShowOrderForm(false);
    setFormData({ fullName: '', address: '' });
    setIsProcessing(false);
  };

  const isFormValid = formData.fullName.trim() && formData.address.trim();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <PageHeader />
        <div className="min-h-screen flex items-center justify-center bg-white pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4">سلتك فارغة</h2>
            <button
              onClick={() => router.push('/')}
              className="btn-accent px-6 py-3 rounded-full"
            >
              متابعة التسوق
            </button>
          </div>
        </div>
        <Cart />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader />
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-center mb-12"
          >
            إتمام الطلب
          </motion.h1>

          {!showOrderForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-xl font-medium mb-6">ملخص الطلب</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b">
                    <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || 'https://via.placeholder.com/80x96'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.color} / {item.size}</p>
                      <p className="text-sm">الكمية: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{(item.price * item.quantity).toFixed(0)} د.ع</p>
                  </div>
                ))}
              </div>

              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">سعر التوصيل</span>
                  <span className="text-gray-900">{deliveryFee.toFixed(0)} د.ع</span>
                </div>
              )}

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>الإجمالي</span>
                  <span className="text-gray-900">{cartTotal.toFixed(0)} د.ع</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-lg font-semibold text-accent mt-2">
                    <span>الإجمالي الكلي</span>
                    <span>{grandTotal.toFixed(0)} د.ع</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full py-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                طلب عبر واتساب
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-xl font-medium mb-6">بيانات الطلب</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">العنوان بالتفصيل</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field min-h-[120px]"
                    placeholder="أدخل عنوانك بالتفصيل"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-xl font-medium hover:border-gray-300 transition-colors"
                >
                  رجوع
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={!isFormValid || isProcessing}
                  className="flex-1 py-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {isProcessing ? 'جاري الإرسال...' : 'إتمام الطلب'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Cart />
    </div>
  );
}

